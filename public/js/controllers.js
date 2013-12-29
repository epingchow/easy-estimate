'use strict';

/* Controllers */
var update = function($scope, $http,callback) {
	$http.get('/room-detail').success(function(data) {
		$scope.room = data;
		if(callback)callback();
	});
};

angular.module('myApp.controllers', []).
controller('HostCtrl', ['$scope', '$http', 'socket',
	function($scope, $http, socket) {
		$scope.room;
		$scope._ = _;
		$scope.status="readme";
		$scope.bar = new Bar("#svg");
		alertify.set({ delay: 2000 })
		socket.on('ready', function() {
			socket.emit("host");
			socket.on("host:registed", function(room) {
				update($scope, $http);
			});
			socket.on("user:connected", function(data) {
				update($scope, $http);
				alertify.log(data.user.name + " 进入房间");
			})
			socket.on("user:disconnect", function(data) {
				update($scope, $http);
				alertify.log(data.name + " 退出房间");
			})
			socket.on("user:namechanged", function(data) {
				update($scope, $http);
				alertify.log(data.prev + " 改名为 " + data.now);
			})
			socket.on("user:estimate", function(data) {
				update($scope, $http,function(){
					alertify.log(data.user.name + " 提交估算值 ");
					$scope.bar.render($scope.room.users);
				});
			})
			socket.on("reset:success", function(data) {
				update($scope, $http);
				alertify.log("重新开始评估");
			})
		});
		$scope.clear=function(){
			socket.emit("host:clear");
		}
		$scope.panelUrl = '/partials/readme.html';

		$scope.startEstimate =function(){
			$scope.panelUrl="";
			$scope.status="estimating";
			socket.emit("host:reset");
		}
		$scope.makeReport =function(){
			$scope.status="estimated";
			$scope.bar.render($scope.room.users);
		}
	}
]).
controller('RoomCtrl', ['$scope', 'socket',
	function($scope, socket) {
		// prompt dialog
		$scope.name="王大锤";
		$scope.point = -1;
		$scope.point_0 = '';
		$scope.point_1 = '';
		$scope.abstain = false;

		$scope.setPoint0 = function(num){
			if(num<0)$scope.point_1=0;
			$scope.point_0 = num;
			$scope.estimate($scope.point_1+$scope.point_0);
		}

		$scope.togglePoint1 = function(){
			if($scope.point_0<0) $scope.point_0=0;
			$scope.point_1 = ($scope.point_1 == 0.5) ? 0 : 0.5;
			$scope.estimate($scope.point_1+$scope.point_0);
		}

		socket.on('ready', function() {
			var name=prompt("请输入你的名字",$scope.name);
			if(name != null)$scope.name=name;
			socket.emit('join',$scope.name);
			socket.on("join:success", function() {
				console.log("success");
			});

		});

		$scope.changeName = function() {
			var name=prompt("你想改成什么名字",$scope.name);
			if(name != null){
				socket.emit('change:name',name);
				socket.on("change:success",function(){
					$scope.name = name;
				});
			}
		}

		$scope.doClick = function(point){
			socket.emit("estimate",point);
			socket.on("estimate:success",function(){
				$scope.point=point;
			})
		}



		$scope.estimate = function(point){
			socket.emit("estimate",point);
			socket.on("estimate:success",function(){
				$scope.point=point;
			})
		}

		socket.on("estimate:reset",function(){
			$scope.point=-1;
			$scope.point_0 = '';
			$scope.point_1 = '';
		});

		socket.on("user:rejoin",function(){
			window.location.reload();
		});

	}
]);