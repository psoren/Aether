module.exports = function(io){

	let app = require('express');
	let router = app.Router();
	let querystring = require('querystring');
	let Room = require('../models/room');
	let fetch = require('node-fetch');
	let resources = require('../resources.js');

	io.sockets.on('connection', function(socket){

		//When the client sends this event with their refresh token,
		//get a new access token and send it back to them
		socket.on('updateAccessToken', async function(data){

			let client_id = resources.client_id;
			let client_secret = resources.client_secret;

			//Need to encode grant_type and refresh_token
			//in application/x-www-form-urlencoded format
			var details = {
				grant_type:'refresh_token',
				refresh_token:data.refreshToken
			};
			var formBody = [];
			for(var property in details){
				var encodedKey = encodeURIComponent(property);
				var encodedValue = encodeURIComponent(details[property]);
				formBody.push(encodedKey + '=' + encodedValue);
			}
			formBody = formBody.join('&');

			try{
				let res = await fetch('https://accounts.spotify.com/api/token',{
					method:'POST',
					headers: {
						'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')),
						'Content-type':'application/x-www-form-urlencoded'
					},
					body:formBody
				});
				let resJSON = await res.json();

				//sending this particular access token back to this particular client
				socket.emit('setNewAccessToken',{accessToken:resJSON.access_token});
			}
			catch(err){
				console.log('There was an error when getting');
				console.log(' the new access token for the client');
				console.log('The error was: ' + err);
			}
		});
	});
}
