/* Aarthi Travels — 16 Seater Urbania card slider (shared by index.html and vehicles.html).
   Vanilla JS. One autoplay timer per slider, one set of listeners (guarded by data-us-ready),
   only one slide active at a time. Autoplay 4.5s, crossfade handled in CSS (style.css). */
(function () {
  'use strict';

  var INTERVAL = 4500;
  var SWIPE_MIN = 40;
  var reduceMq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  function init(root) {
    if (root.getAttribute('data-us-ready') === 'true') return; // never bind twice
    root.setAttribute('data-us-ready', 'true');

    var slides = Array.prototype.slice.call(root.querySelectorAll('.us-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.us-dot'));
    var prev = root.querySelector('.us-prev');
    var next = root.querySelector('.us-next');
    if (slides.length < 2) return;

    var index = 0, timer = null, hoverPaused = false, focusPaused = false, hidden = false;

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) {
        var on = n === index;
        s.classList.toggle('is-active', on);
        s.setAttribute('aria-hidden', on ? 'false' : 'true');
      });
      dots.forEach(function (d, n) {
        var on = n === index;
        d.classList.toggle('is-active', on);
        if (on) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
      });
    }

    function stop() { if (timer) { clearTimeout(timer); timer = null; } }

    function canPlay() { return !reduceMq.matches && !hoverPaused && !focusPaused && !hidden; }

    function start() {
      stop(); // always clear first: never more than one timer
      if (!canPlay()) return;
      timer = setTimeout(function () { show(index + 1); start(); }, INTERVAL);
    }

    function go(i) { show(i); start(); } // manual change restarts the 4.5s countdown

    if (prev) prev.addEventListener('click', function () { go(index - 1); });
    if (next) next.addEventListener('click', function () { go(index + 1); });
    dots.forEach(function (d, n) { d.addEventListener('click', function () { go(n); }); });

    /* Hover pause: mouse pointers only (touch taps must not freeze autoplay) */
    root.addEventListener('pointerenter', function (e) {
      if (e.pointerType === 'mouse') { hoverPaused = true; stop(); }
    });
    root.addEventListener('pointerleave', function (e) {
      if (e.pointerType === 'mouse') { hoverPaused = false; start(); }
    });

    /* Keyboard focus pause + arrow-key support */
    root.addEventListener('focusin', function () { focusPaused = true; stop(); });
    root.addEventListener('focusout', function (e) {
      if (!root.contains(e.relatedTarget)) { focusPaused = false; start(); }
    });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { go(index - 1); }
      else if (e.key === 'ArrowRight') { go(index + 1); }
    });

    /* Touch swipe (horizontal intent only, so vertical page scroll still works) */
    var sx = 0, sy = 0, tracking = false;
    root.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) { tracking = false; return; }
      sx = e.touches[0].clientX; sy = e.touches[0].clientY; tracking = true;
      stop();
    }, { passive: true });
    root.addEventListener('touchend', function (e) {
      if (!tracking) return;
      tracking = false;
      var t = e.changedTouches[0];
      var dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) >= SWIPE_MIN && Math.abs(dx) > Math.abs(dy) * 1.2) go(index + (dx < 0 ? 1 : -1));
      else start();
    }, { passive: true });
    root.addEventListener('touchcancel', function () { tracking = false; start(); }, { passive: true });

    /* Don't run while the tab is hidden */
    document.addEventListener('visibilitychange', function () {
      hidden = document.hidden;
      if (hidden) stop(); else start();
    });

    /* Reduced motion: no autoplay (manual controls still work), re-evaluated live */
    var onMotion = function () { if (reduceMq.matches) stop(); else start(); };
    if (reduceMq.addEventListener) reduceMq.addEventListener('change', onMotion);
    else if (reduceMq.addListener) reduceMq.addListener(onMotion);

    /* Preload the other photo so the first crossfade never flashes */
    slides.forEach(function (s) {
      var img = s.querySelector('img');
      if (img && !img.complete) { var p = new Image(); p.src = img.currentSrc || img.src; }
    });

    /* If a photo is missing, drop that slide instead of showing a broken image */
    slides.slice().forEach(function (s) {
      var img = s.querySelector('img');
      if (!img) return;
      img.addEventListener('error', function () {
        var pos = slides.indexOf(s);
        if (pos < 0) return;
        slides.splice(pos, 1);
        if (dots[pos]) { dots[pos].remove(); dots.splice(pos, 1); }
        s.remove();
        if (slides.length < 2) root.classList.add('is-single');
        show(Math.min(index, slides.length - 1));
        if (slides.length >= 2) start(); else stop();
      });
    });

    show(0);
    start();
  }

  function boot() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-urbania-slider]'), init);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
