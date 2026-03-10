// ===== Admin Panel Logic =====

const KNOWN_CONTACTS = {
  page_view: '👁 Просмотры страницы',
  main: '📊 Общий счётчик',
  Flowwow: '🌸 Flowwow',
  telegram: '✈️ Телеграм',
  instagram: '📸 Instagram',
  vk: '💬 ВКонтакте',
  whatsapp: '📱 WhatsApp',
  phone: '📞 Телефон',
};

const MONTH_NAMES = {
  '01': 'Январь', '02': 'Февраль', '03': 'Март',
  '04': 'Апрель', '05': 'Май', '06': 'Июнь',
  '07': 'Июль', '08': 'Август', '09': 'Сентябрь',
  '10': 'Октябрь', '11': 'Ноябрь', '12': 'Декабрь',
};

let currentMonth = ''; // '' = all time

function getAdminKey() {
  const params = new URLSearchParams(window.location.search);
  return params.get('key') || '';
}

function formatMonth(monthStr) {
  // "2026-03" -> "Март 2026"
  const [year, month] = monthStr.split('-');
  return `${MONTH_NAMES[month] || month} ${year}`;
}

// ===== Load available months =====
async function loadMonths() {
  const container = document.getElementById('month-buttons');
  try {
    const res = await fetch('/months');
    if (!res.ok) return;
    const months = await res.json();

    let html = '';
    for (const m of months) {
      const active = m === currentMonth ? ' period-btn--active' : '';
      html += `<button class="period-btn${active}" data-month="${m}" onclick="selectPeriod(this)">${formatMonth(m)}</button>`;
    }
    container.innerHTML = html;
  } catch (e) {
    // silently fail
  }
}

// ===== Select period =====
function selectPeriod(btn) {
  currentMonth = btn.dataset.month;

  // Update active state
  document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('period-btn--active'));
  btn.classList.add('period-btn--active');

  // Update label
  const label = document.getElementById('period-label');
  label.textContent = currentMonth
    ? `Период: ${formatMonth(currentMonth)}`
    : 'Период: всё время';

  loadStats();
}

// ===== Load statistics =====
async function loadStats() {
  const container = document.getElementById('stats-container');
  const totalEl = document.getElementById('total-visits');

  try {
    let url = '/statistics';
    if (currentMonth) {
      url += `?month=${encodeURIComponent(currentMonth)}`;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error('Ошибка загрузки');
    const data = await res.json();

    // Calculate page views
    const pageViews = data['page_view'] || 0;
    totalEl.textContent = pageViews;

    // Build stat cards
    let html = '';
    const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);

    for (const [key, value] of entries) {
      const label = KNOWN_CONTACTS[key] || key;
      html += `
        <div class="stat-card">
          <span class="stat-card__name">${label}</span>
          <span class="stat-card__count">${value}</span>
        </div>
      `;
    }

    container.innerHTML = html || '<p class="loading">Нет данных за этот период</p>';
  } catch (err) {
    container.innerHTML = `<p class="error">⚠️ ${err.message}</p>`;
  }
}

// ===== Reset statistics =====
async function resetStats() {
  if (!confirm('Вы уверены, что хотите сбросить ВСЮ статистику за все периоды?')) return;

  const key = getAdminKey();
  try {
    const res = await fetch(`/reset?key=${encodeURIComponent(key)}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Ошибка сброса');
    loadMonths();
    loadStats();
  } catch (err) {
    alert('Ошибка: ' + err.message);
  }
}

// ===== Initial load =====
document.addEventListener('DOMContentLoaded', () => {
  loadMonths();
  loadStats();
});
