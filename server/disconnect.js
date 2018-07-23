module.exports = function(io){

	let app = require('express');
	let router = app.Router();
	let querystring = require('querystring');
	let Room = require('../models/room');
	let fetch = require('node-fetch');
	let resources = require('../resources.js');

	io.sockets.on('connection', function(socket){

		//If the user was the creator, tell all other users that the stream has ended.
		//If the user was a listener, remove their name from the list of listeners.
		socket.on('disconnect', function(){

			//TODO: handle creator leave

			//The creator has left the room
			if(socket.creator){
				console.log('Creator has left');
			}
			//A listener has left
			else{
				Room.findById(socket.roomID, function(err, room){
					if(err){
						console.log('There was an error when retrieving the room when a listener left');
					}
					else{
						//delete listener from listenerList in mongoDB
						for(let i = 0; i < room.roomListeners.length; i++){
							//this is the socket that just left
							if(room.roomListeners[i].spotifyURI == socket.spotifyURI){
								//delete the listener at that index
								room.roomListeners.splice(i,1);	//start at index i, and delete one element
								room.save(function(err){
									if(err){
										console.log('There was an error when deleting a listener from the database');
									}
									else{
										console.log('The listener was deleted from the database successfully');
									}
								});
								break;
							}
						}
						//Re-render listenerList for each client
						io.sockets.in(socket.roomID).emit('updateListenerList', {creatorName:room.creator.name, listeners:room.roomListeners});
					}
				});
			}
		});
	});
}
