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

  // Reservation form handling using Supabase
  const form = document.getElementById('reservationForm');
  if (form) {
    // Initialize Supabase client (replace with your own URL and anon key)
    const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
    const SUPABASE_ANON_KEY = 'YOUR_ANON_PUBLIC_KEY';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const formData = new FormData(form);
      const reservation = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        datetime: formData.get('datetime'),
        notes: formData.get('notes')
      };

      const { data, error } = await supabaseClient.from('reservations').insert([reservation]);
      if (error) {
        alert('Sorry, we could not save your reservation. Please try again later.');
        console.error(error);
      } else {
        alert('Thank you! Your reservation has been saved.');
        form.reset();
      }
    });
  }

  const form = document.getElementById('reservationForm');
  if (form) {
    // Initialize Supabase client (replace with your own URL and anon key)
    const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
    const SUPABASE_ANON_KEY = 'YOUR_ANON_PUBLIC_KEY';
    const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const formData = new FormData(form);
      const reservation = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        datetime: formData.get('datetime'),
        notes: formData.get('notes')
      };

      const { data, error } = await supabase.from('reservations').insert([reservation]);
      if (error) {
        alert('Sorry, we could not save your reservation. Please try again later.');
        console.error(error);
      } else {
        alert('Thank you! Your reservation has been saved.');
        form.reset();
      }
    });
  }

});
