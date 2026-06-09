/* workout.js */
'use strict';

let state = {
  plan: null, logId: null,
  exIdx: 0, setIdx: 0,
  sets: [],
  startTime: null, timerInterval: null, workoutInterval: null,
  totalSetsLogged: 0,
  setTimer: { running: false, interval: null, startedAt: null }
};

let currentExerciseMode = 'WEIGHT_REPS';

// ── Exercise input mode ───────────────────────────────────────────────────────
// Деякі вправи (наприклад, планка) виконуються без ваги і вимірюються часом
// утримання, а вправи на прес зазвичай виконуються з власною вагою — без кг.
function getExerciseMode(ex) {
  const name = (ex.name || '').toLowerCase();
  if (name.includes('планка')) return 'TIMER';
  if ((ex.muscleGroup || '') === 'Прес') return 'REPS_ONLY';
  return 'WEIGHT_REPS';
}

function applyExerciseInputMode(ex) {
  resetSetTimer();
  currentExerciseMode = getExerciseMode(ex);

  const inputRow    = document.getElementById('inputRow');
  const weightGroup = document.getElementById('weightInputGroup');
  const timerBlock  = document.getElementById('timerSetBlock');
  const colPrev     = document.getElementById('setsColPrev');
  const colMain     = document.getElementById('setsColMain');
  const colExtra    = document.getElementById('setsColExtra');
  const btnText     = document.getElementById('logSetBtnText');

  if (currentExerciseMode === 'TIMER') {
    inputRow.classList.add('hidden');
    timerBlock.classList.remove('hidden');
    colPrev.textContent = '';
    colMain.textContent = '';
    colExtra.textContent = 'Тривалість';
    btnText.textContent = 'Старт';
  } else {
    inputRow.classList.remove('hidden');
    timerBlock.classList.add('hidden');
    weightGroup.classList.toggle('hidden', currentExerciseMode === 'REPS_ONLY');
    colPrev.textContent = currentExerciseMode === 'WEIGHT_REPS' ? 'Попер. вага' : '';
    colMain.textContent = currentExerciseMode === 'WEIGHT_REPS' ? 'Вага (кг)' : '';
    colExtra.textContent = 'Повтори';
    btnText.textContent = 'Підхід виконано';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const planId = params.get('planId');
  const exerciseId = params.get('exerciseId');

  if (exerciseId) {
    await startSingleExercise(exerciseId);
  } else if (planId) {
    await startWorkout(planId);
  } else {
    await loadPlanSelect();
  }

  setupQtyButtons();
});

// ── Plan selection ────────────────────────────────────────────────────────────
async function loadPlanSelect() {
  let plans;
  try { plans = await Plans.getAll(); }
  catch { plans = MOCK.plans; }

  const grid = document.getElementById('planSelectGrid');
  const colors = ['blue', 'purple', 'green', 'orange'];
  grid.innerHTML = plans.map((p, i) => `
    <div class="plan-select-card color-${colors[i % colors.length]}" onclick="selectPlan(${p.id})">
      <div class="plan-select-card__emoji">${p.emoji || '💪'}</div>
      <div class="plan-select-card__name">${p.name}</div>
      <div class="plan-select-card__desc">${p.description}</div>
      <div class="plan-select-card__footer">
        <span class="level-badge level-badge--${p.level}">${levelLabel(p.level)}</span>
        <span class="btn btn--sm btn--primary">Почати</span>
      </div>
    </div>
  `).join('');
}

function selectPlan(id) {
  window.location.href = `workout.html?planId=${id}`;
}

// ── Workout start ─────────────────────────────────────────────────────────────
async function startWorkout(planId) {
  document.getElementById('planScreen').classList.add('hidden');
  document.getElementById('workoutScreen').classList.remove('hidden');

  try {
    state.plan = await Plans.getById(planId);
  } catch {
    state.plan = MOCK.planDetail[planId] || MOCK.planDetail[1];
  }

  try {
    const session = await Workout.start(planId);
    state.logId = session.workoutLogId;
  } catch {
    state.logId = Date.now(); // mock id
  }

  state.startTime = Date.now();
  document.getElementById('workoutPlanName').textContent = state.plan.name;

  // Start workout clock
  state.workoutInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    document.getElementById('workoutTimer').textContent = formatTime(elapsed);
  }, 1000);

  renderExercise();
}

// ── Single-exercise quick workout ─────────────────────────────────────────────
async function startSingleExercise(exerciseId) {
  document.getElementById('planScreen').classList.add('hidden');
  document.getElementById('workoutScreen').classList.remove('hidden');

  let ex;
  try {
    ex = await Exercises.getById(exerciseId);
  } catch {
    ex = MOCK.planDetail[1].exercises[0];
  }

  ex = { sets: 3, reps: 10, restSeconds: 90, ...ex };

  state.plan = { name: ex.name, exercises: [ex] };

  try {
    const session = await Workout.start(null);
    state.logId = session.workoutLogId;
  } catch {
    state.logId = Date.now(); // mock id
  }

  state.startTime = Date.now();
  document.getElementById('workoutPlanName').textContent = state.plan.name;

  state.workoutInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    document.getElementById('workoutTimer').textContent = formatTime(elapsed);
  }, 1000);

  renderExercise();
}

// ── Exercise render ───────────────────────────────────────────────────────────
function renderExercise() {
  const exercises = state.plan.exercises;
  const ex = exercises[state.exIdx];

  if (!ex) { showSummary(); return; }

  // Progress
  const total = exercises.length;
  document.getElementById('progressFill').style.width = `${(state.exIdx / total) * 100}%`;
  document.getElementById('exCounter').textContent = `${state.exIdx + 1} / ${total}`;

  // Exercise info
  document.getElementById('exerciseName').textContent = ex.name;
  document.getElementById('exerciseDesc').textContent = ex.description || '';
  document.getElementById('muscleBadge').textContent  = ex.muscleGroup || '';
  document.getElementById('paramSets').textContent    = ex.sets;
  document.getElementById('paramReps').textContent    = ex.reps;
  document.getElementById('paramRest').textContent    = (ex.restSeconds || 90) + 'с';

  // Input mode (вага+повтори / лише повтори / лише таймер)
  applyExerciseInputMode(ex);

  // Sets log
  renderSetsTable(ex);
}

function renderSetsTable(ex) {
  const container = document.getElementById('setsContainer');
  const showWeight = currentExerciseMode === 'WEIGHT_REPS';
  const isTimer    = currentExerciseMode === 'TIMER';
  const prevWeight = state.sets.length ? state.sets[state.sets.length - 1]?.weight : null;

  container.innerHTML = Array.from({ length: ex.sets }, (_, i) => {
    const done = i < state.setIdx;
    const curr = i === state.setIdx;
    const set  = state.sets[i];
    const extra = isTimer
      ? (done ? formatTime(set?.reps || 0) : '—')
      : (done ? (set?.reps ?? '?') : '—');
    return `
      <div class="set-row ${done ? 'completed' : ''}">
        <div class="set-num">${i + 1}</div>
        <span>${showWeight ? (prevWeight != null ? prevWeight + ' кг' : '—') : ''}</span>
        <span>${showWeight
          ? (done ? (set?.weight ?? '?') + ' кг' : curr ? '<strong>поточний</strong>' : '—')
          : (curr ? '<strong>поточний</strong>' : '')}</span>
        <span>${extra}</span>
        <span class="set-check">${done ? '✓' : ''}</span>
      </div>`;
  }).join('');
}

// ── Log set ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('logSetBtn')?.addEventListener('click', () => {
    if (currentExerciseMode === 'TIMER') handleTimerSetClick();
    else logSet();
  });
  document.getElementById('abortBtn')?.addEventListener('click', () => {
    if (confirm('Завершити тренування?')) showSummary();
  });
});

async function logSet() {
  let weight, reps;

  if (currentExerciseMode === 'REPS_ONLY') {
    weight = 0;
    reps   = parseInt(document.getElementById('repsInput').value);
    if (!reps || reps <= 0) {
      showNotification('Введіть коректну кількість повторів', 'warning'); return;
    }
  } else {
    weight = parseFloat(document.getElementById('weightInput').value);
    reps   = parseInt(document.getElementById('repsInput').value);
    if (!weight || !reps || weight <= 0 || reps <= 0) {
      showNotification('Введіть коректні значення', 'warning'); return;
    }
  }

  await recordSet(weight, reps);
}

// ── Timer-based set (наприклад, планка) ───────────────────────────────────────
function resetSetTimer() {
  clearInterval(state.setTimer.interval);
  state.setTimer = { running: false, interval: null, startedAt: null };
  const display = document.getElementById('timerSetDisplay');
  const hint    = document.getElementById('timerSetHint');
  if (display) display.textContent = '00:00';
  if (hint) hint.textContent = 'Натисніть «Старт» і утримуйте положення';
}

function handleTimerSetClick() {
  const hint    = document.getElementById('timerSetHint');
  const display = document.getElementById('timerSetDisplay');
  const btnText = document.getElementById('logSetBtnText');

  if (!state.setTimer.running) {
    state.setTimer.running = true;
    state.setTimer.startedAt = Date.now();
    hint.textContent = 'Утримуйте положення… натисніть «Стоп», щоб завершити';
    btnText.textContent = 'Стоп — підхід виконано';
    state.setTimer.interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - state.setTimer.startedAt) / 1000);
      display.textContent = formatTime(elapsed);
    }, 1000);
  } else {
    clearInterval(state.setTimer.interval);
    const elapsed = Math.max(1, Math.floor((Date.now() - state.setTimer.startedAt) / 1000));
    state.setTimer.running = false;
    recordSet(0, elapsed);
  }
}

// ── Shared set recording ──────────────────────────────────────────────────────
async function recordSet(weight, reps) {
  // Animate button
  const btn = document.getElementById('logSetBtn');
  btn.style.transform = 'scale(.96)';
  setTimeout(() => btn.style.transform = '', 150);

  state.sets.push({ weight, reps });
  state.totalSetsLogged++;

  let isPR = false;
  try {
    const ex = state.plan.exercises[state.exIdx];
    const result = await Workout.logSet({
      workoutLogId: state.logId,
      exerciseId:   ex.id,
      setNum:       state.setIdx + 1,
      repsDone:     reps,
      weightKg:     weight
    });
    isPR = result.isPersonalRecord;
  } catch (err) {
    // Не вдалося звернутися до сервера — підхід збережено лише локально,
    // тож чесно повідомляємо, що рекорд перевірити неможливо (без вгадування).
    isPR = false;
    showNotification('Підхід збережено локально — не вдалося перевірити рекорд', 'warning');
  }

  if (isPR && weight > 0) showPRPopup(weight, reps);

  state.setIdx++;

  const ex = state.plan.exercises[state.exIdx];
  if (state.setIdx >= ex.sets) {
    state.exIdx++;
    state.setIdx = 0;
    if (state.exIdx < state.plan.exercises.length) {
      startRestTimer(ex.restSeconds || 90);
    } else {
      showSummary();
      return;
    }
  } else {
    startRestTimer(ex.restSeconds || 90);
  }

  renderExercise();
}

// ── Rest timer ────────────────────────────────────────────────────────────────
function startRestTimer(seconds) {
  const overlay = document.getElementById('timerOverlay');
  const countEl = document.getElementById('timerCount');
  const circle  = document.getElementById('timerCircle');
  const circum  = 327;

  overlay.classList.remove('hidden');
  let remaining = seconds;

  function tick() {
    countEl.textContent = remaining;
    const offset = circum * (1 - remaining / seconds);
    circle.style.strokeDashoffset = offset;

    if (remaining <= 3) circle.style.stroke = '#ef4444';
    else circle.style.stroke = '';

    if (remaining <= 0) {
      clearInterval(state.timerInterval);
      overlay.classList.add('hidden');
    }
    remaining--;
  }

  tick();
  state.timerInterval = setInterval(tick, 1000);

  document.getElementById('skipTimerBtn').onclick = () => {
    clearInterval(state.timerInterval);
    overlay.classList.add('hidden');
    circle.style.stroke = '';
  };
}

// ── PR Popup ──────────────────────────────────────────────────────────────────
function showPRPopup(weight, reps) {
  const popup = document.getElementById('prPopup');
  document.getElementById('prText').textContent = `${weight} кг × ${reps} повторень — новий рекорд!`;
  popup.classList.remove('hidden');
  document.getElementById('prClose').onclick = () => popup.classList.add('hidden');
}

// ── Summary ───────────────────────────────────────────────────────────────────
async function showSummary() {
  clearInterval(state.workoutInterval);
  clearInterval(state.timerInterval);

  const durationMin = Math.round((Date.now() - state.startTime) / 60000);
  const totalVolume = state.sets.reduce((acc, s) => acc + s.weight * s.reps, 0);

  try {
    await Workout.finish(state.logId);
  } catch (err) {
    showNotification('Не вдалося зберегти підсумки тренування на сервері', 'warning');
  }

  document.getElementById('sumDuration').textContent = durationMin || 1;
  document.getElementById('sumVolume').textContent   = totalVolume;
  document.getElementById('sumSets').textContent     = state.totalSetsLogged;
  document.getElementById('summaryOverlay').classList.remove('hidden');
}

// ── Qty buttons ───────────────────────────────────────────────────────────────
function setupQtyButtons() {
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const field = btn.dataset.field;
      const dir   = parseInt(btn.dataset.dir);
      const input = document.getElementById(field === 'weight' ? 'weightInput' : 'repsInput');
      const step  = field === 'weight' ? 2.5 : 1;
      const val   = parseFloat(input.value) + dir * step;
      input.value = Math.max(field === 'weight' ? 0 : 1, val);
    });
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
function levelLabel(l) {
  return { beginner: 'Початківець', intermediate: 'Середній', advanced: 'Просунутий' }[l] || l;
}
