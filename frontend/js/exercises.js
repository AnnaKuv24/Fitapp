/* exercises.js */
'use strict';

const MOCK_EXERCISES = [
  { id: 1, name: 'Жим лежачи', muscleGroup: 'Груди', description: 'Класична вправа для розвитку грудних м\'язів. Лягти на лаву, ширина хвату — трохи ширша за плечі.', imageUrl: '' },
  { id: 2, name: 'Присідання зі штангою', muscleGroup: 'Ноги', description: 'Базова вправа для квадрицепсів, сідниць та попереку.', imageUrl: '' },
  { id: 3, name: 'Тяга верхнього блоку', muscleGroup: 'Спина', description: 'Вправа для широчайших м\'язів спини.', imageUrl: '' },
  { id: 4, name: 'Жим штанги стоячи', muscleGroup: 'Плечі', description: 'Базова вправа для розвитку дельтоподібних м\'язів.', imageUrl: '' },
  { id: 5, name: 'Підйом на біцепс', muscleGroup: 'Руки', description: 'Ізолююча вправа для двоголового м\'яза плеча.', imageUrl: '' },
  { id: 6, name: 'Скручування', muscleGroup: 'Прес', description: 'Вправа для прямого м\'яза живота.', imageUrl: '' },
];

let allExercises = [];
let currentMuscle = '';
let currentSearch = '';

document.addEventListener('DOMContentLoaded', async () => {
  document.querySelectorAll('.muscle-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.muscle-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentMuscle = chip.dataset.muscle;
      loadExercises();
    });
  });

  const search = document.getElementById('exerciseSearch');
  search?.addEventListener('input', () => {
    currentSearch = search.value.trim().toLowerCase();
    renderExercises();
  });

  await loadExercises();
});

async function loadExercises() {
  try {
    allExercises = await Exercises.getAll(currentMuscle);
  } catch {
    allExercises = currentMuscle
      ? MOCK_EXERCISES.filter(e => e.muscleGroup === currentMuscle)
      : MOCK_EXERCISES;
  }
  renderExercises();
}

function renderExercises() {
  const container = document.getElementById('exercisesGrid');
  let list = allExercises;
  if (currentSearch) {
    list = list.filter(e => e.name.toLowerCase().includes(currentSearch));
  }

  if (!list.length) {
    container.innerHTML = '<p class="exercises-empty">Вправ не знайдено</p>';
    return;
  }

  container.innerHTML = list.map(e => `
    <div class="exercise-card" data-id="${e.id}">
      <div class="exercise-card__image">
        ${e.imageUrl
          ? `<img src="${e.imageUrl}" alt="${e.name}" onerror="this.style.display='none'">`
          : `<span class="placeholder">🏋️</span>`}
        ${e.muscleGroup ? `<span class="exercise-card__muscle">${e.muscleGroup}</span>` : ''}
      </div>
      <div class="exercise-card__body">
        <div class="exercise-card__name">${e.name}</div>
        <p class="exercise-card__desc">${e.description || 'Опис відсутній'}</p>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.exercise-card').forEach(card => {
    card.addEventListener('click', () => {
      const ex = list.find(e => String(e.id) === card.dataset.id);
      if (ex) openExerciseDetail(ex);
    });
  });
}

let currentDetailExercise = null;

function openExerciseDetail(ex) {
  currentDetailExercise = ex;
  const modal = document.getElementById('exerciseDetailModal');
  const imageEl = document.getElementById('exDetailImage');
  const muscleEl = document.getElementById('exDetailMuscle');

  imageEl.innerHTML = ex.imageUrl
    ? `<img src="${ex.imageUrl}" alt="${ex.name}" onerror="this.style.display='none'">`
    : `<span class="placeholder">🏋️</span>`;

  if (ex.muscleGroup) {
    muscleEl.textContent = ex.muscleGroup;
    muscleEl.style.display = '';
  } else {
    muscleEl.style.display = 'none';
  }

  document.getElementById('exDetailName').textContent = ex.name;
  document.getElementById('exDetailDesc').textContent = ex.description || 'Опис відсутній';

  modal.classList.remove('hidden');
}

function closeExerciseDetail() {
  document.getElementById('exerciseDetailModal').classList.add('hidden');
  currentDetailExercise = null;
}

document.getElementById('exerciseDetailCloseBtn')?.addEventListener('click', closeExerciseDetail);
document.getElementById('exerciseDetailModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'exerciseDetailModal') closeExerciseDetail();
});
document.getElementById('exDetailStartBtn')?.addEventListener('click', () => {
  if (currentDetailExercise) {
    window.location.href = `workout.html?exerciseId=${currentDetailExercise.id}`;
  }
});
