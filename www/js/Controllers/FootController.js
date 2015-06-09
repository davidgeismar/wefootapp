angular.module('foot',[]).controller('FootController', function ($scope, $cordovaDatePicker,$ionicModal,$http,$localStorage,$location,$ionicLoading) {
  
   $scope.go = function(id){
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
          // $scope.foot.date = date.substring(0,11)+ $scope.foot.hour.substring(12,24);
          // console.log($scope.foot.date);
         });
    }
      $scope.showHourPicker = function(){
        $cordovaDatePicker.show(options1).then(function(hour){
        var hours = new Date(hour);
        $scope.foot.date.setHours(hours.getHours());
        $scope.foot.date.setMinutes(new Date(hours).getMinutes());
        $scope.hour = getHour($scope.foot.date);
        // $scope.foot.date = hour.substring(0,11)+ $scope.foot.jour.substring(12,24);
        // console.log($scope.foot.date);
        // var dateJour = new Date($scope.foot.jour).toJSON()+''.substring(0,11);

      });
    }
if($location.path().indexOf('footparams')>0){
  $scope.foot.date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); //DEFAULT TOMMOROW
  $scope.hour = getHour($scope.foot.date);
  $scope.date = getJour($scope.foot.date);
  $scope.foot.nbPlayer = 10;
  $scope.foot.friendCanInvite = true;
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
  $scope.foot.created_by = $localStorage.user.id;
  $http.post('http://localhost:1337/foot/create',$scope.foot).success(function(foot){
    io.socket.post('http://localhost:1337/actu/footInvit',{from: $localStorage.user.id, toInvite: $scope.foot.toInvite, id: foot.id},function(err){
    });
    $location.path('/foot/'+foot.id);
  }).error(function(){
    console.log('err');
  });
}
if($location.path().indexOf('user/foots')>0){
  console.log('hello');
  $ionicLoading.show({
      content: 'Loading Data',
      animation: 'fade-out',
      showBackdrop: true
  });
  $localStorage.footInvitation = [];
  $localStorage.footTodo = [];
  $http.get('http://localhost:1337/getFootByUser/'+$localStorage.user.id).success(function(data){ //Send status with it as an attribute
    if(data.length==0) $ionicLoading.hide();
    angular.forEach(data, function(foot,index){
      $localStorage.footPlayers[index] = [];
      $localStorage.footPlayers[index].push(foot.id); //FIRST COLUMN CONTAIN ID OF FOOTS 
      $http.get('http://localhost:1337/foot/getInfo/'+foot.id).success(function(elem){
        foot.organisator = elem.orga;
        foot.orgaName = elem.orgaName;
        foot.field = elem.field;
        foot.dateString = getJour(new Date(foot.date))+', '+getHour(new Date(foot.date));
          $scope.footInvitation = $localStorage.footInvitation;
          $scope.footTodo = $localStorage.footTodo;
          $ionicLoading.hide();
      });
      if(foot.statut==1)
        $localStorage.footInvitation.push(foot);
      else if(foot.statut>1)
        $localStorage.footTodo.push(foot);
    });
  });
}
})


.controller('SingleFootController', function ($scope,$http,$localStorage,$location,$stateParams,$ionicLoading,$ionicModal,$confirmation) {
  $ionicLoading.show({
      content: 'Loading Data',
      animation: 'fade-out',
      showBackdrop: true
  });
  $scope.user = $localStorage.user;
  $scope.friends = $localStorage.friends;
  var foot = {};  //Show them after the loading;
  var players = [];
  var position = -1;

  // Here we are going to call 2 queries in the same time, the first should be faster, but to make sur we create 2 variables

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
            $scope.foot = foot;
            $scope.date = date;
            $scope.players = players;
            $ionicLoading.hide();
      });
    });

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

  var deleteFoot = function(userId){
    $http.post('http://localhost:1337/foot/deleteFoot',{foot: $scope.foot.id, user: $scope.foot.user}).success(function(){
      var pos = _.pluck(players,'id').indexOf($localStorage.user.id);
      var toNotify = players; //Notify all players except the organisator
      toNotify.splice(pos,1);
      console.log(toNotify);
      async.each(toNotify,function(guy,callback){
        notify({user:guy.id,related_user:$localStorage.user.id,typ:'footAnnul',related_stuff:$scope.foot.id},function(){callback();});
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
.controller('FootFinderController', function ($scope,$http,$localStorage,$location,$stateParams) {
  $scope.go = function(id){
    $location.path('/foot/'+id);
   } 
  $scope.params = {dateValue: '0', field: '', date: new Date() };
  var dates = [new Date(new Date().getTime()), new Date(new Date().getTime() + 24 * 60 * 60 * 1000), new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000),
  new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000),new Date(new Date().getTime() + 4 * 24 * 60 * 60 * 1000)];
  $scope.getData = function(params){
    $http.post('http://localhost:1337/foot/query',$scope.params).success(function(data){
      $scope.results =[];
      async.each(data,function(foot,callback){
        var finish = false;
        $http.get('http://localhost:1337/foot/getInfo/'+foot.id).success(function(info){  //Get foot info
          foot.organisator = info.orga;
          foot.orgaName = info.orgaName;
          foot.field = info.field;
            $scope.results.push(foot);
            callback();
        });
      });

    });
  }


  $scope.updateDate = function(){
    ind = parseInt($scope.params.dateValue);
    $scope.date = dates[ind].toLocaleDateString();
    $scope.params.date = dates[ind];
    $scope.getData($scope.params);
  }
  $scope.updateDate();
})