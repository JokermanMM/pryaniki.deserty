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

// ===== Copy phone number =====
function copyPhone() {
  navigator.clipboard.writeText('+79950304625').then(() => {
    const tooltip = document.getElementById('copy-tooltip');
    tooltip.classList.add('copy-btn__tooltip--visible');
    setTimeout(() => tooltip.classList.remove('copy-btn__tooltip--visible'), 2000);
  });
}
