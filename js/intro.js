/* SOLNET INTRO (js/intro.js) - homepage only, pairs with css/intro.css.
   The intro markup sits at the top of <body> in index.html, and a tiny inline script there already
   removes it when it should not play (seen this visit, reduce motion, ?package= or #section links).
   This file builds the 3D depth layers and ends the intro after about 3 seconds,
   or right away on click, the SKIP button, Esc, Enter or Space. */
(function () {
  var intro = document.getElementById('solnet-intro');
  if (!intro || window.__solnetIntro) return;
  window.__solnetIntro = true;

  var DURATION = 3000;          // ms the intro stays before it zooms away
  var LAYERS = 10;              // how many copies make the logo's thickness
  var GAP = 1.6;                // px between copies (LAYERS x GAP = thickness)

  /* depth: darker copies of the logo pushed back in 3D space */
  var box = intro.querySelector('.intro-logo');
  var front = box && box.querySelector('.intro-front');
  if (front) {
    for (var i = LAYERS; i >= 1; i--) {
      var c = front.cloneNode(false);
      c.className = 'intro-depth';
      c.alt = ''; c.setAttribute('aria-hidden', 'true');
      c.style.transform = 'translateZ(' + (-i * GAP) + 'px)';
      box.insertBefore(c, front);
    }
  }

  var done = false;
  function finish() {
    if (done) return;
    done = true;
    try { sessionStorage.setItem('solnet-intro', '1'); } catch (e) {}
    intro.classList.add('intro-out');
    document.documentElement.classList.remove('intro-on');   // hero entrance starts now
    setTimeout(function () { if (intro.parentNode) intro.parentNode.removeChild(intro); }, 750);
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e) {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); finish(); }
  }

  intro.addEventListener('click', finish);
  document.addEventListener('keydown', onKey);
  var skip = intro.querySelector('.intro-skip');
  if (skip) skip.focus({ preventScroll: true });

  /* start the timer once the logo image is ready (or failed), so it never ends before it was seen */
  function start() { setTimeout(finish, DURATION); }
  if (!front || front.complete) start();
  else { front.addEventListener('load', start, { once: true }); front.addEventListener('error', start, { once: true }); }
  setTimeout(finish, DURATION + 4000);   // safety net: slow connection
})();