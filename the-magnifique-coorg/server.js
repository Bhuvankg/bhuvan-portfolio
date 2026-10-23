// server.js
const express = require('express');
const path = require('path');

const app = express();

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// For any other route, serve index.html (single-page fallback)
// Parse JSON bodies
app.use(express.json());

// API endpoint for reservation submissions
app.post('/api/reservation', (req, res) => {
  const reservation = req.body;
  console.log('Reservation received:', reservation);
  // In a real app, you'd store this in a database or send an email.
  res.json({ status: 'success', message: 'Reservation received' });
});

// For any other route, serve index.html (single-page fallback)
app.get('*', (req, res) => {

  res.sendFile(path.join(__dirname, 'public', 'index.html')));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
