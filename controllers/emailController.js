// Author: Kelly Shen
var helper = require('sendgrid').mail;

var emailController = (function() {
	var _emailController = {};

	/**
	 * Sends verification email to user whose kerberos passed people api check
	 * @param  {Integer} id      [id of the temporary user stored in tempUser schema]
	 * @param  {String} host     [host name of the application]
	 * @param  {String} userType [a string that is either "student" or "staff"]
	 * @param  {String} kerberos [kerberos of the user]
	 * @return {json} containing 
	 *   success - whether it was a successful request
	 *   error - failure message if failure
	 */
	_emailController.send = function(id, host, userType, kerberos) {
		if (userType == "student") {
			link="http://"+host+"/users/verifystudent?id="+id;
		} else if (userType == "staff") {
			link="http://"+host+"/users/verifystaff?id="+id;
		}

		var message = "Hello,<br><br>Please click on the link to verify your email.<br><a href="+link+">"+
		    "Click here to verify</a><br><br>Cheers,<br>Team Open Source Fruit Tart<br>";
		var from_email = new helper.Email(process.env.SENDGRID_EMAIL);
		var to_email = new helper.Email(kerberos+"@mit.edu");
		var subject = 'Please confirm your account for UROP Matcher';
		var content = new helper.Content('text/html', message);
		var mail = new helper.Mail(from_email, subject, to_email, content);

		var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
		var request = sg.emptyRequest({
		  method: 'POST',
		  path: '/v3/mail/send',
		  body: mail.toJSON(),
		});

		sg.API(request, function(error, response) {
			if (error) console.log(error)
		});
	}

	Object.freeze(_emailController);
	return _emailController;
})();

module.exports = emailController;