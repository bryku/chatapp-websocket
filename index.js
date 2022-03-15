// Dependancies
var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);
var cookieParser = require('cookie-parser');
var path = require('path');
// Libraries
var generateId = require('./libs/generateId.js');
// Variables
var users = [];
var messages = [];
// Routes
	app.use(express.json());
	app.use(express.urlencoded({extended: true}));
	app.use(cookieParser());
	app.use('/css',       express.static(__dirname + '/public/css'));
	app.use('/js',        express.static(__dirname + '/public/js'));
	app.use('/img',       express.static(__dirname + '/public/img'));
	app.use('/image',     express.static(__dirname + '/public/img'));
	app.use('/images',    express.static(__dirname + '/public/img'));
	app.use('/vid',       express.static(__dirname + '/public/vid'));
	app.use('/video',     express.static(__dirname + '/public/vid'));
	app.use('/videos',    express.static(__dirname + '/public/vid'));
	app.use('/aud',       express.static(__dirname + '/public/aud'));
	app.use('/audio',     express.static(__dirname + '/public/audio'));
	app.use('/downloads', express.static(__dirname + '/public/downloads'));
	app.get('/chat', (req, res)=>{
		return res.sendFile(path.join(__dirname, '/public/chat.html'));		  
	});
	app.get('/signin', (req, res)=>{
		if(!req.query || !req.query.username){return res.redirect('/')}
		var user = users.filter((v)=>{return v.username == req.query.username});
		if(user.length > 0 && req.query.username == req.cookies.username && req.cookies.id === user.id){
			// User Already Exists, User Matches Cookies
			return res.redirect('/chat');
		}else if(user.length > 0){
			// User Already Exists, User Doesn't Match
			return res.redirect('/?msg=Username_Taken');
		}else{
			// User Create
			user = {
				id: generateId(req.query.username),
				avatar: req.query.avatar || '/img/example-user.jpeg',
				username: req.query.username,
			};
			res.cookie('id', user.id);
			res.cookie('username',user.username);
			users.push(user);
			return res.redirect('/chat');
		}
	});
	app.get('/', (req, res)=>{
		return res.sendFile(path.join(__dirname, '/public/index.html'));
	});
// Web Sockets
var sockets = expressWs.getWss('/');
// Pass cookies to Web Socket
	app.use(function (req, res, next) {
		req.wsCookies = req.cookies;
		return next();
	});
// Socket Connection
app.ws('/', function(ws, req) {
	ws.on('message',(msg)=>{
		var user = users.find((v)=>{return v.username == req.wsCookies.username && v.id == req.wsCookies.id});
		if(user && msg == ':get_messages'){
			ws.send(JSON.stringify(messages));
		}else if(msg.indexOf(':set_avatar') > -1){
			user.avatar = msg.replace(':set_avatar','').trim();
			var date = new Date();
			var timestamp = date.toJSON().replace('T',' ').split('.')[0];
			var message = {
				id: user.id,
				username: user.username,
				avatar: user.avatar,
				date: timestamp,
				msg: 'Set Avatar: '+user.avatar,
			};
			ws.send(JSON.stringify([message]));
		}else if(user){
			var date = new Date();
			var timestamp = date.toJSON().replace('T',' ').split('.')[0];
			var message = {
				id: user.id,
				username: user.username,
				avatar: user.avatar,
				date: timestamp,
				msg: msg
			};
			messages.push(message);
			sockets.clients.forEach((client)=>{
				client.send(JSON.stringify([message]));
			});
		}
	});
});
// Listen for Requests
	app.listen(
		process.env.PORT || 5000, ()=>{
			console.log(`Server Running \n--- PORT: ${process.env.PORT || 443}`);
		}
	);
