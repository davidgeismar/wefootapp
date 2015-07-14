angular.module('chat',[]).controller('ChatCtrl', function($http, $scope, $rootScope, $localStorage, $ionicModal, $location, chat){
	$scope.user = $localStorage.getObject('user');
	$rootScope.friends = $localStorage.getObject('friends');
	//Tableau contenant les chats
	$rootScope.chats = $localStorage.getObject('chats');
	$scope.chatsDisplay = $localStorage.getObject('chatsDisplay');

	$rootScope.updateMessage = function(){
		$scope.$digest();
	}


$scope.launchChat = function(chatId){
	$location.path('/conv/'+chatId);
}

$rootScope.$on('updateChatDisplayer', function(event){
  $scope.chatsDisplay = $localStorage.getObject('chatsDisplay');
  $scope.$digest();
});

// $rootScope.openModal = function() {
// 	$rootScope.modal2.show();
// }

// $rootScope.closeModal = function() {
// 	$rootScope.modal2.hide();
// }

$scope.deleteChat = function(chatId){
chat.deactivateChatter(chatId);
}

})