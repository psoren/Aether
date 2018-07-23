module.exports = function(io){

	let app = require('express');
	let router = app.Router();
	let querystring = require('querystring');
	let Room = require('../models/room');
	let fetch = require('node-fetch');
	let resources = require('../resources.js');

	io.sockets.on('connection', function(socket){

		//The creator has paused the song
		socket.on('togglePlaybackServer',function(data){
			io.sockets.in(data.roomID).emit('togglePlaybackClient',
			{playBackState:data.playBackState});
		});
	});
}
