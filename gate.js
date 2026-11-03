/* Passwortabfrage – in jede Seite mit <script src="gate.js"></script> in den <head> einbinden */
(function () {
  // ====== HIER ANPASSEN ======
  // SHA-256 von "unsere-geschichte:" + dein Passwort (klein geschrieben)
  
  var HASH = "0cd3933f586dcb2281346ced051b12bd06887d3775691523ce1eee9d5ea1bd1b";
  var PROMPT = "Wie lautet unser Wort?";
  // ===========================

  var KEY = "gate-ok-" + HASH.slice(0, 12);
  try { if (localStorage.getItem(KEY) === "1") return; } catch (e) {}

  // Inhalt sofort verstecken, bis das Passwort stimmt
  var hide = document.createElement("style");
  hide.textContent = "body > *:not(#gate){display:none !important}";
  document.head.appendChild(hide);

  var css = document.createElement("style");
  css.textContent =
    "#gate{position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;text-align:center;" +
    "background:radial-gradient(120% 80% at 50% 0%,#6b1228 0%,#3a0a16 55%,#2a060f 100%);color:#f6e3dc;font-family:Jost,system-ui,sans-serif}" +
    "#gate h1{font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-weight:400;font-size:2rem;margin:1.2rem 0 1.6rem;color:#f6e3dc}" +
    "#gate input{width:100%;max-width:16rem;padding:.85rem 1rem;text-align:center;font-size:1.1rem;color:#f6e3dc;background:rgba(0,0,0,.25);" +
    "border:1px solid rgba(210,171,130,.5);border-radius:999px;outline:none}" +
    "#gate input:focus{border-color:#d2ab82;box-shadow:0 0 0 3px rgba(210,171,130,.25)}" +
    "#gate button{margin-top:1rem;padding:.75rem 2rem;border-radius:999px;border:1px solid rgba(210,171,130,.6);background:transparent;color:#d2ab82;font-size:.95rem}" +
    "#gate button:active{background:rgba(210,171,130,.15)}" +
    "#gate .msg{height:1.4rem;margin-top:.9rem;font-size:.85rem;color:#e8a9a0}" +
    "#gate.shake input{animation:gshake .4s}@keyframes gshake{25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}";
  document.head.appendChild(css);

  async function sha256(text) {
    var buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
  }

  function build() {
    var g = document.createElement("div");
    g.id = "gate";
    g.innerHTML =
      '<svg viewBox="0 0 24 24" width="56" height="56" fill="#d2ab82" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.7 5 6 5c2 0 3.4 1.1 4.2 2.4h3.6C14.6 6.1 16 5 18 5c3.3 0 5.1 3.4 3.6 6.8C19.5 16.4 12 21 12 21z"/></svg>' +
      "<h1>" + PROMPT + "</h1>" +
      '<input id="gpw" type="password" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" aria-label="Passwort">' +
      '<button id="gbtn" type="button">Öffnen</button>' +
      '<div class="msg" id="gmsg" role="alert"></div>';
    document.body.appendChild(g);

    var input = g.querySelector("#gpw"), msg = g.querySelector("#gmsg");
    async function check() {
      var pw = input.value.trim().toLowerCase();
      if (!pw) return;
      if ((await sha256("unsere-geschichte:" + pw)) === HASH) {
        try { localStorage.setItem(KEY, "1"); } catch (e) {}
        g.remove(); hide.remove(); css.remove();
      } else {
        msg.textContent = "Das stimmt leider nicht. Versuch es nochmal.";
        g.classList.remove("shake"); void g.offsetWidth; g.classList.add("shake");
        if (navigator.vibrate) navigator.vibrate(60);
        input.select();
      }
    }
    g.querySelector("#gbtn").addEventListener("click", check);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") check(); });
    input.focus();
  }

  if (document.body) build(); else document.addEventListener("DOMContentLoaded", build);
})();
