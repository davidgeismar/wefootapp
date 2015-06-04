angular.module('conv',[]).controller('ConvCtrl', function($http, $scope, $rootScope, $localStorage, $ionicModal){

$scope.chat = $localStorage.chat;
$scope.user = $localStorage.user;
$scope.messageContent;

    io.socket.on('newMessage',function(message){
    //console.log(message);
    console.log(message);
    $scope.chat.messages.push(message);
    $scope.$digest;
  });


$scope.sendMessage = function(message){
	if(message.length>0){
	$http.post('http://localhost:1337/message/create',{senderId :$localStorage.user.id, messagestr:message, chat:$scope.chat.id, receivers:$scope.chat.users}).success(function(data){
		$scope.messageContent=null;
  }).error(function(err){
    console.log(err);
  });
}
}

$scope.showMessageButton= function(messageContent){
	if(messageContent==0 || !messageContent) return "hide-icon";
}


})