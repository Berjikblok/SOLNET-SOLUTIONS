/* Animated network background (single canvas, single animation loop).
   Nodes drift slowly, nearby nodes are joined by thin semi-transparent lines,
   and occasional pulses travel along a line and ping the node they reach.
   Palette: muted blue + soft white, with a few gold nodes. Sits behind all content.
   Usage: <script src="js/background.js"></script>  (pages/: ../js/background.js) */
(function () {
  if (window.__solnetNetworkBg) return;          // never start a second loop
  window.__solnetNetworkBg = true;

  var canvas = document.getElementById('bg-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'bg-canvas';
    document.body.insertBefore(canvas, document.body.firstChild);
  }
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0';

  var ctx = canvas.getContext('2d');
  var reduce = (window.matchMedia('(prefers-reduced-motion: reduce)').matches && !(function(){try{return localStorage.getItem('solnet-motion')==='on'}catch(e){return false}})());

  var BLUE = '124,158,208', WHITE = '220,230,245', GOLD = '201,168,76';
  var MARGIN = 30;
  var w = 0, h = 0, dpr = 1, link = 150;
  var nodes = [], pulses = [], rings = [];
  var last = 0, raf = null, nextPulse = 0, resizeTimer = null;

  function rand(a, b) { return a + Math.random() * (b - a); }

  function targetCount() {
    var n = Math.round((w * h) / 22000);
    return Math.max(24, Math.min(w < 700 ? 34 : 72, n));
  }

  function makeNode(x, y) {
    var gold = Math.random() < 0.16;
    return {
      x: x, y: y,
      vx: rand(-0.015, 0.015), vy: rand(-0.015, 0.015),   // px per ms (slow)
      r: gold ? 1.8 : rand(1.1, 1.9),
      gold: gold,
      phase: rand(0, Math.PI * 2)
    };
  }

  function resize() {
    var oldW = w, oldH = h;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = window.innerWidth;
    h = window.innerHeight;
    link = w < 700 ? 110 : 150;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (oldW && oldH) {                       // keep the network, just rescale it
      for (var i = 0; i < nodes.length; i++) {
        nodes[i].x *= w / oldW;
        nodes[i].y *= h / oldH;
      }
    }
    var want = targetCount();
    while (nodes.length < want) nodes.push(makeNode(rand(0, w), rand(0, h)));
    if (nodes.length > want) nodes.length = want;
    pulses.length = 0;
    rings.length = 0;
    if (reduce) drawFrame(0, false);
  }

  function lineColor(a, b, alpha) {
    var c = a.gold && b.gold ? GOLD : BLUE;
    return 'rgba(' + c + ',' + alpha.toFixed(3) + ')';
  }

  function spawnPulse(t) {
    if (pulses.length >= 5 || !nodes.length) return;
    var a = nodes[(Math.random() * nodes.length) | 0];
    var near = [];
    for (var i = 0; i < nodes.length; i++) {
      var b = nodes[i];
      if (b === a) continue;
      var dx = a.x - b.x, dy = a.y - b.y;
      if (dx * dx + dy * dy < link * link) near.push(b);
    }
    if (!near.length) return;
    pulses.push({ a: a, b: near[(Math.random() * near.length) | 0], start: t, dur: rand(1100, 1700) });
  }

  function drawFrame(t, animate) {
    ctx.clearRect(0, 0, w, h);
    var i, j, a, b, dx, dy, d2, d, alpha;

    // lines
    ctx.lineWidth = 0.8;
    for (i = 0; i < nodes.length; i++) {
      a = nodes[i];
      for (j = i + 1; j < nodes.length; j++) {
        b = nodes[j];
        dx = a.x - b.x; dy = a.y - b.y; d2 = dx * dx + dy * dy;
        if (d2 < link * link) {
          d = Math.sqrt(d2);
          alpha = (1 - d / link) * 0.15;
          ctx.strokeStyle = lineColor(a, b, alpha);
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }

    // nodes
    for (i = 0; i < nodes.length; i++) {
      a = nodes[i];
      var tw = animate ? 0.5 + 0.15 * Math.sin(t / 1800 + a.phase) : 0.5;
      ctx.fillStyle = 'rgba(' + (a.gold ? GOLD : WHITE) + ',' + (a.gold ? tw + 0.15 : tw).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
    }

    if (!animate) return;

    // pulses travelling along a line
    for (i = pulses.length - 1; i >= 0; i--) {
      var p = pulses[i], k = (t - p.start) / p.dur;
      if (k >= 1) {
        rings.push({ n: p.b, start: t, dur: 1800 });
        pulses.splice(i, 1);
        continue;
      }
      var px = p.a.x + (p.b.x - p.a.x) * k, py = p.a.y + (p.b.y - p.a.y) * k;
      var fade = Math.sin(Math.PI * k);
      var g = ctx.createRadialGradient(px, py, 0, px, py, 8);
      g.addColorStop(0, 'rgba(' + GOLD + ',' + (0.6 * fade).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(' + GOLD + ',0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2); ctx.fill();
    }

    // soft rings where a pulse arrived
    for (i = rings.length - 1; i >= 0; i--) {
      var r = rings[i], q = (t - r.start) / r.dur;
      if (q >= 1) { rings.splice(i, 1); continue; }
      ctx.strokeStyle = 'rgba(' + GOLD + ',' + (0.3 * (1 - q)).toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(r.n.x, r.n.y, 2 + 14 * q, 0, Math.PI * 2); ctx.stroke();
    }
  }

  function frame(t) {
    var dt = Math.min(50, t - last);          // capped so it never jumps after a pause
    last = t;
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.x += n.vx * dt; n.y += n.vy * dt;
      if (n.x < -MARGIN) n.x = w + MARGIN; else if (n.x > w + MARGIN) n.x = -MARGIN;
      if (n.y < -MARGIN) n.y = h + MARGIN; else if (n.y > h + MARGIN) n.y = -MARGIN;
    }
    if (t >= nextPulse) { spawnPulse(t); nextPulse = t + rand(700, 1800); }
    drawFrame(t, true);
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (reduce || raf !== null) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    if (raf !== null) { cancelAnimationFrame(raf); raf = null; }
  }

  resize();
  start();

  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });
})();