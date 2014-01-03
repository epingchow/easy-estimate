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
		$(function(){
			$(document).keypress(function(evt){
				if(evt.keyCode=='13'){
					if($scope.status=="estimating"){
						$scope.makeReport();
					}else{
						$scope.startEstimate();
					}
					$scope.$apply();
				}
			})
		})
	}
]).
controller('RoomCtrl', ['$scope', 'socket',
	function($scope, socket) {
		// prompt dialog
		var _prefix =['羞涩的','神奇','只手遮天',"好色","威猛","奇怪的","风流的","疯癫的","面瘫","猪狗不如","一把正经","土豪","深井冰"];
		var _names = ["王大锤","李狗蛋","楚中天","本拉登","小朋友","小师妹","老头子","小明","老王","奥巴马"];
		$scope.name=_prefix[parseInt(Math.random()*1000)%_prefix.length] + _names[parseInt(Math.random()*1000)%_names.length];
		$scope.point = -1;
		$scope.point_0 = '';
		$scope.point_1 = '';
		$scope.abstain = false;
		$scope.ready=false;
		$scope.join=false;


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
			$scope.ready=true;
			$("#change-name-modal").show();
			$("#name").focus();
		});

		$scope.showModel=function(){
			$("#change-name-modal").show();
		}

		$scope.hideModel=function(){
			$("#change-name-modal").hide();
		}

		$scope.joinRoom=function(){
			socket.emit('join',$scope.name);
			socket.on("join:success", function() {
				//console.log("success");
				$scope.hideModel();
			});
			$scope.join=true;
		}

		$scope.changeName = function() {
			if($scope.name != null){
				socket.emit('change:name',$scope.name);
				socket.on("change:success",function(){
					$scope.hideModel();
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