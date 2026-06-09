/* admin.js */
'use strict';

const LEVEL_LABELS = { BEGINNER: 'Початківець', INTERMEDIATE: 'Середній', ADVANCED: 'Просунутий' };
const GOAL_LABELS  = { WEIGHT_LOSS: 'Схуднення', MUSCLE_GAIN: 'Набір м\'язів', MAINTENANCE: 'Підтримка форми', ENDURANCE: 'Витривалість' };

// ── Guard: only TRAINER/ADMIN may see this page ──────────────────────────────
(function adminGuard() {
  const user = Auth.getUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'TRAINER')) {
    window.location.href = 'dashboard.html';
  }
})();

let exercises = [];
let plans = [];

document.addEventListener('DOMContentLoaded', async () => {
  initTabs();
  initExerciseModal();
  initPlanModal();
  await Promise.all([loadExercises(), loadPlans()]);
});

// ── Tabs ──────────────────────────────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      document.getElementById('tabExercises').classList.toggle('hidden', target !== 'exercises');
      document.getElementById('tabPlans').classList.toggle('hidden', target !== 'plans');
    });
  });
}

// ── Exercises ─────────────────────────────────────────────────────────────────
async function loadExercises() {
  const tbody = document.getElementById('adminExercisesBody');
  try {
    exercises = await Exercises.getAll();
  } catch {
    tbody.innerHTML = '<tr><td colspan="4" class="table-empty">Не вдалося завантажити вправи (бекенд недоступний)</td></tr>';
    return;
  }
  renderExercisesTable();
}

function renderExercisesTable() {
  const tbody = document.getElementById('adminExercisesBody');
  if (!exercises.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="table-empty">Вправ ще немає</td></tr>';
    return;
  }
  tbody.innerHTML = exercises.map(ex => `
    <tr>
      <td><strong>${ex.name}</strong></td>
      <td>${ex.muscleGroup || '—'}</td>
      <td><div class="admin-cell-desc">${ex.description || '—'}</div></td>
      <td>
        <div class="admin-row-actions">
          <button class="admin-icon-btn" data-action="edit-exercise" data-id="${ex.id}" title="Редагувати">
            <svg viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
          </button>
          <button class="admin-icon-btn admin-icon-btn--danger" data-action="delete-exercise" data-id="${ex.id}" title="Видалити">
            <svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('[data-action="edit-exercise"]').forEach(btn =>
    btn.addEventListener('click', () => openExerciseModal(Number(btn.dataset.id))));
  tbody.querySelectorAll('[data-action="delete-exercise"]').forEach(btn =>
    btn.addEventListener('click', () => deleteExercise(Number(btn.dataset.id))));
}

function initExerciseModal() {
  const modal = document.getElementById('exerciseModal');
  const form  = document.getElementById('exerciseForm');

  document.getElementById('addExerciseBtn').addEventListener('click', () => openExerciseModal(null));
  document.getElementById('exerciseCancelBtn').addEventListener('click', () => closeModal(modal));
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(modal); });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('exId').value;
    const msg = document.getElementById('exerciseFormMsg');
    const btn = document.getElementById('exerciseSaveBtn');
    msg.innerHTML = '';

    const data = {
      name: document.getElementById('exName').value.trim(),
      muscleGroup: document.getElementById('exMuscle').value.trim(),
      description: document.getElementById('exDesc').value.trim(),
      imageUrl: document.getElementById('exImage').value.trim(),
    };

    btn.disabled = true;
    try {
      if (id) {
        await Exercises.update(Number(id), data);
        showNotification('Вправу оновлено', 'success');
      } else {
        await Exercises.create(data);
        showNotification('Вправу додано', 'success');
      }
      closeModal(modal);
      await loadExercises();
    } catch (err) {
      msg.innerHTML = `<div class="form-error">${err.message || 'Не вдалося зберегти вправу'}</div>`;
    } finally {
      btn.disabled = false;
    }
  });
}

function openExerciseModal(id) {
  const modal = document.getElementById('exerciseModal');
  const ex = id ? exercises.find(e => e.id === id) : null;

  document.getElementById('exerciseModalTitle').textContent = ex ? 'Редагувати вправу' : 'Нова вправа';
  document.getElementById('exId').value = ex?.id || '';
  document.getElementById('exName').value = ex?.name || '';
  document.getElementById('exMuscle').value = ex?.muscleGroup || '';
  document.getElementById('exDesc').value = ex?.description || '';
  document.getElementById('exImage').value = ex?.imageUrl || '';
  document.getElementById('exerciseFormMsg').innerHTML = '';

  openModal(modal);
}

async function deleteExercise(id) {
  if (!confirm('Видалити цю вправу?')) return;
  try {
    await Exercises.delete(id);
    showNotification('Вправу видалено', 'info');
    await loadExercises();
  } catch (err) {
    showNotification(err.message || 'Не вдалося видалити вправу', 'error');
  }
}

// ── Plans ─────────────────────────────────────────────────────────────────────
async function loadPlans() {
  const tbody = document.getElementById('adminPlansBody');
  try {
    plans = await Plans.getAll();
  } catch {
    tbody.innerHTML = '<tr><td colspan="5" class="table-empty">Не вдалося завантажити програми (бекенд недоступний)</td></tr>';
    return;
  }
  renderPlansTable();
}

function renderPlansTable() {
  const tbody = document.getElementById('adminPlansBody');
  if (!plans.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="table-empty">Програм ще немає</td></tr>';
    return;
  }
  tbody.innerHTML = plans.map(p => `
    <tr>
      <td><strong>${p.emoji ? p.emoji + ' ' : ''}${p.name}</strong></td>
      <td><span class="level-badge level-badge--${(p.level || '').toLowerCase()}">${LEVEL_LABELS[p.level] || p.level || '—'}</span></td>
      <td>${GOAL_LABELS[p.goal] || p.goal || '—'}</td>
      <td><div class="admin-cell-desc">${p.description || '—'}</div></td>
      <td>
        <div class="admin-row-actions">
          <button class="admin-icon-btn" data-action="edit-plan" data-id="${p.id}" title="Редагувати">
            <svg viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
          </button>
          <button class="admin-icon-btn admin-icon-btn--danger" data-action="delete-plan" data-id="${p.id}" title="Видалити">
            <svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('[data-action="edit-plan"]').forEach(btn =>
    btn.addEventListener('click', () => openPlanModal(Number(btn.dataset.id))));
  tbody.querySelectorAll('[data-action="delete-plan"]').forEach(btn =>
    btn.addEventListener('click', () => deletePlan(Number(btn.dataset.id))));
}

function initPlanModal() {
  const modal = document.getElementById('planModal');
  const form  = document.getElementById('planForm');

  document.getElementById('addPlanBtn').addEventListener('click', () => openPlanModal(null));
  document.getElementById('planCancelBtn').addEventListener('click', () => closeModal(modal));
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(modal); });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('plId').value;
    const msg = document.getElementById('planFormMsg');
    const btn = document.getElementById('planSaveBtn');
    msg.innerHTML = '';

    const data = {
      name: document.getElementById('plName').value.trim(),
      level: document.getElementById('plLevel').value,
      goal: document.getElementById('plGoal').value,
      emoji: document.getElementById('plEmoji').value.trim(),
      description: document.getElementById('plDesc').value.trim(),
    };

    btn.disabled = true;
    try {
      if (id) {
        await Plans.update(Number(id), data);
        showNotification('Програму оновлено', 'success');
      } else {
        await Plans.create(data);
        showNotification('Програму додано', 'success');
      }
      closeModal(modal);
      await loadPlans();
    } catch (err) {
      msg.innerHTML = `<div class="form-error">${err.message || 'Не вдалося зберегти програму'}</div>`;
    } finally {
      btn.disabled = false;
    }
  });
}

function openPlanModal(id) {
  const modal = document.getElementById('planModal');
  const plan = id ? plans.find(p => p.id === id) : null;

  document.getElementById('planModalTitle').textContent = plan ? 'Редагувати програму' : 'Нова програма';
  document.getElementById('plId').value = plan?.id || '';
  document.getElementById('plName').value = plan?.name || '';
  document.getElementById('plLevel').value = plan?.level || 'BEGINNER';
  document.getElementById('plGoal').value = plan?.goal || 'MAINTENANCE';
  document.getElementById('plEmoji').value = plan?.emoji || '';
  document.getElementById('plDesc').value = plan?.description || '';
  document.getElementById('planFormMsg').innerHTML = '';

  openModal(modal);
}

async function deletePlan(id) {
  if (!confirm('Видалити цю програму?')) return;
  try {
    await Plans.delete(id);
    showNotification('Програму видалено', 'info');
    await loadPlans();
  } catch (err) {
    showNotification(err.message || 'Не вдалося видалити програму', 'error');
  }
}

// ── Modal helpers ─────────────────────────────────────────────────────────────
function openModal(modal)  { modal.classList.remove('hidden'); }
function closeModal(modal) { modal.classList.add('hidden'); }
