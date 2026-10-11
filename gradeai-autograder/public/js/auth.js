/**
 * GradeAI Authentication & Role State Manager
 */

const Auth = {
  getToken() {
    return localStorage.getItem('gradeai_token');
  },

  getUser() {
    try {
      const data = localStorage.getItem('gradeai_user');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  setSession(token, user) {
    localStorage.setItem('gradeai_token', token);
    localStorage.setItem('gradeai_user', JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem('gradeai_token');
    localStorage.removeItem('gradeai_user');
  },

  isAuthenticated() {
    return !!this.getToken() && !!this.getUser();
  },

  async login(email, password) {
    const data = await API.login(email, password);
    this.setSession(data.token, data.user);
    return data;
  },

  async register(payload) {
    const data = await API.register(payload);
    this.setSession(data.token, data.user);
    return data;
  },

  async demoLogin(role = 'teacher') {
    const data = await API.demoLogin(role);
    this.setSession(data.token, data.user);
    return data;
  },

  logout() {
    this.clearSession();
    window.location.href = '/index.html';
  },

  async switchRole(role) {
    try {
      showToast(`Switching to ${role.toUpperCase()} role...`, 'info');
      const data = await this.demoLogin(role);
      showToast(`Switched to Demo ${role.toUpperCase()} successfully`, 'success');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      showToast(`Failed to switch role: ${err.message}`, 'danger');
    }
  }
};
