/* SOLNET EFFECTS  (js/effects.js)  - one file, one init, loaded on every page AFTER motion.js.
   Needs css/effects.css.  Safe to load twice (guard).  Open the browser Console: you should see
   "[SolNet] effects.js ready" - if you do not, the file is not being loaded (wrong path / not copied).
   Parts: 0 motion switch | 1 scroll progress | 2 scroll reveal | 3 split text | 4 typewriter
          5 parallax | 6 magnetic buttons | 7 3D tilt | 8 cursor accents
   Ripple, modal fade-in, page fade-out and the in-page "arrive" effect live in motion.js / ui-enhance.js. */
(function () {
  if (window.__solnetFx) return;
  window.__solnetFx = true;

  var root = document.documentElement;
  var osReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var forced = false;
  try { forced = localStorage.getItem('solnet-motion') === 'on'; } catch (e) {}
  if (osReduce && forced) root.classList.add('fx-force');
  var reduce = osReduce && !forced;
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var wide = window.matchMedia('(min-width: 900px)').matches;
  var EASE = 'cubic-bezier(.22,.61,.36,1)';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };

  console.info('[SolNet] effects.js ready | OS reduce-motion: ' + osReduce + ' | animations on: ' + !reduce);

  /* ---------- 0. motion switch ----------
     Windows/macOS "reduce motion" makes the browser report prefers-reduced-motion. We respect it by default,
     but tell the visitor and let them turn animations on (saved in localStorage, key "solnet-motion"). */
  if (reduce) {
    var dismissed = false;
    try { dismissed = sessionStorage.getItem('solnet-motion-note') === '1'; } catch (e) {}
    if (!dismissed) {
      var note = document.createElement('div');
      note.className = 'fx-note';
      note.setAttribute('role', 'status');
      note.innerHTML = '<p>Animations are reduced because your device has “reduce motion” turned on. Enable them for this site?</p>' +
        '<button type="button" data-on>Enable animations</button><button type="button" class="fx-ghost" data-off>Keep reduced</button>';
      document.body.appendChild(note);
      note.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        if (b.hasAttribute('data-on')) { try { localStorage.setItem('solnet-motion', 'on'); } catch (err) {} location.reload(); }
        else { try { sessionStorage.setItem('solnet-motion-note', '1'); } catch (err) {} note.remove(); }
      });
    }
    return;                                           // everything below is motion
  }
  if (forced) console.info('[SolNet] animations forced on. To undo: localStorage.removeItem("solnet-motion")');

  /* ---------- 1. scroll progress ---------- */
  var bar = document.createElement('div');
  bar.className = 'fx-scroll'; bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  var ticking = false;
  function frame() {
    ticking = false;
    var y = window.scrollY || root.scrollTop;
    var max = root.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, Math.max(0, y / max)) : 0) + ')';
    if (parallaxEl && wide && y < window.innerHeight * 1.3) parallaxEl.style.translate = '0 ' + (y * 0.15).toFixed(1) + 'px';
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }

  /* ---------- 2. scroll reveal ---------- */
  var MAP = [   /* selector, animation class, delay step between siblings (s) */
    ['.section > .label, .section > h2, .section > .label-sub, .page-hero + .section .page-banner', 'fx-up', 0.09],
    ['#about > div:first-child', 'fx-left', 0.09],
    ['#location > div:last-child > *', 'fx-right', 0.11],     /* "Find us": label, title, address, contact ... one after another */
    ['#location .map-link', 'fx-up', 0.09],
    ['#location .hq-slot', 'fx-zoom', 0.09],
    ['.body-large:not(.reveal)', 'fx-up', 0.09],
    ['.gallery .image-wrapper', 'fx-wipe', 0.16],                                    /* homepage "Our work": curtain wipe with a gold scan line */
    ['.work-trio .image-wrapper, .work-quad .image-wrapper', 'fx-zoom', 0.13],        /* solar / telco work photos pop in one by one */
    ['.solar-card, .org-person, .substation-card, .load-item, .pldt-header', 'fx-up', 0.09],
    ['.cta h2', 'fx-left', 0.09], ['.cta > div', 'fx-right', 0.09],
    ['.footer-grid > div', 'fx-fade', 0.09]
  ];
  if ('IntersectionObserver' in window) {
    var counts = new Map();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('fx-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    var seen = new Set();
    MAP.forEach(function (m) {
      $$(m[0]).forEach(function (el) {
        if (seen.has(el) || el.closest('.hero, .modal, template') || el.classList.contains('reveal')) return;
        seen.add(el);
        if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;   // already on screen: leave alone
        var n = counts.get(el.parentNode) || 0; counts.set(el.parentNode, n + 1);
        el.style.setProperty('--fx-d', Math.min(n * m[2], 0.8) + 's');
        el.classList.add('fx-r', m[1]);
        io.observe(el);
      });
    });
    setTimeout(function () {                           // safety net: never leave something hidden on screen
      $$('.fx-r:not(.fx-in)').forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('fx-in');
      });
    }, 5000);
  }

  /* ---------- 3. split text on the hero heading (plain lines only; the shimmer line is left whole) ---------- */
  var h1 = $('.hero h1');
  var charTotal = 0;
  if (h1) {
    var lines = $$('.hero-line', h1).filter(function (l) { return !l.querySelector('.text-shimmer'); });
    if (lines.length) {
      h1.setAttribute('aria-label', h1.textContent.replace(/\s+/g, ' ').trim());
      lines.forEach(function (line) {
        var text = line.textContent.trim();
        line.classList.remove('hero-anim');
        line.setAttribute('aria-hidden', 'true');
        line.textContent = '';
        text.split(' ').forEach(function (word, wi, arr) {
          var w = document.createElement('span'); w.className = 'fx-word';
          word.split('').forEach(function (ch) {
            var c = document.createElement('span'); c.className = 'fx-ch'; c.textContent = ch;
            c.style.setProperty('--c', charTotal++); w.appendChild(c);
          });
          line.appendChild(w);
          if (wi < arr.length - 1) line.appendChild(document.createTextNode(' '));
        });
      });
      var rest = $$('.hero-line.hero-anim', h1);       // gold shimmer lines enter after the letters, one after another
      rest.forEach(function (l, k) { l.style.setProperty('--i', 5 + k); });
      var lead0 = $('.hero .lead'), row = $('.hero .btn-row');
      if (lead0) lead0.style.setProperty('--i', 6 + rest.length);
      if (row) row.style.setProperty('--i', 7 + rest.length);
    }
  }

  /* ---------- 4. typewriter on the hero subtitle (same words, nothing invented) ---------- */
  var lead = $('.hero .lead');
  if (lead) {
    var full = lead.textContent.replace(/\s+/g, ' ').trim();
    lead.style.minHeight = lead.offsetHeight + 'px';  // no layout jump while typing
    lead.textContent = '';
    var sr = document.createElement('span'); sr.className = 'fx-sr'; sr.textContent = full;
    var vis = document.createElement('span'); vis.setAttribute('aria-hidden', 'true');
    var caret = document.createElement('span'); caret.className = 'fx-caret'; caret.setAttribute('aria-hidden', 'true');
    lead.appendChild(sr); lead.appendChild(vis); lead.appendChild(caret);
    var t0 = null, START = h1 && charTotal ? 1500 : 900, SPEED = 26;
    (function type(now) {
      if (t0 === null || root.classList.contains('intro-on')) t0 = now;   // wait while the homepage intro is showing
      var n = Math.floor((now - t0 - START) / SPEED);
      if (n > 0) vis.textContent = full.slice(0, Math.min(n, full.length));
      if (n < full.length) requestAnimationFrame(type);
      else setTimeout(function () { caret.remove(); }, 1800);
    })(performance.now());
  }

  /* ---------- 5. parallax (hero glow layer only, desktop) ---------- */
  var parallaxEl = $('.hero-grid-lines');
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { wide = window.matchMedia('(min-width: 900px)').matches; onScroll(); });
  frame();

  if (!fine) return;                                   /* touch devices stop here */

  /* ---------- 6. magnetic primary buttons (hero + CTA only) ---------- */
  var mags = $$('.hero .btn-primary, .cta .btn-primary').map(function (el) {
    el.classList.add('fx-mag'); return { el: el, x: 0, y: 0, tx: 0, ty: 0 };
  });
  var magRun = false, px = -999, py = -999, magQueued = false;
  function magTick() {
    var moving = false;
    mags.forEach(function (m) {
      m.x += (m.tx - m.x) * 0.18; m.y += (m.ty - m.y) * 0.18;
      if (Math.abs(m.tx - m.x) < 0.05 && Math.abs(m.ty - m.y) < 0.05) { m.x = m.tx; m.y = m.ty; } else moving = true;
      m.el.style.translate = (m.x || m.y) ? m.x.toFixed(2) + 'px ' + m.y.toFixed(2) + 'px' : '';
    });
    if (moving) requestAnimationFrame(magTick); else magRun = false;
  }
  function magUpdate() {
    magQueued = false;
    mags.forEach(function (m) {
      var r = m.el.getBoundingClientRect(), pad = 70;
      var near = px > r.left - pad && px < r.right + pad && py > r.top - pad && py < r.bottom + pad;
      m.tx = near ? Math.max(-10, Math.min(10, (px - (r.left + r.width / 2)) * 0.25)) : 0;
      m.ty = near ? Math.max(-8, Math.min(8, (py - (r.top + r.height / 2)) * 0.25)) : 0;
    });
    if (!magRun) { magRun = true; requestAnimationFrame(magTick); }
  }

  /* ---------- 7. 3D tilt on service cards ---------- */
  $$('.service-card').forEach(function (card) {
    card.classList.add('fx-tilt');
    card.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--ry', (x * 8).toFixed(2) + 'deg');
      card.style.setProperty('--rx', (-y * 6).toFixed(2) + 'deg');
    });
    card.addEventListener('pointerleave', function () {
      card.style.setProperty('--ry', '0deg'); card.style.setProperty('--rx', '0deg');
    });
  });

  /* ---------- 8. cursor accents: gold dot + lagging ring. The real cursor stays visible. ---------- */
  var dot = document.createElement('div'), ring = document.createElement('div');
  dot.className = 'fx-dot'; ring.className = 'fx-ring';
  dot.setAttribute('aria-hidden', 'true'); ring.setAttribute('aria-hidden', 'true');
  document.body.appendChild(dot); document.body.appendChild(ring);
  var cx = 0, cy = 0, rx = 0, ry = 0, cRun = false;
  function cTick() {
    rx += (cx - rx) * 0.16; ry += (cy - ry) * 0.16;
    ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)';
    if (Math.abs(cx - rx) > 0.2 || Math.abs(cy - ry) > 0.2) requestAnimationFrame(cTick); else cRun = false;
  }
  var LINKS = 'a,button,[data-modal],[data-zoom],.tab,.service-card,.expand-btn,input,select,textarea,summary';
  document.addEventListener('pointermove', function (e) {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    px = cx = e.clientX; py = cy = e.clientY;
    root.classList.add('fx-cursor-on');
    dot.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
    ring.classList.toggle('fx-link', !!(e.target.closest && e.target.closest(LINKS)));
    if (!cRun) { cRun = true; requestAnimationFrame(cTick); }
    if (!magQueued) { magQueued = true; requestAnimationFrame(magUpdate); }
  }, { passive: true });
  document.addEventListener('pointerleave', function () { root.classList.remove('fx-cursor-on'); px = py = -999; magUpdate(); });
  document.addEventListener('mouseleave', function () { root.classList.remove('fx-cursor-on'); });
})();