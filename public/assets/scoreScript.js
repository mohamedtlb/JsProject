

$(document).ready(function(){

  //On récupère ici les questions et les réponses !
  var Scores = JSON.parse(document.querySelector('#variableJSON').textContent);
  document.querySelector('#variableJSON').remove();

  var scoresList = document.querySelector("#scoresList");
  var html = "";
  var scoreAlternating = false;
  var score_OOT = "Out of Time"; // Out Of Time

  for (var i = 0; i < Scores.length; i++) {
      if(Scores[i].score == -1)
      {
        score_OOT = "Out of Time";
      } else {
        score_OOT = Scores[i].score;
      }
      if (scoreAlternating) {
          html += `<h3 class="scoreAltColourStyle">${i + 1}. ${Scores[i].nom}  ${Scores[i].prenom} - ${score_OOT} - ${Scores[i].note}/20</h3>`
          scoreAlternating = false;
      } else {
          html += `<h3 class="scoreStyle">${i + 1}. ${Scores[i].nom}  ${Scores[i].prenom} - ${score_OOT} - ${Scores[i].note}/20</h3>`
          scoreAlternating = true;
      }
  }
  scoresList.innerHTML = html;
});

$(document).ready(function(){

var MyScores = document.getElementById('MyScores');

MyScores.onclick = function() {
  console.log("You just clicked, didn't you ?");

//The ajax request
   $.ajax({
     type: 'GET', //We're sending a POST signal
     url: '/myScore', //The route we're going to
     success: function(response){
       console.log('We do be successful');
       window.location.replace('/myScore');
       //location.reload();
     }
   });
   return false;
 }
});
