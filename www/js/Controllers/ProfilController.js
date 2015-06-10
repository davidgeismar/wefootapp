angular.module('profil',[]).controller('ProfilCtrl', function($scope,$stateParams, $location, $http, $localStorage){
  $scope.user = $localStorage.user;
  switchIcon('icon_none','');

	var done = false;
	if(!$localStorage.initialPos){
		$localStorage.initialPos = $('.logo-profil-container').css('left');
		$localStorage.initialPos = parseInt($localStorage.initialPos.substring(0,3)); //Get the position in integer without px;
	}
	var initialPos = $localStorage.initialPos;
	$scope.moveBall = function($event){
		var targetPos = initialPos+$event.gesture.deltaX;
		var velocity = $event.gesture.velocityX;
		// var rotation= (initialPos-targetPos)*360/initialPos;
		console.log($event.gesture.velocityX);
		if(targetPos>initialPos/1.5 && $event.gesture.velocityX<1.5 && !done){
			$('.logo-profil-container').css({'left': (targetPos)});
											 // '-webkit-transform': 'rotate('+rotation+'deg)'});
		}
		else if (!done){
			// $('.logo-profil-container').animate({borderSpacing : 300 }, {
   //  			step: function(now,fx) {
   //  				if(fx.prop="borderSpacing"){
   //    					$(this).css('-webkit-transform','rotate('+now+'deg)'); 
   //    					$(this).css('-moz-transform','rotate('+now+'deg)');
   //    					$(this).css('transform','rotate('+now+'deg)');
   //    					$(this).css({'left': 80-now/3});
   //    				}
   //  			},
   //  			duration:300
			// 	},'linear');
			$('.logo-profil-container').animate({left: 0 },initialPos/(1.5*velocity),function(){
				$location.path('/');
			});
				done = true;  										//Do it just on time
		}
		// else if(!done){
		// 	$('.logo-profil-container').animate({
		// 		left: 0
		// 	},300);
		// 	done = true;
		// }

	}
		$scope.moveBallRight = function($event){
			var targetPos = initialPos+$event.gesture.deltaX;
			var velocity = $event.gesture.velocityX;
			var sizeElem = parseInt($('.logo-profil-container').css('width').substring(0,2));
			if(targetPos<initialPos*1.6 && $event.gesture.velocityX<1.5 && !done){
				$('.logo-profil-container').css({'left': (targetPos)});
			}
			else if (!done){
				$('.logo-profil-container').animate({left: window.innerWidth-sizeElem},initialPos/(1.6*velocity),function(){
					$location.path('/footfield');
				});
					done = true;  										//Do it just on time
			}
		}
		$scope.endAction = function($event){
			console.log('heelo');
			var currentX = parseInt($('.logo-profil-container').css('left').substring(0,3));
			console.log(currentX);
			if(currentX>initialPos*1.6)
				$location.path('/footfield')
			else if(currentX<initialPos/1.6)
				$location.path('/')
			else if(!done){
				$('.logo-profil-container').css({'left': initialPos});
				console.log('here');
			}

		}
})