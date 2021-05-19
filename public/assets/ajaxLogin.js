/*
  Wouldn't have been possible without this 37 youtube videos
  https://www.youtube.com/watch?v=w-7RQ46RgxU&list=PL4cUxeGkcC9gcy9lrvMJ75z9maRw4byYp&index=1
*/

//When the document is fully loaded
$(document).ready(function(){

  //When a form is sent
  $('form').on('submit', function(){

    //That's the signUp data
    var formData = {
       email: $('#UserName').val(),
       pswrd: $('#pswr').val(),
     };
//Debugging
console.log(formData);

    //The ajax request
    $.ajax({
      type: 'POST', //We're sending a POST signal
      url: '/login', //The route we're going to
      data: formData, //What we're sending in the post
      success: function(data){
      console.log('We do be successful');
      console.log(data);

      if(data.code == 1)
      {
        $.ajax({
          type: 'GET', //We're sending a POST signal
          url: data.path, //The route we're going to
          success: function(response){
            console.log('We do be successful');
            window.location.replace(data.path);
            //location.reload();
          }
        });
      }
      else {
        console.log("We fucked up");
      }
      //location.reload();
      //window.location.replace('/index');
      }
    });
    return false;
  });

});
