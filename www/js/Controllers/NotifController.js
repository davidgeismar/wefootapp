angular.module('notif',[])
.controller('NotifCtrl',function($scope, $localStorage, $rootScope, $http, $location,$ionicLoading,$handleNotif){
	//TODO USER.LASTVIEW
	$ionicLoading.show({
	    content: 'Loading Data',
	    animation: 'fade-out',
	    showBackdrop: true
	});
	$scope.go = function(url){
		if(url)
			$location.path(url);
	}
	if($rootScope.notifs.length == 0){ //New connexion
		$http.get('http://62.210.115.66:9000/getNotif/'+$localStorage.getObject('user').id).success(function(data){
			if(data.length == 0)
				$ionicLoading.hide();
			async.each(data, function(notif,callback){
				$handleNotif.handleNotif(notif,function(){
					callback();
				});
				},function(){ 
					$ionicLoading.hide(); $rootScope.notifs = data;
			});
		});
	}
	else{  //Update
		$http.post('http://62.210.115.66:9000/user/getLastNotif',{id: $localStorage.getObject('user').id,last_seen: $localStorage.getObject('user').last_seen}).success(function(data){
			if(data.length == 0)
				$ionicLoading.hide();
			async.each(data, function(notif,callback){
				$handleNotif.handleNotif(notif,function(){
					callback();
				});
				},function(){ 
					$ionicLoading.hide(); $rootScope.notifs = $rootScope.notifs.concat(data);
			});
		});
	}

	$http.post('http://62.210.115.66:9000/user/updateSeen',{id: $localStorage.getObject('user').id}).success(function(user){
		var localUser = $localStorage.getObject('user');
		localUser.last_seen = user.last_seen;
		$localStorage.setObject('user',localUser);
	});

	// $scope.launchElection = function(foot){


	// }

})