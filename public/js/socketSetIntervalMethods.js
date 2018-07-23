
//Keep track of the state of the song and once it is done, set playback to the next song
//This will also eliminate skips.
async function checkForSongUpdate(){
	let currentState = await fetch('https://api.spotify.com/v1/me/player/currently-playing',{
		headers:{
			'Accept': 'application/json',
			'Content-Type' : 'application/json',
			'Authorization': 'Bearer ' + getParameterByName('access_token')
		}
	});

	try{
		let currentStateJson = await currentState.json();
		let progress = currentStateJson.progress_ms;
		let duration = currentStateJson.item.duration_ms;
		let percentDone = progress/duration;
		//console.log(percentDone);

		//or could check if the song is finished ie percentDone == 0
		if(percentDone >= 0.992){
			console.log('song is basically done, going to next song');
			socket.emit('nextSongServer',{roomID:getParameterByName('roomID')});
		}
	}
	catch(err){
		let a = 5;
		//console.log(err + ' The user is not listening to anything. (checkForSongUpdate)');
	}
}

//Update the UI according to the state of the user's playback
async function stateChange(){

	//Set the home page link
	$('#homePageLink').attr('href', 'https://aethersocial.herokuapp.com/streamSelect#' +
	'access_token=' + getParameterByName('access_token')
	+'&refresh_token=' + getParameterByName('refresh_token'));

	//set volume to be max volume
	await fetch('https://api.spotify.com/v1/me/player/volume?volume_percent=100',{
		method:'PUT',
		headers:{'Authorization': 'Bearer ' + getParameterByName('access_token')}
	});

	let currentState = await fetch('https://api.spotify.com/v1/me/player/currently-playing',{
		headers:{
			'Accept': 'application/json',
			'Content-Type' : 'application/json',
			'Authorization': 'Bearer ' + getParameterByName('access_token')
		}
	});

	try{
		let currentStateJson = await currentState.json();

		//Update progress bar
		let progress = currentStateJson.progress_ms;
		let duration = currentStateJson.item.duration_ms;
		$('.progress-bar').width(progress/duration*250);

		//Update album art
		var img = $('<img />', {width: 250, src: currentStateJson.item.album.images[1].url, alt: currentStateJson.item.album.name});
		$('#albumArtDiv').empty();
		img.appendTo($('#albumArtDiv'));
		//Update song
		$('#currentSongDiv').html(`<strong>${currentStateJson.item.name}</strong> by <strong>${currentStateJson.item.artists[0].name}</strong>`);

		//If this user is a listener, hide buttons
		if(getParameterByName('creator') == 'other'){
			$('#buttonDiv').hide();
		}
	}
	catch(err){
		let msg1 = '<h3 style="color:white;">';
		let msg2 = 'Add a song to the queue to start playback.</h3>';
		$('#albumArtDiv').empty();
		$('#albumArtDiv').append(msg1 + msg2);
	}
}

//Update the access tokens for each user every half-hour
async function updateAccessTokens(){
	console.log('updateAccessTokens was called');
	socket.emit('notifyClientToUpdateToken',{roomID:getParameterByName('roomID')});
}

//Update the creator access token in the database every 45 minutes
async function updateCreatorAccessToken(){
	socket.emit('updateCreatorAccessTokenInDb',
	{roomID:getParameterByName('roomID'),
	refreshToken:getParameterByName('refresh_token')});
}
