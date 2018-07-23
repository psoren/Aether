module.exports = function(io){

	let app = require('express');
	let router = app.Router();
	let querystring = require('querystring');
	let Room = require('../models/room');
	let fetch = require('node-fetch');
	let resources = require('../resources.js');

	io.sockets.on('connection', function(socket){

		//When a new user connects, add them to the database
		//and connect to the room specified by the roomID
		socket.on('addUser', function(data){
			Room.findById(data.roomID, function(err, room){
				if(err){
					console.log('Error when finding room ', data.roomID);
					console.log(err);
				}

				if(data.creator == 'me'){
					socket.creator = true;
				}
				else{
					socket.creator = false;
					let listener = {
						name:data.displayName,
						spotifyURI: data.listenerURI
					};
					room.roomListeners.push(listener);
				}
				room.save(function(err){
					console.log(err ? 'Error when saving room: ' + err : 'Room was updated');
				});

				//Join the room
				socket.join(data.roomID);
				socket.roomID = data.roomID;
				socket.spotifyURI = data.listenerURI;

				//add name of new listener to all users of the room
				io.sockets.in(data.roomID).emit('updateListenerList', {creatorName:room.creator.name, listeners:room.roomListeners});

				//We only need to emit this to the socket that just connected
				socket.emit('updateClientPlaybackQueueList', {playbackQueue:room.playbackQueue});

				//Set the playback state of the listener to be the same as the creator
				if(!socket.creator){
					socket.emit('syncUserPlayback', {creatorAccessToken: room.creatorAccessToken, song:room.playbackQueue[0].spotifyURI});
				}
				//Initalize creator playback
				else{
					//Only start playback if there is a song to be played
					if(room.playbackQueue.length >= 1){
						let songURI = room.playbackQueue[0].spotifyURI;
						let songURIArray = [songURI];
						socket.emit('startCreatorPlayback', {playbackQueue:songURIArray});
					}
				}
			});
		});

	});
}
