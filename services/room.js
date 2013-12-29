// room
var _ = require("underscore");

var Room = function() {
	this.num = 0;
	this.users = [];
}

Room.prototype = {
	join: function(id,name) {
		this.users.push({
			id: id,
			name: name || "unnamed",
			estimated:false,
			point:-1
		});
		this.num = this.getNum();
	},
	leave: function(id) {
		this.users = _.reject(this.users, function(users) {
			return users.id == id
		});
		this.num = this.getNum();
	},
	getUser: function(id) {
		return _.find(this.users, function(user) {
			return user.id == id;
		});
	},
	changeName: function(id,name) {
		this.getUser(id).name=name;
	},
	getNum: function() {
		return this.users.length;
	},
	reset: function() {
		_.each(this.users,function(user){
				user.point = -1;
				user.estimated = false;
		})
	},
	clear:function(){
		this.users =[];
		this.num = 0;
	}
}

var room = exports = module.exports = new Room();