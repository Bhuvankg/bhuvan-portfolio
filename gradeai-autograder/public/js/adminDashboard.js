/**
 * GradeAI Administrator Dashboard Module
 * Manages Platform Statistics, User Access, Course Administration, and Security Audit Logs
 */

const AdminDashboard = {
  // 1. SYSTEM OVERVIEW
  async renderOverview(container) {
    container.innerHTML = `
      <div class="page-header" style="margin-bottom: 28px;">
        <h2>System Administration & Governance</h2>
        <p>Monitor platform statistics, database telemetry, and AI grading pipeline</p>
      </div>

      <div class="metrics-grid" id="admin-metrics-grid">
        <div class="metric-card"><p>Loading system stats...</p></div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px;">
        <div class="card">
          <h4>Platform Configuration & Health</h4>
          <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 14px; font-size: 0.92rem;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
              <span style="color: var(--text-muted);">Database Engine</span>
              <strong id="admin-db-engine"><span class="badge badge-success">SQLITE / MYSQL READY</span></strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
              <span style="color: var(--text-muted);">AI Evaluation Engine</span>
              <strong>Google Gemini API / NLP Semantic Fallback</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
              <span style="color: var(--text-muted);">Plagiarism Shingle Algorithm</span>
              <strong>3-Word Shingling & Jaccard Indexing</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-muted);">System Security Status</span>
              <span class="badge badge-success">RBAC Enforced • Active</span>
            </div>
          </div>
        </div>

        <div class="card">
          <h4>Administrative Quick Operations</h4>
          <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 10px;">
            <button class="btn btn-secondary" onclick="AdminDashboard.openCreateCourseModal()">
              <i data-lucide="folder-plus"></i> Create Academic Course
            </button>
            <button class="btn btn-secondary" onclick="App.navigate('admin-users')">
              <i data-lucide="user-check"></i> Manage Users & Permissions
            </button>
            <button class="btn btn-secondary" onclick="App.navigate('admin-audit')">
              <i data-lucide="shield"></i> View Full Security Audit Logs
            </button>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();

    try {
      const data = await API.getAdminStats();
      const s = data.stats;

      document.getElementById('admin-metrics-grid').innerHTML = `
        <div class="metric-card">
          <div>
            <div class="metric-label">Total Users</div>
            <div class="metric-value">${s.totalUsers}</div>
            <p style="font-size: 0.78rem; color: var(--text-muted);">${s.totalTeachers} Teachers • ${s.totalStudents} Students</p>
          </div>
          <div class="metric-icon-box" style="background: var(--primary-light); color: var(--primary);">
            <i data-lucide="users"></i>
          </div>
        </div>

        <div class="metric-card">
          <div>
            <div class="metric-label">Active Courses</div>
            <div class="metric-value">${s.totalCourses}</div>
            <p style="font-size: 0.78rem; color: var(--text-muted);">Department curriculums</p>
          </div>
          <div class="metric-icon-box" style="background: var(--info-bg); color: var(--info);">
            <i data-lucide="book-marked"></i>
          </div>
        </div>

        <div class="metric-card">
          <div>
            <div class="metric-label">Total Submissions</div>
            <div class="metric-value">${s.totalSubmissions}</div>
            <p style="font-size: 0.78rem; color: var(--text-muted);">${s.totalAssignments} Assignments created</p>
          </div>
          <div class="metric-icon-box" style="background: var(--success-bg); color: var(--success);">
            <i data-lucide="file-check-2"></i>
          </div>
        </div>

        <div class="metric-card">
          <div>
            <div class="metric-label">AI Evaluations</div>
            <div class="metric-value" style="color: var(--primary);">${s.aiEvaluationsCount}</div>
            <p style="font-size: 0.78rem; color: var(--text-muted);">Questions processed</p>
          </div>
          <div class="metric-icon-box" style="background: var(--primary-light); color: var(--primary);">
            <i data-lucide="sparkles"></i>
          </div>
        </div>

        <div class="metric-card">
          <div>
            <div class="metric-label">Plagiarism Reports</div>
            <div class="metric-value" style="color: ${s.plagiarismReportsCount > 0 ? 'var(--warning)' : 'var(--text-main)'};">${s.plagiarismReportsCount}</div>
            <p style="font-size: 0.78rem; color: var(--text-muted);">Generated by scans</p>
          </div>
          <div class="metric-icon-box" style="background: var(--warning-bg); color: var(--warning);">
            <i data-lucide="shield-alert"></i>
          </div>
        </div>
      `;

      if (window.lucide) lucide.createIcons();
    } catch (e) {
      showToast('Error loading admin stats: ' + e.message, 'danger');
    }
  },

  // 2. USER MANAGEMENT
  async renderUsers(container) {
    container.innerHTML = `
      <div class="page-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2>User Account & Access Management</h2>
          <p>Administer faculty instructors, students, and role privileges</p>
        </div>
      </div>

      <div class="card" style="margin-bottom: 24px; padding: 16px 20px;">
        <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
          <input type="text" id="admin-user-search" class="form-input" style="max-width: 300px;" placeholder="Search user name or email..." oninput="AdminDashboard.filterUsers()">
          <select id="admin-user-role-filter" class="form-select" style="max-width: 180px;" onchange="AdminDashboard.filterUsers()">
            <option value="">All Roles</option>
            <option value="teacher">Teachers</option>
            <option value="student">Students</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Email Address</th>
                <th>Department</th>
                <th>Role</th>
                <th>Account Status</th>
                <th>Registered Date</th>
                <th>Manage</th>
              </tr>
            </thead>
            <tbody id="admin-users-tbody">
              <tr><td colspan="7" style="text-align: center; color: var(--text-muted);">Loading users...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
    await this.loadUsersList();
  },

  async loadUsersList() {
    try {
      const data = await API.getAdminUsers();
      window.cachedAdminUsers = data.users || [];
      this.filterUsers();
    } catch (e) {
      showToast('Error loading users: ' + e.message, 'danger');
    }
  },

  filterUsers() {
    const search = (document.getElementById('admin-user-search')?.value || '').toLowerCase();
    const role = document.getElementById('admin-user-role-filter')?.value || '';
    const tbody = document.getElementById('admin-users-tbody');

    const filtered = (window.cachedAdminUsers || []).filter(u => {
      const matchSearch = u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search);
      const matchRole = !role || u.role_name === role;
      return matchSearch && matchRole;
    });

    if (!filtered.length) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">No users found.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(u => `
      <tr>
        <td style="font-weight: 600;">${u.name}</td>
        <td style="color: var(--text-muted); font-size: 0.88rem;">${u.email}</td>
        <td>${u.department || 'General'}</td>
        <td>
          <span class="badge ${u.role_name === 'admin' ? 'badge-danger' : u.role_name === 'teacher' ? 'badge-primary' : 'badge-info'}">
            ${u.role_name.toUpperCase()}
          </span>
        </td>
        <td>
          <span class="badge ${u.status === 'active' ? 'badge-success' : 'badge-warning'}">
            ${u.status.toUpperCase()}
          </span>
        </td>
        <td style="font-size: 0.85rem; color: var(--text-muted);">${new Date(u.created_at).toLocaleDateString()}</td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="AdminDashboard.toggleUserStatus(${u.id}, '${u.status}')">
            ${u.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
        </td>
      </tr>
    `).join('');

    if (window.lucide) lucide.createIcons();
  },

  async toggleUserStatus(userId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await API.updateUser(userId, { status: newStatus });
      showToast(`User marked as ${newStatus}.`, 'success');
      this.loadUsersList();
    } catch (e) {
      showToast('Update failed: ' + e.message, 'danger');
    }
  },

  // 3. COURSE MANAGEMENT
  async renderCourses(container) {
    container.innerHTML = `
      <div class="page-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: gap; gap: 16px;">
        <div>
          <h2>Course Management</h2>
          <p>Organize academic curriculums and assign faculty instructors</p>
        </div>
        <button class="btn btn-primary" onclick="AdminDashboard.openCreateCourseModal()">
          <i data-lucide="plus-circle"></i> Create New Course
        </button>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Title</th>
                <th>Assigned Instructor</th>
                <th>Semester</th>
                <th>Enrolled Students</th>
                <th>Assignments</th>
              </tr>
            </thead>
            <tbody id="admin-courses-tbody">
              <tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Loading courses...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();

    try {
      const data = await API.getAdminCourses();
      const tbody = document.getElementById('admin-courses-tbody');
      const courses = data.courses || [];

      if (!courses.length) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 24px;">No courses created.</td></tr>`;
        return;
      }

      tbody.innerHTML = courses.map(c => `
        <tr>
          <td><span class="badge badge-primary" style="font-size: 0.85rem;">${c.code}</span></td>
          <td style="font-weight: 600;">${c.title}</td>
          <td>${c.teacher_name} <span style="font-size: 0.8rem; color: var(--text-muted);">(${c.teacher_email})</span></td>
          <td>${c.semester}</td>
          <td><strong>${c.enrolled_count || 0} Students</strong></td>
          <td><strong>${c.assignment_count || 0} Assignments</strong></td>
        </tr>
      `).join('');

      if (window.lucide) lucide.createIcons();
    } catch (e) {
      showToast('Error loading courses: ' + e.message, 'danger');
    }
  },

  async openCreateCourseModal() {
    let teachers = [];
    try {
      const data = await API.getAdminUsers({ role: 'teacher' });
      teachers = data.users || [];
    } catch (e) {
      teachers = [];
    }

    const modalContent = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3>Create New Course</h3>
          <button class="modal-close-btn" onclick="closeModal()"><i data-lucide="x"></i></button>
        </div>
        <div class="modal-body">
          <form id="create-course-form" onsubmit="AdminDashboard.handleCreateCourseSubmit(event)">
            <div class="form-group">
              <label class="form-label">Course Code *</label>
              <input type="text" id="new-course-code" class="form-input" required placeholder="e.g. CS204">
            </div>
            <div class="form-group">
              <label class="form-label">Course Title *</label>
              <input type="text" id="new-course-title" class="form-input" required placeholder="e.g. Operating Systems & Concurrency">
            </div>
            <div class="form-group">
              <label class="form-label">Assigned Faculty Instructor *</label>
              <select id="new-course-teacher" class="form-select" required>
                ${teachers.map(t => `<option value="${t.id}">${t.name} (${t.email})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Semester Term</label>
              <input type="text" id="new-course-semester" class="form-input" value="Fall 2026">
            </div>
            <div class="form-group">
              <label class="form-label">Course Description</label>
              <textarea id="new-course-desc" class="form-textarea" placeholder="Curriculum overview and objectives..."></textarea>
            </div>
            <div class="modal-footer" style="padding-left: 0; padding-right: 0;">
              <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary"><i data-lucide="save"></i> Save Course</button>
            </div>
          </form>
        </div>
      </div>
    `;

    openModal(modalContent);
  },

  async handleCreateCourseSubmit(e) {
    e.preventDefault();
    const code = document.getElementById('new-course-code').value;
    const title = document.getElementById('new-course-title').value;
    const teacher_id = Number(document.getElementById('new-course-teacher').value);
    const semester = document.getElementById('new-course-semester').value;
    const description = document.getElementById('new-course-desc').value;

    try {
      showToast('Creating course...', 'info');
      await API.createCourse({ code, title, teacher_id, semester, description });
      showToast('Course created successfully!', 'success');
      closeModal();
      this.renderCourses(document.getElementById('app-body-container'));
    } catch (e) {
      showToast('Failed to create course: ' + e.message, 'danger');
    }
  },

  // 4. SECURITY AUDIT LOGS
  async renderAuditLogs(container) {
    container.innerHTML = `
      <div class="page-header" style="margin-bottom: 24px;">
        <h2>Security & Compliance Audit Trail</h2>
        <p>Immutable log of grade modifications, user authentications, and integrity scans</p>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>User</th>
                <th>Entity</th>
                <th>Details</th>
                <th>IP Origin</th>
              </tr>
            </thead>
            <tbody id="admin-audit-tbody">
              <tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Loading audit logs...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();

    try {
      const data = await API.getAuditLogs(60);
      const tbody = document.getElementById('admin-audit-tbody');
      const logs = data.logs || [];

      if (!logs.length) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 24px;">No audit events recorded yet.</td></tr>`;
        return;
      }

      tbody.innerHTML = logs.map(l => `
        <tr>
          <td style="font-size: 0.82rem; color: var(--text-muted); font-family: var(--font-mono);">${new Date(l.created_at).toLocaleString()}</td>
          <td><span class="badge badge-primary">${l.action}</span></td>
          <td style="font-weight: 500;">${l.user_name || 'System / Guest'}</td>
          <td><span class="badge badge-info">${l.entity_type} #${l.entity_id || '—'}</span></td>
          <td style="font-size: 0.88rem; max-width: 360px;">${l.details || '—'}</td>
          <td style="font-size: 0.82rem; font-family: var(--font-mono); color: var(--text-muted);">${l.ip_address || '127.0.0.1'}</td>
        </tr>
      `).join('');

      if (window.lucide) lucide.createIcons();
    } catch (e) {
      showToast('Error loading audit logs: ' + e.message, 'danger');
    }
  }
};
