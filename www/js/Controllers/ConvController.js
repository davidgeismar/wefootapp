angular.module('conv',[]).controller('ConvCtrl', function($http, $scope, $rootScope, $localStorage, $ionicModal, $ionicScrollDelegate){

  $scope.chat = $localStorage.chat;
  $scope.user = $localStorage.user;
  $scope.messageContent;

  io.socket.post('http://localhost:1337/chatter/updateLts',{user: $localStorage.user.id, chat: $scope.chat.id});
  $localStorage.chats[getIndex($scope.chat.id, $localStorage.chats)].lastTime = new Date();
  $localStorage.chats[getIndex($scope.chat.id, $localStorage.chats)].seen = true;
  $ionicScrollDelegate.scrollBottom();
  $rootScope.updateMessage = function(){
    $scope.$digest();
    $ionicScrollDelegate.scrollBottom();
    $localStorage.chats[getIndex($scope.chat.id, $localStorage.chats)].lastTime = new Date();
    io.socket.post('http://localhost:1337/chatter/updateLts',{user: $localStorage.user.id, chat: $scope.chat.id});
  }


  $scope.sendMessage = function(message){
   if(message.length>0){
     $http.post('http://localhost:1337/message/create',{senderId :$localStorage.user.id, messagestr:message, chat:$scope.chat.id, receivers:$scope.chat.users}).success(function(data){
      io.socket.post('http://localhost:1337/chatter/updateLts',{user: $localStorage.user.id, chat: $scope.chat.id});
      $scope.messageContent=null;
      $localStorage.chats[getIndex($scope.chat.id, $localStorage.chats)].lastTime = new Date();

      document.getElementById("footerChat").style.height=44+"px";
      document.getElementById("messageArea").style.height=44+"px";
    }).error(function(err){
      console.log(err);
    });
  }
}

$scope.showMessageButton = function(messageContent){
	if(messageContent==0 || !messageContent) return "hide-icon";
}


$scope.init = function(){

  if ($scope.chat.typ==2){
    $http.get('http://localhost:1337/foot/getInfo/'+$scope.chat.related).success(function(elem){
      $scope.detail = { 
        organisator : elem.orga,
        orgaName : elem.orgaName,
        field : elem.field
      }
    }).error(function(err){
      console.log(err);
    });
  }
}

$scope.init();

$scope.getUsername = function(userId){
  return getStuffById(userId, $scope.chat.users).first_name; 
}

$scope.autoExpand = function() {
  var footer = document.getElementById("footerChat");
  var element = document.getElementById("messageArea");
  var paddingBottom = document.getElementById("convContent");
        var scrollHeight = element.scrollHeight; // replace 60 by the sum of padding-top and padding-bottom
        element.style.height =  scrollHeight + "px";
        footer.style.height = scrollHeight +  "px";
        console.log(parseInt(paddingBottom.style.paddingBottom.substring(0, paddingBottom.style.paddingBottom.length - 2)) + scrollHeight + "px");
        paddingBottom.style.paddingBottom = parseInt(paddingBottom.style.paddingBottom.substring(0, paddingBottom.style.paddingBottom.length - 2)) + scrollHeight + "px";

      };


    })