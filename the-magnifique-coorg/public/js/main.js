// public/js/main.js
document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll for navbar links
  const navLinks = document.querySelectorAll('a.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          window.scrollTo({
            top: targetEl.offsetTop - 70, // offset for fixed navbar
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // Reservation form handling
  const form = document.getElementById('reservationForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      // In a real site, we'd POST to a backend. Here we just confirm.
      alert('Thank you! Your reservation request has been received. We will contact you shortly.');
      form.reset();
    });
  }
});
