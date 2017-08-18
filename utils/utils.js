// Author: Kelly Shen, Meghana Bhat
var TempUser = require('../models/tempUser');

var utils = (function () {
    var _utils = {};

    /**
     * Helper function to send a success (200 OK) response
     *
     * @param res {object} - response object
     * @param content {object} - content to send
     */
    _utils.sendSuccessResponse = function(res, content) {
        res.status(200).json({
            success: true,
            content: content
        }).end();
    };

    /**
     * Helper function to send a failure response
     *
     * @param res {object} - response object
     * @param errcode {number} - HTTP status code to send
     * @param content {err} - err message to send
     */
    _utils.sendErrorResponse = function(res, errcode, err) {
        console.log(err);
        res.status(errcode).json({
            success: false,
            err: err
        }).end();
    };

    // Helper middleware function to check if user is logged in
    _utils.checkLoggedIn = function(req, res, next) {
      if (!req.session.kerberos) {
        return utils.sendErrorResponse(res, 403,
          "Not logged in.");
      }
      next();
    };

    // Helper function to check if user is staff
    _utils.checkStaffStatus = function(req, res) {
      var usertype = req.session.usertype;
      if (!usertype || !usertype.match(/staff/i)) {
        return utils.sendErrorResponse(res, 403,
          "Not logged in as staff.");
      }
    };

    // Helper function to check if user is student
    _utils.checkStudentStatus = function(req, res) {
      var usertype = req.session.usertype;
      if (!usertype || !usertype.match(/student/i)) {
        return utils.sendErrorResponse(res, 403,
          "Not logged in as student.");
      }
    };

    // helper function to check if a value is a capitalized name
    _utils.isName = function(value) {
      return value.match(/^([A-Z][A-Za-z.]+\s?)+$/);
    };

    // helper function to get intersection of two arrays
    // credit to alex on Stack Overflow
    _utils.intersection = function(array1, array2) {
      return array1.filter(function(n) {
          return array2.indexOf(n) != -1;
      });
    };

    // helper function to verify a new user, followed by deleting
    // the corresponding tempUser
    _utils.verifyHelper = function(req, res, kerberos) {
        TempUser.deleteTempUser(kerberos)
        .then(function(user){})
        .catch(function(err) {
            return utils.sendErrorResponse(res, 403, err);
        });
        msg = "Your account has been created. Log in to continue :)"
        res.redirect('/?message='+msg);
    }

    // helper function to redirect after determining verification link
    // is invalid
    _utils.invalidLinkHelper = function(req, res) {
        msg = "Your link has expired, please register again."
        res.redirect('/?message='+msg);
    }

    _utils.wildcardDepartment = '*';

    _utils.departmentList = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '14',
    '15', '16', '17', '18', '20', '21', '21A', '21H', '21G', '21L', '21M',
    '21W', '22', '24', 'AS', 'CC', 'CMS/W', 'CSB', 'EC', 'EM', 'ES', 'HST',
    'IDS', 'MAS', 'MS', 'NS', 'SCM', 'SP', 'STS', 'WGS', _utils.wildcardDepartment];

    Object.freeze(_utils);
    return _utils;
})();

module.exports = utils;
