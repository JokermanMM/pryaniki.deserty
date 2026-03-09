// ===== Admin Panel Logic =====

const KNOWN_CONTACTS = {
  page_view: '👁 Просмотры страницы',
  main: '📊 Общий счётчик (main)',
  Flowwow: '🌸 Flowwow',
  telegram: '✈️ Телеграм',
  instagram: '📸 Instagram',
  vk: '💬 ВКонтакте',
  whatsapp: '📱 WhatsApp',
  phone: '📞 Телефон',
};

function getAdminKey() {
  const params = new URLSearchParams(window.location.search);
  return params.get('key') || '';
}

async function loadStats() {
  const container = document.getElementById('stats-container');
  const totalEl = document.getElementById('total-visits');

  try {
    const res = await fetch('/statistics');
    if (!res.ok) throw new Error('Ошибка загрузки');
    const data = await res.json();

    // Calculate total
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

    container.innerHTML = html || '<p class="loading">Нет данных</p>';
  } catch (err) {
    container.innerHTML = `<p class="error">⚠️ ${err.message}</p>`;
  }
}

async function resetStats() {
  if (!confirm('Вы уверены, что хотите сбросить всю статистику?')) return;

  const key = getAdminKey();
  try {
    const res = await fetch(`/reset?key=${encodeURIComponent(key)}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Ошибка сброса');
    loadStats();
  } catch (err) {
    alert('Ошибка: ' + err.message);
  }
}

// Initial load
document.addEventListener('DOMContentLoaded', loadStats);
