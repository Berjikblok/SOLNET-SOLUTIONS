/* UI enhancements shared by every page. Reuses the existing nav toggle (no second toggle handler).
   1) active nav indicator  2) mobile menu closes after choosing a link + accessible label
   3) short page fade when moving between pages.
   Usage: <script src="js/ui-enhance.js"></script>  (pages/: ../js/ui-enhance.js) */
(function () {
  if (window.__solnetUi) return;
  window.__solnetUi = true;

  var reduce = (window.matchMedia('(prefers-reduced-motion: reduce)').matches && !(function(){try{return localStorage.getItem('solnet-motion')==='on'}catch(e){return false}})());
  var toggle = document.querySelector('.nav-toggle');
  var links = [].slice.call(document.querySelectorAll('.nav-links a'));

  function stripIndex(p) { return p.replace(/index\.html$/, ''); }
  function parse(a) { try { return new URL(a.href, location.href); } catch (e) { return null; } }

  /* ---------- 1. active nav link (aria-current + underline, not color alone) ---------- */
  var spy = [];
  links.forEach(function (a) {
    var u = parse(a);
    if (!u || stripIndex(u.pathname) !== stripIndex(location.pathname)) return;
    if (u.hash && u.hash.length > 1) {
      var el = document.getElementById(u.hash.slice(1));
      if (el) spy.push({ a: a, el: el });
    } else {
      a.setAttribute('aria-current', 'page');       // a page link pointing at this very page
    }
  });

  var ticking = false;
  function updateActive() {
    ticking = false;
    if (!spy.length) return;
    var y = window.scrollY + 120;
    var sorted = spy.slice().sort(function (p, q) {
      return p.el.getBoundingClientRect().top - q.el.getBoundingClientRect().top;
    });
    var cur = sorted[0];
    sorted.forEach(function (s) {
      if (s.el.getBoundingClientRect().top + window.scrollY <= y) cur = s;
    });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      cur = sorted[sorted.length - 1];
    }
    spy.forEach(function (s) {
      if (s === cur) s.a.setAttribute('aria-current', 'location');
      else s.a.removeAttribute('aria-current');
    });
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(updateActive); }
  }
  if (spy.length) {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('load', updateActive);
    updateActive();
  }

  /* ---------- 2. mobile menu ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.nav-links a');
    if (!a || !toggle) return;
    setTimeout(function () {                       // after the page's own handlers ran
      if (toggle.getAttribute('aria-expanded') === 'true') toggle.click();
    }, 0);
  });
  if (toggle && window.MutationObserver) {
    var sync = function () {
      toggle.setAttribute('aria-label',
        toggle.getAttribute('aria-expanded') === 'true' ? 'Close menu' : 'Open menu');
    };
    new MutationObserver(sync).observe(toggle, { attributes: true, attributeFilter: ['aria-expanded'] });
    sync();
  }

  /* ---------- 3. page transition (fade out ~220 ms, new page fades in via CSS) ---------- */
  document.addEventListener('click', function (e) {
    if (reduce || e.defaultPrevented || e.button !== 0 ||
        e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target || a.hasAttribute('download') || a.hasAttribute('data-package')) return;
    var u = parse(a);
    if (!u || u.origin !== location.origin || !/(\.html?|\/)$/.test(u.pathname)) return;
    if (u.pathname === location.pathname && u.search === location.search) return;   // same page / hash jump
    e.preventDefault();
    document.body.classList.add('page-leaving');
    setTimeout(function () { window.location.href = a.href; }, 220);
    setTimeout(function () { document.body.classList.remove('page-leaving'); }, 2000);  // failsafe
  });
  window.addEventListener('pageshow', function () {
    document.body.classList.remove('page-leaving');   // coming back with the Back button
  });
})();