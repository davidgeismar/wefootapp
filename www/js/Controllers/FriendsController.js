angular.module('friends',[])
.controller('FriendsCtrl',function($scope, $localStorage, $rootScope,  $http, $location){
$scope.user = $localStorage.getObject('user');
$scope.friends = $localStorage.friends;

$scope.addFavorite = function(target){
  var targetPosition = -1;
  angular.forEach($localStorage.friends,function(friend,index){
    if(friend.id == target){
      targetPosition = index;
    }
  });
  if($scope.friends[targetPosition].statut==0){
   $http.post('http://62.210.115.66:9000/addFavorite',{id1: $localStorage.getObject('user').id, id2: target}).success(function(){
    $scope.friends[targetPosition].statut = 1;
    console.log('here1');
  });
}
else if($scope.friends[targetPosition].statut==1){
  $http.post('http://62.210.115.66:9000/removeFavorite',{id1: $localStorage.getObject('user').id, id2: target}).success(function(){
    $scope.friends[targetPosition].statut = 0;
  });
}
}

$scope.refresh = function(){
  if($localStorage.friends.length == 0)
    var maxId = 0;
  else
    var maxId = _.max($localStorage.friends, function(friend){return friend.friendship}).friendship;

  $http.get('http://62.210.115.66:9000/getAllFriends/'+$localStorage.getObject('user').id+'/'+maxId).success(function(data){
    if(data.length>0) $localStorage.newFriend = true; //Load his data on refresh actu
    $localStorage.friends.concat(data);
    $scope.$broadcast('scroll.refreshComplete');
  });
}

$scope.goFriend = function(friend){
  $location.path('/friend/'+friend.id);
}
})