
//Send the server the client's refresh token so the server can get a new access token
socket.on('getClientRefreshTokenBeforeUpdate', function(data){
	socket.emit('updateAccessToken',{refreshToken:getParameterByName('refresh_token')});
});

//When the client has received a new access token,
//Update the window location access token parameter
//so we can use it to make requests
socket.on('setNewAccessToken', function(data){
	let newAccessToken = data.accessToken;
	let newWindowPath = updateQueryStringParameter(window.location.href, "access_token", newAccessToken);
	history.replaceState({}, 'Aether', newWindowPath);
});

//When a socket first connects to the page
socket.on('connect', function(){
	fetch('https://api.spotify.com/v1/me',{
		headers: {'Authorization': 'Bearer ' + getParameterByName('access_token')}
	})
	.then(response => response.json())
	.then(data => socket.emit('addUser',{
		roomID:getParameterByName('roomID'),
		listenerURI:data.uri,
		displayName: data.display_name,
		creator:getParameterByName('creator')
	}))
	.catch( error => console.error('There was an error in connect: ', error));
});

//When the creator first accesses the page, we need to set their list of songs to play
//If the creator was not playing anything when they created the room, data.playbackQueue is empty
socket.on('startCreatorPlayback', async function(data){

	//Get creator current playback position in song
	let currentPos = await fetch('https://api.spotify.com/v1/me/player',{
		headers:{'Authorization': 'Bearer ' + getParameterByName('access_token')}
	});
	let currentPosJson = await currentPos.json();
	let volume = currentPosJson.device.volume_percent;

	//Set volume to be zero before changing the playback state
	await fetch('https://api.spotify.com/v1/me/player/volume?volume_percent=0',{
		method:'PUT',
		headers:{'Authorization': 'Bearer ' + getParameterByName('access_token')}
	});

	//Set creator playback to array of songs in data.playbackQueue
	let setPlayback = await fetch('https://api.spotify.com/v1/me/player/play',{
		method:'PUT',
		headers: {'Authorization': 'Bearer ' + getParameterByName('access_token')},
		body:JSON.stringify({"uris": data.playbackQueue})
	}).catch(function(error){
		console.log(error);
	});

	//Seek to same position as creator
	let seekRes = await fetch('https://api.spotify.com/v1/me/player/seek' +
	'?position_ms=' + currentPosJson.progress_ms,{
		method:'PUT',
		headers: {
			"Accept": "application/json",
			"Content-Type": "application/json",
			'Authorization': 'Bearer ' + getParameterByName('access_token')
		}
	});

	//After changing playback state,
	//Set volume to be what it was before
	await fetch('https://api.spotify.com/v1/me/player/volume?volume_percent=' + volume,{
		method:'PUT',
		headers:{'Authorization': 'Bearer ' + getParameterByName('access_token')}
	});

});

//When the current song ends, we get the next song from mongoDB and play it.
socket.on('nextSongClient', async function(data){
	//Set playback of all users in room to array of next song in data.playbackQueue

	try{
		await fetch('https://api.spotify.com/v1/me/player/play',{
			method:'PUT',
			headers: {'Authorization': 'Bearer ' + getParameterByName('access_token')},
			body:JSON.stringify({"uris": [data.nextSong]})
		});
	}
	catch(err){
		console.log('There was an error in nextSongClient: ', err);
	}

});

//Toggle the playback state for the client
socket.on('togglePlaybackClient', async function(data){

	try{
		await fetch('https://api.spotify.com/v1/me/player/' + data.playBackState,{
			method:'PUT',
			headers: {'Authorization': 'Bearer ' + getParameterByName('access_token')},
		});
	}
	catch(err){
		console.log('There was an error: ', err);
	}

});

//When a user connects, set their playback
//to be the same as that of the creator
socket.on('syncUserPlayback', async function(data){

	//Get current position of creator in song
	let creatorRes = await fetch('https://api.spotify.com/v1/me/player',{
		headers:{'Authorization': 'Bearer ' + data.creatorAccessToken}
	});
	let creatorResJSON = await creatorRes.json();

	//Get listener volume
	let currentPos = await fetch('https://api.spotify.com/v1/me/player',{
		headers:{'Authorization': 'Bearer ' + getParameterByName('access_token')}
	});
	let currentPosJson = await currentPos.json();
	let volume = currentPosJson.device.volume_percent;

	//Mute listener
	await fetch('https://api.spotify.com/v1/me/player/volume?volume_percent=0',{
		method:'PUT',
		headers:{'Authorization': 'Bearer ' + getParameterByName('access_token')}
	});

	//Set listener playback to data.song
	await fetch('https://api.spotify.com/v1/me/player/play',{
		method:'PUT',
		headers:{'Authorization': 'Bearer ' + getParameterByName('access_token')},
		data:JSON.stringify({"uris": [data.song]})
	});

	//Seek to same position as creator
	await fetch('https://api.spotify.com/v1/me/player/seek' + '?position_ms=' + creatorResJSON.progress_ms,{
		method:'PUT',
		headers:{
			"Accept": "application/json",
			"Content-Type": "application/json",
			'Authorization': 'Bearer ' + getParameterByName('access_token')
		}
	});

	//If the creator's song was paused, pause the listener's as well
	if(!creatorResJSON.is_playing){
		await fetch('https://api.spotify.com/v1/me/player/pause',{
			method:'PUT',
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json",
				'Authorization': 'Bearer ' + getParameterByName('access_token')
			}
		});
		console.log('paused listener');
	}

	//Set listener volume to what it was previously
	await fetch('https://api.spotify.com/v1/me/player/volume?volume_percent=' + volume,{
		method:'PUT',
		headers:{'Authorization': 'Bearer ' + getParameterByName('access_token')}
	});
});

//If the stream was started without any song playing,
//we start playback here
socket.on('startInitialPlaybackForAllListeners', function(data){

	let loopIDForDeviceCheck = setInterval(async function(){

		//Since there is no playback get the user's most recently used device.
		let devicesRes = await fetch('https://api.spotify.com/v1/me/player/devices',{
			headers:{'Authorization' : 'Bearer ' + getParameterByName('access_token')}
		});
		let devicesResJSON = await devicesRes.json();

		if(devicesResJSON.devices.length == 0){
			alert('Please login to your Spotify app on your device to begin.');
		}
		else{
			let deviceID = devicesResJSON.devices[0].id;
			let songURI = data.songURI;

			console.log('device id is: ' + deviceID);
			console.log('songURI is: ' + songURI);

			//this just transferred playback - what is wrong now?
			//mlabs maintenance?
			//transfer playback
			await fetch('https://api.spotify.com/v1/me/player',{
				method:'PUT',
				headers:{'Authorization': 'Bearer ' + getParameterByName('access_token')},
				body:JSON.stringify({
					"device_ids":[deviceID]
				})
			});

			//play new song
			await fetch('https://api.spotify.com/v1/me/player/play',{
				method:'PUT',
				headers:{'Authorization': 'Bearer ' + getParameterByName('access_token')},
				body:JSON.stringify({
					'uris': [songURI]
				})
			});
			clearInterval(loopIDForDeviceCheck);
		}
	}, 2000);
});

//Handle disconnect event on client side
//Distinguish between creator and listener
//and update list in listener case
//and kick out listeners in creator case
socket.on('userDisconnected', function(data){
	console.log('A user has disconnected.');
});
