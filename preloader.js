/* preloader.js — "welcoming words" intro overlay (GSAP).

   Shows the welcoming words while images + Apple-emoji preload underneath
   (warmed by the preload pass in frog-agent.jsx), then reveals the app with a
   soft upward fade.

   Desktop vs phone: on a phone the app is fullscreen, so the loader stays
   fullscreen too. On desktop the app lives inside the iPhone mockup, so the
   loader is framed to the mockup's screen (.ios-screen) — the intro plays
   "inside the phone", not over the whole window. It's kept hidden until it has
   been framed so the fullscreen wash never flashes first.

   Bulletproof: the overlay always removes itself — a hard safety timeout fires
   no matter what, and if GSAP failed to load or reduced-motion is on it shows
   one greeting briefly and reveals. The full-screen overlay can never trap the
   UI behind it. */
(function () {
  'use strict';

  var container = document.querySelector('[data-loading-container]');
  if (!container) return;
  var screenEl = container.querySelector('.loading-screen');

  // Phone if the app would render fullscreen (same test as app.jsx useIsPhone).
  var isPhone = !!(window.matchMedia &&
    window.matchMedia('(max-width: 820px), (hover: none) and (pointer: coarse)').matches);

  // ── Frame the loader to the iPhone mockup screen on desktop ────────────────
  // The mockup (ios-frame.jsx) is built with inline styles, no classes, so we
  // locate its screen by shape: a rounded, clipped box inside #root sized like a
  // phone. Same heuristic verified against the live DOM (≈393×852, radius ~55).
  function findMockupScreen() {
    var root = document.getElementById('root');
    if (!root) return null;
    var best = null, bestArea = 0, els = root.querySelectorAll('div');
    for (var i = 0; i < els.length; i++) {
      var el = els[i], cs = getComputedStyle(el);
      if (cs.overflow === 'visible') continue;
      var radius = parseFloat(cs.borderTopLeftRadius) || 0;
      if (radius < 28) continue;
      var b = el.getBoundingClientRect();
      if (b.width < 300 || b.width > 560 || b.height < 600) continue;
      if (b.height < b.width) continue;               // must be portrait
      var area = b.width * b.height;
      if (area > bestArea) { bestArea = area; best = { el: el, rect: b, radius: cs.borderTopLeftRadius }; }
    }
    return best;
  }
  function frameToMockup() {
    if (isPhone || !screenEl) return true;            // phone → leave fullscreen
    var m = findMockupScreen();
    if (!m) return false;                             // mockup not laid out yet
    screenEl.style.position = 'fixed';
    screenEl.style.top = m.rect.top + 'px';
    screenEl.style.left = m.rect.left + 'px';
    screenEl.style.width = m.rect.width + 'px';
    screenEl.style.height = m.rect.height + 'px';
    screenEl.style.borderRadius = m.radius || '55px';
    screenEl.style.overflow = 'hidden';
    screenEl.style.visibility = 'visible';
    return true;
  }

  function onResize() { if (!isPhone) frameToMockup(); }

  var done = false;
  function finish() {
    if (done) return;
    done = true;
    window.removeEventListener('resize', onResize);
    container.style.transition = 'opacity .6s ease';
    container.style.opacity = '0';
    setTimeout(function () {
      if (container.parentNode) container.parentNode.removeChild(container);
    }, 650);
  }

  // Safety net — never let the intro trap the app, whatever happens upstream.
  var safety = setTimeout(finish, 9000);
  function done_() { clearTimeout(safety); finish(); }

  // On desktop, keep the loader hidden until it is framed to the phone, so the
  // fullscreen wash never flashes. Poll briefly for the mockup (it mounts a beat
  // after React boots); fall back to visible if it never appears.
  function startFraming() {
    if (isPhone) return;
    if (screenEl) screenEl.style.visibility = 'hidden';
    var t0 = Date.now();
    (function poll() {
      if (frameToMockup()) { window.addEventListener('resize', onResize); return; }
      if (Date.now() - t0 < 2500) requestAnimationFrame(poll);
      else if (screenEl) screenEl.style.visibility = 'visible';  // fallback
    })();
  }

  function run() {
    startFraming();

    var reduce = !!(window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    var wordsEl = container.querySelector('[data-loading-words]');
    var target  = container.querySelector('[data-loading-words-target]');
    var words = ((wordsEl && wordsEl.getAttribute('data-loading-words')) || 'Hello')
      .split(',').map(function (w) { return w.trim(); }).filter(Boolean);

    // Fallback path: no GSAP, or reduced motion → brief greeting, then reveal.
    if (typeof gsap === 'undefined' || reduce) {
      if (target) target.textContent = words[0] || 'Hello';
      if (wordsEl) wordsEl.style.opacity = '1';
      setTimeout(done_, reduce ? 450 : 1000);
      return;
    }

    if (target) target.textContent = words[0] || 'Hello';
    var tl = gsap.timeline({ onComplete: done_ });
    tl.timeScale(1.25);   // run the whole intro 20% faster
    tl.set(wordsEl, { yPercent: 50 });
    // 0.5s of stillness before the first word rises. This also lets the heavy
    // first-frame work (jsx compile + React mount + the image/emoji preload
    // burst) settle, so the opening tween runs smooth instead of janking — and
    // gives the desktop framing time to lock onto the mockup before words show.
    tl.to(wordsEl, { opacity: 1, yPercent: 0, duration: 1, ease: 'Expo.easeInOut', delay: 0.5 });
    // hard cuts between greetings (no fade) — snappy, like the original
    words.forEach(function (word) {
      tl.call(function () { if (target) target.textContent = word; }, null, '+=0.15');
    });
    tl.to(wordsEl, { opacity: 0, yPercent: -75, duration: 0.8, ease: 'Expo.easeIn' });
    tl.to(container, { autoAlpha: 0, duration: 0.6, ease: 'Power1.easeInOut' }, '-=0.2');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
})();
