/* AVAIL NOW -> package inquiry.
   Wala'y gi-pretend nga purchase/booking: ang button mag-ingon lang kung unsang package ang gipili
   ug mag-abli ug email draft padulong sa SolNet. Gamita sa index.html ug sa pages/solar.html. */
(function () {
  var EMAIL = 'SolNetSolutions@gmail.com';
  var VALID = ['Basic', 'Lite', 'Pro', 'Promax',
    'PLDT Fiber Unli 1299', 'PLDT Fiber Unli 1699', 'PLDT Fiber Unli 2099', 'PLDT Fiber Unli 2699',
    'PLDT Fiber Unli All 1399', 'PLDT Fiber Unli All 1799', 'PLDT Fiber Unli All 2499',
    'PLDT Fiber Netflix 1599', 'PLDT Fiber Netflix 2499'];
  var box = document.getElementById('inquiry');           // naa ra sa index.html
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function show(name) {
    if (!box || VALID.indexOf(name) === -1) return;
    var label = document.getElementById('inquiryPackage');
    var mail = document.getElementById('inquiryMail');
    if (label) label.textContent = name;
    if (mail) {
      var pldt = name.indexOf('PLDT') === 0;
      var subject = (pldt ? 'PLDT Package Inquiry: ' : 'Solar Package Inquiry: ') + name;
      var body = 'Hello SolNet Solutions,\n\nI would like to inquire about the ' + name +
        (pldt ? ' package.' : ' solar package.') + '\n\nName:\nContact number:\nAddress:\n\nThank you.';
      var title = document.getElementById('inquiryTitle');
      if (title) title.textContent = pldt ? 'PLDT package inquiry' : 'Solar package inquiry';
      mail.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
    }
    box.hidden = false;
    try { sessionStorage.setItem('solnetPackage', name); } catch (e) {}
  }

  function goToContact() {
    var target = document.getElementById('contact');
    if (target) target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }

  // delegated, mao nga molihok pud sa sulod sa modal (dynamic content)
  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('[data-package]') : null;
    if (btn) {
      if (!box) return;                      // sa pages/: normal link padulong sa index.html?package=...
      e.preventDefault();
      show(btn.getAttribute('data-package'));
      var close = document.querySelector('.modal.open .modal-close');
      if (close) close.click();              // isira ang modal una
      setTimeout(goToContact, close ? 450 : 0);
      return;
    }
    if (e.target.closest && e.target.closest('#inquiryClear') && box) {
      box.hidden = true;
      try { sessionStorage.removeItem('solnetPackage'); } catch (err) {}
    }
  });

  // gikan sa pages/solar.html: index.html?package=Pro#contact
  if (box) {
    var wanted = new URLSearchParams(window.location.search).get('package');
    if (wanted) {
      show(wanted);
      window.addEventListener('load', function () { setTimeout(goToContact, 150); });
    }
  }
})();