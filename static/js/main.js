// ===== Click tracking =====
function incrementVisit(name) {
  fetch('/increment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name }),
  })
    .then((res) => res.json())
    .then((data) => console.log('Статистика обновлена:', data))
    .catch((err) => console.error('Ошибка при отправке:', err));
}

// ===== Track page view on load =====
document.addEventListener('DOMContentLoaded', () => {
  incrementVisit('page_view');
});
