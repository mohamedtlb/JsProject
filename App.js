/*
  Wouldn't have been possible without this 37 youtube videos
  https://www.youtube.com/watch?v=w-7RQ46RgxU&list=PL4cUxeGkcC9gcy9lrvMJ75z9maRw4byYp&index=1
*/

var express = require('express');
var mysql = require('mysql');

var app = express();

//static for the static files like *.css
app.use(express.static('./public'));

//urlencoder will parse our POST data
app.use(express.urlencoded({extended: true}));

//We're on port 3000
app.listen(3000);
console.log('Listening to port 3000');

//Our connection to the DB
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'user',
  database: 'mydb'
});

//We check if the connection was successful
db.connect((err) => {
  if (err) { throw err; }
  console.log("DB connection OK");
});

//Sending the signUpBeta page
app.get('/signUpBeta', function(req, res){
  res.sendFile(__dirname + '/signUp.html');
});

//When we get a POST request we just display stuff in the console
app.post('/signUpBeta', function(req, res){

  //THE ID IS HARDCODED RIGHT NOW, IT WILL THEREFORE ONLY WORK ONCE
  //AFTER THAT YOU'LL GET A 'PRIMARY KEY ALREADY EXISTS OR WHATEVER'

  // !!! They are ` and not ' !!! (alt gr + 7)
  //We setup the query to insert the user's credentials into profil
  var sql = `INSERT INTO profil (login, password) VALUES ('${req.body.email}', '${req.body.pswrd}')`;

  //We execute the query
  db.query(sql, function (err, results) {
    if(err) { throw err; }
    //console.log(results);
  });

  //We setup the query to insert the user's info into users
  var sql = `INSERT INTO users (nom, prenom, email, password, ID_profil) VALUES
                        ('${req.body.nom}', '${req.body.prenom}', '${req.body.email}', '${req.body.pswrd}', 
                        (SELECT ID_Profil FROM profil WHERE login LIKE '${req.body.email}'))`;

  //We execute the query
  db.query(sql, function (err, results) {
    if(err) { throw err; }
    //console.log(results);
  });

  
  //On fait notre query
  db.query("SELECT * FROM `users`", function (err, results) {
    if (err) { throw err; }
    console.log(results);
  });

  //Temporary
  res.end('Boop');
});
