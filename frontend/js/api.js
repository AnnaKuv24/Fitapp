/* api.js — FitApp REST Client with JWT auto-refresh */
'use strict';

// In production (GitHub Pages), update TUNNEL_URL to the active tunnel address.
// On localhost, the local backend is used automatically.
const TUNNEL_URL = 'https://6e6634010763f8.lhr.life/api/v1';
const BASE_URL = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
  ? 'http://localhost:8080/api/v1'
  : TUNNEL_URL;

// ── Token helpers ─────────────────────────────────────────────────────────────
const Token = {
  get access()  { return localStorage.getItem('fitapp_access'); },
  get refresh() { return localStorage.getItem('fitapp_refresh'); },
  set(access, refresh) {
    localStorage.setItem('fitapp_access',  access);
    localStorage.setItem('fitapp_refresh', refresh);
  },
  clear() {
    localStorage.removeItem('fitapp_access');
    localStorage.removeItem('fitapp_refresh');
    localStorage.removeItem('fitapp_user');
  }
};

// ── Core request ──────────────────────────────────────────────────────────────
async function request(method, path, body = null, retry = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (Token.access) headers['Authorization'] = `Bearer ${Token.access}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(BASE_URL + path, opts);

  if (res.status === 401 && retry) {
    const ok = await _refreshTokens();
    if (ok) return request(method, path, body, false);
    Token.clear();
    window.location.href = 'login.html';
    return;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new Error(err.message || 'Помилка запиту');
  }

  if (res.status === 204) return null;
  return res.json();
}

async function _refreshTokens() {
  if (!Token.refresh) return false;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: Token.refresh })
    });
    if (!res.ok) return false;
    const data = await res.json();
    Token.set(data.accessToken, data.refreshToken);
    return true;
  } catch { return false; }
}

// ── Auth API ──────────────────────────────────────────────────────────────────
const Auth = {
  async login(email, password) {
    let res;
    try {
      res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
    } catch (e) {
      throw Object.assign(new Error('Сервер недоступний'), { isNetworkError: true });
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Невірні облікові дані');
    }
    const data = await res.json();
    Token.set(data.accessToken, data.refreshToken);
    localStorage.setItem('fitapp_user', JSON.stringify(data.user));
    return data;
  },

  async register(name, email, password, goal) {
    let res;
    try {
      res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, goal })
      });
    } catch (e) {
      throw Object.assign(new Error('Сервер недоступний'), { isNetworkError: true });
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Помилка реєстрації');
    }
    const data = await res.json();
    Token.set(data.accessToken, data.refreshToken);
    localStorage.setItem('fitapp_user', JSON.stringify(data.user));
    return data;
  },

  logout() { Token.clear(); window.location.href = 'login.html'; },

  getUser() {
    try { return JSON.parse(localStorage.getItem('fitapp_user')); }
    catch { return null; }
  },

  isLoggedIn() { return !!Token.access; }
};

// ── Workout Plans API ─────────────────────────────────────────────────────────
const Plans = {
  getAll:  ()   => request('GET',  '/workout-plans'),
  getById: (id) => request('GET',  `/workout-plans/${id}`),
  create:  (d)  => request('POST', '/workout-plans', d),
  update:  (id, d) => request('PUT', `/workout-plans/${id}`, d),
  delete:  (id) => request('DELETE', `/workout-plans/${id}`),
};

// ── Exercises API ─────────────────────────────────────────────────────────────
const Exercises = {
  getAll:    (muscle) => request('GET', '/exercises' + (muscle ? `?muscle=${muscle}` : '')),
  getById:   (id) => request('GET', `/exercises/${id}`),
  create:    (d)  => request('POST', '/exercises', d),
  update:    (id, d) => request('PUT', `/exercises/${id}`, d),
  delete:    (id) => request('DELETE', `/exercises/${id}`),
};

// ── Workout Session API ───────────────────────────────────────────────────────
const Workout = {
  start:    (planId) => request('POST', '/workout/start',  { planId }),
  logSet:   (data)   => request('POST', '/workout/set',    data),
  finish:   (logId)  => request('POST', '/workout/finish', { workoutLogId: logId }),
  deleteLog: (id)    => request('DELETE', `/workout/log/${id}`),
};

// ── Progress API ──────────────────────────────────────────────────────────────
const Progress = {
  getStats:   (period = 'week') => request('GET', `/progress?period=${period}`),
  getRecords: ()                => request('GET', '/progress/records'),
  getHistory: ()                => request('GET', '/progress/history'),
};

// ── Profile API ───────────────────────────────────────────────────────────────
const Profile = {
  get:    ()    => request('GET', '/profile'),
  update: (d)   => request('PUT', '/profile', d),
};

// ── Subscription API ──────────────────────────────────────────────────────────
const Subscription = {
  purchase: (planType) => request('POST', '/subscription/purchase', { planType }),
  cancel:   ()         => request('DELETE', '/subscription'),
};

// ── Mock data (used when backend is not running) ──────────────────────────────
const MOCK = {
  user: { id: 1, name: 'Анна Куварзіна', email: 'demo@fitapp.com', role: 'USER', subscription: 'FREE' },
  stats: { totalWorkouts: 12, totalVolumeKg: 18450, streak: 5, newPRs: 3 },
  plans: [
    { id: 1, name: 'Сила та маса', description: 'Програма для набору м\'язової маси', level: 'intermediate', goal: 'MUSCLE_GAIN', emoji: '💪', color: 'blue', exerciseCount: 6 },
    { id: 2, name: 'Full Body', description: 'Тренування всього тіла 3 рази на тиждень', level: 'beginner', goal: 'MAINTENANCE', emoji: '🏃', color: 'green', exerciseCount: 8 },
    { id: 3, name: 'PPL Split', description: 'Push Pull Legs — 6 днів на тиждень', level: 'advanced', goal: 'MUSCLE_GAIN', emoji: '🔥', color: 'purple', exerciseCount: 10 },
  ],
  planDetail: {
    1: {
      id: 1, name: 'Сила та маса', exercises: [
        { id: 1, name: 'Жим лежачи', sets: 4, reps: 8, restSeconds: 120, muscleGroup: 'Груди', description: 'Класична вправа для розвитку грудних м\'язів. Лягти на лаву, ширина хвату — трохи ширша за плечі.' },
        { id: 2, name: 'Присідання зі штангою', sets: 4, reps: 6, restSeconds: 150, muscleGroup: 'Ноги', description: 'Базова вправа для квадрицепсів, сідниць та попереку.' },
        { id: 3, name: 'Тяга верхнього блоку', sets: 3, reps: 10, restSeconds: 90, muscleGroup: 'Спина', description: 'Вправа для широчайших м\'язів спини.' },
      ]
    }
  },
  recentWorkouts: [
    { id: 10, planName: 'Сила та маса', finishedAt: '2026-06-06T18:30:00', durationMin: 55, totalVolumeKg: 2100 },
    { id: 9,  planName: 'Full Body',    finishedAt: '2026-06-04T17:00:00', durationMin: 48, totalVolumeKg: 1850 },
    { id: 8,  planName: 'Сила та маса', finishedAt: '2026-06-02T19:00:00', durationMin: 60, totalVolumeKg: 2250 },
  ],
  weeklyData: [
    { label: 'Пн', volume: 2100 }, { label: 'Вт', volume: 0 }, { label: 'Ср', volume: 1850 },
    { label: 'Чт', volume: 0 },    { label: 'Пт', volume: 2250 }, { label: 'Сб', volume: 0 }, { label: 'Нд', volume: 0 }
  ],
  records: [
    { id: 1, exerciseName: 'Жим лежачи', maxWeightKg: 100, achievedAt: '2026-06-06' },
    { id: 2, exerciseName: 'Присідання', maxWeightKg: 130, achievedAt: '2026-06-04' },
    { id: 3, exerciseName: 'Тяга блоку',  maxWeightKg: 85,  achievedAt: '2026-06-02' },
  ]
};

// ── Utility: show notification ────────────────────────────────────────────────
function showNotification(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `notification notification--${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300); }, 3200);
}
