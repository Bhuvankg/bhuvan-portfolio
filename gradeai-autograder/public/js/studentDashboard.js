/**
 * GradeAI Student Dashboard Module
 * Manages Test-Taking, Submissions, Grades & Question-by-Question Feedback
 */

const StudentDashboard = {
  // 1. OVERVIEW
  async renderOverview(container) {
    container.innerHTML = `
      <div class="page-header" style="margin-bottom: 28px;">
        <h2>Student Learning Dashboard</h2>
        <p>Track your assignments, submit work, and review personalized AI evaluations</p>
      </div>

      <div class="metrics-grid" id="student-metrics-grid">
        <div class="metric-card"><p>Loading metrics...</p></div>
      </div>

      <div class="card" style="margin-bottom: 32px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <h4>Active & Upcoming Assignments</h4>
            <p style="font-size: 0.85rem;">Assignments open for submission</p>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="App.navigate('student-assignments')">View All</button>
        </div>
        <div id="student-upcoming-list">
          <p style="color: var(--text-muted);">Loading assignments...</p>
        </div>
      </div>

      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <h4>Recent Grades & Constructive Feedback</h4>
            <p style="font-size: 0.85rem;">Instructor-verified evaluations with question insights</p>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="App.navigate('student-grades')">All Grades</button>
        </div>
        <div id="student-recent-grades-list">
          <p style="color: var(--text-muted);">Loading feedback...</p>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();

    try {
      const [assignData, subsData] = await Promise.all([
        API.getAssignments(),
        API.getMySubmissions()
      ]);

      const assignments = assignData.assignments || [];
      const submissions = subsData.submissions || [];

      // Calculate cumulative average
      const completedWithScore = submissions.filter(s => s.percentage !== null);
      const avgScore = completedWithScore.length > 0
        ? Math.round(completedWithScore.reduce((sum, s) => sum + s.percentage, 0) / completedWithScore.length * 10) / 10
        : 0;

      const pendingCount = assignments.filter(a => !a.submission_id).length;

      document.getElementById('student-metrics-grid').innerHTML = `
        <div class="metric-card">
          <div>
            <div class="metric-label">Enrolled Courses</div>
            <div class="metric-value">2</div>
            <p style="font-size: 0.78rem; color: var(--text-muted);">Active academic term</p>
          </div>
          <div class="metric-icon-box" style="background: var(--primary-light); color: var(--primary);">
            <i data-lucide="book-open"></i>
          </div>
        </div>

        <div class="metric-card">
          <div>
            <div class="metric-label">Pending Assignments</div>
            <div class="metric-value" style="color: ${pendingCount > 0 ? 'var(--warning)' : 'var(--text-main)'};">${pendingCount}</div>
            <p style="font-size: 0.78rem; color: var(--text-muted);">Awaiting your submission</p>
          </div>
          <div class="metric-icon-box" style="background: var(--warning-bg); color: var(--warning);">
            <i data-lucide="clock"></i>
          </div>
        </div>

        <div class="metric-card">
          <div>
            <div class="metric-label">Completed Submissions</div>
            <div class="metric-value">${submissions.length}</div>
            <p style="font-size: 0.78rem; color: var(--text-muted);">Evaluated by platform</p>
          </div>
          <div class="metric-icon-box" style="background: var(--info-bg); color: var(--info);">
            <i data-lucide="check-circle-2"></i>
          </div>
        </div>

        <div class="metric-card">
          <div>
            <div class="metric-label">Cumulative Average</div>
            <div class="metric-value" style="color: var(--success);">${avgScore}%</div>
            <p style="font-size: 0.78rem; color: var(--text-muted);">Overall class standing</p>
          </div>
          <div class="metric-icon-box" style="background: var(--success-bg); color: var(--success);">
            <i data-lucide="award"></i>
          </div>
        </div>
      `;

      // Render upcoming
      const upcomingEl = document.getElementById('student-upcoming-list');
      const openAssignments = assignments.filter(a => !a.submission_id);
      if (!openAssignments.length) {
        upcomingEl.innerHTML = `<p style="padding: 16px; color: var(--text-muted); text-align: center;">You are all caught up! No pending assignments.</p>`;
      } else {
        upcomingEl.innerHTML = openAssignments.map(a => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; border-bottom: 1px solid var(--border-color); flex-wrap: wrap; gap: 12px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="badge badge-primary">${a.course_code}</span>
                <strong style="font-size: 1rem;">${a.title}</strong>
              </div>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">
                Due: ${new Date(a.due_date).toLocaleString()} • ${a.total_marks} Marks
              </p>
            </div>
            <button class="btn btn-primary btn-sm" onclick="StudentDashboard.openTakeAssignment(${a.id})">
              <i data-lucide="edit-3"></i> Take Assignment
            </button>
          </div>
        `).join('');
      }

      // Render recent grades
      const gradesEl = document.getElementById('student-recent-grades-list');
      if (!submissions.length) {
        gradesEl.innerHTML = `<p style="padding: 16px; color: var(--text-muted); text-align: center;">No graded assignments yet.</p>`;
      } else {
        gradesEl.innerHTML = submissions.map(s => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; border-bottom: 1px solid var(--border-color); flex-wrap: wrap; gap: 12px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="badge badge-primary">${s.course_code}</span>
                <strong style="font-size: 1rem;">${s.assignment_title}</strong>
              </div>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">
                ${s.overall_feedback || 'Submission under instructor review.'}
              </p>
            </div>
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="text-align: right;">
                <div style="font-size: 1.25rem; font-weight: 800; color: var(--primary);">
                  ${s.total_score !== null ? s.total_score : '—'} / ${s.max_score}
                </div>
                <span class="badge ${s.status === 'reviewed' ? 'badge-success' : 'badge-warning'}">
                  ${s.grade_letter ? `Grade ${s.grade_letter}` : 'AI Graded'}
                </span>
              </div>
              <button class="btn btn-secondary btn-sm" onclick="StudentDashboard.openStudentSubmissionFeedback(${s.id})">
                <i data-lucide="file-text"></i> Feedback
              </button>
            </div>
          </div>
        `).join('');
      }

      if (window.lucide) lucide.createIcons();
    } catch (e) {
      showToast('Error loading student dashboard: ' + e.message, 'danger');
    }
  },

  // 2. ASSIGNMENTS VIEW
  async renderAssignments(container) {
    container.innerHTML = `
      <div class="page-header" style="margin-bottom: 28px;">
        <h2>My Course Assignments</h2>
        <p>Complete your assignments, write answers, and receive instant feedback</p>
      </div>
      <div id="student-all-assignments-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 24px;">
        <p style="color: var(--text-muted);">Loading assignments...</p>
      </div>
    `;

    try {
      const data = await API.getAssignments();
      const list = data.assignments || [];
      const grid = document.getElementById('student-all-assignments-grid');

      if (!list.length) {
        grid.innerHTML = `<div class="card" style="grid-column: 1 / -1; text-align: center; padding: 48px;"><p>No active assignments published at this time.</p></div>`;
        return;
      }

      grid.innerHTML = list.map(a => {
        const isSubmitted = !!a.submission_id;
        return `
          <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <span class="badge badge-primary">${a.course_code}</span>
                <span class="badge ${isSubmitted ? 'badge-success' : 'badge-warning'}">
                  ${isSubmitted ? 'Submitted' : 'Pending'}
                </span>
              </div>
              <h3 style="font-size: 1.15rem; margin-bottom: 8px;">${a.title}</h3>
              <p style="font-size: 0.88rem; margin-bottom: 16px; color: var(--text-secondary);">
                ${a.description || 'No description.'}
              </p>
              <div style="font-size: 0.84rem; color: var(--text-muted); margin-bottom: 20px;">
                <div><i data-lucide="clock" style="width: 14px;"></i> Due: <strong>${new Date(a.due_date).toLocaleString()}</strong></div>
                <div><i data-lucide="award" style="width: 14px;"></i> Total Marks: <strong>${a.total_marks} pts</strong></div>
                <div><i data-lucide="user" style="width: 14px;"></i> Instructor: ${a.teacher_name}</div>
              </div>
            </div>

            <div style="border-top: 1px solid var(--border-color); padding-top: 16px;">
              ${isSubmitted ? `
                <button class="btn btn-secondary" style="width: 100%;" onclick="StudentDashboard.openStudentSubmissionFeedback(${a.submission_id})">
                  <i data-lucide="file-check"></i> View My Submission & Feedback
                </button>
              ` : `
                <button class="btn btn-primary" style="width: 100%;" onclick="StudentDashboard.openTakeAssignment(${a.id})">
                  <i data-lucide="edit-3"></i> Start Assignment
                </button>
              `}
            </div>
          </div>
        `;
      }).join('');

      if (window.lucide) lucide.createIcons();
    } catch (e) {
      showToast('Error loading assignments: ' + e.message, 'danger');
    }
  },

  // 3. INTERACTIVE TEST-TAKING PORTAL
  async openTakeAssignment(assignmentId) {
    const container = document.getElementById('app-body-container');
    container.innerHTML = `<div class="card" style="padding: 40px; text-align: center;"><p>Loading assignment questions...</p></div>`;

    try {
      const data = await API.getAssignment(assignmentId);
      const a = data.assignment;
      const questions = a.questions || [];

      if (a.existingSubmission) {
        showToast('You have already submitted this assignment.', 'warning');
        this.openStudentSubmissionFeedback(a.existingSubmission.id);
        return;
      }

      container.innerHTML = `
        <div class="page-header" style="margin-bottom: 24px;">
          <button class="btn btn-outline btn-sm" style="margin-bottom: 8px;" onclick="StudentDashboard.renderAssignments(document.getElementById('app-body-container'))">
            <i data-lucide="arrow-left"></i> Back to Assignments
          </button>
          <h2>${a.title}</h2>
          <p>${a.course_code} • Instructor: ${a.teacher_name} • Due: ${new Date(a.due_date).toLocaleString()}</p>
        </div>

        <div class="card" style="margin-bottom: 24px; padding: 18px 24px; background: rgba(99, 102, 241, 0.08); border-left: 4px solid var(--primary);">
          <h4 style="margin-bottom: 6px;">Instructions & Academic Integrity Guidelines</h4>
          <p style="font-size: 0.9rem; margin-bottom: 8px;">${a.instructions || 'Answer all questions to the best of your ability.'}</p>
          <div style="font-size: 0.82rem; color: var(--text-muted);">
            <i data-lucide="shield-alert" style="width: 14px; display: inline;"></i>
            Submissions are automatically analyzed for conceptual depth, criteria satisfaction, and academic integrity.
          </div>
        </div>

        <form id="student-submit-form" onsubmit="StudentDashboard.handleSubmissionSubmit(event, ${a.id})">
          <div style="display: flex; flex-direction: column; gap: 24px; margin-bottom: 32px;">
            ${questions.map((q, idx) => `
              <div class="card" style="border-left: 3px solid ${q.question_type === 'mcq' ? 'var(--primary)' : 'var(--accent-purple)'};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                  <span class="badge ${q.question_type === 'mcq' ? 'badge-primary' : 'badge-info'}">
                    Question ${idx + 1} • ${q.question_type === 'mcq' ? 'Multiple Choice' : 'Short Answer Evaluation'}
                  </span>
                  <strong>${q.marks} Marks</strong>
                </div>

                <p style="font-size: 1.05rem; font-weight: 600; margin-bottom: 18px;">${q.prompt}</p>

                ${q.question_type === 'mcq' ? `
                  <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${(q.options || []).map(opt => `
                      <label style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); cursor: pointer; transition: var(--transition);">
                        <input type="radio" name="question_${q.id}" value="${opt.id}" required style="accent-color: var(--primary); width: 18px; height: 18px;">
                        <span><strong>(${opt.option_letter})</strong> ${opt.option_text}</span>
                      </label>
                    `).join('')}
                  </div>
                ` : `
                  <div>
                    <label class="form-label" style="font-size: 0.85rem; color: var(--text-muted);">
                      Your Written Answer (Type response below):
                    </label>
                    <textarea name="question_${q.id}" class="form-textarea student-answer-text" required rows="5" placeholder="Formulate a thorough, technically accurate explanation covering the necessary definitions and mechanisms..." oninput="StudentDashboard.updateWordCount(this, 'word-count-${q.id}')"></textarea>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; font-size: 0.8rem; color: var(--text-muted);">
                      <span id="word-count-${q.id}">Word count: 0</span>
                      <span>AI Semantic Evaluation Ready</span>
                    </div>
                  </div>
                `}
              </div>
            `).join('')}

            <!-- Optional File Upload -->
            <div class="card">
              <h4 style="margin-bottom: 8px;">Supplementary Document Upload (Optional)</h4>
              <p style="font-size: 0.85rem; margin-bottom: 14px;">Upload code, diagrams, or solution documents (.pdf, .txt, .docx, .py, .cpp)</p>
              <input type="file" id="submission-file-input" class="form-input" accept=".pdf,.txt,.docx,.py,.cpp,.java,.sql">
            </div>
          </div>

          <div class="card" style="padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: gap; gap: 16px;">
            <div>
              <strong>Ready to submit your work?</strong>
              <p style="font-size: 0.84rem; color: var(--text-muted); margin: 0;">Once submitted, your answers will be automatically processed by the AI evaluator.</p>
            </div>
            <button type="submit" class="btn btn-primary btn-lg">
              <i data-lucide="send"></i> Submit Assignment
            </button>
          </div>
        </form>
      `;

      if (window.lucide) lucide.createIcons();
    } catch (e) {
      showToast('Error loading test: ' + e.message, 'danger');
    }
  },

  updateWordCount(textarea, counterId) {
    const text = textarea.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const el = document.getElementById(counterId);
    if (el) el.textContent = `Word count: ${words}`;
  },

  async handleSubmissionSubmit(e, assignmentId) {
    e.preventDefault();
    if (!confirm('Are you sure you want to finalize your submission?')) return;

    const form = e.target;
    const formData = new FormData();
    formData.append('assignment_id', assignmentId);

    const answers = [];
    const textareas = form.querySelectorAll('textarea[name^="question_"]');
    textareas.forEach(t => {
      const qid = Number(t.name.replace('question_', ''));
      answers.push({
        question_id: qid,
        answer_text: t.value.trim()
      });
    });

    const radios = form.querySelectorAll('input[type="radio"]:checked');
    radios.forEach(r => {
      const qid = Number(r.name.replace('question_', ''));
      answers.push({
        question_id: qid,
        selected_option_id: Number(r.value)
      });
    });

    formData.append('answers', JSON.stringify(answers));

    const fileInput = document.getElementById('submission-file-input');
    if (fileInput && fileInput.files[0]) {
      formData.append('submission_file', fileInput.files[0]);
    }

    try {
      showToast('Evaluating submission with AI Auto-Grader...', 'info');
      const res = await API.submitAssignment(formData);
      showToast(`Submitted successfully! Preliminary Score: ${res.preliminaryPercentage}% (${res.preliminaryGrade})`, 'success');
      this.openStudentSubmissionFeedback(res.submissionId);
    } catch (err) {
      showToast('Submission failed: ' + err.message, 'danger');
    }
  },

  // 4. MY GRADES & FEEDBACK
  async renderMyGrades(container) {
    container.innerHTML = `
      <div class="page-header" style="margin-bottom: 28px;">
        <h2>My Grades & Personalized Reports</h2>
        <p>Review comprehensive feedback and question-by-question evaluations</p>
      </div>
      <div id="student-grades-table-card" class="card">
        <p style="color: var(--text-muted);">Loading grades...</p>
      </div>
    `;

    try {
      const data = await API.getMySubmissions();
      const list = data.submissions || [];
      const card = document.getElementById('student-grades-table-card');

      if (!list.length) {
        card.innerHTML = `<div style="text-align: center; padding: 48px;"><p>No submissions recorded yet.</p></div>`;
        return;
      }

      card.innerHTML = `
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Assignment</th>
                <th>Course</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Grade</th>
                <th>Status</th>
                <th>Date Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(s => `
                <tr>
                  <td style="font-weight: 600;">${s.assignment_title}</td>
                  <td><span class="badge badge-primary">${s.course_code}</span></td>
                  <td><strong>${s.total_score !== null ? s.total_score : '—'} / ${s.max_score}</strong></td>
                  <td>${s.percentage !== null ? s.percentage + '%' : '—'}</td>
                  <td><span class="badge ${s.percentage >= 80 ? 'badge-success' : s.percentage >= 60 ? 'badge-primary' : 'badge-warning'}">${s.grade_letter || '—'}</span></td>
                  <td>
                    <span class="badge ${s.status === 'reviewed' ? 'badge-success' : 'badge-warning'}">
                      ${s.status === 'reviewed' ? 'Instructor Verified' : 'AI Evaluated'}
                    </span>
                  </td>
                  <td style="font-size: 0.85rem; color: var(--text-muted);">${new Date(s.submitted_at).toLocaleDateString()}</td>
                  <td>
                    <button class="btn btn-secondary btn-sm" onclick="StudentDashboard.openStudentSubmissionFeedback(${s.id})">
                      <i data-lucide="file-text"></i> View Feedback
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      if (window.lucide) lucide.createIcons();
    } catch (e) {
      showToast('Error loading grades: ' + e.message, 'danger');
    }
  },

  // 5. DETAILED FEEDBACK BREAKDOWN VIEW
  async openStudentSubmissionFeedback(submissionId) {
    const container = document.getElementById('app-body-container');
    container.innerHTML = `<div class="card" style="padding: 40px; text-align: center;"><p>Loading personalized evaluation card...</p></div>`;

    try {
      const data = await API.getSubmissionDetail(submissionId);
      const sub = data.submission;
      const questions = data.questions || [];
      const fb = data.feedback || {};

      container.innerHTML = `
        <div class="page-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <button class="btn btn-outline btn-sm" style="margin-bottom: 8px;" onclick="StudentDashboard.renderMyGrades(document.getElementById('app-body-container'))">
              <i data-lucide="arrow-left"></i> Back to My Grades
            </button>
            <h2>Performance & Feedback Report</h2>
            <p>${sub.course_code} — ${sub.assignment_title}</p>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="window.print()">
            <i data-lucide="printer"></i> Print / Download Report
          </button>
        </div>

        <!-- Grade Summary Card -->
        <div class="card" style="margin-bottom: 28px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%); border-color: rgba(99, 102, 241, 0.3);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
            <div>
              <span class="badge ${sub.status === 'reviewed' ? 'badge-success' : 'badge-warning'}" style="margin-bottom: 8px;">
                ${sub.status === 'reviewed' ? 'INSTRUCTOR APPROVED GRADE' : 'PRELIMINARY AI EVALUATION'}
              </span>
              <h2 style="font-size: 2.5rem; margin-bottom: 4px;">
                ${sub.total_score || 0} / ${sub.max_score} <span style="font-size: 1.25rem; color: var(--primary);">(${sub.percentage || 0}%)</span>
              </h2>
              <p style="font-size: 0.95rem;">Assigned Grade: <strong style="font-size: 1.25rem; color: var(--success);">${sub.grade_letter || '—'}</strong></p>
            </div>
            <div style="max-width: 420px; background: var(--bg-surface); padding: 18px; border-radius: var(--radius-md);">
              <div style="font-weight: 700; font-size: 0.85rem; color: var(--primary); margin-bottom: 6px;">HOLISTIC EVALUATION:</div>
              <p style="font-size: 0.9rem; margin: 0; line-height: 1.5;">${fb.overall_feedback || 'Your answers have been evaluated with constructive semantic feedback below.'}</p>
            </div>
          </div>

          ${fb.strengths ? `
            <div style="margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--border-color); display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div>
                <strong style="color: var(--success); font-size: 0.85rem;"><i data-lucide="check" style="width: 14px; display: inline;"></i> Mastery & Strengths:</strong>
                <p style="font-size: 0.88rem; margin-top: 4px;">${fb.strengths}</p>
              </div>
              <div>
                <strong style="color: var(--warning); font-size: 0.85rem;"><i data-lucide="lightbulb" style="width: 14px; display: inline;"></i> Improvement Areas:</strong>
                <p style="font-size: 0.88rem; margin-top: 4px;">${fb.improvements || 'Continue polishing theoretical rigor.'}</p>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Question Breakdown -->
        <h3 style="margin-bottom: 16px;">Question-by-Question Breakdown</h3>
        <div style="display: flex; flex-direction: column; gap: 20px;">
          ${questions.map((q, idx) => `
            <div class="card">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span class="badge ${q.question_type === 'mcq' ? 'badge-primary' : 'badge-info'}">
                  Question ${idx + 1} • ${q.question_type.toUpperCase()}
                </span>
                <div>
                  <strong style="font-size: 1.1rem; color: ${q.score_awarded >= q.marks * 0.7 ? 'var(--success)' : 'var(--warning)'};">
                    ${q.score_awarded !== null ? q.score_awarded : 0} / ${q.marks} pts
                  </strong>
                </div>
              </div>

              <p style="font-weight: 600; font-size: 1.05rem; margin-bottom: 14px;">${q.prompt}</p>

              <!-- Your Answer -->
              <div style="background: var(--bg-surface); padding: 14px 18px; border-radius: var(--radius-md); margin-bottom: 14px;">
                <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">
                  Your Answer:
                </div>
                ${q.question_type === 'mcq' ? `
                  <div>
                    ${(() => {
                      const selOpt = (q.options || []).find(o => o.id === q.selected_option_id);
                      return selOpt ? `(${selOpt.option_letter}) ${selOpt.option_text}` : '<span style="color: var(--danger);">No option selected</span>';
                    })()}
                  </div>
                ` : `
                  <div style="line-height: 1.6; white-space: pre-wrap;">${q.answer_text || '<span style="color: var(--danger);">No answer submitted.</span>'}</div>
                `}
              </div>

              <!-- AI & Instructor Feedback -->
              <div style="background: rgba(99, 102, 241, 0.05); border: 1px solid rgba(99, 102, 241, 0.15); border-radius: var(--radius-md); padding: 14px 18px;">
                <div style="font-size: 0.8rem; font-weight: 700; color: var(--primary); text-transform: uppercase; margin-bottom: 6px;">
                  Evaluation & Constructive Feedback:
                </div>
                <p style="font-size: 0.9rem; margin-bottom: 10px; color: var(--text-main);">${q.reasoning || 'Evaluated successfully.'}</p>

                ${q.matched_concepts ? `
                  <div style="margin-bottom: 6px;">
                    <span style="font-size: 0.75rem; font-weight: 700; color: var(--success); margin-right: 6px;">CONCEPTS YOU MASTERED:</span>
                    ${q.matched_concepts.split(',').map(c => `<span class="concept-tag concept-matched">${c.trim()}</span>`).join('')}
                  </div>
                ` : ''}

                ${q.missing_concepts ? `
                  <div>
                    <span style="font-size: 0.75rem; font-weight: 700; color: var(--warning); margin-right: 6px;">TARGET CONCEPTS TO REVIEW:</span>
                    ${q.missing_concepts.split(',').map(c => `<span class="concept-tag concept-missing">${c.trim()}</span>`).join('')}
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      `;

      if (window.lucide) lucide.createIcons();
    } catch (e) {
      showToast('Error loading feedback report: ' + e.message, 'danger');
    }
  }
};
