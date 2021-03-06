angular.module('notif',[])
.controller('NotifCtrl',function($scope, $localStorage, $rootScope, $http, $location,$ionicLoading,$handleNotif,$searchLoader,$cordovaNetwork){
	//TODO USER.LASTVIEW

	$scope.go = function(notif){
		var url = notif.url;
		if(url){
			$location.path(url);
			if(url.indexOf('foot/')>-1)
				$rootScope.next = "notif";
		}
		notif.read_statut = 1;
		$localStorage.setObject('notifs',$rootScope.notifs);
	}

angular.element(document).ready(function () {
		if(window.device && $cordovaNetwork.isOnline())
			$searchLoader.show();

	if($rootScope.notifs.length == 0){ //New connexion
		$http.get(serverAddress+'/getNotif/'+$localStorage.getObject('user').id).success(function(data){
			if(data.length == 0)
				$ionicLoading.hide();
			async.each(data, function(notif,callback){
				notif.read_statut = 1;
				$handleNotif.handleNotif(notif,function(){
					callback();
				});
			},function(){ 
				$searchLoader.hide(); $rootScope.notifs = data;
				$localStorage.setObject('notifs',$rootScope.notifs);
			});
		}).error(function(){
			$searchLoader.hide();
		});
	}
	else{  //Update
		$http.post(serverAddress+'/user/getLastNotif',{id: $localStorage.getObject('user').id,last_seen: $localStorage.getObject('user').last_seen}).success(function(data){
			if(data.length == 0)
				$ionicLoading.hide();
			async.each(data, function(notif,callback){
				notif.read_statut = 0;
				$handleNotif.handleNotif(notif,function(){
					callback();
				});
			},function(){ 
				$searchLoader.hide(); $rootScope.notifs = $rootScope.notifs.concat(data);
				$localStorage.setObject('notifs',$rootScope.notifs);
				$http.post(serverAddress+'/user/updateSeen',{id: $localStorage.getObject('user').id}).success(function(user){
				var localUser = $localStorage.getObject('user');
				localUser.last_seen = user.last_seen;
				$localStorage.setObject('user',localUser);
		});
			});
		}).error(function(){
			$searchLoader.hide();
		});
	}
});

	// $scope.launchElection = function(foot){


	// }

})