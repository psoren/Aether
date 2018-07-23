
//We need to keep the client_secret secret, so we should not send it to the client
//Update the access tokens every 45 minutes
//How we update each listener access token:
//1. Have the creator call updateAccessTokens every 45 minutes.
//2. Get the roomID on the client side from the creator, and emit it to the server.
//3. Emit update access tokens to each client in that room, sending no data.
//4. Get the refresh token for each client and emit back to the server.
//5. Get the new access token on the server side using the
//client refresh token, client_id, and client_secret,
//and send each client its own new access token
//6. In the client side, update the location of the page,
//replacing the old access token with the new one
if(getParameterByName('creator')=='me'){
	setInterval(updateAccessTokens, 1000*60*45);
}

//Update the creator access token in the database every 45 minutes
if(getParameterByName('creator')=='me'){
	setInterval(updateCreatorAccessToken, 1000*60*45);
}

//check for changes in playback every second
setInterval(stateChange, 1000);

//Check for song update
setInterval(checkForSongUpdate, 1000);
