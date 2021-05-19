/*
  Wouldn't have been possible without this 37 youtube videos
  https://www.youtube.com/watch?v=w-7RQ46RgxU&list=PL4cUxeGkcC9gcy9lrvMJ75z9maRw4byYp&index=1
*/
// this is express_module that we have include
const session = require('express-session');
var express = require('express');
var mysql = require('mysql');
const bcrypt = require('bcrypt')

var app = express();

// include of session
app.use(session({secret: 'ssshhhhh', saveUninitialized:true, resave: false}));

//static for the static files like *.css
app.use(express.static('./public'));

//urlencoder will parse our POST data
app.use(express.urlencoded({extended: true}));

app.set('port', process.env.PORT || 3000);

//We're on port 3000
app.listen(app.get('port'));
console.log('Listening to port ' + app.get('port'));

//Our connection to the DB
if(app.get('port') == 3000) //Local w/ Node App or Nodemon App
{
  var pool = mysql.createPool({
    connectionLimit : 10,
    host: 'localhost',
    user: 'root',
    password: 'user',
    database: 'mydb'
  });

} else // Heroku
{
  var pool = mysql.createPool({
    connectionLimit : 10,
    host: 'eu-cdbr-west-01.cleardb.com',
    user: 'b18bd6b4e35f99',
    password: 'd317e611',
    database: 'heroku_ba0a838a03c77b3'
  });
}

app.get('/createQuestion', function(req, res){
  res.sendFile(__dirname + '/PreparationQuestion.html');
});
// variables session
var sess;
app.get('/login', function(req, res){
  res.sendFile(__dirname + '/login.html');
    sess=req.session;
    sess.email; // equivalent to $_SESSION['email'] if you don't understand in PHP.
    sess.pswr;
});

//When we get a POST request we just display stuff in the console
app.post('/login', function(req, res){

  console.log("In login");

  //We acquire a connection from the pool
  pool.getConnection(function(err, db) {
  if (err) throw err; // not connected!


    // !!! They are ` and not ' !!! (alt gr + 7)
    //We setup the query to insert the user's credentials into profil
    var sql = `SELECT password FROM profil WHERE login LIKE ?`;
    var inserts = [req.body.email];
    sql = mysql.format(sql, inserts);

    //We execute the query
    db.query(sql, function (err, results) {
      if(err) { throw err; }

      if(results.length == 0)
      {
        // Print que le compte n'existe pas sur la page html
        console.log("No account could be found");
        req.session.destroy();
        res.redirect("/login.html");
      }
      else if(results.length == 1)
      {
        var hash = results.rows[0].password;
        bcrypt.compare(req.body.pswrd, hash, function(err, res) {
          if(res)
          {
            // Attribution des variables de sessions
            console.log("Account found");
            sess.email = req.body.email;
            console.log(sess.email);
            res.redirect("/index.html");
          }
          else {
            console.log("Wrong password");
          }
        });
      }
      else {
        console.log("More than one account with the same credentials ?");
        console.log(results.length);
        console.log(results);
      }
    });

    db.release();
  }); // pool closed

  //Temporary
  res.end('Boop');
});

app.post('/createQuestion', function(req, res){

  console.log("In createQuestion");
  //On regarde si l'UE est déjà dans la liste des UE qui existe, si non on la créer.
  var sqlVerifUE = `SELECT libelle FROM cathegorie WHERE libelle = ?`;
  var insertsVerifUE = [req.body.ue];
  sqlVerifUE = mysql.format(sqlVerifUE, insertsVerifUE);

  //We acquire a connection from the pool
  pool.getConnection(function(err, db) {
  if (err) throw err; // not connected!

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

        var sqlNewUE = `INSERT INTO cathegorie SET ?`;
        var insertNewUE = {libelle: req.body.ue};
        sqlNewUE = mysql.format(sqlNewUE, insertNewUE);

        db.query(sqlNewUE, function (err, resultsNewUE) {
          if(err) { throw err; }
          console.log("New UE added !");
        });
      }

      console.log("Is it ok ? <" + okToLaunchInsertQuestion + ">");
      if(okToLaunchInsertQuestion == true)
      {
        console.log("On insert la question");

        var sqlSelectLibelle = `SELECT ID_cathegorie FROM cathegorie WHERE libelle = ?`;
        sqlSelectLibelle = mysql.format(sqlSelectLibelle,  [req.body.ue]);

        db.query(sqlSelectLibelle, function (err, resultsLibelle)
        {
          var sql = `INSERT INTO questionnaire SET ?`;
          var inserts =  {question: req.body.question, reponse: req.body.proposition1,
                          fausseReponse1: req.body.proposition2, fausseReponse2: req.body.proposition3,
                          fausseReponse3: req.body.proposition4, difficulty: req.body.difficultee,
                          ID_cathegorie: resultsLibelle[0].ID_cathegorie};
          sql = mysql.format(sql, inserts);

          db.query(sql, function (err, results) {
            if(err) { throw err; }
            console.log(results);
          });// Insert Into Questionnaire
        });// Select Libelle
      }// If it's ok to insert la question
    });// Verif UE

    db.release;
  }); //Pool closed

  //Temporary
  res.end('Boop');
});

//Sending the signUpBeta page
app.get('/signUpBeta', function(req, res){
  res.sendFile(__dirname + '/signUp.html');
});

//When we get a POST request we just display stuff in the console
app.post('/signUpBeta', function(req, res){

  console.log("In signUpBeta");

  //We acquire a connection from the pool
  pool.getConnection(function(err, db) {
  if (err) throw err; // not connected!

    // We prepare the password by generating salt and hashing it
    const saltRounds = 10;

    bcrypt.hash(req.body.pswrd, saltRounds, function(err, hash) {
      console.log("Hpas: " + hash);
      // !!! They are ` and not ' !!! (alt gr + 7)
      //We setup the query to insert the user's credentials into profil
      var sql = `INSERT INTO profil SET ?`;
      var inserts = {login: req.body.email, password: hash}
      sql = mysql.format(sql, inserts);
      console.log(sql);

      //We execute the query
      db.query(sql, function (err, results) {
        if(err) { throw err; }

        console.log("Profile Insert OK");
        //We setup the query to insert the user's info into users

        var sqlSelectIDPro = `SELECT ID_Profil FROM profil WHERE login LIKE ?`;
        var insertIDPro = [req.body.email];
        sqlSelectIDPro = mysql.format(sqlSelectIDPro, insertIDPro);

        db.query(sqlSelectIDPro, function (err, resultsIDPro) {

          var sql = `INSERT INTO users SET ?`;
          var inserts = {nom: req.body.nom, prenom: req.body.prenom, email: req.body.email,
                         password: hash, ID_profil: resultsIDPro[0].ID_Profil};
          sql = mysql.format(sql, inserts);

          // We execute the query
          db.query(sql, function (err, results) {
            if(err) { throw err; }
            // On fait notre query
              console.log("Select Query");
              db.query("SELECT * FROM `users`", function (err, results) {
                if (err) { throw err; }
                console.log(results);
            });// Select Querry
          });// Insert Into Users Querry
        });// Select ID_Profil Querry
      });// Insert Profil
    });// Hash Password

    db.release();
  }); // pool closed

  //Temporary
  res.end('Boop');
});
