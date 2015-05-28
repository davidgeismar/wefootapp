angular.module('conv',[]).controller('ConvCtrl', function($http, $scope, $rootScope, $localStorage, $ionicModal){

$scope.chat = $localStorage.chat;
$scope.user = $localStorage.user;

$scope.sendMessage = function(message){
	console.log($scope.chat.id);
	$http.post('http://localhost:1337/message/create',{senderId :$localStorage.user.id, messageStr:message, chat:$scope.chat.id}).success(function(data){
    console.log(data);
  }).error(function(err){
    console.log(err);
  });

}

$scope.init = function(){

}


})