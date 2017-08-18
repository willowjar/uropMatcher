// Author: Meghana Bhat
$(function() {
  // function written by David Morales, shared on StackOverflow
  // decodes URL parameters in the window URL
  var getURLParameter = function(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
  }

  console.log("Loading info for: " + getURLParameter("kerberos"));
  $.get('/users/student/' + getURLParameter("kerberos"), function(resp) {
    var studentObj = resp.content.student;
    Handlebars.partials = Handlebars.templates;
    var html = Handlebars.templates.user_profile(resp.content.student);
    $("#profile").html(html);
    getAndRenderResume (studentObj)
  });


});
var getAndRenderResume = function(studentObj){
    var resumeURL = studentObj.resume;
    var uploadedLink = "https://s3.amazonaws.com/uropmatcher/"+studentObj.kerberos;
    if (resumeURL != uploadedLink){
      $("#error-message-resume").text("This student does not have a resume on file");
      $("#error-message-resume").show();
    } else {
      var read_url = uploadedLink;
      $('#resume-view').attr('src', read_url);
      $("#error-message-resume").hide();
    }

}