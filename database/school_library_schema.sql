-- =============================================
-- School Library Database - Full Schema & Sample Data
-- =============================================
-- Run this script on your MySQL database (local or Aiven)
-- =============================================

-- Create database
CREATE DATABASE IF NOT EXISTS school_library_db;
USE school_library_db;

-- =============================================
-- DROP TABLES (if re-running - drops in reverse order)
-- =============================================
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS book_category;
DROP TABLE IF EXISTS users;

-- =============================================
-- TABLE: users
-- =============================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE: book_category
-- =============================================
CREATE TABLE book_category (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

-- =============================================
-- TABLE: books
-- =============================================
CREATE TABLE books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  category_id INT,
  isbn VARCHAR(50),
  total_copies INT DEFAULT 0,
  available_copies INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES book_category(id) ON DELETE SET NULL
);

-- =============================================
-- SAMPLE DATA: users
-- Passwords are bcrypt hashed (10 rounds)
-- librarian: password = librarian123
-- student:   password = student123
-- admin:     password = password123
-- =============================================
INSERT INTO users (name, email, password, role) VALUES
('Sarah Johnson', 'librarian@school.edu', '$2b$10$B8GneXYUDkxDiKTXudKxg.Ec5XQAHXDIhVbrmoW7fe/ro4Lc3ZVEK', 'librarian'),
('Mike Chen', 'student@school.edu', '$2b$10$BsnmiRVXB9LHFdRah/3rX.9a7Jtke1X230M9NiP667ZraCOw..zw.', 'student'),
('Admin User', 'admin@school.edu', '$2b$10$avlSdR4dIdAO71b83QLZTOn79YdMqt0SqmijsZsbqQrq5pcFiuCdm', 'librarian');

-- =============================================
-- SAMPLE DATA: book_category
-- =============================================
INSERT INTO book_category (name) VALUES
('Fiction'),
('Non-Fiction'),
('Science'),
('History'),
('Mathematics'),
('Literature');

-- =============================================
-- SAMPLE DATA: books
-- =============================================
INSERT INTO books (title, author, category_id, isbn, total_copies, available_copies) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', 1, '9780743273565', 10, 8),
('To Kill a Mockingbird', 'Harper Lee', 1, '9780061120084', 5, 5),
('1984', 'George Orwell', 1, '9780451524935', 7, 4),
('Pride and Prejudice', 'Jane Austen', 6, '9780141439518', 6, 6),
('The Catcher in the Rye', 'J.D. Salinger', 6, '9780316769488', 4, 2),
('Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', 2, '9780062316097', 8, 6),
('Thinking, Fast and Slow', 'Daniel Kahneman', 2, '9780374533557', 5, 3),
('A Brief History of Time', 'Stephen Hawking', 3, '9780553380163', 6, 5),
('Cosmos', 'Carl Sagan', 3, '9780345539434', 4, 4),
('The Diary of a Young Girl', 'Anne Frank', 4, '9780553296983', 5, 4),
('Guns, Germs, and Steel', 'Jared Diamond', 4, '9780393317558', 3, 2),
('Introduction to Algorithms', 'Thomas H. Cormen', 5, '9780262033848', 4, 1),
('Calculus: Early Transcendentals', 'James Stewart', 5, '9781285741550', 6, 4);

-- =============================================
-- VERIFY DATA
-- =============================================
-- Uncomment to check inserted data:
-- SELECT * FROM users;
-- SELECT * FROM book_category;
-- SELECT * FROM books;
-- SELECT b.id, b.title, b.author, c.name AS category, b.available_copies FROM books b LEFT JOIN book_category c ON b.category_id = c.id;
