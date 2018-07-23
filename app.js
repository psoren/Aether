/*
name: Spotify Music Streaming App
author: Parker Sorenson
date: 05/28/18
*/

//Module imports
let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let createError = require('http-errors');
let request = require('request');
let cors = require('cors');
let querystring = require('querystring');
let expressValidator = require('express-validator');

//Create express app
let app = express();

//My module imports
let indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');
var callbackRouter = require('./routes/callback');
var streamSelectRouter = require('./routes/streamSelect');
var liveStreamRouter = require('./routes/liveStream');

//Set up mongoose connection
let mongoose = require('mongoose');
let aetherdb = 'mongodb://parkerUser:Helicopter43@ds159100.mlab.com:59100/aether_db';
mongoose.connect(aetherdb);
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error: (from app.js)'));

//View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Set static path
app.use(express.static(path.join(__dirname, 'public')));

//set favicon
app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));

//Set up middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

//Set up the routers
app.use('/', indexRouter);
app.use('/login', loginRouter); 
app.use('/callback', callbackRouter);
app.use('/streamSelect', streamSelectRouter);
app.use('/liveStream', liveStreamRouter);

//Catch 404 and forward to error handler
app.use(function(req, res, next){
	let err = new Error('404 Page Not Found');
	err.status = 404;
	next(err);
});

//Error handler
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error',{errorMsg:err.message});
});

module.exports = app;
