angular.module('note',[])
.controller('NoteCtrl',function($scope, $localStorage, $rootScope,  $http, $location){

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

	$scope.initBypass = true;

	$scope.friend = $localStorage.friend;

	$scope.init = function(){
	$scope.initBypass = true;
					$http.get('http://localhost:1337/getGrade/'+$localStorage.user.id+'/'+$localStorage.friend.id).success(function(response){
						console.log(response);
						if(response.length==0){
							console.log("here");
							for(var i = 0; i<5; i++){
								$scope.setNote(0,i);
							}
							$scope.initBypass = false;
						}
						else
						{	
							$scope.setNote(response[0].technique, 0);
							$scope.setNote(response[0].frappe, 1);
							$scope.setNote(response[0].physique, 2);
							$scope.setNote(response[0].fair_play, 3);
							$scope.setNote(response[0].assiduite, 4);
							$scope.initBypass = false;
						}
			}).error(function(){
				console.log('error');
			});
			
	}

	$scope.init();

	$scope.enableNote = function(target){
		$scope.activate[target] = true;
	}

	$scope.setNote = function(note, target){
		if($scope.activate[target] || $scope.initBypass){
			$scope.notes[target] = note;
			console.log('test note'+note);
			for(var i=0; i<5; i++) {
				if(i+1<=note)
					$scope.starStatus[target][i] = "ion-android-star";
				else
					$scope.starStatus[target][i] = "ion-android-star-outline";
			}
		}
	}

	$scope.postNote = function(){
		var cpt = 0;
		for(var i=0; i<5; i++) {
			if($scope.activate[i]==false)
				cpt++;
		}
		if (cpt==5){
			console.log("test1")
			return 0;
		}
		else
		{
			console.log($scope.notes[0]);
			$http.post('http://localhost:1337/Notation/grade',{noteur: $localStorage.user.id, note: $localStorage.friend.id, technique:$scope.notes[0],frappe:$scope.notes[1],physique:$scope.notes[2],fair_play:$scope.notes[3],assiduite:$scope.notes[4] }).success(function(){

			}).error(function(){
				console.log('error');
			});


			for(var i=0; i<5; i++) {
				$scope.activate[i] = false;
			}

		}
	}

	$scope.activation = function(target){
		if($scope.activate[target]){
			return "hide-icon";
		}
	}


})