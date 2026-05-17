(function () {
  'use strict';

  var STORAGE_THEME = 'ac-theme';
  var STORAGE_ACCENT = 'ac-accent';
  var root = document.documentElement;

  function setTheme(mode) {
    root.dataset.theme = mode;
    try { localStorage.setItem(STORAGE_THEME, mode); } catch (e) {}
  }

  function setAccent(name) {
    root.dataset.accent = name;
    try { localStorage.setItem(STORAGE_ACCENT, name); } catch (e) {}
    document.querySelectorAll('.accent-picker .swatch').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.dataset.accent === name ? 'true' : 'false');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setAccent(root.dataset.accent || 'purple');

    var toggle = document.querySelector('[data-mode-toggle]');
    if (toggle) {
      toggle.addEventListener('click', function () {
        setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
      });
    }

    document.querySelectorAll('.accent-picker .swatch').forEach(function (btn) {
      btn.addEventListener('click', function () { setAccent(btn.dataset.accent); });
    });
  });
})();
