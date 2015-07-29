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
		$http.get(serverAddress+'/getNotif/'+$localStorage.getObject('user').id).success(function(data){
			if(data.length == 0)
				$ionicLoading.hide();
			async.each(data, function(notif,callback){
				$handleNotif.handleNotif(notif,function(){
					callback();
				});
				},function(){ 
					$ionicLoading.hide(); $rootScope.notifs = data;
					$localStorage.setObject('notifs',$rootScope.notifs);
			});
		});
	}
	else{  //Update
		$http.post(serverAddress+'/user/getLastNotif',{id: $localStorage.getObject('user').id,last_seen: $localStorage.getObject('user').last_seen}).success(function(data){
			if(data.length == 0)
				$ionicLoading.hide();
			async.each(data, function(notif,callback){
				$handleNotif.handleNotif(notif,function(){
					callback();
				});
				},function(){ 
					$ionicLoading.hide(); $rootScope.notifs = $rootScope.notifs.concat(data);
					$localStorage.setObject('notifs',$rootScope.notifs);
			});
		});
	}

	$http.post(serverAddress+'/user/updateSeen',{id: $localStorage.getObject('user').id}).success(function(user){
		var localUser = $localStorage.getObject('user');
		localUser.last_seen = user.last_seen;
		$localStorage.setObject('user',localUser);

	});

	// $scope.launchElection = function(foot){


	// }

})