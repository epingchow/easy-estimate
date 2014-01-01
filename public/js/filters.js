'use strict';

/* Filters */

angular.module('myApp.filters', []).filter('userEstimate',['$sce',  function($sce) {
  return function(user,status) {

  	if(status=='estimating'){
  		if(user.estimated){
  			return $sce.trustAsHtml('<i class="glyphicon glyphicon-ok" style="color:#32A84E"></i>');
  		}
  		else{
  			return $sce.trustAsHtml('<i class="glyphicon glyphicon-time" ></i>')
  		}
  	}else{
  		if(user.point >= 0){
  			return $sce.trustAsHtml(user.point.toString());
  		}
    	return $sce.trustAsHtml("<span class='label label-default' style='font-size:18px;'>弃权</span>");
  	}
  };
}]).filter('usersAvg',[ function() {
  return function(users) {
    var sum = 0;
    var count = 0;
    _.each(users,function(user){
      if(user.point>=0){
        sum+=user.point*1;
        count++;
      }
    });
   return (count>0)? (sum/count).toFixed(1):'-';
  };
}]).filter('usersMean',[ function() {
  return function(users) {
    if(users && users.length<=0){
      return '-'
    }
    var sum = 0;
    var count = 0;
    _.each(users,function(user){
      if(user.point>=0){
        sum+=user.point*1;
        count++;
      }
    });
    var avg = sum/count;
    count=0;
    var sum=0;
    _.each(users,function(user){
      if(user.point>=0){
        var point=user.point*1;
        sum+=Math.pow(avg-point,2);
        count++;
      }
    });
    var result =  Math.sqrt(sum/count).toFixed(1)
   return (count>0)? result:'-';
  };
}]).filter('maxUserName',[ function() {
  return function(users) {
   return _.max(users,function(user){
     return user.point;
    }).name;
  };
}]).filter('abstainCount',[ function() {
  return function(users) {
   return _.filter(users,function(user){
     return user.point==-1;
    }).length;
  };
}]).filter('maxUserPoint',[ function() {
  return function(users) {
   return _.max(users,function(user){
     return user.point;
    }).point;
  };
}]).filter('minUserName',[ function() {
  return function(users) {
   return _.min(users,function(user){
     return user.point==-1?999:user.point;
    }).name;
  };
}]).filter('minUserPoint',[ function() {
  return function(users) {
   return _.min(users,function(user){
     return user.point==-1?999:user.point;
    }).point;
  };
}])