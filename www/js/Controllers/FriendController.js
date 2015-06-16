angular.module('friend',[])
.controller('FriendCtrl',function($scope, $localStorage, $rootScope,  $http, $location, $stateParams){

	$scope.notes = new Array(5);
	$scope.starStatus = new Array(5);

		//Appelle setNote pour toutes les étoiles et récupère le nb de votes
	$scope.initNotes = function(){
		$http.get('http://localhost:1337/getDetailledGrades/'+$scope.friend.id).success(function(data){
			$scope.friend.nbGrades = data.nbGrades;
			$scope.setNote(Math.round(data.technique), 0);
			$scope.setNote(Math.round(data.frappe), 1);
			$scope.setNote(Math.round(data.physique), 2);
			$scope.setNote(Math.round(data.fair_play), 3);
			$scope.setNote(Math.round(data.assiduite), 4);
		}).error(function(){
			console.log('error');
		});
	}
	$http.get('http://localhost:1337/user/toConfirm/'+$stateParams.id+'/'+$localStorage.user.id).success(function(foot){
			console.log(foot);
		 	if(foot.length>0){
				$scope.isInvitationConfirmation = true;
		 		$scope.foot = foot[foot.length-1];
		 	}
		 	else $scope.isInvitationConfirmation = false;		 	
	});

	if(getStuffById($stateParams.id, $localStorage.friends)){
		$scope.friend = getStuffById($stateParams.id,$localStorage.friends);
		$scope.isInvitationConfirmation = false;
		$scope.isFriend = true;
		$scope.initNotes();
	}
	else{
		console.log('http://localhost:1337/user/toConfirm/'+$stateParams.id+''+$localStorage.user.id);
		$http.get('http://localhost:1337/user/get/'+$stateParams.id).success(function(user){
			$scope.friend = user;
			// $scope.initNotes();
		});
	}

	for(var i=0; i<5; i++) {
		$scope.starStatus[i] = new Array(5);
	}
	for(var i=0; i<5; i++) {
		for(var j=0; j<5; j++) {
			$scope.starStatus[i][j] = "ion-android-star";
		}
	}

	//Affiche la note du joueurs en mode étoiles
	$scope.setNote = function(note, target){

		$scope.notes[target] = note;
		for(var i=0; i<5; i++) {
			if(i+1<=note)
				$scope.starStatus[target][i] = "ion-android-star";
			else
				$scope.starStatus[target][i] = "ion-android-star-outline";
		}
	}


	$scope.acceptInvitation = function (yes){
		console.log('hello');
		if(yes){
			$http.post('http://localhost:1337/foot/updatePlayer',{user:$scope.friend.id,foot:$scope.foot.id}).success(function(){
				$location.path('/user/foots');
				notify({user:$scope.friend.id, related_user: $localStorage.user.id, typ:'demandAccepted',related_stuff:$scope.foot.id});
			});
		}
		else{
			$http.post('http://localhost:1337/foot/refusePlayer',{user:$scope.friend.id,foot:$scope.foot.id}).success(function(){
				$location.path('/user/foots');
				notify({user:$scope.friend.id, related_user: $localStorage.user.id, typ:'demandRefused'});
			});
		}
		

	}

})