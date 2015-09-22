angular.module('user',[])

.controller('UserCtrl',function($scope, $q, $rootScope, $stateParams,$localStorage,$location,$ionicModal,$http,$cordovaImagePicker,$cordovaFileTransfer,$ionicLoading,$handleNotif, $cordovaSms,$searchLoader, $ionicPopup, fbConnect, mySock, push){


  $scope.user = $localStorage.getObject('user');
  $rootScope.friends = $localStorage.getArray('friends');
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
      $http.post(serverAddress+'/editUser',{favorite_club: value}).success(function(){
        self.user.favorite_club = value;
        self.toEdit[0] = false;
      });
    }
  }

  $scope.editPoste = function(value){
    var self = this;
    if(value.length>0){
      $http.post(serverAddress+'/editUser',{poste: value}).success(function(){
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
          userId: $localStorage.getObject('user').id
        },
        headers : {
          Authorization:$localStorage.get('token')
        }
      };
      $cordovaFileTransfer.upload(serverAddress+'/user/uploadProfilPic', results[0], optionsFt)
      .then(function(result) {  
        // Success!
        console.log('hello');
        setTimeout(function(){
          user = $localStorage.getObject('user')
          user.picture = result.response+'#'+ new Date().getTime();  //Reset cache
          $localStorage.setObject('user',user); 
          $scope.user.picture = $localStorage.getObject('user').picture;
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
 mySock.req(serverAddress+'/connexion/delete');
 $rootScope.toShow = true;
 $rootScope.notifs = [];
 if($localStorage.getObject('user').pushToken){
  $http.post(serverAddress+'/push/delete',{push_id : $localStorage.getObject('user').pushToken}).success(function(){
    $localStorage.clearAll();
    $location.path('/');
    push.unregister();
  });
}
else{
  $localStorage.clearAll();
  $location.path('/');
}

};





var getBug = function(callback){
  $scope.bug = {};
  $ionicPopup.show({
    template: '<select     style="width: 100%;font-size: 16px;"ng-model="bug.option"><option value="" selected="true" disabled="disabled">Choisissez le type de bug</option><option value="1">Design</option><option value="2">Fonctionnalité</option></select><textarea placeholder="Expliquer brievement le bug" rows="5" ng-model="bug.texte"     style="height: 100px; margin-top: 10px;"></textarea><p class="err_container"> {{err}} </p>',
    title: 'Soumettre un bug',
    subTitle: 'Nous vous remercions par avance de cette soumission. Notre équipe corrigera ce bug dès que possible.',
    scope: $scope,
    buttons: [
    { text: 'Annuler' },
    {
      text: '<b>Envoyer</b>',
      type: 'button-positive',
      onTap: function(e) {
        if (!$scope.bug.option && !$scope.bug.texte) {
            $scope.err = "Veuillez remplir les deux champs";
            e.preventDefault();
          } else {
            callback("[DATE : "+new Date()+"] [TYPE : "+$scope.bug.option+"] [TEXTE : "+$scope.bug.texte+"] ");
          }
        }
      }
      ]
    });
}


$scope.bugReport = function (){
 getBug(function(data){
   var bug = data;
   // bug.user = $localStorage.getObject('user').id;
   // bug.phone = device.model;
   // bug.phone_version = device.version;
   bug+= "[USER : "+$localStorage.getObject('user').id+"] [PHONE : "+device.model+"] [VERSION : "+device.version+"]";
   console.log(bug);
   $http.post(serverAddress+'/bugreport/addCard',{bug:bug}).success(function(){
   });

 });
 
}
  //MODAL HANDLER

  $ionicModal.fromTemplateUrl('templates/search.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.openModal = function() {
    $scope.word ="";
    $scope.modal.show();
    $searchLoader.hide();
  };

  $scope.closeModal = function() {
    $scope.modal.hide();
    $searchLoader.hide();
  }; 

  $scope.switchSearchFb = function(){
    $('.opened_search').removeClass('opened_search');
    $('.switch_fb').addClass('opened_search');
    $('.hidden').removeClass('hidden');
    $('.content_wf_search').addClass('hidden');
    if (!window.cordova) {
      //this is for browser only
      facebookConnectPlugin.browserInit(1133277800032088);
    }
    facebookConnectPlugin.getLoginStatus(function(success){
      fbConnect.getFacebookFriends().then(function(data){
        $scope.facebookFriends = data.data;
        //IDs of my facebookFriends list
        $scope.facebookFriendsId = _.pluck(_.filter($localStorage.getArray('friends'), function(friend){if(friend.facebook_id) return true}), 'facebook_id');
        console.log($scope.facebookFriendsId);
        $searchLoader.hide();
      });
    });
  }


  $scope.switchSearchWf = function(){
    $('.opened_search').removeClass('opened_search');
    $('.switch_wf').addClass('opened_search');
    $('.hidden').removeClass('hidden');
    $('.content_fb_search').addClass('hidden');
    $searchLoader.hide();
  }
  $scope.searchQuery = function(word){
    $searchLoader.show();
    $rootScope.friendsId = _.pluck($localStorage.getArray('friends'),'id');
    if(word.length>1){
     $http.get(serverAddress+'/search/'+word).success(function(data){
      $searchLoader.hide();
      $scope.results = data;
    });
   }
   else{
    $scope.results = [];
    $searchLoader.hide();
  }
}

//Lock addFriend
$scope.lockFriend;

//facebookFriend = true, target = facebook_id
//facebookFriend = false, target = user.id
$scope.addFriend = function(target, facebookFriend){
  var postData = {};
  if(facebookFriend){
    postData = {user1: $localStorage.getObject('user').id, facebook_id: target};
    $scope.lockFriend = target;
    $scope.facebookFriendsId.push(target);
    console.log($scope.facebookFriendsId);
  }
  else{
    postData = {user1: $localStorage.getObject('user').id, user2: target};
    $scope.lockFriend = target;
  }

  $http.post(serverAddress+'/addFriend',postData).success(function(data){
    $localStorage.newFriend = true; //Load actu of new friend on refresh
    var notif = {user: target, related_user: $localStorage.getObject('user').id, typ:'newFriend', related_stuff:$localStorage.getObject('user').id};
    $handleNotif.notify(notif);
    data.statut = 0;
    var friends = $localStorage.getArray('friends');
    friends.push(data);
    $localStorage.setObject('friends',friends);
    $rootScope.friends.push(data);
    console.log($rootScope.friends);
    $scope.word ="";
    $scope.lockFriend ="";
  });
}


$scope.isFriend = function(userId, facebookFriend){
  if(facebookFriend){
    if($scope.facebookFriendsId.indexOf(userId.toString())>-1 || $scope.lockFriend == userId){
      return true;
    }
    else
      return false;
  }
  if (_.pluck($rootScope.friends, 'id').indexOf(userId)>-1 || $scope.lockFriend == userId){
    return true;
  }
  else{
    return false;
  }
  
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
  $http.get(serverAddress+'/getDetailledGrades/'+$scope.user.id).success(function(data){
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
            $cordovaSms.send('', 'Téléchargez wefoot sur', options).then(function() {
              $ionicLoading.show({ template: 'Message envoyé!', noBackdrop: true, duration: 2000 });
            }, function(error) {
              console.log('error');
            });
          };

        })

.controller('MenuController', function($scope, $ionicSideMenuDelegate,$localStorage) { 
  $scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };
})