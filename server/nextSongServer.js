module.exports = function(io){

	let app = require('express');
	let router = app.Router();
	let querystring = require('querystring');
	let Room = require('../models/room');
	let fetch = require('node-fetch');

	io.sockets.on('connection', function(socket){

		//When the song is done, we need to make sure that
		//there is another song in the queue by this point
		socket.on('nextSongServer',function(data){
			Room.findById(data.roomID, async function(err, room){
				if(err){
					console.log('There was an error in goToNextSong when querying the database.', err);
				}
				else{

					//if the length is at least 2, that means that there is
					//at least one more song that we can play.
					if(room.playbackQueue.length >= 2){
						let removedSongURI = room.playbackQueue[0].spotifyURI;
						room.playbackQueue.splice(0,1);	//start at index 0, and delete one element
						let nextSongURI = room.playbackQueue[0].spotifyURI;	//the new index 0

						//add the recently removed song to the played songs list
						//so we can use it to get seeds
						if(room.playedSongs.length >= 5){
							room.playedSongs.splice(0,1);
						}

						//have to get rid of the 'spotify:track' thing
						let spotifySongIDArray = removedSongURI.split(':');
						let spotifySongID = spotifySongIDArray[2];
						room.playedSongs.push(spotifySongID);

						room.save(function(err){
							if(err){
								console.log('Error when updating playback queue');
							}
							else{
								console.log('playback queue was updated in mongoDB on song change');
							}
						});
						io.sockets.in(data.roomID).emit('nextSongClient',{nextSong:nextSongURI});
						io.sockets.in(data.roomID).emit('updateClientPlaybackQueueList', {playbackQueue:room.playbackQueue});
					}

					else{
						//Get the recommendation based on seed from Spotify
						//and set the next song to be that song
						let seedTracks = room.playedSongs.join();
						let recommendationsRes = await fetch('https://api.spotify.com/v1/recommendations?' +
						querystring.stringify({
							limit: '1',
							seed_tracks: seedTracks
						}),{
							headers:{
								'Authorization': 'Bearer ' + room.creatorAccessToken
							}
						});
						let recommendationsJSON = await recommendationsRes.json();

						//we need song name, artist, and uri
						let recommendedTrackName = recommendationsJSON.tracks[0].name;
						let recommendedTrackArtist = recommendationsJSON.tracks[0].artists[0].name;
						let recommendedTrackURI = recommendationsJSON.tracks[0].uri;

						//create a song, and push onto the playback queue
						let recommendedTrack  = {
							name: recommendedTrackName,
							artist: recommendedTrackArtist,
							spotifyURI: recommendedTrackURI
						};

						room.playbackQueue.push(recommendedTrack);

						room.save(function(err){
							console.log(err ? 'Error when updating playback queue' : 'playback queue was updated in mongoDB on song change');
						});
						io.sockets.in(data.roomID).emit('nextSongClient',{nextSong:recommendedTrack});
						io.sockets.in(data.roomID).emit('updateClientPlaybackQueueList', {playbackQueue:room.playbackQueue});
					}









				}
			});
		});
	});
}
