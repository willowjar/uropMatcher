// Author: Kelly Shen
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Promise = require("bluebird");

var tempUserSchema = new Schema({
	kerberos: { type: String, required: true },
  password: { type: String, required: true },
  departments: { type: [String] },
  name: { type: String },
  year: { type: Number }
});

 /**
  * Find a tempUser by the schema id assigned to them
  * @param  {Integer} id [id of the tempUser]
  */
tempUserSchema.statics.findById = function(id) {
  return this.findOne({ '_id' : id });
}

 /**
  * Creates a tempUser
  * @param  {String} kerberos      [kerberos of the user]
  * @param  {String} password      [password that the user chose]
  * @param  {[String]} departments [departments of the user]
  */
tempUserSchema.statics.createTempUser = Promise.method(function(kerberos, password, departments, name, year) {
  return this.create({
    kerberos: kerberos,
    password: password,
    departments: departments,
    name: name,
    year: year
  });
});

 /**
  * Deletes a tempUser
  * @param  {Integer} kerberos [kerberos of the tempUser]
  */
tempUserSchema.statics.deleteTempUser = Promise.method(function(kerberos) {
  var that = this;
  return that.findOne({ 'kerberos' : kerberos })
  .then(function(user) {
    if (!user) {
      throw new Error("Your link has expired :/");
    }
    return that.remove({ 'kerberos' : kerberos});
  });
});

var TempUser = mongoose.model('TempUser', tempUserSchema);
module.exports = TempUser;