/*

1. create server: need express & nodemon(for auto restart sever)

`npm init -y`
`npm install express nodemon`
`npm install  nodemon --save-dev`

`npm install mysql2

*/


const express = require('express');
const mysql = require('mysql2');

const app = express();
// import db connection 
const {connection} = require('./db');

app.use(express.json());
// midlle wre to return  reques url, response status code
app.use((req, res, next)=>{
  console.log(`${req.method} ${req.url} ${res.statusCode}`);
  next();
});


// Test Route

app.get('/', (req, res)=>{
  res.send('welcome to our server ......');
})



// --- BOOKS endpoint ---

// create  book endpoint
app.post('/api/books', (req,res)=>{
  let {title, author, category_id, isbn, total_copies,available_copies } = req.body;
  let query = `INSERT INTO books (title, author, category_id, isbn, total_copies,available_copies) VALUES (?, ?, ?, ?, ?, ?)`; 
  connection.query(
    query,
    [title, author, category_id, isbn, total_copies, available_copies],
  (err, result)=>{
    if(err) return res.status(500).json({message: `Error creating book: ${err.message}`});
    return res.status(201).json({message: 'Book created successfully', book: result});
  }
  ) ; 
})


// ! add endpoint to get all books, books by id , and update books by id and delete books




app.listen(3000, ()=>{
    console.log('server is running on port 3000 ...');
})
