angular.module('friend',[])
.controller('FriendCtrl',function($scope, $localStorage, $rootScope,  $http, $location){

	$scope.friend = $localStorage.friend;
	$scope.notes = new Array(5);
	$scope.starStatus = new Array(5);

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

		$http.get('http://localhost:1337/getDetailledGrades/'+$localStorage.friend.id).success(function(data){
			console.log(data);
			$scope.friend.nbGrades = data.nbGrades;
			$scope.setNote(data.technique, 0);
			$scope.setNote(data.frappe, 1);
			$scope.setNote(data.physique, 2);
			$scope.setNote(data.fair_play, 3);
			$scope.setNote(data.assiduite, 4);
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




})