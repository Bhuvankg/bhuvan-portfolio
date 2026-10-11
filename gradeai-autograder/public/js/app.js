/**
 * GradeAI Main Application Controller
 * Manages Routing, Theme, Modals, Toasts, and Landing Page Interactive Simulator
 */

// Toast Notifications System
function showToast(message, type = 'info') {
  let container = document.getElementById('global-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'global-toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast badge-${type}`;
  toast.style.borderLeft = `4px solid var(--${type === 'info' ? 'primary' : type})`;

  const iconName = type === 'success' ? 'check-circle' : type === 'danger' ? 'alert-octagon' : type === 'warning' ? 'alert-triangle' : 'info';

  toast.innerHTML = `
    <i data-lucide="${iconName}" style="flex-shrink: 0; width: 18px; height: 18px;"></i>
    <div style="flex: 1; font-weight: 500;">${message}</div>
    <button style="background: none; border: none; color: inherit; cursor: pointer; padding: 0 4px;" onclick="this.parentElement.remove()">
      <i data-lucide="x" style="width: 14px; height: 14px;"></i>
    </button>
  `;

  container.appendChild(toast);
  if (window.lucide) lucide.createIcons({ root: toast });

  setTimeout(() => {
    if (toast.parentElement) toast.remove();
  }, 4500);
}

// Modal Helpers
function openModal(contentHtml) {
  let overlay = document.getElementById('global-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'global-modal-overlay';
    overlay.className = 'modal-overlay';
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = contentHtml;
  overlay.classList.add('active');
  if (window.lucide) lucide.createIcons({ root: overlay });

  overlay.onclick = (e) => {
    if (e.target === overlay) closeModal();
  };
}

function closeModal() {
  const overlay = document.getElementById('global-modal-overlay');
  if (overlay) overlay.classList.remove('active');
}

// Theme Manager
function initTheme() {
  const saved = localStorage.getItem('gradeai_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcons(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('gradeai_theme', next);
  updateThemeIcons(next);
}

function updateThemeIcons(theme) {
  const btns = document.querySelectorAll('.theme-toggle-btn');
  btns.forEach(b => {
    b.innerHTML = theme === 'dark' ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
  });
  if (window.lucide) lucide.createIcons();
}

// Main Application Controller
const App = {
  currentView: null,

  initDashboard() {
    initTheme();
    const user = Auth.getUser();
    if (!user) {
      window.location.href = '/index.html';
      return;
    }

    // Populate header profile
    const userNameEl = document.getElementById('topbar-user-name');
    const userRoleEl = document.getElementById('topbar-user-role');
    const userAvatarEl = document.getElementById('topbar-user-avatar');
    const roleSelect = document.getElementById('role-switcher-select');

    if (userNameEl) userNameEl.textContent = user.name;
    if (userRoleEl) userRoleEl.textContent = user.role_name.toUpperCase();
    if (userAvatarEl) userAvatarEl.textContent = user.name.slice(0, 2).toUpperCase();
    if (roleSelect) {
      roleSelect.value = user.role_name;
    }

    // Configure sidebar items visibility based on user role
    this.setupSidebarForRole(user.role_name);

    // Initial navigation
    const defaultView = user.role_name === 'teacher'
      ? 'teacher-overview'
      : user.role_name === 'student'
      ? 'student-overview'
      : 'admin-overview';

    this.navigate(defaultView);
  },

  setupSidebarForRole(role) {
    const teacherLinks = document.getElementById('sidebar-teacher-section');
    const studentLinks = document.getElementById('sidebar-student-section');
    const adminLinks = document.getElementById('sidebar-admin-section');

    if (teacherLinks) teacherLinks.style.display = role === 'teacher' ? 'block' : 'none';
    if (studentLinks) studentLinks.style.display = role === 'student' ? 'block' : 'none';
    if (adminLinks) adminLinks.style.display = role === 'admin' ? 'block' : 'none';
  },

  navigate(viewId) {
    this.currentView = viewId;
    const container = document.getElementById('app-body-container');
    if (!container) return;

    // Highlight active link in sidebar
    document.querySelectorAll('.sidebar-item').forEach(el => {
      el.classList.toggle('active', el.dataset.view === viewId);
    });

    switch (viewId) {
      // Teacher views
      case 'teacher-overview':
        TeacherDashboard.renderOverview(container);
        break;
      case 'teacher-assignments':
        TeacherDashboard.renderAssignments(container);
        break;
      case 'teacher-plagiarism':
        TeacherDashboard.renderPlagiarismReports(container);
        break;
      case 'teacher-analytics':
        TeacherDashboard.renderAnalytics(container);
        break;
      case 'teacher-classes':
        TeacherDashboard.renderClasses(container);
        break;

      // Student views
      case 'student-overview':
        StudentDashboard.renderOverview(container);
        break;
      case 'student-assignments':
        StudentDashboard.renderAssignments(container);
        break;
      case 'student-grades':
        StudentDashboard.renderMyGrades(container);
        break;

      // Admin views
      case 'admin-overview':
        AdminDashboard.renderOverview(container);
        break;
      case 'admin-users':
        AdminDashboard.renderUsers(container);
        break;
      case 'admin-courses':
        AdminDashboard.renderCourses(container);
        break;
      case 'admin-audit':
        AdminDashboard.renderAuditLogs(container);
        break;

      default:
        container.innerHTML = `<div class="card" style="padding: 40px; text-align: center;"><h3>View ${viewId}</h3></div>`;
    }
  }
};

// Interactive Live Grader Simulator on Landing Page
const LandingSimulator = {
  currentQuestionType: 'short_answer',

  sampleAnswers: {
    perfect: 'Dynamic Programming breaks an optimization problem into overlapping subproblems with optimal substructure. It avoids repetitive computations by caching computed answers using memoization or bottom-up tabulation.',
    partial: 'Dynamic programming uses tables to remember calculations so we do not repeat them when problems are overlapping.',
    flawed: 'Dynamic programming is sorting items in ascending order using recursion and quicksort.'
  },

  setAnswer(type) {
    const input = document.getElementById('simulator-answer-input');
    if (input && this.sampleAnswers[type]) {
      input.value = this.sampleAnswers[type];
      this.runSimulation();
    }
  },

  async runSimulation() {
    const input = document.getElementById('simulator-answer-input');
    const resultBox = document.getElementById('simulator-result-box');
    if (!input || !resultBox) return;

    const answer = input.value.trim();
    if (!answer) {
      resultBox.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem;">Type an answer above or choose a sample to test evaluation.</p>`;
      return;
    }

    resultBox.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; color: var(--primary);">
        <i data-lucide="loader-2" class="spin-animation"></i> Analyzing answer semantics, concepts, and criteria...
      </div>
    `;
    if (window.lucide) lucide.createIcons({ root: resultBox });

    // Client-side instant evaluation approximation for landing page demo
    setTimeout(() => {
      const lower = answer.toLowerCase();
      let score = 0;
      let matched = [];
      let missing = [];
      const max = 30;

      const keywords = ['overlapping subproblems', 'optimal substructure', 'memoization', 'tabulation', 'caching'];
      keywords.forEach(kw => {
        if (lower.includes(kw) || (kw === 'caching' && lower.includes('cache')) || (kw === 'overlapping subproblems' && lower.includes('overlapping'))) {
          matched.push(kw);
        } else {
          missing.push(kw);
        }
      });

      if (matched.length >= 3) {
        score = 28;
      } else if (matched.length >= 1) {
        score = 18;
      } else {
        score = 6;
      }

      const pct = Math.round((score / max) * 100);

      resultBox.innerHTML = `
        <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="badge ${pct >= 80 ? 'badge-success' : pct >= 60 ? 'badge-primary' : 'badge-danger'}">
                AI Suggested: ${score} / ${max} pts (${pct}%)
              </span>
              <span class="badge badge-info">HIGH CONFIDENCE</span>
            </div>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Evaluation Latency: 142ms</span>
          </div>

          <p style="font-size: 0.9rem; margin-bottom: 12px; color: var(--text-main);">
            ${pct >= 80
              ? 'Outstanding response! Accurately distinguishes overlapping subproblems and caching mechanisms.'
              : pct >= 60
              ? 'Good conceptual foundation. Touches on caching but missed formal optimal substructure terminology.'
              : 'Minimal conceptual overlap. The answer misses the core definition of dynamic programming.'}
          </p>

          <div style="margin-bottom: 8px;">
            <span style="font-size: 0.75rem; font-weight: 700; color: var(--success); margin-right: 6px;">CONCEPTS DETECTED:</span>
            ${matched.length ? matched.map(m => `<span class="concept-tag concept-matched">${m}</span>`).join('') : '<span style="font-size: 0.8rem; color: var(--text-muted);">None detected</span>'}
          </div>

          <div>
            <span style="font-size: 0.75rem; font-weight: 700; color: var(--warning); margin-right: 6px;">RECOMMENDED TO INCLUDE:</span>
            ${missing.slice(0, 3).map(m => `<span class="concept-tag concept-missing">${m}</span>`).join('')}
          </div>
        </div>
      `;

      if (window.lucide) lucide.createIcons({ root: resultBox });
    }, 400);
  }
};

// Global Init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  if (window.lucide) lucide.createIcons();
});
