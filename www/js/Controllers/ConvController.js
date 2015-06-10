angular.module('conv',[]).controller('ConvCtrl', function($http, $scope, $rootScope, $localStorage, $ionicModal, $ionicScrollDelegate){

  $scope.chat = $localStorage.chat;
  $scope.user = $localStorage.user;
  $scope.messageContent;
  $scope.details;
  io.socket.post('http://localhost:1337/chatter/updateLts',{user: $localStorage.user.id, chat: $scope.chat.id});
  $localStorage.chats[getIndex($scope.chat.id, $localStorage.chats)].lastTime = new Date();
  $ionicScrollDelegate.scrollBottom();
$rootScope.updateMessage = function(){
  $scope.$digest();
  $ionicScrollDelegate.scrollBottom();
  io.socket.post('http://localhost:1337/chatter/updateLts',{user: $localStorage.user.id, chat: $scope.chat.id});
}


  $scope.sendMessage = function(message){
   // if(message.length>0){
     $http.post('http://localhost:1337/message/create',{senderId :$localStorage.user.id, messagestr:message, chat:$scope.chat.id, receivers:$scope.chat.users}).success(function(data){
      $scope.messageContent=null;
      $ionicScrollDelegate.scrollBottom();
    }).error(function(err){
      console.log(err);
    });
  // }
}

$scope.showMessageButton= function(messageContent){
	if(messageContent==0 || !messageContent) return "hide-icon";
}

//Vérifier si FOOT ou DEFI
$scope.init = function(){

  $http.get('http://localhost:1337/foot/getInfo/'+1).success(function(elem){
    $scope.details.organisator = elem.orga;
    $scope.details.orgaName = elem.orgaName;
    $scope.details.field = elem.field;
  }).error(function(err){
    console.log(err);
  });
}

$scope.getUsername = function(userId){
  return getStuffById(userId, $scope.chat.users).first_name; 
}


})