module.exports = function(io){

	let app = require('express');
	let router = app.Router();
	let querystring = require('querystring');
	let Room = require('../models/room');
	let fetch = require('node-fetch');
	let resources = require('../resources.js');

	io.sockets.on('connection', function(socket){

		//Update the creator access token in the database
		//every 45 minutes
		socket.on('updateCreatorAccessTokenInDb',function(data){

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

			Room.findById(data.roomID, async function(err,room){

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
					room.creatorAccessToken = resJSON.access_token;

					room.save(function(err){
						if(err){
							console.log('There was an error saving the room after updating creator access token');
						}
						else{
							console.log('The room was saved after updating creator access token');
						}
					});
				}
				catch(err){
					console.log('there was an error when getting the new');
					console.log('access token: ' + err);
				}
			});
		});
	});
}
