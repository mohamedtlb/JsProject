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

  //We setup the query
  // !!! They are ` and not ' !!! (alt gr + 7)
  //var sql = `INSERT INTO profil (ID_Profil, login, password) VALUES (2, '${req.body.email}', '${req.body.pswrd}')`;
  var sql = `INSERT INTO users (ID_users, nom, prenom, email, password, ID_profil) VALUES
                        (2, '${req.body.nom}', '${req.body.prenom}', '${req.body.email}', '${req.body.pswrd}', 2)`;
  console.log(sql);

  db.query(sql, function (err, results) {
    if(err) { throw err; }
    console.log(results);
  });

  //On fait notre query
  db.query("SELECT * FROM `users`", function (err, results) {
    if (err) { throw err; }
    console.log(results);
  });

  //Temporary
  res.end('Boop');
});
