angular.module('note',[])
.controller('NoteCtrl',function($scope, $localStorage, $rootScope,  $http, $location, $stateParams, $ionicPopup, $validated){

	$scope.activate = [false, false, false, false, false];
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

	$scope.friend = _.find($localStorage.getArray('friends'), function(friend){ return friend.id == $stateParams.id; });

	$scope.init = function(){
		$scope.initBypass = true;
		$http.get(serverAddress+'/getGrade/'+$localStorage.getObject('user').id+'/'+$scope.friend.id).success(function(response){
			if(response.length==0){
				for(var i = 0; i<5; i++){
					$scope.setNote(0,i);
				}
			}
			else
			{	
				$scope.setNote(response[0].technique, 0);
				$scope.setNote(response[0].frappe, 1);
				$scope.setNote(response[0].physique, 2);
				$scope.setNote(response[0].fair_play, 3);
				$scope.setNote(response[0].assiduite, 4);
			}
		});

	}

	$scope.init();

	$scope.enableNote = function(target){
		$scope.activate[target] = true;
	}

	$scope.setNote = function(note, target){
		$scope.notes[target] = note;
		for(var i=0; i<5; i++) {
			if(i+1<=note)
				$scope.starStatus[target][i] = "ion-android-star";
			else
				$scope.starStatus[target][i] = "ion-android-star-outline";
		}
	}

	$scope.postNote = function(){
		var cpt = 0;
		for(var i=0; i<5; i++) {
			if($scope.notes[i]==0)
				cpt++;
		}
		if (cpt==5){
			return 0;
		}
		else
		{
			$http.post(serverAddress+'/Notation/grade',{noteur: $localStorage.getObject('user').id, note: $scope.friend.id, technique:$scope.notes[0],frappe:$scope.notes[1],physique:$scope.notes[2],fair_play:$scope.notes[3],assiduite:$scope.notes[4] }).success(function(){
				for(var i=0; i<5; i++) {
					$scope.activate[i] = false;
				}
				$validated.show({texte: "Vos notes ont bien été enregistrées", icon: "ion-checkmark-round"},function(){
					$location.path('/friend/'+$scope.friend.id);
				});		
			});

		}
	}


})