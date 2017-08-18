// Author: Meghana Bhat
var express = require("express");
var session = require('express-session')
var bodyParser = require('body-parser');
var path = require("path");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users")
var skillsRouter = require("./routes/skills");
var postingsRouter = require("./routes/postings");
var tagsRouter = require("./routes/tags");
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);
var init = require("./utils/init.js");

var server = function(dbname, shouldInitDb) {
  mongoose.Promise = require('bluebird');
  mongoose.connect(process.env.MONGODB_URI ||'mongodb://localhost/' + dbname);
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function (callback) {
    console.log("database connected");
    if (shouldInitDb) {
      init.loadFrontendTestAccounts();
    }
  });

  var app = express();
  app.set('views', path.join(__dirname, 'views'));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(express.static('public'));

  app.use(session({
    saveUninitialized: false, // don't create session until something stored
    resave: false, //don't save session if unmodified
    store: new MongoStore({
      mongooseConnection: mongoose.connection
    }),
    secret: '6170opensourcefruittartsupersecuresecrethere'
  }));

  app.use('/index', indexRouter);
  app.use('/users', usersRouter);
  app.use('/skills', skillsRouter);
  app.use('/postings', postingsRouter);
  app.use('/tags', tagsRouter);

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  return app.listen(process.env.PORT || 3000, function() {
    console.log("Listening on port 3000");
  });
};

module.exports = server;
