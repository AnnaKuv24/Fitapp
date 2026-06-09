/* theme.js — перемикання між світлою та темною темою */
(function () {
  'use strict';
  var STORAGE_KEY = 'fitapp_theme';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
  }
  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }
  function setTheme(theme) {
    applyTheme(theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch {}
    document.querySelectorAll('.theme-toggle').forEach(updateToggleUI);
  }
  function toggleTheme() {
    setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  }
  function updateToggleUI(btn) {
    var dark = currentTheme() === 'dark';
    btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    var label = btn.querySelector('.theme-toggle__label');
    if (label) label.textContent = dark ? 'Темна тема' : 'Світла тема';
  }

  // Застосувати збережену (або системну) тему якнайшвидше, щоб уникнути "спалаху" світлої теми.
  var stored;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch { stored = null; }
  var preferred = stored || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(preferred);

  window.Theme = { toggle: toggleTheme, set: setTheme, current: currentTheme };

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      updateToggleUI(btn);
      btn.addEventListener('click', toggleTheme);
    });
  });
})();
