/*

1. create server: need express & nodemon(for auto restart sever)

`npm init -y`
`npm install express nodemon`
`npm install  nodemon --save-dev`

`npm install mysql2

*/
/* security:

1.  bcryptjs: for hashing passwords
2.  jsonwebtoken: for authentication
3. dotenv: for environment variables


`npm install bcryptjs jsonwebtoken dotenv`

*/


const express = require("express");
const mysql = require("mysql2");
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

dotenv.config();


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
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} -> ${res.statusCode}`);
  next();
});

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: User authentication
 *   - name: Books
 *     description: Book management operations
 */


//? authentication middleware
const  authenticate = (req, res, next)=>{
const   authHeader  =  req.headers.authorization;
if(!authHeader){
  return res.status(401).json({message: "no token  prvided"})
}

// this  is  a  pen  = split(' ') => [this, is, a, pen] 
const  token  =  authHeader.split(" ")[1] //  turn in to array and  take   value in  second  index
jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user)=>{
  if(err){
    return res.status(401).json({message: "invalid  token"});
  }
  req.user = user; 
  next();
})

}

//!  check   role  on  action 
const  authorize =  (roles = [])=>{
  return(req, res,  next) =>{
if(!roles.includes(req.user.role)){
  return res.status(403).json({message: "acess denied"})
}
next();
  }
}

// Root test route
app.get('/', (req, res) => {
  res.send('📚 Welcome to School Library API Server');
});


// =======================================
// ========== BOOKS ENDPOINTS ============
// =======================================

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               category_id:
 *                 type: number
 *               isbn:
 *                 type: string
 *               total_copies:
 *                 type: number
 *               available_copies:
 *                 type: number
 *     responses:
 *       201:
 *         description: Book created successfully
 *       401:
 *         description: Unauthorized - No token provided
 */

// 1️⃣ CREATE Book
app.post('/api/books', authenticate, (req, res) => {
  const { title, author, category_id, isbn, total_copies, available_copies } = req.body;
  /* sample  body  json:
  {
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "category_id": 1,
    "isbn": "9780743273565",
    "total_copies": 10,
    "available_copies": 10
  }
  */
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

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: List of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   author:
 *                     type: string
 *                   category_id:
 *                     type: integer
 *                   category_name:
 *                     type: string
 *                   isbn:
 *                     type: string
 *                   total_copies:
 *                     type: integer
 *                   available_copies:
 *                     type: integer
 */

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


/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Get a single book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book details
 *       404:
 *         description: Book not found
 */

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


/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Update a book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               category_id:
 *                 type: number
 *               isbn:
 *                 type: string
 *               total_copies:
 *                 type: number
 *               available_copies:
 *                 type: number
 *     responses:
 *       200:
 *         description: Book updated successfully
 *       404:
 *         description: Book not found
 *       401:
 *         description: Unauthorized
 */

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


/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Delete a book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *       404:
 *         description: Book not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied - Librarian role required
 */

// 5️⃣ DELETE Book
app.delete('/api/books/:id', authenticate, authorize(['librarian']), (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM books WHERE id = ?`;

  connection.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error deleting book' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Book not found' });
    return res.status(200).json({ message: '🗑️ Book deleted successfully' });
  });
});


/**
 * @swagger
 * /api/books/search:
 *   get:
 *     summary: Search books by title or author
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query (title or author)
 *     responses:
 *       200:
 *         description: List of matching books
 */

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



//  USER MANAGEMENT ENDPOINTS ==================
// 1. Register a new user
/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 example: librarian
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Missing fields
 */

app.post('/api/user/register', async (req, res)=>{
 const {name, email, password, role} = req.body;
 if(!name || !email || !password ){
  return res.status(400).json({ message: 'name, email and password are required' });
}

const  hashedPassword = await bcrypt.hash(password, 10); // hash the password

const  query =  `
INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)                  
`
connection.query(query, [name,email, hashedPassword, role],(err, result)=>{
  if(err) return res.status(500).json({ message: 'Error registering user', error: err });
  return res.status(201).json({ message: 'User registered successfully' });
})
});


/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid email or password
 */

// 2. Login a user
app.post('/api/user/login',  (req, res)=>{
const {email, password} = req.body;
/*   steps
  1. check if user exists using  email provided by user , if yes them  fetch user from database
  2. compare password  user  provided password we have in databse 
  3. if password is correct, generate a token and send it to user
*/

//! we use  async and  await in other  to  to  avoid  parallel execution  of code (parent functin need  to wait for child function to complete)
// 1. check if user exists using  email provided by user , if yes them  fetch user from database
const query = `SELECT * FROM users WHERE email = ?`;
connection.query(query, [email], async (err, result)=>{
  if(err) return res.status(500).json({ message: 'Error logging in', error: err });
  if(result.length === 0){
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  const user = result[0];
  // 2. compare password  user  provided password we have in database 
  const  isPasswordCorrect= await bcrypt.compare(password, user.password);
  if(!isPasswordCorrect){
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  // 3. if password is correct, generate a token and send it to user
  const token = jwt.sign(
    {id: user.id, role: user.role}, 
    process.env.JWT_SECRET_KEY,
    {expiresIn: process.env.JWT_EXPIRES}
  );
  return res.status(200).json({ message: 'Login successful', token });
})
})


//? auntication  middleware

// Server listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

