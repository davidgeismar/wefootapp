angular.module('profil',[])
.controller('ProfilCtrl', function($scope, $location, $http, $localStorage){
  // $scope.user = $localStorage.user;
  // switchIcon('icon_none','');
  // $http.post('http://localhost:1337/checkConnect',{id:$scope.user.id}).success(function(){    // Check if connected
  // }).error(function(){
  //   $location.path('/login');
  // });
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
			$('.logo-profil-container').animate({left: 0 },initialPos/(1.5*velocity));
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
			if(targetPos<initialPos*1.5 && $event.gesture.velocityX<1.5 && !done){
				$('.logo-profil-container').css({'left': (targetPos)});
			}
			else if (!done){
				$('.logo-profil-container').animate({left: window.innerWidth-sizeElem},initialPos/(1.5*velocity));
					done = true;  										//Do it just on time
			}
		}
		$scope.endAction = function($event){
			console.log(initialPos);
			var currentX = parseInt($('.logo-profil-container').css('left').substring(0,3));
			console.log(currentX);
			if(currentX>initialPos*1.5)
				$location.path('/footfield')
			else if(currentX<initialPos/1.5)
				$location.path('/')
			else
				$('.logo-profil-container').css({'left': initialPos});

		}


})