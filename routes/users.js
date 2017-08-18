// Author: Kelly Shen
var express = require('express');
var router = express.Router();
var Student = require('../models/student');
var Staff = require('../models/staff');
var TempUser = require('../models/tempUser');
var utils = require('../utils/utils');
var loginController = require('../controllers/loginController');
var kerberosController = require('../controllers/kerberosController');
var resumeController = require('../controllers/resumeController');
var rp = require('request-promise');

/**
 * Returns the student with the given kerberos.
 * 
 * @return {json} containing
 *   success - whether it was a successful request
 *   student - the requested student if successful
 *   message - failure message if failure
 */
router.get('/student/:kerberos', function(req, res) {
	Student.findByKerberos(req.params.kerberos)
	.then(function(student) {
		if (student) utils.sendSuccessResponse(res, { student: student });
	})
	.catch(function(err) {
		utils.sendErrorResponse(res, 403, err);
	});
});

/**
 * Returns the current user's kerberos with the given kerberos.
 * 
 * @return {json} containing
 *   success - whether it was a successful request
 *   kerberos - the requested kerberos if successful
 *   message - there is no user in the current session
 */
router.get('/currentUser', function(req, res) {
	console.log(req.session);
	if (req.session.kerberos) {
		Student.findByKerberos(req.session.kerberos)
		.then(function(student) {
			return utils.sendSuccessResponse(res, { loggedIn : true, kerberos: student.kerberos, id: student._id });
		})	
		.catch(function(err) {
			return utils.sendErrorResponse(res, 403, err);
		});
	} else {
		return utils.sendSuccessResponse(res, { loggedIn : false });
	}
});

/**
 * Returns the current staff's kerberos with the given kerberos.
 * 
 * @return {json} containing
 *   success - whether it was a successful request
 *   kerberos - the requested kerberos if successful
 *   message - there is no user in the current session
 */
router.get('/currentStaff', function(req, res) {
	if (req.session.kerberos) {
		Staff.findByKerberos(req.session.kerberos)
		.then(function(student) {
			return utils.sendSuccessResponse(res, { loggedIn : true, kerberos: student.kerberos });
		})	
		.catch(function(err) {
			return utils.sendErrorResponse(res, 403, err);
		});
	} else {
		return utils.sendSuccessResponse(res, { loggedIn : false });
	}
});

/**
 * Logs the current user in. 
 * 	- details in loginController.
 * 
 * @return {json} containing
 *   success - whether it was a successful request
 *   message - there is no user in the current session
 */
router.post('/login', function(req, res) {
	var kerberos = req.body.kerberos.trim();
	var password = req.body.password;
	if (kerberos == "") {
		return utils.sendErrorResponse(res, 403, "Please enter your kerberos");
	} else if (password == "") {
		return utils.sendErrorResponse(res, 403, "Please enter a password");
	}
	loginController.login(req, res, kerberos, password);
});

/**
 * Create an account for a new user. Process includes:
 * 	- check if user already has an account
 * 	- check against MIT people API to make sure user signs up 
 * 		for the right type of account (student/staff, 
 * 		grad students are staffs).
 * 	- send verification email to user via sendgrid
 * 	- details in kerberosController
 * 
 * @return {json} containing
 *   success - whether it was a successful request
 *   message - there is no user in the current session
 */
router.post('/register', function(req, res) {
	var kerberos = req.body.kerberos.trim();
	var password = req.body.password;
	var userType = req.body.userType;
	if (!userType) {
		return utils.sendErrorResponse(res, 403, "Please select whether you are a student or staff");
	} else if (kerberos == "") {
		return utils.sendErrorResponse(res, 403, "Please enter your kerberos");
	} else if (password == "") {
		return utils.sendErrorResponse(res, 403, "Please enter a password");
	}

	var options = kerberosController.options(kerberos);
	rp(options)
	.then(function(data) {
		kerberosController.checkPeopleAPI(data, kerberos, password, userType, req, res);
	})
	.catch(function(err) {
		return utils.sendErrorResponse(res, 403, "Error: "+err.response.body.errorDetails[0].message);
	});
});

/**
 * Vetify a student account. 
 * 	- This is the link included in the verification email 
 * 		sent to new student user. 
 * 	- A student account is created for the new user after they click 
 * 		on the verification link. Each link can only be clicked once.
 * 
 * @return {json} containing
 *   success - whether it was a successful request
 *   message - there is no user in the current session
 */
router.get('/verifystudent',function(req,res){
	TempUser.findById(req.query.id)
	.then(function(user) {
		if(user) {
			Student.createStudent(
				user.kerberos, user.password, user.departments, user.name, user.year)
			.then(function(result) {
				utils.verifyHelper(req, res, user.kerberos);
			})
			.catch(function(err) {
				return utils.sendErrorResponse(res, 403, err);
			});
		} else {
			utils.invalidLinkHelper(req, res);
		}
	})
	.catch(function(err) {
		return utils.sendErrorResponse(res, 403, err);
	});
});

/**
 * Vetify a staff account. 
 * 	- This is the link included in the verification email 
 * 		sent to new staff user. 
 * 	- A staff account is created for the new user after they click 
 * 		on the verification link. Each link can only be clicked once.
 * 
 * @return {json} containing
 *   success - whether it was a successful request
 *   message - there is no user in the current session
 */
router.get('/verifystaff',function(req,res){
	TempUser.findById(req.query.id)
	.then(function(user) {
		if(user) {
			Staff.createStaff(user.kerberos, user.password)
			.then(function(result) {
				utils.verifyHelper(req, res, user.kerberos);
			}) 
			.catch(function(err) {
				return utils.sendErrorResponse(res, 403, err);
			});
		} else {
			utils.invalidLinkHelper(req, res);
		}
	})
	.catch(function(err) {
		return utils.sendErrorResponse(res, 403, err);
	});
});

/**
 * Logs a user out.
 * 
 * Response:
	success - redirect to main page
	error - show error message
 */
router.post('/logout', function(req, res) {
	req.session.destroy(function(err) {
		if (err) console.error(err);
		res.redirect('/');
	});
});

/**
 * Returns resume url of the student with the given kerberos.
 * 
 * @return {json} containing
 *   success - whether it was a successful request
 *   resume - the requested student's resume if successful
 *   message - failure message if failure
 */
router.get('/resume', function(req, res) {
	Student.findByKerberos(req.session.kerberos)
	.then(function(student) {
		return utils.sendSuccessResponse(res, { resume: student.resume });
	})
	.catch(function(err) {
		return utils.sendErrorResponse(res, 403, err);
	});
});

/**
 * Adds resume url of student with the given kerberos.
 * 
 * @return {json} containing
 *   success - whether it was a successful request
 *   message - failure message if failure
 */
router.post('/resume', resumeController.upload.single('resume'), function(req, res, next) {
	var resumeURL = process.env.S3_URL+req.session.kerberos;
    if (req.session.kerberos) {
		Student.findByKerberos(req.session.kerberos)
		.then(function(student) {
			if (student) {
				Student.addResume(req.session.kerberos, resumeURL)
				.then(function(result) {
					utils.sendSuccessResponse(res, { resume: student.resume });
				})
			}
		})
		.catch(function(err) {
			return utils.sendErrorResponse(res, 403, err);
		});
	} else {
		return utils.sendErrorResponse(res, 403, { err: "Not logged in."});
	}
});

module.exports = router;
