//Authors: TEAM OPEN SOURCE FRUIT TART
var chai = require("chai");
var chai_promise = require("chai-as-promised");
chai.use(chai_promise);
var assert = chai.assert;
var Student = require("../models/student");
var Staff = require("../models/staff");
var TempUser = require('../models/tempUser');
var Posting = require("../models/posting");
var Dictionary = require("../models/dictionary");
var Skills = Dictionary.skills;
var Interests = Dictionary.interests;
var server = require('../server')("testdb", false);
var utils = require("../utils/utils");

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

describe("Posting", function() {

  before(function (done) {
    //clear test database here
    Student.remove()
    .then(function() {
      return Staff.remove();
    })
    .then(function() {
      return Posting.remove();
    })
    .then(function() {
      return Student.createStudent("student1", "123", ['*'], "Student One", 1);
    })
    .then(function() {
      return Student.createStudent("student2", "456", ['2'], "Student Two", 2);
    })
    .then(function() {
      return Staff.createStaff("staff1", "123");
    })
    .then(function() {
      return Staff.createStaff("staff2", "456");
    })
    .then(function() {
      console.log("finished set up");
      done();
    });
  });

  afterEach(function(done) {
    // clear all postings after each test
    Posting.remove().then(function() { done(); });
  })

  describe("createPosting", function() {
    it("should be able to create valid posting", function() {
      var title = "Test UROP";
      var posting = makePostingHelper(title, [], [], ['6'], "2016-12-31");
      Posting.createPosting("staff1", posting)
      .then(function(new_posting) {
        return Posting.findById(new_posting._id)
      })
      .then(function(db_posting) {
        assert.isOk(db_posting, "Posting should exist in db.")
        return assert.equal(posting.title, db_posting.title, "Posting should have the same info.")
      })
      .catch(function(err) {
        return assert.fail("error", "success", err);
      });
    });

    it("should fail with error if invalid posting", function() {
      var title = "Bad UROP";
      var bad_posting = makePostingHelper(title, [], [], ['bad_dept'], "BAD_DATE");
      return assert.isRejected(Posting.createPosting("staff1", bad_posting), Error,
        "Posting validation failed");
    });

    it("should fail with error if invalid staff kerberos", function() {
      var title = "Test UROP";
      var posting = makePostingHelper(title, [], [], ['6'], "2016-12-31");
      return assert.isRejected(Posting.createPosting("bad_staff", posting), Error);
    });
  });

  describe("deletePosting", function() {
    it("should successfully delete only the correct posting", function() {
      var kerberos = "staff1";
      var posting_to_delete = makePostingHelper("UROP0", [], [], ['6'], "2016-12-31");
      var posting_to_save = makePostingHelper("UROP1", [], [], ['6'], "2016-12-31");
      return Posting.createPosting(kerberos, posting_to_save)
      .then(function(posting) {
        return Posting.createPosting(kerberos, posting_to_delete);
      })
      .then(function(posting) {
        return Posting.deletePosting(kerberos, posting._id);
      })
      .then(function(posting) {
        return assert.equal(posting_to_delete.title, posting.title);
      })
      .catch(function(err) {
        return assert.fail("error", "success", err);
      })
    });

    it("should not delete posting by different staff", function() {
      var title = "Test UROP";
      var posting = makePostingHelper(title, [], [], ['6'], "2016-12-31");
      return Posting.createPosting("staff1", posting)
      .then(function(new_posting) {
        return Posting.deletePosting("staff2", new_posting._id);
      })
      .then(function(deleted_posting) {
        return assert.isNotOk(deleted_posting, "No posting should be deleted.");
      })
      .catch(function(err) {
        return assert.fail("error", "success", err);
      });
    });
  });

  describe("getMatchedUROPS", function() {
    it("should match based on required skills", function() {
      var kerberos = "staff1";
      var skill = {name: "Testing", proficiency: 3};
      var posting_match = makePostingHelper("UROP0", [], [], ['6'], "2016-12-31");
      var posting_nonmatch = makePostingHelper("UROP1", [skill], [], ['6'], "2016-12-31");

      return Posting.createPosting(kerberos, posting_match)
      .then(function() {
        return Posting.createPosting(kerberos, posting_nonmatch);
      })
      .then(function() {
        return Posting.getMatchedUROPS("student1");
      })
      .then(function(matches) {
        assert.equal(1, matches.length, "Should have one match");
        assert.equal(posting_match.title, matches[0].title,
          "First posting should match");
        return Student.addSkill("student1", skill);
      })
      .then(function() {
        return Posting.getMatchedUROPS("student1"); // try again for match
      })
      .then(function(matches) {
        return assert.equal(2, matches.length, "Should have both postings match now");
      })
      .catch(function(err) {
        return assert.fail("error", "success", err);
      });
    });

    it("should match based on department", function() {
      var kerberos = "staff1";
      var posting_match = makePostingHelper("UROP0", [], [], ['2'], "2016-12-31");
      var posting_nonmatch = makePostingHelper("UROP1", [], [], ['6'], "2016-12-31");

      return Posting.createPosting(kerberos, posting_match)
      .then(function() {
        return Posting.createPosting(kerberos, posting_nonmatch);
      })
      .then(function() {
        return Posting.getMatchedUROPS("student2");
      })
      .then(function(matches) {
        assert.equal(1, matches.length, "Should have one match");
        return assert.equal(posting_match.title, matches[0].title,
          "First posting should match");
      })
      .catch(function(err) {
        return assert.fail("error", "success", err);
      });
    });

    it("should show which matches are also matches of interest", function() {
      var kerberos = "staff1";
      var interest = "Testing"
      var posting_match = makePostingHelper("UROP0", [], [interest], ['6'], "2016-12-31");
      var posting_nonmatch = makePostingHelper("UROP1", [], [], ['6'], "2016-12-31");

      return Posting.createPosting(kerberos, posting_match)
      .then(function() {
        return Posting.createPosting(kerberos, posting_nonmatch);
      })
      .then(function() {
        return Student.addInterest("student1", interest);
      })
      .then(function() {
        return Posting.getMatchedUROPS("student1");
      })
      .then(function(matches) {
        matches.forEach(function(match) {
          if (match.title == posting_match.title) {
            assert.isTrue(match.match_based_on_interest,
              "Posting " + match.title + " should match based on interest");
          } else if (match.title == posting_nonmatch.title) {
            assert.isFalse(match.match_based_on_interest,
              "Posting " + match.title + " should not match based on interest");
          } else {
            assert.fail(match, null, "Should not have other postings in db.");
          }
        })
      })
      .catch(function(err) {
        return assert.fail("error", "success", err);
      });
    });
  });

  describe("getMatchedStudents", function() {
    it("should match on required skills", function() {
      var kerberos = "staff1";
      var skill = {name: "Requirements", proficiency: 3};
      var posting = makePostingHelper("UROP", [skill], [], ['*'], "2016-12-31");

      return Student.addSkill("student1", skill)
      .then(function() {
        return Posting.createPosting(kerberos, posting);
      })
      .then(function(new_posting) {
        return Posting.getMatchedStudents(kerberos, new_posting._id);
      })
      .then(function(students) {
        assert.equal(1, students.length, "Should have one match");
        return assert.equal("student1", students[0].kerberos,
          "Only student with skill should match");
      })
      .catch(function(err) {
        return assert.fail("error", "success", err);
      });
    });

    it("should match on department", function() {
      var kerberos = "staff1";
      var posting = makePostingHelper("UROP0", [], [], ['6'], "2016-12-31");

      return Posting.createPosting(kerberos, posting)
      .then(function(new_posting) {
        return Posting.getMatchedStudents(kerberos, new_posting._id);
      })
      .then(function(students) {
        assert.equal(1, students.length, "Should have one match");
        return assert.equal("student1", students[0].kerberos,
          "Only the first student should match on department");
      })
      .catch(function(err) {
        return assert.fail("error", "success", err);
      });
    });

    it("should not work if staff did not post the UROP", function() {
      var kerberos = "staff1";
      var posting = makePostingHelper("UROP0", [], [], ['*'], "2016-12-31");

      return Posting.createPosting(kerberos, posting)
      .then(function(new_posting) {
        return assert.isRejected(Posting.getMatchedStudents("staff2", new_posting._id));
      })
      .catch(function(err) {
        return assert.fail("error", "success", err);
      });
    });
  });

  describe("findStaffPostings", function() {
    it("should return no postings if staff posted nothing", function() {
      return Posting.findStaffPostings("staff1")
      .then(function(staff_postings) {
        assert.deepEqual([], staff_postings);
      })
      .catch(function(err) {
        assert.fail("error", "success", err);
      });
    });

    it("should return only the postings by the staff", function() {
      var test_posting = {}
      return Posting.createPosting("staff1", makePostingHelper(
          "Le UROP", [], [], "6", "2016-12-31"))
      .then(function(posting) {
        test_posting = posting;
        return Posting.findStaffPostings("staff1");
      })
      .then(function(staff_postings) {
        assert.deepEqual(test_posting._id, staff_postings[0]._id);
      })
      .catch(function(err) {
        assert.fail("error", "success", err);
      });
    });
  });

  describe("deactivatePosting", function() {
    it("should deactive only the correct posting", function() {
      var kerberos = "staff1";
      return Posting.createPosting(kerberos, makePostingHelper(
          "Le UROP", [], [], "6", "2016-12-31"))
      .then(function(posting) {
        return Posting.deactivatePosting(kerberos, posting._id);
      })
      .then(function(deactivated_posting) {
        assert.isFalse(deactivated_posting.active);
      })
      .catch(function(err) {
        assert.fail("error", "success", err);
      });
    });

    it("should not deactive posting if posted by different staff", function() {
      var kerberos = "staff1";
      return Posting.createPosting(kerberos, makePostingHelper(
          "Le UROP", [], [], "6", "2016-12-31"))
      .then(function(posting) {
        return Posting.deactivatePosting("staff2", posting._id);
      })
      .then(function(deactivated_posting) {
        assert.equal(deactivated_posting, null);
      })
      .catch(function(err) {
        assert.fail("error", "success", err);
      });
    });
  });

  describe("showInterestInUROP", function() {
    it("should add student to interested students in UROP", function() {
      var student_id = 0;
      return Student.findByKerberos("student1")
      .then(function(student) {
        student_id = student._id;
        return Posting.createPosting("staff1", makePostingHelper(
          "Le UROP", [], [], "6", "2016-12-31"))
      })
      .then(function(posting) {
        return Posting.showInterestInUROP("student1", posting._id);
      })
      .then(function(posting) {
        assert.isTrue(posting.interested.indexOf(student_id) > -1);
      })
      .catch(function(err) {
        assert.fail("error", "success", err);
      });
    });
  });

  describe("removeInterestInUROP", function() {
    it("should remove student from interested students in UROP", function() {
      var student_id = 0;
      return Student.findByKerberos("student1")
      .then(function(student) {
        student_id = student._id;
        return Posting.createPosting("staff1", makePostingHelper(
          "Le UROP", [], [], "6", "2016-12-31"))
      })
      .then(function(posting) {
        return Posting.showInterestInUROP("student1", posting._id);
      })
      .then(function(posting) {
        return Posting.removeInterestInUROP("student1", posting._id);
      })
      .then(function(posting) {
        assert.isFalse(posting.interested.indexOf(student_id) > -1);
      })
      .catch(function(err) {
        assert.fail("error", "success", err);
      });
    });

    it("should work even if student has been added twice", function() {
      var student_id = 0;
      return Student.findByKerberos("student1")
      .then(function(student) {
        student_id = student._id;
        return Posting.createPosting("staff1", makePostingHelper(
          "Le UROP", [], [], "6", "2016-12-31"))
      })
      .then(function(posting) {
        return Posting.showInterestInUROP("student1", posting._id);
      })
      .then(function(posting) {
        return Posting.showInterestInUROP("student1", posting._id);
      })
      .then(function(posting) {
        return Posting.removeInterestInUROP("student1", posting._id);
      })
      .then(function(posting) {
        assert.isFalse(posting.interested.indexOf(student_id) > -1);
      })
      .catch(function(err) {
        assert.fail("error", "success", err);
      });
    });
  });

  describe("deactivate", function() {
    it("should deactivate the posting", function() {
      var posting = makePostingHelper("UROP", [], [], ['6'], "2016-12-31");

      return Posting.createPosting("staff1", posting)
      .then(function(new_posting) {
        assert.isTrue(new_posting.active, "Should start active.");
        return Posting.deactivate(new_posting._id);
      })
      .then(function(deactivated_posting) {
        return Posting.findById(deactivated_posting._id); // get the latest data
      })
      .then(function(updated_posting) {
        return assert.isFalse(updated_posting.active, "Should be inactive.");
      })
      .catch(function(err) {
        return assert.fail("error", "success", err);
      });
    });
  });

  describe("expireOldPostings", function() {
    it("should make sure only old postings expire", function() {
      var posting_new = makePostingHelper("NEW UROP", [], [], ['6'], "2999-12-31");
      var posting_old = makePostingHelper("OLD UROP", [], [], ['6'], "2016-12-01");

      return Posting.createPosting("staff1", posting_new)
      .then(function() {
        return Posting.createPosting("staff1", posting_old);
      })
      .then(function() {
        return Posting.expireOldPostings();
      })
      .then(function(promises) {
        return Promise.all(promises);
      })
      .then(function() {
        return Posting.find();
      })
      .then(function(postings) {
        postings.forEach(function(posting) {
          if (posting.title == posting_old.title) {
            assert.isFalse(posting.active, "Old posting should be inactive");
          } else if (posting.title == posting_new.title) {
            assert.isTrue(posting.active, "New posting should still be active");
          } else {
            assert.fail(posting, null, "Should not have other postings in db.");
          }
        });
        return;
      })
      .catch(function(err) {
        return assert.fail("error", "success", err);
      });
    });
  });

});

describe("Dictionary", function() {
  before(function (done) {
    //clear test database here
    Skills.remove()
    .then(function() {
      return Interests.remove();
    })
    .then(function() {
      done();
    });
  });

  afterEach(function(done) {
    // clear dictionaries after each test
    Skills.remove()
    .then(function() {
      return Interests.remove();
    })
    .then(function() {
      done();
    });
  });

  describe("addWord", function() {
    it("should add new word to specified dictionary if not present", function() {
      return Skills.addWord("word")
      .then(function() {
        return Skills.find();
      })
      .then(function(entries) {
        assert.equal(1, entries.length);
        assert.equal("word", entries[0].word);
        assert.equal(1, entries[0].uses);
        return Interests.find();
      })
      .then(function(entries) {
        return assert.equal(0, entries.length);
      })
      .catch(function(err) {
        return assert.fail("error", "success", err);
      });
    });

    it("should increase uses of word in dictionary if present", function() {
      return Interests.addWord("word")
      .then(function() {
        return Interests.addWord("word");
      })
      .then(function() {
        return Interests.find();
      })
      .then(function(entries) {
        assert.equal(1, entries.length);
        assert.equal("word", entries[0].word);
        assert.equal(2, entries[0].uses);
        return;
      })
      .catch(function(err) {
        return assert.fail("error", "success", err);
      });
    });
  });

  describe("removeWord", function() {
    it("should decreases uses of word in dictionary", function() {
      return Skills.addWord("word")
      .then(function() {
        return Skills.addWord("word");
      })
      .then(function() {
        return Skills.removeWord("word");
      })
      .then(function() {
        return Skills.find();
      })
      .then(function(entries) {
        assert.equal(1, entries.length);
        assert.equal("word", entries[0].word);
        assert.equal(1, entries[0].uses);
        return;
      })
      .catch(function(err) {
        return assert.fail("error", "success", err);
      });
    });

    it("should remove word from dictionary if no more uses", function() {
      return Interests.addWord("word")
      .then(function() {
        return Interests.removeWord("word");
      })
      .then(function() {
        return Interests.find();
      })
      .then(function(entries) {
        assert.equal(0, entries.length);
        return;
      })
      .catch(function(err) {
        return assert.fail("error", "success", err);
      });
    });
  });
});

describe("TempUser", function() {
  describe("createTempUser", function() {
    it("should be able to create a tempUser", function() {
      var tempUser = {
        kerberos: "kerberos1",
        password: "123",
        departments: "",
        name: "test temp",
        year: 1
      }
      return TempUser.createTempUser("kerberos1", "123", "", "test temp", 1)
      .then(function(new_temp_user) {
        assert.equal(tempUser.kerberos, new_temp_user.kerberos, "Should be same tempUser.");
      })
      .catch(function(err) {
        return assert.fail("error", "success", err);
      });
    });
  });

  describe("deleteTempUser", function() {
    it("should successfully delete only the correct tempUser", function() {
      return TempUser.createTempUser("kerberos1", "123", "", "test temp", 1)
      .then(function(temp_user) {
        return TempUser.deleteTempUser(temp_user.kerberos);
      })
      .then(function(deleted_temp_user) {
        return assert.equal(1, deleted_temp_user.result.ok);
      })
      .catch(function(err) {
        return assert.fail("error", "success", err);
      });
    });
  });

  describe("findById", function() {
    it("should successfully return a tempUser with the given id", function() {
      var temp_user;
      return TempUser.createTempUser("kerberos1", "123", "", "test temp", 1)
      .then(function(user) {
        temp_user = user;
        return TempUser.findById(temp_user._id);
      })
      .then(function(temp_user_found) {
        assert.equal(temp_user.kerberos, temp_user_found.kerberos);
      })
      .catch(function(err) {
        return assert.fail("error", "success", err);
      });
    });
  });
});

describe("Student", function() {

  before(function (done) {
    //clear test database here
    Student.remove()
    .then(function() {
      return Student.createStudent("student1", "123", ['*'], "Student One", 1);
    })
    .then(function() {
      return Student.createStudent("student2", "456", ['2'], "Student Two", 2);
    })
    .then(function() {
      console.log("finished set up");
      done();
    });
  });

  describe("createStudent", function() {
    it("should be able to create a student", function() {
      var student = {
        kerberos: "kerberos1",
        password: "123",
        departments: ['*'],
        name: "test student",
        year: 1
      }
      return Student.createStudent("kerberos1", "123", ['*'], "test student", 1)
      .then(function(new_student) {
        assert.equal(student.kerberos, new_student.kerberos, "Should be same posting.");
      })
      .catch(function(err) {
        return assert.fail("error", "success", err);
      });
    });
  });

  describe("authStudent", function() {
    it("should successfully authenticate a student if the kerberos and password are correct", function() {
      return Student.authStudent("student1", "123")
      .then(function(result) {
        assert.equal("student1", result);
      })
      .catch(function(err) {
        return assert.fail("error", "success", err);
      });
    });

    it("should throw error message when given incorrect kerberos/password pair", function() {
      return Student.authStudent("student1", "456")
      .then(function(result) {
      })
      .catch(function(err) {
        return assert.equal(err.toString(), "Error: Incorrect kerberos/password pair");
      });
    });

    it("should throw error message when kerberos does not exist", function() {
      return Student.authStudent("student999", "456")
      .then(function(result) {
      })
      .catch(function(err) {
        return assert.equal(err.toString(), "Error: kerberos does not exist");
      });
    });
  });

  describe("addSkill", function() {
    it("should add a skill to a given student's skills", function() {
      var skillToAdd = {name: "Test Skill 0", proficiency: 2};
      return Student.addSkill("student1", skillToAdd)
      .then(function() {
        return Student.findByKerberos("student1");
      })
      .then(function(student) {
        var foundSkill = student.skills.find(function(skill) {
          return (skill.name === skillToAdd.name);
        });
        assert.isOk(foundSkill, "Should find added skill in student's skills.");
        return assert.equal(skillToAdd.proficiency, foundSkill.proficiency,
          "Proficiency of student skill should match what was added.");
      })
      .catch(function(err) {
        return assert.fail("error", "success", err);
      });
    });

    it("should throw error message when proficiency is invalid", function() {
      var skillToAdd = {name: "Test Skill 1", proficiency: 8};
      return assert.isRejected(Student.addSkill("student1", skillToAdd),
        "Invalid");
    });

    it("should throw error message when student already has skill with the given name", function() {
      var skillToAdd0 = {name: "Test Skill 2", proficiency: 2};
      var skillToAdd1 = {name: "Test Skill 2", proficiency: 4};
      return Student.addSkill("student1", skillToAdd0)
      .then(function() {
        return assert.isRejected(Student.addSkill("student1", skillToAdd1),
        "Already have skill");
      })
      .catch(function(err) {
        return assert.fail("error", "success", err);
      });
    });
  });

  describe("removeSkill", function() {
    it("should remove a skill from a given student's skills", function() {
      var skillToAdd = {name: "Test Skill 3", proficiency: 1};
      return Student.addSkill("student1", skillToAdd)
      .then(function() {
        return Student.removeSkill("student1", skillToAdd.name);
      })
      .then(function() {
        return Student.findByKerberos("student1");
      })
      .then(function(student) {
        var foundSkill = student.skills.find(function(skill) {
          return (skill.name === skillToAdd.name);
        });
        return assert.isNotOk(foundSkill,
          "Should not find removed skill in student's skills.");
      })
      .catch(function(err) {
        return assert.fail("error", "success", err);
      });
    });

    it("should throw error message when removing skill from non-exisitng student ", function() {
      var skillToAdd = {name: "Test Skill 1", proficiency: 0};
      return assert.isRejected(Student.addSkill("student122", skillToAdd));
    });

    it("should throw error message when student doesn't have skill with the given name", function() {
      var skillToRemove = {name: "Test Skill 3", proficiency: 1};
      return assert.isRejected(Student.removeSkill("student1", skillToRemove.name));
    });
  });

  describe("addInterest", function() {
    it("should add an interest to a given student's interests", function() {
      var interest_to_add = "building bridges";
      return Student.findByKerberos("student1")
      .then(function(student) {
        return Student.addInterest(student.kerberos, interest_to_add)
      })
      .then(function(result) {
        return assert.equal(interest_to_add, result.word);
      })
      .catch(function(err) {
        return assert.fail("error", "success", err);
      });
    });

    it("should be case sensitive", function() {
      var interest_to_add = "Building Bridges";
      return Student.findByKerberos("student1")
      .then(function(student) {
        return Student.addInterest(student.kerberos, interest_to_add)
      })
      .then(function(result) {
        return assert.equal(interest_to_add, result.word);
      })
      .catch(function(err) {
        return assert.fail("error", "success", err);
      });
    });

    it("should add an interest without spaces to a given student's interests", function() {
      var interest_to_add = "buildingbridges";
      return Student.findByKerberos("student1")
      .then(function(student) {
        return Student.addInterest(student.kerberos, interest_to_add)
      })
      .then(function(result) {
        return assert.equal(interest_to_add, result.word);
      })
      .catch(function(err) {
        return assert.fail("error", "success", err);
      });
    });

    it("should throw error message if the interest is an empty string", function() {
      var interest_to_add = " ";
      return Student.findByKerberos("student1")
      .then(function(student) {
        return Student.addInterest(student.kerberos, interest_to_add)
      })
      .then(function(result) {
        return assert.equal(interest_to_add, result.word);
      })
      .catch(function(err) {
        return assert.fail("error", "success", err);
      });
    });

    it("should add interest to a given student's interests if interest name only contains spaces", function() {
      var interest_to_add = "";
      return Student.findByKerberos("student1")
      .then(function(student) {
        return Student.addInterest(student.kerberos, interest_to_add)
      })
      .then(function() {
        return assert.fail("got success", "expected error");
      })
      .catch(function(err) {
        return assert.equal(err.toString(), "Error: Please enter your interest.");
      });
    });

    it("should throw error message if student already has the interest", function() {
      var interest_to_add = "building bridges";
      return Student.findByKerberos("student1")
      .then(function(student) {
        return Student.addInterest(student.kerberos, interest_to_add)
      })
      .catch(function(err) {
        return assert.equal(err.toString(), "Error: Already have interest with that name!");
      });
    });
  });

  describe("removeInterest", function() {
    it("should remove the given interest from a student's interests", function() {
      var interest_to_delete = "building bridges";
      return Student.findByKerberos("student1")
      .then(function(student) {
        return Student.removeInterest(student.kerberos, interest_to_delete)
      })
      .then(function(result) {
        return assert.equal(interest_to_delete, result.word);
      })
      .catch(function(err) {
        return assert.fail("error", "success", err);
      });
    });

    it("should be case sensitive", function() {
      var interest_to_delete = "Building Bridges";
      return Student.findByKerberos("student1")
      .then(function(student) {
        return Student.removeInterest(student.kerberos, interest_to_delete)
      })
      .then(function(result) {
        return assert.equal(interest_to_delete, result.word);
      })
      .catch(function(err) {
        return assert.fail("error", "success", err);
      });
    });

    it("should throw error message if student has no interest with the given name", function() {
      var interest_to_delete = "breaking bridges";
      return Student.findByKerberos("student1")
      .then(function(student) {
        return Student.removeInterest(student.kerberos, interest_to_delete)
      })
      .then(function() {
        return assert.fail("got success", "expected error");
      })
      .catch(function(err) {
        return assert.equal(err.toString(), "Error: Student has no interest with that name!");
      });
    });
  });

});

describe("Staff", function() {

  before(function (done) {
    //clear test database here
    Student.remove()
    .then(function() {
      return Staff.remove();
    })
    .then(function() {
      return Posting.remove();
    })
    .then(function() {
      return Student.createStudent("student1", "123", ['*'], "Student One", 1);
    })
    .then(function() {
      return Student.createStudent("student2", "456", ['2'], "Student Two", 2);
    })
    .then(function() {
      return Staff.createStaff("staff1", "123");
    })
    .then(function() {
      return Staff.createStaff("staff2", "456");
    })
    .then(function() {
      console.log("finished set up");
      done();
    });
  });

  describe("createStaff", function() {
    it("creates a staff account", function() {
      return Staff.createStaff("testStaff", "testStaff")
      .then(function(staff) {
        assert.equal(staff.kerberos, "testStaff");
      })
      .catch(function(err) {
        assert.fail("error", "success", err);
      });
    });
  });

  describe("authStaff", function() {
    it("returns the staff kerberos if the staff is correctly authenticated", function() {
      return Staff.authStaff("staff1", "123")
      .then(function(result) {
        assert.equal("staff1", result);
      })
      .catch(function(err) {
        return assert.fail("error", "success", err);
      });
    });

    it("returns an error if the username/password pair is invalid", function() {
      return Staff.authStaff("staff1", "ew-this-class")
      .then(function(result) {
        return assert.fail("got success", "expected error");
      })
      .catch(function(err) {
        return assert.equal(err.toString(), "Error: Incorrect kerberos/password pair");
      });
    });

    it("returns an error if the kerberos does not exist", function() {
      return Staff.authStaff("damn-daniel-back-at-it-again-with-the", "6.170")
      .then(function(result) {
        return assert.fail("got success", "expected error");
      })
      .catch(function(err) {
        return assert.equal(err.toString(), "Error: kerberos does not exist");
      });
    });
  });

  describe("findByKerberos", function() {
    it("returns the existing staff member with assciated kerberos", function() {
      return Staff.findByKerberos("staff1")
      .then(function(staff) {
        assert.equal(staff.kerberos, "staff1");
      })
      .catch(function(err) {
        return assert.fail("error", "success", err);
      });
    });

    it("returns null if staff member with given kerberos does not exist", function() {
      return Staff.findByKerberos("daniel-jackson-looks-like-nicholas-cage")
      .then(function(staff) {
        assert.equal(staff, null);
      })
      .catch(function(err) {
        return assert.fail("error", "success", err);
      });
    });
  });

});
