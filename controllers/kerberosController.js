// Author: Kelly Shen
var Promise = require("bluebird");
var Student = require('../models/student');
var Staff = require('../models/staff');
var TempUser = require('../models/tempUser');
var utils = require('../utils/utils');
var emailController = require('./emailController');

var kerberosController = (function() {
	_kerberosController = {};

	/**
	 * Gets the options needed for making a call to MIT People API
	 * @param  {String} kerberos [kerberos of the user]
	 * @return {json}            [options needed]
	 */
	_kerberosController.options = function(kerberos) {
		return {
		    uri: process.env.PEOPLE_API_URI+kerberos,
		    headers: {
		    	'User-Agent': 'Request-Promise',
		        "Accept" : "application/json",
			    "client_id" : process.env.PEOPLE_API_CLIENT_ID,
			    "client_secret" : process.env.PEOPLE_API_CLIENT_SECRET,
		    },
		    json: true // Automatically parses the JSON string in the response
		};
	}

	/**
	 * Steps taken after making a call to People API
	 * 	- if user already has an account, display error message
	 * 	- if selected user type and actual role in people API are the same, send 
	 * 		verification email; else, display error message
	 * 		
	 * @param  {json} data       [response from API call]
	 * @param  {String} kerberos [kerberos of the user]
	 * @param  {String} password [password the user selected]
	 * @param  {String} userType [a string that is either "student" or "staff"]
	 * @return {json} containing
	 *   success - whether it was a successful request
	 *   		 - a verification email is also sent to the user upon success
	 *   error - failure message if failure
	 */
	_kerberosController.checkPeopleAPI = function(data, kerberos, password, userType, req, res) {
		var result = data.item;
		var name = result.displayName;
		var affiliations = result.affiliations[0];
		var year = parseInt(affiliations.classYear);
		var appUserType = affiliations.type; 
		if (appUserType == "student" && affiliations.classYear == "G") {
		    appUserType = "staff";
		} 
		if (appUserType == "staff") {
			year = null;
		}
		var departments = affiliations.departments.map(function(d) {
			var course = d.code;
			if (course == 'NONE') {
				course = "*";
			}
		    return course;
		});
		
		if (appUserType == "student" && userType == "staff") {
			return utils.sendErrorResponse(res, 403, 
				"We checked your kerberos against MIT's people directory. Please register for a student account.");
		} else if (appUserType == "staff" && userType == "student") {
			return utils.sendErrorResponse(res, 403, 
				"We checked your kerberos against MIT's people directory. Please register for a staff account.");
		} else {
			if (appUserType == "student") {
				Student.findByKerberos(kerberos)
				.then(function(student) {
					if (student) return utils.sendErrorResponse(res, 403, 
						"You already have an account with us. Please log in to continue.");
					else sendEmailHelper(req, res, kerberos, password, userType, departments, name, year);
				})
				.catch(function(err) {
					return utils.sendErrorResponse(res, 403, err);
				});
			} else if (appUserType == "staff") {
				Staff.findByKerberos(kerberos)
				.then(function(staff) {
					if (staff)  return utils.sendErrorResponse(res, 403, 
						"You already have an account with us. Please log in to continue.");
					else sendEmailHelper(req, res, kerberos, password, userType, departments, name, year);
				})
				.catch(function(err) {
					return utils.sendErrorResponse(res, 403, err);
				});
			}
		}
	}

	// Helper function to show success message after kerberos is verified and 
	// a tempUser is created in db.
	var sendEmailHelper = function(req, res, kerberos, password, userType, departments, name, year) {
		TempUser.createTempUser(kerberos, password, departments, name, year)
		.then(function(result) {
			var message = "An email has been sent to your MIT email address, please check your inbox and verify your account."+
			"If you don't see a confirmation email within 2 minutes, please click the button again.";
		    utils.sendSuccessResponse(res, { kerberos: kerberos, message: message });

	    	var id = result._id;
	    	var host = req.get('host');
	    	emailController.send(id, host, userType, kerberos);
		})
		.catch(function(err) {
			utils.sendErrorResponse(res, 403, err);
		}); 
	}

	Object.freeze(_kerberosController);
	return _kerberosController;
})();

module.exports = kerberosController;