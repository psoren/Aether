exports.index = function(req, res) {
	res.render('login');
};

exports.loginUser = function(req, res){
	//when the button is clicked, do all of this
	let cookieParser = require('cookie-parser');
	let querystring = require('querystring');

	//authorization details
	let resources = require('../resources.js');
	let client_id = resources.client_id;
	let client_secret = resources.client_secret;
	let redirect_uri = resources.redirect_uri;
	let stateKey = resources.stateKey;

	let generateRandomString = function(length) {
		let text = '';
		let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		for(let i = 0; i < length; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return text;
	};
	
	stateKey = 'spotify_auth_state';
	let state = generateRandomString(16);
	res.cookie(stateKey, state);
	//The amount of information the application can access
	let scope = resources.scope;

	res.redirect('https://accounts.spotify.com/authorize?' +
	querystring.stringify({
		response_type: 'code',
		client_id: client_id,
		scope: scope,
		redirect_uri: redirect_uri,
		state: state
	}));
};
