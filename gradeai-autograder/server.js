require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { initDatabase, getDbType } = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Import Routes
const authRoutes = require('./src/routes/authRoutes');
const assignmentRoutes = require('./src/routes/assignmentRoutes');
const submissionRoutes = require('./src/routes/submissionRoutes');
const gradingRoutes = require('./src/routes/gradingRoutes');
const plagiarismRoutes = require('./src/routes/plagiarismRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Core Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static Assets
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health & System Info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'GradeAI — Intelligent Assignment Auto-Grader',
    version: '1.0.0',
    dbEngine: getDbType(),
    aiEngine: process.env.GEMINI_API_KEY ? 'Google Gemini API' : 'Built-in Semantic Evaluation Engine (Zero-Config Active)',
    timestamp: new Date().toISOString()
  });
});

// Mount API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/grading', gradingRoutes);
app.use('/api/plagiarism', plagiarismRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// Centralized Error Handler
app.use(errorHandler);

// HTML Fallback Routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Boot Server
async function startServer() {
  try {
    console.log('[GradeAI] Initializing database engine...');
    await initDatabase();

    app.listen(PORT, () => {
      console.log('================================================================');
      console.log(`🚀 GradeAI Auto-Grader Server running on http://localhost:${PORT}`);
      console.log(`📊 Database Engine: ${getDbType().toUpperCase()}`);
      console.log(`🤖 AI Engine: ${process.env.GEMINI_API_KEY ? 'Google Gemini' : 'Built-in NLP Semantic Engine'}`);
      console.log(`✨ Open http://localhost:${PORT} in your browser to start grading!`);
      console.log('================================================================');
    });
  } catch (error) {
    console.error('[GradeAI] Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
