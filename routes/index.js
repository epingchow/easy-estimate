/*
 * GET home page.
 */
var room = require("../services/room");
var io = {};
var _ = require("underscore");

var express = require('express');

var uid = (function() {
	var i = 1;
	return function() {
		return i++;
	}
})();
var _options={};

var routes = exports = module.exports = {
	index: function(req, res) {
		res.render('index', {
			title: 'Express'
		});
	},
	about: function(req, res) {
		res.render('about', {
			title: 'Express'
		});
	},
	room: function(req, res) {
		res.render('room');
	},
	host: function(req, res) {
		res.render('host',_options);
	},
	setOptions: function(options) {
		_options=options;
	},
	roomDetail: function(req, res) {
		res.set("Content-Type", "javascript/json");
		res.send(200, room);
	},
	initIO: function(io) {
		io.sockets.on('connection', function(socket) {
			socket.emit("ready");
			socket.on("host", function() {
				socket.emit("host:registed", room);
				socket.on("host:reset", function() {
					room.reset();
					socket.emit("reset:success");
					socket.broadcast.emit("estimate:reset");
				})
				socket.on("host:clear", function() {
					room.clear();
					socket.broadcast.emit("user:rejoin");
				})
			});
			socket.on("join", function(name) {

				var userId = 'user-' + uid();
				room.join(userId, name);
				socket.set('user:id', userId, function() {
					socket.set('user:name', name, function() {
						socket.emit("join:success");
						socket.broadcast.emit("user:connected", {
							user: room.getUser(userId),
							room: room
						});
					});
				});

				socket.on("change:name", function(name) {
					socket.get("user:id", function(err, userId) {
						var prev = room.getUser(userId).name;
						room.changeName(userId, name);
						socket.set('user:name', name, function() {
							socket.emit("change:success");
							socket.broadcast.emit("user:namechanged", {
								prev: prev,
								now: name
							});
						})
					})
				})


				socket.on("estimate", function(point) {
					socket.get("user:id", function(err, userId) {
						var user = room.getUser(userId);
						user.point = point;
						user.estimated=true;
						socket.emit("estimate:success", point);

						socket.broadcast.emit("user:estimate", {
							user: user,
							point: point
						});
					})
				})

				socket.on("disconnect", function() {
					socket.get("user:id", function(err, userId) {
						var user = _.extend({}, room.getUser(userId));
						room.leave(userId);
						socket.get("user:name", function(err, name) {
							socket.broadcast.emit("user:disconnect", {
								name: name,
								room: room
							});
						})
					})
				})
			})
		});
	}
}