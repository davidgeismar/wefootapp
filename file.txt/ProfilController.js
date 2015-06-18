angular.module('profil',[]).controller('ProfilCtrl', function($scope,$stateParams, $location, $http, $localStorage,$rootScope,$handleNotif,$ionicLoading){
  $scope.user = $localStorage.user;

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
	$ionicLoading.show({
	    content: 'Loading Data',
	    animation: 'fade-out',
	    showBackdrop: false
	});


//ACTUS SECTION

	getLastId = function(){
		if(!$scope.actusByDay || $scope.actusByDay.length==0)
			return 0;
		else{
			console.log($scope.actusByDay);
			var lastRow = $scope.actusByDay[$scope.actusByDay.length-1];

			return lastRow[lastRow.length-1].id;
		}
	}

	var getAllActu = function(callback3){
	$http.post('http://62.210.115.66:9000/actu/getActu/',{user:$scope.user.id, friends: friends_id, skip:getLastId()}).success(function(data){
		var actusByDay = _.values(data);
		if(actusByDay.length==0) $ionicLoading.hide();
		async.each(actusByDay,function(actus,callback2){
			async.each(actus,function(actu,callback){
				$handleNotif.handleActu(actu,function(){
					callback();
				});
			},function(){
					callback2();
			});
		},function(){
			if($scope.actusByDay){ //On update
				$scope.dates = _.allKeys(data).concat($scope.dates);
				$scope.actusByDay = actusByDay.concat($scope.actusByDay);
			}
			else{
				$scope.actusByDay = actusByDay;
				$scope.dates = _.allKeys(data)
			}
			$ionicLoading.hide();
			if(callback3) callback3();
		});
	});
	}

	getAllActu();

	$scope.refresh = function(){
		getAllActu(function(){
			$scope.$broadcast('scroll.refreshComplete');
		});
	}



})