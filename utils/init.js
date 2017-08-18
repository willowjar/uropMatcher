// Author: Kelly Shen, Elise Xue
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Student = require('../models/student');
var Staff = require('../models/staff');
var Skills = require('../models/dictionary').skills;
var Interests = require('../models/dictionary').interests;
var Posting = require('../models/posting');

var init = (function () {
	var _init = {};

	var makePostingHelper = function(title,
                                 required_skills,
                                 tags,
                                 departments,
                                 deadline) {
	  return {
	    contact_name: "Staff Staff",
	    contact_email: "staff@mit.edu",
	    faculty_supervisor: "Staffer Staffiest",
	    lab_name: "Labby Lab",
	    title: title,
	    description: "test desc",
	    required_skills: JSON.stringify(required_skills),
	    optional_skills: JSON.stringify([]),
	    tags: JSON.stringify(tags),
	    deadline: deadline,
	    term: "FALL2016",
	    departments: JSON.stringify(departments),
	    expected_hours_per_week: 0
	  };
	};

	/**
	 * Load test accounts, skills, interests and postings.
	 */
	_init.loadFrontendTestAccounts = function() {

		Student.findByKerberos("student1")
		.then(function(result) {
			if (!result) {
				Student.createStudent("student1", "123", ['*'], "Test Student Account", 1);
			}
			console.log("for frontend testing - student kerberos: student1, password: 123");
		})
		.catch(function(err) {
			console.log(err);
		});

		Staff.findByKerberos("staff1")
		.then(function(result) {
			if (!result) {
				Staff.createStaff("staff1", "123")
				.then(function(result) {
					Posting.createPosting(result.kerberos, makePostingHelper(
		      			"No Skills Required", [], [], ["6"], "2016-12-31"))
					.then(function(result) {
						console.log("for frontend testing - staff kerberos: staff1, password: 123");
						console.log("for frontend testing - created posting titled no skills required");
					})
					.catch(function(err) {
						console.log(err);
					});
				})
				.catch(function(err) {
					console.log(err);
				});
			}
		})
		.catch(function(err) {
			console.log(err);
		});

		Staff.findByKerberos("staff2")
		.then(function(result) {
			if (!result) {
				Staff.createStaff("staff2", "123")
				.then(function(result) {
					Posting.createPosting("staff2", makePostingHelper(
		      			"Some Skills Required", [{"name":"Javascript", "proficiency":5}], 
		      			["Web Development", "Computer Graphics"], ["6"], "2016-12-31"))
					.then(function(result) {
						console.log("for frontend testing - created posting titled some skills required");
						console.log("for frontend testing - staff kerberos: staff2, password: 123");
					})
					.catch(function(err) {
						console.log(err);
					});
				})
				.catch(function(err) {
					console.log(err);
				});
			}
		})
		.catch(function(err) {
			console.log(err);
		});

		var skillsToAdd = ["Python", "Java", "Javascript", "C", "Objective C", "Matlab"];

		skillsToAdd.forEach(function(skillname) {
			Skills.find({"word": skillname})
			.then(function(result) {
				if (result.length == 0) {
					Skills.addWord(skillname);
				}
			})
			.catch(function(err) {
				console.log(err);
			});
		})

		console.log("created Skills: " + skillsToAdd);

		var interestsToAdd = ["Artificial Intelligence", "Web Development", "Robotics", "Machine Learning",
							"Computer Graphics", "Architecture"];

		interestsToAdd.forEach(function(tagname) {
			Interests.find({"word": tagname})
			.then(function(result) {
				if (result.length == 0) {
					Interests.addWord(tagname);
				}
			})
			.catch(function(err) {
				console.log(err);
			});
		})
	}

	Object.freeze(_init);
	return _init;
})();

module.exports = init;
