-- ==========================================================
-- GradeAI Database Schema (MySQL Compatible)
-- Intelligent Assignment Auto-Grader System
-- ==========================================================

CREATE DATABASE IF NOT EXISTS gradeai_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gradeai_db;

-- 1. ROLES TABLE
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  department VARCHAR(150) DEFAULT 'Computer Science & AI',
  avatar_url VARCHAR(255) NULL,
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_role (role_id),
  INDEX idx_user_email (email),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. COURSES TABLE
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  description TEXT NULL,
  semester VARCHAR(50) DEFAULT 'Fall 2026',
  teacher_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_course_teacher (teacher_id),
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. ENROLLMENTS TABLE
CREATE TABLE IF NOT EXISTS enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  student_id INT NOT NULL,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_student_course (course_id, student_id),
  INDEX idx_enrollment_course (course_id),
  INDEX idx_enrollment_student (student_id),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  created_by INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  instructions TEXT NULL,
  total_marks DECIMAL(6,2) NOT NULL DEFAULT 100.00,
  due_date DATETIME NOT NULL,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  allowed_file_types VARCHAR(150) DEFAULT 'pdf,txt,docx,py,cpp,java',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_assignment_course (course_id),
  INDEX idx_assignment_status (status),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  question_order INT NOT NULL DEFAULT 1,
  question_type ENUM('mcq', 'short_answer', 'descriptive') NOT NULL DEFAULT 'mcq',
  prompt TEXT NOT NULL,
  marks DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  reference_answer TEXT NULL,
  keywords TEXT NULL,
  explanation TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_question_assignment (assignment_id),
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. ANSWER OPTIONS (For MCQs)
CREATE TABLE IF NOT EXISTS answer_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  option_letter CHAR(1) NOT NULL,
  option_text TEXT NOT NULL,
  is_correct TINYINT(1) NOT NULL DEFAULT 0,
  INDEX idx_option_question (question_id),
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. RUBRIC CRITERIA (For Short Answers and Descriptive evaluation)
CREATE TABLE IF NOT EXISTS rubric_criteria (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  criterion_name VARCHAR(150) NOT NULL,
  description TEXT NULL,
  weight_percentage DECIMAL(5,2) NOT NULL DEFAULT 100.00,
  max_points DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  INDEX idx_rubric_question (question_id),
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  student_id INT NOT NULL,
  status ENUM('submitted', 'ai_graded', 'reviewed', 'flagged') DEFAULT 'submitted',
  file_url VARCHAR(255) NULL,
  file_name VARCHAR(255) NULL,
  total_score DECIMAL(6,2) DEFAULT NULL,
  max_score DECIMAL(6,2) NOT NULL DEFAULT 100.00,
  percentage DECIMAL(5,2) DEFAULT NULL,
  grade_letter VARCHAR(5) DEFAULT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  graded_at DATETIME NULL,
  reviewed_at DATETIME NULL,
  reviewed_by INT NULL,
  UNIQUE KEY unique_student_assignment (assignment_id, student_id),
  INDEX idx_submission_assignment (assignment_id),
  INDEX idx_submission_student (student_id),
  INDEX idx_submission_status (status),
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. STUDENT ANSWERS TABLE
CREATE TABLE IF NOT EXISTS student_answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  submission_id INT NOT NULL,
  question_id INT NOT NULL,
  selected_option_id INT NULL,
  answer_text TEXT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_answer_submission (submission_id),
  INDEX idx_answer_question (question_id),
  FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  FOREIGN KEY (selected_option_id) REFERENCES answer_options(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. GRADING RESULTS TABLE
CREATE TABLE IF NOT EXISTS grading_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  submission_id INT NOT NULL,
  question_id INT NOT NULL,
  score_awarded DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  max_score DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  evaluator_type ENUM('auto_mcq', 'ai', 'teacher') NOT NULL DEFAULT 'auto_mcq',
  ai_suggested_score DECIMAL(5,2) NULL,
  confidence_level ENUM('high', 'medium', 'low') DEFAULT 'high',
  matched_concepts TEXT NULL,
  missing_concepts TEXT NULL,
  reasoning TEXT NULL,
  is_approved TINYINT(1) NOT NULL DEFAULT 0,
  evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_grading_submission (submission_id),
  INDEX idx_grading_question (question_id),
  FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  submission_id INT NOT NULL UNIQUE,
  overall_feedback TEXT NOT NULL,
  strengths TEXT NULL,
  improvements TEXT NULL,
  teacher_notes TEXT NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  published_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_feedback_submission (submission_id),
  FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. PLAGIARISM REPORTS TABLE
CREATE TABLE IF NOT EXISTS plagiarism_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  submission_id INT NOT NULL,
  matched_submission_id INT NULL,
  similarity_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  matching_excerpts JSON NULL,
  source_type VARCHAR(100) DEFAULT 'peer_submission',
  review_status ENUM('pending', 'cleared', 'flagged') DEFAULT 'pending',
  teacher_notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_plagiarism_submission (submission_id),
  INDEX idx_plagiarism_matched (matched_submission_id),
  INDEX idx_plagiarism_status (review_status),
  FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (matched_submission_id) REFERENCES submissions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'success', 'warning', 'danger') DEFAULT 'info',
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notifications_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id INT NULL,
  details TEXT NULL,
  ip_address VARCHAR(45) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_action (action),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
