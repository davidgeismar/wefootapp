angular.module('chat',[]).controller('ChatCtrl', function($scope, $rootScope, $localStorage, $ionicModal){
	modalLink = "chat-modal";
	$scope.user = $localStorage.user;
	switchIcon('icon_chat','chat-modal');
	$scope.friends = $localStorage.friends;
	console.log($scope.friends);
	$scope.chats = {};



	$scope.getAllChats = function(target){

		$http.get('http://localhost:1337/getAllChats/'+user.id).success(function(data){
			$scope.chats = data;
		})
	}

	$rootScope.openModal = function() {
		$rootScope.modal2.show();
	};

	$rootScope.closeModal = function() {
		$rootScope.modal2.hide();
	}; 
	// $ionicModal.fromTemplateUrl('templates/chat-modal.html', {
	// 	scope: $scope,
	// 	animation: 'slide-in-up'
	// }).then(function(modal) {
	// 	$scope.modal2 = modal2;
	// });
	// $scope.openModal = function() {
	// 	$scope.modal2.show();
	// };
	// $scope.closeModal = function() {
	// 	$scope.modal2.hide();
	// };

})