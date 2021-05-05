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

app.get('/createQuestion', function(req, res){
  res.sendFile(__dirname + '/PreparationQuestion.html');
});

app.post('/createQuestion', function(req, res){

  console.log(req.body.question);
  console.log(req.body.proposition1);
  console.log(req.body.proposition2);
  console.log(req.body.proposition3);
  console.log(req.body.proposition4);
  console.log(req.body.difficultee);
  console.log(req.body.ue);

  //On regarde si l'UE est déjà dans la liste des UE qui existe, si non on la créer.
  var sqlVerifUE = `SELECT libelle FROM cathegorie WHERE libelle = '${req.body.ue}'`;

  //Execute la querry Select
  db.query(sqlVerifUE, function (err, resultsVerifUE) {
    if(err) { throw err; }
    console.log("Number of affected rows: " + resultsVerifUE.length);

    var okToLaunchInsertQuestion = false;

    if(resultsVerifUE.length >= 2)
    {
      console.log("On a 2 fois le même UE dans la table, contactez le DB Admin");
      console.log(resultsVerifUE);
      res.end('ERROR');
    }

    if(resultsVerifUE.length == 1)
    {
      okToLaunchInsertQuestion = true;
    }

    if(resultsVerifUE.length == 0)
    {
      //On créer une nouvelle cathegorie
      console.log("On va créer une nouvelle UE !");

      // Ideally we'd put that *after* the query but asynchronicity is a mean beast
      // And using a promise here would force me to duplicate some code into "if(resultsVerifUE.length == 1)"
      // At least I think and I don't have enough time to polish that right now
      okToLaunchInsertQuestion = true;

      var sqlNewUE = `INSERT INTO cathegorie (libelle) VALUES ('${req.body.ue}')`;
      db.query(sqlNewUE, function (err, resultsNewUE) {
        if(err) { throw err; }
        console.log("New UE added !");
      });
    }

    console.log("Is it ok ? <" + okToLaunchInsertQuestion + ">");
    if(okToLaunchInsertQuestion == true)
    {
      console.log("On insert la question");

      //Changer cathegorie en categorie quand on passe en production
      var sql = `INSERT INTO questionnaire (question, reponse, fausseReponse1, fausseReponse2, fausseReponse3, difficulty, ID_cathegorie)
                                    VALUES ('${req.body.question}', '${req.body.proposition1}', '${req.body.proposition2}', '${req.body.proposition3}',
                                            '${req.body.proposition4}', '${req.body.difficultee}',
                                            (SELECT ID_cathegorie FROM cathegorie WHERE libelle = '${req.body.ue}'))`;

      db.query(sql, function (err, results) {
        if(err) { throw err; }
        //console.log(results);
      });
    }
  });
  //Temporary
  res.end('Boop');
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
