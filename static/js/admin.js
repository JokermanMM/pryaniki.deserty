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
let dropdownOpen = false;

function getAdminKey() {
  const params = new URLSearchParams(window.location.search);
  return params.get('key') || '';
}

function formatMonth(monthStr) {
  const [year, month] = monthStr.split('-');
  return `${MONTH_NAMES[month] || month} ${year}`;
}

// ===== Dropdown =====
function toggleDropdown() {
  dropdownOpen = !dropdownOpen;
  const menu = document.getElementById('dropdown-menu');
  const arrow = document.getElementById('dropdown-arrow');
  const dropdown = document.getElementById('period-dropdown');

  if (dropdownOpen) {
    menu.classList.add('dropdown__menu--open');
    arrow.classList.add('dropdown__arrow--open');
    dropdown.classList.add('dropdown--open');
  } else {
    menu.classList.remove('dropdown__menu--open');
    arrow.classList.remove('dropdown__arrow--open');
    dropdown.classList.remove('dropdown--open');
  }
}

function closeDropdown() {
  dropdownOpen = false;
  document.getElementById('dropdown-menu').classList.remove('dropdown__menu--open');
  document.getElementById('dropdown-arrow').classList.remove('dropdown__arrow--open');
  document.getElementById('period-dropdown').classList.remove('dropdown--open');
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('period-dropdown');
  if (!dropdown.contains(e.target)) {
    closeDropdown();
  }
});

// ===== Load available months =====
async function loadMonths() {
  const container = document.getElementById('month-items');
  try {
    const res = await fetch('/months');
    if (!res.ok) return;
    const months = await res.json();

    let html = '';
    for (const m of months) {
      const active = m === currentMonth ? ' dropdown__item--active' : '';
      html += `<button class="dropdown__item${active}" data-month="${m}" onclick="selectPeriod(this)">${formatMonth(m)}</button>`;
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
  document.querySelectorAll('.dropdown__item').forEach(b => b.classList.remove('dropdown__item--active'));
  btn.classList.add('dropdown__item--active');

  // Update toggle text
  document.getElementById('dropdown-text').textContent = currentMonth
    ? formatMonth(currentMonth)
    : 'Всё время';

  closeDropdown();
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

    const pageViews = data['page_view'] || 0;
    totalEl.textContent = pageViews;

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
