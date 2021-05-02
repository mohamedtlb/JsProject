 // this is a class of our question
 class Question {
    constructor(text, choices, answer) {
      this.text = text;
      this.choices = choices;
      this.answer = answer;
    }
    isCorrectAnswer(choice) {
      return this.answer === choice;
    }
  }
  // this table contains all questions that we have to ask on this game!!
  let questions = [
    new Question("Par défaut, dans quel mode se place l'optimiseur Oracle ?", ["RULE", "COST", "SELECT", "ALL_ROWS"], "All_ROWS"),
    new Question("Si j'ai défini une table avec: initial 100k, Next 100k, pctincrease 100, maxextent 3.Quelle est la taille maximale de ma table ?", ["400k", "500k", "1800k", "600k"], "400k"),
    new Question("Quelle est le meilleur type d'index pour: SELECT ename FROM emp WHERE sal BETWEEN 25000 AND 40000 ?", ["arbre B+", "index primaire", "Hachage", "index secondaire"], "arbre B+"),
    new Question("Une lecture non reproductible peut se produire: ", ["Verouillage de la table","READ ONLY", "READ COMMITTED", "SERIALISABLE"], "READ COMMITTED")
  ];
  
  //console.log(questions);
// this class Quiz implement all the elements that want to show on our quiz
class Quiz {
    constructor(questions) {
      this.score = 0;
      this.questions = questions;
      this.currentQuestionIndex = 0;
    }
// this function return the current question in the homepage
    getCurrentQuestion() {
      return this.questions[this.currentQuestionIndex];
    }
    //this function verifie if the answer given by the players is correct or noit
    guess(answer) {
      if (this.getCurrentQuestion().isCorrectAnswer(answer)){
        this.score++;
      }
      this.currentQuestionIndex++;
    }
    // this function verify if the quiz has ended or not!!
    hasEnded() {
      return this.currentQuestionIndex >= this.questions.length;
    }
  }

// regroup all functions relative to the apploication display

const display = {
// show dynamically the contains of html homePage
    elementShown: function(id, text) {
      let element = document.getElementById(id);
      element.innerHTML = text;
    },
    endQuiz: function() {// verify if the qui hase ended
      endQuizHTML = `
        <h1> Quiz terminé !</h1>
        <h3> Votre score final est de : ${quiz.score} / ${quiz.questions.length}</h3>`;
      this.elementShown("quiz", endQuizHTML);
    },
    question: function() {// show the currentQuestion
      this.elementShown("question", quiz.getCurrentQuestion().text);
    },
    choices: function() {
        let choices = quiz.getCurrentQuestion().choices;
        //console.log(choices);
        //this methode impemente the choice of player
        guessHandler = (id, guess) => {
            document.getElementById(id).onclick = function(){
                quiz.guess(guess);
                quizApp();
            }  
      }
// show all choices in differnts button
      for(let i = 0; i < choices.length; i++){
          this.elementShown("choice" + i, choices[i]);
          guessHandler("guess" + i, choices[i]);
      }
    }

  };
  
// it make all Game logic in this functions
// Game logic
quizApp = () => {
    if (quiz.hasEnded()) {
      display.endQuiz();
    } else {
      display.question();
      display.choices();
      display.progress();
    } 
  }
  // Create Quiz
  let quiz = new Quiz(questions);
  quizApp();
  
  console.log(quiz);



  
