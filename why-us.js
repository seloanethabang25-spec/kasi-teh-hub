// Kasi Tech Hub — Why Choose Us page
// Staggers the fade-in of the benefit cards so they reveal one after
// another rather than all appearing at once.
(function () {
  var items = document.querySelectorAll('.benefit-item');
  if (!items.length) return;

  items.forEach(function (item, index) {
    item.style.transitionDelay = (index * 80) + 'ms';
  });
})();
