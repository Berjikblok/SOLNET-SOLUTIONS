/* DIAGNOSTIC ONLY (optional). Add <script src="../js/img-check.js"></script> to a page, open it, then look at the
   browser Console. It reports images that failed to load, and images that are hidden or have no size.
   Remove the script tag when you're done. */
(function () {
  function hiddenReason(el) {
    for (var n = el; n && n.nodeType === 1; n = n.parentElement) {
      var s = getComputedStyle(n);
      if (s.display === 'none') return 'display:none on ' + describe(n);
      if (s.visibility === 'hidden') return 'visibility:hidden on ' + describe(n);
      if (parseFloat(s.opacity) < 0.05) return 'opacity:0 on ' + describe(n);
    }
    var r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return 'zero size (' + Math.round(r.width) + 'x' + Math.round(r.height) + ')';
    return '';
  }
  function describe(n) {
    return n.tagName.toLowerCase() + (n.id ? '#' + n.id : '') +
      (n.className && typeof n.className === 'string' ? '.' + n.className.trim().split(/\s+/).join('.') : '');
  }
  function run() {
    var rows = [];
    [].forEach.call(document.images, function (img) {
      var broken = img.complete && img.naturalWidth === 0;
      var why = hiddenReason(img);
      if (broken || why) rows.push({ src: img.getAttribute('src'), resolved: img.src, problem: broken ? 'FAILED TO LOAD (wrong path or file name?)' : why });
    });
    console.log('[img-check] ' + document.images.length + ' images checked, ' + rows.length + ' problem(s)');
    if (rows.length) console.table(rows);
    var stuck = [].filter.call(document.querySelectorAll('.reveal'), function (el) {
      return parseFloat(getComputedStyle(el).opacity) < 0.05 && el.getBoundingClientRect().top < window.innerHeight;
    });
    if (stuck.length) console.warn('[img-check] .reveal elements still invisible inside the viewport:', stuck);
  }
  window.addEventListener('load', function () { setTimeout(run, 1500); });
})();