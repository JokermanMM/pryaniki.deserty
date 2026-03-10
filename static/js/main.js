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

// ===== Gallery Filter =====
function filterGallery(btn) {
  const category = btn.dataset.category;

  // Update active tab
  document.querySelectorAll('.gallery-tab').forEach(t => t.classList.remove('gallery-tab--active'));
  btn.classList.add('gallery-tab--active');

  // Show/hide items with stagger
  const items = document.querySelectorAll('.gallery-item');
  let delay = 0;
  items.forEach(item => {
    if (category === 'all' || item.dataset.category === category) {
      item.classList.remove('hidden');
      item.style.animationDelay = `${delay * 0.06}s`;
      item.style.animation = 'none';
      item.offsetHeight; // trigger reflow
      item.style.animation = '';
      delay++;
    } else {
      item.classList.add('hidden');
    }
  });
}

// ===== Lightbox =====
function openLightbox(el) {
  const img = el.querySelector('img');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightbox.classList.add('lightbox--open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox(event) {
  if (event.target.classList.contains('lightbox') || event.target.classList.contains('lightbox__close')) {
    document.getElementById('lightbox').classList.remove('lightbox--open');
    document.body.style.overflow = '';
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.getElementById('lightbox').classList.remove('lightbox--open');
    document.body.style.overflow = '';
  }
});

// ===== Scroll Animations =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(item);
  });
});
