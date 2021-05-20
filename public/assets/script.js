// Initialize globals
var answerText = "";
var timeLimit;
var questionDiv = document.querySelector("#questionBlock");
var reponseDiv = document.querySelector("#reponseBlock");
var alertBoxDiv = document.querySelector("#alertBox");
var answerDiv = document.querySelector("#answerResult");
var endGameDiv = document.querySelector("#endGameBlock");
var optionButtons = [document.querySelector("#quizOption1"), document.querySelector("#quizOption2"),
document.querySelector("#quizOption3"), document.querySelector("#quizOption4")]
var playerInitials = document.querySelector("#playerInitials");
var questionNum = 0;
var scoresArray;
playerInitials.value = '';
var note = 0;

//On récupère ici les questions et les réponses !
var DBQuestions = JSON.parse(document.querySelector('#variableJSON').textContent);
document.querySelector('#variableJSON').remove();
var time = 60 * DBQuestions.length;

// console.log(DBQuestions);
 console.log(DBQuestions[0].question);

// If a local high scores array exists, import it, otherwise initialize the array
if (localStorage.getItem("localHighScores")) {
    scoresArray = JSON.parse(localStorage.getItem("localHighScores"));
} else {
    scoresArray = [];
}

// Do some fancy animations to hide the title screen and show the quiz
function startQuiz() {
    event.stopPropagation();

    document.querySelector("#titleScreen").style = "display:none;"
    document.querySelector(".navbar-text").textContent = "Time: " + time;

    // Replace placeholder with the first question
    changeQuestion();

    // Wait for the title animation to finish, then show the question
    setTimeout(function () {
        document.querySelector("#titleScreen").style = "display: none;";
        document.querySelector("#questionBlock").style = "display: grid;";
        document.querySelector("#reponseBlock").style = "display: grid;";
        document.querySelector("#questionBlock").className = "slideUp question box";
    }, 400);

    timeLimit = setInterval(function () {
        time--;
        document.querySelector(".navbar-text").textContent = "Time: " + time;
        if (time <= 0) {
            clearInterval(timeLimit);
            showEndGame();
        }
    }, 1000);
}

function random_sort()
{
  return Math.random() - 0.5;
}

// changeQuestion operates only when the element clicked is a button
function changeQuestion() {
    var questionInfo = DBQuestions[questionNum];

    // ...If there are no questions left, stop the timer and end the function...
    if (questionInfo == undefined) {
        clearInterval(timeLimit);
        showEndGame();
        return;
    }

    // ...Otherwise write the information into the next question...
    setTimeout(function () {


        // Nombre de réponses qu'on a à placer
        const aswAmount = optionButtons.length;

       // Array qui contient nos réponses
        var Rset = [];
        Rset.push(questionInfo.reponse);
        Rset.push(questionInfo.fausseReponse1);
        Rset.push(questionInfo.fausseReponse2);
        Rset.push(questionInfo.fausseReponse3);

        console.log("leg: " + Rset.length);
        Rset.sort(random_sort);

        for (var i = 0; i < aswAmount; i++) {
          optionButtons[i].textContent = i + 1 + '. ' + Rset[i];
          optionButtons[i].value = Rset[i];
        }
        document.querySelector("#questionPrompt").textContent =  "Difficultée" + questionInfo.difficulty;
        document.querySelector("#Prompt").textContent = questionInfo.question;

        // ...And show the question
        questionDiv.className = "questionFadeIn question box";
        reponseDiv.className = "answerSlideUp main";
    }, 400);

}

// Checks the user input and compares it with the answer on file.
function checkAnswer() {
    if (event.target.nodeName == "BUTTON") {
        var playerAnswer = event.target.value;
        if (playerAnswer) {
            if (playerAnswer === DBQuestions[questionNum].reponse) {
                answerText = "Correct!";
                console.log("Oui !");
                note = note + 2;
                // If there is not enough time left over, set time to 0
            } else {
                answerText = "Wrong!";
                console.log("Non !");
                time -= 15;
                if (time <= 0) {
                    time = 0;
                }
            }

            // This block shows the result of the answer, then hides it after a given time.
            answerDiv.innerHTML = `<hr /> ${answerText}`
            if (answerDiv.style != "display: grid;") {
                answerDiv.style = "display: grid;";
            }
            answerDiv.className = "answerSlideUp question box";
            setTimeout(function () {
                answerDiv.className = "fadeAway question box";
                setTimeout(function () {
                    answerDiv.style = "display: none;";
                }, 300);
            }, 700);

            // Slide away the current question to prepare the next
            questionDiv.className = "questionFadeOut question box";
        }
        // questionNum is iterated and the next question is called
        questionNum++;
        changeQuestion();
    }
}

function showEndGame() {
  console.log("Game ended");
    // Rewrites remaining time if the final question was wrong
    document.querySelector(".navbar-text").textContent = "Time: " + time;

    // Writes the final score to showScore
    if (time != 0) {
        document.querySelector("#showScore").textContent = time;
    } else {
        document.querySelector("#showScore").textContent = "DNF";
    }

    // Animation handlers
    if (questionDiv.className != "questionFadeOut") {
        questionDiv.className = "questionFadeOut question box";
    }
    setTimeout(function () {
        questionDiv.style = "display: none;";
        reponseDiv.style = "display: none;";
        reponseDiv.className = "";
        answerDiv.style = "display: none;";
        endGameDiv.style = "display: grid;";
        endGameDiv.className = "slideDown question box";
    }, 700)
}

function submitAndSaveScore(event) {
    // event.preventDefault();
    // if (playerInitials.value.trim() == '') {
    //     if (alertBoxDiv.style != "display:grid;") {
    //         alertBoxDiv.style = "display:grid;";
    //
    //         setTimeout(function () {
    //             alertBoxDiv.style = "display: none;";
    //         }, 1000);
    //     }
    //     return;
    // } else {
    //     var newHighScore = {
    //         initials: playerInitials.value.toUpperCase().trim(),
    //         score: time
    //     };
    //     scoresArray.push(newHighScore);
    //     scoresArray.sort(function (a, b) { return b.score - a.score });
    //     localStorage.setItem("localHighScores", JSON.stringify(scoresArray));
    //     window.location.href = "./scores.html"
    // }

    var formData = {
      score: time,
      note: note,
      ID_Quest:DBQuestions[0].ID_Questionnaire,
     };

     $.ajax({
       type: 'POST', //We're sending a POST signal
       url: '/scoreStorage', //The route we're going to
       data: formData, //What we're sending in the post
       success: function(data){
       console.log('We do be successful');
       console.log(data);
       location.reload();
       }
     });
     return false;
}

// The only event listeners in the entire script
// It's kind of sad, really. Three dinky little lines.
document.querySelector("#quizStart").onclick = startQuiz;
document.addEventListener("click", checkAnswer);
document.querySelector("#submitButton").onclick = submitAndSaveScore;
