angular.module('foot',[]).controller('FootController', function ($scope, $cordovaDatePicker,$ionicModal,$http,$localStorage,$location,$ionicLoading,$state,$handleNotif,$cordovaGeolocation,$rootScope,$searchLoader) {

 $scope.go = function(id){
  $location.path('/foot/'+id);
} 


$scope.foot = {};
$scope.results = [];
$scope.tab = "1";
if($localStorage.getObject('friends')){
  $rootScope.friends = $localStorage.getObject('friends');

}
if($localStorage.fieldChosen){
  $scope.foot.field = $localStorage.fieldChosen.id;
  $scope.results[0] = $localStorage.fieldChosen;
}
if($localStorage.getObject('user').id){
  $scope.foot.created_by = $localStorage.getObject('user').id;
}
$scope.foot.toInvite = [];
$scope.addToFoot = function(id){
  var index = $scope.foot.toInvite.indexOf(id);
  if(index>-1)
    $scope.foot.toInvite.splice(index,1);
  else
    $scope.foot.toInvite.push(id);
}

  // minDate = ionic.Platform.isIOS() ? new Date() : (new Date()).valueOf();

  var options = {
    date: new Date(),
    mode: 'date',
    minDate:  new Date(),
      // allowOldDates: false,
      // allowFutureDates: true,
      doneButtonLabel: 'OK',
      doneButtonColor: '#000000',
      cancelButtonLabel: 'CANCEL',
      cancelButtonColor: '#000000'
    };
    
    var options1 = {
      date: new Date(),
      minDate: new Date(),
      minuteInterval: 30,
      mode: 'time', // or 'time'
      doneButtonLabel: 'OK',
      doneButtonColor: '#000000',
      cancelButtonLabel: 'CANCEL',
      cancelButtonColor: '#000000'
    };
    $scope.showDatePicker = function(){
      $cordovaDatePicker.show(options).then(function(date){
        var jour = new Date(date);
        console.log(jour);
        $scope.foot.date.setDate(jour.getDate());
        $scope.foot.date.setMonth(jour.getMonth());
        $scope.foot.date.setFullYear(jour.getFullYear());
        $scope.date = getJour($scope.foot.date);
      });
    }
    $scope.showHourPicker = function(){
      $cordovaDatePicker.show(options1).then(function(hour){
        var hours = new Date(hour);
        console.log(hour);
        $scope.foot.date.setHours(hours.getHours());
        $scope.foot.date.setMinutes(new Date(hours).getMinutes());
        $scope.hour = getHour($scope.foot.date);
      });
    }
    if($location.path().indexOf('footparams')>0){
  $scope.foot.date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); //DEFAULT TOMMOROW
  $scope.foot.date.setHours(20,30);
  $scope.hour = getHour($scope.foot.date);
  $scope.date = getJour($scope.foot.date);
  $scope.foot.nb_player = 10;
  $scope.foot.friend_can_invite = true;
  $scope.foot.priv = true;
  $scope.foot.level = 0;
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
  if(word.length>1){
    $searchLoader.show();
    $http.get('http://'+serverAddress+'/field/search/'+$localStorage.getObject('user').id+'/'+word).success(function(data){
      $scope.results = data;
      $searchLoader.hide();
    });
  }
  else if(word.length==0) {
    $searchLoader.show();
    var posOptions = {timeout: 10000, enableHighAccuracy: false};
    $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
      var lat  = position.coords.latitude
      var long = position.coords.longitude
      $http.get('http://'+serverAddress+'/field/near/'+lat+'/'+long).success(function(data){
        $searchLoader.hide();
        $scope.results = data;
     });
    }, function(err) {
      // error
    });
    
  }
}
//QUERY INIT WHEN NO SEARCH HAS BEEN STARTED
$scope.searchQuery('');

$scope.chooseField = function(field){
  $localStorage.fieldChosen = field;
  $location.path('/footparams');
}
$scope.launchReq = function(){

  $scope.foot.created_by = $localStorage.getObject('user').id;

  $http.post('http://'+serverAddress+'/foot/create',$scope.foot).success(function(foot){
    async.each($scope.foot.toInvite,function(invited,callback){
      $handleNotif.notify({user:invited, related_user: $localStorage.getObject('user').id, typ:'footInvit',related_stuff: foot.id},function(){
        callback();
      },true);
    },function(){});
    var chatters = [];
    chatters = $scope.foot.toInvite;
    chatters.push($localStorage.getObject('user').id);
    $http.post('http://'+serverAddress+'/chat/create',{users :chatters, typ:2, related:foot.id, desc:"Foot de "+$localStorage.getObject('user').first_name}).success(function(){
    });
    $location.path('/foot/'+foot.id);
  });
}

if($location.path().indexOf('user/foots')>0){
  $ionicLoading.show({
    content: 'Loading Data',
    animation: 'fade-out',
    showBackdrop: true
  });
  
  var loadFoot = function(callback2){
    $localStorage.footInvitation = [];
    $localStorage.footTodo = [];
    $http.get('http://'+serverAddress+'/getFootByUser/'+$localStorage.getObject('user').id).success(function(data){ //Send status with it as an attribute
      if(data.length==0) $ionicLoading.hide();
      async.each(data, function(foot,callback){
        $http.get('http://'+serverAddress+'/foot/getInfo/'+foot.id).success(function(elem){
          foot.organisator = elem.orga;
          foot.orgaName = elem.orgaName;
          foot.field = elem.field;
          foot.orgaPic = elem.picture;
          foot.dateString = getJour(new Date(foot.date))+', '+getHour(new Date(foot.date));
          callback();
        });
        if(foot.statut==1)
          $localStorage.footInvitation.push(foot);
        else if(foot.statut>1)
          $localStorage.footTodo.push(foot);
      },function(){
        $scope.footInvitation = $localStorage.footInvitation;
        $scope.footTodo = $localStorage.footTodo;
        $ionicLoading.hide();
        if(callback2)
          callback2();
      });
    });
  }

  loadFoot();

  $scope.refresh = function(){
    loadFoot(function(){
      $scope.$broadcast('scroll.refreshComplete');
    });
  }

}

var posOptions = {timeout: 10000, enableHighAccuracy: false};
$cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
  var lat  = position.coords.latitude
  var long = position.coords.longitude
  var user = $localStorage.getObject('user');
  user.lat = lat;
  user.long=long;
  $localStorage.setObject('user',user);
}, function(err) {
      // error
    });

})











.controller('SingleFootController', function ($scope,$http,$localStorage,$location,$stateParams,$ionicLoading,$ionicModal,$confirmation,$cordovaDatePicker,$handleNotif,$rootScope) {
  $ionicLoading.show({
    content: 'Loading Data',
    animation: 'fade-out',
    showBackdrop: true
  });
  $scope.user = $localStorage.getObject('user');
  $rootScope.friends = $localStorage.getObject('friends');
  $scope.players = [];
  $scope.ready = false; //Show after loading
  // Here we are going to call 2 queries in the same time, the first should be faster, but to make sur we create 2 variables

  var loadInfo = function(callback2){
    var date;
    var finish = false;
    $http.get('http://'+serverAddress+'/foot/get/'+$stateParams.id).success(function(data){  //Get foot attributes
      $scope.foot = data;
      date = new Date(data.date);
      date = getJour(date)+' '+getHour(date);
      $http.get('http://'+serverAddress+'/foot/getInfo/'+$stateParams.id).success(function(info){  //Get foot info
        $scope.foot.organisator = info.orga;
        $scope.foot.orgaName = info.orgaName;
        $scope.foot.field = info.field;
        if(finish) $scope.ready = true;
        finish = true;
      });
    });

    $http.get('http://'+serverAddress+'/foot/getAllPlayers/'+$stateParams.id).success(function(allPlayers){  //Get list of playersId
      $scope.invited = _.pluck(_.filter(allPlayers,function(player){return player.statut>0}),'user');
      $scope.isInvited = ($scope.invited.indexOf($localStorage.getObject('user').id)>-1);
      $scope.isPending =  (_.pluck(_.filter(allPlayers,function(player){return player.statut==0}),'id').indexOf($localStorage.getObject('user').id)>-1);
      data = _.filter(allPlayers,function(player){return player.statut>1});
      data = _.pluck(data,'user'); //All confirmed players ids.
      $scope.isPlaying = (data.indexOf($localStorage.getObject('user').id)>-1);
      async.each(data, function(player,callback){
          $http.get('http://'+serverAddress+'/user/get/'+player).success(function(user){   //Get all players attributes
            $scope.players.push(user);
            callback();
          });
        },function(err){             //Indicate loading all players is finish
          $scope.date = date;
          if(finish) $scope.ready = true;
          $ionicLoading.hide();
          finish = true; // Show everything
          if(callback2) callback2();
        });
    });
}
loadInfo();

$scope.refresh = function(){
    $scope.ready = false; //Hide everything
    $scope.foot = {};
    $scope.players = [];
    loadInfo(function(){
      $scope.$broadcast('scroll.refreshComplete');
    });
  }

  $scope.removePlayer = function(userId,Invit){
    $http.post('http://'+serverAddress+'/foot/removePlayer',{foot: $scope.foot.id, user: $localStorage.getObject('user').id}).success(function(){
      if(!$scope.isPlaying){
        var plucked = _.pluck($localStorage.footInvitation,'id');
        index = plucked.indexOf($scope.foot.id);
        if(index>-1) $localStorage.footInvitation.splice(index,1);
      }
      else{
        var plucked = _.pluck($localStorage.footTodo,'id');
        index = plucked.indexOf($scope.foot.id);
        console.log(index);
        if(index>-1) $localStorage.footTodo.splice(index,1);
      }
      $location.path('/user/foots');
    });
  }

  var deleteFoot = function(userId){
    $http.post('http://'+serverAddress+'/foot/deleteFoot',{foot: $scope.foot.id, user: $scope.foot.user}).success(function(){
      var pos = _.pluck($scope.players,'id').indexOf($localStorage.getObject('user').id);
      var toNotify = $scope.players; //Notify all players except the organisator
      toNotify.splice(pos,1);
      if(toNotify.length == 0) $location.path('/user/foots');
      async.each(toNotify,function(guy,callback){
        $handleNotif.notify({user:guy.id,related_user:$localStorage.getObject('user').id,typ:'footAnnul',related_stuff:$scope.foot.id},function(){callback();},true);
      },function(){
        var plucked = _.pluck($localStorage.footTodo,'id');
        index = plucked.indexOf($scope.foot.id);
        if(index>-1) $localStorage.footTodo.splice(index,1);
        $location.path('/user/foots');
      });
    });
  }

  $scope.confirmDelete = function(userId){
    $confirmation('annuler ce foot?',function(){deleteFoot(userId)});
  }

  $scope.playFoot = function(player){
    $http.post('http://'+serverAddress+'/player/update',{foot:$scope.foot.id,user:player}).success(function(){
      $scope.isPlaying = true;
      $scope.players.push($localStorage.getObject('user'));
      var plucked = _.pluck($localStorage.footInvitation,'id');
      index = plucked.indexOf($scope.foot.id);
      if(index>-1) $localStorage.footInvitation.splice(index,1);
      $scope.foot.dateString = $scope.date;
      var indexOrga = _.pluck($scope.players,'id');
      indexOrga = indexOrga.indexOf($scope.foot.created_by);
      $scope.foot.orgaPic = $scope.players[indexOrga].picture;
      $localStorage.footTodo.push($scope.foot);
      var notif = {user:$scope.foot.organisator, related_user: $scope.user.id, typ:'footConfirm', related_stuff:$scope.foot.id};
      $handleNotif.notify(notif,function(){},true);
    });
  }

  $scope.openPublic = function(){
    $http.post('http://'+serverAddress+'/foot/update',{id: $scope.foot.id, priv: false}).success(function(){
      $scope.foot.priv = false;
    });
  }

  $scope.closePublic = function(){
    $http.post('http://'+serverAddress+'/foot/update',{id: $scope.foot.id, priv: true}).success(function(){
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
      $http.post('http://'+serverAddress+'/foot/sendInvits',$scope.foot).success(function(){
        async.each($scope.foot.toInvite,function(invited,callback){
          $handleNotif.notify({user:invited, related_user: $localStorage.getObject('user').id, typ:'footInvit',related_stuff: $scope.foot.id},function(){
            callback();
          },true);
        },function(){$scope.invited = $scope.invited.concat($scope.foot.toInvite);});

      });
    }
    $scope.modal2.hide();
  };
  $scope.addToFoot = function(id) {
    $scope.foot.toInvite.push(id);
  };
  $scope.askToPlay = function(id){
      $http.post('http://'+serverAddress+'/foot/askToPlay',{userId: id, foot: $scope.foot.id}).success(function(){
        $handleNotif.notify({user:$scope.foot.created_by, related_user: $localStorage.getObject('user').id, typ:'footDemand', related_stuff: $localStorage.getObject('user').id},function(){},true);
        $scope.isPending = true;
      });
    };

    $scope.openModal2 = function() {
      $scope.foot.toInvite = [];
      $scope.modal2.show();
    };
    $scope.closeModal2 = function(){
      if($scope.foot.toInvite.length>0){
          $http.post('http://'+serverAddress+'/foot/sendInvits',$scope.foot).success(function(){
            io.socket.post('http://'+serverAddress+'/actu/footInvit',{from: $localStorage.getObject('user').id, toInvite: $scope.foot.toInvite, id: $scope.foot.id});
            $scope.invited = $scope.invited.concat($scope.foot.toInvite);
          });
        }
        $scope.modal2.hide();
      };
      $scope.addToFoot = function(id) {
        $scope.foot.toInvite.push(id);
      };
      $scope.askToPlay = function(id){
          $http.post('http://'+serverAddress+'/foot/askToPlay',{userId: id, foot: $scope.foot.id}).success(function(){
            notify({user:$scope.foot.created_by, related_user: $localStorage.getObject('user').id, typ:'footDemand', related_stuff: $localStorage.getObject('user').id});
            $scope.isPending = true;
          });
        };





//Modal edit


$ionicModal.fromTemplateUrl('templates/modalEdit.html', {
  scope: $scope,
  animation: 'slide-in-up'
}).then(function(modal) {
  $scope.modal3 = modal;
});

$scope.openModal3 = function() {
  $scope.hour = getHour($scope.foot.date);
  $scope.date = getJour($scope.foot.date);
  $scope.foot.date = new Date($scope.foot.date);
  $scope.selectedField = {};
  $scope.oldFoot = {};
  angular.copy($scope.foot.field,$scope.selectedField);
  angular.copy($scope.foot, $scope.oldFoot);
  $scope.modal3.show();
};

$scope.closeModal3 = function(launch){
  $scope.modal3.hide();
  if(launch){
      $scope.foot.field = $scope.selectedField.id; //Just send the id
      console.log($scope.foot);
      $http.post('http://'+serverAddress+'/foot/update',$scope.foot).success(function(){
        $scope.foot.field = $scope.selectedField;
        var toNotify = _.filter($scope.players,function(player){return player.id != $localStorage.getObject('user').id});
        async.each(toNotify,function(player){
          $handleNotif.notify({user:player.id,related_user: $localStorage.getObject('user').id,typ:'footEdit',related_stuff:$scope.foot.id},function(){},true);
        });
      });
    }
    else{
      angular.copy($scope.oldFoot,$scope.foot);
      console.log($scope.foot);
      date = new Date($scope.foot.date);
      $scope.date = getJour(date)+' '+getHour(date);
    }
  };


  $scope.searchField = function(word){
    if(word.length>1){
        $http.get('http://'+serverAddress+'/field/search/'+$localStorage.getObject('user').id+'/'+word).success(function(data){
          $scope.fields = data;
        });
      }
      else
        $scope.fields = [];
    };

    $scope.updateField = function(field){
      $scope.selectedField = field;
      $scope.fields = [];
    };

    var options = {
      date: new Date(),
      mode: 'date',
      minDate:  new Date(),
      // allowOldDates: false,
      // allowFutureDates: true,
      doneButtonLabel: 'OK',
      doneButtonColor: '#000000',
      cancelButtonLabel: 'CANCEL',
      cancelButtonColor: '#000000'
    };
    
    var options1 = {
      date: new Date(),
      minDate: new Date(),
      mode: 'time', // or 'time'
      doneButtonLabel: 'OK',
      doneButtonColor: '#000000',
      cancelButtonLabel: 'CANCEL',
      cancelButtonColor: '#000000'
    };


    $scope.showDatePicker = function(){
      $cordovaDatePicker.show(options).then(function(date){
        var jour = new Date(date);
        $scope.foot.date.setDate(jour.getDate());
        $scope.foot.date.setMonth(jour.getMonth());
        $scope.foot.date.setFullYear(jour.getFullYear());
        $scope.date = getJour($scope.foot.date);
        console.log($scope.date);
      });
    }
    $scope.showHourPicker = function(){
      $cordovaDatePicker.show(options1).then(function(hour){
        var hours = new Date(hour);
        $scope.foot.date.setHours(hours.getHours());
        $scope.foot.date.setMinutes(new Date(hours).getMinutes());
        $scope.hour = getHour($scope.foot.date);
        console.log($scope.hour);
      });
    }

    $scope.launchChat = function (footId){
      $localStorage.chats.forEach(function(chat){
        if(chat.typ==2 && chat.related == footId){
          $localStorage.chat = chat;
          $location.path('/conv');
        }
      });
    };

  })



.controller('FootFinderController', function ($scope,$http,$localStorage,$location,$cordovaGeolocation) {
  $scope.go = function(id){
    $location.path('/foot/'+id);
  } 
  $scope.params = {dateValue: '0', field: '', date: new Date() };
  var dates = [new Date(new Date().getTime()), new Date(new Date().getTime() + 24 * 60 * 60 * 1000), new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000),
  new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000),new Date(new Date().getTime() + 4 * 24 * 60 * 60 * 1000)];
  $scope.getData = function(params){
    $http.post('http://'+serverAddress+'/foot/query',$scope.params).success(function(data){
      $scope.results =[];
      async.each(data,function(foot,callback){
        var finish = false;
        $http.get('http://'+serverAddress+'/foot/getInfo/'+foot.id).success(function(info){  //Get foot info
          foot.organisator = info.orga;
          foot.orgaName = info.orgaName;
          foot.field = info.field;
          foot.orgaPic = info.picture;
          $scope.results.push(foot);
          callback();
        });
      });
    });
  }


  $scope.updatedAte = function(){
    ind = parseInt($scope.params.dateValue);
    $scope.date = getJour(dates[ind]);
    $scope.params.date = dates[ind];
    $scope.getData($scope.params);
  }
  $scope.updatedAte();

  var posOptions = {timeout: 10000, enableHighAccuracy: false};
  $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
    var lat  = position.coords.latitude
    var long = position.coords.longitude
    var user = $localStorage.getObject('user');
    user.lat=lat;
    user.long=long;
    $localStorage.setObject('user',user);
  }, function(err) {
      // error
    });

})