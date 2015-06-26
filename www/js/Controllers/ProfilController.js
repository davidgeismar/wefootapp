angular.module('profil',[]).controller('ProfilCtrl', function($scope,$stateParams, $location, $http, $localStorage,$rootScope,$handleNotif,$ionicLoading){
  $scope.user = $localStorage.user;
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
	$ionicLoading.show({
	    content: 'Loading Data',
	    animation: 'fade-out',
	    showBackdrop: false
	});

	$scope.go = function(url){
		$location.path(url);
	};



	//SET WIDTH CONTENT

	var height = window.innerHeight - $('.main_actu').height() - $('.slider-button').height() - 90;
	$('.container_actu').find('.scroll').height(height);
	var setPositon = $('.main_actu').height() + $('.slider-button').height()+3; //Paddings
	$('.container_actu').css('top',setPositon);

//ACTUS SECTION

	getLastId = function(){
		if(!$scope.actusByDay || $scope.actusByDay.length==0 || $localStorage.newFriend){
			$localStorage.newFriend = false;
			return 0;
		}
		else{
			return $scope.actusByDay[0][0].id;
		}
	}

	var getAllActu = function(callback3){
	var friends_id = _.pluck($localStorage.friends,'id');
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
				var indexOldDates = [];
				var newElems = [];  //Keep new elems to replace them in the right order
				var count = -1;
				_.each(data,function(array,index){ //Index = a date here
					count++;
					if($scope.dates.indexOf(index)>-1)			//contained in $scope.dates.
						$scope.actusByDay[$scope.dates.indexOf(index)] =array.concat($scope.actusByDay[$scope.dates.indexOf(index)]);
					else{
						newElems.push(array);
					}
					if(count == _.allKeys(data).length-1){
						console.log('here');
						for(i = newElems.length-1; i>-1; i--){ //Concatenate 2 2D Arrays
							console.log(newElems[i]);
							$scope.actusByDay.unshift(newElems[i]);
						}
						console.log($scope.actusByDay);
					}
				});
				$scope.dates = _.union(_.allKeys(data),$scope.dates);

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