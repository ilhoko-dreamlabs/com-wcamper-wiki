import os
import re
from typing import Dict, List, Tuple

# ---------------------------
# Utilities
# ---------------------------

ALNUM_KO = r"0-9A-Za-z가-힣"

def _norm(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip())

def _split_title_terms(h1: str) -> List[str]:
    """
    Example: "오버랜딩 (Overlanding)" -> ["오버랜딩", "Overlanding"]
    """
    h1 = _norm(h1)
    if not h1:
        return []
    terms = []

    # base + parenthetical
    m = re.match(r"^(.*?)\s*\((.*?)\)\s*$", h1)
    if m:
        base = _norm(m.group(1))
        inside = _norm(m.group(2))
        if base:
            terms.append(base)
        if inside:
            # split common separators
            parts = re.split(r"[,\u00b7/|]", inside)  # comma, middle dot, slash, pipe
            for p in parts:
                p = _norm(p)
                if p:
                    terms.append(p)
    else:
        terms.append(h1)

    # remove duplicates while preserving order
    seen = set()
    out = []
    for t in terms:
        if t not in seen:
            seen.add(t)
            out.append(t)
    return out

def _extract_h1(markdown: str) -> str:
    for line in (markdown or "").splitlines():
        line = line.strip()
        if line.startswith("# "):
            return line[2:].strip()
    return ""

BOLD_TERM_RE = re.compile(r"^\s*-\s*\*\*(.+?)\*\*\s*[—–\-:]\s+", re.UNICODE)

def _extract_bold_terms(markdown: str) -> List[str]:
    """
    Extract terms from lists like: - **GVWR/GVM(총중량)** — ...
    """
    terms = []
    for line in (markdown or "").splitlines():
        m = BOLD_TERM_RE.match(line)
        if not m:
            continue
        raw = _norm(m.group(1))
        if not raw:
            continue
        # split variants like "GVWR/GVM(총중량)" or "AWD vs 4WD"
        # keep original raw and also split by separators
        terms.append(raw)

        # split on slashes and "vs"
        splitters = re.split(r"\s+vs\s+|/|,", raw, flags=re.IGNORECASE)
        for s in splitters:
            s = _norm(s)
            if s and s != raw:
                terms.append(s)

        # if has parentheses, add inside too
        pm = re.match(r"^(.*?)\s*\((.*?)\)\s*$", raw)
        if pm:
            base = _norm(pm.group(1))
            inside = _norm(pm.group(2))
            if base:
                terms.append(base)
            if inside:
                parts = re.split(r"[,\u00b7/|]", inside)
                for p in parts:
                    p = _norm(p)
                    if p:
                        terms.append(p)

    # uniq, keep order
    seen = set()
    out = []
    for t in terms:
        if t not in seen:
            seen.add(t)
            out.append(t)
    return out

def _is_good_term(t: str) -> bool:
    t = _norm(t)
    if len(t) < 2:
        return False
    # ignore pure punctuation
    if re.fullmatch(r"[\W_]+", t):
        return False
    return True

def _mkdocs_url_from_src(src_rel: str) -> str:
    """
    glossary/overlanding.md -> /glossary/overlanding/
    """
    src_rel = src_rel.replace("\\", "/")
    if src_rel.lower().endswith(".md"):
        src_rel = src_rel[:-3]
    # mkdocs directory_urls default => trailing slash
    return "/" + src_rel.strip("/") + "/"

# ---------------------------
# Term map building (cached)
# ---------------------------

TERM_MAP: Dict[str, str] = {}
TERM_KEYS_SORTED: List[str] = []

def on_config(config, **kwargs):
    """
    Build mapping once per build.
    MkDocs hooks are loaded as plugin instances. (MkDocs 1.4+)
    """
    global TERM_MAP, TERM_KEYS_SORTED

    docs_dir = config.get("docs_dir", "docs")
    glossary_dir = os.path.join(docs_dir, "glossary")

    term_map: Dict[str, str] = {}

    if os.path.isdir(glossary_dir):
        for root, _, files in os.walk(glossary_dir):
            for fn in files:
                if not fn.lower().endswith(".md"):
                    continue
                full = os.path.join(root, fn)
                rel = os.path.relpath(full, docs_dir).replace("\\", "/")

                try:
                    with open(full, "r", encoding="utf-8") as f:
                        md = f.read()
                except Exception:
                    continue

                url = _mkdocs_url_from_src(rel)

                # 1) H1 title-derived terms
                h1 = _extract_h1(md)
                for t in _split_title_terms(h1):
                    t = _norm(t)
                    if _is_good_term(t) and t not in term_map:
                        term_map[t] = url

                # 2) Bold term list-derived terms
                for t in _extract_bold_terms(md):
                    t = _norm(t)
                    if _is_good_term(t) and t not in term_map:
                        term_map[t] = url

    # Sort by length desc to prefer longest match first
    keys = sorted(term_map.keys(), key=lambda s: len(s), reverse=True)

    TERM_MAP = term_map
    TERM_KEYS_SORTED = keys

    return config

# ---------------------------
# Markdown masking to avoid unwanted replacements
# ---------------------------

FENCE_RE = re.compile(r"(^```[\s\S]*?^```|^~~~[\s\S]*?^~~~)", re.MULTILINE)
INLINE_CODE_RE = re.compile(r"`[^`]*`")
MD_LINK_RE = re.compile(r"(!?\[[^\]]*?\]\([^)]+\))")  # includes images
ANGLE_LINK_RE = re.compile(r"<https?://[^>]+>")

HEADING_LINE_RE = re.compile(r"^(#{1,6}\s+.*)$", re.MULTILINE)

def _mask(pattern: re.Pattern, text: str, store: List[str], token_prefix: str) -> str:
    def repl(m):
        store.append(m.group(0))
        return f"@@{token_prefix}{len(store)-1}@@"
    return pattern.sub(repl, text)

def _unmask(text: str, store: List[str], token_prefix: str) -> str:
    for i, seg in enumerate(store):
        text = text.replace(f"@@{token_prefix}{i}@@", seg)
    return text

def _autolink_markdown(md: str, current_url: str) -> str:
    """
    Replace term occurrences with markdown links to glossary URLs.
    """
    if not md or not TERM_KEYS_SORTED:
        return md

    # Mask fences, inline code, existing links, headings
    store_fence: List[str] = []
    store_inline: List[str] = []
    store_links: List[str] = []
    store_angle: List[str] = []
    store_head: List[str] = []

    work = md
    work = _mask(FENCE_RE, work, store_fence, "WC_FENCE_")
    work = _mask(INLINE_CODE_RE, work, store_inline, "WC_INLINE_")
    work = _mask(MD_LINK_RE, work, store_links, "WC_LINK_")
    work = _mask(ANGLE_LINK_RE, work, store_angle, "WC_ALINK_")
    work = _mask(HEADING_LINE_RE, work, store_head, "WC_HEAD_")

    # Do replacements
    for term in TERM_KEYS_SORTED:
        url = TERM_MAP.get(term)
        if not url:
            continue
        # avoid self-link
        if current_url and url == current_url:
            continue

        escaped = re.escape(term)
        # boundary: not adjacent to alnum/hangul (prevents mid-word matches)
        pat = re.compile(rf"(?<![{ALNUM_KO}])({escaped})(?![{ALNUM_KO}])")
        work = pat.sub(rf"[\1]({url})", work)

    # Unmask in reverse order
    work = _unmask(work, store_head, "WC_HEAD_")
    work = _unmask(work, store_angle, "WC_ALINK_")
    work = _unmask(work, store_links, "WC_LINK_")
    work = _unmask(work, store_inline, "WC_INLINE_")
    work = _unmask(work, store_fence, "WC_FENCE_")

    return work

def on_page_markdown(markdown, page, config, **kwargs):
    """
    Apply autolinking to every page.
    """
    try:
        current_url = "/" + page.url  # page.url like 'glossary/overlanding/'
        if not current_url.endswith("/"):
            current_url += "/"
    except Exception:
        current_url = ""

    return _autolink_markdown(markdown, current_url)
