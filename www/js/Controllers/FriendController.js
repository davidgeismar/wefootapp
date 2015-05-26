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

	//Initialise le
	$scope.init = function(){

		$scope.setNote($scope.friend.technique, 0);
		$scope.setNote($scope.friend.frappe, 1);
		$scope.setNote($scope.friend.physique, 2);
		$scope.setNote($scope.friend.fair_play, 3);
		$scope.setNote($scope.friend.assiduite, 4);


	}


	//récupère 
	$scope.getNbNotes = function(){
		$http.get('http://localhost:1337/getNbGrades/'+$scope.friend.id).success(function(data){
			$scope.friend.nbGrades = data.nbGrades;
		}).error(function(){
			console.log('error');
		});
	}

	$scope.displayNotes = function(){
		if($scope.friend.nbGrades<=1)
			return $scope.friend.nbGrades+" personne";
		else
			return $scope.friend.nbGrades+ " personnes";
	}

	$scope.init();
	$scope.getNbNotes();




})