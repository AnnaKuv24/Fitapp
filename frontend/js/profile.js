/* profile.js */
'use strict';

const GOAL_LABELS = { WEIGHT_LOSS: 'Схуднення', MUSCLE_GAIN: 'Набір м\'язів', MAINTENANCE: 'Підтримка форми' };

document.addEventListener('DOMContentLoaded', async () => {
  await loadProfile();
  document.getElementById('profileForm')?.addEventListener('submit', onSave);
  initPaymentModal();
});

async function loadProfile() {
  let user;
  try {
    user = await Profile.get();
  } catch {
    user = Auth.getUser() || MOCK.user;
  }
  renderProfile(user);
}

function renderProfile(user) {
  const initial = (user.name || 'U')[0].toUpperCase();
  document.getElementById('profileAvatar').textContent = initial;
  document.getElementById('profileName').textContent = user.name || '—';
  document.getElementById('profileEmail').textContent = user.email || '—';

  const subBadge = document.getElementById('profileSubBadge');
  const isPremium = user.subscription === 'PREMIUM';
  subBadge.textContent = isPremium ? '⭐ PREMIUM' : 'FREE';
  subBadge.classList.toggle('premium', isPremium);

  const goalBadge = document.getElementById('profileGoalBadge');
  goalBadge.textContent = GOAL_LABELS[user.goal] || 'Мета не вказана';
  goalBadge.classList.add('level-badge', 'level-badge--intermediate');

  document.getElementById('pfName').value = user.name || '';
  document.getElementById('pfEmail').value = user.email || '';
  document.getElementById('pfGoal').value = user.goal || 'MAINTENANCE';

  renderSubscriptionActions(isPremium);
}

function renderSubscriptionActions(isPremium) {
  const el = document.getElementById('subscriptionActions');
  if (isPremium) {
    el.innerHTML = `
      <p style="font-size:.8rem;color:var(--muted)">У вас активна підписка PREMIUM.</p>
      <button class="btn btn--ghost btn--full" id="cancelSubBtn">Скасувати підписку</button>
    `;
    document.getElementById('cancelSubBtn')?.addEventListener('click', onCancelSubscription);
  } else {
    el.innerHTML = `
      <p style="font-size:.8rem;color:var(--muted)">Перейдіть на PREMIUM, щоб відкрити всі можливості.</p>
      <button class="btn btn--primary btn--full" id="upgradeSubBtn">Оформити PREMIUM</button>
    `;
    document.getElementById('upgradeSubBtn')?.addEventListener('click', () => {
      document.getElementById('paymentForm')?.reset();
      document.getElementById('paymentFormMsg').innerHTML = '';
      document.getElementById('paymentModal')?.classList.remove('hidden');
    });
  }
}

// ── Payment modal (PREMIUM checkout) ──────────────────────────────────────────
function initPaymentModal() {
  const modal = document.getElementById('paymentModal');
  const form  = document.getElementById('paymentForm');
  if (!modal || !form) return;

  document.getElementById('paymentCancelBtn')?.addEventListener('click', () => modal.classList.add('hidden'));
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });

  // Format card number as "0000 0000 0000 0000" while typing
  const numberInput = document.getElementById('payCardNumber');
  numberInput?.addEventListener('input', () => {
    numberInput.value = numberInput.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  });

  // Format expiry as "MM/YY" while typing
  const expiryInput = document.getElementById('payExpiry');
  expiryInput?.addEventListener('input', () => {
    let v = expiryInput.value.replace(/\D/g, '').slice(0, 4);
    if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
    expiryInput.value = v;
  });

  document.getElementById('payCvv')?.addEventListener('input', e => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
  });

  form.addEventListener('submit', onPaySubmit);
}

async function onPaySubmit(e) {
  e.preventDefault();
  const msg = document.getElementById('paymentFormMsg');
  const btn = document.getElementById('paymentSubmitBtn');
  msg.innerHTML = '';

  const cardNumber = document.getElementById('payCardNumber').value.replace(/\s/g, '');
  const expiry     = document.getElementById('payExpiry').value;
  const cvv        = document.getElementById('payCvv').value;
  const cardName   = document.getElementById('payCardName').value.trim();

  if (cardNumber.length !== 16) {
    msg.innerHTML = '<div class="form-error">Номер картки має містити 16 цифр</div>';
    return;
  }
  if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    msg.innerHTML = '<div class="form-error">Вкажіть термін дії у форматі ММ/РР</div>';
    return;
  }
  if (cvv.length !== 3) {
    msg.innerHTML = '<div class="form-error">CVV має містити 3 цифри</div>';
    return;
  }
  if (!cardName) {
    msg.innerHTML = '<div class="form-error">Вкажіть ім\'я власника картки</div>';
    return;
  }

  btn.disabled = true;
  const originalText = btn.textContent;
  btn.textContent = 'Обробка платежу...';

  try {
    await new Promise(r => setTimeout(r, 900)); // імітація обробки платежу
    await onUpgradeSubscription();
    document.getElementById('paymentModal')?.classList.add('hidden');
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

async function onSave(e) {
  e.preventDefault();
  const btn = document.getElementById('profileSaveBtn');
  const msg = document.getElementById('profileFormMsg');
  msg.innerHTML = '';

  const data = {
    name: document.getElementById('pfName').value.trim(),
    email: document.getElementById('pfEmail').value.trim(),
    goal: document.getElementById('pfGoal').value,
  };

  btn.disabled = true;
  const originalText = btn.textContent;
  btn.textContent = 'Збереження...';

  try {
    let updated;
    try {
      updated = await Profile.update(data);
    } catch {
      updated = { ...(Auth.getUser() || MOCK.user), ...data };
    }
    localStorage.setItem('fitapp_user', JSON.stringify(updated));
    renderProfile(updated);
    showNotification('Профіль оновлено', 'success');
  } catch (err) {
    msg.innerHTML = `<div class="form-error">${err.message || 'Не вдалося зберегти зміни'}</div>`;
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

async function onUpgradeSubscription() {
  try {
    await Subscription.purchase('PREMIUM');
  } catch { /* backend недоступний — оновлюємо локально для демонстрації */ }
  const user = { ...(Auth.getUser() || MOCK.user), subscription: 'PREMIUM' };
  localStorage.setItem('fitapp_user', JSON.stringify(user));
  renderProfile(user);
  showNotification('Підписку PREMIUM активовано', 'success');
}

async function onCancelSubscription() {
  try {
    await Subscription.cancel();
  } catch { /* backend недоступний — оновлюємо локально для демонстрації */ }
  const user = { ...(Auth.getUser() || MOCK.user), subscription: 'FREE' };
  localStorage.setItem('fitapp_user', JSON.stringify(user));
  renderProfile(user);
  showNotification('Підписку скасовано', 'info');
}
