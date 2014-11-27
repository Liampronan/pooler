
/*!
 * nodejs-express-mongoose-demo
 * Copyright(c) 2013 Madhusudhan Srinivasa <madhums8@gmail.com>
 * MIT Licensed
 */
/**
 * Module dependencies
 */
var express = require('express');

var app = express();

// Add headers
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');
//  res.setHeader('Access-Control-Allow-Origin', 'http://hitcher.us');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});
app.options("*", function(req,res,next){res.send(200)});


var fs = require('fs');
var mongoose = require('mongoose');
var passport = require('passport');
var config = require('./config/config');

var port = process.env.PORT || 9000;

// Connect to mongodb
var connect = function () {
  var options = { server: { socketOptions: { keepAlive: 1 } } };
  mongoose.connect(config.db, options);
};
connect();

mongoose.connection.on('error', console.log);
mongoose.connection.on('disconnected', connect);

// Bootstrap models
fs.readdirSync(__dirname + '/server/models').forEach(function (file) {
  if (~file.indexOf('.js')) require(__dirname + '/server/models/' + file);
});

// Bootstrap passport config
require('./config/passport')(passport, config);

// Bootstrap application settings
require('./config/express')(app, passport);

// Bootstrap routes
require('./config/routes')(app, passport);


app.listen(port);
console.log('Express app started on port ' + port);

/**
 * Expose
 */

module.exports = app;
