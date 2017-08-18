// Author: Meghana Bhat
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Promise = require("bluebird");

var dictionarySchema = new Schema({
  word: { type: String, required: true },
  uses: { type: Number, default: 1 }
});

/**
  *  Adds a word to the dictionary if not present.
  *  Also updates recorded number of uses of the word.
  *
  * @param {String} word to be added to dictionary
  *
  * @return {Promise} entry of word added to dictionary
  */
dictionarySchema.statics.addWord = Promise.method(function(word) {
  var schema = this;
  return this.findOne({ word: word })
  .then(function(entry) {
    if (!entry) {
      return schema.create({ word: word });
    } else {
      return schema.findByIdAndUpdate(entry._id,
        { uses: (entry.uses+1) });
    }
  });
});

/**
  *  Decreases recorded number of uses of the word.
  *  Removes word if no more uses.
  *
  * @param {String} word to be removed from dictionary
  *
  * @return {Promise} entry of dictionary that was changed
  */
dictionarySchema.statics.removeWord = Promise.method(function(word) {
  var schema = this;
  return this.findOne({ word: word })
  .then(function(entry) {
    if (!entry) {
      return;
    }
    if (entry.uses === 1) {
      return schema.findByIdAndRemove(entry._id);
    }
    return schema.findByIdAndUpdate(entry._id,
      { uses: (entry.uses-1) });
  });
});

module.exports = {
    skills: mongoose.model('Skills', dictionarySchema),
    interests: mongoose.model('Interests', dictionarySchema)
};
