/*
  Wouldn't have been possible without this 37 youtube videos
  https://www.youtube.com/watch?v=w-7RQ46RgxU&list=PL4cUxeGkcC9gcy9lrvMJ75z9maRw4byYp&index=1
*/

const session = require('express-session');
var express = require('express');
var mysql = require('mysql2/promise');
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

app.get('/login', function(req, res){
  res.sendFile(__dirname + '/login.html');
  sess=req.session;
  sess.email; // equivalent to $_SESSION['email'] if you don't understand in PHP.
  sess.pswr;
});

app.get('/index', function(req, res) {
  console.log("In index");
  res.sendFile(__dirname + '/index.html');
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
    results = await db.query(sql)
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
              resTMP = db.query("SELECT * FROM `users`"); {
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
