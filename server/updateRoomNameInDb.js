module.exports = function(io){

	let app = require('express');
	let router = app.Router();
	let querystring = require('querystring');
	let Room = require('../models/room');
	let fetch = require('node-fetch');
	let resources = require('../resources.js');

	io.sockets.on('connection', function(socket){

		//When a user changes the name of the room,
		//send that event to the server and update it for each user
		socket.on('updateRoomNameInDb', function(data){
			Room.findById(data.roomID, function(err, room){
				if(err){
					console.log('There was an error in updateRoomNameInDb');
				}
				else{
					room.name = data.roomName;
					room.save(function(err){
						if(err){
							console.log('There was an error when saving the room name');
						}
						else{
							console.log('The room name was saved successfully');
						}
					});
					io.sockets.in(data.roomID).emit('updateRoomNameInClient',{roomName:data.roomName});
				}
			});
		});
	});
}
