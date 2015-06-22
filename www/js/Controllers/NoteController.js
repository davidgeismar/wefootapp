angular.module('note',[])
.controller('NoteCtrl',function($scope, $localStorage, $rootScope,  $http, $location, $stateParams, $ionicPopup){

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

	$scope.friend = getStuffById($stateParams.id,$localStorage.friends);

	$scope.init = function(){
		$scope.initBypass = true;
		$http.get('http://62.210.115.66:9000/getGrade/'+$localStorage.user.id+'/'+$scope.friend.id).success(function(response){
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
		});

	}

	$scope.init();

	$scope.enableNote = function(target){
		$scope.activate[target] = true;
	}

	$scope.setNote = function(note, target){
		if($scope.activate[target] || $scope.initBypass){
			$scope.notes[target] = note;
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
			return 0;
		}
		else
		{

			$http.post('http://62.210.115.66:9000/Notation/grade',{noteur: $localStorage.user.id, note: $scope.friend.id, technique:$scope.notes[0],frappe:$scope.notes[1],physique:$scope.notes[2],fair_play:$scope.notes[3],assiduite:$scope.notes[4] }).success(function(){
				for(var i=0; i<5; i++) {
					$scope.activate[i] = false;
				}
				$scope.showAlert();

			});

		}
	}

	$scope.activation = function(target){
		if($scope.activate[target]){
			return "hide-icon";
		}
	}

	$scope.showAlert = function() {
		var alertPopup = $ionicPopup.alert({
			title: 'Confirmation des notes',
			template: 'Vos notes ont bien été enregistrées',
			okText: '', 
			okType: '',
			cssClass: ''
		});
		alertPopup.then(function(res) {
			$location.path('/friend/'+$scope.friend.id);
		});
	}


})