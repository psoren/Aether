
//Play or pause the playback based on the current state
$('#togglePlaybackBtn').click( async()=>{
	let res = await fetch('https://api.spotify.com/v1/me/player/currently-playing',{
		headers:{
			'Accept': 'application/json',
			'Content-Type' : 'application/json',
			'Authorization': 'Bearer ' + getParameterByName('access_token')
		}
	});
	let resJson = await res.json();
	let playBackState = resJson.is_playing ? 'pause' : 'play';
	socket.emit('togglePlaybackServer', {roomID:getParameterByName('roomID'), playBackState:playBackState});
});

//Go to the next song
$('#nextBtn').click(async()=>{
	socket.emit('nextSongServer', {roomID:getParameterByName('roomID')});
});

//Update the name of the stream
$('#roomNameForm').on('submit', function(e){
	e.preventDefault();
	let newRoomName = $('#roomName').val();
	let roomID = getParameterByName('roomID');
	socket.emit('updateRoomNameInDb',{roomName:newRoomName, roomID:roomID});
});

//Add the specified song to the playback queue
$('#addSongToPlaybackQueueForm').on('submit', function(e){
	e.preventDefault();
	//get trackURI and roomID
	let songURI = $('#songURI').val();
	let songName = $('#songName').val();
	let songArtist = $('#songArtist').val();
	let roomID = getParameterByName('roomID');

	//If these are not empty, they have selected a song
	if(songURI !== '' && songName !== ''){
		$('#songURI').val('');
		$('#songName').val('');
		$('#songArtist').val('');
		$('#songNameAndArtist').val('');
		socket.emit('addSongToPlaybackQueueInDb', {songURI:songURI, roomID:roomID, songName:songName, songArtist:songArtist});
	}
});
