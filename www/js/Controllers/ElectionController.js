angular.module('election',[]).controller('ElectionCtrl', function($http, $scope, $ionicPopup, $localStorage){

	$scope.homme;
	$scope.chevre;
	$scope.foot = $localStorage.footSelected;
	$scope.usersSelected = new Array();
	$scope.user = $localStorage.user;
	$scope.users;

	$scope.selectedOrNot = function(hommeOuChevre, userId){
		if(hommeOuChevre=='homme'){
			if($scope.homme==userId)
				return "trophe_selected";
			else
				return "trophe";
		}
		else if (hommeOuChevre=='chevre'){
			if($scope.chevre==userId)
				return "chevre_selected";
			else
				return "chevre";

		}
	}


		$scope.electionPlayer = function(homme, chevre, user){
			var cpt = 0;
			if(homme){
				$http.post('http://localhost:1337/election/create',{electeur:$localStorage.user.id, elu:user, note:homme, foot:$scope.foot}).success(function(){
					console.log('success');
					cpt++;
					if((cpt==1 && !chevre) || (cpt == 2 && chevre))
						$scope.showAlert();
				}).error(function(){
					console.log('err');
				});
			}
			if(chevre){
				$http.post('http://localhost:1337/election/create',{electeur:$localStorage.user.id, elu:user, note:chevre, foot:$scope.foot}).success(function(){
					console.log('success');
					cpt++;
					if((cpt==1 && !homme) || (cpt == 2 && homme))
						$scope.showAlert();
				}).error(function(){
					console.log('err');
				});
			}
			if(!chevre && !homme){
				console.log("choisir des elus");
			}
		}

		$scope.elir = function(){
			var cpt = 0;
			if($scope.homme){
				$http.post('http://localhost:1337/election/create',{electeur:$localStorage.user.id, elu:$scope.homme, note:1, foot:$scope.foot}).success(function(){
					console.log('success');
					cpt++;
					if((cpt==1 && !$scope.chevre) || (cpt == 2 && $scope.chevre))
						$scope.showAlert();
				}).error(function(){
					console.log('err');
				});
			}
			if($scope.chevre){
				$http.post('http://localhost:1337/election/create',{electeur:$localStorage.user.id, elu:$scope.chevre, note:2, foot:$scope.foot}).success(function(){
					console.log('success');
					cpt++;
					if((cpt==1 && !$scope.homme) || (cpt == 2 && $scope.homme))
						$scope.showAlert();
				}).error(function(){
					console.log('err');
				});
			}
			if(!$scope.chevre && !$scope.homme){
				console.log("choisir des elus");
			}

		}
		$scope.getUsers = function(){
			$http.get('http://localhost:1337/getVoters'+$localStorage.footSelected.id).success(function(results){
				$scope.users = results;
			}).error(function(){
				console.log('err');
			});

		}


		$scope.showAlert = function() {
			var alertPopup = $ionicPopup.alert({
				title: 'Confirmation du vote',
				template: 'Votre vote a bien été enregistré',
				okText: '', 
				okType: '',
				cssClass: ''
			});
			alertPopup.then(function(res) {
				$location.path('/user/notif');
				console.log('goBack');
			});
		}
	})
