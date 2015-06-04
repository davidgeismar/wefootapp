angular.module('notif',[])
.controller('NotifCtrl',function($scope, $localStorage, $rootScope, $http, $location,$ionicLoading){
	$rootScope.notif = 0;
	$ionicLoading.show({
	    content: 'Loading Data',
	    animation: 'fade-out',
	    showBackdrop: true
	});
	var parseNotif = function(typ){
		switch(typ){
			case 'newFriend':
				return ('vous à ajouté à ses amis.');
			case 'hommeDuMatch':
				return ('avez été élu homme du match.');
			case 'chevreDuMatch':
				return('avez été élu chèvre du match.');
			case 'footInvit':
				return ('vous à invité à un foot.');
			case 'footConfirm':
				return ('à confirmé sa présence à votre foot.');
		}
	};
	$http.get('http://localhost:1337/getNotif/'+$localStorage.user.id).success(function(data){
		var finish = 0;
		$localStorage.notifs = data;
		angular.forEach(data, function(notif,index){
			$http.get('http://localhost:1337/user/'+notif.related_user).success(function(user){
				if(user.id == $localStorage.user.id)
					$localStorage.notifs[index].userName == "Vous";
				else
					$localStorage.notifs[index].userName = user.first_name; 
				$localStorage.notifs[index].texte = parseNotif(notif.typ);
				date = new Date(notif.createdAt);
				$localStorage.notifs[index].date = getHour(date)+', le '+getJour(date).substring(getJour(date).indexOf(date.getDate()),getJour(date).length); //('20h06, le 27 Mai')
				finish++;
				if(finish == data.length){ $ionicLoading.hide(); $scope.notifs = $localStorage.notifs;}
			}).error(function(){$scope.err = "Erreur lors de la requête";});
		});
	}).error(function(){$scope.err = "Erreur lors de la requête";});






	// $scope.launchElection = function(foot){


	// }

})