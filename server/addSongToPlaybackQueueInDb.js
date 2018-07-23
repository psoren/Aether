module.exports = function(io){

	let app = require('express');
	let router = app.Router();
	let querystring = require('querystring');
	let Room = require('../models/room');
	let fetch = require('node-fetch');
	let resources = require('../resources.js');

	io.sockets.on('connection', function(socket){

		//When a user adds a song, they emit this event.
		//We need to add this songURI to this room's playbackQueue
		socket.on('addSongToPlaybackQueueInDb', function(data){
			Room.findById(data.roomID, function(err, room){
				if(err){
					console.log('There was an error in addSongToPlaybackQueueInDb');
				}

				//Add the specified song to the playbackQueue
				let song = {
					name: data.songName,
					artist: data.songArtist,
					spotifyURI: data.songURI
				};

				room.playbackQueue.push(song);
				room.save(function(err){
					console.log(err ? 'Error when adding song to playbackQueue in mongoDB' : 'Song was added to playback queue in mongoDB');
				});

				//If this was the first song added to the queue, we need to start playback
				if(room.playbackQueue.length == 1){
					io.sockets.in(data.roomID).emit('startInitialPlaybackForAllListeners',{
						songURI:room.playbackQueue[0].spotifyURI
					});
				}

				//Update the playbackQueueList for each user in the room
				io.sockets.in(data.roomID).emit('updateClientPlaybackQueueList', {
					playbackQueue:room.playbackQueue
				});
			});
		});
	});
}
