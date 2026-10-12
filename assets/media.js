/* Media page filters. */
(function () {
  'use strict';
  function bind(barId, attr, items, key) {
    var bar = document.getElementById(barId); if (!bar) return;
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var v = b.getAttribute(attr);
      bar.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      document.querySelectorAll(items).forEach(function (el) { el.hidden = !(v === 'all' || el.getAttribute(key) === v); });
    });
  }
  bind('vid-filter', 'data-g', '.vid-section', 'data-group');
  bind('fig-filter', 'data-c', '#gallery > figure', 'data-cat');
})();
