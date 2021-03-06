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

  // var swiping = function(){
  //   $( ".main_actu" ).on( "swipe", $("body").removeClass("menu-open") );
  //   console.log('I am here');
  // }

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

  // function leftSwipe() {
  //   console.log("hello");
  // };
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
		if($scope.actusByDay.length == 0){  // set default actu
			$scope.actusByDay.push([{"id":-1,"typ":"WF","texte":"Bienvenu sur Wefoot, ceci est votre timeline.","picture":"img/logo.jpg"}]);
			$scope.actusByDay[0].unshift({"id":0,"typ":"WF","texte":"Commencez par ajouter vos potes dans l'onglet mes amis. ","picture":"img/nav_amis_bleu.jpg"});
			var createdAt  = $localStorage.getObject('user').createdAt;
			$scope.dates.push(moment(createdAt).locale('fr').format('L'));
		}
	});

	$scope.refresh = function(){
		$profil.getAllActu(function(){
			$scope.actusByDay = $localStorage.getObject('actus');
			$scope.dates = $localStorage.getObject('dates');
			$scope.$broadcast('scroll.refreshComplete');
		});
	}
})
