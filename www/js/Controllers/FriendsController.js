angular.module('friends',[])
.controller('FriendsCtrl',function($scope, $localStorage, $rootScope,  $http, $location){

 var clean =  function(s) {

  var r=s.toLowerCase();
  r = r.replace(new RegExp(/\s/g),"");
  r = r.replace(new RegExp(/[àáâãäå]/g),"a");
  r = r.replace(new RegExp(/æ/g),"ae");
  r = r.replace(new RegExp(/ç/g),"c");
  r = r.replace(new RegExp(/[èéêë]/g),"e");
  r = r.replace(new RegExp(/[ìíîï]/g),"i");
  r = r.replace(new RegExp(/ñ/g),"n");                
  r = r.replace(new RegExp(/[òóôõö]/g),"o");
  r = r.replace(new RegExp(/œ/g),"oe");
  r = r.replace(new RegExp(/[ùúûü]/g),"u");
  r = r.replace(new RegExp(/[ýÿ]/g),"y");
  r = r.replace(new RegExp(/\W/g),"");
  return r;

}

$scope.user = $localStorage.getObject('user');
$rootScope.friends = $localStorage.getArray('friends');
$scope.results = $rootScope.friends;

$scope.addFavorite = function(target){

  var targetPosition = _.pluck($rootScope.friends, 'id').indexOf(target);
  if(targetPosition>-1){
    if($rootScope.friends[targetPosition].statut==0){
     $rootScope.friends[targetPosition].statut = 1;
     $http.post(serverAddress+'/addFavorite',{id1: $localStorage.getObject('user').id, id2: target}).error(function(){
      $rootScope.friends[targetPosition].statut = 0;
    });
   }
   else if($rootScope.friends[targetPosition].statut==1){
    $rootScope.friends[targetPosition].statut = 0;
    $http.post(serverAddress+'/removeFavorite',{id1: $localStorage.getObject('user').id, id2: target}).error(function(){
      $rootScope.friends[targetPosition].statut = 1;
    });
  }
}
}

$scope.refresh = function(){
  $http.get(serverAddress+'/getAllFriends/'+$localStorage.getObject('user').id+'/'+0).success(function(data){
    var nb = $rootScope.friends.length;
    var friends = data[0];
    if(data[0].length==0){
      $rootScope.friends = friends;
      $localStorage.setObject('friends',friends);
      $scope.results = $rootScope.friends;
      $scope.$broadcast('scroll.refreshComplete');
      return;
    }
    angular.forEach(friends,function(friend,index){   // Add attribute statut to friends to keep favorite
      friend.statut = data[1][index].stat; 
      friend.friendship = data[1][index].friendship;
      if(index == friends.length-1){
        if(!angular.equals(friends, $rootScope.friends))
          $rootScope.friends = friends;
        $scope.results = $rootScope.friends;
        $localStorage.newFriend = true; //Load his data on refresh actu
        $localStorage.setObject('friends',friends);
        $scope.$broadcast('scroll.refreshComplete');
      }
    });
  });
}

$scope.refresh();

$scope.goFriend = function(friend){
  $location.path('/friend/'+friend.id);
}

$scope.deleteFriend = function(friendId){
  var index = _.pluck($rootScope.friends, 'id').indexOf(friendId);
  if(index>-1){
    $http.post(serverAddress+'/friendship/deleteFriend',{user1: $localStorage.getObject('user').id, user2: friendId}).success(function(){
      $rootScope.friends.splice(index, 1);
      $localStorage.setObject('friends',$rootScope.friends);
      $localStorage.newFriend = true;
    });
  }
}

$scope.filterFriend = function(word) {
    var word = clean(word);
    var results = [];
    _.each($rootScope.friends, function(friend,index){
      if(friend.full_name.indexOf(word)>-1)
        results.push(friend)
      if(index == $rootScope.friends.length-1)
        $scope.results = results;
    });
}

})