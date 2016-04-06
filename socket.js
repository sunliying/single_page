/**
* socket.js
**/

// 'use strict';
var 
	setWatch,
	http = require('http'),
	express = require('express'),
	socketIo = require('socket.io'),
	fs = require('fs'),
	app = express(),
	server = http.createServer(app),
	io = socketIo(server),
	watchMap = {};

setWatch = function(url_path,file_type){
	console.log('setWatch called on '+ url_path);
	if (!watchMap[url_path]){
		console.log('setting watch on ' +url_path);
		fs.watchFile(url_path.slice(1),function(curr,prev){
			console.log('file accessed');
			if (curr.mtime !== prev.mtime) {
				console.log('file changed');
				io.sockets.emit(file_type,url_path);
			}
		});
		watchMap[url_path] = true;
	}
};
app.use(function(req,res,next){
	// console.log(req.baseUrl,req.originUrl,req.path);
	if(req.url.indexOf('/js/')>=0){
		setWatch(req.url,'script');
	}else if(req.url.indexOf('/css/')>=0){
		setWatch(req.url,'stylesheet');
	}
	next();
});
app.use(express.static(__dirname + '/'));
app.get('/',function(req,res){
	res.redirect('/socket.html');
});

server.listen(3000);
console.log("the server is listening on port %d in %s mode", server.address().port,app.settings.env);

