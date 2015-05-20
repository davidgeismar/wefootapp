angular.module('profil',[])
.controller('ProfilCtrl', function($scope, $location, $http, $localStorage){
  $scope.user = $localStorage.user;
  switchIcon('icon_none','');
  $http.post('http://localhost:1337/checkConnect',{id:$scope.user.id}).success(function(){    // Check if connected
  }).error(function(){
    $location.path('/login');
  });

  $scope.moveIt = function(){
  	console.log('hello');
  	var moveBack = move('.logo-profil-container')
  		.x(0);
  	move('.logo-profil-container')
  		.x(-100)
  		.then(moveBack)
  		.end();
  }

})