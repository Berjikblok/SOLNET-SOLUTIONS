/* Click / interaction transitions. One script, loaded on every page, after ui-enhance.js.
   - ripple on buttons, cards, tabs and nav links
   - the section you jump to (#about, #solutions ...) eases in once the scroll settles
   - content inside a popup (modal) fades up one block after another
   - thin gold progress bar while leaving the page (the fade itself lives in ui-enhance.js)
   The hero entrance animation is pure CSS (.hero-anim in style.css), so it still plays if JS fails.
   Everything respects prefers-reduced-motion. */
(function () {
  if (window.__solnetMotion) return;
  window.__solnetMotion = true;

  var reduce = (window.matchMedia('(prefers-reduced-motion: reduce)').matches && !(function(){try{return localStorage.getItem('solnet-motion')==='on'}catch(e){return false}})());
  if (reduce) return;

  var EASE = 'cubic-bezier(.22,.61,.36,1)';

  /* ---------- 1. ripple ---------- */
  var RIPPLE_TARGETS = '.btn,.service-card,.tab,.expand-btn,.nav-links a';
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest(RIPPLE_TARGETS);
    if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return;
    var r = el.getBoundingClientRect();
    var keyboard = e.detail === 0 || (!e.clientX && !e.clientY);
    var x = keyboard ? r.width / 2 : e.clientX - r.left;
    var y = keyboard ? r.height / 2 : e.clientY - r.top;
    var d = Math.max(r.width, r.height) * 2;
    var s = document.createElement('span');
    s.className = 'ripple';
    s.setAttribute('aria-hidden', 'true');
    s.style.cssText = 'width:' + d + 'px;height:' + d + 'px;left:' + (x - d / 2) + 'px;top:' + (y - d / 2) + 'px';
    el.classList.add('has-ripple');
    el.appendChild(s);
    setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 650);
  }, true);

  /* ---------- 2. section "arrives" after an in-page jump ---------- */
  function settle(cb) {
    var finished = false, timer, started = Date.now();
    function done() {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      cb();
    }
    function onScroll() {
      clearTimeout(timer);
      timer = setTimeout(done, 130);
      if (Date.now() - started > 1800) done();
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    timer = setTimeout(done, 350);                 // no scroll happened (already there)
  }
  function arrive(el) {
    if (!el || el.tagName === 'MAIN') return;
    el.classList.remove('arrive');
    void el.offsetWidth;                            // restart the animation
    el.classList.add('arrive');
    setTimeout(function () { el.classList.remove('arrive'); }, 850);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.hasAttribute('data-package')) return;
    var u;
    try { u = new URL(a.href, location.href); } catch (err) { return; }
    if (!u.hash || u.hash.length < 2 || u.origin !== location.origin || u.pathname !== location.pathname) return;
    var target = document.getElementById(u.hash.slice(1));
    if (target) settle(function () { arrive(target); });
  });
  if (location.hash.length > 1) {                   // arrived from another page, e.g. index.html#solutions
    window.addEventListener('load', function () {
      var t = document.getElementById(location.hash.slice(1));
      if (t) settle(function () { arrive(t); });
    });
  }

  /* ---------- 3. popup content fades up block by block ---------- */
  var modal = document.getElementById('modal');
  if (modal && window.MutationObserver) {
    var body = modal.querySelector('.modal-body');
    var pending = false;
    var run = function () {
      pending = false;
      if (!body || !modal.classList.contains('open')) return;
      [].slice.call(body.children).forEach(function (el, i) {
        if (!el.animate) return;
        el.animate(
          [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }],
          { duration: 420, delay: 80 + i * 70, easing: EASE, fill: 'backwards' }
        );
      });
    };
    var schedule = function () {
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () { requestAnimationFrame(run); });
    };
    new MutationObserver(schedule).observe(modal, { attributes: true, attributeFilter: ['class', 'hidden'] });
    if (body) new MutationObserver(schedule).observe(body, { childList: true });
  }

  /* ---------- 4. progress bar while the page fades out ---------- */
  if (window.MutationObserver) {
    new MutationObserver(function () {
      var leaving = document.body.classList.contains('page-leaving');
      var bar = document.querySelector('.page-progress');
      if (leaving && !bar) {
        bar = document.createElement('div');          // on <html>, so the body fade doesn't hide it
        bar.className = 'page-progress';
        document.documentElement.appendChild(bar);
        requestAnimationFrame(function () { requestAnimationFrame(function () { bar.style.width = '100%'; }); });
      } else if (!leaving && bar) {
        bar.parentNode.removeChild(bar);
      }
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }
})();