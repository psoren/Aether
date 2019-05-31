let mongoose = require('mongoose');
let shortid = require('shortid');
let Schema = mongoose.Schema;
s
let roomSchema = new Schema({
	_id: {type: String, 'default':shortid.generate},
	name: {type: String, required: true, max: 100},
	creator: {
		name: {type: String, required: true, max: 100},
		spotifyURI: {type: String, required: true}
	},
	creatorAccessToken: {type: String, required: true},
	roomListeners: [{
		name: {type: String, required: true, max: 100},
		spotifyURI: {type: String, required: true}
	}],
	playbackQueue: [{
		name:{type: String, required:true},
		artist: {type:String, required:true},
		spotifyURI: {type: String, required: true}
	}],
	playedSongs:[{type: String}]
});

module.exports = mongoose.model('Room', roomSchema);
