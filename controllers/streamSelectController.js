//The Room database model
let Room = require('../models/room');
let querystring = require('querystring');
let request = require('request');
let fetch = require('node-fetch');

exports.index = async function(req, res){
	try{
		let userRes = await fetch('https://api.spotify.com/v1/me',{
			headers:{'Authorization': 'Bearer ' + req.cookies['access_token']}
		});
		let userResJSON = await userRes.json();
		res.render('streamSelect',{name:userResJSON.display_name});
	}
	catch(err){
		console.error('There was an error in streamSelectController.index');
	}
};

exports.createStream = async function(req, res, next){
	access_token = req.cookies.access_token;
	refresh_token = req.cookies.refresh_token;
	roomName = req.body.streamName;

	try{
		let info = await fetch('https://api.spotify.com/v1/me',{
			headers: {'Authorization': 'Bearer ' + access_token}
		});
		let infoJSON = await info.json();

		let playback = await fetch('https://api.spotify.com/v1/me/player',{
			headers:{'Authorization': 'Bearer ' + access_token}
		});

		let creator = {
			name: infoJSON.display_name,
			spotifyURI: infoJSON.uri
		};

		let playbackQueue = [];
		let playedSongs = [];

		//If the user is playing anything, create the room with the current song
		try{
			let playbackJSON = await playback.json();

			let artist = playbackJSON.item.album.artists[0].name;

			//If there is more than one artist
			if(playbackJSON.item.album.artists.length > 1){

				//append the name of each additional artist to the artist string
				for(let i = 1; i < playbackJSON.item.album.artists.length; i++){
					artist += ' and ' + playbackJSON.item.album.artists[i].name;

					//If the length of the artist string is more than 30 characters long
					if(artist.length >= 30){
						break;
					}
				}
			}

			let song = {
				name: playbackJSON.item.name,
				artist: artist,
				spotifyURI: playbackJSON.item.uri
			};
			playbackQueue.push(song);

			//have to get rid of the 'spotify:track' thing
			let spotifySongIDArray = playbackJSON.item.uri.split(':');
			let spotifySongID = spotifySongIDArray[2];
			playedSongs.push(spotifySongID);
		}
		finally{
			let room = new Room({
				name: roomName,
				creator: creator,
				creatorAccessToken: access_token,
				roomListeners: [],
				playbackQueue: playbackQueue,
				playedSongs: playedSongs
			});

			room.save(function(err){
				if(err){
					console.error('There was an error when saving the room:' + err);
				}
			});

			//Pass data to client
			res.redirect('/liveStream/?' +
			querystring.stringify({
				room:encodeURIComponent(roomName),
				roomID:room._id,
				access_token: access_token,
				refresh_token: refresh_token,
				creator:'me'
			}));
		}
	}
	catch(err){
		console.error('There was an error in streamSelectController.createStream');
		console.error('The error is: ' + err);
	}
};

exports.joinStream = function(req, res, next){

	access_token = req.cookies.access_token;
	refresh_token = req.cookies.refresh_token;
	streamID = req.body.streamID;

	Room.findById(streamID, function(err, docs){
		if(err){
			console.log(err);
			res.render('error',{errorMsg:'There was an error when querying the database'});
		}
		else{
			if(!docs || docs.length == 0){
				res.render('error',{errorMsg:'Could not find room'});
			}
			else{
				//Pass data to client
				res.redirect('/liveStream/?' +
				querystring.stringify({
					room:docs.name,
					roomID:streamID,
					access_token: access_token,
					refresh_token: refresh_token,
					creator:'other'
				}));
			}
		}
	});
};
