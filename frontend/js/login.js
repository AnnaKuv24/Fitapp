/* login.js */
'use strict';

if (Auth.isLoggedIn()) window.location.href = 'dashboard.html';

document.addEventListener('DOMContentLoaded', () => {
  const loginTab     = document.getElementById('loginTab');
  const registerTab  = document.getElementById('registerTab');
  const loginForm    = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  // Tab switching
  loginTab.addEventListener('click', () => {
    loginTab.classList.add('active'); registerTab.classList.remove('active');
    loginForm.classList.remove('hidden'); registerForm.classList.add('hidden');
  });
  registerTab.addEventListener('click', () => {
    registerTab.classList.add('active'); loginTab.classList.remove('active');
    registerForm.classList.remove('hidden'); loginForm.classList.add('hidden');
  });

  // Password toggle
  document.getElementById('toggleLoginPw')?.addEventListener('click', function () {
    const input = document.getElementById('loginPassword');
    input.type = input.type === 'password' ? 'text' : 'password';
  });

  // ── Demo-mode session helper (used ONLY when the backend is unreachable) ──
  // Виразно позначаємо сесію як демо-режим, щоб користувач не сприймав її
  // як справжній обліковий запис (дані не зберігаються на сервері).
  function demoSession(name, email) {
    const user = { ...MOCK.user, name: name || MOCK.user.name, email: email || MOCK.user.email, _demo: true };
    localStorage.setItem('fitapp_access',  'demo_token');
    localStorage.setItem('fitapp_refresh', 'demo_refresh');
    localStorage.setItem('fitapp_user',    JSON.stringify(user));
  }

  function showDemoNotice() {
    window.alert('Сервер недоступний. Увімкнено демонстраційний режим — дані не зберігаються.');
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn     = document.getElementById('loginBtn');
    const spinner = document.getElementById('loginSpinner');
    const error   = document.getElementById('loginError');
    error.classList.add('hidden');
    btn.disabled = true; spinner.classList.remove('hidden');

    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
      await Auth.login(email, password);
    } catch (err) {
      if (err.isNetworkError) {
        // Бекенд недоступний — явно повідомляємо й вмикаємо демо-режим,
        // а не мовчки авторизуємо будь-який пароль довжиною ≥ 8 символів.
        showDemoNotice();
        demoSession(email.split('@')[0], email);
      } else {
        error.textContent = err.message || 'Невірний email або пароль';
        error.classList.remove('hidden');
        btn.disabled = false; spinner.classList.add('hidden');
        return;
      }
    }

    window.location.href = 'dashboard.html';
  });

  // ── Register ──────────────────────────────────────────────────────────────
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn     = document.getElementById('regBtn');
    const spinner = document.getElementById('regSpinner');
    const error   = document.getElementById('regError');
    error.classList.add('hidden');
    btn.disabled = true; spinner.classList.remove('hidden');

    const name     = document.getElementById('regName').value.trim();
    const email    = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const goal     = document.getElementById('regGoal').value;

    // Базова валідація
    if (!name) {
      error.textContent = 'Введіть своє ім\'я';
      error.classList.remove('hidden');
      btn.disabled = false; spinner.classList.add('hidden');
      return;
    }
    if (password.length < 8) {
      error.textContent = 'Пароль має містити мінімум 8 символів';
      error.classList.remove('hidden');
      btn.disabled = false; spinner.classList.add('hidden');
      return;
    }

    try {
      await Auth.register(name, email, password, goal);
    } catch (err) {
      if (err.isNetworkError) {
        showDemoNotice();
        demoSession(name, email);
      } else {
        error.textContent = err.message || 'Помилка реєстрації';
        error.classList.remove('hidden');
        btn.disabled = false; spinner.classList.add('hidden');
        return;
      }
    }

    window.location.href = 'dashboard.html';
  });
});
