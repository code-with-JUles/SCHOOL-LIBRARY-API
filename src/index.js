/*

1. create server: need express & nodemon(for auto restart sever)

`npm init -y`
`npm install express nodemon`
`npm install  nodemon --save-dev`

`npm install mysql2

*/

const express = require("express");
const mysql = require("mysql2");

// const app = express();
// import db connection
const { connection } = require("./db");

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to DB:', err.message);
  } else {
    console.log('✅ Connected to MySQL Database');
  }
});

const app = express();
app.use(express.json());

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} -> ${res.statusCode}`);
  next();
});

// Root test route
app.get('/', (req, res) => {
  res.send('📚 Welcome to School Library API Server');
});


// =======================================
// ========== BOOKS ENDPOINTS ============
// =======================================


// 1️⃣ CREATE Book
app.post('/api/books', (req, res) => {
  const { title, author, category_id, isbn, total_copies, available_copies } = req.body;

  const query = `
    INSERT INTO books (title, author, category_id, isbn, total_copies, available_copies)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  connection.query(query, [title, author, category_id, isbn, total_copies, available_copies], (err, result) => {
    if (err) return res.status(500).json({ message: `Error creating book: ${err.message}` });
    return res.status(201).json({
      message: '✅ Book created successfully',
      book_id: result.insertId
    });
  });
});


// 2️⃣ GET all books (with category name)
app.get('/api/books', (req, res) => {
  const query = `
    SELECT b.*, c.name AS category_name
    FROM books b
    LEFT JOIN book_category c ON b.category_id = c.id
    ORDER BY b.id DESC
  `;

  connection.query(query, (err, result) => {
    if (err) {
      console.error('❌ Error fetching books:', err);
      return res.status(500).json({ message: 'Failed to fetch books' });
    }
    return res.status(200).json(result);
  });
});


// 3️⃣ GET single book by ID
app.get('/api/books/:id', (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT b.*, c.name AS category_name
    FROM books b
    LEFT JOIN book_category c ON b.category_id = c.id
    WHERE b.id = ?
  `;

  connection.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error fetching book' });
    if (result.length === 0) return res.status(404).json({ message: 'Book not found' });
    return res.status(200).json(result[0]);
  });
});


// 4️⃣ UPDATE Book
app.put('/api/books/:id', (req, res) => {
  const { id } = req.params;
  const { title, author, category_id, isbn, total_copies, available_copies } = req.body;

  const query = `
    UPDATE books
    SET title = ?, author = ?, category_id = ?, isbn = ?, total_copies = ?, available_copies = ?
    WHERE id = ?
  `;

  connection.query(query, [title, author, category_id, isbn, total_copies, available_copies, id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error updating book' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Book not found' });
    return res.status(200).json({ message: '✅ Book updated successfully' });
  });
});


// 5️⃣ DELETE Book
app.delete('/api/books/:id', (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM books WHERE id = ?`;

  connection.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error deleting book' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Book not found' });
    return res.status(200).json({ message: '🗑️ Book deleted successfully' });
  });
});


// 6️⃣ SEARCH books by title or author
app.get('/api/books/search', (req, res) => {
  const { q } = req.query;
  const search = `%${q}%`;

  const query = `
    SELECT b.*, c.name AS category_name
    FROM books b
    LEFT JOIN book_category c ON b.category_id = c.id
    WHERE b.title LIKE ? OR b.author LIKE ?
  `;

  connection.query(query, [search, search], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error searching books' });
    return res.status(200).json(result);
  });
});


// Server listen
app.listen(3000, () => {
  console.log('🚀 Server is running on port 3000');
});

//! ---- TUESDAY TASK  COMPLETE student, class, bookscategory_id endpoints  -----
//? CRUD + search