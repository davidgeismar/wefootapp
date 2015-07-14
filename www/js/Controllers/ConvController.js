angular.module('conv',[]).controller('ConvCtrl', function($http, $scope, $rootScope, $localStorage, $ionicModal, $ionicScrollDelegate, $stateParams, chat, chats){

  $scope.chat = _.find($localStorage.getObject('chats'), function(chat){return chat.id==$stateParams.id});
  $scope.user = $localStorage.getObject('user');
  $scope.messageContent;

  chat.updateLts($scope.chat.id);

    ionic.DomUtil.ready(function(){
        $ionicScrollDelegate.scrollBottom();
    });
  

//REFRESH THE CONVERSATION
$rootScope.$on('newMessage', function(event){
  $scope.chat = _.find($localStorage.getObject('chats'), function(chat){return chat.id==$stateParams.id});
  $scope.$digest();
  $ionicScrollDelegate.scrollBottom();
});

  // $rootScope.updateMessage = function(){
  //   $rootScope.chats[getIndex($scope.chat.id, $rootScope.chats)].lastTime = new Date();
  //   $localStorage.setObject('chats',$rootScope.chats);
  //   io.socket.post('http://'+serverAddress+'/chatter/updateLts',{user: $scope.user.id, chat: $scope.chat.id});
  //   $scope.$digest();
  //   $ionicScrollDelegate.scrollBottom();
  // }


  $scope.sendMessage = function(){
   if($scope.messageContent.length>0){
    chat.sendMessage($scope.messageContent, $scope.chat);
    //  $http.post('http://'+serverAddress+'/message/create',{sender_id :$scope.user.id, messagestr:$scope.messageContent, chat:$scope.chat.id, receivers:$scope.chat.users}).success(function(data){
    //   io.socket.post('http://'+serverAddress+'/chatter/updateLts',{user: $scope.user.id, chat: $scope.chat.id});
    $scope.messageContent=null;
    //   $rootScope.chats[getIndex($scope.chat.id, $rootScope.chats)].lastTime = new Date();
    //   $localStorage.setObject('chats',$rootScope.chats);
    document.getElementById("footerChat").style.height=44+"px";
    document.getElementById("messageArea").style.height=44+"px";
    // }).error(function(err){
    //   console.log(err);
    // });
// console.log('here');

}
}

$scope.showMessageButton = function(messageContent){
	if(messageContent==0 || !messageContent) return "hide-icon";
}


$scope.init = function(){

  if ($scope.chat.typ==2){
    $http.get('http://'+serverAddress+'/foot/getInfo/'+$scope.chat.related).success(function(elem){
      $scope.detail = { 
        organisator : elem.orga,
        orgaName : elem.orgaName,
        field : elem.field,
        date : getJour(new Date(elem.field.date))+' '+getHour(new Date(elem.field.date))
      }
    }).error(function(err){
      console.log(err);
    });
  }
}

$scope.init();

$scope.getUsername = function(userId){
  return _.find($scope.chat.users, function(user){return user.id==userId}).first_name;
}

$scope.getPic = function(userId){
  return _.find($scope.chat.users, function(user){return user.id==userId}).picture;
}

$scope.autoExpand = function() {
  var footer = document.getElementById("footerChat");
  var element = document.getElementById("messageArea");
  var convcontent = document.getElementById("convcontent");
        var scrollHeight = element.scrollHeight;
        element.style.height =  scrollHeight + "px";
        footer.style.height = scrollHeight +  "px";
        // console.log(convcontent.style);
        // console.log(parseInt(convcontent.style.paddingBottom.substring(0, convcontent.style.paddingBottom.length - 2)) + scrollHeight + "px");
        if(scrollHeight>0)
          convcontent.style.paddingBottom = scrollHeight + "px";
        $ionicScrollDelegate.scrollBottom();
      };


    })