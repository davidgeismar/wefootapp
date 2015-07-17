angular.module('foot',[]).controller('FootController', function ($scope,$ionicModal,$http,$localStorage,$location,$ionicLoading,$state,$handleNotif,$cordovaGeolocation,$rootScope,$searchLoader, $foot) {

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

    $scope.showDatePicker = function(){
      $foot.pickDate($scope.foot.date, function(dates){
        $scope.foot.date = dates.date;
        $scope.date = dates.dateString;
      });
    }

    $scope.showHourPicker = function(){
      $foot.pickHour($scope.foot.date, function(dates){
        $scope.foot.date = dates.date;
        $scope.hour = dates.dateString;
      });
    }

  if($location.path().indexOf('footparams')>0){
    $scope.foot = $foot.setDefaultOptions($scope.foot);
    $scope.hour = getHour($scope.foot.date);
    $scope.date = getJour($scope.foot.date);

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
} 


$scope.searchQuery = function(word){
  $foot.searchFields(word,function(data){
    $scope.results = data;
  });
}
//QUERY INIT WHEN NO SEARCH HAS BEEN STARTED
if($location.path().indexOf('footfield')>-1)
  $foot.searchFields('',function(data){ $scope.results = data; });


$scope.chooseField = function(field){
  $localStorage.fieldChosen = field;
  $location.path('/footparams');
}


$scope.launchReq = function(){
  $foot.create($scope.foot, function(foot){
    $location.path('/foot/'+foot.id);
  });
}

if($location.path().indexOf('user/foots')>-1){
  
  $ionicLoading.show({
    content: 'Loading Data',
    animation: 'fade-out',
    showBackdrop: true
  });
  

  $foot.loadFoot(function(){
        $scope.footInvitation = $localStorage.footInvitation;
        $scope.footTodo = $localStorage.footTodo;
        $ionicLoading.hide();
  });

  $scope.refresh = function(){
  $foot.loadFoot(function(){
        $scope.footInvitation = $localStorage.footInvitation;
        $scope.footTodo = $localStorage.footTodo;
        $ionicLoading.hide();
        $scope.$broadcast('scroll.refreshComplete');
  });
  }
}
})


.controller('SingleFootController', function ($scope,$http,$localStorage,$location,$stateParams,$ionicLoading,$ionicModal,$confirmation,$cordovaDatePicker,$handleNotif,$rootScope,$foot) {
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

$foot.loadInfo($stateParams.id,function(result){
  $scope.foot = result.foot;
  $scope.invited = result.invited;
  $scope.isInvited = result.isInvited;
  $scope.isPending = result.isPending;
  $scope.isPlaying = result.isPlaying;
  $scope.players = result.players;
  $scope.date = result.date;
  $scope.ready = true;
  $ionicLoading.hide();
});

$scope.refresh = function(){
    $scope.players = [];
    $foot.loadInfo($stateParams.id,function(result){
      $scope.foot = result.foot;
      $scope.invited = result.invited;
      $scope.isInvited = result.isInvited;
      $scope.isPending = result.isPending;
      $scope.isPlaying = result.isPlaying;
      $scope.date = result.date;
      $scope.$broadcast('scroll.refreshComplete');
    });
}

  $scope.book = function(){
    $localStorage.reservationClient = {foot: $scope.foot.id, field: $scope.foot.field.id, date: $scope.foot.date};
    $localStorage.found = 0;
    $localStorage.foot = $scope.foot;
    $location.path('/resa/recap');
  }

  $scope.removePlayer = function(userId){
    $foot.removePlayer(userId,$scope.foot.id, $scope.isPlaying, function(){
      $location.path('/user/foots');
    });
  }

  var deleteFoot = function(){
    $foot.deleteFoot($scope.foot.id, $scope.players, function(){
      $location.path('/user/foots');
    })
  }

  $scope.confirmDelete = function(userId){
    $confirmation('Etes vous sur de vouloir annuler ce foot?',function(){deleteFoot(userId)});
  }

  $scope.playFoot = function(player){
    $scope.isPlaying = true;
    $foot.playFoot(player,$scope.foot,$scope.players);
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

    $scope.showDatePicker = function(){
      $foot.pickDate($scope.foot.date, function(dates){
        $scope.foot.date = dates.date;
        $scope.date = dates.dateString;
      });
    }

    $scope.showHourPicker = function(){
      $foot.pickHour($scope.foot.date, function(dates){
        $scope.foot.date = dates.date;
        $scope.hour = dates.dateString;
      });
    }

    $scope.launchChat = function (footId){
          $location.path('/conv/'+_.find($localStorage.getObject('chats'), function(chat){ return chat.typ == 2 && chat.related == footId }).id);
        }
  })



.controller('FootFinderController', function ($scope,$http,$localStorage,$location,$cordovaGeolocation,$foot) {
  $scope.go = function(id){
    $location.path('/foot/'+id);
  } 
  $scope.params = {dateValue: '0', field: '', date: new Date() };
  var dates = [new Date(new Date().getTime()), new Date(new Date().getTime() + 24 * 60 * 60 * 1000), new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000),
  new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000),new Date(new Date().getTime() + 4 * 24 * 60 * 60 * 1000)];
  
  $scope.getData = function(){
    $foot.searchFoot($scope.params,function(results){
      $scope.results = results;
    })
  }


  $scope.updatedAte = function(){
    ind = parseInt($scope.params.dateValue);
    $scope.date = getJour(dates[ind]);
    $scope.params.date = dates[ind];
    $scope.getData($scope.params);
  }
  $scope.updatedAte();

})