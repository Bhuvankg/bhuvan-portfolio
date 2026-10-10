/**
 * PUTHARI RESTAURANT — Core UI Controller & Global Interactivity
 * Kampalapura, Karnataka
 */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileNavigation();
  initBackToTop();
  initPlusCodeCopy();
  initContactForm();
  initGalleryLightbox();
  initHoursStatusBadge();
});

/* Sticky Header on Scroll */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* Mobile Navigation Drawer */
function initMobileNavigation() {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const drawer = document.getElementById('mobileNavDrawer');
  const overlay = document.getElementById('mobileNavOverlay');

  if (!toggleBtn || !drawer || !overlay) return;

  function openDrawer() {
    toggleBtn.classList.add('open');
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    toggleBtn.classList.remove('open');
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', () => {
    if (drawer.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  overlay.addEventListener('click', closeDrawer);

  // Close when clicking any nav link
  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

/* Back to Top Smooth Scroll */
function initBackToTop() {
  const backBtn = document.getElementById('backToTopBtn');
  if (!backBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backBtn.classList.add('visible');
    } else {
      backBtn.classList.remove('visible');
    }
  }, { passive: true });

  backBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* Plus Code Copy Utility */
function initPlusCodeCopy() {
  const copyBtn = document.getElementById('btnCopyPlusCode');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const plusCode = '85P2+2W Kampalapura, Karnataka';
    navigator.clipboard.writeText(plusCode).then(() => {
      if (window.puthariCart) {
        window.puthariCart.showToast('Copied Plus Code: 85P2+2W');
      } else {
        alert('Copied Plus Code: ' + plusCode);
      }
    }).catch(() => {
      // Fallback
      alert('Plus Code: ' + plusCode);
    });
  });
}

/* Contact / Table Reservation Form */
function initContactForm() {
  const form = document.getElementById('puthariContactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      guests: formData.get('guests') || '2',
      date: formData.get('date') || 'Today',
      time: formData.get('time') || 'Dinner',
      message: formData.get('message') || '',
      type: formData.get('inquiryType') || 'Reservation'
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.innerHTML : 'Submit';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Sending Request...</span>';
    }

    try {
      // Send to local Express backend if running
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).catch(() => {});
    } catch (err) {}

    setTimeout(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }

      form.innerHTML = `
        <div style="background: rgba(22,62,43,0.4); border: 1px solid var(--color-gold); border-radius: 12px; padding: 24px; text-align: center;">
          <div style="font-size: 2.2rem; color: var(--color-gold); margin-bottom: 8px;">✓</div>
          <h4 style="font-family: var(--font-serif); font-size: 1.25rem; color: #FFF; margin-bottom: 6px;">Thank You, ${data.name}!</h4>
          <p style="font-size: 0.88rem; color: var(--color-text-muted); line-height: 1.5; margin-bottom: 16px;">
            Your inquiry has been received. Our Kampalapura team will confirm your table reservation via phone call or WhatsApp message.
          </p>
          <a href="https://wa.me/?text=${encodeURIComponent(`Hello Puthari Restaurant! I am ${data.name} and would like to reserve a table for ${data.guests} guests on ${data.date} at ${data.time}.`)}" target="_blank" class="btn btn-primary btn-sm" style="background:#25D366; color:#FFF; border:none;">
            Confirm Instantly via WhatsApp
          </a>
        </div>
      `;
    }, 600);
  });
}

/* Gallery Lightbox */
function initGalleryLightbox() {
  const lightbox = document.getElementById('galleryLightbox');
  if (!lightbox) return;

  const lightboxImg = lightbox.querySelector('.lightbox-image');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const closeBtn = lightbox.querySelector('.lightbox-close-btn');

  function openLightbox(src, caption) {
    if (lightboxImg) lightboxImg.src = src;
    if (lightboxCaption) lightboxCaption.textContent = caption || 'Puthari Restaurant Experience';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const title = item.querySelector('.gallery-item-title');
      if (img) {
        openLightbox(img.src, title ? title.textContent : img.alt);
      }
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) {
      closeLightbox();
    }
  });
}

/* Dynamic Open / Late Night Hours Indicator */
function initHoursStatusBadge() {
  const badge = document.getElementById('hoursLiveStatus');
  if (!badge) return;

  const now = new Date();
  const hours = now.getHours();

  // Listed as closing at 2:00 AM (Open 11:00 AM to 2:00 AM)
  const isOpen = (hours >= 11 || hours < 2);

  if (isOpen) {
    badge.innerHTML = `<span style="color:#2ECC71;">●</span> Open Now (Closes 2:00 AM)`;
    badge.style.color = '#E2F8EB';
  } else {
    badge.innerHTML = `<span style="color:#E67E22;">●</span> Opens at 11:00 AM (Closes 2:00 AM)`;
    badge.style.color = '#FDEBD0';
  }
}
