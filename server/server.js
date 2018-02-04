const chalk = require('chalk');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var port = process.env.PORT || 5000;

// called before everything, used for properties
function config() {
	app.use(bodyParser.json()); // support json encoded bodies
	app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
}

// called before running, sets up middleware
function routes() {
	getRequests();
	postRequest();
}

function getRequests() {
	/// /api/users
	app.get('/api/users', function(req, res) {
	  var user_id = req.param('id');
	  var token = req.param('token');
	  var geo = req.param('geo');
	  res.send(user_id + ' ' + token + ' ' + geo);
	});

	/// /api/version
	app.get('/api/:version', function(req, res) {
    res.send(req.params.version);
  });

  /// middleware
  // parameter middleware that will run before the next routes
	app.param('name', function(req, res, next, name) {
    var modified = name + '-dude';
    req.name = modified;
    next();
	});

	// http://localhost:8080/api/users/chris
	app.get('/api/users/:name', function(req, res) {
	    // the user was found and is available in req.user
	    res.send('What is up ' + req.name + '!');
	});
}

function postRequest() {

	// POST http://localhost:8080/api/users
	// parameters sent with 
	app.post('/api/users', function(req, res) {
	    var user_id = req.body.id;
	    var token = req.body.token;
	    var geo = req.body.geo;

	    console.log("POST -> " + req.url);
	    console.log(req.body);

	    /// test marshalling
	    let obj = {
	    	id: "4",
	    	token: "e3woi0",
	    	geo: "us"
	    }
	    let objStr = JSON.stringify(obj)
	    let objObj = JSON.parse(objStr)
	    console.log(obj);
	    console.log(objStr);
	    console.log(objObj);


	    res.send(obj);
	});
}

// called to run the server with config and middleware
function start() {
	// start the server
	app.listen(port);
	console.log(chalk.blue('Creating development server : ') + 'http://localhost:' + port);
}				

config();
routes();
start();