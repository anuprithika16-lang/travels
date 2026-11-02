/* Aarthi Travels — hero slider, scroll reveal, FAQ accordion, subtle card tilt (desktop only).
   Motion is reduced (cross-fade only) when the visitor prefers reduced motion.
   Everything here is progressive enhancement: if this file fails, content stays visible
   (the page <head> removes the `js` class after 4s unless window.__aarthiAnim is set). */
(function () {
  'use strict';
  window.__aarthiAnim = true;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var mqDesktop = window.matchMedia('(min-width: 1200px)');   // desktop: side reveals + 3D tilt + hover zoom
  var mqMobile = window.matchMedia('(max-width: 767px)');     // mobile: lightest motion

  /* ---------- Hero slider ----------
     Cross-fade + subtle Ken Burns zoom. The incoming slide is decoded, then faded in (.is-active)
     while the outgoing slide (.is-leaving) stays opaque underneath, so there is never a blank or
     flickering frame. The destination text panel is re-animated in step with each change. */
  var SLIDE_MS = 5500;      // autoplay interval
  var TRANSITION_FALLBACK_MS = 1100; // used only if --fade-ms cannot be read (the CSS value is the source of truth)

  function initSlider() {
    var root = document.querySelector('[data-hero-slider]');
    if (!root) return;
    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-bg-slide'));
    var caption = root.querySelector('.slide-caption');
    var copy = root.querySelector('.hero-copy');
    var n = slides.length;
    if (!n) return;

    function fadeMs() {
      var v = parseFloat(window.getComputedStyle(root).getPropertyValue('--fade-ms'));
      return v > 0 ? v : TRANSITION_FALLBACK_MS;
    }

    var idx = 0, timer = null, busy = false, queued = null;
    var touchHold = false, focusHold = false;

    slides.forEach(function (s, i) { s.setAttribute('aria-hidden', i === 0 ? 'false' : 'true'); });

    function setCaption(animate) {
      if (animate && copy) { copy.classList.remove('swap'); void copy.offsetWidth; copy.classList.add('swap'); }
      if (!caption) return;
      var s = slides[idx];
      caption.textContent = '';
      var t = document.createElement('strong'); t.className = 'cap-title'; t.textContent = s.getAttribute('data-title') || '';
      var x = document.createElement('span'); x.className = 'cap-text'; x.textContent = s.getAttribute('data-text') || '';
      caption.appendChild(t); caption.appendChild(x);
    }
    function isPaused() { return touchHold || focusHold || document.hidden; }
    function stopTimer() { if (timer) { clearTimeout(timer); timer = null; } }
    function schedule() {
      stopTimer();
      if (n < 2 || reduce || isPaused()) return; // reduced-motion visitors move through slides with the arrows
      timer = setTimeout(function () { go(idx + 1, 1); }, SLIDE_MS);
    }
    function pause() { stopTimer(); }
    function resume() { schedule(); }

    /* Start loading an upcoming image so the transition never waits on the network */
    function preload(i) {
      var img = slides[(i + n) % n].querySelector('img');
      if (img && img.loading === 'lazy') img.loading = 'eager';
    }
    /* Call cb once the slide image is loaded and decoded (or after a 3s safety timeout) */
    function ready(slide, cb) {
      var img = slide.querySelector('img'), done = false;
      function fin() {
        if (done) return; done = true;
        if (img && img.decode) { img.decode().then(cb, cb); } else { cb(); }
      }
      if (!img || (img.complete && img.naturalWidth)) { fin(); return; }
      img.loading = 'eager';
      img.addEventListener('load', fin, { once: true });
      img.addEventListener('error', fin, { once: true });
      setTimeout(fin, 3000);
    }

    /* Where the slider is heading: the queued slide if a request is waiting, otherwise the current one */
    function pendingIdx() { return queued ? queued.t : idx; }

    function go(target, dir) {
      target = (target + n) % n;
      if (target === idx && !busy) return;
      if (busy) { queued = { t: target, d: dir }; return; } // one animation at a time; keep the latest request
      busy = true; stopTimer();
      var from = idx, incoming = slides[target], outgoing = slides[from];
      ready(incoming, function () {
        incoming.classList.remove('is-leaving');
        outgoing.classList.remove('is-active'); outgoing.classList.add('is-leaving');
        incoming.classList.add('is-active');
        outgoing.setAttribute('aria-hidden', 'true'); incoming.setAttribute('aria-hidden', 'false');
        idx = target; setCaption(true); schedule(); preload(idx + 1);
        setTimeout(function () {
          outgoing.classList.remove('is-leaving');
          busy = false;
          if (queued) { var q = queued; queued = null; go(q.t, q.d); }
        }, fadeMs() + 60);
      });
    }

    root.querySelectorAll('.hero-arrow').forEach(function (b) {
      b.addEventListener('click', function () { var d = b.classList.contains('prev') ? -1 : 1; go(pendingIdx() + d, d); });
    });

    /* Keyboard focus pauses autoplay; a mouse click that leaves focus on a button does not */
    root.addEventListener('focusin', function (e) {
      var kb = true; try { kb = e.target.matches(':focus-visible'); } catch (err) { /* old browsers */ }
      if (kb) { focusHold = true; pause(); }
    });
    root.addEventListener('focusout', function () { if (focusHold) { focusHold = false; resume(); } });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') go(pendingIdx() - 1, -1); else if (e.key === 'ArrowRight') go(pendingIdx() + 1, 1);
    });

    /* Swipe: horizontal gestures change slides, vertical gestures still scroll the page */
    var x0 = 0, y0 = 0, tracking = false;
    root.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) { tracking = false; return; }
      tracking = true; x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
      touchHold = true; pause();
    }, { passive: true });
    function endTouch(e) {
      if (!tracking) return; tracking = false; touchHold = false;
      var t = e.changedTouches && e.changedTouches[0];
      var dx = t ? t.clientX - x0 : 0, dy = t ? t.clientY - y0 : 0;
      if (e.type === 'touchend' && Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        go(idx + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
      } else { resume(); }
    }
    root.addEventListener('touchend', endTouch, { passive: true });
    root.addEventListener('touchcancel', endTouch, { passive: true });

    document.addEventListener('visibilitychange', function () { if (document.hidden) pause(); else resume(); });
    window.addEventListener('pageshow', function (e) { if (e.persisted) resume(); });

    setCaption(false); schedule();
    if (n > 1) {
      if (document.readyState === 'complete') preload(1);
      else window.addEventListener('load', function () { preload(1); });
    }
  }

  /* ---------- FAQ: smooth accordion ----------
     <details> opens instantly by default. Here the height is animated (open and close). Without JavaScript, or with
     reduced motion, the native instant behaviour is kept. Enter / Space on the summary still work (they fire click). */
  function initFaq() {
    if (reduce || !Element.prototype.animate) return;
    document.querySelectorAll('details.faq').forEach(function (d) {
      var sum = d.querySelector('summary');
      if (!sum) return;
      var anim = null, closing = false;
      function closedHeight() { return sum.offsetHeight + (d.offsetHeight - d.clientHeight); } // summary + borders
      function run(from, to, onDone) {
        d.classList.add('is-animating');
        anim = d.animate({ height: [from + 'px', to + 'px'] }, { duration: 380, easing: 'cubic-bezier(.22, 1, .36, 1)' });
        anim.onfinish = function () { anim = null; d.classList.remove('is-animating'); onDone(); };
      }
      sum.addEventListener('click', function (e) {
        e.preventDefault();
        var from = d.getBoundingClientRect().height;
        if (anim) { anim.cancel(); anim = null; }
        if (d.open && !closing) {                 // close
          closing = true; d.classList.add('is-closing');
          run(from, closedHeight(), function () { d.open = false; closing = false; d.classList.remove('is-closing'); });
        } else {                                  // open (or re-open while closing)
          closing = false; d.classList.remove('is-closing'); d.open = true;
          run(from, d.getBoundingClientRect().height, function () {});
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initSlider();

    /* Cards, booking steps and filter buttons start hidden and reveal as they scroll into view */
    document.querySelectorAll('.grid, .steps, .filter-bar').forEach(function (g) {
      Array.prototype.forEach.call(g.children, function (c) { c.classList.add('reveal-item'); });
    });

    /* Auto-tag content so every section's heading, text, lists and cards arrive in sequence.
       (Classes only: the markup, text and layout are untouched. Without JS nothing is hidden.) */
    function kids(el) { return Array.prototype.slice.call(el.children); }
    function tagItem(el) { if (el && !el.classList.contains('reveal-item')) el.classList.add('reveal-item'); }
    // Section heads: heading then paragraph; the head itself only drives the gold underline
    document.querySelectorAll('.section-head.reveal').forEach(function (h) {
      h.classList.remove('reveal'); h.classList.add('reveal-flow'); kids(h).forEach(tagItem);
    });
    // Long-form sections: h2, lead, paragraphs, sub-headings, lists, tables, FAQ items, two-column blocks
    document.querySelectorAll('.content-section > .container').forEach(function (c) {
      kids(c).forEach(function (el) {
        if (el.matches('ul, ol')) kids(el).forEach(tagItem);
        else if (el.matches('.two-col')) kids(el).forEach(tagItem);
        else if (el.matches('h2, h3, p, .table-wrap, .note, details.faq')) tagItem(el);
      });
    });
    // Contact details: name/address, then phone, email, Facebook, then the buttons
    document.querySelectorAll('.info-card').forEach(function (card) {
      kids(card).forEach(function (el) { if (el.matches('ul')) kids(el).forEach(tagItem); else tagItem(el); });
    });
    // About: 30+ years statement and badge enter with a soft zoom-fade (no counting)
    document.querySelectorAll('.experience-note, .exp-badge').forEach(function (el) { el.classList.add('reveal-zoom'); });

    /* Stagger step per device (ms): desktop 120 / tablet 100 / mobile 80 */
    function staggerStep() { return mqMobile.matches ? 80 : (mqDesktop.matches ? 120 : 100); }
    /* Visual order (top to bottom, then left to right) so a batch always cascades the way the eye reads it */
    function inOrder(a, b) {
      var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      return Math.abs(ra.top - rb.top) > 6 ? ra.top - rb.top : ra.left - rb.left;
    }

    /* Scroll reveal. Elements that enter view together (a row of cards, the three steps, About image + text on tablet)
       arrive one after another, in page order. Once revealed they stay put: nothing is ever hidden again. */
    var els = document.querySelectorAll('.reveal, .reveal-flow, .reveal-item, .reveal-left, .reveal-right, .reveal-zoom');
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var ioFired = false;
      var io = new IntersectionObserver(function (entries) {
        ioFired = true;
        var parents = [], counts = [];
        entries.filter(function (en) { return en.isIntersecting; })
          .map(function (en) { return en.target; })
          .sort(inOrder)
          .forEach(function (el) {
            var side = el.classList.contains('reveal-left') || el.classList.contains('reveal-right');
            var delay = 0;
            if (el.classList.contains('reveal-item') || (side && !mqDesktop.matches)) {
              var k = parents.indexOf(el.parentElement);
              if (k < 0) { parents.push(el.parentElement); counts.push(0); k = parents.length - 1; }
              delay = Math.min(counts[k]++, 5) * staggerStep(el);
            }
            if (delay) el.style.setProperty('--d', (delay / 1000) + 's');
            el.classList.add('is-visible'); io.unobserve(el);
            /* Hand the card back to its own hover transitions once the entrance has finished */
            if (el.classList.contains('reveal-item')) {
              setTimeout(function () { el.classList.remove('reveal-item'); el.style.removeProperty('--d'); }, delay + 1600);
            }
          });
      }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
      els.forEach(function (el) { io.observe(el); });
      /* Safety net: only if the observer never reports back at all (a working browser always reports once on observe),
         reveal everything so content can never stay hidden. It must not fire otherwise, or lower sections would
         be revealed before the visitor scrolls to them. */
      setTimeout(function () { if (!ioFired) els.forEach(function (el) { el.classList.add('is-visible'); }); }, 4000);
    }

    initFaq();

    if (reduce || !finePointer) return;

    /* Subtle card tilt (max 3 degrees, mouse only) */
    var MAX = 3;
    document.querySelectorAll('.tilt').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        if (!mqDesktop.matches) return; // no 3D tilt on tablet or mobile widths
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        card.classList.add('is-tracking');
        card.style.setProperty('--ry', (px * MAX * 2).toFixed(2) + 'deg');
        card.style.setProperty('--rx', (-py * MAX * 2).toFixed(2) + 'deg');
      });
      card.addEventListener('pointerleave', function () {
        card.classList.remove('is-tracking');
        card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg');
      });
    });
  });
})();
