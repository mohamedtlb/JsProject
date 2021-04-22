//https://code-boxx.com/connect-database-javascript/

// (A) LOAD DB MODULE
const mysql = require("mysql");
const express = require("expess");

var app = express();

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'user',
  database: 'mydb'
});
db.connect((err) => {
  if (err) { throw err; }
  console.log("DB connection OK");
});

// (C) QUERY
db.query("SELECT * FROM `users`", function (err, results) {
  if (err) { throw err; }
  console.log(results);
