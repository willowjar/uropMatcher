// Author: Meghana Bhat
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var skillSchema = new Schema({
  name: {type: String, required: true},
  proficiency: {type: Number,
    get: v => Math.round(v),
    set: v => Math.round(v),
    required: true}
});

skillSchema.path('name').validate(function(value) {
  return (value.length > 0);
}, 'Invalid skill name, must be non-empty.');

skillSchema.path('proficiency').validate(function(value) {
  return (value < 6 && value > 0);
}, 'Invalid proficiency value, must be 1-5.');

module.exports = skillSchema;
