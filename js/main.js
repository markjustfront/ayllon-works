(function () {
  "use strict";

  var STORAGE_LANG = "ayllon-works-lang";
  var STORAGE_LOADER = "ayllon-works-loader";
  var html = document.documentElement;

  function reducedMotion() {
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {
      return false;
    }
  }

  function hasSeenLoader() {
    try {
      return sessionStorage.getItem(STORAGE_LOADER) === "1";
    } catch (e) {
      return false;
    }
  }

  function markLoaderSeen() {
    try {
      sessionStorage.setItem(STORAGE_LOADER, "1");
    } catch (e) {}
  }

  function hideLoader() {
    html.classList.remove("is-loading");
    html.classList.add("has-seen-loader");
    markLoaderSeen();
    var loader = document.getElementById("loader");
    if (loader) {
      loader.setAttribute("aria-hidden", "true");
    }
  }

  /* Force-play (?loader=1) or skip (?loader=0) — used for screenshots. */
  var params = new URLSearchParams(window.location.search);
  var forceLoader = params.get("loader") === "1";
  var skipLoader = params.get("loader") === "0";
  var freeze = params.get("freeze");

  if (freeze !== null && freeze !== "") {
    html.classList.add("is-loading");
    html.setAttribute("data-freeze", freeze);
    var delay = "-" + freeze + "s";
    window.addEventListener("DOMContentLoaded", function () {
      document.querySelectorAll(".loader-mark .mark-o, .loader-mark .mark-bar, .loader").forEach(function (el) {
        el.style.animationDelay = delay;
        el.style.animationPlayState = "paused";
      });
    });
  } else if (!skipLoader && (forceLoader || (!reducedMotion() && !hasSeenLoader()))) {
    html.classList.add("is-loading");
    window.setTimeout(hideLoader, 1050);
    window.addEventListener("load", function () {
      /* Already on a timer; this is only a safety if the page is cached/instant. */
    });
  } else {
    hideLoader();
  }

  /* Language toggle. Spanish is the document default. */
  var supported = { es: true, en: true, ca: true };

  function applyLang(lang) {
    if (!supported[lang]) lang = "es";
    html.setAttribute("lang", lang);
    document.querySelectorAll(".lang button[data-lang]").forEach(function (btn) {
      var on = btn.getAttribute("data-lang") === lang;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    try {
      sessionStorage.setItem(STORAGE_LANG, lang);
    } catch (e) {}
  }

  var initial = "es";
  try {
    var saved = sessionStorage.getItem(STORAGE_LANG);
    if (saved && supported[saved]) initial = saved;
  } catch (e) {}
  var qLang = params.get("lang");
  if (qLang && supported[qLang]) initial = qLang;
  applyLang(initial);

  document.querySelectorAll(".lang button[data-lang]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyLang(btn.getAttribute("data-lang"));
    });
  });
})();
