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
	$http.post('http://localhost:1337/user/updateSeen',{id: $localStorage.user.id});
	$http.get('http://localhost:1337/getNotif/'+$localStorage.user.id).success(function(data){
		$localStorage.notifs = data;
		if(data.length == 0)
			$ionicLoading.hide();
		async.each($localStorage.notifs, function(notif,callback){
			$handleNotif.handleNotif(notif,function(){
				callback();
			});
			},function(){ 
				$ionicLoading.hide(); $scope.notifs = $localStorage.notifs;
		});
	}).error(function(){$scope.err = "Erreur lors de la requête";});






	// $scope.launchElection = function(foot){


	// }

})