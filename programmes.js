// Kasi Tech Hub — Programmes page
// Carries the selected programme name over to the registration form.
(function () {
  var buttons = document.querySelectorAll('[data-programme]');
  if (!buttons.length) return;

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      var programme = btn.getAttribute('data-programme');
      var target = btn.getAttribute('href') || 'registration.html';
      if (!programme) return;

      e.preventDefault();
      var url = new URL(target, window.location.href);
      url.searchParams.set('programme', programme);
      window.location.href = url.toString();
    });
  });
})();
