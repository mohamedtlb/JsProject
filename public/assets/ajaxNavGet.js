/*
  Wouldn't have been possible without this 37 youtube videos
  https://www.youtube.com/watch?v=w-7RQ46RgxU&list=PL4cUxeGkcC9gcy9lrvMJ75z9maRw4byYp&index=1
*/

//When the document is fully loaded
$(document).ready(function(){

  var login = document.getElementById('LinkLogin');
  var signUp = document.getElementById('LinkSignUp');
  var insertQuestion = document.getElementById('LinkInsertQuestion');
  var index = document.getElementById('LinkIndex');

  login.onclick = function() {
    console.log("You just clicked, didn't you ?");

  //The ajax request
     $.ajax({
       type: 'GET', //We're sending a POST signal
       url: '/login', //The route we're going to
       success: function(response){
         console.log('We do be successful');
         window.location.replace('/login');
         //location.reload();
       }
     });
     return false;
   }

   signUp.onclick = function() {
     console.log("You just clicked, didn't you ?");

   //The ajax request
      $.ajax({
        type: 'GET', //We're sending a POST signal
        url: '/signUpBeta', //The route we're going to
        success: function(response){
          console.log('We do be successful');
          window.location.replace('/signUpBeta');
          //location.reload();
        }
      });
      return false;
    }

    insertQuestion.onclick = function() {
      console.log("You just clicked, didn't you ?");

    //The ajax request
       $.ajax({
         type: 'GET', //We're sending a POST signal
         url: '/createQuestion', //The route we're going to
         success: function(response){
           console.log('We do be successful');
           window.location.replace('/createQuestion');
           //location.reload();
         }
       });
       return false;
     }

     index.onclick = function() {
       console.log("You just clicked, didn't you ?");

     //The ajax request
        $.ajax({
          type: 'GET', //We're sending a POST signal
          url: '/index', //The route we're going to
          success: function(response){
            console.log('We do be successful');
            window.location.replace('/index');
            //location.reload();
          }
        });
        return false;
      }

 });
