angular.module('friends',[])
.controller('FriendsCtrl',function($scope, $localStorage, $rootScope,  $http, $location){
$scope.user = $localStorage.user;
$scope.friends = $localStorage.friends;

$scope.addFavorite = function(target){
  var targetPosition = -1;
  angular.forEach($localStorage.friends,function(friend,index){
    if(friend.id == target){
      targetPosition = index;
    }
  });
  if($scope.friends[targetPosition].statut==0){
   $http.post('http://localhost:1337/addFavorite',{id1: $localStorage.user.id, id2: target}).success(function(){
    $scope.friends[targetPosition].statut = 1;
    console.log('here1');
  }).error(function(){
    console.log('error');
  });
}
else if($scope.friends[targetPosition].statut==1){
  $http.post('http://localhost:1337/removeFavorite',{id1: $localStorage.user.id, id2: target}).success(function(){
    $scope.friends[targetPosition].statut = 0;
  }).error(function(){
    console.log('error');
  });
}
}

$scope.goFriend = function(friend){
  $location.path('/friend/'+friend.id);
}
$rootScope.openModal = function() {
  $rootScope.modal.show();
};

$rootScope.closeModal = function() {
  $rootScope.modal.hide();
}; 
})