(function(){
  function enc(s){ return encodeURIComponent(s || ''); }
  function safeText(s){ return (s || '').replace(/\s+/g,' ').trim(); }

  function icon(name){
    const icons = {
      link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.59 13.41a1 1 0 0 0 1.41 0l3.17-3.17a3 3 0 0 0-4.24-4.24L8.76 8.17a3 3 0 0 0 0 4.24 1 1 0 1 0 1.41-1.41 1 1 0 0 1 0-1.41l2.17-2.17a1 1 0 0 1 1.41 1.41l-3.17 3.17a1 1 0 0 0 0 1.41z"/><path d="M13.41 10.59a1 1 0 0 0-1.41 0l-3.17 3.17a3 3 0 0 0 4.24 4.24l2.17-2.17a3 3 0 0 0 0-4.24 1 1 0 1 0-1.41 1.41 1 1 0 0 1 0 1.41l-2.17 2.17a1 1 0 0 1-1.41-1.41l3.17-3.17a1 1 0 0 0 0-1.41z"/></svg>',
      copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 1H6a2 2 0 0 0-2 2v12h2V3h10V1zm3 4H10a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16h-9V7h9v14z"/></svg>',
      share: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 16.08a2.99 2.99 0 0 0-2.4 1.2L8.91 13.7a3.27 3.27 0 0 0 0-3.39l6.64-3.56A3 3 0 1 0 15 5a2.99 2.99 0 0 0 .06.59L8.4 9.15a3 3 0 1 0 0 5.7l6.66 3.56A3 3 0 1 0 18 16.08z"/></svg>',
      fb: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.62.77-1.62 1.56V12h2.76l-.44 2.89h-2.32v6.99A10 10 0 0 0 22 12z"/></svg>',
      x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H22l-6.77 7.73L23 22h-6.2l-4.86-6.1L6.6 22H3.5l7.25-8.29L1 2h6.35l4.4 5.52L18.9 2zm-1.09 18h1.72L6.41 3.91H4.58L17.81 20z"/></svg>',
      in: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5zM3 9h4v12H3V9zm7 0h3.8v1.64h.05c.53-1 1.82-2.05 3.74-2.05C21 8.59 21 11 21 14.01V21h-4v-6.16c0-1.47-.03-3.36-2.05-3.36-2.05 0-2.36 1.6-2.36 3.25V21h-4V9z"/></svg>',
      tg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.8 4.6 3.7 11.7c-1.2.5-1.2 1.2-.2 1.5l4.6 1.4 1.8 5.5c.2.6.1.8.7.8.4 0 .6-.2.9-.5l2.2-2.1 4.6 3.4c.8.5 1.4.2 1.6-.8l3-14.2c.3-1.2-.4-1.7-1.1-1.4zM9.2 14.2l9.3-5.9c.5-.3 1-.1.6.3l-7.5 6.8-.3 3.6-1.6-4.8-3.7-1.2c-.8-.2-.8-.7.2-1.1z"/></svg>',
      mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>'
    };
    return icons[name] || icons.link;
  }

  function buildSharebar(){
    const h1 = document.querySelector(".md-content__inner h1");
    if(!h1) return;

    // 중복 삽입 방지
    if(document.querySelector(".wc-sharebar")) return;

    const title = safeText(h1.textContent) || safeText(document.title);
    const url = window.location.href;

    const fb = "https://www.facebook.com/sharer/sharer.php?u=" + enc(url);
    const tw = "https://twitter.com/intent/tweet?url=" + enc(url) + "&text=" + enc(title);
    const li = "https://www.linkedin.com/sharing/share-offsite/?url=" + enc(url);
    const tg = "https://t.me/share/url?url=" + enc(url) + "&text=" + enc(title);
    const mail = "mailto:?subject=" + enc(title) + "&body=" + enc(url);
    const fix = "mailto:wiki@wcamper.com?subject=" + enc("[WCAMPER Wiki] 수정 요청: " + title) + "&body=" + enc("대상 페이지: " + url + "\n\n수정 요청 내용:\n");

    const bar = document.createElement("div");
    bar.className = "wc-sharebar";
    bar.innerHTML = 
      <span class="wc-sharebar__label">공유</span>

      <button type="button" class="wc-sharebtn wc-sharebtn--kakao" data-action="kakao" title="카카오톡(모바일 공유시트)">
         카카오톡
      </button>

      <a class="wc-sharebtn" href="" target="_blank" rel="noopener" title="Facebook">
         Facebook
      </a>

      <a class="wc-sharebtn" href="" target="_blank" rel="noopener" title="X">
         X
      </a>

      <a class="wc-sharebtn" href="" target="_blank" rel="noopener" title="LinkedIn">
         LinkedIn
      </a>

      <a class="wc-sharebtn" href="" target="_blank" rel="noopener" title="Telegram">
         Telegram
      </a>

      <button type="button" class="wc-sharebtn" data-action="copy" title="링크 복사">
         링크복사
      </button>

      <a class="wc-sharebtn" href="" title="이메일로 공유">
         Email
      </a>

      <a class="wc-sharebtn wc-sharebtn--danger" href="" title="수정 요청(메일)">
         수정 요청
      </a>

      <span class="wc-sharebtn__hint">미리보기 제목은 페이지 제목으로 노출됩니다.</span>
    ;

    // H1 바로 아래에 삽입
    h1.insertAdjacentElement("afterend", bar);

    bar.addEventListener("click", async (e) => {
      const t = e.target.closest("[data-action]");
      if(!t) return;

      const action = t.getAttribute("data-action");
      if(action === "copy"){
        try{
          await navigator.clipboard.writeText(url);
          t.textContent = "✓ 복사됨";
          setTimeout(()=>{ t.innerHTML = icon('copy') + " 링크복사"; }, 900);
        }catch(err){
          prompt("복사 실패. 아래 링크를 복사하세요:", url);
        }
      }

      if(action === "kakao"){
        // KakaoTalk은 단순 URL로는 '톡 공유'가 불가(공식 SDK 필요)
        // 대신 Web Share API를 사용하면 모바일에서 카카오톡 포함 공유시트로 전송 가능.
        if(navigator.share){
          try{
            await navigator.share({ title, text: title, url });
          }catch(err){
            // 사용자가 취소한 경우 등은 무시
          }
        } else {
          // 데스크탑 fallback: 링크 복사 안내
          try{
            await navigator.clipboard.writeText(url);
            alert("데스크탑에서는 카카오톡 공유시트가 없어서 링크를 복사했습니다. 카카오톡에 붙여넣어 공유하세요.");
          }catch(err){
            prompt("카카오톡 공유: 아래 링크를 복사해서 카카오톡에 붙여넣어 주세요.", url);
          }
        }
      }
    });
  }

  // 초기 + 페이지 전환(instant navigation) 대응
  document.addEventListener("DOMContentLoaded", buildSharebar);
  window.addEventListener("locationchange", buildSharebar);

  // Material instant navigation에서는 DOM이 바뀔 수 있어, history/replaceState 후크
  const pushState = history.pushState;
  history.pushState = function(){
    pushState.apply(history, arguments);
    window.dispatchEvent(new Event("locationchange"));
  };
  const replaceState = history.replaceState;
  history.replaceState = function(){
    replaceState.apply(history, arguments);
    window.dispatchEvent(new Event("locationchange"));
  };
  window.addEventListener("popstate", () => window.dispatchEvent(new Event("locationchange")));
})();
