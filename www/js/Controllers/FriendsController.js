angular.module('friends',[])
.controller('FriendsCtrl',function($scope, $localStorage, $rootScope,  $http, $location){
$scope.user = $localStorage.getObject('user');
$rootScope.friends = $localStorage.getObject('friends');
console.log($rootScope.friends);
$scope.addFavorite = function(target){
  var targetPosition = -1;
  angular.forEach($localStorage.getObject('friends'),function(friend,index){
    if(friend.id == target){
      targetPosition = index;
    }
  });
  if($rootScope.friends[targetPosition].statut==0){
   $http.post('http://'+serverAddress+'/addFavorite',{id1: $localStorage.getObject('user').id, id2: target}).success(function(){
    $rootScope.friends[targetPosition].statut = 1;
    console.log('here1');
  });
}
else if($rootScope.friends[targetPosition].statut==1){
  $http.post('http://'+serverAddress+'/removeFavorite',{id1: $localStorage.getObject('user').id, id2: target}).success(function(){
    $rootScope.friends[targetPosition].statut = 0;
  });
}
}

$scope.refresh = function(){
  $http.get('http://'+serverAddress+':9000/getAllFriends/'+$localStorage.getObject('user').id+'/'+0).success(function(data){
    if(data.length>0) $localStorage.newFriend = true; //Load his data on refresh actu
    $localStorage.setObject('friends',data);
    $scope.$broadcast('scroll.refreshComplete');
  });
}

$scope.goFriend = function(friend){
  $location.path('/friend/'+friend.id);
}
})