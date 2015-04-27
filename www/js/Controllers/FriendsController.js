angular.module('friends',[])
.controller('FriendsCtrl',function($scope, $localStorage, $http, $location){
  $http.post('http://localhost:1337/checkConnect',{id:$localStorage.user.id}).success(function(){    // Check if connected
  }).error(function(){
    $location.path('/login');
  });
  $scope.user = $localStorage.user;
  switchIcon('icon_friend','search');
  $scope.friends = $localStorage.friends;

  $scope.addFavorite = function(target){
    console.log('hello');
    var targetPosition = -1;
    angular.forEach($localStorage.friends,function(friend,index){
      if(friend.id == target){
        targetPosition = index;
      }
    });
    if($scope.friends[targetPosition].statut==0){
     console.log("Wrong");
     $http.post('http://localhost:1337/addFavorite',{id1: $localStorage.user.id, id2: target}).success(function(){
      $scope.friends[targetPosition].statut = 1;
    }).error(function(){
      console.log('error');
    });
  }
  else if($scope.friends[targetPosition].statut==1){
    console.log("RIght");
    $http.post('http://localhost:1337/removeFavorite',{id1: $localStorage.user.id, id2: target}).success(function(){
      $scope.friends[targetPosition].statut = 0;
    }).error(function(){
      console.log('error');
    });
  }
} 
})

.controller('ChatCtrl', function($scope, $localStorage){
    $scope.user = $localStorage.user;
    switchIcon('icon_none','');
})