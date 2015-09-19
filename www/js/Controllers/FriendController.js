angular.module('friend',[])
.controller('FriendCtrl',function($scope, $localStorage, $rootScope,  $http, $location, $stateParams, $handleNotif, chat){

	$scope.notes = new Array(5);
	$scope.starStatus = new Array(5);

		//Appelle setNote pour toutes les étoiles et récupère le nb de votes
	$scope.initNotes = function(){
		$http.get(serverAddress+'/getDetailledGrades/'+$scope.friend.id).success(function(data){
			$scope.friend.nbGrades = data.nbGrades;
			$scope.setNote(Math.round(data.technique), 0);
			$scope.setNote(Math.round(data.frappe), 1);
			$scope.setNote(Math.round(data.physique), 2);
			$scope.setNote(Math.round(data.fair_play), 3);
			$scope.setNote(Math.round(data.assiduite), 4);
		});
	}

		$scope.getNbTrophes = function(){
		$http.get(serverAddress+'/trophe/getNbTrophes/'+$scope.friend.id).success(function(data){
			if(data.nbHommes){
				$scope.friend.nbHommes = data.nbHommes;
			}
			if(data.nbChevres){
				$scope.friend.nbChevres = data.nbChevres;
			}
		});
	}

	$http.get(serverAddress+'/user/toConfirm/'+$stateParams.id+'/'+$localStorage.getObject('user').id).success(function(foot){

		 	if(foot.length>0){
				$scope.isInvitationConfirmation = true;
		 		$scope.foot = foot[foot.length-1];
		 	}
		 	else $scope.isInvitationConfirmation = false;		 	
	});

	$scope.friend = _.find($localStorage.getArray('friends'), function(friend){ return friend.id == $stateParams.id; });
	if($scope.friend){
		$scope.isInvitationConfirmation = false;
		$scope.isFriend = true;
		$scope.initNotes();
		$scope.getNbTrophes();
	} 
	else{
		$http.get(serverAddress+'/user/get/'+$stateParams.id).success(function(user){
			$scope.friend = user;
			$scope.initNotes();
			$scope.getNbTrophes();
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
		if(yes){
			chat.postNewChatter($scope.foot.id,$scope.friend.id);
			$http.post(serverAddress+'/foot/updatePlayer',{user:$scope.friend.id,foot:$scope.foot.id}).success(function(){
				$location.path('/user/foots');
				$handleNotif.notify({user:$scope.friend.id, related_user: $localStorage.getObject('user').id, typ:'demandAccepted',related_stuff:$scope.foot.id});
			});
		}
		else{
			$http.post(serverAddress+'/foot/refusePlayer',{user:$scope.friend.id,foot:$scope.foot.id}).success(function(){
				$location.path('/user/foots');
				$handleNotif.notify({user:$scope.friend.id, related_user: $localStorage.getObject('user').id, typ:'demandRefused'});
			});
		}
	}



})