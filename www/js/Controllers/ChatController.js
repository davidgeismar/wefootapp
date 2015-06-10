angular.module('chat',[]).controller('ChatCtrl', function($http, $scope, $rootScope, $localStorage, $ionicModal, $location){
	modalLink = "chat-modal";
	$scope.user = $localStorage.user;
	switchIcon('icon_chat','chat-modal');
	$scope.friends = $localStorage.friends;
	//Tableau contenant les chats
	$scope.chats = $localStorage.chats;


	$rootScope.updateMessage = function(){
		$scope.displayer();
		$scope.$digest();

	}


	//Récupère les chats de l'utilisateur
	// $scope.init = function(){
	// 	if(!$localStorage.refreshChat){
	// 		$http.get('http://localhost:1337/getAllChats/'+$scope.user.id).success(function(data){
	// 			$localStorage.chats=data;
	// 			console.log($scope.chats);
	// 			// $scope.displayer();
	// 		});
	// 		// $localStorage.refreshChat = true;
	// 	}
	// }

	// $scope.init();



	//Affiche les chats qui comportent des messages dans la liste
	$scope.displayer = function(){
		$localStorage.chatsDisplay = new Array();
		$scope.chatsDisplay = $localStorage.chatsDisplay;
		angular.forEach($localStorage.chats, function(chat) {
			console.log(chat);

			// console.log(chat.updatedAt);
			if(chat.messages.length>0){
				var newDate = new Date(chat.messages[chat.messages.length-1].createdAt);
				if(chat.typ==1){
					$localStorage.chatsDisplay.push({id:chat.id, lastTime:newTime(newDate), lastMessage:chat.messages[chat.messages.length-1].messagestr, titre:"test"});
				}
				else if(chat.typ==2){
					$localStorage.chatsDisplay.push({id:chat.id, lastTime:newTime(newDate), lastMessage:chat.messages[chat.messages.length-1].messagestr, titre:chat.desc});
				}
				else if(chat.typ==3){
					$localStorage.chatsDisplay.push({id:chat.id, lastTime:newTime(newDate), lastMessage:chat.messages[chat.messages.length-1].messagestr, titre:chat.desc});
				}
			}
			else{
				var newDate = new Date(chat.updatedAt);
				$localStorage.chatsDisplay.push({id:chat.id, lastTime:newTime(newDate), lastMessage:"", titre:"test"});
			}

		});


	}

	$scope.displayer();



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