const mysql = require("mysql2");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
dotenv.config();

const connectionConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
};

if (process.env.CA_CERT_PATH) {
  connectionConfig.ssl = {
    ca: fs.readFileSync(
      path.resolve(process.cwd(), process.env.CA_CERT_PATH),
      "utf8"
    ),
    rejectUnauthorized: true,
  };
}

const connection = mysql.createConnection(connectionConfig);

connection.connect((err) => {
  if (err) {
    console.log("Error connecting to database", err);
  } else {
    console.log("Connected to database");
  }
});

module.exports = { connection };
