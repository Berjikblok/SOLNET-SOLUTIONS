/* Schedule of Loads: show / hide each embedded sheet. Loaded only on pages/schedule-of-loads.html */
(function () {
  document.querySelectorAll('.load-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (!panel) return;
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', open);
      btn.textContent = open ? 'HIDE SHEET' : 'VIEW SHEET';
      panel.hidden = !open;
    });
  });
})();