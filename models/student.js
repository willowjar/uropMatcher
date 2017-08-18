// Author: Kelly Shen
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var skillSchema = require('./skillschema');
var Promise = require("bluebird");
var Skills = require('./dictionary').skills;
var Interests = require('./dictionary').interests;
var utils = require('../utils/utils');
var fs = require('fs');

var studentSchema = new Schema({
	kerberos: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String},
  year: { type: Number},
	departments: {
      type: [String],
      enum: utils.departmentList,
      default: [utils.wildcardDepartment]
  },
	interests: { type: [String], default: [] },
	skills: { type: [skillSchema], default: [] },
	hours_able_to_work: { type: Number },
  resume: { type: String, default: ""  }
});

studentSchema.path("kerberos").validate(function(value) { return value.length > 0; }, "Please enter your kerberos");
studentSchema.path("password").validate(function(value) { return value.length > 0; }, "Please enter a password ");

/**
 * Creates a student
 * @param  {String}   kerberos      [kerberos of the student]
 * @param  {String}   password      [password of the student]
 * @param  {[String]} departments   [departments of the student]
 * @param  {String}   name          [name of the student]
 * @param  {Number}   year          [year of the student]
 */
studentSchema.statics.createStudent = Promise.method(function(kerberos, password, departments, name, year) {
  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(password, salt);
  return this.create({
    kerberos: kerberos,
    password: hash,
    departments: departments,
    name: name,
    year: year
  });
});

/**
 * Authorizes a student
 * @param  {String} kerberos  [kerberos the student entered]
 * @param  {String} password  [password the student entered]
 */
studentSchema.statics.authStudent = Promise.method(function(kerberos, password) {
  return this.findByKerberos(kerberos)
    .then(function(result) {
      if (result) {
        if (!bcrypt.compareSync(password, result.password)) {
          throw new Error("Incorrect kerberos/password pair");
        }
        return kerberos;
      } else {
        throw new Error("kerberos does not exist");
      }
    });
});

studentSchema.statics.findByKerberos = function(kerberos) {
  return this.findOne({ 'kerberos' : kerberos }); // TODO: mask password field
};

/**
 * Save given skill to database, then add skill to the list
 * of skills of one student who matches studentQuery.
 * @param  {String} kerberos  [kerberos of the student]
 * @param  {Skill}  newSkill  [skill the student wants to add]
 */
studentSchema.statics.addSkill = Promise.method(function(kerberos, newSkill) {
  if (newSkill.name.length == 0 ||
    (newSkill.proficiency < 0 || newSkill.proficiency > 6)) {
      throw new Error("Invalid skill name or proficiency.");
  }
  var skillToAdd = {
    name: newSkill.name,
    proficiency: parseInt(newSkill.proficiency)
  }
  var schema = this;
  return schema.findByKerberos(kerberos)
    .then(function(student) {
      student.skills.forEach(function(skill) {
        if (skill.name == skillToAdd.name) {
          throw new Error("Already have skill with that name!");
        }
      });
      return schema.collection.findOneAndUpdate({ 'kerberos': kerberos },
          {$push: {"skills": skillToAdd}},
          {new : true});
    })
    .then(function(student) {
      return Skills.addWord(skillToAdd.name);
    });
});

/**
 * Remove a skill from the student with the given kerberos and skill name.
 * @param  {String} kerberos   [kerberos of the student]
 * @param  {String} skillName  [name of the Skill the student wants to delete]
 */
studentSchema.statics.removeSkill = Promise.method(function(kerberos, skillName) {
  var schema = this;
  return schema.findByKerberos(kerberos)
  .then(function(member) {
    if (!member) {
      throw new Error("No such student with that kerberos!");
    }
    var skillToDelete = member.skills.find(function(skill) {
      return skill.name === skillName;
    });
    if (!skillToDelete) {
      throw new Error("Student has no skill with that name!");
    }
    console.log(skillToDelete);
    return schema.findOneAndUpdate({ 'kerberos': kerberos },
        {$pull: {"skills": skillToDelete}},
        {new : true});
  })
  .then(function(student) {
    return Skills.removeWord(skillName);
  });
});

/**
 * Save given interest to database, then add interest to the list
 * of interests of one student who matches studentQuery.
 * @param  {String} kerberos     [kerberos of the student]
 * @param  {String} newInterest  [interest the student wants to add]
 */
studentSchema.statics.addInterest = Promise.method(function(kerberos, newInterest) {
  if (newInterest.length == 0) {
      throw new Error("Please enter your interest.");
  }
  var schema = this;
  return schema.findByKerberos(kerberos)
    .then(function(student) {
      student.interests.forEach(function(interest) {
        if (interest == newInterest) {
          throw new Error("Already have interest with that name!");
        }
      });
      return schema.collection.findOneAndUpdate({ 'kerberos': kerberos },
          {$push: {"interests": newInterest}},
          {new : true});
    })
    .then(function(student) {
      return Interests.addWord(newInterest);
    });
});

/**
 * Add a list of interests to the list of interests of one student
 * @param  {String} kerberos        [kerberos of the student]
 * @param  {[String]} allInterests  [list of interests of the student]
 */
studentSchema.statics.addAllInterests = Promise.method(function(kerberos, allInterests) {
  var schema = this;
  schema.findByKerberos(kerberos)
  .then(function(student) {
      allInterests.forEach(function(interest) {
        schema.addInterest(kerberos, interest);
    });
  });
});

/**
 * Remove a skill from the student with the given kerberos and skill name.
 * @param  {String} kerberos   [kerberos of the student]
 * @param  {String} skillName  [name of the Skill the student wants to delete]
 */
studentSchema.statics.removeInterest = Promise.method(function(kerberos, interestName) {
  var schema = this;
  return schema.findByKerberos(kerberos)
  .then(function(member) {
    if (!member) {
      throw new Error("No such student with that kerberos!");
    }
    var interestToDelete;
    member.interests.forEach(function(interest) {
      if (interest == interestName) {
        interestToDelete = interest;
      }
    });
    if (!interestToDelete) {
      throw new Error("Student has no interest with that name!");
    }
    return schema.collection.findOneAndUpdate({ 'kerberos': kerberos },
        {$pullAll: {"interests": [interestToDelete]}},
        {new : true});
  })
  .then(function(student) {
    return Interests.removeWord(interestName);
  });
});

/**
 * Remove a list of interests from the a student's interest
 * @param  {String} kerberos       [kerberos of the student]
 * @param  {[String]} allInterests [list of interests to be removed]
 */
studentSchema.statics.removeAllInterests = Promise.method(function(kerberos, allInterests) {
  var schema = this;
  schema.findByKerberos(kerberos)
  .then(function(student) {
      allInterests.forEach(function(interest) {
        schema.removeInterest(kerberos, interest);
    });
  });
});

/**
 * Returns a list of tags the given student is not subscribed to
 * @param  {String} kerberos  [kerberos of the student]
 */
studentSchema.statics.getOtherTags = Promise.method(function(kerberos) {
  var schema = this;
  return schema.findByKerberos(kerberos)
  .then(function(member) {
    if (!member) {
      throw new Error("No such student with that kerberos!");
    }
    return Interests.find({})
    .then(function(allInterests) {
      return otherTags = allInterests.map(function(t) {
                return t.word
              }).filter(function(tag) {
                var exisitingTags = member.interests;
                if (exisitingTags.indexOf(tag) <= -1) return tag;
              });
    });
  });
});

/**
  * Adds the url of a student's resume
  * @param  {String} kerberos        [kerberos of the student]
  * @param  {String} uploadedResume  [resume url of the student]
  */
studentSchema.statics.addResume = Promise.method(function(kerberos, uploadedResume) {
  var schema = this;
  return schema.findByKerberos(kerberos)
    .then(function(student) {
      return schema.collection.findOneAndUpdate({ 'kerberos': kerberos },
          {$set: {"resume": uploadedResume}});
    });
});

var Student = mongoose.model('Student', studentSchema);
module.exports = Student;
