app.factory('chat',['$http','$localStorage', '$rootScope',function($http,$localStorage, $rootScope){

	var obj = {};
	//Update the lastTimeSeen
	obj.updateLts =  function(chatId){
		var chats = $localStorage.getObject('chats');
		var user = $localStorage.getObject('user');
		var index = _.pluck(chats, 'id').indexOf(chatId);
		io.socket.post('http://'+serverAddress+'/chatter/updateLts',{user: user.id, chat: chatId});
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
		$http.post('http://'+serverAddress+'/message/create',{sender_id :user.id, messagestr:message, chat:chat.id, receivers:chat.users}).success(function(message){
		});
	}
	obj.addChatter =  function (chatter){
		var chats = $localStorage.getObject('chats');
		var index = _.pluck(chats, 'id').indexOf(chatter.chat);
		if(index>-1){
			chats[index].users.push(chatter);
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
			$http.post('http://'+serverAddress+'/chatter/deactivateFromChat',{chat:chatId, user:user.id}).success(function(){
				chats.splice(indexC, 1);
				chatsDisplay.splice(indexCD, 1);
				$localStorage.setObject('chats',chats);
				$localStorage.setObject('chatsDisplay',chatsDisplay);
				$rootScope.$emit('updateChatDisplayer');
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

		if(chats[indexC].messages.length>0){
			var lastTimeMessage = moment(chats[indexC].messages[chats[indexC].messages.length-1].createdAt);
			var lastTimeSeen = moment(chats[indexC].lastTime).add(5, 'seconds');
			if(lastTimeMessage.diff(lastTimeSeen)>0){
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
	obj.isSeen = function(chatId){
		var chats = $localStorage.getObject('chats');
		var index = _.pluck(chats, 'id').indexOf(chatId);
		if(chats[index].seen){
			return true;
		}
		else
			return false;	
	}

	return obj;

}])