app.factory('chat',['$http','$localStorage', '$rootScope',function($http,$localStorage, $rootScope){

	var obj = {};
	//Update the lastTimeSeen
	obj.updateLts =  function(chatId){
		var chats = $localStorage.getObject('chats');
		var user = $localStorage.getObject('user');
		var index = _.pluck(chats, 'id').indexOf(chatId);
		io.socket.post(serverAddress+'/chatter/updateLts',{user: user.id, chat: chatId});
		chats[index].lastTime = moment();
		$localStorage.setObject('chats', chats);
	}
	obj.updateDisplayer = function(message){
		var chatsDisplay = $localStorage.getObject('chatsDisplay');
		var chats = $localStorage.getObject('chats');
		var indexCD = _.pluck(chatsDisplay, 'id').indexOf(message.chat);
		var indexC = _.pluck(chats, 'id').indexOf(message.chat);
		var lastDate = new Date(message.createdAt);
		var lastMessage = shrinkMessage(message.messagestr);
		var chatPic = getStuffById(message.sender_id, chats[indexC].users).picture;
		chatsDisplay[indexCD] = {id:message.chat, lastTime:newTime(lastDate), lastMessage:lastMessage, titre:chats[indexC].desc, seen:chats[indexC].seen, chatPic:chatPic};				$localStorage.setObject('chatsDisplay', chatsDisplay);
		$rootScope.$emit('updateChatDisplayer');
	}
	obj.addMessage =  function(message){
		var chats = $localStorage.getObject('chats');
		var index = _.pluck(chats, 'id').indexOf(message.chat);
		if(index>-1){
			chats[index].messages.push(message);
			$localStorage.setObject('chats', chats);
			obj.updateDisplayer(message);
			$rootScope.$emit('newMessage');
		}
	}
	obj.sendMessage = function (message, chat) {
		var user = $localStorage.getObject('user');
		obj.updateLts(chat.id);
		$http.post(serverAddress+'/message/create',{sender_id :user.id, messagestr:message, chat:chat.id, receivers:chat.users}).success(function(message){
		});
	}
	obj.addChatter =  function (chatter){
		var chats = $localStorage.getObject('chats');
		var index = _.pluck(chats, 'id').indexOf(chatter.chat);
		if(index>-1){
			chats[index].users.push(chatter.user);
			$localStorage.setObject('chats', chats);
		}
	}
	obj.deactivateChatter =  function (chatId){
		var user = $localStorage.getObject('user');
		var chats = $localStorage.getObject('chats');
		var chatsDisplay = $localStorage.getObject('chatsDisplay');
		var indexC = _.pluck(chats, 'id').indexOf(chatId);
		var indexCD = _.pluck(chatsDisplay, 'id').indexOf(chatId);
		if(indexC>-1){
			chats.splice(indexC, 1);
			chatsDisplay.splice(indexCD, 1);
			$localStorage.setObject('chats',chats);
			$localStorage.setObject('chatsDisplay',chatsDisplay);
			$rootScope.$emit('updateChatDisplayer');
			$http.post(serverAddress+'/chatter/deactivateFromChat',{chat:chatId, user:user.id}).success(function(){
			}).error(function(err){
				console.log(err);
			});
		}
	}
	obj.setSeenStatus = function(chatId){
		var chats = $localStorage.getObject('chats');
		var indexC = _.pluck(chats, 'id').indexOf(chatId);
		var chatsDisplay = $localStorage.getObject('chatsDisplay');
		var indexCD = _.pluck(chatsDisplay, 'id').indexOf(chatId);
		if(indexC>-1){
			if(chats[indexC].messages.length>0){
				var lastTimeMessage = moment(chats[indexC].messages[chats[indexC].messages.length-1].createdAt);
				var lastTimeSeen = moment(chats[indexC].lastTime).add(5, 'seconds');
				if(lastTimeMessage.diff(lastTimeSeen)>0 || !chats[indexC].lastTime){
					chats[indexC].seen = false;
					chatsDisplay[indexCD].seen = false;
				}
				else{
					chats[indexC].seen = true;
					chatsDisplay[indexCD].seen = true;
				}
				$localStorage.setObject('chats', chats);
				$localStorage.setObject('chatsDisplay', chatsDisplay);
				$rootScope.$emit('updateChatDisplayer');
			}
		}
	}
	obj.isSeen = function(chatId){
		var chats = $localStorage.getObject('chats');
		var index = _.pluck(chats, 'id').indexOf(chatId);
		if(chats[index].seen){
			return true;
		}
		else
			return false;	
	}

	obj.postNewChatter = function(footId, userId){
		$http.post(serverAddress+'/chatter/addToChat',{user :userId, related:footId });
	}
	return obj;

}])

app.factory('chats',['$http','$localStorage','$rootScope','chat',function($http,$localStorage,$rootScope, chat){

	var user = $localStorage.getObject('user');

	var obj = {};

	obj.addChatToDisplayer = function(chat){
		var chatsDisplay = $localStorage.getObject('chatsDisplay');
		if(chat.messages.length>0){
			var lastDate = new Date(chat.messages[chat.messages.length-1].createdAt);
			var lastMessage = shrinkMessage(chat.messages[chat.messages.length-1].messagestr);
			var chatPic = getStuffById(chat.messages[chat.messages.length-1].sender_id, chat.users).picture;
				//1VS1
				if(chat.typ==1){
					chatsDisplay.push({id:chat.id, lastTime:newTime(lastDate), lastMessage:lastMessage, titre:"test", seen:chat.seen, chatPic:chatPic });
				}
				//Foot
				else {
					chatsDisplay.push({id:chat.id, lastTime:newTime(lastDate), lastMessage:lastMessage, titre:chat.desc, seen:chat.seen, chatPic:chatPic });
				}
			}
			//Chat vide
			else{
				chatsDisplay.push({id:chat.id, lastTime:"", seen:chat.seen, lastMessage:"Lancer la discussion avec vos coéquipiers !", titre:chat.desc, chatPic:"img/logo.jpg"});
			}
			$localStorage.setObject('chatsDisplay', chatsDisplay);
			$rootScope.$emit('updateChatDisplayer');
		}

		obj.addChat = function (newChat) {
			newChat.seen = true;
			$localStorage.addElement('chats', newChat);
			obj.addChatToDisplayer(newChat);
		}
		obj.getNewChats = function(){
			var user = $localStorage.getObject('user');
			var ltu = $localStorage.get('lastTimeUpdated');
			return $http.get(serverAddress+'/chat/getNewChats/'+user.id+'/'+ltu).success(function(chats){
				angular.forEach(chats, function(chat){
					obj.addChat(chat);
				});	
			});
		}
		obj.getNewChatters = function(){
			var user = $localStorage.getObject('user');
			var ltu = $localStorage.get('lastTimeUpdated');
			return $http.get(serverAddress+'/chat/getNewChatters/'+user.id+'/'+ltu).success(function(chatters){
				angular.forEach(chatters, function(chatter){
					chat.addChatter(chatter);
				});	
			});
		}
		obj.getNewMessages = function(){
			var user = $localStorage.getObject('user');
			var ltu = $localStorage.get('lastTimeUpdated');
			return $http.get(serverAddress+'/chat/getUnseenMessages/'+user.id+'/'+ltu).success(function(messages){
				angular.forEach(messages, function(message){
					chat.addMessage(message);
				});	
			});
		}
		obj.initDisplayer = function(){
			var chats = $localStorage.getObject('chats');
			var chatsDisplay = [];
			angular.forEach(chats, function(chat) {
				if(chat.messages.length>0){
					var lastDate = new Date(chat.messages[chat.messages.length-1].createdAt);
					var lastMessage = shrinkMessage(chat.messages[chat.messages.length-1].messagestr);
					var chatPic = getStuffById(chat.messages[chat.messages.length-1].sender_id, chat.users).picture;
				//1VS1
				if(chat.typ==1){
					chatsDisplay.push({id:chat.id, lastTime:newTime(lastDate), lastMessage:lastMessage, titre:"test", seen:chat.seen, chatPic:chatPic });
				}
				//Foot
				else {
					chatsDisplay.push({id:chat.id, lastTime:newTime(lastDate), lastMessage:lastMessage, titre:chat.desc, seen:chat.seen, chatPic:chatPic });
				}
			}
			//Chat vide
			else{
				chatsDisplay.push({id:chat.id, lastTime:"", seen:chat.seen, lastMessage:"Lancer la discussion avec vos coéquipiers !", titre:chat.desc, chatPic:"img/logo.jpg"});
			}
		});	
			$localStorage.setObject('chatsDisplay', chatsDisplay);
		}
		obj.initNotif = function(){
			var chats = $localStorage.getObject('chats');
			angular.forEach(chats, function(chat, index) {
				if(chat.messages.length>0){
					var lastTimeMessage = moment(chat.messages[chat.messages.length-1].createdAt);
					var lastTimeSeen = moment(chat.lastTime);
					if(lastTimeMessage.diff(lastTimeSeen)>0){
						chats[index].seen = false;
					}
					else
						chats[index].seen = true;
				}
				else
					chats[index].seen = true;
			});
			$localStorage.setObject('chats', chats);	
		}
		obj.getNbNotif = function(){
			var chats = $localStorage.getObject('chats');
			return _.filter(chats, function(chat){return !chat.seen}).length;
		}
		obj.getChat = function(related){
			var user = $localStorage.getObject('user');
			return $http.get(serverAddress+'/chat/getChat/'+user.id+'/'+related).success(function(chat){
				obj.addChat(chat);
			});	
		}


		return obj;

	}])