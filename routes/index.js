// Author: Kelly Shen
var express = require('express');
var router = express.Router();

/*
  GET / - render the main page
  Request parameters: none
  Response: 
    - main index.html
 */
router.get('/', function(req, res) {
	if (req.param.message) {
		res.render('index', {message: req.param.message});
	}
  	res.render('index');
});

module.exports = router;

