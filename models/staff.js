// Author: Kelly Shen
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var Promise = require("bluebird");

var staffSchema = new Schema({
	kerberos: { type: String, required: true },
	password: { type: String, required: true },
});

staffSchema.path("kerberos").validate(function(value) { return value.length > 0; }, "Please enter your kerberos");
staffSchema.path("password").validate(function(value) { return value.length > 0; }, "Please enter a password ");

/**
 * Creates a staff
 * @param  {String} kerberos      [kerberos of the staff]
 * @param  {String} password      [password of the staff]
 */
staffSchema.statics.createStaff = Promise.method(function(kerberos, password) {
  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(password, salt);
  return this.create({
    kerberos: kerberos,
    password: hash,
  });
});

/**
 * Authorizes a staff
 * @param  {String} kerberos  [kerberos the staff entered]
 * @param  {String} password  [password the staff entered]
 */
staffSchema.statics.authStaff = Promise.method(function(kerberos, password) {
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

/**
 * Finds a staff by their kerberos
 * @param  {String} kerberos [the staff's kerberos]
 */
staffSchema.statics.findByKerberos = function(kerberos) {
  return this.findOne({ 'kerberos' : kerberos });
};

var Staff = mongoose.model('Staff', staffSchema);
module.exports = Staff;
