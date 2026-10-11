const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');
const Database = require('better-sqlite3');
const { getSeedData } = require('../../database/seedData');

let dbClient = null;
let activeEngine = 'sqlite'; // 'mysql' | 'sqlite'

/**
 * Normalizes query string for SQLite compatibility if needed
 */
function normalizeSqlForSqlite(sql) {
  let s = sql;
  // Replace MySQL specific syntax
  s = s.replace(/AUTO_INCREMENT/gi, 'AUTOINCREMENT');
  s = s.replace(/ENGINE=InnoDB/gi, '');
  s = s.replace(/DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci/gi, '');
  s = s.replace(/COLLATE utf8mb4_unicode_ci/gi, '');
  s = s.replace(/ON UPDATE CURRENT_TIMESTAMP/gi, '');
  s = s.replace(/INT AUTOINCREMENT PRIMARY KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT');
  s = s.replace(/DATETIME/gi, 'TEXT');
  s = s.replace(/TIMESTAMP/gi, 'TEXT');
  s = s.replace(/JSON/gi, 'TEXT');
  s = s.replace(/ENUM\([^)]+\)/gi, 'TEXT');
  s = s.replace(/TINYINT\(1\)/gi, 'INTEGER');
  s = s.replace(/DECIMAL\([0-9]+,[0-9]+\)/gi, 'REAL');
  // Remove MySQL inline index statements like INDEX idx_name (...)
  s = s.replace(/,\s*INDEX\s+[a-zA-Z0-9_]+\s*\([^)]+\)/gi, '');
  return s;
}

/**
 * Initialize Database Connection
 */
async function initDatabase() {
  const preferredType = (process.env.DB_TYPE || 'sqlite').toLowerCase();
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = process.env.DB_PORT || 3306;
  const dbUser = process.env.DB_USER || 'root';
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'gradeai_db';

  if (preferredType === 'mysql') {
    try {
      console.log(`[GradeAI DB] Attempting connection to MySQL at ${dbHost}:${dbPort}...`);
      // First attempt connecting to server to ensure database exists
      const serverConn = await mysql.createConnection({
        host: dbHost,
        port: dbPort,
        user: dbUser,
        password: dbPassword
      });
      await serverConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      await serverConn.end();

      // Connect to the specific database pool
      dbClient = mysql.createPool({
        host: dbHost,
        port: dbPort,
        user: dbUser,
        password: dbPassword,
        database: dbName,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });

      // Test pool connection
      const [testRows] = await dbClient.query('SELECT 1 as connected');
      if (testRows) {
        activeEngine = 'mysql';
        console.log(`[GradeAI DB] Successfully connected to MySQL database: ${dbName}`);
        await setupMysqlSchema();
        await autoSeedIfEmpty();
        return;
      }
    } catch (err) {
      console.warn(`[GradeAI DB] MySQL unavailable (${err.message}). Auto-switching to embedded SQLite mode...`);
    }
  }

  // SQLite Fallback / Default
  try {
    const dbDir = path.join(__dirname, '../../database');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    const dbPath = path.join(dbDir, 'gradeai.db');
    dbClient = new Database(dbPath);
    dbClient.pragma('journal_mode = WAL');
    dbClient.pragma('foreign_keys = ON');
    activeEngine = 'sqlite';
    console.log(`[GradeAI DB] Operating with high-performance embedded SQLite database at: ${dbPath}`);
    await setupSqliteSchema();
    await autoSeedIfEmpty();
  } catch (err) {
    console.error(`[GradeAI DB] Fatal error initializing database:`, err);
    throw err;
  }
}

/**
 * Setup MySQL Tables using database/schema.sql
 */
async function setupMysqlSchema() {
  const schemaPath = path.join(__dirname, '../../database/schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    // Split on semicolon statements
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.toLowerCase().startsWith('create database') && !s.toLowerCase().startsWith('use '));
    for (const stmt of statements) {
      try {
        await dbClient.query(stmt);
      } catch (e) {
        // Table or index might exist
      }
    }
  }
}

/**
 * Setup SQLite Tables with matching schema
 */
async function setupSqliteSchema() {
  const sqliteTables = [
    `CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      department TEXT DEFAULT 'Computer Science & AI',
      avatar_url TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (role_id) REFERENCES roles(id)
    )`,
    `CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT,
      semester TEXT DEFAULT 'Fall 2026',
      teacher_id INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      enrolled_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(course_id, student_id),
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      created_by INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      instructions TEXT,
      total_marks REAL NOT NULL DEFAULT 100.00,
      due_date TEXT NOT NULL,
      status TEXT DEFAULT 'draft',
      allowed_file_types TEXT DEFAULT 'pdf,txt,docx,py,cpp,java',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      assignment_id INTEGER NOT NULL,
      question_order INTEGER NOT NULL DEFAULT 1,
      question_type TEXT NOT NULL DEFAULT 'mcq',
      prompt TEXT NOT NULL,
      marks REAL NOT NULL DEFAULT 10.00,
      reference_answer TEXT,
      keywords TEXT,
      explanation TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS answer_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      option_letter TEXT NOT NULL,
      option_text TEXT NOT NULL,
      is_correct INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS rubric_criteria (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      criterion_name TEXT NOT NULL,
      description TEXT,
      weight_percentage REAL NOT NULL DEFAULT 100.00,
      max_points REAL NOT NULL DEFAULT 10.00,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      assignment_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      status TEXT DEFAULT 'submitted',
      file_url TEXT,
      file_name TEXT,
      total_score REAL,
      max_score REAL NOT NULL DEFAULT 100.00,
      percentage REAL,
      grade_letter TEXT,
      submitted_at TEXT DEFAULT CURRENT_TIMESTAMP,
      graded_at TEXT,
      reviewed_at TEXT,
      reviewed_by INTEGER,
      UNIQUE(assignment_id, student_id),
      FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS student_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      submission_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL,
      selected_option_id INTEGER,
      answer_text TEXT,
      submitted_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
      FOREIGN KEY (selected_option_id) REFERENCES answer_options(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS grading_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      submission_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL,
      score_awarded REAL NOT NULL DEFAULT 0.00,
      max_score REAL NOT NULL DEFAULT 10.00,
      evaluator_type TEXT NOT NULL DEFAULT 'auto_mcq',
      ai_suggested_score REAL,
      confidence_level TEXT DEFAULT 'high',
      matched_concepts TEXT,
      missing_concepts TEXT,
      reasoning TEXT,
      is_approved INTEGER NOT NULL DEFAULT 0,
      evaluated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      submission_id INTEGER NOT NULL UNIQUE,
      overall_feedback TEXT NOT NULL,
      strengths TEXT,
      improvements TEXT,
      teacher_notes TEXT,
      is_published INTEGER NOT NULL DEFAULT 0,
      published_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS plagiarism_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      submission_id INTEGER NOT NULL,
      matched_submission_id INTEGER,
      similarity_score REAL NOT NULL DEFAULT 0.00,
      matching_excerpts TEXT,
      source_type TEXT DEFAULT 'peer_submission',
      review_status TEXT DEFAULT 'pending',
      teacher_notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
      FOREIGN KEY (matched_submission_id) REFERENCES submissions(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER,
      details TEXT,
      ip_address TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )`
  ];

  for (const tableSql of sqliteTables) {
    dbClient.exec(tableSql);
  }
}

/**
 * Universal Query Helper - Returns array of rows
 */
async function query(sql, params = []) {
  if (activeEngine === 'mysql') {
    const [rows] = await dbClient.query(sql, params);
    return rows;
  } else {
    const stmt = dbClient.prepare(sql);
    return stmt.all(...params);
  }
}

/**
 * Universal Get Helper - Returns single row or null
 */
async function get(sql, params = []) {
  if (activeEngine === 'mysql') {
    const [rows] = await dbClient.query(sql, params);
    return rows && rows.length > 0 ? rows[0] : null;
  } else {
    const stmt = dbClient.prepare(sql);
    return stmt.get(...params) || null;
  }
}

/**
 * Universal Run Helper - For INSERT / UPDATE / DELETE
 */
async function run(sql, params = []) {
  if (activeEngine === 'mysql') {
    const [result] = await dbClient.query(sql, params);
    return {
      insertId: result.insertId,
      changes: result.affectedRows
    };
  } else {
    const stmt = dbClient.prepare(sql);
    const info = stmt.run(...params);
    return {
      insertId: info.lastInsertRowid,
      changes: info.changes
    };
  }
}

/**
 * Check if users table is empty and seed initial realistic dataset
 */
async function autoSeedIfEmpty() {
  const existingUsers = await get('SELECT COUNT(*) as count FROM users');
  const count = existingUsers ? (existingUsers.count || existingUsers['COUNT(*)']) : 0;
  if (count > 0) {
    console.log(`[GradeAI DB] Database already contains ${count} users. Auto-seed bypassed.`);
    return;
  }

  console.log('[GradeAI DB] Seeding initial courses, assignments, rubrics, and demo users...');
  const data = await getSeedData();

  // 1. Roles
  for (const r of data.roles) {
    await run('INSERT OR IGNORE INTO roles (id, name, description) VALUES (?, ?, ?)', [r.id, r.name, r.description]).catch(async () => {
      // MySQL fallback if OR IGNORE is not standard
      await run('INSERT INTO roles (id, name, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE description=VALUES(description)', [r.id, r.name, r.description]).catch(() => {});
    });
  }

  // 2. Users
  for (const u of data.users) {
    await run(
      'INSERT INTO users (id, role_id, name, email, password_hash, department, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [u.id, u.role_id, u.name, u.email, u.password_hash, u.department, u.status]
    );
  }

  // 3. Courses
  for (const c of data.courses) {
    await run(
      'INSERT INTO courses (id, code, title, description, semester, teacher_id) VALUES (?, ?, ?, ?, ?, ?)',
      [c.id, c.code, c.title, c.description, c.semester, c.teacher_id]
    );
  }

  // 4. Enrollments
  for (const e of data.enrollments) {
    await run('INSERT INTO enrollments (course_id, student_id) VALUES (?, ?)', [e.course_id, e.student_id]);
  }

  // 5. Assignments
  for (const a of data.assignments) {
    await run(
      'INSERT INTO assignments (id, course_id, created_by, title, description, instructions, total_marks, due_date, status, allowed_file_types) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [a.id, a.course_id, a.created_by, a.title, a.description, a.instructions, a.total_marks, a.due_date, a.status, a.allowed_file_types]
    );
  }

  // 6. Questions
  for (const q of data.questions) {
    await run(
      'INSERT INTO questions (id, assignment_id, question_order, question_type, prompt, marks, reference_answer, keywords, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [q.id, q.assignment_id, q.question_order, q.question_type, q.prompt, q.marks, q.reference_answer, q.keywords, q.explanation]
    );
  }

  // 7. Answer Options
  for (const o of data.answerOptions) {
    await run(
      'INSERT INTO answer_options (question_id, option_letter, option_text, is_correct) VALUES (?, ?, ?, ?)',
      [o.question_id, o.option_letter, o.option_text, o.is_correct]
    );
  }

  // 8. Rubric Criteria
  for (const rc of data.rubricCriteria) {
    await run(
      'INSERT INTO rubric_criteria (question_id, criterion_name, description, weight_percentage, max_points) VALUES (?, ?, ?, ?, ?)',
      [rc.question_id, rc.criterion_name, rc.description, rc.weight_percentage, rc.max_points]
    );
  }

  // 9. Sample Submissions & Evaluations for rich demonstration:
  // Submission 1: Alex Rivera (student1) - Completed, Approved, 94/100 (Grade A)
  const sub1 = await run(
    `INSERT INTO submissions (assignment_id, student_id, status, total_score, max_score, percentage, grade_letter, submitted_at, graded_at, reviewed_at, reviewed_by)
     VALUES (?, ?, 'reviewed', 94.00, 100.00, 94.00, 'A', '2026-10-09 14:22:00', '2026-10-09 14:25:00', '2026-10-09 15:00:00', 2)`,
    [1, 4]
  );
  const sub1Id = sub1.insertId;

  // Alex's answers
  await run('INSERT INTO student_answers (submission_id, question_id, selected_option_id, answer_text) VALUES (?, ?, ?, ?)', [sub1Id, 1, 3, null]); // Q1 correct (C)
  await run('INSERT INTO student_answers (submission_id, question_id, selected_option_id, answer_text) VALUES (?, ?, ?, ?)', [sub1Id, 2, 6, null]); // Q2 correct (B)
  await run('INSERT INTO student_answers (submission_id, question_id, selected_option_id, answer_text) VALUES (?, ?, ?, ?)', [
    sub1Id,
    3,
    null,
    'Divide and Conquer breaks the main problem into completely independent subproblems and solves them recursively (like Merge Sort). In contrast, Dynamic Programming is used when subproblems overlap and there is optimal substructure. Dynamic Programming prevents redundant recomputations by caching results in a memoization table or using bottom-up tabulation.'
  ]);
  await run('INSERT INTO student_answers (submission_id, question_id, selected_option_id, answer_text) VALUES (?, ?, ?, ?)', [
    sub1Id,
    4,
    null,
    'Dijkstras algorithm finds single source shortest paths by greedily picking the unvisited vertex with the minimum distance using a priority queue and relaxing its outgoing edges. It fails when negative edge weights exist because it assumes that visited vertices have reached their final minimum cost. Negative edges can subsequently reduce distances to visited nodes or cause infinite loops in negative cycles.'
  ]);

  // Alex's grading results
  await run("INSERT INTO grading_results (submission_id, question_id, score_awarded, max_score, evaluator_type, ai_suggested_score, confidence_level, matched_concepts, missing_concepts, reasoning, is_approved) VALUES (?, ?, 20, 20, 'auto_mcq', 20, 'high', 'Correct option C chosen', '', 'Selected correct answer.', 1)", [sub1Id, 1]);
  await run("INSERT INTO grading_results (submission_id, question_id, score_awarded, max_score, evaluator_type, ai_suggested_score, confidence_level, matched_concepts, missing_concepts, reasoning, is_approved) VALUES (?, ?, 20, 20, 'auto_mcq', 20, 'high', 'Correct option B chosen', '', 'Selected correct answer.', 1)", [sub1Id, 2]);
  await run("INSERT INTO grading_results (submission_id, question_id, score_awarded, max_score, evaluator_type, ai_suggested_score, confidence_level, matched_concepts, missing_concepts, reasoning, is_approved) VALUES (?, ?, 28, 30, 'ai', 28, 'high', 'overlapping subproblems, optimal substructure, memoization, independent subproblems', 'exhaustive complexity comparison', 'Strong comprehension of caching and overlapping properties.', 1)", [sub1Id, 3]);
  await run("INSERT INTO grading_results (submission_id, question_id, score_awarded, max_score, evaluator_type, ai_suggested_score, confidence_level, matched_concepts, missing_concepts, reasoning, is_approved) VALUES (?, ?, 26, 30, 'ai', 26, 'high', 'greedy invariant, priority queue, relaxation, negative edge violation', 'min-heap complexity details', 'Accurate explanation of the greedy assumption failure with negative weights.', 1)", [sub1Id, 4]);

  await run(`INSERT INTO feedback (submission_id, overall_feedback, strengths, improvements, teacher_notes, is_published, published_at)
             VALUES (?, ?, ?, ?, ?, 1, '2026-10-09 15:00:00')`, [
    sub1Id,
    'Outstanding work, Alex! Your algorithm explanations are articulate, precise, and demonstrated deep conceptual clarity.',
    'Clear differentiation of DP overlapping subproblems; accurate greedy invariant reasoning in Dijkstra.',
    'Mentioning the exact time complexity with Fibonacci heaps vs standard binary min-heaps would provide extra rigor.',
    'Approved as grade A. Excellent submission.'
  ]);

  // Submission 2: Brenda Vance (student2) - Graded, 82/100 (Grade B)
  const sub2 = await run(
    `INSERT INTO submissions (assignment_id, student_id, status, total_score, max_score, percentage, grade_letter, submitted_at, graded_at, reviewed_at, reviewed_by)
     VALUES (?, ?, 'reviewed', 82.00, 100.00, 82.00, 'B', '2026-10-09 16:10:00', '2026-10-09 16:12:00', '2026-10-09 16:30:00', 2)`,
    [1, 5]
  );
  const sub2Id = sub2.insertId;
  await run('INSERT INTO student_answers (submission_id, question_id, selected_option_id, answer_text) VALUES (?, ?, ?, ?)', [sub2Id, 1, 3, null]); // Q1 correct (C)
  await run('INSERT INTO student_answers (submission_id, question_id, selected_option_id, answer_text) VALUES (?, ?, ?, ?)', [sub2Id, 2, 5, null]); // Q2 incorrect (A - Stack instead of Queue)
  await run('INSERT INTO student_answers (submission_id, question_id, selected_option_id, answer_text) VALUES (?, ?, ?, ?)', [
    sub2Id,
    3,
    null,
    'Dynamic programming is used when subproblems are overlapping and can be stored in a table so we dont repeat calculations. Divide and conquer splits problems into distinct parts and solves each without caching.'
  ]);
  await run('INSERT INTO student_answers (submission_id, question_id, selected_option_id, answer_text) VALUES (?, ?, ?, ?)', [
    sub2Id,
    4,
    null,
    'Dijkstra searches the graph using a priority queue to find the nearest node and updates distances. Negative weights cause errors because once a distance is updated, the algorithm does not go back and check if a negative path appeared.'
  ]);
  await run("INSERT INTO grading_results (submission_id, question_id, score_awarded, max_score, evaluator_type, ai_suggested_score, confidence_level, matched_concepts, missing_concepts, reasoning, is_approved) VALUES (?, ?, 20, 20, 'auto_mcq', 20, 'high', 'Correct option C', '', 'Correct answer.', 1)", [sub2Id, 1]);
  await run("INSERT INTO grading_results (submission_id, question_id, score_awarded, max_score, evaluator_type, ai_suggested_score, confidence_level, matched_concepts, missing_concepts, reasoning, is_approved) VALUES (?, ?, 0, 20, 'auto_mcq', 0, 'high', '', 'Queue is required for BFS, Stack is for DFS', 'Incorrect option A selected.', 1)", [sub2Id, 2]);
  await run("INSERT INTO grading_results (submission_id, question_id, score_awarded, max_score, evaluator_type, ai_suggested_score, confidence_level, matched_concepts, missing_concepts, reasoning, is_approved) VALUES (?, ?, 30, 30, 'ai', 30, 'high', 'overlapping subproblems, memoization, distinct parts, caching', '', 'Accurate concise contrast of overlapping subproblems.', 1)", [sub2Id, 3]);
  await run("INSERT INTO grading_results (submission_id, question_id, score_awarded, max_score, evaluator_type, ai_suggested_score, confidence_level, matched_concepts, missing_concepts, reasoning, is_approved) VALUES (?, ?, 32, 30, 'ai', 24, 'medium', 'priority queue, relaxation concept', 'optimal substructure, negative cycle loop breakdown', 'Good core idea, slightly informal phrasing.', 1)", [sub2Id, 4]);

  await run(`INSERT INTO feedback (submission_id, overall_feedback, strengths, improvements, teacher_notes, is_published, published_at)
             VALUES (?, ?, ?, ?, ?, 1, '2026-10-09 16:30:00')`, [
    sub2Id,
    'Solid effort, Brenda. Be sure to review the fundamental queue mechanics of BFS vs stack in DFS.',
    'Understood dynamic programming memoization well.',
    'Remember that BFS requires a FIFO Queue to ensure shortest path traversal in unweighted graphs.',
    'Verified grade B.'
  ]);

  // Submission 3: Carlos Gomez (student 6) - Pending Teacher Review (AI Graded)
  const sub3 = await run(
    `INSERT INTO submissions (assignment_id, student_id, status, total_score, max_score, percentage, grade_letter, submitted_at, graded_at)
     VALUES (?, ?, 'ai_graded', 88.00, 100.00, 88.00, 'B+', '2026-10-10 10:15:00', '2026-10-10 10:16:00')`,
    [1, 6]
  );
  const sub3Id = sub3.insertId;
  await run('INSERT INTO student_answers (submission_id, question_id, selected_option_id, answer_text) VALUES (?, ?, ?, ?)', [sub3Id, 1, 3, null]);
  await run('INSERT INTO student_answers (submission_id, question_id, selected_option_id, answer_text) VALUES (?, ?, ?, ?)', [sub3Id, 2, 6, null]);
  await run('INSERT INTO student_answers (submission_id, question_id, selected_option_id, answer_text) VALUES (?, ?, ?, ?)', [
    sub3Id,
    3,
    null,
    'Divide and conquer solves disjoint subproblems recursively. Dynamic programming solves overlapping subproblems by remembering previously computed answers through memoization or tabulation tables.'
  ]);
  await run('INSERT INTO student_answers (submission_id, question_id, selected_option_id, answer_text) VALUES (?, ?, ?, ?)', [
    sub3Id,
    4,
    null,
    'Dijkstra uses a min-heap priority queue to pick the shortest distance node greedily. It assumes weights are non-negative. If there are negative weights, a node already visited might have a shorter path later, breaking correctness.'
  ]);
  await run("INSERT INTO grading_results (submission_id, question_id, score_awarded, max_score, evaluator_type, ai_suggested_score, confidence_level, matched_concepts, missing_concepts, reasoning, is_approved) VALUES (?, ?, 20, 20, 'auto_mcq', 20, 'high', 'Option C selected', '', 'Correct answer.', 0)", [sub3Id, 1]);
  await run("INSERT INTO grading_results (submission_id, question_id, score_awarded, max_score, evaluator_type, ai_suggested_score, confidence_level, matched_concepts, missing_concepts, reasoning, is_approved) VALUES (?, ?, 20, 20, 'auto_mcq', 20, 'high', 'Option B selected', '', 'Correct answer.', 0)", [sub3Id, 2]);
  await run("INSERT INTO grading_results (submission_id, question_id, score_awarded, max_score, evaluator_type, ai_suggested_score, confidence_level, matched_concepts, missing_concepts, reasoning, is_approved) VALUES (?, ?, 26, 30, 'ai', 26, 'high', 'disjoint subproblems, overlapping subproblems, memoization, tabulation', '', 'Solid understanding, concise summary.', 0)", [sub3Id, 3]);
  await run("INSERT INTO grading_results (submission_id, question_id, score_awarded, max_score, evaluator_type, ai_suggested_score, confidence_level, matched_concepts, missing_concepts, reasoning, is_approved) VALUES (?, ?, 22, 30, 'ai', 22, 'high', 'min-heap, greedy choice, non-negative weight assumption', 'negative cycle loop demonstration', 'Accurate rationale with slight omission of negative cycle loops.', 0)", [sub3Id, 4]);

  // Submission 4 & 5: Dana Scully (student 7) & Evan Wright (student 8)
  // These two submissions contain matching text on Question 3 to trigger PLAGIARISM DETECTION!
  const commonPlagiarizedText = 'Dynamic Programming addresses optimization problems exhibiting optimal substructure and overlapping subproblems by storing calculated subproblem results in a hash table or multi-dimensional matrix to preclude repeated recursive computation. Conversely, divide and conquer divides inputs into independent disjoint instances.';

  const sub4 = await run(
    `INSERT INTO submissions (assignment_id, student_id, status, total_score, max_score, percentage, grade_letter, submitted_at, graded_at)
     VALUES (?, ?, 'flagged', 65.00, 100.00, 65.00, 'D', '2026-10-10 11:00:00', '2026-10-10 11:05:00')`,
    [1, 7]
  );
  const sub4Id = sub4.insertId;
  await run('INSERT INTO student_answers (submission_id, question_id, selected_option_id, answer_text) VALUES (?, ?, ?, ?)', [sub4Id, 1, 3, null]);
  await run('INSERT INTO student_answers (submission_id, question_id, selected_option_id, answer_text) VALUES (?, ?, ?, ?)', [sub4Id, 2, 6, null]);
  await run('INSERT INTO student_answers (submission_id, question_id, selected_option_id, answer_text) VALUES (?, ?, ?, ?)', [sub4Id, 3, null, commonPlagiarizedText]);
  await run('INSERT INTO student_answers (submission_id, question_id, selected_option_id, answer_text) VALUES (?, ?, ?, ?)', [
    sub4Id,
    4,
    null,
    'Dijkstra searches with a heap and relaxes edges. It fails with negative weights.'
  ]);

  const sub5 = await run(
    `INSERT INTO submissions (assignment_id, student_id, status, total_score, max_score, percentage, grade_letter, submitted_at, graded_at)
     VALUES (?, ?, 'flagged', 68.00, 100.00, 68.00, 'D+', '2026-10-10 11:30:00', '2026-10-10 11:32:00')`,
    [1, 8]
  );
  const sub5Id = sub5.insertId;
  await run('INSERT INTO student_answers (submission_id, question_id, selected_option_id, answer_text) VALUES (?, ?, ?, ?)', [sub5Id, 1, 3, null]);
  await run('INSERT INTO student_answers (submission_id, question_id, selected_option_id, answer_text) VALUES (?, ?, ?, ?)', [sub5Id, 2, 6, null]);
  await run('INSERT INTO student_answers (submission_id, question_id, selected_option_id, answer_text) VALUES (?, ?, ?, ?)', [
    sub5Id,
    3,
    null,
    commonPlagiarizedText + ' This is essentially why we prefer dynamic programming when subproblems are reused many times.'
  ]);
  await run('INSERT INTO student_answers (submission_id, question_id, selected_option_id, answer_text) VALUES (?, ?, ?, ?)', [
    sub5Id,
    4,
    null,
    'Dijkstra algorithm uses min-heap priority queue and edge relaxation. Negative edges lead to cycles or bad paths.'
  ]);

  // Insert Plagiarism Report between Dana Scully (sub4) and Evan Wright (sub5)
  const excerpts = JSON.stringify([
    {
      sourceStudent: 'Evan Wright',
      targetStudent: 'Dana Scully',
      questionId: 3,
      similarityScore: 84.5,
      matchedText: 'Dynamic Programming addresses optimization problems exhibiting optimal substructure and overlapping subproblems by storing calculated subproblem results in a hash table or multi-dimensional matrix to preclude repeated recursive computation. Conversely, divide and conquer divides inputs into independent disjoint instances.'
    }
  ]);

  await run(
    `INSERT INTO plagiarism_reports (submission_id, matched_submission_id, similarity_score, matching_excerpts, source_type, review_status, teacher_notes)
     VALUES (?, ?, 84.50, ?, 'peer_submission', 'pending', 'Automated flag: 84.5% textual overlap detected on Short-Answer Question 3 with student Evan Wright.')`,
    [sub4Id, sub5Id, excerpts]
  );

  // 10. Audit Logs
  await run(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
     VALUES (2, 'ASSIGNMENT_PUBLISHED', 'assignment', 1, 'Dr. Robert Chen published Midterm Examination for CS101', '127.0.0.1')`
  );
  await run(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
     VALUES (2, 'GRADE_APPROVED', 'submission', ?, 'Dr. Robert Chen approved final grade of 94% for Alex Rivera', '127.0.0.1')`,
    [sub1Id]
  );
  await run(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
     VALUES (1, 'PLAGIARISM_SCAN', 'assignment', 1, 'System completed cross-submission plagiarism scan for CS101 Midterm', '127.0.0.1')`
  );

  // 11. Notifications
  await run(
    `INSERT INTO notifications (user_id, title, message, type)
     VALUES (2, 'Plagiarism Alert Flagged', 'Submissions #4 (Dana Scully) and #5 (Evan Wright) share 84.5% similarity in Question 3.', 'warning')`
  );
  await run(
    `INSERT INTO notifications (user_id, title, message, type)
     VALUES (4, 'Assignment Graded', 'Your Midterm Examination for CS101 has been evaluated and approved. Grade: A (94%).', 'success')`
  );
  await run(
    `INSERT INTO notifications (user_id, title, message, type)
     VALUES (2, 'New Submissions Pending', 'Carlos Gomez has submitted CS101 Midterm. AI auto-grade ready for approval.', 'info')`
  );

  console.log('[GradeAI DB] Database seeding completed successfully with realistic sample records!');
}

/**
 * Return current active engine
 */
function getDbType() {
  return activeEngine;
}

module.exports = {
  initDatabase,
  query,
  get,
  run,
  getDbType
};
