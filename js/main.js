(function () {
  "use strict";

  /* Loader policy:
     "session" = full intro on the first visit in this browser session,
                 then a short (<1s) version on later reloads.
     "always"  = full intro on every reload.
     prefers-reduced-motion skips the loader entirely in both modes. */
  var LOADER_POLICY = "session";
  var LOADER_FULL_MS = 1100;
  var LOADER_SHORT_MS = 800;

  /* Set true to show the "También impulsamos / We also run" section.
     Keep in sync with the boot script in index.html. */
  var SHOW_PROJECTS = false;

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
    html.classList.add("has-seen-loader");
    html.classList.remove("is-loading", "loader-short");
    markLoaderSeen();
    var loader = document.getElementById("loader");
    if (loader) {
      loader.setAttribute("aria-hidden", "true");
    }
  }

  /* Force-play (?loader=1 full, ?loader=short) or skip (?loader=0). */
  var params = new URLSearchParams(window.location.search);
  var forceLoader = params.get("loader") === "1";
  var forceShort = params.get("loader") === "short";
  var skipLoader = params.get("loader") === "0";
  var freeze = params.get("freeze");
  var loaderMs = LOADER_FULL_MS;
  var playingLoader = false;

  if (forceShort) html.classList.add("loader-short");

  if (freeze !== null && freeze !== "") {
    html.classList.add("is-loading");
    html.setAttribute("data-freeze", freeze);
    /* Timing is paused from CSS via --freeze; do not override delays here. */
  } else if (skipLoader || reducedMotion()) {
    hideLoader();
  } else if (forceLoader) {
    html.classList.add("is-loading");
    html.classList.remove("loader-short");
    playingLoader = true;
    loaderMs = LOADER_FULL_MS;
    window.setTimeout(hideLoader, loaderMs);
  } else if (forceShort || (LOADER_POLICY === "session" && hasSeenLoader())) {
    html.classList.add("is-loading", "loader-short");
    playingLoader = true;
    loaderMs = LOADER_SHORT_MS;
    window.setTimeout(hideLoader, loaderMs);
  } else {
    /* First visit in the session, or LOADER_POLICY === "always". */
    html.classList.add("is-loading");
    html.classList.remove("loader-short");
    playingLoader = true;
    loaderMs = LOADER_FULL_MS;
    window.setTimeout(hideLoader, loaderMs);
  }

  function showAllReveals() {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  function initReveal() {
    var nodes = document.querySelectorAll(".reveal");
    if (!nodes.length) return;
    if (reducedMotion() || skipLoader || !("IntersectionObserver" in window)) {
      showAllReveals();
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }
    );
    nodes.forEach(function (el) {
      io.observe(el);
    });
  }

  function startReveals() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initReveal);
    } else {
      initReveal();
    }
  }

  /* After a loader intro, wait for the content fade before observing. */
  if (playingLoader) {
    window.setTimeout(startReveals, Math.max(0, loaderMs - 200));
  } else {
    startReveals();
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
    document.querySelectorAll("[data-aria-es]").forEach(function (el) {
      var label = el.getAttribute("data-aria-" + lang) || el.getAttribute("data-aria-es");
      if (label) el.setAttribute("aria-label", label);
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

  document.querySelectorAll(".section-projects").forEach(function (section) {
    if (SHOW_PROJECTS) {
      section.removeAttribute("hidden");
      section.removeAttribute("inert");
      section.removeAttribute("aria-hidden");
    } else {
      section.setAttribute("hidden", "");
      section.setAttribute("inert", "");
      section.setAttribute("aria-hidden", "true");
    }
  });
})();
