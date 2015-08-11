/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var config = require('./config/environment');
// Setup server
var app = express();
var server = require('http').createServer(app);
require('./config/express')(app);

console.log('<<<<<<<APP>>>>>>>', app)

var bodyParser = require('body-parser');
//var multer = require('multer');
//app.use(multer()); // for parsing multipart/form-data
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

require('./routes')(app);

// Use mymongo for the database initially -- get connection
var myMongo = require('./mymongo');
myMongo.connect({uri: app.get('mongo').uri});

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;
