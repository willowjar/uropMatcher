// Author: Kelly Shen
var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var Posting = require("../models/posting");
var Student = require("../models/student");
var Interests = require('../models/dictionary').interests;
var utils = require('../utils/utils');

router.all('', utils.checkLoggedIn);

/**
 * Returns the interests of a student with the given kerberos.
 *
 * @return {json} containing
 *   success - whether it was a successful request
 *   interests - the requested interests of a student if successful
 *   message - failure message if failure
 */
router.get('/', function(req, res, next) {
	Student.findByKerberos(req.session.kerberos)
	.then(function(student) {
		utils.sendSuccessResponse(res, { interests: student.interests });
	})
	.catch(function(err) {
		utils.sendErrorResponse(res, 403, err);
	});
});

/**
  * Adds a list of interests to the logged-in student's interests.
  *
  * @param {json} req.body - contains the name of the interest.
  *
  * @return {json} containing
  *   success - whether it was a successful request
  *   message - error message if failure
  */
router.post('/', function(req, res, next) {
	var request = req.body.interests.slice(1, -1);
	var newInterests = request.replace(/['"]+/g, '').split(',');
	Student.addAllInterests(req.session.kerberos, newInterests)
	.then(function(student) {
		return utils.sendSuccessResponse(res, { newInterests: newInterests });
	})
	.catch(function(err) {
		return utils.sendErrorResponse(res, 403, err);
	});
});

/**
  * Removes an interest from the logged-in student's interests.
  *
  * @return {json} containing
  *   success - whether it was a successful request
  *   message - error message if failure
  */
router.delete('/', function(req, res, next) {
	var request = req.body.interest_names.slice(1, -1);
	var interestNames = request.replace(/['"]+/g, '').split(',');
	Student.removeAllInterests(req.session.kerberos, interestNames)
	.then(function() {
		return utils.sendSuccessResponse(res, { });
	})
	.catch(function(err) {
		return utils.sendErrorResponse(res, 403, err);
	});
});

/**
 * Returns the interests that a student with the given kerberos
 * is not subscribed to.
 *
 * @return {json} containing
 *   success - whether it was a successful request
 *   otherTags - the requested non-subscribed interests if successful
 *   message - failure message if failure
 */
router.get('/othertags', function(req, res, next) {
	Student.getOtherTags(req.session.kerberos)
	.then(function(otherTags) {
		return utils.sendSuccessResponse(res, { otherTags: otherTags });
	})
	.catch(function(err) {
		return utils.sendErrorResponse(res, 403, err);
	});
});

/**
  * Returns the dictionary of tag names with at least one mention,
  *   each paired with the number of mentions.
  *
  * @return {json} containing
  *   dictionary - the dictionary
  *   success - whether the request was a success or failure
  *   error - error message if failure
  */
router.get('/dictionary', function(req, res, next) {
	Interests.find({})
	.then(function(dictionary) {
		return utils.sendSuccessResponse(res, { dictionary: dictionary });
	})
	.catch(function(err) {
		return utils.sendErrorResponse(res, 403, err);
	});
});

module.exports = router;
