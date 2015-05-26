angular.module('chat',[]).controller('ChatCtrl', function($http, $scope, $rootScope, $localStorage, $ionicModal){
	modalLink = "chat-modal";
	$scope.user = $localStorage.user;
	switchIcon('icon_chat','chat-modal');
	$scope.friends = $localStorage.friends;
	$scope.chats = {};

	$localStorage.refreshChat = true;



$scope.init = function(){
		if($localStorage.refreshChat){
		$http.get('http://localhost:1337/getAllChats/'+$scope.user.id).success(function(data){
			$scope.chats = data;
			console.log(data);
		})
		$localStorage.refresh = false;
	}
}
$scope.init();

	$rootScope.openModal = function() {
		$rootScope.modal2.show();
	}

	$rootScope.closeModal = function() {
		$rootScope.modal2.hide();
	}


})