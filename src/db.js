const mysql = require("mysql2");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: {
    // use  fs  to read  file from the path
    ca: fs.readFileSync(
      path.resolve(process.cwd(), process.env.CA_CERT_PATH),
      "utf8"
    ),
    rejectUnauthorized: true,
  },
});

connection.connect((err) => {
  if (err) {
    console.log("Error connecting to database", err);
  } else {
    console.log("Connected to database");
  }
});

module.exports = { connection };
