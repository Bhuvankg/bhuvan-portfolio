/**
 * NOSH RESTO CAFE — Core UI Controller & Global Interactivity
 * Location: Panchavalli, Gonikoppa, Thalassery–Mysore Road, Karnataka 571105
 * Phone: +91 98953 86886
 * Plus Code: 74PP+CM, Panchavalli, Karnataka
 */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileNavigation();
  initHoursStatusBadge();
  initPlusCodeCopy();
  initBackToTop();
  initContactForm();
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

/* Mobile Drawer Navigation */
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

  // Close when tapping any link inside the mobile drawer
  drawer.querySelectorAll('.mobile-drawer-link').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

/* Opening Hours Status Indicator (Closing: 2:00 AM verified) */
function initHoursStatusBadge() {
  const statusPills = document.querySelectorAll('.hours-live-pill');
  if (statusPills.length === 0) return;

  const now = new Date();
  const currentHour = now.getHours();

  // Listed closing time: 2:00 AM.
  // Between 2:00 AM and 10:00 AM, the cafe is typically closed.
  const isLateClosed = (currentHour >= 2 && currentHour < 10);

  statusPills.forEach(pill => {
    if (isLateClosed) {
      pill.innerHTML = `<span class="hours-live-dot" style="background:#e5a93b; box-shadow:0 0 6px #e5a93b;"></span> Reopens 10:00 AM • Closes 2:00 AM`;
      pill.style.borderColor = 'rgba(229, 169, 59, 0.4)';
      pill.style.color = '#e5a93b';
    } else {
      pill.innerHTML = `<span class="hours-live-dot"></span> Open Today until 2:00 AM`;
    }
  });
}

/* Copy Google Maps Plus Code (74PP+CM, Panchavalli, Karnataka) */
function initPlusCodeCopy() {
  const copyButtons = document.querySelectorAll('.plus-code-copy-btn');
  const plusCodeText = '74PP+CM, Panchavalli, Karnataka';

  copyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(plusCodeText).then(() => {
          showGlobalToast('Plus Code copied: 74PP+CM, Panchavalli, Karnataka');
          btn.innerHTML = '✓ Copied to Clipboard';
          setTimeout(() => {
            btn.innerHTML = '📋 Copy Plus Code: 74PP+CM';
          }, 2400);
        }).catch(() => {
          fallbackCopyText(plusCodeText, btn);
        });
      } else {
        fallbackCopyText(plusCodeText, btn);
      }
    });
  });

  function fallbackCopyText(text, btn) {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    input.remove();
    showGlobalToast('Plus Code copied: 74PP+CM, Panchavalli, Karnataka');
    btn.innerHTML = '✓ Copied to Clipboard';
    setTimeout(() => {
      btn.innerHTML = '📋 Copy Plus Code: 74PP+CM';
    }, 2400);
  }
}

/* Back to Top Smooth Button */
function initBackToTop() {
  const btn = document.getElementById('backToTopBtn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* Contact / Table / Kerbside Inquiry Form */
function initContactForm() {
  const form = document.getElementById('noshContactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('[name="name"]')?.value.trim();
    const phone = form.querySelector('[name="phone"]')?.value.trim();
    const serviceType = form.querySelector('[name="serviceType"]')?.value || 'Dine-in';
    const message = form.querySelector('[name="message"]')?.value.trim();

    if (!name || name.length < 2) {
      showGlobalToast('Please enter your name.');
      return;
    }

    if (!phone || phone.length < 10) {
      showGlobalToast('Please enter a valid phone number.');
      return;
    }

    // Try posting to demo backend if active
    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, serviceType, message, timestamp: new Date().toISOString() })
    }).catch(err => console.log('Demo contact note logged:', err));

    showGlobalToast('Thank you! Your message has been received.');
    form.reset();
  });
}

/* Global Toast Helper */
function showGlobalToast(message) {
  if (window.noshCart && typeof window.noshCart.showToast === 'function') {
    window.noshCart.showToast(message);
    return;
  }

  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}
