$(document).ready(function(){

  $('form').on('submit', function(){

    var formData = {
       nom: $('#nom').val(),
       prenom: $('#prenom').val(),
       email: $('#mail').val(),
       pswrd: $('#pswrd').val(),
     };

    console.log(formData);
    $.ajax({
      type: 'POST',
      url: '/signUpBeta',
      data: formData,
      success: function(data){
      console.log('We do be successful');
      location.reload();

      }
    });
    return false;
  });

});
