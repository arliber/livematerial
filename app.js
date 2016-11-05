'use strict';

var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    routes = require('./routes'),
    logger = require('winston'),
    config = require('./config'),
    databaseService = require('./services/database.server.service');

//Init file logger - not supported on Heroku
/*logger.add(logger.transports.File, {
    filename: 'logs.log',
    maxsize: 5242880,
    maxFiles: 4
});*/

//Define app
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/public", express.static(path.join(__dirname, 'public'))); //Serve all files from /public directory
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico'))); //Serve favicon
app.use('/', routes); //Register app routes


//404 errors
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

//500 errors
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});

//Start app
databaseService.init(process.env.MONGODB_URI || config.connectionString, function(err) {
  if(err) {
    logger.error('App: aborting due to database connection failure');
  } else {
    app.listen(process.env.PORT || config.port, function () {
      console.log('Server started on port ['+ config.port +']');
    });
  }
});

module.exports = app;



