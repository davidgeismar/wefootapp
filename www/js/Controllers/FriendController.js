angular.module('friend',[])
.controller('FriendCtrl',function($scope, $localStorage, $rootScope,  $http, $location, $stateParams,$confirmation, $handleNotif, chat, user){
	$scope.moi = $localStorage.getObject('user').id
	$scope.notes = new Array(5);
	$scope.starStatus = new Array(5);
	$rootScope.friends = $localStorage.getArray('friends')
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
				$scope.foot.dateString = getJour($scope.foot.date) + ' ' + getHour($scope.foot.date);
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
			chat.postNewChatter($scope.foot.id, [$scope.friend.id]);
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

	$scope.addFriend = function(target){
    $confirmation("Ajouter comme ami ?",function(){
  		$scope.lockFriend = target;
  		postData = {user1: $localStorage.getObject('user').id, user2: target};
  		user.addFriend(postData,target).success(function(data){
      	$localStorage.newFriend = true; //Load actu of new friend on refresh
      	var notif = {user: target, related_user: $localStorage.getObject('user').id, typ:'newFriend', related_stuff:$localStorage.getObject('user').id};
      	$handleNotif.notify(notif);
      	data.statut = 0;
      	var friends = $localStorage.getArray('friends');
      	friends.push(data);
      	$localStorage.setObject('friends',friends);
      	$rootScope.friends.push(data);
      	$scope.lockFriend = 0;
      	$scope.isFriend = true;
      }).error(function(err){
      	$scope.lockFriend = 0;
      });
    });
  }

  $scope.isFriendWith = function(userId){
  	user.isFriendWith(userId).success(function(isFriend){
  		return isFriend;
  	});
  }

})
