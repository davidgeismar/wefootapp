angular.module('foot',[]).controller('FootController', function ($scope, $cordovaDatePicker,$ionicModal,$http,$localStorage,$location,$ionicLoading) {
  
 $scope.go = function(id){
  console.log('hello');
  $location.path('/foot/'+id);
} 

$scope.foot = {};
$scope.results = [];
$scope.tab = "1";
if($localStorage.friends){
  $scope.friends = $localStorage.friends;

}
if($localStorage.fieldChosen){
  $scope.foot.field = $localStorage.fieldChosen.id;
  $scope.results[0] = $localStorage.fieldChosen;
}
if($localStorage.user.id){
  $scope.foot.created_by = $localStorage.user.id;
}
$scope.foot.toInvite = [];
$scope.addToFoot = function(id){
  var index = $scope.foot.toInvite.indexOf(id);
  if(index>-1)
    $scope.foot.toInvite.splice(index,1);
  else
    $scope.foot.toInvite.push(id);
}

  $scope.foot.date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); //DEFAULT
  $scope.hour = getHour($scope.foot.date);
  $scope.date = getJour($scope.foot.date);
  $scope.foot.nbPlayer = 10;
  $scope.foot.friendCanInvite = true;
  $scope.foot.priv = true;
  $scope.foot.level = 0;
  
  var options = {
    date: new Date(),
      mode: 'date', // or 'time'
      minDate: new Date() - 10000,
      allowOldDates: false,
      allowFutureDates: true,
      doneButtonLabel: 'DONE',
      doneButtonColor: '#F2F3F4',
      cancelButtonLabel: 'CANCEL',
      cancelButtonColor: '#000000'
    };
    
    var options1 = {
      date: new Date(),
      mode: 'time', // or 'time'
      doneButtonLabel: 'DONE',
      doneButtonColor: '#F2F3F4',
      cancelButtonLabel: 'CANCEL',
      cancelButtonColor: '#000000'
    };
    $scope.showDatePicker = function(){
      $cordovaDatePicker.show(options).then(function(date){
        $scope.foot.date = date
      });
    }
    $scope.showHourPicker = function(){
      $cordovaDatePicker.show(options1).then(function(hour){
        $scope.foot.hour = hour;
      });
    }


    if($location.path().indexOf('footparams')>0){
      $scope.date = $scope.foot.date.toLocaleDateString();
      $scope.hour = parseInt($scope.foot.date.toLocaleTimeString().substring(0,2))+1+'h00';
      $ionicModal.fromTemplateUrl('modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal1 = modal;
      });

      $scope.openModal1 = function() {
        $scope.modal1.show();
      };
      $scope.closeModal1 = function() {
        $scope.modal1.hide();
      };
  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });
} 

$scope.searchQuery = function(word){
  if(word.length>2){
   $http.get('http://localhost:1337/field/search/'+word).success(function(data){
    $scope.results = data;
    console.log(data);
  }).error(function(){
    console.log('error');
  });
}
}

$scope.chooseField = function(field){
  $localStorage.fieldChosen = field;
  $location.path('/footparams');
}
$scope.launchReq = function(){
  $http.post('http://localhost:1337/foot/create',$scope.foot).success(function(){
    console.log('success');
    io.socket.post('http://localhost:1337/actu/footInvit',$scope.foot,function(err){
      console.log('sent');
      var chatters = [];
      chatters = $scope.foot.toInvite;
      chatters.push($localStorage.user.id);
      $http.post('http://localhost:1337/chat/create',{users :chatters, typ:2}).success(function(){
      });
    });
  }).error(function(){
    console.log('err');
  });
}

if($location.path().indexOf('user/foots')>0){
  $ionicLoading.show({
    content: 'Loading Data',
    animation: 'fade-out',
    showBackdrop: true
  });
  $localStorage.footInvitation = [];
  $localStorage.footTodo = [];
  $localStorage.footPlayers = []; //EACH LINE FOR EACH PLAYERS
  var count = 0;
  $http.get('http://localhost:1337/getFootByUser/'+$localStorage.user.id).success(function(data){ //Send status with it as an attribute
    angular.forEach(data, function(foot,index){
      $localStorage.footPlayers[index] = [];
      $localStorage.footPlayers[index].push(foot.id); //FIRST COLUMN CONTAIN ID OF FOOTS 
      $http.get('http://localhost:1337/foot/getInfo/'+foot.id).success(function(elem){
        foot.organisator = elem.orga;
        foot.orgaName = elem.orgaName;
        foot.field = elem.field;
        count++;
        if(count == 2*data.length){
          $scope.footInvitation = $localStorage.footInvitation;
          $scope.footTodo = $localStorage.footTodo;
          $scope.footPlayers = $localStorage.footPlayers;
          $ionicLoading.hide();
        }
      });
      $http.get('http://localhost:1337/foot/getPlayers/'+foot.id).success(function(players){
        $localStorage.footPlayers[index] = $localStorage.footPlayers[index].concat(players);
        foot.confirmedPlayers = players.length;
        count++;
        if(count == 2*data.length){
          $scope.footInvitation = $localStorage.footInvitation;
          $scope.footTodo = $localStorage.footTodo;
          $scope.footPlayers = $localStorage.footPlayers;
          $ionicLoading.hide();
        }
      });

      if(foot.statut==1)
        $localStorage.footInvitation.push(foot);
      else if(foot.statut>1)
        $localStorage.footTodo.push(foot);
    });
});
}
})


.controller('SingleFootController', function ($scope,$http,$localStorage,$location,$stateParams,$ionicLoading,$ionicModal) {
  $ionicLoading.show({
    content: 'Loading Data',
    animation: 'fade-out',
    showBackdrop: true
  });
  $scope.user = $localStorage.user;
  $scope.friends = $localStorage.friends;
  var foot = {};  //Show them after the loading;
  var players = [];
  var isLoaded = false;
  var position = -1;
  if($localStorage.footPlayers){
    for (var i=0; i<$localStorage.footPlayers.length; i++){
      if($localStorage.footPlayers[i][0] == $stateParams.id){                   //Check if foot info are already loaded;
        isLoaded = true;
        position = i;             //Keep position to get players
      }
    }
  }

  // Here we are going to call 2 queries in the same time, the first should be faster, but to make sur we create 2 variables
  // called isFinish that indicates queries are finish, and we can update scope only when all the data is loaded.
  if(!isLoaded){
    var date;
    $http.get('http://localhost:1337/foot/get/'+$stateParams.id).success(function(data){  //Get foot attributes
      foot = data;
      date = new Date(data.date);
      date = getJour(date)+' '+getHour(date);
      $http.get('http://localhost:1337/foot/getInfo/'+$stateParams.id).success(function(info){  //Get foot info
        foot.organisator = info.orga;
        foot.orgaName = info.orgaName;
        foot.field = info.field;
      });
    });

    $http.get('http://localhost:1337/foot/getPlayers/'+$stateParams.id).success(function(data){  //Get list of playersId
      $scope.isPlaying = (data.indexOf($localStorage.user.id)>-1);
      async.each(data, function(player,callback){
          $http.get('http://localhost:1337/user/get/'+player).success(function(user){   //Get all players attributes
            players.push(user);
            callback();
          });
        },function(err){             //Indicate loading all players is finish
          foot.confirmedPlayers = players.length;
          $scope.players = players;
          $scope.foot = foot;
          $scope.date = date;
          $ionicLoading.hide();
        });
    });
  }
  if(isLoaded){
    var index = -1;
    for (var i=0; i<$localStorage.footTodo.length;i++){ //GET THE RIGHT FOOT
      if($localStorage.footTodo[i].id == $stateParams.id){
        index = i;
        foot = $localStorage.footTodo[i];
      }
    }
    if(index==-1){                                                         
      for (var i=0; i<$localStorage.footInvitation.length;i++){ //GET THE RIGHT FOOT
        if($localStorage.footInvitation[i].id == $stateParams.id){
          index = i;
          foot = $localStorage.footInvitation[i];
        }
      }
    }
    $scope.isPlaying = ($localStorage.footPlayers[index].indexOf($localStorage.user.id)>-1);
    var realPlayers = $localStorage.footPlayers[position];
    realPlayers.shift();
    async.each(realPlayers,function(player,callback){
       $http.get('http://localhost:1337/user/get/'+player).success(function(data){   //Get all players attributes
        players.push(data);
        callback();
      });
     },function(){
            //Indicate loading is finish
            foot.confirmedPlayers = players.length;
            $scope.players = players;
            $scope.foot = foot;
            $scope.date = date;
            $ionicLoading.hide();
          });
  }

  $http.get('http://localhost:1337/foot/getInvited/'+$stateParams.id).success(function(data){
    $scope.invited = data;
  });

  $scope.removePlayer = function(userId,Invit){
    $http.post('http://localhost:1337/foot/removePlayer',{foot: $scope.foot.id, user: $scope.foot.user}).success(function(){
      if(Invit){
        var plucked = _.pluck($localStorage.footInvitation,'id');
        index = plucked.indexOf($scope.foot.id);
        if(index>-1) $localStorage.footInvitation.splice(index,1);
      }
      else{
        var plucked = _.pluck($localStorage.footTodo,'id');
        index = plucked.indexOf($scope.foot.id);
        if(index>-1) $localStorage.footTodo.splice(index,1);
      }
      $location.path('/user/foots');
    });
  }

  $scope.deleteFoot = function(userId){
    $http.post('http://localhost:1337/foot/deleteFoot',{foot: $scope.foot.id, user: $scope.foot.user}).success(function(){
      var plucked = _.pluck($localStorage.footTodo,'id');
      index = plucked.indexOf($scope.foot.id);
      if(index>-1) $localStorage.footTodo.splice(index,1);
      $location.path('/user/foots');
    });
  }

  $scope.playFoot = function(player){
    $http.post('http://localhost:1337/player/update',{foot:$scope.foot.id,user:player}).success(function(){
      $scope.isPlaying = true;
      $scope.players.push($localStorage.user);
      var notif = {user:$scope.foot.organisator, related_user: $scope.user.id, typ:'footConfirm', related_stuff:$scope.foot.id};
      notify(notif);
    }).error(function(){
      $scope.error = "Erreur participation non enregistrée";
    });
  }

  $scope.openPublic = function(){
    $http.post('http://localhost:1337/foot/update',{id: $scope.foot.id, priv: false}).success(function(){
      $scope.foot.priv = false;
    });
  }

  $scope.closePublic = function(){
    $http.post('http://localhost:1337/foot/update',{id: $scope.foot.id, priv: true}).success(function(){
      $scope.foot.priv = true;
    });
  }

  $ionicModal.fromTemplateUrl('templates/modalInvit.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal2 = modal;
  });

  $scope.openModal2 = function() {
    $scope.foot.toInvite = [];
    $scope.modal2.show();
  };
  $scope.closeModal2 = function(){
    if($scope.foot.toInvite.length>0){
      $http.post('http://localhost:1337/foot/sendInvits',$scope.foot).success(function(){
        io.socket.post('http://localhost:1337/actu/footInvit',{from: $localStorage.user.id, toInvite: $scope.foot.toInvite, id: $scope.foot.id});
      });
    }
    $scope.modal2.hide();
  };
  $scope.addToFoot = function(id) {
    $scope.foot.toInvite.push(id);
  };

})