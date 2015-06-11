angular.module('friend',[])
.controller('FriendCtrl',function($scope, $localStorage, $rootScope,  $http, $location, $stateParams){
	// var index = _.pluck($localStorage.friends,'id').indexOf($stateParams.id);
	// console.log($localStorage.friends);
	// console.log(index);
	$scope.friend = getStuffById($stateParams.id,$localStorage.friends);
	$scope.notes = new Array(5);
	$scope.starStatus = new Array(5);
	console.log($scope.friend);


	if(getStuffById($stateParams.id,$localStorage.friends)){
		$scope.friend = getStuffById($stateParams.id,$localStorage.friends);
		$scope.isInvitationConfirmation = false;
	}
	else{
		$scope.isInvitationConfirmation = true;
		$http.get('http://localhost:1337/get/user/'+$stateParams.id).success(function(user){
			$scope.friend = user;

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

	//Appelle setNote pour toutes les étoiles et récupère le nb de votes
	$scope.initNotes = function(){

		$http.get('http://localhost:1337/getDetailledGrades/'+$scope.friend.id).success(function(data){
			console.log(data);
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




	//Affiche correctement le nombre de votes
	$scope.displayNotes = function(){
		if($scope.friend.nbGrades<=1)
			return $scope.friend.nbGrades+" personne";
		else
			return $scope.friend.nbGrades+ " personnes";
	}

	$scope.initNotes();

	$scope.acceptInvitation = function (yesNo, userId){
		if(yesNo){
			//SEND ACCEPTATION
		}
		else{
			//SEND REFUSATION
		}
		

	}

})