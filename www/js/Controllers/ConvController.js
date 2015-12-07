angular.module('conv',[]).controller('ConvCtrl', function($http, $location, $scope, $rootScope, $localStorage, $ionicModal, $ionicScrollDelegate, $stateParams, $ionicHistory, $confirmation,chat, chats, ngProgressFactory){

  $scope.chat = _.find($localStorage.getArray('chats'), function(chat){return chat.id==$stateParams.id});
  $scope.user = $localStorage.getObject('user');
  $scope.messageContent;

  chat.updateLts($scope.chat.id);
  chat.setSeenStatus($scope.chat.id);

  var sending_mess = 0; // Loading bar indicator
  var message_count = 0; // Error handler
  var pending_messages = [];
  var error_displayed = false;
  var message_received = 0;

  ionic.DomUtil.ready(function(){
    $ionicScrollDelegate.scrollBottom();
    $scope.loadingBar = ngProgressFactory.createInstance();
    $scope.loadingBar.setColor('#006ddf');
    var pos = parseInt($('.content_conv').offset().top) + parseInt($('.content_conv').height());
    $('#ngProgress-container').css('top', pos + 'px');
    $('.error_chat').css('top', pos - 3 + 'px');
  });

  var refreshConv = function(){
    if(_.last($location.url().split('/'))==$scope.chat.id){
      chat.updateLts($scope.chat.id);
      $scope.chat = _.find($localStorage.getArray('chats'), function(chat){return chat.id==$stateParams.id});
      if(!$scope.$$phase) {
        $scope.$digest();
        $ionicScrollDelegate.scrollBottom();
      }
      else
        $ionicScrollDelegate.scrollBottom();
      
    }
  }

  setTimeout(function(){ refreshConv(); }, 3000);


//REFRESH THE CONVERSATION
$rootScope.$on('newMessage', function(event){
  refreshConv();
});

  // $scope.goBack = function (value){
  //   $ionicScrollDelegate.scrollTop();
  //   $rootScope.nbGoBack = -1;
  //   if(value)
  //     $ionicHistory.goBack(value);
  //   $ionicHistory.goBack();
  // };

  $scope.go = function(target){
    $location.path(target);
  }

  $scope.sendMessage = function(){
   if($scope.messageContent.length>0){
    console.log($scope.chat);
    chat.sendMessage($scope.messageContent, $scope.chat);
    $scope.messageContent=null;
    
    if(sending_mess > 0)
      $scope.loadingBar.start();

    else{
      $scope.loadingBar.reset();
      $scope.loadingBar.start();
    }

    sending_mess++;
    pending_messages.push(message_count);
    setTimeout(function(){
      if(pending_messages.indexOf(message_count) > -1){
        $('.error_chat').show();
        error_displayed = true;
      }
    }, 10000);
    document.getElementById("footerChat").style.height=44+"px";
    document.getElementById("messageArea").style.height=44+"px";
  }
  }

  io.socket.on('newMessage',function(message){
    if(message.sender_id == $localStorage.getObject('user').id){
      sending_mess--;
      message_received++;
      if(error_displayed)
        $('.error_chat').hide();
    //  pending_messages.splice(pending_messages.indexOf(message_received));
      if(sending_mess == 0)
        $scope.loadingBar.complete();
    }
  });

$scope.showMessageButton = function(messageContent){
	if(messageContent==0 || !messageContent) return "hide-icon";
}

$scope.removeChat = function(chatId){
  $confirmation("Etes vous sûr de vouloir vous retirer de ce chat ?",function(){
    chat.deactivateChatter(chatId,'id');
    $ionicHistory.goBack();
  });;
}

$scope.init = function(){

  if ($scope.chat.typ==2){
    $http.get(serverAddress+'/foot/getInfo/'+$scope.chat.related).success(function(elem){
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
