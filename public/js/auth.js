// Author: Kelly Shen
$(function() {
	var getParameterByName = function(name) {
	    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.href);
	    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
	}

	$(document).ready(function() {
		try {			
			$("#error-message").text(getParameterByName("message"));
		} catch(e) {}
	});

	$(document).on("click", "#login-button", function(e) {
	    e.preventDefault();
	    var kerberos = $("#login-form input[name=kerberos]").val();
	    var password = $("#login-form input[name=password]").val();
	    $.post(
	        '/users/login',
	        { kerberos: kerberos, password: password }
	    ).done(function(response) {
	        if (response.content.userType == "student") {
	        	window.location.href = "/student.html";
	        } else if (response.content.userType == "staff") {
	        	window.location.href = "/staff.html";
	        } else {
	        	$("#error-message").text("An error occured. Please try again.");
	        }
	    }).fail(function(responseObject) {
	        var response = $.parseJSON(responseObject.responseText);
	        $("#error-message").text(response.err);
	    });
	});

	$(document).on("click", "#register-button", function(e) {
        e.preventDefault();
        $("#loading-sign").css('display','block');
        var userType = $("#register-form input[name=userType]:checked").val();
        var kerberos = $("#register-form input[name=kerberos]").val();
        var password = $("#register-form input[name=password]").val();
        $.post(
            '/users/register',
            { userType: userType, kerberos: kerberos, password: password }
        ).done(function(response) {
        	$("#loading-sign").css('display','none');
	        $("#error-message").text(response.content.message);
        }).fail(function(responseObject) {
        	$("#loading-sign").css('display','none');
            var response = $.parseJSON(responseObject.responseText);
            $("#error-message").text(response.err);
        });
    });
});