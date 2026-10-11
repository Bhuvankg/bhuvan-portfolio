/**
 * GradeAI API Client Wrapper
 * Handles Authorization headers, REST endpoints, and centralized errors
 */

const API = {
  getToken() {
    return localStorage.getItem('gradeai_token');
  },

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      ...(options.headers || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(endpoint, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401 && !endpoint.includes('/login') && !endpoint.includes('/demo')) {
          localStorage.removeItem('gradeai_token');
          localStorage.removeItem('gradeai_user');
          if (window.location.pathname.includes('app.html')) {
            window.location.href = '/index.html?session_expired=1';
          }
        }
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (err) {
      console.error(`[API Error] ${endpoint}:`, err);
      throw err;
    }
  },

  // Auth
  login(email, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  register(payload) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  demoLogin(role) {
    return this.request(`/api/auth/demo/${role}`, {
      method: 'POST'
    });
  },

  getMe() {
    return this.request('/api/auth/me');
  },

  forgotPassword(email) {
    return this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  // Assignments
  getAssignments(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/api/assignments${qs ? '?' + qs : ''}`);
  },

  getAssignment(id) {
    return this.request(`/api/assignments/${id}`);
  },

  createAssignment(payload) {
    return this.request('/api/assignments', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updateAssignment(id, payload) {
    return this.request(`/api/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  deleteAssignment(id) {
    return this.request(`/api/assignments/${id}`, {
      method: 'DELETE'
    });
  },

  // Submissions
  submitAssignment(formData) {
    return this.request('/api/submissions/submit', {
      method: 'POST',
      body: formData
    });
  },

  getSubmissions(assignmentId, params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/api/submissions/assignment/${assignmentId}${qs ? '?' + qs : ''}`);
  },

  getSubmissionDetail(id) {
    return this.request(`/api/submissions/${id}`);
  },

  getMySubmissions() {
    return this.request('/api/submissions/my');
  },

  // Grading
  triggerAiGrading(submissionId) {
    return this.request(`/api/grading/ai-evaluate/${submissionId}`, {
      method: 'POST'
    });
  },

  saveTeacherReview(submissionId, payload) {
    return this.request(`/api/grading/review/${submissionId}`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Plagiarism
  scanPlagiarism(assignmentId, threshold) {
    return this.request(`/api/plagiarism/scan/${assignmentId}?threshold=${threshold || 25}`, {
      method: 'POST'
    });
  },

  getPlagiarismReports(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/api/plagiarism/reports${qs ? '?' + qs : ''}`);
  },

  getPlagiarismReportDetail(id) {
    return this.request(`/api/plagiarism/reports/${id}`);
  },

  updatePlagiarismStatus(id, status, notes) {
    return this.request(`/api/plagiarism/reports/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, teacher_notes: notes })
    });
  },

  // Analytics
  getTeacherAnalytics(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/api/analytics/teacher${qs ? '?' + qs : ''}`);
  },

  // Admin
  getAdminStats() {
    return this.request('/api/admin/stats');
  },

  getAdminUsers(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/api/admin/users${qs ? '?' + qs : ''}`);
  },

  updateUser(id, payload) {
    return this.request(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  getAdminCourses() {
    return this.request('/api/admin/courses');
  },

  createCourse(payload) {
    return this.request('/api/admin/courses', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  getAuditLogs(limit = 50) {
    return this.request(`/api/admin/audit-logs?limit=${limit}`);
  }
};
