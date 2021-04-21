/*
  Créer une database nommé mydb
  Le code vient de:
  https://www.w3schools.com/nodejs/nodejs_mysql_create_db.asp
*/

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "user"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  con.query("CREATE DATABASE mydb", function (err, result) {
    if (err) throw err;
    console.log("Database created");
  });
});
