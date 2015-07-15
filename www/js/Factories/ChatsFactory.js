app.factory('chats',['$http','$localStorage','$rootScope','chat',function($http,$localStorage,$rootScope, chat){

	var user = $localStorage.getObject('user');

	var obj = {};

	obj.addChatToDisplayer = function(chat){
		var chatsDisplay = $localStorage.getObject('chatsDisplay');
		chatsDisplay.push({id:chat.id, lastTime:"", lastMessage:"Lancer la discussion avec vos coéquipiers !", titre:chat.desc, chatPic:"img/logo.jpg"});
		$localStorage.setObject('chatsDisplay', chatsDisplay);
		$rootScope.$emit('updateChatDisplayer');
	}
	obj.addChat = function (newChat) {
		var chats = $localStorage.getObject('chats');
		chats.push(newChat);
		$localStorage.setObject('chats', chats);
		obj.addChatToDisplayer(newChat);
	}
	obj.getNewChats = function(){
		var user = $localStorage.getObject('user');
		var ltu = $localStorage.get('lastTimeUpdated');
		return $http.get('http://'+serverAddress+'/chat/getNewChats/'+user.id+'/'+ltu).success(function(chats){
			angular.forEach(chats, function(chat){
				obj.addChat(chat);
			});	
		});
	}
	obj.getNewChatters = function(){
		var user = $localStorage.getObject('user');
		var ltu = $localStorage.get('lastTimeUpdated');
		return $http.get('http://'+serverAddress+'/chat/getNewChatters/'+user.id+'/'+ltu).success(function(chatters){
			angular.forEach(chatters, function(chatter){
				chat.addChatter(chatter);
			});	
		});
	}
	obj.getNewMessages = function(){
		var user = $localStorage.getObject('user');
		var ltu = $localStorage.get('lastTimeUpdated');
		return $http.get('http://'+serverAddress+'/chat/getUnseenMessages/'+user.id+'/'+ltu).success(function(messages){
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
		console.log($localStorage.getObject('chatsDisplay'));
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
		console.log(chats);
		$localStorage.setObject('chats', chats);	
	}
	obj.getNbNotif = function(){
		return _.filter($localStorage.getObject('chats'), function(chat){return !chat.seen}).length;
	}

	return obj;

}])