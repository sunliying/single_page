/**
* app.js
**/

// 'use strict';
	var http = require('http'),
		express = require('express'),
		morgan = require('morgan'),
		methodOverride = require('method-override'),
		bodyParser = require('body-parser'),
		errorHandler = require('error-handler'),
		basicAuth = require('basic-auth'),
		app = express(),
		server = http.createServer(app),
		routes = require('./routes.js');

	app.use(bodyParser());
	app.use(methodOverride());
	app.use(bodyParser());
	app.use(express.static(__dirname + '/public'));

	var env = process.env.NODE_ENV || 'development';
		if ('development'===env){
			app.use(morgan());
		}

	var auth = function (req, res, next) {

	  function unauthorized(res) {
	    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
	    return res.send(401);
	  }

	  var user = basicAuth(req);

	  if (!user || !user.name || !user.pass) {
	    return unauthorized(res);
	  }

	  if (user.name === 'sunliying' && user.pass === 'sunly') {
	    return next();
	  } else {
	    return unauthorized(res);
	  }
	};
	app.get('/', auth);

	routes.configRoutes(app,server);
	server.listen(3000);
	console.log("the server is listening on port %d in %s mode", server.address().port,app.settings.env);



