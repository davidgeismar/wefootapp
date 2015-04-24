angular.module('profil',[])
.controller('ProfilCtrl', function($scope, $stateParams, $location, $http, $localStorage){
  $scope.user = $localStorage.user;
  switchIcon('icon_none','');
  $http.post('http://localhost:1337/checkConnect',{id:$scope.user.id}).success(function(){    // Check if connected
  }).error(function(){
    $location.path('/login');
  });
})