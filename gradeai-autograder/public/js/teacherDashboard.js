/**
 * GradeAI Teacher Dashboard Module
 * Manages Overview, Assignments, AI Grading Studio, Plagiarism Review, and Analytics
 */

let activeCharts = {};

function destroyActiveCharts() {
  Object.keys(activeCharts).forEach(key => {
    if (activeCharts[key]) {
      activeCharts[key].destroy();
      delete activeCharts[key];
    }
  });
}

const TeacherDashboard = {
  // 1. OVERVIEW VIEW
  async renderOverview(container) {
    destroyActiveCharts();
    container.innerHTML = `
      <div class="page-header" style="margin-bottom: 28px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2>Teacher Overview</h2>
          <p>Real-time analytics, evaluation queues, and academic integrity monitoring</p>
        </div>
        <div style="display: flex; gap: 12px;">
          <button class="btn btn-secondary btn-sm" onclick="TeacherDashboard.openCreateAssignmentModal()">
            <i data-lucide="plus-circle"></i> Create Assignment
          </button>
          <button class="btn btn-primary btn-sm" onclick="TeacherDashboard.triggerPlagiarismScanAll()">
            <i data-lucide="shield-alert"></i> Scan Plagiarism
          </button>
        </div>
      </div>

      <div class="metrics-grid" id="teacher-metrics-grid">
        <div class="metric-card"><p>Loading metrics...</p></div>
      </div>

      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 32px;">
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h4>Assignment Performance & Scores</h4>
            <span class="badge badge-primary">Class Averages</span>
          </div>
          <div style="height: 280px; position: relative;">
            <canvas id="chart-assignment-performance"></canvas>
          </div>
        </div>

        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h4>Grade Distribution</h4>
            <span class="badge badge-info">Bell Curve</span>
          </div>
          <div style="height: 280px; position: relative;">
            <canvas id="chart-grade-distribution"></canvas>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom: 32px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <h4>Pending Grading & Review Queue</h4>
            <p style="font-size: 0.85rem;">Submissions evaluated by AI awaiting instructor approval</p>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="App.navigate('teacher-assignments')">View All Assignments</button>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Assignment</th>
                <th>Course</th>
                <th>AI Score</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="recent-submissions-tbody">
              <tr><td colspan="7" style="text-align: center; color: var(--text-muted);">Loading submissions...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();

    // Fetch and populate analytics
    try {
      const data = await API.getTeacherAnalytics();
      const s = data.summary;

      document.getElementById('teacher-metrics-grid').innerHTML = `
        <div class="metric-card">
          <div>
            <div class="metric-label">Total Students</div>
            <div class="metric-value">${s.totalStudents}</div>
            <p style="font-size: 0.78rem; color: var(--text-muted);">Enrolled across courses</p>
          </div>
          <div class="metric-icon-box" style="background: var(--primary-light); color: var(--primary);">
            <i data-lucide="users"></i>
          </div>
        </div>

        <div class="metric-card">
          <div>
            <div class="metric-label">Total Assignments</div>
            <div class="metric-value">${s.totalAssignments}</div>
            <p style="font-size: 0.78rem; color: var(--text-muted);">Published & active</p>
          </div>
          <div class="metric-icon-box" style="background: var(--info-bg); color: var(--info);">
            <i data-lucide="file-text"></i>
          </div>
        </div>

        <div class="metric-card">
          <div>
            <div class="metric-label">Pending Evaluations</div>
            <div class="metric-value" style="color: ${s.pendingEvaluations > 0 ? 'var(--warning)' : 'var(--text-main)'};">${s.pendingEvaluations}</div>
            <p style="font-size: 0.78rem; color: var(--text-muted);">Ready for approval</p>
          </div>
          <div class="metric-icon-box" style="background: var(--warning-bg); color: var(--warning);">
            <i data-lucide="clock"></i>
          </div>
        </div>

        <div class="metric-card">
          <div>
            <div class="metric-label">Average Class Score</div>
            <div class="metric-value" style="color: var(--success);">${s.averageClassScore}%</div>
            <p style="font-size: 0.78rem; color: var(--text-muted);">Across completed work</p>
          </div>
          <div class="metric-icon-box" style="background: var(--success-bg); color: var(--success);">
            <i data-lucide="award"></i>
          </div>
        </div>

        <div class="metric-card">
          <div>
            <div class="metric-label">Plagiarism Alerts</div>
            <div class="metric-value" style="color: ${s.plagiarismAlerts > 0 ? 'var(--danger)' : 'var(--text-main)'};">${s.plagiarismAlerts}</div>
            <p style="font-size: 0.78rem; color: var(--text-muted);">Pending verification</p>
          </div>
          <div class="metric-icon-box" style="background: var(--danger-bg); color: var(--danger);">
            <i data-lucide="shield-alert"></i>
          </div>
        </div>
      `;

      // Render Charts
      this.initCharts(data);

      // Render Recent Submissions
      const tbody = document.getElementById('recent-submissions-tbody');
      if (!data.recentSubmissions || data.recentSubmissions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">No submissions found.</td></tr>`;
      } else {
        tbody.innerHTML = data.recentSubmissions.map(sub => `
          <tr>
            <td style="font-weight: 600;">${sub.student_name}</td>
            <td>${sub.assignment_title}</td>
            <td><span class="badge badge-primary">${sub.course_code}</span></td>
            <td>
              <strong>${sub.percentage !== null ? sub.percentage + '%' : 'Pending'}</strong>
              ${sub.grade_letter ? `<span style="font-size: 0.8rem; color: var(--text-muted);">(${sub.grade_letter})</span>` : ''}
            </td>
            <td>
              <span class="badge ${sub.status === 'reviewed' ? 'badge-success' : sub.status === 'flagged' ? 'badge-danger' : 'badge-warning'}">
                ${sub.status === 'ai_graded' ? 'AI Evaluated' : sub.status}
              </span>
            </td>
            <td style="font-size: 0.82rem; color: var(--text-muted);">${new Date(sub.submitted_at).toLocaleDateString()}</td>
            <td>
              <button class="btn btn-secondary btn-sm" onclick="TeacherDashboard.openGradingWorkspace(${sub.id})">
                <i data-lucide="check-square"></i> Review
              </button>
            </td>
          </tr>
        `).join('');
      }

      if (window.lucide) lucide.createIcons();
    } catch (err) {
      console.error(err);
      showToast('Failed to load teacher analytics: ' + err.message, 'danger');
    }
  },

  initCharts(data) {
    if (!window.Chart) return;

    // 1. Assignment Performance Chart
    const perfCtx = document.getElementById('chart-assignment-performance');
    if (perfCtx) {
      const labels = (data.assignmentStats || []).map(a => a.course_code + ': ' + a.title.slice(0, 18) + '...');
      const scores = (data.assignmentStats || []).map(a => a.avg_percentage || 0);

      activeCharts.perf = new Chart(perfCtx, {
        type: 'bar',
        data: {
          labels: labels.length ? labels : ['No Assignments'],
          datasets: [{
            label: 'Average Score (%)',
            data: scores.length ? scores : [0],
            backgroundColor: 'rgba(99, 102, 241, 0.75)',
            borderColor: '#6366f1',
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    // 2. Grade Distribution Chart
    const distCtx = document.getElementById('chart-grade-distribution');
    if (distCtx) {
      const d = data.scoreDistribution || { a: 0, b: 0, c: 0, d: 0, f: 0 };
      activeCharts.dist = new Chart(distCtx, {
        type: 'doughnut',
        data: {
          labels: ['A (90-100%)', 'B (80-89%)', 'C (70-79%)', 'D (60-69%)', 'F (<60%)'],
          datasets: [{
            data: [d.a, d.b, d.c, d.d, d.f],
            backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
          }
        }
      });
    }
  },

  // 2. ASSIGNMENTS VIEW
  async renderAssignments(container) {
    destroyActiveCharts();
    container.innerHTML = `
      <div class="page-header" style="margin-bottom: 28px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2>Assignments Management</h2>
          <p>Create, manage rubrics, schedule deadlines, and monitor student submissions</p>
        </div>
        <button class="btn btn-primary" onclick="TeacherDashboard.openCreateAssignmentModal()">
          <i data-lucide="plus-circle"></i> Create New Assignment
        </button>
      </div>

      <div class="card" style="margin-bottom: 24px; padding: 16px 20px;">
        <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
          <input type="text" id="assign-search-input" class="form-input" style="max-width: 320px;" placeholder="Search assignments..." oninput="TeacherDashboard.filterAssignments()">
          <select id="assign-status-filter" class="form-select" style="max-width: 200px;" onchange="TeacherDashboard.filterAssignments()">
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div id="assignments-list-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 24px;">
        <p style="color: var(--text-muted);">Loading assignments...</p>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
    await this.loadAssignmentsList();
  },

  async loadAssignmentsList() {
    try {
      const data = await API.getAssignments();
      window.currentAssignmentsCache = data.assignments || [];
      this.filterAssignments();
    } catch (err) {
      showToast('Error loading assignments: ' + err.message, 'danger');
    }
  },

  filterAssignments() {
    const search = (document.getElementById('assign-search-input')?.value || '').toLowerCase();
    const status = document.getElementById('assign-status-filter')?.value || '';
    const grid = document.getElementById('assignments-list-grid');

    let list = (window.currentAssignmentsCache || []).filter(a => {
      const matchSearch = a.title.toLowerCase().includes(search) || a.course_code.toLowerCase().includes(search);
      const matchStatus = !status || a.status === status;
      return matchSearch && matchStatus;
    });

    if (!list.length) {
      grid.innerHTML = `<div class="card" style="grid-column: 1 / -1; text-align: center; padding: 48px;">
        <i data-lucide="file-question" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 12px;"></i>
        <h3>No assignments found</h3>
        <p>Create a new assignment to get started.</p>
      </div>`;
      if (window.lucide) lucide.createIcons();
      return;
    }

    grid.innerHTML = list.map(a => `
      <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <span class="badge badge-primary">${a.course_code}</span>
            <span class="badge ${a.status === 'published' ? 'badge-success' : 'badge-warning'}">${a.status}</span>
          </div>
          <h3 style="font-size: 1.15rem; margin-bottom: 8px;">${a.title}</h3>
          <p style="font-size: 0.88rem; margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${a.description || 'No description provided.'}
          </p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.82rem; color: var(--text-muted); margin-bottom: 20px;">
            <div><i data-lucide="award" style="width: 14px;"></i> Total: <strong>${a.total_marks} pts</strong></div>
            <div><i data-lucide="users" style="width: 14px;"></i> Submissions: <strong>${a.total_submissions || 0}</strong></div>
            <div><i data-lucide="clock" style="width: 14px;"></i> Pending: <strong style="color: var(--warning);">${a.pending_submissions || 0}</strong></div>
            <div><i data-lucide="bar-chart" style="width: 14px;"></i> Avg: <strong>${a.avg_score ? a.avg_score.toFixed(1) + '%' : 'N/A'}</strong></div>
          </div>
        </div>

        <div style="border-top: 1px solid var(--border-color); padding-top: 16px; display: flex; gap: 8px; justify-content: space-between;">
          <button class="btn btn-primary btn-sm" onclick="TeacherDashboard.renderSubmissionsView(${a.id}, '${a.title.replace(/'/g, "\\'")}')">
            <i data-lucide="inbox"></i> Submissions (${a.total_submissions || 0})
          </button>
          <button class="btn btn-outline btn-sm" onclick="TeacherDashboard.triggerAssignmentScan(${a.id})">
            <i data-lucide="shield-alert"></i> Plagiarism
          </button>
          <button class="btn btn-outline btn-sm" style="color: var(--danger); border-color: rgba(239, 68, 68, 0.3);" onclick="TeacherDashboard.deleteAssignment(${a.id})">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
  },

  // 3. CREATE ASSIGNMENT MODAL & BUILDER
  async openCreateAssignmentModal() {
    let courses = [];
    try {
      const data = await API.getAssignments();
      const uniqueCourses = {};
      (data.assignments || []).forEach(a => {
        uniqueCourses[a.course_id] = { id: a.course_id, code: a.course_code, title: a.course_title };
      });
      courses = Object.values(uniqueCourses);
    } catch (e) {
      courses = [{ id: 1, code: 'CS101', title: 'Introduction to Algorithms' }];
    }

    const modalContent = `
      <div class="modal-dialog modal-lg">
        <div class="modal-header">
          <h3>Create New Assignment</h3>
          <button class="modal-close-btn" onclick="closeModal()"><i data-lucide="x"></i></button>
        </div>
        <div class="modal-body">
          <form id="create-assignment-form" onsubmit="TeacherDashboard.handleCreateAssignmentSubmit(event)">
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">Assignment Title *</label>
                <input type="text" id="new-assign-title" class="form-input" required placeholder="e.g. Midterm: Data Structures & Graphs">
              </div>
              <div class="form-group">
                <label class="form-label">Target Course *</label>
                <select id="new-assign-course" class="form-select" required>
                  ${courses.map(c => `<option value="${c.id}">${c.code} - ${c.title}</option>`).join('')}
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">Due Date & Deadline *</label>
                <input type="datetime-local" id="new-assign-due" class="form-input" required value="2026-11-20T23:59">
              </div>
              <div class="form-group">
                <label class="form-label">Total Marks</label>
                <input type="number" id="new-assign-marks" class="form-input" value="100" min="10" max="500">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Description & Instructions</label>
              <textarea id="new-assign-desc" class="form-textarea" placeholder="Detail the exam instructions, integrity expectations, and grading criteria..."></textarea>
            </div>

            <div style="border-top: 1px solid var(--border-color); padding-top: 20px; margin-top: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h4>Questions & Evaluation Rubrics</h4>
                <div style="display: flex; gap: 8px;">
                  <button type="button" class="btn btn-secondary btn-sm" onclick="TeacherDashboard.addQuestionToBuilder('mcq')">
                    <i data-lucide="plus"></i> Add MCQ
                  </button>
                  <button type="button" class="btn btn-secondary btn-sm" onclick="TeacherDashboard.addQuestionToBuilder('short_answer')">
                    <i data-lucide="plus"></i> Add Short Answer
                  </button>
                </div>
              </div>

              <div id="questions-builder-list" style="display: flex; flex-direction: column; gap: 16px;">
                <!-- Builder cards inserted dynamically -->
              </div>
            </div>

            <div class="modal-footer" style="padding-left: 0; padding-right: 0; margin-top: 24px;">
              <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary"><i data-lucide="save"></i> Publish Assignment</button>
            </div>
          </form>
        </div>
      </div>
    `;

    openModal(modalContent);
    window.builderQuestions = [];
    // Default 1 MCQ and 1 Short Answer
    this.addQuestionToBuilder('mcq');
    this.addQuestionToBuilder('short_answer');
  },

  addQuestionToBuilder(type) {
    const list = document.getElementById('questions-builder-list');
    if (!list) return;
    const qIndex = window.builderQuestions.length + 1;

    const qObj = {
      id: 'q_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      type: type,
      marks: type === 'mcq' ? 20 : 30
    };
    window.builderQuestions.push(qObj);

    const card = document.createElement('div');
    card.id = qObj.id;
    card.className = 'card';
    card.style.background = 'var(--bg-surface)';
    card.style.padding = '18px';

    if (type === 'mcq') {
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span class="badge badge-primary">Question ${qIndex}: Multiple Choice (MCQ)</span>
          <button type="button" class="btn btn-outline btn-sm" style="color: var(--danger); border: none;" onclick="document.getElementById('${qObj.id}').remove()">
            <i data-lucide="trash"></i>
          </button>
        </div>
        <div class="form-group">
          <label class="form-label">Question Prompt</label>
          <input type="text" class="form-input q-prompt" required placeholder="e.g. Which traversal algorithm discovers shortest paths in unweighted graphs?">
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div><label class="form-label" style="font-size: 0.8rem;">Option A</label><input type="text" class="form-input q-opt-a" required placeholder="Depth-First Search (DFS)"></div>
          <div><label class="form-label" style="font-size: 0.8rem;">Option B</label><input type="text" class="form-input q-opt-b" required placeholder="Breadth-First Search (BFS)"></div>
          <div><label class="form-label" style="font-size: 0.8rem;">Option C</label><input type="text" class="form-input q-opt-c" required placeholder="A* Heuristic Search"></div>
          <div><label class="form-label" style="font-size: 0.8rem;">Option D</label><input type="text" class="form-input q-opt-d" required placeholder="Bellman-Ford Relaxation"></div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div>
            <label class="form-label" style="font-size: 0.8rem;">Correct Option Letter</label>
            <select class="form-select q-correct-opt">
              <option value="A">A</option>
              <option value="B" selected>B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>
          <div>
            <label class="form-label" style="font-size: 0.8rem;">Marks Allocation</label>
            <input type="number" class="form-input q-marks" value="20" min="1" max="100">
          </div>
        </div>
      `;
    } else {
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span class="badge badge-info">Question ${qIndex}: AI Short-Answer Evaluation</span>
          <button type="button" class="btn btn-outline btn-sm" style="color: var(--danger); border: none;" onclick="document.getElementById('${qObj.id}').remove()">
            <i data-lucide="trash"></i>
          </button>
        </div>
        <div class="form-group">
          <label class="form-label">Question Prompt</label>
          <input type="text" class="form-input q-prompt" required placeholder="e.g. Differentiate Dynamic Programming from Divide-and-Conquer.">
        </div>
        <div class="form-group">
          <label class="form-label">Reference Answer (Model Solution for AI Semantic Comparison)</label>
          <textarea class="form-textarea q-ref" required placeholder="Provide the ideal answer for semantic similarity and concept extraction..."></textarea>
        </div>
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label">Mandatory Keywords / Concepts (Comma separated)</label>
            <input type="text" class="form-input q-keywords" placeholder="e.g. overlapping subproblems, optimal substructure, memoization">
          </div>
          <div class="form-group">
            <label class="form-label">Marks Allocation</label>
            <input type="number" class="form-input q-marks" value="30" min="1" max="100">
          </div>
        </div>
      `;
    }

    list.appendChild(card);
    if (window.lucide) lucide.createIcons();
  },

  async handleCreateAssignmentSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('new-assign-title').value;
    const courseId = Number(document.getElementById('new-assign-course').value);
    const dueDate = document.getElementById('new-assign-due').value;
    const totalMarks = Number(document.getElementById('new-assign-marks').value);
    const desc = document.getElementById('new-assign-desc').value;

    const questions = [];
    const questionCards = document.querySelectorAll('#questions-builder-list > .card');

    questionCards.forEach((card, idx) => {
      const isMcq = !!card.querySelector('.q-correct-opt');
      const prompt = card.querySelector('.q-prompt').value;
      const marks = Number(card.querySelector('.q-marks').value) || (isMcq ? 20 : 30);

      if (isMcq) {
        const correctLetter = card.querySelector('.q-correct-opt').value;
        questions.push({
          question_type: 'mcq',
          prompt,
          marks,
          options: [
            { option_letter: 'A', option_text: card.querySelector('.q-opt-a').value, is_correct: correctLetter === 'A' },
            { option_letter: 'B', option_text: card.querySelector('.q-opt-b').value, is_correct: correctLetter === 'B' },
            { option_letter: 'C', option_text: card.querySelector('.q-opt-c').value, is_correct: correctLetter === 'C' },
            { option_letter: 'D', option_text: card.querySelector('.q-opt-d').value, is_correct: correctLetter === 'D' }
          ]
        });
      } else {
        const refAnswer = card.querySelector('.q-ref').value;
        const keywords = card.querySelector('.q-keywords').value;
        questions.push({
          question_type: 'short_answer',
          prompt,
          marks,
          reference_answer: refAnswer,
          keywords: keywords,
          rubrics: [
            { criterion_name: 'Conceptual Accuracy', description: 'Accurate terminology and understanding of subject', weight_percentage: 60, max_points: marks * 0.6 },
            { criterion_name: 'Completeness', description: 'Addresses all components of the prompt thoroughly', weight_percentage: 40, max_points: marks * 0.4 }
          ]
        });
      }
    });

    try {
      showToast('Creating assignment...', 'info');
      await API.createAssignment({
        title,
        course_id: courseId,
        due_date: dueDate,
        total_marks: totalMarks,
        description: desc,
        status: 'published',
        questions
      });
      showToast('Assignment published successfully!', 'success');
      closeModal();
      this.renderAssignments(document.getElementById('app-body-container'));
    } catch (err) {
      showToast('Failed to create assignment: ' + err.message, 'danger');
    }
  },

  async deleteAssignment(id) {
    if (!confirm('Are you sure you want to delete this assignment and all associated student submissions?')) return;
    try {
      await API.deleteAssignment(id);
      showToast('Assignment deleted.', 'success');
      this.loadAssignmentsList();
    } catch (e) {
      showToast('Delete failed: ' + e.message, 'danger');
    }
  },

  // 4. SUBMISSIONS LIST VIEW
  async renderSubmissionsView(assignmentId, assignmentTitle) {
    destroyActiveCharts();
    const container = document.getElementById('app-body-container');
    container.innerHTML = `
      <div class="page-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <button class="btn btn-outline btn-sm" style="margin-bottom: 8px;" onclick="App.navigate('teacher-assignments')">
            <i data-lucide="arrow-left"></i> Back to Assignments
          </button>
          <h2>Submissions: ${assignmentTitle}</h2>
          <p>Review student answers, trigger AI evaluations, and verify grades</p>
        </div>
        <div style="display: flex; gap: 12px;">
          <a class="btn btn-secondary btn-sm" href="/api/analytics/export/csv/${assignmentId}" target="_blank">
            <i data-lucide="download"></i> Export CSV
          </a>
          <button class="btn btn-primary btn-sm" onclick="TeacherDashboard.triggerAssignmentScan(${assignmentId})">
            <i data-lucide="shield-alert"></i> Run Plagiarism Scan
          </button>
        </div>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Total Score</th>
                <th>Percentage</th>
                <th>Grade</th>
                <th>Status</th>
                <th>Plagiarism Alert</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="assign-subs-tbody">
              <tr><td colspan="9" style="text-align: center; color: var(--text-muted);">Loading submissions...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();

    try {
      const data = await API.getSubmissions(assignmentId);
      const tbody = document.getElementById('assign-subs-tbody');

      if (!data.submissions || data.submissions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 32px; color: var(--text-muted);">No student submissions received yet.</td></tr>`;
        return;
      }

      tbody.innerHTML = data.submissions.map(s => `
        <tr>
          <td style="font-weight: 600;">${s.student_name}</td>
          <td style="font-size: 0.85rem; color: var(--text-muted);">${s.student_email}</td>
          <td><strong>${s.total_score !== null ? s.total_score : '—'} / ${s.max_score}</strong></td>
          <td>${s.percentage !== null ? s.percentage + '%' : '—'}</td>
          <td><span class="badge ${s.percentage >= 80 ? 'badge-success' : s.percentage >= 60 ? 'badge-primary' : 'badge-warning'}">${s.grade_letter || '—'}</span></td>
          <td>
            <span class="badge ${s.status === 'reviewed' ? 'badge-success' : s.status === 'flagged' ? 'badge-danger' : 'badge-warning'}">
              ${s.status === 'ai_graded' ? 'AI Evaluated' : s.status}
            </span>
          </td>
          <td>
            ${s.plagiarism_similarity ? `
              <span class="badge ${s.plagiarism_similarity >= 30 ? 'badge-danger' : 'badge-warning'}" style="cursor: pointer;" onclick="App.navigate('teacher-plagiarism')">
                <i data-lucide="alert-triangle"></i> ${s.plagiarism_similarity}% Match
              </span>
            ` : '<span style="color: var(--text-muted); font-size: 0.8rem;">Clean</span>'}
          </td>
          <td style="font-size: 0.82rem; color: var(--text-muted);">${new Date(s.submitted_at).toLocaleString()}</td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="TeacherDashboard.openGradingWorkspace(${s.id})">
              <i data-lucide="edit-3"></i> Grade Studio
            </button>
          </td>
        </tr>
      `).join('');

      if (window.lucide) lucide.createIcons();
    } catch (e) {
      showToast('Failed to load submissions: ' + e.message, 'danger');
    }
  },

  // 5. AI GRADING WORKSPACE & TEACHER REVIEW STUDIO
  async openGradingWorkspace(submissionId) {
    destroyActiveCharts();
    const container = document.getElementById('app-body-container');
    container.innerHTML = `<div class="card" style="padding: 40px; text-align: center;"><p>Loading grading studio for submission #${submissionId}...</p></div>`;

    try {
      const data = await API.getSubmissionDetail(submissionId);
      const sub = data.submission;
      const questions = data.questions || [];
      const fb = data.feedback || {};

      container.innerHTML = `
        <div class="page-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <button class="btn btn-outline btn-sm" style="margin-bottom: 8px;" onclick="TeacherDashboard.renderSubmissionsView(${sub.assignment_id}, '${sub.assignment_title.replace(/'/g, "\\'")}')">
              <i data-lucide="arrow-left"></i> Back to Submissions
            </button>
            <h2>AI Grading Studio: ${sub.student_name}</h2>
            <p>${sub.course_code} — ${sub.assignment_title} (Submitted ${new Date(sub.submitted_at).toLocaleString()})</p>
          </div>
          <div style="display: flex; gap: 12px; align-items: center;">
            <div style="text-align: right; margin-right: 12px;">
              <div style="font-size: 0.82rem; color: var(--text-muted);">Current Grade:</div>
              <div style="font-size: 1.5rem; font-weight: 800; color: var(--primary);">
                ${sub.total_score || 0} / ${sub.max_score} (${sub.percentage || 0}%) [${sub.grade_letter || '—'}]
              </div>
            </div>
            <button class="btn btn-secondary" onclick="TeacherDashboard.reRunAiEvaluation(${sub.id})">
              <i data-lucide="sparkles"></i> Re-Run AI Evaluation
            </button>
            <button class="btn btn-success" onclick="TeacherDashboard.submitTeacherApproval(${sub.id})">
              <i data-lucide="check-circle-2"></i> Approve & Publish Grade
            </button>
          </div>
        </div>

        ${sub.file_url ? `
          <div class="card" style="margin-bottom: 24px; padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; background: var(--bg-surface);">
            <div style="display: flex; align-items: center; gap: 12px;">
              <i data-lucide="paperclip" style="color: var(--primary);"></i>
              <div>
                <strong>Uploaded Submission Attachment:</strong> ${sub.file_name || 'Document'}
              </div>
            </div>
            <a href="${sub.file_url}" target="_blank" class="btn btn-outline btn-sm">
              <i data-lucide="external-link"></i> View Attachment
            </a>
          </div>
        ` : ''}

        <div style="display: grid; grid-template-columns: 2.2fr 1fr; gap: 28px;">
          <!-- Left Column: Question-by-Question Evaluation Breakdown -->
          <div>
            <h3 style="margin-bottom: 16px;">Question Evaluation Breakdown</h3>
            ${questions.map((q, idx) => `
              <div class="question-eval-card" id="q-card-${q.id}">
                <div class="question-eval-header">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <span class="badge ${q.question_type === 'mcq' ? 'badge-primary' : 'badge-info'}">Q${idx + 1} • ${q.question_type.toUpperCase()}</span>
                    <strong>${q.marks} Max Marks</strong>
                  </div>
                  <div>
                    <span class="badge ${q.confidence_level === 'high' ? 'badge-success' : 'badge-warning'}">
                      <i data-lucide="cpu"></i> ${q.confidence_level ? q.confidence_level.toUpperCase() : 'HIGH'} CONFIDENCE
                    </span>
                  </div>
                </div>

                <p style="font-weight: 600; font-size: 1.05rem; margin-bottom: 16px;">${q.prompt}</p>

                <!-- Student Answer Display -->
                <div style="background: var(--bg-surface); border-radius: var(--radius-md); padding: 16px; margin-bottom: 16px;">
                  <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">
                    Student's Answer:
                  </div>
                  ${q.question_type === 'mcq' ? `
                    <div style="font-size: 1rem; color: var(--text-main);">
                      ${(() => {
                        const selOpt = (q.options || []).find(o => o.id === q.selected_option_id);
                        return selOpt ? `Option ${selOpt.option_letter}: ${selOpt.option_text}` : '<span style="color: var(--danger);">No option chosen</span>';
                      })()}
                    </div>
                  ` : `
                    <div style="font-size: 0.95rem; line-height: 1.6; color: var(--text-main); white-space: pre-wrap;">${q.answer_text || '<span style="color: var(--danger); font-style: italic;">No response submitted.</span>'}</div>
                  `}
                </div>

                <!-- Reference Answer for Short Answer -->
                ${q.question_type !== 'mcq' && q.reference_answer ? `
                  <div style="background: rgba(99, 102, 241, 0.08); border-left: 3px solid var(--primary); border-radius: 4px; padding: 12px 16px; margin-bottom: 16px; font-size: 0.88rem;">
                    <strong>Reference Answer & Key Criteria:</strong> ${q.reference_answer}
                  </div>
                ` : ''}

                <!-- AI Evaluation Findings -->
                <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; margin-bottom: 16px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 0.82rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
                      AI Evaluation Analysis
                    </span>
                    <span style="font-size: 0.85rem; font-weight: 600; color: var(--primary);">
                      AI Suggested: ${q.ai_suggested_score !== null ? q.ai_suggested_score : q.score_awarded} / ${q.marks}
                    </span>
                  </div>

                  <p style="font-size: 0.9rem; margin-bottom: 12px; color: var(--text-secondary);">${q.reasoning || 'Auto-evaluated.'}</p>

                  ${q.matched_concepts ? `
                    <div style="margin-bottom: 8px;">
                      <span style="font-size: 0.78rem; font-weight: 700; color: var(--success); margin-right: 6px;">MATCHED CONCEPTS:</span>
                      ${q.matched_concepts.split(',').map(c => `<span class="concept-tag concept-matched"><i data-lucide="check" style="width: 12px; display: inline;"></i> ${c.trim()}</span>`).join('')}
                    </div>
                  ` : ''}

                  ${q.missing_concepts ? `
                    <div>
                      <span style="font-size: 0.78rem; font-weight: 700; color: var(--danger); margin-right: 6px;">MISSING / IMPROVE:</span>
                      ${q.missing_concepts.split(',').map(c => `<span class="concept-tag concept-missing"><i data-lucide="alert-circle" style="width: 12px; display: inline;"></i> ${c.trim()}</span>`).join('')}
                    </div>
                  ` : ''}
                </div>

                <!-- Teacher Score Override & Adjustment -->
                <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 12px; border-top: 1px solid var(--border-color); flex-wrap: wrap; gap: 12px;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <label style="font-weight: 600; font-size: 0.88rem;">Awarded Score:</label>
                    <input type="number" step="0.5" min="0" max="${q.marks}" class="form-input q-score-input" data-qid="${q.id}" value="${q.score_awarded !== null ? q.score_awarded : q.ai_suggested_score || 0}" style="width: 80px; text-align: center; font-weight: 700;">
                    <span style="color: var(--text-muted); font-size: 0.9rem;">/ ${q.marks} pts</span>
                  </div>
                  <div style="flex: 1; max-width: 320px;">
                    <input type="text" class="form-input q-teacher-note" data-qid="${q.id}" placeholder="Teacher specific note for this question..." value="${q.is_approved ? (q.reasoning || '') : ''}" style="font-size: 0.84rem;">
                  </div>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Right Column: Holistic Feedback, Strengths, and Action Notes -->
          <div>
            <div class="card" style="position: sticky; top: 90px;">
              <h4 style="margin-bottom: 16px;">Personalized Feedback Report</h4>

              <div class="form-group">
                <label class="form-label">Overall Feedback</label>
                <textarea id="overall-feedback-input" class="form-textarea" style="min-height: 110px;">${fb.overall_feedback || 'Solid conceptual engagement. Carefully review the targeted recommendations in the question breakdown.'}</textarea>
              </div>

              <div class="form-group">
                <label class="form-label" style="color: var(--success);">Mastered Strengths</label>
                <textarea id="strengths-feedback-input" class="form-textarea" style="min-height: 75px;">${fb.strengths || 'Accurate definition of core algorithms and good understanding of asymptotic principles.'}</textarea>
              </div>

              <div class="form-group">
                <label class="form-label" style="color: var(--warning);">Constructive Next Steps</label>
                <textarea id="improvements-feedback-input" class="form-textarea" style="min-height: 75px;">${fb.improvements || 'Focus on providing mathematical edge-case analyses and verify data structure prerequisites.'}</textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Instructor Private Notes</label>
                <input type="text" id="teacher-notes-input" class="form-input" placeholder="Notes for grading record..." value="${fb.teacher_notes || ''}">
              </div>

              <button class="btn btn-success" style="width: 100%; margin-top: 12px;" onclick="TeacherDashboard.submitTeacherApproval(${sub.id})">
                <i data-lucide="check"></i> Approve & Publish Grade
              </button>
            </div>
          </div>
        </div>
      `;

      if (window.lucide) lucide.createIcons();
    } catch (e) {
      console.error(e);
      showToast('Error opening grading workspace: ' + e.message, 'danger');
    }
  },

  async reRunAiEvaluation(submissionId) {
    try {
      showToast('Executing AI evaluation engine...', 'info');
      await API.triggerAiGrading(submissionId);
      showToast('AI evaluation updated!', 'success');
      this.openGradingWorkspace(submissionId);
    } catch (e) {
      showToast('Evaluation failed: ' + e.message, 'danger');
    }
  },

  async submitTeacherApproval(submissionId) {
    try {
      const scoreInputs = document.querySelectorAll('.q-score-input');
      const questionGrades = [];

      scoreInputs.forEach(input => {
        const qid = Number(input.dataset.qid);
        const score = Number(input.value) || 0;
        const noteInput = document.querySelector(`.q-teacher-note[data-qid="${qid}"]`);
        questionGrades.push({
          question_id: qid,
          score_awarded: score,
          reasoning: noteInput ? noteInput.value : ''
        });
      });

      const overallFeedback = document.getElementById('overall-feedback-input')?.value;
      const strengths = document.getElementById('strengths-feedback-input')?.value;
      const improvements = document.getElementById('improvements-feedback-input')?.value;
      const teacherNotes = document.getElementById('teacher-notes-input')?.value;

      showToast('Approving and publishing student grade...', 'info');
      const res = await API.saveTeacherReview(submissionId, {
        questionGrades,
        overallFeedback,
        strengths,
        improvements,
        teacherNotes
      });

      showToast(`Grade Approved! Final: ${res.gradeLetter} (${res.percentage}%)`, 'success');
      this.openGradingWorkspace(submissionId);
    } catch (e) {
      showToast('Failed to approve grade: ' + e.message, 'danger');
    }
  },

  // 6. PLAGIARISM DETECTION CENTER
  async renderPlagiarismReports(container) {
    destroyActiveCharts();
    container.innerHTML = `
      <div class="page-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2>Academic Integrity & Plagiarism Detection</h2>
          <p>Cross-submission text comparison, n-gram shingling, and highlighted excerpt verification</p>
        </div>
        <button class="btn btn-primary btn-sm" onclick="TeacherDashboard.triggerPlagiarismScanAll()">
          <i data-lucide="play-circle"></i> Run Cross-Submission Scan
        </button>
      </div>

      <div class="card" style="margin-bottom: 24px; padding: 18px 24px; background: rgba(99, 102, 241, 0.06); border-left: 4px solid var(--primary);">
        <div style="display: flex; gap: 14px; align-items: flex-start;">
          <i data-lucide="info" style="color: var(--primary); flex-shrink: 0; margin-top: 2px;"></i>
          <p style="font-size: 0.9rem; margin: 0; color: var(--text-main);">
            <strong>Integrity Notice:</strong> Similarity indices represent textual overlap calculated via 3-word n-gram shingle matching. Similarity is <em>not conclusive proof of plagiarism</em>. Instructors must evaluate common technical terminology, citations, and standard mathematical definitions before taking action.
          </p>
        </div>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Report #</th>
                <th>Assignment</th>
                <th>Student A</th>
                <th>Student B (Peer Match)</th>
                <th>Similarity Score</th>
                <th>Status</th>
                <th>Reported On</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="plagiarism-reports-tbody">
              <tr><td colspan="8" style="text-align: center; color: var(--text-muted);">Loading plagiarism reports...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();

    try {
      const data = await API.getPlagiarismReports();
      const tbody = document.getElementById('plagiarism-reports-tbody');

      if (!data.reports || data.reports.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 36px; color: var(--text-muted);">No plagiarism alerts detected. Run a scan across submissions.</td></tr>`;
        return;
      }

      tbody.innerHTML = data.reports.map(r => `
        <tr>
          <td><strong>#${r.id}</strong></td>
          <td>${r.assignment_title} <span class="badge badge-primary">${r.course_code}</span></td>
          <td style="font-weight: 600;">${r.student_name_a}</td>
          <td style="font-weight: 600;">${r.student_name_b || 'Reference Key'}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="badge ${r.similarity_score >= 50 ? 'badge-danger' : r.similarity_score >= 25 ? 'badge-warning' : 'badge-info'}" style="font-size: 0.85rem;">
                ${r.similarity_score}% Match
              </span>
            </div>
          </td>
          <td>
            <span class="badge ${r.review_status === 'cleared' ? 'badge-success' : r.review_status === 'flagged' ? 'badge-danger' : 'badge-warning'}">
              ${r.review_status.toUpperCase()}
            </span>
          </td>
          <td style="font-size: 0.82rem; color: var(--text-muted);">${new Date(r.created_at).toLocaleDateString()}</td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="TeacherDashboard.openPlagiarismComparisonModal(${r.id})">
              <i data-lucide="eye"></i> Inspect Diff
            </button>
          </td>
        </tr>
      `).join('');

      if (window.lucide) lucide.createIcons();
    } catch (e) {
      showToast('Error loading plagiarism reports: ' + e.message, 'danger');
    }
  },

  async openPlagiarismComparisonModal(reportId) {
    try {
      const data = await API.getPlagiarismReportDetail(reportId);
      const r = data.report;
      const excerpts = r.matching_excerpts || [];

      const modalContent = `
        <div class="modal-dialog modal-lg">
          <div class="modal-header">
            <div>
              <h3>Cross-Submission Text Comparison Report #${r.id}</h3>
              <p style="font-size: 0.85rem; color: var(--text-muted);">${r.assignment_title}</p>
            </div>
            <button class="modal-close-btn" onclick="closeModal()"><i data-lucide="x"></i></button>
          </div>
          <div class="modal-body">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: var(--bg-surface); padding: 14px 20px; border-radius: var(--radius-md);">
              <div>
                <strong>Comparing:</strong> ${r.student_name_a} vs. ${r.student_name_b || 'Reference Key'}
              </div>
              <div>
                <span class="badge ${r.similarity_score >= 50 ? 'badge-danger' : 'badge-warning'}" style="font-size: 0.95rem;">
                  ${r.similarity_score}% Textual Similarity
                </span>
              </div>
            </div>

            <div style="margin-bottom: 20px;">
              <h4>Matching Excerpt Passages Detected</h4>
              ${excerpts.length ? excerpts.map((ex, idx) => `
                <div style="margin-top: 14px; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px;">
                  <div style="font-weight: 600; margin-bottom: 8px; color: var(--primary);">
                    ${ex.questionPrompt || `Question #${ex.questionId || idx + 1}`} (Overlap: ${ex.similarityScore || r.similarity_score}%)
                  </div>
                  <div class="plagiarism-split-view">
                    <div class="plagiarism-panel">
                      <div style="font-weight: 700; font-size: 0.8rem; margin-bottom: 6px; color: var(--text-muted);">${r.student_name_a}'s Submission:</div>
                      <div>${this.highlightMatchingWords(ex.textA || '', ex.matchedText || '')}</div>
                    </div>
                    <div class="plagiarism-panel">
                      <div style="font-weight: 700; font-size: 0.8rem; margin-bottom: 6px; color: var(--text-muted);">${r.student_name_b}'s Submission:</div>
                      <div>${this.highlightMatchingWords(ex.textB || '', ex.matchedText || '')}</div>
                    </div>
                  </div>
                </div>
              `).join('') : `
                <div class="card" style="padding: 24px; text-align: center; color: var(--text-muted);">
                  General vocabulary overlap observed in sentence structures.
                </div>
              `}
            </div>

            <div class="form-group" style="margin-top: 24px;">
              <label class="form-label">Instructor Review Rationale & Notes</label>
              <textarea id="plagiarism-resolution-notes" class="form-textarea" placeholder="Explain your findings (e.g. valid citation, identical code implementation, intentional collaboration)...">${r.teacher_notes || ''}</textarea>
            </div>

            <div class="modal-footer" style="padding-left: 0; padding-right: 0;">
              <button class="btn btn-outline" onclick="closeModal()">Close</button>
              <button class="btn btn-secondary" onclick="TeacherDashboard.resolvePlagiarism(${r.id}, 'cleared')">
                <i data-lucide="check"></i> Clear as False Positive / Citation
              </button>
              <button class="btn btn-danger" onclick="TeacherDashboard.resolvePlagiarism(${r.id}, 'flagged')">
                <i data-lucide="alert-octagon"></i> Flag for Academic Review
              </button>
            </div>
          </div>
        </div>
      `;

      openModal(modalContent);
    } catch (e) {
      showToast('Error opening report: ' + e.message, 'danger');
    }
  },

  highlightMatchingWords(fullText, matchingSegment) {
    if (!fullText) return '<span style="color: var(--text-muted);">No text available</span>';
    if (!matchingSegment) return fullText;
    const cleanFull = fullText.trim();
    const cleanMatch = matchingSegment.trim();
    if (cleanFull.includes(cleanMatch)) {
      return cleanFull.replace(cleanMatch, `<span class="highlight-match">${cleanMatch}</span>`);
    }
    return `<span class="highlight-match">${cleanFull}</span>`;
  },

  async resolvePlagiarism(reportId, status) {
    const notes = document.getElementById('plagiarism-resolution-notes')?.value || '';
    try {
      showToast(`Updating report as ${status}...`, 'info');
      await API.updatePlagiarismStatus(reportId, status, notes);
      showToast(`Report marked as ${status}.`, 'success');
      closeModal();
      this.renderPlagiarismReports(document.getElementById('app-body-container'));
    } catch (e) {
      showToast('Resolution failed: ' + e.message, 'danger');
    }
  },

  async triggerAssignmentScan(assignmentId) {
    try {
      showToast('Initiating plagiarism scan...', 'info');
      const res = await API.scanPlagiarism(assignmentId);
      showToast(res.message, 'success');
      App.navigate('teacher-plagiarism');
    } catch (e) {
      showToast('Scan failed: ' + e.message, 'danger');
    }
  },

  async triggerPlagiarismScanAll() {
    try {
      showToast('Scanning all submissions for CS101...', 'info');
      const res = await API.scanPlagiarism(1);
      showToast(res.message, 'success');
      App.navigate('teacher-plagiarism');
    } catch (e) {
      showToast('Scan failed: ' + e.message, 'danger');
    }
  },

  // 7. ANALYTICS & REPORTS VIEW
  async renderAnalytics(container) {
    destroyActiveCharts();
    container.innerHTML = `
      <div class="page-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2>Performance Analytics & Gradebook</h2>
          <p>Question difficulty analysis, student score trajectories, and exportable records</p>
        </div>
        <div style="display: flex; gap: 12px;">
          <a class="btn btn-secondary btn-sm" href="/api/analytics/export/csv/all" target="_blank">
            <i data-lucide="file-spreadsheet"></i> Export Full Gradebook CSV
          </a>
          <button class="btn btn-primary btn-sm" onclick="window.print()">
            <i data-lucide="printer"></i> Print / PDF Report
          </button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px;">
        <div class="card">
          <h4>Course Grade Distribution</h4>
          <div style="height: 260px; position: relative; margin-top: 14px;">
            <canvas id="chart-analytics-dist"></canvas>
          </div>
        </div>
        <div class="card">
          <h4>Assignment Completion & Averages</h4>
          <div style="height: 260px; position: relative; margin-top: 14px;">
            <canvas id="chart-analytics-avgs"></canvas>
          </div>
        </div>
      </div>

      <div class="card">
        <h4 style="margin-bottom: 16px;">Question Difficulty Index (Most Missed Questions)</h4>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Question Prompt</th>
                <th>Type</th>
                <th>Assignment</th>
                <th>Max Marks</th>
                <th>Average Awarded</th>
                <th>Success Rate (%)</th>
              </tr>
            </thead>
            <tbody id="question-difficulty-tbody">
              <tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Loading difficulty breakdown...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();

    try {
      const data = await API.getTeacherAnalytics();
      const tbody = document.getElementById('question-difficulty-tbody');

      if (!data.questionDifficulty || !data.questionDifficulty.length) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 24px; color: var(--text-muted);">No question statistics recorded.</td></tr>`;
      } else {
        tbody.innerHTML = data.questionDifficulty.map(q => `
          <tr>
            <td style="font-weight: 500; max-width: 380px;">${q.prompt}</td>
            <td><span class="badge ${q.question_type === 'mcq' ? 'badge-primary' : 'badge-info'}">${q.question_type.toUpperCase()}</span></td>
            <td>${q.assignment_title}</td>
            <td><strong>${q.marks}</strong></td>
            <td>${q.avg_awarded || 0}</td>
            <td>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="badge ${q.success_rate >= 75 ? 'badge-success' : q.success_rate >= 50 ? 'badge-warning' : 'badge-danger'}">
                  ${q.success_rate || 0}%
                </span>
              </div>
            </td>
          </tr>
        `).join('');
      }

      // Charts
      const distCtx = document.getElementById('chart-analytics-dist');
      if (distCtx && window.Chart) {
        const d = data.scoreDistribution || { a: 0, b: 0, c: 0, d: 0, f: 0 };
        activeCharts.dist2 = new Chart(distCtx, {
          type: 'bar',
          data: {
            labels: ['F (<60)', 'D (60-69)', 'C (70-79)', 'B (80-89)', 'A (90-100)'],
            datasets: [{
              label: 'Students Count',
              data: [d.f, d.d, d.c, d.b, d.a],
              backgroundColor: ['#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6', '#10b981'],
              borderRadius: 6
            }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
      }

      const avgsCtx = document.getElementById('chart-analytics-avgs');
      if (avgsCtx && window.Chart) {
        const stats = data.assignmentStats || [];
        activeCharts.avgs = new Chart(avgsCtx, {
          type: 'line',
          data: {
            labels: stats.map(s => s.course_code),
            datasets: [{
              label: 'Class Average (%)',
              data: stats.map(s => s.avg_percentage || 0),
              borderColor: '#6366f1',
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              fill: true,
              tension: 0.3
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { min: 0, max: 100 } }
          }
        });
      }

      if (window.lucide) lucide.createIcons();
    } catch (e) {
      showToast('Failed to load analytics: ' + e.message, 'danger');
    }
  },

  // 8. CLASSES & STUDENTS ROSTER
  async renderClasses(container) {
    destroyActiveCharts();
    container.innerHTML = `
      <div class="page-header" style="margin-bottom: 24px;">
        <h2>My Classes & Student Rosters</h2>
        <p>Courses under your faculty instruction and registered student cohorts</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
        <div class="card">
          <span class="badge badge-primary" style="margin-bottom: 8px;">CS101</span>
          <h3>Introduction to Algorithms & Complexity</h3>
          <p style="font-size: 0.9rem; margin: 8px 0 16px;">Comprehensive analysis of divide-and-conquer, greedy techniques, dynamic programming, and asymptotic bounds.</p>
          <div style="border-top: 1px solid var(--border-color); padding-top: 12px; font-size: 0.88rem; color: var(--text-muted);">
            Enrolled Students: <strong>5 Learners</strong>
          </div>
        </div>

        <div class="card">
          <span class="badge badge-primary" style="margin-bottom: 8px;">AI202</span>
          <h3>Foundations of Artificial Intelligence & NLP</h3>
          <p style="font-size: 0.9rem; margin: 8px 0 16px;">Deep learning fundamentals, vector semantics, self-attention architectures, and language modeling.</p>
          <div style="border-top: 1px solid var(--border-color); padding-top: 12px; font-size: 0.88rem; color: var(--text-muted);">
            Enrolled Students: <strong>3 Learners</strong>
          </div>
        </div>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  }
};
