angular.module('chat',[]).controller('ChatCtrl', function($http, $scope, $rootScope, $localStorage, $ionicModal, $location){
	modalLink = "chat-modal";
	$scope.user = $localStorage.user;
	switchIcon('icon_chat','chat-modal');
	$scope.friends = $localStorage.friends;
	//Tableau contenant les chats
	$scope.chats = $localStorage.chats;



	//Récupère les chats de l'utilisateur
	$scope.init = function(){
		if(!$localStorage.refreshChat){
			$http.get('http://localhost:1337/getAllChats/'+$scope.user.id).success(function(data){
				$scope.chats = data.chats;
				$localStorage.chats=$scope.chats;
				console.log($scope.chats);
				$scope.displayer();
			})
			$localStorage.refreshChat = true;
		}
	}

	$scope.init();



	//Affiche les chats qui comportent des messages dans la liste
	$scope.displayer = function(){
		var cpt = 0;
		$localStorage.chatsDisplay = new Array();
		$scope.chatsDisplay = $localStorage.chatsDisplay;
		angular.forEach($scope.chats, function(chat) {
			console.log(chat);


			if(chat.messages.length>0){
				console.log("time"+chat.messages[chat.messages.length-1].createdAt);
				var newDate = new Date(chat.messages[chat.messages.length-1].createdAt);
				console.log("new Date "+newDate);
				$localStorage.chatsDisplay[cpt] = {id:chat.id, lastTime:newTime(newDate), lastMessage:chat.messages[chat.messages.length-1].messagestr, user:"test"};
				cpt++;
			}

		});


	}



	$scope.launchChat = function(chatId){
		$localStorage.chat = getStuffById(chatId, $scope.chats);
		$location.path('/conv');
	}

	$rootScope.openModal = function() {
		$rootScope.modal2.show();
	}

	$rootScope.closeModal = function() {
		$rootScope.modal2.hide();
	}
	
	if($localStorage.refreshChat){
		$scope.displayer();
	}

})