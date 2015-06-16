angular.module('notif',[])
.controller('NotifCtrl',function($scope, $localStorage, $rootScope, $http, $location,$ionicLoading,$handleNotif){
	switchIcon('icon_none','');
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
	$http.post('http://localhost:1337/user/updateSeen',{id: $localStorage.user.id}).success(function(user){
		$localStorage.user.last_seen = user.last_seen;
	});

	if($rootScope.notifs.length == 0){ //New connexion
		$http.get('http://localhost:1337/getNotif/'+$localStorage.user.id).success(function(data){
			if(data.length == 0)
				$ionicLoading.hide();
			async.each(data, function(notif,callback){
				$handleNotif.handleNotif(notif,function(){
					callback();
				});
				},function(){ 
					$ionicLoading.hide(); $rootScope.notifs = data;
			});
		}).error(function(){$scope.err = "Erreur lors de la requête";});
	}
	else{  //Update
		$http.post('http://localhost:1337/user/getLastNotif',{id: $localStorage.user.id,last_seen: $localStorage.user.last_seen}).success(function(data){
			if(data.length == 0)
				$ionicLoading.hide();
			async.each(data, function(notif,callback){
				$handleNotif.handleNotif(notif,function(){
					callback();
				});
				},function(){ 
					$ionicLoading.hide(); $rootScope.notifs = $rootScope.notifs.concat(data);
			});
		}).error(function(){$scope.err = "Erreur lors de la requête";});
	}

	// $scope.launchElection = function(foot){


	// }

})