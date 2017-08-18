// Author: Meghana Bhat
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var idValidator = require('mongoose-id-validator');
var Staff = require("./staff");
var Student = require("./student");
var skillSchema = require("./skillschema");
var Promise = require("bluebird");
var utils = require('../utils/utils');
var Skills = require('./dictionary').skills;
var Interests = require('./dictionary').interests;
var ObjectId = require('mongoose').Types.ObjectId;

var postingSchema = new Schema({
  posted_by: { type: Schema.Types.ObjectId, ref: "Staff", required: true },
  posted_at: { type:Date, default: Date.now },
  contact_name: { type: String, required: true },
  contact_email: { type: String, required: true },
  faculty_supervisor: { type: String, required: true },
  lab_name: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  required_skills: { type: [skillSchema], default: [] },
  optional_skills: { type: [skillSchema], default: [] },
  tags: {type: [String], default: []},
  deadline: {type: Date, required: true},
  term: { type: String, required: true },
  departments: [{
    type: String,
    enum: utils.departmentList,
    default: ['*']
  }],
  expected_hours_per_week: { type: Number, required: true },
  active: { type: Boolean, default: true },
  interested: { type: [Schema.Types.ObjectId], ref: "Student", default: [] },
  match_based_on_interest: { type: Boolean } // ignore if not returning getMatchedUROPS
});

postingSchema.plugin(idValidator);

postingSchema.path('term').validate(function(value) {
  var term_regex = /^(FALL|SPRING|IAP|SUMMER)\d\d\d\d$/;
  return value.match(term_regex);
}, 'Invalid term value, must be string format TERMYEAR, e.g. FALL2016.');

postingSchema.path('contact_name').validate(function(value) {
  return utils.isName(value);
}, 'Invalid name format, should be capitalized words.');

postingSchema.path('faculty_supervisor').validate(function(value) {
  return utils.isName(value);
}, 'Invalid name format, should be capitalized words.');

postingSchema.path('contact_email').validate(function(value) {
  var email_regex = /^[A-Za-z0-9]+@mit.edu$/;
  return value.match(email_regex);
}, 'Invalid email, must be mit.edu address.');

postingSchema.path('title').validate(function(value) {
  return value.length > 0;
}, 'Title should not be empty.');

postingSchema.path('departments').validate(function(value) {
  return (value != null) && value.length > 0;
}, 'List of departments should not be empty.');

var hasRequiredSkillSet = function(student, requiredSkillset) {
  var hasRequiredSkill = function(student, requiredSkill) {
    var studentSkill = student.skills.find(function(skill) {
      return (skill.name === requiredSkill.name &&
        skill.proficiency >= requiredSkill.proficiency);
    });
    return !(studentSkill == null);
  }
  return requiredSkillset.reduce(function(hasPrevSkills, nextSkill) {
    return hasPrevSkills && hasRequiredSkill(student, nextSkill);
  }, true);
};

var hasRequiredDepartment = function(student, departments) {
  return (departments.indexOf(utils.wildcardDepartment) != -1) ||
    (student.departments.indexOf(utils.wildcardDepartment) != -1) ||
    (utils.intersection(student.departments, departments)).length > 0;
};

var hasInterest = function(student, interests) {
  return (utils.intersection(student.interests, interests)).length > 0;
};

var isMatch = function(student, posting) {
  return hasRequiredSkillSet(student, posting.required_skills) &&
    hasRequiredDepartment(student, posting.departments);
}


/**
  * Returns all postings that match with the student of the given
  *  kerberos by skill and department. Also sets the field
  *  match_based_on_interest if the student is subscribed to one
  *  of the posting tags.
  *
  * @param {String} kerberos of student looking for matches
  *
  * @return {Promise} matches of all matched postings
  */
postingSchema.statics.getMatchedUROPS = Promise.method(function(kerberos) {
  var schema = this;
  return Student.findByKerberos(kerberos)
  .then(function(student) {
    return schema.find().populate('posted_by')
      .then(function(postings) {
        var matches = postings.filter(function(posting) {
          return posting.active && isMatch(student, posting);
        })
        matches.forEach(function(posting) {
          if (hasInterest(student, posting.tags)) {
            posting.set("match_based_on_interest", true);

          } else {
            posting.set("match_based_on_interest", false);
          }
        });
        return matches;
      });
  });
});


/**
  * Returns all students matched with the given posting
  * based on skills and department.
  * Fails with error if kerberos is invalid, or if staff
  * did not post such a posting.
  *
  * @param {String} kerberos of staff poster
  * @param {String} posting_id of the posting to get matches for
  *
  * @return {Promise} students who match with the posting
  */
postingSchema.statics.getMatchedStudents = Promise.method(function(kerberos, posting_id) {
  var schema = this;
  return Staff.findByKerberos(kerberos)
  .then(function(member) {
    if (!member) {
      throw new Error("No such staff member with that kerberos!");
    }
    return schema.collection.findOne({
      _id: new ObjectId(posting_id),
      posted_by: member._id
    })
    .then(function(posting) {
      if (!posting) {
        throw new Error("No such posting with that id and by that staff exists!");
      }
      return Student.find({})
      .then(function(students) {
        return students.filter(function(student) {
          return isMatch(student, posting);
        });
      });
    });
  });
});

/**
  * Returns postings posted by the given kerberos with the given id.
  * Fails if invalid kerberos, does nothing if there is no such posting to delete
  *
  * @param {String} kerberos of staff poster
  *
  * @return {Promise} postings posted by the staff
  */
postingSchema.statics.findStaffPostings = Promise.method(function(kerberos) {
  var schema = this;
  return Staff.findByKerberos(kerberos)
  .then(function(member) {
    if (!member) {
      throw new Error("No such staff member with that kerberos!");
    }
    return schema.find({ posted_by: member._id }).populate('posted_by interested_students');
  });
});

/**
  * Creates posting with given data for staff with given kerberos.
  *
  * @param {String} kerberos of staff who posts the posting
  * @param {json} posting containing
  *   {String} contact_name of staff to contact
  *   {String} contact_email of the same staff
  *   {String} faculty_supervisor of UROP
  *   {String} lab_name of lab hosting the UROP
  *   {String} title of UROP
  *   {String} description of UROP
  *   {String} required_skills of json array of skills student should have
  *   {String} optional_skills of of json array of recommended skills for student
  *   {String} tags of strings which are UROP interest areas
  *   {String} deadline of applying to UROP in format "YYYY-MM-DD"
  *   {String} term of form TERMYEAR, e.g. FALL2016
  *   {String} departments of json array, one of which the student should be in
  *   {Number} expected_hours_per_week that student should work
  *
  * @return {Promise} posting that is created
  */
postingSchema.statics.createPosting = Promise.method(function(kerberos, posting) {
  var schema = this;
  return Staff.findByKerberos(kerberos)
  .then(function(member) {
    if (!member) {
      throw new Error("No such staff member with that kerberos!");
    }
    var Posting = mongoose.model('Posting', postingSchema);

    var allSkills = JSON.parse(posting.required_skills).concat(JSON.parse(posting.optional_skills));
    allSkills.forEach(function(skill) {
    	Skills.addWord(skill.name)
  		.catch(function(err) {
  			console.log(err);
  		});
    });

    JSON.parse(posting.tags).forEach(function(tag) {
    	Interests.addWord(tag)
  		.catch(function(err) {
  			console.log(err);
  		});
    });

    return Posting.create({
      posted_by: member._id,
      contact_name: posting.contact_name,
      contact_email: posting.contact_email,
      faculty_supervisor: posting.faculty_supervisor,
      lab_name: posting.lab_name,
      title: posting.title,
      description: posting.description,
      required_skills: JSON.parse(posting.required_skills),
      optional_skills: JSON.parse(posting.optional_skills),
      tags: JSON.parse(posting.tags),
      deadline: posting.deadline,
      term: posting.term,
      departments: JSON.parse(posting.departments),
      expected_hours_per_week: posting.expected_hours_per_week
    });
  });
});

/**
  * Deletes the posting posted by the given kerberos with the given id
  * Fails if invalid kerberos, does nothing if there is no such posting to delete
  *
  * @param {String} kerberos of staff poster
  * @param {String} posting_id of the posting to delete
  *
  * @return {Promise} deleted_posting if any posting was deleted
  */
postingSchema.statics.deletePosting = Promise.method(function(kerberos, posting_id) {
  var schema = this;
  return Staff.findByKerberos(kerberos)
  .then(function(member) {
    if (!member) {
      throw new Error("No such staff member with that kerberos!");
    }
    return schema.collection.findOne({
      _id: new ObjectId(posting_id),
      posted_by: member._id
    })
  })
  .then(function(posting) {
    if (!posting) {
      return;
    }
    var allSkills = posting.required_skills.concat(posting.optional_skills);
    allSkills.forEach(function(skill) {
    	Skills.removeWord(skill.name)
  		.catch(function(err) {
  			console.log(err);
  		});
    });
    return schema.findByIdAndRemove(posting._id);
  });
});


/**
  * Deactivates the posting posted by the given kerberos with the given id
  * Fails if invalid kerberos, does nothing if there is no such posting
  *
  * @param {String} kerberos of staff poster
  * @param {String} posting_id of the posting to change
  *
  * @return {Promise} posting the deactived posting, if any
  */
postingSchema.statics.deactivatePosting = Promise.method(function(kerberos, posting_id) {
  var schema = this;
  return Staff.findByKerberos(kerberos)
  .then(function(member) {
    if (!member) {
      throw new Error("No such staff member with that kerberos!");
    }
    return schema.findOneAndUpdate({
      _id: new ObjectId(posting_id),
      posted_by: member._id
    }, { active: false }, { new: true });
  });
});

/**
  * Adds the student of the given kerberos to the list of interested students
  * for the posting with the given id
  * Fails if there is no student with that kerberos.
  *
  * @param {String} kerberos of student showing interest
  * @param {String} posting_id of the posting to show interest in
  *
  * @return {Promise} posting that the student showed interest in
  */
postingSchema.statics.showInterestInUROP = Promise.method(function(kerberos,
                                                                posting_id) {
  var schema = this;
  return Student.findByKerberos(kerberos)
  .then(function(student) {
    if (!student) {
      throw new Error("No such student with that kerberos!");
    }
    return schema.findByIdAndUpdate(new ObjectId(posting_id),
      {$push: {"interested": student._id}}, { new: true });
  });
});

/**
  * Removes the student of the given kerberos from the list of interested students
  * for the posting with the given id
  * Fails if there is no student with that kerberos
  *
  * @param {String} kerberos of student removing interest
  * @param {String} posting_id of the posting to remove interest from
  *
  * @return {Promise} posting that the student removed interest from
  */
postingSchema.statics.removeInterestInUROP = Promise.method(function(kerberos,
                                                                  posting_id) {
  var schema = this;
  return Student.findByKerberos(kerberos)
  .then(function(student) {
    if (!student) {
      throw new Error("No such student with that kerberos!");
    }
    return schema.findByIdAndUpdate(new ObjectId(posting_id),
      {$pullAll: {"interested": [student._id]}}, { new: true });
  });
});

// helper function to deactive a given posting object
postingSchema.statics.deactivate = function(posting_id) {
  return this.findByIdAndUpdate(posting_id, { active: false }, { new: true });
};


/**
  * Deactivates the postings whose deadlines have passed
  *
  * @return {Array} promises of the deactivation of the deadlines
  */
postingSchema.statics.expireOldPostings = Promise.method(function() {
  var schema = this;
  return this.find()
  .then(function(postings) {
    return postings.filter(function(posting) {
      return posting.active && (posting.deadline < Date.now());
    }).map(function(posting) {
      return schema.deactivate(posting._id);
    });
  });
});

module.exports = mongoose.model("Posting", postingSchema);
