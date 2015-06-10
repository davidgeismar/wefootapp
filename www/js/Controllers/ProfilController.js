angular.module('profil',[]).controller('ProfilCtrl', function($scope,$stateParams, $location, $http, $localStorage,$rootScope,$handleNotif){
  $scope.user = $localStorage.user;
  switchIcon('icon_none','');

	var sizeElem = parseInt($('.logo-profil-container').css('width').substring(0,2));
	var full_screen = window.innerWidth-sizeElem;
	if(!$localStorage.initialPos){
		$localStorage.initialPos = $('.logo-profil-container').css('left');
		$localStorage.initialPos = parseInt($localStorage.initialPos.substring(0,3)); //Get the position in integer without px;
	}
	var initialPos = $localStorage.initialPos;

	$scope.moveBall = function($event){
		var targetPos = initialPos+$event.gesture.deltaX;
		var velocity = $event.gesture.velocityX;
		if(parseInt($('.logo-profil-container').css('left').substring(0,3))>0){
			$('.logo-profil-container').css({'left': (targetPos)});
		}

	}
	$scope.moveBallRight = function($event){
		var targetPos = initialPos+$event.gesture.deltaX;
		var velocity = $event.gesture.velocityX;
		if(parseInt($('.logo-profil-container').css('left').substring(0,3))<full_screen){
			$('.logo-profil-container').css({'left': (targetPos)});
		}
	}
	$scope.endAction = function($event){
		var currentX = parseInt($('.logo-profil-container').css('left').substring(0,3));
		if(currentX>full_screen-50) $location.path('/footfield');
		if(currentX<50) $location.path('/footfinder');
		else{
			$('.logo-profil-container').css({'left': initialPos});
		}
	}
	var friends_id = _.pluck($localStorage.friends,'id');
	$http.post('http://localhost:1337/actu/getActu/',{user:$scope.user.id, friends: friends_id, skip:0}).success(function(data){
		$scope.dates = _.allKeys(data);
		var actusByDay = _.values(data);
		_.each(actusByDay,function(actus,index){
			_.each(actus,function(actu){
				$handleNotif.handleActu(actu);
			});
		if(index==actusByDay.length-1)
			$scope.actusByDay = actusByDay;
		});
	});



})