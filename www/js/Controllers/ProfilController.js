angular.module('profil',[]).controller('ProfilCtrl', function($scope,$stateParams, $location, $http, $localStorage,$rootScope){
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
			// if(currentX<initialPos/1.5){
			// 	$('.logo-profil-container').animate({
			//  		left: 0
			// 	 	},300,function(){
			// 	 		$location.path('/');
			// 	 	});
			// }
			// if(currentX>initialPos*1.5){
			// 	$('.logo-profil-container').animate({
			//  		left: full_screen
			// 	 	},300);
			// 		setTimeout(function(){
			// 	 		$location.path('/footfield');
			// 	 	},300);
			// }
			else{
				$('.logo-profil-container').css({'left': initialPos});
			}
		}
})