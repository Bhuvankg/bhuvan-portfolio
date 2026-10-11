-- ==========================================================
-- GradeAI Database Seed Data (MySQL)
-- Sample realistic educational data for testing and demos
-- ==========================================================

USE gradeai_db;

-- Insert Roles
INSERT INTO roles (id, name, description) VALUES
(1, 'admin', 'System Administrator with complete access to manage users, courses, and platform settings'),
(2, 'teacher', 'Faculty Member / Instructor who can create assignments, review AI grading, and publish feedback'),
(3, 'student', 'Student who can take assignments, view published grades, and access detailed feedback')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- Passwords below are bcrypt hashes for:
-- Admin: Admin@123 ($2a$10$wT4n4Nq2E5fA0qTq2wM61.dE1uO5gq3B7rR3xZ8l2Y6nO0jK5m8tK or standard hash)
-- Teacher: Teacher@123
-- Student: Student@123
-- Note: The JavaScript auto-seeder generates dynamic fresh bcrypt hashes automatically.
