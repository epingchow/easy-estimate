
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var async = require('async');
var fs = require('fs');
var _ = require('underscore');

var app = express();

var options = {
  port: 3000,
  url: 'http://127.0.0.1:3000'
};


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));



// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

fs.exists(__dirname+'/config-local.js', function (exists) {
  if(!exists){
		app.get('/', function(req,res,next){
			fs.exists(__dirname+'/config-local.js', function (exists) {
				if(!exists){
					res.redirect('/config');
				}else{
 		 			routes.index(req,res);
				}
			});
		});
  }else{
		_.extend(options, require('./config-local.js'));
		app.get('/', routes.index);
  }
	// all environments
	app.set('port', options.port || 3000);
	routes.setOptions(options);
	server.listen(app.get('port'), function(){
	  console.log('Express server listening on port ' + app.get('port'));
	});
});

app.get('/config', function(req, res) {
		res.render('config', {
			options: options
		});
	});



app.post('/config', function(req, res) {
	var configTmpl = _.template("module.exports = {port: <%= port %>,url: '<%= url %>'};");
	var conf={
			port:req.body.port,
			url:req.body.url
		};
	fs.writeFile(__dirname+'/config-local.js', 
		configTmpl(conf), function (err) {
	 		if (err) throw err;
	 		_.extend(options,conf);
		});

	res.redirect('/');
});
app.get('/users', user.list);
app.get('/about', routes.about);
app.get('/room', routes.room);
app.get('/room-detail', routes.roomDetail);
app.get('/host', routes.host);

var server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

routes.initIO(io);
