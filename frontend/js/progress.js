/* progress.js */
'use strict';

let currentPeriod = 'week';

document.addEventListener('DOMContentLoaded', async () => {
  document.querySelectorAll('.period-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.period-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPeriod = btn.dataset.period;
      loadProgress();
    });
  });
  await loadProgress();
});

async function loadProgress() {
  let stats, records, history;
  try {
    [stats, records, history] = await Promise.all([
      Progress.getStats(currentPeriod),
      Progress.getRecords(),
      Progress.getHistory()
    ]);
  } catch {
    stats   = { totalWorkouts: 12, totalVolumeKg: 18450, avgDurationMin: 52, newPRs: 3, chartData: MOCK.weeklyData };
    records = MOCK.records;
    history = MOCK.recentWorkouts;
  }

  // Summary cards
  document.getElementById('pTotalWorkouts').textContent = stats.totalWorkouts ?? '—';
  document.getElementById('pTotalVolume').textContent   = stats.totalVolumeKg ? stats.totalVolumeKg.toLocaleString() : '—';
  document.getElementById('pAvgDuration').textContent   = stats.avgDurationMin ?? '—';
  document.getElementById('pNewPRs').textContent        = stats.newPRs ?? '—';

  // Chart — build period-aware buckets from the workout history,
  // since the backend stats endpoint doesn't return chartData
  const chartData = buildChartData(history, currentPeriod);
  renderVolumeChart(chartData?.length ? chartData : MOCK.weeklyData);

  // Personal records
  renderRecords(records);

  // History table
  renderHistory(history);
}

function buildChartData(history, period) {
  if (!history?.length) return [];
  const now = new Date();
  const vol = w => Number(w.totalVolumeKg) || 0;

  if (period === 'year') {
    const months = ['Січ','Лют','Бер','Кві','Тра','Чер','Лип','Сер','Вер','Жов','Лис','Гру'];
    const buckets = months.map(label => ({ label, volume: 0 }));
    history.forEach(w => {
      if (!w.finishedAt) return;
      const d = new Date(w.finishedAt);
      if (d.getFullYear() === now.getFullYear()) buckets[d.getMonth()].volume += vol(w);
    });
    return buckets;
  }

  if (period === 'month') {
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const weekCount = Math.ceil(daysInMonth / 7);
    const buckets = Array.from({ length: weekCount }, (_, i) => ({ label: `Тиж ${i + 1}`, volume: 0 }));
    history.forEach(w => {
      if (!w.finishedAt) return;
      const d = new Date(w.finishedAt);
      if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
        const idx = Math.min(weekCount - 1, Math.floor((d.getDate() - 1) / 7));
        buckets[idx].volume += vol(w);
      }
    });
    return buckets;
  }

  // week — last 7 days, labeled by day of week (Mon-first)
  const dayLabels = ['Пн','Вт','Ср','Чт','Пт','Сб','Нд'];
  const buckets = dayLabels.map(label => ({ label, volume: 0 }));
  history.forEach(w => {
    if (!w.finishedAt) return;
    const d = new Date(w.finishedAt);
    const diffDays = Math.floor((now - d) / 86400000);
    if (diffDays >= 0 && diffDays < 7) {
      const idx = (d.getDay() + 6) % 7;
      buckets[idx].volume += vol(w);
    }
  });
  return buckets;
}

function renderVolumeChart(data) {
  const canvas = document.getElementById('volumeChart');
  if (!canvas || !data?.length) return;

  // Destroy existing
  if (canvas._chart) canvas._chart.destroy();

  const ctx = canvas.getContext('2d');
  canvas._chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.label),
      datasets: [{
        label: 'Тоннаж (кг)',
        data: data.map(d => d.volume),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,.1)',
        borderWidth: 2.5,
        pointBackgroundColor: '#6366f1',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: .4,
        fill: true,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => ` ${c.parsed.y} кг` } }
      },
      scales: {
        x: { grid: { display: false }, border: { display: false }, ticks: { color: '#94a3b8', font: { size: 12 } } },
        y: { grid: { color: 'rgba(148,163,184,.18)' }, border: { display: false }, ticks: { color: '#94a3b8', font: { size: 12 } } }
      }
    }
  });
}

function renderRecords(records) {
  const container = document.getElementById('prList');
  if (!records?.length) { container.innerHTML = '<p style="color:var(--muted);font-size:.875rem;padding:.5rem 0">Рекордів ще немає</p>'; return; }

  container.innerHTML = records.slice(0, 8).map((r, i) => `
    <div class="pr-item">
      <div class="pr-item__rank">${i + 1}</div>
      <div class="pr-item__body">
        <div class="pr-item__name">${r.exerciseName}</div>
        <div class="pr-item__date">${new Date(r.achievedAt).toLocaleDateString('uk-UA')}</div>
      </div>
      <span class="pr-item__weight">${r.maxWeightKg} кг</span>
    </div>
  `).join('');
}

function renderHistory(workouts) {
  const tbody = document.getElementById('historyBody');
  if (!workouts?.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="table-empty">Тренувань ще немає</td></tr>';
    return;
  }
  tbody.innerHTML = workouts.map(w => {
    const d = new Date(w.finishedAt);
    return `<tr>
      <td>${d.toLocaleDateString('uk-UA')}</td>
      <td>${w.planName}</td>
      <td>${w.durationMin} хв</td>
      <td><strong>${w.totalVolumeKg} кг</strong></td>
    </tr>`;
  }).join('');
}
