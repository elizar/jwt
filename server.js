'use strict';

/**
 * Load Modules
 *
 *
 */
var jwt    = require('jsonwebtoken');
var Hapi	 = require('Hapi');
var server = new Hapi.Server();

var SALT = process.env.SALT || 'beepboop';

// main server connection config
var mainServer = {
	port : process.env.PORT || 3000
};

server.connection(mainServer);

server.register(require('hapi-auth-jwt'), function (err) {
	if (err) {
		return console.log(err);
	}

	server.auth.strategy('token', 'jwt', {
		key : SALT,
	});

	/**
	 * Login Route
	 *
	 * This route is responsible for generating jwt when
	 * user has successfully logged in
	 */
	server.route({
		method : 'post',
		path	 : '/login',

		handler : function (req, res) {
			req.payload = req.payload || {};

			if (req.payload.username === 'tibur' && req.payload.password === 'tibur') {
				/**
				 * create a dummy token
				 *
				 * This is temporary please use a more specific and
				 * valid object.
				 */
				var token = jwt.sign({
					username : 'tibur',
					password : 'tibur',
					loggedIn : true
				}, SALT);

				return res({token : token});
			}

			// if login failed
			res({
				error : 'Wrong username or password'
			});
		}
	});

	/**
	 * Main Route
	 *
	 * This route needs token to access, so we have to pass in
	 * Authorization: Bearer <Json Web Token>
	 * on the header of our request
	 */
	server.route({
		method : 'get',
		path	 : '/',
		config : {
			auth : 'token'
		},

		handler : function (req, res) {
			res('beep boop');
		}
	});

	// if everything's fine, all plugins loaded, then we shall start thy server
	server.start();
});
