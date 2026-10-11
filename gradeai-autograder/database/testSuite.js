/**
 * GradeAI End-to-End Automated Test Suite
 * Tests all key educational workflows and API endpoints
 */

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 Starting GradeAI Automated End-to-End Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      process.stdout.write(`• Testing: ${name}... `);
      await fn();
      console.log('✅ PASSED');
      passed++;
    } catch (err) {
      console.log('❌ FAILED:', err.message);
      failed++;
    }
  }

  // 1. Health check
  await test('Server Health Endpoint', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.status !== 'online') throw new Error('System not online');
  });

  // 2. Authentication - Teacher Demo Login
  let teacherToken = null;
  await test('Teacher Demo Authentication', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/demo/teacher`, { method: 'POST' });
    const data = await res.json();
    if (!data.success || !data.token) throw new Error('No token returned');
    teacherToken = data.token;
  });

  // 3. Authentication - Student Demo Login
  let studentToken = null;
  await test('Student Demo Authentication', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/demo/student1`, { method: 'POST' });
    const data = await res.json();
    if (!data.success || !data.token) throw new Error('No token returned');
    studentToken = data.token;
  });

  // 4. Authentication - Admin Demo Login
  let adminToken = null;
  await test('Admin Demo Authentication', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/demo/admin`, { method: 'POST' });
    const data = await res.json();
    if (!data.success || !data.token) throw new Error('No token returned');
    adminToken = data.token;
  });

  // 5. Teacher Assignment Fetch
  let assignmentId = null;
  await test('Teacher Fetch Assignments List', async () => {
    const res = await fetch(`${BASE_URL}/api/assignments`, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    const data = await res.json();
    if (!data.success || !data.assignments.length) throw new Error('No assignments found');
    assignmentId = data.assignments[0].id;
  });

  // 6. Assignment Detail with Questions
  await test('Fetch Assignment Details & Questions', async () => {
    const res = await fetch(`${BASE_URL}/api/assignments/${assignmentId}`, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    const data = await res.json();
    if (!data.success || !data.assignment.questions.length) throw new Error('No questions found');
  });

  // 7. Teacher Analytics
  await test('Teacher Analytics & Summary Telemetry', async () => {
    const res = await fetch(`${BASE_URL}/api/analytics/teacher`, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    const data = await res.json();
    if (!data.success || typeof data.summary.totalStudents !== 'number') {
      throw new Error('Invalid analytics response');
    }
  });

  // 8. Plagiarism Reports Retrieval
  let plagiarismReportId = null;
  await test('Plagiarism Reports Retrieval', async () => {
    const res = await fetch(`${BASE_URL}/api/plagiarism/reports`, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    const data = await res.json();
    if (!data.success || !data.reports.length) throw new Error('No reports found');
    plagiarismReportId = data.reports[0].id;
  });

  // 9. Plagiarism Report Inspection
  await test('Plagiarism Report Detail Inspection', async () => {
    const res = await fetch(`${BASE_URL}/api/plagiarism/reports/${plagiarismReportId}`, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    const data = await res.json();
    if (!data.success || !data.report.matching_excerpts) throw new Error('No excerpts found');
  });

  // 10. Plagiarism Status Update
  await test('Teacher Resolve Plagiarism Report', async () => {
    const res = await fetch(`${BASE_URL}/api/plagiarism/reports/${plagiarismReportId}/status`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${teacherToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'flagged', teacher_notes: 'Verified shared phrasing on Q3.' })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
  });

  // 11. Admin Statistics
  await test('Admin System Statistics', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (!data.success || typeof data.stats.totalUsers !== 'number') throw new Error('Invalid stats');
  });

  // 12. Admin Users List
  await test('Admin User Management Retrieval', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (!data.success || !data.users.length) throw new Error('No users returned');
  });

  // 13. Student View Grades & Feedback
  await test('Student Submissions & Feedback Retrieval', async () => {
    const res = await fetch(`${BASE_URL}/api/submissions/my`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const data = await res.json();
    if (!data.success || !data.submissions.length) throw new Error('No submissions returned');
  });

  // 14. Gradebook CSV Export
  await test('Gradebook CSV Export Endpoint', async () => {
    const res = await fetch(`${BASE_URL}/api/analytics/export/csv/all`, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const text = await res.text();
    if (!text.includes('Student Name') || !text.includes('Alex Rivera')) {
      throw new Error('CSV missing headers or student rows');
    }
  });

  console.log('\n====================================================');
  console.log(`🏁 Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
