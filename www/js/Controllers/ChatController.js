angular.module('chat',[]).controller('ChatCtrl', function($http, $scope, $rootScope, $localStorage, $ionicModal, $location, $ionicScrollDelegate, chat){
	$scope.user = $localStorage.getObject('user');
	//Tableau contenant les chats
	$rootScope.chats = $localStorage.getArray('chats');
	$scope.chatsDisplay = $localStorage.getArray('chatsDisplay');

	$ionicScrollDelegate.scrollTop();

	$rootScope.updateMessage = function(){
		$scope.$digest();
	}


	$scope.launchChat = function(chatId){
		$location.path('/conv/'+chatId);
	}

	$scope.formatTime = function (oldTime){
		if(oldTime)
			return moment(oldTime).locale("fr").format('Do MMM, HH:mm');
		else
			return "";
	};

	$rootScope.$on('updateChatDisplayer', function(event){
		$scope.chatsDisplay = $localStorage.getArray('chatsDisplay');
		if(!$scope.$$phase) {
			$scope.$digest();
		}
	});

$scope.deleteChat = function(chatId){
	chat.deactivateChatter(chatId);
}

})