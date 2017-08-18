// Author: Kelly Shen
require( 'dotenv' ).load();
var aws = require('aws-sdk');
var multer = require('multer');
var multerS3 = require('multer-s3');

// aws s3 storage configuration so that all uploaded resume are 
// stored in s3 and the url's are stored in db.
var resumeController = (function() {
	var _resumeController = {};

	var s3 = new aws.S3();
	 
	_resumeController.upload = multer({
	  storage: multerS3({
	    s3: s3,
	    bucket: 'uropmatcher',
	    contentType: multerS3.AUTO_CONTENT_TYPE,
	    metadata: function (req, file, cb) {
	      cb(null, {fieldName: 'resumes'})
	    },
	    key: function (req, file, cb) {
	      cb(null, req.session.kerberos)
	    }
	  })
	});

	Object.freeze(_resumeController);
	return _resumeController;
})();

module.exports = resumeController;