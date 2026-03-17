(function () {
  const FEEDBACK_EMAIL = "wiki@wcamper.com";

  function enc(s) {
    return encodeURIComponent(s || "");
  }

  function safeText(s) {
    return (s || "").replace(/\s+/g, " ").trim();
  }

  function icon(name) {
    const icons = {
      copy:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 1H6a2 2 0 0 0-2 2v12h2V3h10V1zm3 4H10a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16h-9V7h9v14z"/></svg>',
      share:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 16.08a2.99 2.99 0 0 0-2.4 1.2L8.91 13.7a3.27 3.27 0 0 0 0-3.39l6.64-3.56A3 3 0 1 0 15 5a2.99 2.99 0 0 0 .06.59L8.4 9.15a3 3 0 1 0 0 5.7l6.66 3.56A3 3 0 1 0 18 16.08z"/></svg>',
      mail:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>',
    };
    return icons[name] || icons.share;
  }

  function buildSharebar() {
    const contentInner = document.querySelector(".md-content__inner");
    const h1 = document.querySelector(".md-content__inner h1");
    if (!contentInner || !h1) return;
    if (document.querySelector(".wc-sharebar")) return;

    const title = safeText(h1.textContent) || safeText(document.title);
    const url = window.location.href;
    const fb = "https://www.facebook.com/sharer/sharer.php?u=" + enc(url);
    const tw =
      "https://twitter.com/intent/tweet?url=" +
      enc(url) +
      "&text=" +
      enc(title);
    const li =
      "https://www.linkedin.com/sharing/share-offsite/?url=" + enc(url);
    const tg = "https://t.me/share/url?url=" + enc(url) + "&text=" + enc(title);
    const mail = "mailto:?subject=" + enc(title) + "&body=" + enc(url);
    const fix =
      "mailto:" +
      FEEDBACK_EMAIL +
      "?subject=" +
      enc("[WCAMPER Wiki] 수정 요청: " + title) +
      "&body=" +
      enc("대상 페이지: " + url + "\n\n수정 요청 내용:\n");

    const bar = document.createElement("div");
    bar.className = "wc-sharebar";
    bar.innerHTML = `
      <span class="wc-sharebar__label">공유</span>

      <button type="button" class="wc-sharebtn wc-sharebtn--kakao" data-action="kakao" title="카카오톡(모바일 공유시트)">
        ${icon("share")} 카카오톡
      </button>

      <a class="wc-sharebtn" href="${fb}" target="_blank" rel="noopener" title="Facebook">Facebook</a>
      <a class="wc-sharebtn" href="${tw}" target="_blank" rel="noopener" title="X">X</a>
      <a class="wc-sharebtn" href="${li}" target="_blank" rel="noopener" title="LinkedIn">LinkedIn</a>
      <a class="wc-sharebtn" href="${tg}" target="_blank" rel="noopener" title="Telegram">Telegram</a>

      <button type="button" class="wc-sharebtn" data-action="copy" title="링크 복사">
        ${icon("copy")} 링크복사
      </button>

      <a class="wc-sharebtn" href="${mail}" title="이메일로 공유">${icon("mail")} Email</a>
      <a class="wc-sharebtn wc-sharebtn--danger" href="${fix}" title="수정 요청(메일)">${icon("mail")} 수정 요청</a>
      <span class="wc-sharebtn__hint">미리보기 제목은 페이지 제목으로 노출됩니다.</span>
    `;

    const sourceMeta = contentInner.querySelector(".md-source-file");
    if (sourceMeta) {
      sourceMeta.insertAdjacentElement("beforebegin", bar);
    } else {
      contentInner.insertAdjacentElement("beforeend", bar);
    }

    bar.addEventListener("click", async (e) => {
      const t = e.target.closest("[data-action]");
      if (!t) return;
      const action = t.getAttribute("data-action");

      if (action === "copy") {
        try {
          await navigator.clipboard.writeText(url);
          t.textContent = "복사됨";
          setTimeout(() => {
            t.innerHTML = `${icon("copy")} 링크복사`;
          }, 900);
        } catch (err) {
          prompt("복사 실패. 아래 링크를 복사하세요:", url);
        }
      }

      if (action === "kakao") {
        if (navigator.share) {
          try {
            await navigator.share({ title, text: title, url });
          } catch (err) {
            // user cancelled
          }
        } else {
          try {
            await navigator.clipboard.writeText(url);
            alert("링크를 복사했습니다. 카카오톡에 붙여넣어 공유하세요.");
          } catch (err) {
            prompt("카카오톡 공유: 아래 링크를 복사해서 붙여넣어 주세요.", url);
          }
        }
      }
    });
  }

  document.addEventListener("DOMContentLoaded", buildSharebar);
  window.addEventListener("locationchange", buildSharebar);

  const pushState = history.pushState;
  history.pushState = function () {
    pushState.apply(history, arguments);
    window.dispatchEvent(new Event("locationchange"));
  };
  const replaceState = history.replaceState;
  history.replaceState = function () {
    replaceState.apply(history, arguments);
    window.dispatchEvent(new Event("locationchange"));
  };
  window.addEventListener("popstate", function () {
    window.dispatchEvent(new Event("locationchange"));
  });
})();
