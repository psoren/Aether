
//Initial page setup
$(document).ready(function(){
	$("#roomName").val(decodeURIComponent(getParameterByName('room')));
	$('#roomIdDiv').html(`Your roomID is ${getParameterByName('roomID')}. Give it to your friends to have them join this room.`);
});

//If roomName form loses focus, set it's value to be the room name
$('#roomName').focusout(function(){
	$('#roomName').val(getParameterByName('room'));
});

//Query Spotify search endpoint, and
//add songInformation and songURI to respective fields
$(function(){
	var queryLimit = 10;
	$(".songInfoInputField").autocomplete({
		source: async function(request, response){
			let res = await fetch('https://api.spotify.com/v1/search?q=' +
			request.term + '&type=track&limit=' + queryLimit,{
				headers:{'Authorization':'Bearer ' + getParameterByName('access_token')}
			});
			let data = await res.json();
			let songInfoArray = [];
			for(let i = 0; i < queryLimit; i++){

				let track = data.tracks.items[i].name;
				let artist = data.tracks.items[i].artists[0].name;

				//If there is more than one artist, add them
				if(data.tracks.items[i].artists.length > 1){
					for(let j = 1; j < data.tracks.items[i].artists.length; j++){
						artist += ' and ' + data.tracks.items[i].artists[j].name;

						if(artist.length >= 30){
							break;
						}
					}
				}
				let uri = data.tracks.items[i].uri;
				songInfoArray.push({
					songName: track,
					songArtist: artist,
					songInformation: track + ' by ' + artist,
					uri:uri
				});
				response(songInfoArray);
			}
		},
		select: function(event, ui) {
			$("#songNameAndArtist").val(ui.item.songInformation);
			$('#songName').val(ui.item.songName);
			$('#songArtist').val(ui.item.songArtist);
			$("#songURI").val(ui.item.uri);
			$('#roomIDTextField').val(getParameterByName('roomID'));
			return false;
		},
		minLength: 2
	})
	.data("ui-autocomplete")._renderItem = function(ul, item){
		return $("<li>")
		.append("<a>" + item.songInformation + "</a>")
		.appendTo(ul);
	};
});
