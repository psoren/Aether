exports.index = function(req, res) {

	var request = require('request');
	var querystring = require('querystring');
	var cookieParser = require('cookie-parser');

	var resources = require('../resources.js');
	var client_id = resources.client_id;
	var client_secret = resources.client_secret;
	var redirect_uri = resources.redirect_uri;
	var stateKey = resources.stateKey;

	var code = req.query.code || null;
	var state = req.query.state || null;
	var storedState = req.cookies ? req.cookies[stateKey] : null;

	//Verifying that everything went correctly
	if (state === null || state !== storedState) {
		res.redirect('/#' +
		querystring.stringify({error: 'state_mismatch'}));
	}
	else {
		res.clearCookie(stateKey);

		var authOptions = {
			url: 'https://accounts.spotify.com/api/token',
			form: {
				code: code,
				redirect_uri: redirect_uri,
				grant_type: 'authorization_code'
			},
			headers: {
				'Authorization': 'Basic ' + (new Buffer(client_id + ':' +
				client_secret).toString('base64'))
			},
			json: true
		};

		request.post(authOptions, function(error, response, body){
			if (!error && response.statusCode === 200) {

				var access_token = body.access_token;
				var refresh_token = body.refresh_token;

				res.cookie('access_token', access_token);
				res.cookie('refresh_token', refresh_token);

				var options = {
					url: 'https://api.spotify.com/v1/me',
					headers: { 'Authorization': 'Bearer ' + access_token},
					json: true
				};

				// we can also pass the token to the browser to make requests from there
				/*res.redirect('streamSelect/#' +
				querystring.stringify({
					access_token: access_token,
					refresh_token: refresh_token
				}));*/

				res.redirect('streamSelect/#&' +
				querystring.stringify({
					access_token: access_token,
					refresh_token: refresh_token
				}));
			}
			else {
				res.redirect('/#' +
				querystring.stringify({
					error: 'invalid_token'
				}));
			}
		});
	}
};
