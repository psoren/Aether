module.exports = function(io){

	let app = require('express');
	let router = app.Router();

	io.sockets.on('connection', function(socket){

		//When the creator emits this event, tell each client to update their access token
		socket.on('notifyClientToUpdateToken', function(data){
			io.sockets.in(data.roomID).emit('getClientRefreshTokenBeforeUpdate');
		});
	});
}
