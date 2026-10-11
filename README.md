# GradeAI — Intelligent Assignment Auto-Grader

[![Node.js](https://img.shields.io/badge/Node.js-v24+-green.svg)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.22-blue.svg)](https://expressjs.com)
[![Database](https://img.shields.io/badge/Database-MySQL%20%7C%20SQLite-indigo.svg)](https://mysql.com)
[![AI Engine](https://img.shields.io/badge/AI%20Engine-Google%20Gemini%20%2B%20NLP-purple.svg)](https://ai.google.dev)
[![License](https://img.shields.io/badge/License-MIT-teal.svg)](LICENSE)

**GradeAI** is a production-grade, full-stack intelligent assignment auto-grading platform designed for universities, colleges, and educators. It combines automated multiple-choice question (MCQ) scoring, AI-assisted short-answer semantic evaluation, pairwise plagiarism shingle detection, and actionable personalized student feedback into a SaaS web application.

---

## 🌟 Key Features

### 1. 🤖 AI Auto-Grading Engine
- **MCQ Evaluation:** Compares submitted selections against answer keys with immediate mark allocation and question-level explanation rationale.
- **Semantic Short-Answer Evaluation:** Analyzes student answers conceptually against teacher reference answers and multi-criteria rubrics.
- **Concept Extraction:** Highlights concepts mastered (green) and target concepts missing or underdeveloped (amber/red).
- **Teacher-in-the-Loop Review:** AI marks remain suggestions until the instructor verifies or modifies scores and clicks **"Approve & Publish Grade"**.
- **Confidence Rating:** Indicates evaluation certainty (`High`, `Medium`, `Low`) to flag borderline responses for closer human scrutiny.
- **Dual Engine Architecture:** Connects to **Google Gemini API** when `GEMINI_API_KEY` is provided, with an intelligent built-in NLP semantic fallback engine that runs with 100% zero-config reliability offline.

### 2. 🛡️ Plagiarism & Academic Integrity Center
- **Pairwise Cohort Comparison:** Normalizes text and generates 3-word n-gram shingles with Jaccard similarity metrics across all student submissions and reference keys.
- **Side-by-Side Visual Diff:** Side-by-side modal displaying matching passages with highlighted excerpts.
- **Teacher Resolution Workflow:** Instructors review context and mark alerts as **"Cleared (Legitimate Citation / Standard Terminology)"** or **"Flag for Academic Review"**.
- **Ethical Integrity Notice:** Clarifies that textual similarity is not automatic guilt and requires teacher evaluation.

### 3. 📊 Role-Based Portals & Dashboards
- **Faculty Teacher Portal:**
  - Metrics: Total Students, Total Assignments, Pending Evaluations, Class Average, Plagiarism Alerts.
  - Assignment Manager: Wizard with dynamic question builder (MCQ + Short Answer with rubrics, options, keywords).
  - AI Grading Studio: Side-by-side answer inspection, score sliders, and personalized feedback publisher.
  - Analytics & Gradebook: Interactive Chart.js grade distributions, question difficulty ranking, and 1-click **CSV Gradebook Export**.
- **Student Learning Portal:**
  - Active assignments browser with deadlines and instructions.
  - Interactive test-taking portal with live word counter and optional file attachment.
  - Detailed Question-by-Question report cards with marks, mastered concepts, and constructive teacher feedback.
  - Printable/PDF grade summary cards.
- **Administrator Console:**
  - System telemetry: total users, courses, submissions, AI calls, database engine status.
  - User management: account search, role modification, activation/deactivation.
  - Course administration: curriculum codes, semester terms, instructor assignments.
  - Security audit logs: timestamped records of logins, grade approvals, and integrity scans.

### 4. 🎨 SaaS UI/UX Design System
- Dark navy (`#090d16` / `#0f172a`) theme with violet (`#8b5cf6`) and indigo (`#6366f1`) accents.
- Seamless Light Mode toggle (`#f8fafc` / `#ffffff`) with instant persistence.
- Selective glassmorphism, responsive navigation drawer, Lucide iconography, and Chart.js visualizations.
- Interactive **AI Grader Simulator** right on the landing page for live demonstrations.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+), Chart.js, Lucide Icons | Responsive SaaS UI, Dark/Light modes, No heavyweight framework required |
| **Backend** | Node.js, Express.js | Modular REST API with centralized error handling |
| **Database** | MySQL / SQLite Dual Adapter | `mysql2/promise` with schema DDL + embedded `better-sqlite3` auto-fallback |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs | Secure password hashing, RBAC middleware, 7-day sessions |
| **AI Evaluation** | Google Gemini API + NLP Semantic Engine | Tokenization, n-gram shingle indexing, Jaccard similarity, rubric criteria scoring |
| **File Storage** | Multer | File uploads (`.pdf`, `.txt`, `.docx`, code files) with 10MB limits |

---

## 📂 Project Directory Structure

```text
gradeai/
├── public/                     # Static frontend client
│   ├── index.html              # Premium SaaS landing page & simulator
│   ├── app.html                # Main SPA dashboard workspace
│   ├── login.html              # Standalone login view
│   ├── register.html           # Standalone registration view
│   ├── css/
│   │   └── style.css           # Complete SaaS design system (Light/Dark themes)
│   └── js/
│       ├── api.js              # REST API fetch wrapper
│       ├── auth.js             # Session state & 1-click role switcher
│       ├── teacherDashboard.js # Teacher grading studio & analytics
│       ├── studentDashboard.js # Student test-taking & feedback view
│       ├── adminDashboard.js   # Administrator console & audit trail
│       └── app.js              # Router, modals, toasts & simulator
├── src/                        # Server application
│   ├── config/
│   │   └── db.js               # Dual MySQL & SQLite connection manager
│   ├── controllers/            # Business logic handlers
│   │   ├── authController.js
│   │   ├── assignmentController.js
│   │   ├── submissionController.js
│   │   ├── gradingController.js
│   │   ├── plagiarismController.js
│   │   ├── analyticsController.js
│   │   └── adminController.js
│   ├── routes/                 # Express API routes
│   ├── services/
│   │   ├── aiGradingService.js # MCQ & Gemini / NLP semantic evaluation
│   │   └── plagiarismService.js# Shingle comparison & excerpt diffs
│   └── middleware/             # Auth, RBAC, Multer, Error handler
├── database/                   # Database schemas & sample datasets
│   ├── schema.sql              # MySQL relational schema (15 tables)
│   ├── seed.sql                # MySQL seed dataset
│   ├── seedData.js             # Universal sample dataset generator
│   ├── seedRunner.js           # CLI database initialization runner
│   └── testSuite.js            # Automated end-to-end verification suite
├── uploads/                    # Secure student document uploads
├── .env.example                # Environment variable configuration template
├── .env                        # Local configuration
├── package.json                # Dependencies and npm scripts
├── server.js                   # Application entrypoint
└── README.md                   # Complete documentation
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18 or higher (v24+ recommended).
- **npm** v9 or higher.
- *(Optional)* **MySQL Server** 8.0+ if you wish to run MySQL instead of SQLite.

### 2. Installation
Clone or navigate to the repository directory and install dependencies:
```bash
cd c:\antigravity
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default `.env` configuration:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=gradeai_super_secret_jwt_key_2026_education_platform
JWT_EXPIRES_IN=7d

# Database Mode (Set DB_TYPE=mysql for MySQL, or DB_TYPE=sqlite for zero-config embedded SQLite)
DB_TYPE=sqlite
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=gradeai_db

# Optional Google Gemini API Key (Built-in NLP engine is active if left empty)
GEMINI_API_KEY=
AI_MODEL=gemini-1.5-flash

PLAGIARISM_SIMILARITY_THRESHOLD=25
```

### 4. Initialize Database & Sample Data
Run the database seeder to initialize the tables and populate sample courses, assignments, questions, rubrics, and students:
```bash
npm run seed
```

### 5. Launch Application
Start the server:
```bash
npm start
```
The server will boot and display:
```text
================================================================
🚀 GradeAI Auto-Grader Server running on http://localhost:3000
📊 Database Engine: SQLITE (or MYSQL)
🤖 AI Engine: Built-in NLP Semantic Engine (or Google Gemini)
✨ Open http://localhost:3000 in your browser to start grading!
================================================================
```

Open your browser to: **[http://localhost:3000](http://localhost:3000)**.

---

## 🧪 Demo Credentials & 1-Click Role Switcher

For instant testing and presentation demonstrations, GradeAI features **1-Click Demo Login** buttons on the landing page, login modal, and in the dashboard header:

| Role | Demo Email | Demo Password | Purpose |
|---|---|---|---|
| **Faculty Teacher** | `teacher@gradeai.edu` | `Teacher@123` | Create assignments, review AI scores, approve grades, inspect plagiarism |
| **Student (Alex Rivera)** | `student1@gradeai.edu` | `Student@123` | View published Grade A (94%) feedback with mastered concepts breakdown |
| **Student (Brenda Vance)** | `student2@gradeai.edu` | `Student@123` | View Grade B (82%) feedback with missed concepts guidance |
| **Administrator** | `admin@gradeai.edu` | `Admin@123` | User access control, course administration, security audit logs |

---

## 🔬 Testing Major Workflows

You can run the automated test suite at any time:
```bash
node database/testSuite.js
```
All 14 tests verify:
- System health and database connectivity
- Role-based JWT authentication
- Assignment retrieval and question schema verification
- Teacher analytics telemetry
- Plagiarism pairwise scan execution and side-by-side diff inspection
- Teacher grade approval and status transitions
- Admin statistics and user management
- Student feedback cards and Gradebook CSV export

---

## 🗄️ MySQL Database Setup (Optional)

If you have MySQL installed and prefer running on MySQL:
1. Ensure MySQL daemon is running on `localhost:3306`.
2. Update `.env`:
   ```env
   DB_TYPE=mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=gradeai_db
   ```
3. Run schema initialization:
   ```bash
   mysql -u root -p < database/schema.sql
   npm run seed
   ```
4. Start the server:
   ```bash
   npm start
   ```

---

## 🤖 Configuring Google Gemini AI API

To enable live Google Gemini API evaluation for short answers:
1. Obtain an API key from [Google AI Studio](https://aistudio.google.com).
2. Add your key to `.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   AI_MODEL=gemini-1.5-flash
   ```
3. Restart the server:
   ```bash
   npm start
   ```
*Note: If no API key is provided, GradeAI automatically operates in zero-config mode using its built-in NLP semantic evaluation engine.*

---

## 🚢 Production Deployment Instructions

1. **Environment Setup:** Set `NODE_ENV=production` and generate a cryptographically strong `JWT_SECRET` (e.g. `openssl rand -hex 32`).
2. **Reverse Proxy:** Configure Nginx or Apache as a reverse proxy in front of Node.js on port 3000 with SSL/TLS (Certbot / Let's Encrypt).
3. **Process Management:** Use PM2 to run and monitor the application:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "gradeai" -i max
   pm2 save
   ```
4. **Database Backups:** Schedule regular MySQL dumps or SQLite snapshots with cron.

---

## 📄 License
This project is licensed under the MIT License. Developed for university and college evaluation demonstrations.
