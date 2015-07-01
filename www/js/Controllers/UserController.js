angular.module('user',[])

.controller('UserCtrl',function($scope, $rootScope, $stateParams,$localStorage,$location,$ionicModal,$http,$cordovaImagePicker,$cordovaFileTransfer,$ionicLoading,$handleNotif, $cordovaSms){


  $scope.user = $localStorage.user;
  $scope.friends = $localStorage.friends;


//Handle edit inputs on left menu
$scope.toEdit = [false,false];
if($scope.user && $scope.user.favorite_club==null){
  $scope.user.favorite_club = "Entrer un club";
}
if($scope.user && $scope.user.poste==null){
  $scope.user.poste = "Entrer votre poste";
}

  //EDITIONS

  $scope.editClub = function(value){
    var self = this;
    if(value.length>0){
      $http.post('http://'+serverAddress+'/editUser',{favorite_club: value}).success(function(){
        self.user.favorite_club = value;
        self.toEdit[0] = false;
      });
    }
  }

  $scope.editPoste = function(value){
    var self = this;
    if(value.length>0){
      $http.post('http://'+serverAddress+'/editUser',{poste: value}).success(function(){
        self.user.poste = value;
        self.toEdit[1] = false;
      });
    }
  }

  $scope.editProfilPic = function(){
    var optionsImg = {
      maximumImagesCount: 1,
      width: 200,
      quality: 80
    };

    $cordovaImagePicker.getPictures(optionsImg).then(function (results) {

      var optionsFt = {
        params : {
          userId: $localStorage.user.id
        }
      };
      $cordovaFileTransfer.upload('http://'+serverAddress+'/user/uploadProfilPic', results[0], optionsFt)
      .then(function(result) {  
        // Success!
        console.log('hello');
        setTimeout(function(){
          $localStorage.user.picture = result.response+'#'+ new Date().getTime();
          $scope.user.picture = $localStorage.user.picture;
          $ionicLoading.hide();
        },3000);
      }, function(err) {
        // Error
      }, function (progress) {
        $ionicLoading.show({
          content: 'Loading Data',
          animation: 'fade-out',
          showBackdrop: true
        });
      });

    }, function(error) {
      console.log('Error getting pic');
    });

  }


  //END EDITIONS
//END Handle Menu
$scope.logout = function (){
  if(window.device)

    $localStorage.set('token') = "";
  io.socket.post('http://'+serverAddress+'/connexion/delete');

  $rootScope.toShow = true;
  if($localStorage.user.pushToken)
    $http.post('http://'+serverAddress+'/push/delete',{push_id : $localStorage.user.pushToken});

  $localStorage.user = {};
  $localStorage.token = "";
  $location.path('/');
};
  //MODAL HANDLER

  $ionicModal.fromTemplateUrl('templates/search.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.openModal = function() {
    $scope.modal.show();
  };

  $scope.closeModal = function() {
    $scope.modal.hide();
  }; 

  $scope.switchSearchFb = function(){
    $('.opened_search').removeClass('opened_search');
    $('.switch_fb').addClass('opened_search');
    $('.hidden').removeClass('hidden');
    $('.content_wf_search').addClass('hidden');
  }


  $scope.switchSearchWf = function(){
    $('.opened_search').removeClass('opened_search');
    $('.switch_wf').addClass('opened_search');
    $('.hidden').removeClass('hidden');
    $('.content_fb_search').addClass('hidden');
  }
  $scope.searchQuery = function(word){
    $scope.friendsId = _.pluck($localStorage.friends,'id');
    if(word.length>2){
     $http.get('http://'+serverAddress+'/search/'+word).success(function(data){
      $scope.results = data;
    });
   }
   else
    $scope.results = [];
}
//facebookFriend = true, target = facebook_id
//facebookFriend = false, target = user.id
$scope.addFriend = function(target, facebookFriend){
var postData = {};
if(facebookFriend)
  postData = {user1: $localStorage.user.id, facebook_id: target};
else
  postData = {user1: $localStorage.user.id, user2: target};

  $http.post('http://'+serverAddress+'/addFriend',postData).success(function(data){
    $localStorage.newFriend = true; //Load actu of new friend on refresh
    var notif = {user: target, related_user: $localStorage.user.id, typ:'newFriend', related_stuff:$localStorage.user.id};
    $handleNotif.notify(notif);
    data.statut = 0;
    $localStorage.friends.push(data);
    $localStorage.friends[$localStorage.friends.length-1].statut = 0;
    $scope.friendsId.push(data.id);
  });
}

$scope.createChat = function(user){

  $http.post('http://'+serverAddress+'/chat/create',{users :[$localStorage.user.id, user.id], typ:1}).success(function(chat){
    $rootScope.closeModal();
    chat.messages = new Array();
    $localStorage.chat=chat;
    $location.path('/conv');
  });
}

$scope.launchChat = function(user){
  console.log($localStorage.chats);
  angular.forEach($localStorage.chats, function(chat) {
    if(chat.typ==1 && chat.users.indexOf(user.id)>-1){
      console.log('here');
      $localStorage.chat=chat;
      $location.path('/conv');
      return 0;
    }
  });
  $scope.createChat(user);
}

$scope.friend = $localStorage.friend;
$scope.notes = new Array(5);
$scope.starStatus = new Array(5);

for(var i=0; i<5; i++) {
  $scope.starStatus[i] = new Array(5);
}
for(var i=0; i<5; i++) {
  for(var j=0; j<5; j++) {
    $scope.starStatus[i][j] = "ion-android-star";
  }
}


$scope.setNote = function(note, target){

  $scope.notes[target] = note;
  for(var i=0; i<5; i++) {
    if(i+1<=note)
      $scope.starStatus[target][i] = "ion-android-star";
    else
      $scope.starStatus[target][i] = "ion-android-star-outline";
  }
}



$scope.initNotes = function(){
  $http.get('http://'+serverAddress+'/getDetailledGrades/'+$scope.user.id).success(function(data){
    $scope.user.nbGrades = data.nbGrades;
    $scope.setNote(Math.round(data.technique), 0);
    $scope.setNote(Math.round(data.frappe), 1);
    $scope.setNote(Math.round(data.physique), 2);
    $scope.setNote(Math.round(data.fair_play), 3);
    $scope.setNote(Math.round(data.assiduite), 4);
  });

}



$scope.initNotes();

$scope.displayNotes = function(){
  if($scope.user.nbGrades<=1)
    return $scope.user.nbGrades+" personne";
  else
    return $scope.user.nbGrades+ " personnes";
}



$scope.computeChatNotif = function(){
  console.log($localStorage.chats);
  angular.forEach($localStorage.chats,function(chat){
    if(chat.messages.length>0){
      if(chat.lastTime>chat.messages[chat.messages.length-1].createdAt || !chat.lastTime){
        $rootScope.nbChatsUnseen++;
        console.log($rootScope.nbChatsUnseen);
      }
    }
  });
}

$scope.computeChatNotif();


$scope.sendFbMessage = function() {
  facebookConnectPlugin.showDialog({
    method: 'send',
    message:'Téléchargez wefoot bande de bitches',
    link:'http://wefoot.co'
  },
  function (response) {
    $ionicLoading.show({ template: 'Message envoyé!', noBackdrop: true, duration: 2000 });
  },
  function (response) {
    console.log('error');
  });
};

$scope.sendSmsMessage = function(){
  var options = {
            replaceLineBreaks: true, // true to replace \n by a new line, false by default
            android: {
                intent: 'INTENT'  // send SMS with the native android SMS messaging
              }
            };
            $cordovaSms.send('', 'Téléchargez wefoot bande de bitches', options).then(function() {
              $ionicLoading.show({ template: 'Message envoyé!', noBackdrop: true, duration: 2000 });
            }, function(error) {
              console.log('error');
            });
          }
          $scope.facebookFriends = $localStorage.facebookFriends;
          console.log($scope.facebookFriends);
          //GET ALL FACEBOOK ID FOR ALL FRIENDS IN  FRIENDS LIST
          $scope.facebookFriendsId = _.pluck($localStorage.friends,'facebook_id');
          console.log($scope.facebookFriendsId);
        })

.controller('MenuController', function($scope, $ionicSideMenuDelegate,$localStorage) { 
  $scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };
})