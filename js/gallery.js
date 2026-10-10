/**
 * NOSH RESTO CAFE — Photo Gallery Engine
 * Category filtering & Lightbox viewer
 */

document.addEventListener('DOMContentLoaded', () => {
  const filterButtons = document.querySelectorAll('.gallery-filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('galleryLightboxModal');
  const lightboxImg = document.getElementById('lightboxActiveImage');
  const lightboxCaption = document.getElementById('lightboxActiveCaption');
  const closeLightboxBtn = document.getElementById('btnCloseLightbox');

  // Category Filtering
  if (filterButtons.length > 0 && galleryItems.length > 0) {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        galleryItems.forEach(item => {
          const cat = item.getAttribute('data-gallery-cat');
          if (filter === 'all' || cat === filter) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  // Lightbox Modal
  if (galleryItems.length > 0 && lightbox && lightboxImg) {
    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        const title = item.querySelector('.gallery-item-overlay h5')?.textContent || 'Nosh Resto Cafe';
        const subtitle = item.querySelector('.gallery-item-overlay span')?.textContent || '';

        if (img) {
          lightboxImg.src = img.src;
          lightboxImg.alt = img.alt || title;
          if (lightboxCaption) {
            lightboxCaption.textContent = subtitle ? `${title} — ${subtitle}` : title;
          }
          lightbox.classList.add('open');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }

    if (closeLightboxBtn) {
      closeLightboxBtn.addEventListener('click', closeLightbox);
    }

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) {
        closeLightbox();
      }
    });
  }
});
