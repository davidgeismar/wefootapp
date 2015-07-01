angular.module('friends',[])
.controller('FriendsCtrl',function($scope, $localStorage, $rootScope,  $http, $location){
  $scope.user = $localStorage.getObject('user');
  $rootScope.friends = $localStorage.getObject('friends');

  $scope.addFavorite = function(target){

    var targetPosition = _.pluck($rootScope.friends, 'id').indexOf(target);
    if(targetPosition>-1){
      if($rootScope.friends[targetPosition].statut==0){
       $http.post('http://'+serverAddress+'/addFavorite',{id1: $localStorage.getObject('user').id, id2: target}).success(function(){
        $rootScope.friends[targetPosition].statut = 1;
      });
     }
     else if($rootScope.friends[targetPosition].statut==1){
      $http.post('http://'+serverAddress+'/removeFavorite',{id1: $localStorage.getObject('user').id, id2: target}).success(function(){
        $rootScope.friends[targetPosition].statut = 0;
      });
    }
  }
}

$scope.refresh = function(){
  $http.get('http://'+serverAddress+'/getAllFriends/'+$localStorage.getObject('user').id+'/'+0).success(function(data){
    if(data.length>0) $localStorage.newFriend = true; //Load his data on refresh actu
    $localStorage.setObject('friends',data);
    $scope.$broadcast('scroll.refreshComplete');
  });
}

$scope.goFriend = function(friend){
  $location.path('/friend/'+friend.id);
}

$scope.deleteFriend = function(friendId){
  var index = _.pluck($rootScope.friends, 'id').indexOf(friendId);
  if(index>-1){
    $http.post('http://'+serverAddress+'/friendship/deleteFriend',{user1: $localStorage.getObject('user').id, user2: friendId}).success(function(){
      $rootScope.friends.splice(index, 1);
      $localStorage.setObject('friends',$rootScope.friends);
    });
  }
}


})