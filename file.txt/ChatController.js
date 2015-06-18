angular.module('chat',[]).controller('ChatCtrl', function($http, $scope, $rootScope, $localStorage, $ionicModal, $location){
	$scope.user = $localStorage.user;
	$scope.friends = $localStorage.friends;
	//Tableau contenant les chats
	$scope.chats = $localStorage.chats;


	$rootScope.updateMessage = function(){
		$scope.displayer();
		$scope.$digest();

	}

	var shrinkMessage = function(message){
		message = message.replace(/[\n\r]/g, ' ');
		if(message.length>80){
			message = message.substring(0,88)+"...";
		}
		return message;

	};



	//Affiche les chats qui comportent des messages dans leur liste
	$scope.displayer = function(){
		$localStorage.chatsDisplay = new Array();
		$scope.chatsDisplay = $localStorage.chatsDisplay;
		angular.forEach($localStorage.chats, function(chat) {
			if(chat.messages.length>0){
				var newDate = new Date(chat.messages[chat.messages.length-1].createdAt);
				var lastMessage = shrinkMessage(chat.messages[chat.messages.length-1].messagestr);
				var chatPic = getStuffById(chat.messages[chat.messages.length-1].senderId, chat.users).picture;
				if(chat.typ==1){
					$localStorage.chatsDisplay.push({id:chat.id, lastTime:newTime(newDate), lastMessage:lastMessage, titre:"test", seen:chat.seen, chatPic:chatPic });
				}
				else if(chat.typ==2){
					console.log("seen"+chat.seen);
					$localStorage.chatsDisplay.push({id:chat.id, lastTime:newTime(newDate), lastMessage:lastMessage, titre:chat.desc, seen:chat.seen, chatPic:chatPic });
				}
				else if(chat.typ==3){
					$localStorage.chatsDisplay.push({id:chat.id, lastTime:newTime(newDate), lastMessage:lastMessage, titre:chat.desc, seen:chat.seen, chatPic:chatPic });
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