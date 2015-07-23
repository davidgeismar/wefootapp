angular.module('friends',[])
.controller('FriendsCtrl',function($scope, $localStorage, $rootScope,  $http, $location){
$scope.user = $localStorage.user;
$rootScope.friends = $localStorage.friends;

$scope.addFavorite = function(target){
  var targetPosition = -1;
  angular.forEach($localStorage.friends,function(friend,index){
    if(friend.id == target){
      targetPosition = index;
    }
  });
  if($rootScope.friends[targetPosition].statut==0){
   $http.post(serverAddress+'/addFavorite',{id1: $localStorage.user.id, id2: target}).success(function(){
    $rootScope.friends[targetPosition].statut = 1;
    console.log('here1');
  });
}
else if($rootScope.friends[targetPosition].statut==1){
  $http.post(serverAddress+'/removeFavorite',{id1: $localStorage.user.id, id2: target}).success(function(){
    $rootScope.friends[targetPosition].statut = 0;
  });
}
}

$scope.refresh = function(){
  if($localStorage.friends.length == 0)
    var maxId = 0;
  else
    var maxId = _.max($localStorage.friends, function(friend){return friend.friendship}).friendship;

  $http.get(serverAddress+'/getAllFriends/'+$localStorage.user.id+'/'+maxId).success(function(data){
    $localStorage.friends.concat(data);
    $scope.$broadcast('scroll.refreshComplete');
  });
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