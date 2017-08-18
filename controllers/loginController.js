// Author: Kelly Shen
var Student = require('../models/student');
var Staff = require('../models/staff');
var utils = require('../utils/utils');

var loginController = (function() {
	var _loginController = {};

    /**
     * Logs a user in
     *     - checks if the user has an account 
     *     - checks if the user has a student or staff account
     *     - logs the user into the proper account type
     * @param  {String} kerberos [kerberos of the user]
     * @param  {String} password [password of the user]
     * @return {json} containing
     *   success - whether it was a successful request
     *   error - failure message if failure
     */
	_loginController.login = function(req, res, kerberos, password) {
        Student.findByKerberos(kerberos)
        .then(function(student) {
            if (student) {
                Student.authStudent(kerberos, password)
                .then(function(result) {
                    loginHelper(req, res, kerberos, "student");
                })
                .catch(function(err) {
                    return utils.sendErrorResponse(res, 403, String(err));
                });
            } else {
                Staff.findByKerberos(kerberos)
                .then(function(staff) {
                    if (staff) {
                        Staff.authStaff(kerberos, password)
                        .then(function(result) {
                            loginHelper(req, res, kerberos, "staff");
                        })
                        .catch(function(err) {
                            return utils.sendErrorResponse(res, 403, String(err));
                        });
                    } else {
                        return utils.sendErrorResponse(res, 403,
                            "You don't have an account with us yet, please register first :)");
                    }
                })
                .catch(function(err) {
                    return utils.sendErrorResponse(res, 403, String(err));
                });
            }
        })
        .catch(function(err) {
            return utils.sendErrorResponse(res, 403, String(err));
        })
    }

    var loginHelper = function(req, res, kerberos, userType) {
        req.session.kerberos = req.body.kerberos;
        req.session.usertype = userType;
        utils.sendSuccessResponse(res, { kerberos: kerberos, userType: userType });
    }
	

	Object.freeze(_loginController);
	return _loginController;
})();

module.exports = loginController;