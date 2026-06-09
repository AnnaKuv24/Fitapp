/* auth.js — Guard + sidebar/topbar init */
'use strict';

// ── Auth guard ────────────────────────────────────────────────────────────────
(function guard() {
  const page = window.location.pathname.split('/').pop();
  if (page === 'login.html') return;
  if (!Auth.isLoggedIn()) window.location.href = 'login.html';
})();

// ── Init UI (sidebar, topbar, avatar) ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const user = Auth.getUser() || MOCK.user;

  // User info
  const initial = (user.name || 'U')[0].toUpperCase();
  document.querySelectorAll('.avatar').forEach(el => el.textContent = initial);
  const nameEl = document.getElementById('userName');
  if (nameEl) nameEl.textContent = user.name?.split(' ')[0] || '';

  const sidebarNameEl = document.getElementById('sidebarName');
  if (sidebarNameEl) sidebarNameEl.textContent = user.name || '';

  // Subscription badge
  const badge = document.getElementById('subBadge');
  if (badge && user.subscription === 'PREMIUM') {
    badge.textContent = '⭐ PREMIUM';
    badge.classList.add('premium');
  }

  // Admin panel link (visible only to TRAINER/ADMIN)
  const nav = document.querySelector('.sidebar__nav');
  if (nav && (user.role === 'ADMIN' || user.role === 'TRAINER') && !nav.querySelector('a[href="admin.html"]')) {
    const page = window.location.pathname.split('/').pop();
    const link = document.createElement('a');
    link.href = 'admin.html';
    link.className = 'nav-item' + (page === 'admin.html' ? ' active' : '');
    link.innerHTML = `
      <svg class="nav-item__icon" viewBox="0 0 24 24"><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"/></svg>
      <span>Адмін-панель</span>`;
    nav.appendChild(link);
  }

  // Date
  const dateEl = document.getElementById('dateStr');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  // Sidebar toggle
  const sidebar   = document.getElementById('sidebar');
  const overlay   = document.getElementById('overlay');
  const burgerBtn = document.getElementById('burgerBtn');
  const closeBtn  = document.getElementById('sidebarClose');

  function openSidebar()  { sidebar?.classList.add('open');   overlay?.classList.add('show'); }
  function closeSidebar() { sidebar?.classList.remove('open'); overlay?.classList.remove('show'); }

  burgerBtn?.addEventListener('click', openSidebar);
  closeBtn?.addEventListener('click', closeSidebar);
  overlay?.addEventListener('click', closeSidebar);

  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', () => Auth.logout());
});
