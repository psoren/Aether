
//After we have updated the room name in the database,
//we need to update the room name on the client side
socket.on('updateRoomNameInClient', function(data){
	//need to replace roomName in url parameter
	let newRoomName = data.roomName;
	let newWindowPath = updateQueryStringParameter(window.location.href, "room", newRoomName);
	history.replaceState({},"Aether",newWindowPath);
	$('#roomName').val(newRoomName);
});

//When a new listener connects or leaves,
//Update the listenerList
socket.on('updateListenerList', function(data){

	$("#listenerList").empty();
	let creatorBeginnning = '<li class="list-group-item listenerListCreator"><b>';
	let creatorEnd = '</b></li>';
	$("#listenerList").append(creatorBeginnning + data.creatorName + creatorEnd);

	let listenerBeginning = '';
	let listenerEnd = '';

	for(let i = 0; i < data.listeners.length; i++){
		listenerBeginning = '<li class="list-group-item listenerListItem"><b>';
		listenerEnd = '</b></li>';
		$("#listenerList").append(listenerBeginning + data.listeners[i].name + listenerEnd);
	}
});

//When a song is added to the playbackQueue in the database,
//update the client-side list
socket.on('updateClientPlaybackQueueList', function(data){

	let playbackQueue = data.playbackQueue;
	$('#playbackQueueList').empty();

	if(playbackQueue.length == 1){
		console.log('this was the first song added so we dont do anything here');
		console.log('from updateClientPlaybackQueueList');
	}

	for(let i = 1; i < playbackQueue.length; i++){
		let section1 = '<li class="list-group-item playbackQueueListSong">';
		let section2 = '<strong>' + playbackQueue[i].name + '</strong>';
		let section3 = ' by <strong>' + playbackQueue[i].artist;
		let section4 = '</strong></li>';
		$('#playbackQueueList').append(section1 + section2 + section3 + section4);
	}
});
