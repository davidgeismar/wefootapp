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

	$rootScope.getNbChatsNotif = function (){
		var cpt = 0;
		for (var i = 0; i<$localStorage.chats.length; i++){
			if(!$localStorage.chats[i].seen){
				cpt++;
			}
		}
		console.log(cpt);
		return cpt;
	}

	var shrinkMessage = function(message){
		message = message.replace(/[\n\r]/g, ' ');
		if(message.length>80){
			message = message.substring(0,88)+"...";
		}
		return message;

	};
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
				var lastMessage = shrinkMessage(chat.messages[chat.messages.length-1].messagestr);
				if(chat.typ==1){
					$localStorage.chatsDisplay.push({id:chat.id, lastTime:newTime(newDate), lastMessage:lastMessage, titre:"test", seen:chat.seen });
				}
				else if(chat.typ==2){
					console.log("seen"+chat.seen);
					$localStorage.chatsDisplay.push({id:chat.id, lastTime:newTime(newDate), lastMessage:lastMessage, titre:chat.desc, seen:chat.seen });
				}
				else if(chat.typ==3){
					$localStorage.chatsDisplay.push({id:chat.id, lastTime:newTime(newDate), lastMessage:lastMessage, titre:chat.desc, seen:chat.seen });
				}
			}
			else{
				$localStorage.chatsDisplay.push({id:chat.id, lastTime:"", lastMessage:"", titre:chat.desc});
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