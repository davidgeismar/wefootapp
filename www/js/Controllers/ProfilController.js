angular.module('profil',[]).controller('ProfilCtrl', function($scope,$stateParams, $location, $http, $localStorage,$rootScope,$handleNotif,$ionicLoading,$profil){
  $scope.user = $localStorage.getObject('user');
  	//SLIDER BALL
	var sizeElem = parseInt($('.logo-profil-container').css('width').substring(0,2));
	var full_screen = window.innerWidth-sizeElem;
	if(!$localStorage.initialPos){
		$localStorage.initialPos = $('.logo-profil-container').css('left');
		$localStorage.initialPos = parseInt($localStorage.initialPos.substring(0,3)); //Get the position in integer without px;
	}
	var initialPos = $localStorage.initialPos;

	$scope.moveBall = function($event){
		var targetPos = initialPos+$event.gesture.deltaX;
		if(parseInt($('.logo-profil-container').css('left').substring(0,3))>0){
			$('.logo-profil-container').css({'left': (targetPos)});
		}
	}
	$scope.moveBallRight = function($event){
		var targetPos = initialPos+$event.gesture.deltaX;
		if(parseInt($('.logo-profil-container').css('left').substring(0,3))<full_screen){
			$('.logo-profil-container').css({'left': (targetPos)});
		}
	}
	$scope.endAction = function($event){
		var currentX = parseInt($('.logo-profil-container').css('left').substring(0,3));
		if(currentX>full_screen-50) $location.path('/footfield');
		if(currentX<50) $location.path('/footfinder');
		$('.logo-profil-container').css({'left': initialPos});
	}

	$scope.go = function(url){
		$location.path(url);
	};

	//SET WIDTH CONTENT

	var height = window.innerHeight - $('.main_actu').height() - $('.slider-button').height() - 90;
	$('.container_actu').find('.scroll').height(height);
	var setPositon = $('.main_actu').height() + $('.slider-button').height()+3; //Paddings
	$('.container_actu').css('top',setPositon);

//ACTUS SECTION
	$scope.actusByDay = $localStorage.getObject('actus');	
	$scope.dates = $localStorage.getObject('dates');

	$profil.getAllActu(function(){
		$scope.actusByDay = $localStorage.getObject('actus');
		$scope.dates = $localStorage.getObject('dates');
	});

	$scope.refresh = function(){
		$profil.getAllActu(function(){
			$scope.actusByDay = $localStorage.getObject('actus');
			$scope.dates = $localStorage.getObject('dates');
			$scope.$broadcast('scroll.refreshComplete');
		});
	}



})