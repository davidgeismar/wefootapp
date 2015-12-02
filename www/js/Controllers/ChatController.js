angular.module('chat',[]).controller('ChatCtrl', function($http, $scope, $rootScope, $localStorage, $ionicModal, $location, $ionicScrollDelegate, chat){
	$scope.user = $localStorage.getObject('user');
	//Tableau contenant les chats
	$rootScope.chats = $localStorage.getArray('chats');
	$scope.chatsDisplay = $localStorage.getArray('chatsDisplay');


	ionic.DomUtil.ready(function(){
		$ionicScrollDelegate.scrollTop();
	});

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
		if($location.url()=="/user/chat"){
		$scope.chatsDisplay = $localStorage.getArray('chatsDisplay');
		if(!$scope.$$phase) {
			$scope.$digest();
		}
		$ionicScrollDelegate.scrollTop();
	}
});

$scope.deleteChat = function(chatId){
	chat.deactivateChatter(chatId,'id');
}

})