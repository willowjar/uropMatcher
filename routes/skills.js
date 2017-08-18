// Author: Meghana Bhat
var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var Student = require("../models/student");
var utils = require('../utils/utils');
var Skills = require('../models/dictionary').skills;

router.all('', utils.checkLoggedIn);

/**
  * Returns the skills of the currently logged-in user.
  *
  * @return {json} containing
  *   content.skills - the list of skills
  *   success - whether the request was a success or failure
  *   error - error message if failure
  */
router.get('/', function(req, res, next) {
  utils.checkStudentStatus(req, res);
  Student.findByKerberos(req.session.kerberos)
  .then(function(student) {
    if (!student) {
      return utils.sendErrorResponse(res, 403,
        "No student exists with the user's kerberos.");
    }
    return utils.sendSuccessResponse(res, { skills: student.skills });
  })
  .catch(function(err) {
    return utils.sendErrorResponse(res, 403, err);
  });
});

/**
  * Returns the dictionary of skill names with at least one mention,
  *   each paired with the number of mentions.
  *
  * @return {json} containing
  *   content.dictionary - the dictionary
  *   success - whether the request was a success or failure
  *   error - error message if failure
  */
router.get('/dictionary', function(req, res, next) {
  Skills.find()
  .then(function(dictionary) {
    return utils.sendSuccessResponse(res, { dictionary: dictionary });
  })
  .catch(function(err) {
    return utils.sendErrorResponse(res, 403, err);
  });
});

/**
  * Adds a skill to the logged-in user's skills.
  *
  * @param {json} req.body - contains name and proficiency
  *     of skill. Name must be non-empty string, and
  *     proficiency must be an integer from 1 to 5.
  *
  * @return {json} containing
  *   success - whether the request was a success or failure
  *   error - error message if failure
  */
router.post('/', function(req, res, next) {
  utils.checkStudentStatus(req, res);
  var newSkill = {
    'name': req.body.name,
    'proficiency': req.body.proficiency
  };
  Student.addSkill(req.session.kerberos, newSkill)
  .then(function(student) {
    return utils.sendSuccessResponse(res, { });
  })
  .catch(function(err) {
    return utils.sendErrorResponse(res, 403, err);
  });
});

/**
  * Removes a skill from the logged-in user's skills.
  *
  * @return {json} containing
  *   success - whether the request was a success or failure
  *   error - error message if failure
  */
router.delete('/:skill_name', function(req, res, next) {
  utils.checkStudentStatus(req, res);
  Student.removeSkill(req.session.kerberos, req.params.skill_name)
  .then(function() {
    return utils.sendSuccessResponse(res, { });

  })
  .catch(function(err) {
    return utils.sendErrorResponse(res, 403, err);
  });
});

module.exports = router;
