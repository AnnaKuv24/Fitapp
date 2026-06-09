/* dashboard.js */
'use strict';

document.addEventListener('DOMContentLoaded', async () => {
  await loadDashboard();
});

async function loadDashboard() {
  // Try real API, fall back to MOCK
  let stats, plans, recent, weekly;
  try {
    [stats, plans, recent] = await Promise.all([
      Progress.getStats('month'),
      Plans.getAll(),
      Progress.getHistory()
    ]);
    weekly = stats.weeklyData;
  } catch {
    stats  = MOCK.stats;
    plans  = MOCK.plans;
    recent = MOCK.recentWorkouts;
    weekly = MOCK.weeklyData;
  }

  // Stat cards
  document.getElementById('statWorkouts').textContent = stats.totalWorkouts ?? '—';
  document.getElementById('statVolume').textContent   = stats.totalVolumeKg ? (stats.totalVolumeKg / 1000).toFixed(1) + 'т' : '—';
  document.getElementById('statStreak').textContent   = stats.streak ?? '—';
  document.getElementById('statPR').textContent       = stats.newPRs ?? '—';

  // Plans
  renderPlans(plans);

  // Recent
  renderRecent(recent);

  // Chart
  renderWeeklyChart(weekly);
}

function renderPlans(plans) {
  const container = document.getElementById('planList');
  if (!plans?.length) { container.innerHTML = '<p style="color:var(--muted);font-size:.875rem">Програм ще немає</p>'; return; }

  const colors = ['blue','purple','green','orange'];
  container.innerHTML = plans.slice(0, 4).map((p, i) => `
    <a href="workout.html?planId=${p.id}" class="plan-item">
      <div class="plan-item__icon" style="background:var(--${colors[i % colors.length]}-50, var(--primary-bg))">
        <span style="font-size:1.4rem">${p.emoji || '💪'}</span>
      </div>
      <div class="plan-item__body">
        <div class="plan-item__name">${p.name}</div>
        <div class="plan-item__meta">
          <span class="level-badge level-badge--${p.level}">${levelLabel(p.level)}</span>
          &nbsp;·&nbsp; ${p.exerciseCount || '?'} вправ
        </div>
      </div>
      <svg class="plan-item__arrow" viewBox="0 0 24 24" width="16"><path d="M9 18l6-6-6-6"/></svg>
    </a>
  `).join('');
}

function renderRecent(workouts) {
  const container = document.getElementById('recentList');
  if (!workouts?.length) { container.innerHTML = '<p style="color:var(--muted);font-size:.875rem;padding:.5rem 0">Тренувань ще немає. <a href="workout.html" style="color:var(--primary)">Розпочати!</a></p>'; return; }

  container.innerHTML = workouts.slice(0, 4).map(w => {
    const d = new Date(w.finishedAt);
    return `
    <div class="recent-item">
      <div class="recent-item__date">
        <span class="recent-item__day">${d.toLocaleDateString('uk-UA', { month: 'short' })}</span>
        <span class="recent-item__num">${d.getDate()}</span>
      </div>
      <div class="recent-item__body">
        <div class="recent-item__name">${w.planName}</div>
        <div class="recent-item__stats">${w.durationMin} хв · ${w.totalVolumeKg} кг</div>
      </div>
      <span class="recent-item__vol">${w.totalVolumeKg} кг</span>
    </div>`;
  }).join('');
}

function renderWeeklyChart(data) {
  const ctx = document.getElementById('weeklyChart')?.getContext('2d');
  if (!ctx || !data?.length) return;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.label),
      datasets: [{
        label: 'Тоннаж (кг)',
        data: data.map(d => d.volume),
        backgroundColor: data.map(d => d.volume > 0 ? 'rgba(99,102,241,.85)' : 'rgba(99,102,241,.15)'),
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.parsed.y} кг` } } },
      scales: {
        x: { grid: { display: false }, border: { display: false }, ticks: { color: '#94a3b8', font: { size: 12 } } },
        y: { grid: { color: 'rgba(148,163,184,.18)' }, border: { display: false }, ticks: { color: '#94a3b8', font: { size: 12 } } }
      }
    }
  });
}

function levelLabel(l) {
  return { beginner: 'Початківець', intermediate: 'Середній', advanced: 'Просунутий' }[l] || l;
}
