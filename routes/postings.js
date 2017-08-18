// Author: Meghana Bhat
var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var Posting = require("../models/posting");
var utils = require('../utils/utils');
var CronJob = require('cron').CronJob;

// runs every day at 8AM, makes sure postings past their deadline are inactive
new CronJob('00 00 08 * * *', function() {
  console.log("It's a new day!");
  Posting.expireOldPostings();
}, null, true, 'America/New_York');

router.all('', utils.checkLoggedIn);

/**
  * If the logged-in user is a staff,
  *   returns posted postings.
  *
  * @return {json} containing
  *   success - whether it was a successful request
  *   content.postings - the list of postings if successful
  *   error - failure message if failure
  */
router.get('/', function(req, res, next) {
  utils.checkStaffStatus(req, res);
  var kerberos = req.session.kerberos;
  Posting.findStaffPostings(kerberos)
  .then(function(postings) {
    return utils.sendSuccessResponse(res, { postings: postings });
  })
  .catch(function(err) {
    return utils.sendErrorResponse(res, 403, err);
  });
});

/**
  * If the logged-in user is a student,
  *   returns matched postings.
  *
  * @return {json} containing
  *   success - whether it was a successful request
  *   content.postings - the list of postings if successful
  *   error - failure message if failure
  */
router.get('/matches', function(req, res, next) {
  utils.checkStudentStatus(req, res);
  Posting.getMatchedUROPS(req.session.kerberos)
  .then(function(postings) {
    return utils.sendSuccessResponse(res, { postings: postings });
  })
  .catch(function(err) {
    return utils.sendErrorResponse(res, 403, err);
  });
});

/**
  * Returns the posting with the given id.
  *
  * @return {json} containing
  *   success - whether it was a successful request
  *   content.posting - the requested posting if successful
  *   error - failure message if failure
  */
router.get('/:posting_id', function(req, res, next) {
  Posting.findById(req.params.posting_id)
  .then(function(posting) {
    return utils.sendSuccessResponse(res, { posting: posting });
  })
  .catch(function(err) {
    return utils.sendErrorResponse(res, 403, err);
  });
});

/**
  * If the logged-in user is the staff who
  *   posted the posting, return matched students.
  *
  * @return {json} containing
  *   success - whether it was a successful request
  *   content.students - the list of students if successful
  *   error - failure message if failure
  */
router.get('/:posting_id/matches', function(req, res, next) {
  utils.checkStaffStatus(req, res);
  Posting.getMatchedStudents(req.session.kerberos, req.params.posting_id)
  .then(function(students) {
    return utils.sendSuccessResponse(res, { students: students });
  })
  .catch(function(err) {
    return utils.sendErrorResponse(res, 403, err);
  });
});

/**
  * Allows a staff to post a new posting.
  *
  * @param {json} req.body containing
  *   {String} contact_name of staff to contact
  *   {String} contact_email of the same staff
  *   {String} faculty_supervisor of UROP
  *   {String} lab_name of lab hosting the UROP
  *   {String} title of UROP
  *   {String} description of UROP
  *   {Array} required_skills of skills student should have
  *   {Array} optional_skills of recommended skills for student
  *   {Array} tags of strings which are UROP interest areas
  *   {Date} deadline of applying to UROP
  *   {String} term of form TERMYEAR, e.g. FALL2016
  *   {Array} departments, one of which the student should be in
  *   {Number} expected_hours_per_week that student should work
  *
  * @return {json} containing
  *   success - whether it was a successful post
  *   content.new_posting - the new posting json if successful
  *   error - failure message if failure
  */
router.post('/', function(req, res, next) {
  utils.checkStaffStatus(req, res);
  Posting.createPosting(req.session.kerberos, req.body)
  .then(function(posting) {
    return utils.sendSuccessResponse(res, { new_posting: posting });
  })
  .catch(function(err) {
    return utils.sendErrorResponse(res, 403, err);
  })
});

/**
  * Allows a staff to deactivate one of their postings.
  *
  * @return {json} containing
  *   success - whether it was a successful post
  *   error - failure message if failure
  */
router.post('/deactivate/:posting_id', function(req, res, next) {
  utils.checkStaffStatus(req, res);
  Posting.deactivatePosting(req.session.kerberos, req.params.posting_id)
  .then(function() {
    return utils.sendSuccessResponse(res, { });
  })
  .catch(function(err) {
    return utils.sendErrorResponse(res, 403, err);
  })
});

/**
  * Deletes the posting with the given id
  * as long as the logged-in user is its author.
  *
  * @return {json} containing
  *   success - whether it was a successful post
  *   error - failure message if failure
  */
router.delete('/:posting_id', function(req, res, next) {
  utils.checkStaffStatus(req, res);
  Posting.deletePosting(req.session.kerberos, req.params.posting_id)
  .then(function() {
    return utils.sendSuccessResponse(res, { });
  })
  .catch(function(err) {
    return utils.sendErrorResponse(res, 403, err);
  })
});


/**
  * Add the logged-in user to the list of interested students
  *   for the posting.
  *
  * @param {json} req.body containing kerberos of student
  *
  * @return {json} containing
  *   success - whether it was a successful request
  *   error - failure message if failure
  */
router.post('/:posting_id/interested', function(req, res, next) {
  utils.checkStudentStatus(req, res);
  Posting.showInterestInUROP(req.session.kerberos,
    req.params.posting_id)
  .then(function() {
    return utils.sendSuccessResponse(res, { });
  })
  .catch(function(err) {
    return utils.sendErrorResponse(res, 403, err);
  });
});


/**
  * Remove the logged-in user from the interested students
  *   for the posting.
  *
  * @param {json} req.body containing kerberos of student
  *
  * @return {json} containing
  *   success - whether it was a successful request
  *   error - failure message if failure
  */
router.delete('/:posting_id/interested', function(req, res, next) {
  utils.checkStudentStatus(req, res);
  Posting.removeInterestInUROP(req.session.kerberos,
    req.params.posting_id)
  .then(function() {
    return utils.sendSuccessResponse(res, { });
  })
  .catch(function(err) {
    return utils.sendErrorResponse(res, 403, err);
  });
});



module.exports = router;
