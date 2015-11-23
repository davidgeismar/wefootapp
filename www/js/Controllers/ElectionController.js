angular.module('election',[]).controller('ElectionCtrl', function($http, $scope, $ionicPopup, $localStorage, $location, $stateParams ,$ionicLoading){

	$scope.homme;
	$scope.chevre;
	$scope.foot = $localStorage.footSelected;
	$scope.usersSelected = new Array();
	$scope.user = $localStorage.getObject('user');
	$scope.alreadyVoted = true;

	$scope.users;

	$scope.foot = { id : $stateParams.id};

	$ionicLoading.show({
		content: 'Loading Data',
		animation: 'fade-out',
		showBackdrop: false
	});

	$scope.selectedOrNot = function(hommeOuChevre, userId){
		if(hommeOuChevre=='homme'){
			if($scope.homme==userId){
				return true;
			}
			else
				return false;
		}
		else if (hommeOuChevre=='chevre'){
			if($scope.chevre==userId)
				return true;
			else
				return false;
		}
	}

	$scope.select = function(hommeOuChevre,userId){
		if(hommeOuChevre=='homme'){
			if($scope.chevre!=userId)
			$scope.homme = userId;
		}
		else
			if($scope.homme!=userId)
			$scope.chevre = userId;
	}


	$scope.elir = function(){
		if($scope.homme || $scope.chevre){
			$http.post(serverAddress+'/vote/create',{electeur:$scope.user.id, homme:$scope.homme, chevre:$scope.chevre, foot:$scope.foot.id}).success(function(){

				$scope.showConfirmation();
			}).error(function(){
				console.log('err');
			});
		}
		if(!$scope.chevre && !$scope.homme){
			console.log("choisir des elus");
		}
	}

	$scope.init = function(){
		$http.get(serverAddress+'/getVotedStatus/'+$scope.user.id+'/'+$scope.foot.id).success(function(result){
				//result (vrai == déjà voté, faux == pas encore voté)
				if(!result){
					$scope.alreadyVoted = false;
					$ionicLoading.hide();
			//On récupère les joueurs d'un match
			$http.get(serverAddress+'/getVoters/'+$scope.foot.id).success(function(results){
				$scope.users = results;
			}).error(function(){
				console.log('err');
			});

			$http.get(serverAddress+'/foot/getInfo/'+$scope.foot.id).success(function(elem){
				$scope.foot.organisator = elem.orga;
				$scope.foot.orgaName = elem.orgaName;
				$scope.foot.field = elem.field;
				$scope.foot.date = getJour(new Date(elem.field.date))+' '+getHour(new Date(elem.field.date));
			}).error(function(err){
				console.log(err);
			});
		}
		else{
			$ionicLoading.hide();
			$scope.showAlert();
			//AJOUTER UNE ALERTE
		}
	});
	}

	$scope.init();


	$scope.showConfirmation = function() {
		var alertPopup = $ionicPopup.alert({
			title: 'Confirmation du vote',
			template: 'Votre vote a bien été enregistré',
			okText: '', 
			okType: '',
			cssClass: ''
		});
		alertPopup.then(function(res) {
			$location.path('/user/notif');
		});
	}

	$scope.showAlert = function() {
		var alertPopup = $ionicPopup.alert({
			title: 'Déjà voté',
			template: 'Vous avez déjà voté pour ce foot',
			okText: '', 
			okType: '',
			cssClass: ''
		});
		alertPopup.then(function(res) {
			$location.path('/user/notif');
		});
	}
})
