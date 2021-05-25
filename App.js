/*
  Wouldn't have been possible without this 37 youtube videos
  https://www.youtube.com/watch?v=w-7RQ46RgxU&list=PL4cUxeGkcC9gcy9lrvMJ75z9maRw4byYp&index=1
*/

const session = require('express-session');
var express = require('express');
var mysql = require('mysql2/promise');
const bcrypt = require('bcrypt')

var app = express();

app.set('view engine', 'ejs');

// include of session
app.use(session({secret: 'ssshhhhh', saveUninitialized:true, resave: false}));

//static for the static files like *.css
app.use(express.static('./public', {dotfiles: 'allow'}));

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

app.get('/login', function(req, res){
  res.sendFile(__dirname + '/login.html');
  sess=req.session;
  sess.email; // equivalent to $_SESSION['email'] if you don't understand in PHP.
  sess.pswr;
});

// app.get('/.well-known/acme-challenge/2LDSI0cHfyHD5GuH88LPhEEp2ZIDigcTedRveFtjUD8', async function(req, res) {
//   res.sendFile(__dirname + 'public/.well-known/acme-challenge/2LDSI0cHfyHD5GuH88LPhEEp2ZIDigcTedRveFtjUD8');
// });

app.get('/index', async function(req, res) {
  console.log("In index");
  db = await pool.getConnection(); {
    if (db.err) throw err; // not connected!
    var sql = `SELECT * FROM questionnaire AS t1 JOIN (SELECT ID_Questionnaire FROM questionnaire ORDER BY RAND() LIMIT 10) as t2 ON t1.ID_Questionnaire=t2.ID_Questionnaire`;
    sql = mysql.format(sql);
    results = await db.query(sql);
    db.release();
  }
  //res.sendFile(__dirname + '/index.html');
  console.log(results[0]);
  //res.send(results[0]);
  res.render('index', {results: results[0]});

  // SELECT * FROM tbl AS t1 JOIN (SELECT id FROM tbl ORDER BY RAND() LIMIT 10) as t2 ON t1.id=t2.id
});

//When we get a POST request we just display stuff in the console
app.post('/login', async function(req, PostRes, next){

  console.log("In login");
  var redirectBool = false;
  var redirectPath;

  //We acquire a connection from the pool
  db = await pool.getConnection(); {
  if (db.err) throw err; // not connected!


    // !!! They are ` and not ' !!! (alt gr + 7)
    //We setup the query to insert the user's credentials into profil
    var sql = `SELECT password FROM profil WHERE login LIKE ?`;
    var inserts = [req.body.email];
    sql = mysql.format(sql, inserts);

    //We execute the query
    results = await db.query(sql);
      if(results.err) { throw err; }

      if(results[0].length == 0)
      {
        // Print que le compte n'existe pas sur la page html
        console.log("No account could be found");
        req.session.destroy();
        PostRes.redirect("/login.html");
      }
      else if(results[0].length == 1)
      {
        console.log("Getting result back");
        console.log("Res[0]: " + results[0].length);
        console.log("Psw[0][0]: " + results[0][0].length);
        var hash = results[0][0].password;
        console.log("hash is " + hash);
        resComp = await bcrypt.compare(req.body.pswrd, hash);
        if(resComp)
        {
          // Attribution des variables de sessions
          console.log("Account found");
          sess.email = req.body.email;
          console.log(sess.email);
          redirectBool = true;
          redirectPath = "/index";
        }
        else {
          console.log(resComp);
          console.log("Wrong password");
        }
      }
      else {
        console.log("More than one account with the same credentials ?");
        console.log(results.length);
        console.log(results);
      }


    db.release();
  } // pool closed

  console.log(redirectBool);
  if(redirectBool)
  {
    console.log("In redirect: " + redirectPath);
    PostRes.send({code: 1, path: redirectPath});
  }
  else {
    PostRes.send({code: -1});
  }
  //Temporary
  PostRes.end('Boop');
});

app.post('/createQuestion', async function(req, res){

  console.log("In createQuestion");
  //On regarde si l'UE est déjà dans la liste des UE qui existe, si non on la créer.
  var sqlVerifUE = `SELECT libelle FROM categorie WHERE libelle = ?`;
  var insertsVerifUE = [req.body.ue];
  sqlVerifUE = mysql.format(sqlVerifUE, insertsVerifUE);

  //We acquire a connection from the pool
  console.log("Getting Connection");
  db = await pool.getConnection(); {
  if (db.err) {
    console.log("error");
    console.log(db.err);
    throw db.err;
  } // not connected!

    //Execute la querry Select
    console.log("Verif si UE existe");
    resultsVerifUE = await db.query(sqlVerifUE); {
      if(resultsVerifUE.err) { throw resultsVerifUE.err; }
      console.log("Number of affected rows: " + resultsVerifUE[0].length);

      var okToLaunchInsertQuestion = false;

      if(resultsVerifUE[0].length >= 2)
      {
        console.log("On a 2 fois le même UE dans la table, contactez le DB Admin");
        console.log(resultsVerifUE);
        res.end('ERROR');
      }

      if(resultsVerifUE[0].length == 1)
      {
        okToLaunchInsertQuestion = true;
      }

      if(resultsVerifUE[0].length == 0)
      {
        //On créer une nouvelle categorie
        console.log("On va créer une nouvelle UE !");

        // Ideally we'd put that *after* the query but asynchronicity is a mean beast
        // And using a promise here would force me to duplicate some code into "if(resultsVerifUE.length == 1)"
        // At least I think and I don't have enough time to polish that right now
        okToLaunchInsertQuestion = true;

        var sqlNewUE = `INSERT INTO categorie SET ?`;
        var insertNewUE = {libelle: req.body.ue};
        sqlNewUE = mysql.format(sqlNewUE, insertNewUE);

        resultsNewUE = await db.query(sqlNewUE); {
          if(resultsNewUE.err) { throw resultsNewUE.err; }
          console.log("New UE added !");
        }
      }

      console.log("Is it ok ? <" + okToLaunchInsertQuestion + ">");
      if(okToLaunchInsertQuestion == true)
      {
        console.log("On insert la question");

        var sqlSelectLibelle = `SELECT ID_categorie FROM categorie WHERE libelle = ?`;
        sqlSelectLibelle = mysql.format(sqlSelectLibelle,  [req.body.ue]);

        resultsLibelle = await db.query(sqlSelectLibelle); {

          var sql = `INSERT INTO questionnaire SET ?`;
          var inserts =  {question: req.body.question, reponse: req.body.proposition1,
                          fausseReponse1: req.body.proposition2, fausseReponse2: req.body.proposition3,
                          fausseReponse3: req.body.proposition4, difficulty: req.body.difficultee,
                          ID_categorie: resultsLibelle[0][0].ID_categorie};
          sql = mysql.format(sql, inserts);

          results = await db.query(sql); {
            if(results.err) { throw results.err; }
            console.log("Affected Rows: " + results[0].affectedRows);
          }// Insert Into Questionnaire
        }// Select Libelle
      }// If it's ok to insert la question
    }// Verif UE

    db.release;
  } //Pool closed

  //Temporary
  res.end('Boop');
});

//Sending the signUpBeta page
app.get('/signUpBeta', function(req, res){
  res.sendFile(__dirname + '/signUp.html');
});

app.get('/score', async function(req, res) {

  console.log("In Score Display");

  db = await pool.getConnection(); {
    if (db.err) throw dr.err; // not connected!
    // Associe nom/prenom aux score, ordonne par les meilleurs score en premier et prend les  meilleurs
    // SELECT * FROM heroku_ba0a838a03c77b3.quiz as q1 JOIN (SELECT nom, prenom, ID_users FROM heroku_ba0a838a03c77b3.users) as u1 ON q1.ID_Users = u1.ID_Users ORDER BY score desc LIMIT 10;
    var sqlScores = `SELECT * FROM quiz as q1 JOIN (SELECT nom, prenom, ID_users FROM users) as u1 ON q1.ID_Users = u1.ID_Users ORDER BY score desc LIMIT 10`;

    var resScores = await db.query(sqlScores);
    console.log("Queried");
    if(resScores[0].length == 0)
    {
      console.log("No Scores in the DB yet");
      var errorMSG = {text: "Il n'y a pas encore de scores dans la Base de Données, revenez plus tard !"};
      res.render('error', {error: errorMSG});
    } else {
      console.log("length more than 0");
      res.render('leaderboard',  {scores: resScores[0], code: 1});
    }
    db.release();
  }
    res.end('Boop');
});

app.get('/myScore', async function(req, res) {

  console.log("In myScore Display");

  db = await pool.getConnection(); {
    if (db.err) throw dr.err; // not connected!

      var toAnon = false;
      if(typeof sess == 'undefined')
      {
        toAnon = true;
      } else if(typeof sess.email == 'undefined') {
        toAnon = true;
      }

      if(toAnon)
      {
        var errorMSG = {text: "Il faut s'identifier pour avoir accès à ses scores."};
        res.render('error', {error: errorMSG});
      }else {

        var sqlUserID = `SELECT ID_users FROM users WHERE email LIKE ?`;
        var insert = [sess.email];
        sqlUserID = mysql.format(sqlUserID, insert);

        var resUser = await db.query(sqlUserID);
        var IDUser = resUser[0][0].ID_users;

        var sqlScores = `SELECT * FROM quiz as q1 JOIN (SELECT nom, prenom, ID_users FROM users) as u1 ON q1.ID_Users = u1.ID_Users && q1.ID_Users = ? ORDER BY score desc LIMIT 10`;
        var insert = [IDUser];
        sqlScores = mysql.format(sqlScores, insert);

        var resScores = await db.query(sqlScores);

        if(resScores[0].length == 0)
        {
          console.log("No Scores for that user in the DB yet");
          var errorMSG = {text: "Vous n'avez pas encore de score d'enregistré."};
          res.render('error', {error: errorMSG});
        } else {
          res.render('leaderboard',  {scores: resScores[0], code: 2});
        }
      }
      db.release();
    }
  res.end('Boop');
});

//When we get a POST request we just display stuff in the console
app.post('/signUpBeta', async function(req, res){

  console.log("In signUpBeta");

  //We acquire a connection from the pool
  db = await pool.getConnection(); {
    if (db.err) throw dr.err; // not connected!

    // We prepare the password by generating salt and hashing it
    const saltRounds = 10;

    hash = await bcrypt.hash(req.body.pswrd, saltRounds); {
      if(hash.err) {throw hash.err;}
      console.log("Hash: " + hash);

      // !!! They are ` and not ' !!! (alt gr + 7)
      //We setup the query to insert the user's credentials into profil
      var sql = `INSERT INTO profil SET ?`;
      var inserts = {login: req.body.email, password: hash}
      sql = mysql.format(sql, inserts);
      console.log(sql);

      //We execute the query
      results = await db.query(sql); {
        if(results.err) { throw results.err; }

        console.log("Profile Insert OK");
        //We setup the query to insert the user's info into users

        var sqlSelectIDPro = `SELECT ID_Profil FROM profil WHERE login LIKE ?`;
        var insertIDPro = [req.body.email];
        sqlSelectIDPro = mysql.format(sqlSelectIDPro, insertIDPro);

        resultsIDPro = await db.query(sqlSelectIDPro); {

          var sql = `INSERT INTO users SET ?`;
          var inserts = {nom: req.body.nom, prenom: req.body.prenom, email: req.body.email,
                         password: hash, ID_profil: resultsIDPro[0][0].ID_Profil};
          sql = mysql.format(sql, inserts);

          // We execute the query
          results = await db.query(sql); {
            if(results.err) { throw results.err; }
            // On fait notre query
              console.log("Select Query");
              resTMP = await db.query("SELECT * FROM `users`"); {
                if (resTMP.err) { throw resTMP.err; }
                console.log(resTMP);
            }// Select Querry
          }// Insert Into Users Querry
        }// Select ID_Profil Querry
      }// Insert Profil
    }// Hash Password

    db.release();
  } // pool closed

  //Temporary
  res.end('Boop');
});

app.post('/scoreStorage', async function(req, res) {

  console.log("in score Storage");

  //We acquire a connection from the pool
  db = await pool.getConnection();
  if (db.err) throw dr.err; // not connected!
  console.log("sess: " + typeof sess);

  var toAnon = false;
  if(typeof sess == 'undefined')
  {
    toAnon = true;
  } else if(typeof sess.email == 'undefined') {
    toAnon = true;
  }

  // J'aurais pu faire tellement plus simple à juste changer ce qu'on met dans insert
  // Mais non il a fallu que je duplique du code et que je me plaigne
  if(toAnon)
  {
    console.log("Pas de session en cours, anon gets the credits !");
    // Récupère l'ID de l'anonyme dans la DB
    var sqlAnon = `SELECT ID_users FROM users WHERE email LIKE ?`;
    var insert = ['Anon@gmail.com'];
    sqlAnon = mysql.format(sqlAnon, insert);

    resAnon = await db.query(sqlAnon);
    var IDAnon = resAnon[0][0].ID_users;
    console.log("IDAnon: " + IDAnon);

    var sqlScore = `INSERT INTO quiz SET ?`;
    var inserts = {score: req.body.score, note: req.body.note, ID_users: IDAnon,
                   ID_question: req.body.ID_Quest};
    sqlScore = mysql.format(sqlScore, inserts);

    results = await db.query(sqlScore);
    console.log("Rows affected: " + results[0].affectedRows);
  }
  else
  {
    var sqlUserID = `SELECT ID_users FROM users WHERE email LIKE ?`;
    var insert = [sess.email];
    sqlUserID = mysql.format(sqlUserID, insert);

    resUser = await db.query(sqlUserID);
    var IDUser = resUser[0][0].ID_users;
    console.log("IDUser: " + IDUser);

    var sqlScore = `INSERT INTO quiz SET ?`;
    var inserts = {score: req.body.score, note: req.body.note, ID_users: IDUser,
                   ID_question: req.body.ID_Quest};
    sqlScore = mysql.format(sqlScore, inserts);

    results = await db.query(sqlScore);
    console.log("Rows affected: " + results[0].affectedRows);
  }

  db.release();
  res.end('Boop');
});
