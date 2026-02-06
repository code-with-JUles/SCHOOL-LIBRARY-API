-- =============================================
-- Backend Training Assignment - Announcements API
-- Authentication & Authorization (Node.js + MySQL)
-- =============================================
-- Database: ONLY TWO TABLES (users, announcements)
-- =============================================

-- Create database
CREATE DATABASE IF NOT EXISTS eav;
USE company_announcements_db;

-- =============================================
-- DROP TABLES (if re-running - drops in reverse order)
-- =============================================
DROP TABLE IF EXISTS announcements;
DROP TABLE IF EXISTS users;

-- =============================================
-- TABLE 1: users
-- =============================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'employee') NOT NULL DEFAULT 'employee',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE 2: announcements
-- =============================================
CREATE TABLE announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================
-- SAMPLE DATA: users
-- Passwords are bcrypt hashed (10 rounds)
-- admin:    password = admin123
-- employee: password = employee123
-- =============================================
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@company.com', '$2b$10$jEIsfJplqaI7IURFukJuP.7tzmeHBC/XfCIbZm/EApeuUKz1mpttC', 'admin'),
('John Employee', 'employee@company.com', '$2b$10$XVI4RAvTSktIxLqtVGWFmu8lLKSq/qCVk23YlaVU7ZKLtkgQOA4fC', 'employee');

-- =============================================
-- SAMPLE DATA: announcements
-- =============================================
INSERT INTO announcements (title, message, created_by) VALUES
('Welcome to the Team!', 'We are excited to welcome all new team members. Please complete your onboarding by Friday.', 1),
('Holiday Schedule 2025', 'Office will be closed Dec 24-26 for the holidays. Plan your work accordingly.', 1),
('Team Meeting Tomorrow', 'Reminder: All-hands meeting at 10 AM in the main conference room. Please be on time.', 2),
('New Project Kickoff', 'The Q1 project kickoff is scheduled for next Monday. All stakeholders must attend.', 1),
('IT Maintenance Notice', 'Scheduled maintenance this weekend. Systems may be unavailable from 2 AM - 6 AM Sunday.', 2);

-- =============================================
-- VERIFY DATA
-- =============================================
-- Uncomment to check inserted data:
-- SELECT * FROM users;
-- SELECT * FROM announcements;
-- SELECT a.id, a.title, a.message, u.name AS created_by_name, u.role, a.created_at 
--   FROM announcements a 
--   JOIN users u ON a.created_by = u.id;
