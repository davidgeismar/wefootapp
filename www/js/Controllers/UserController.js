angular.module('user',[])

.controller('UserCtrl',function($scope, $rootScope, $stateParams,$localStorage,$location,$ionicModal,$http,$cordovaImagePicker,$cordovaFileTransfer,$ionicLoading,OpenFB){

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
      $http.post('http://localhost:1337/editUser',{favorite_club: value}).success(function(){
        self.user.favorite_club = value;
        self.toEdit[0] = false;
      });
    }
  }

  $scope.editPoste = function(value){
    var self = this;
    if(value.length>0){
      $http.post('http://localhost:1337/editUser',{poste: value}).success(function(){
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
      $cordovaFileTransfer.upload('http://localhost:1337/user/uploadProfilPic', results[0], optionsFt)
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
    $http.post('http://localhost:1337/session/delete',{uuid : window.device.uuid});
  io.socket.post('http://localhost:1337/connexion/delete');
  $rootScope.toShow = true;
  if($localStorage.user.pushToken)
    $http.post('http://localhost:1337/push/delete',{push_id : $localStorage.user.pushToken});
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
    $scope.friendsId = [];
    angular.forEach($localStorage.friends,function(friend){
      $scope.friendsId.push(friend.id);
    });
    if(word.length>1){
     $http.get('http://localhost:1337/search/'+word).success(function(data){
      $scope.results = data;
    });
   }
   else
    $scope.results = [];
}
$scope.addFriend = function(target){
  $http.post('http://localhost:1337/addFriend',{user1: $localStorage.user.id, user2: target}).success(function(data){
    $localStorage.newFriend = true; //Load actu of new friend on refresh
    var notif = {user: target, related_user: $localStorage.user.id, typ:'newFriend', related_stuff:$localStorage.user.id};
    notify(notif);
    data.statut = 0;
    $localStorage.friends.push(data);
    $localStorage.friends[$localStorage.friends.length-1].statut = 0;
    $scope.friendsId.push(data.id);
  });
}

$scope.createChat = function(user){

  $http.post('http://localhost:1337/chat/create',{users :[$localStorage.user.id, user.id], typ:1}).success(function(chat){
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
  $http.get('http://localhost:1337/getDetailledGrades/'+$scope.user.id).success(function(data){
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




//Move back side menu




})

.controller('MenuController', function($scope, $ionicSideMenuDelegate,$localStorage) { 
  $scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };
})