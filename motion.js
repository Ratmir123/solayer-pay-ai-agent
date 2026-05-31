/* motion.js — global "fade image in on load" mechanism.

   Pairs with the .img-fade / .img-fade.is-loaded CSS pair in agent.css.
   Pure DOM/observer code, no React, no dependencies.

   Behaviour:
   - For every <img class="img-fade">, reveal (add .is-loaded) the moment the
     pixels are actually ready. Cached images get revealed synchronously so they
     never flash; fresh images wait for 'load'. Errors also reveal — a broken
     image must never stay invisible.
   - A MutationObserver picks up images React mounts after first paint.
   - Each node is marked once it has been wired up so churn (re-renders that
     reuse the same DOM node) never re-registers listeners. */
(function () {
  'use strict';
  if (typeof document === 'undefined') return;

  var PROCESSED = '__motionImgFade';

  function reveal(img) {
    if (!img.classList.contains('is-loaded')) img.classList.add('is-loaded');
  }

  function wire(img) {
    if (img[PROCESSED]) return;
    img[PROCESSED] = true;

    if (img.complete && img.naturalWidth > 0) {
      reveal(img);
      return;
    }
    var onSettle = function () {
      img.removeEventListener('load', onSettle);
      img.removeEventListener('error', onSettle);
      reveal(img);
    };
    img.addEventListener('load', onSettle, { once: true });
    img.addEventListener('error', onSettle, { once: true });
  }

  function scan(root) {
    if (!root || !root.querySelectorAll) return;
    var imgs = root.querySelectorAll('img.img-fade');
    for (var i = 0; i < imgs.length; i++) wire(imgs[i]);
  }

  function init() {
    scan(document);

    if (typeof MutationObserver !== 'function') return;
    var mo = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        if (m.type === 'attributes' && m.target && m.target.tagName === 'IMG') {
          if (m.target.classList.contains('img-fade')) wire(m.target);
          continue;
        }
        var added = m.addedNodes;
        if (!added) continue;
        for (var j = 0; j < added.length; j++) {
          var n = added[j];
          if (n.nodeType !== 1) continue;
          if (n.tagName === 'IMG' && n.classList.contains('img-fade')) wire(n);
          else scan(n);
        }
      }
    });
    mo.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
