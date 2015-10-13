angular.module('foot',[]).controller('FootController', function ($confirmation,$scope,$ionicModal,$http,$localStorage,$location,$ionicLoading,$state,$handleNotif,$cordovaGeolocation,$rootScope,$searchLoader, $foot) {

 $scope.go = function(id){
  $location.path('/foot/'+id);
} 

$scope.deleteField = function(fieldId){
  console.log($scope.results);
  $confirmation('Etes vous sur de vouloir supprimer ce terrain ?',function(){
    $http.post(serverAddress+'/field/deletePrivateField',{id: fieldId, related_to:$localStorage.getObject('user').id}).success(function(){
      $scope.results = _.filter($scope.results, function(field){ return field.id !=fieldId });
    });
  });
}

$scope.foot = {};
$scope.results = [];
$scope.tab = "1";
if($localStorage.getArray('friends')){
  $rootScope.friends = $localStorage.getArray('friends');
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

// $scope.showDatePicker = function(){
//   $foot.pickDate($scope.foot.date, function(dates){
//     $scope.foot.date = dates.date;
//     $scope.date = dates.dateString;
//   });
// }


$scope.currentDate = new Date();
$scope.currentDateFormat = moment($scope.currentDate).locale('fr').format("DD MMM yy");

$scope.datepickerObject = {
      titleLabel: 'Sélectionner une date',  //Optional
      todayLabel: "Aujourd'hui",  //Optional
      closeLabel: 'Fermer',  //Optional
      setLabel: 'Ok',  //Optional
      setButtonType : 'button-assertive',  //Optional
      todayButtonType : 'button-assertive',  //Optional
      closeButtonType : 'button-assertive',  //Optional
      inputDate: $scope.currentDate,    //Optional
      mondayFirst: true,    //Optional
      // disabledDates: disabledDates, //Optional
      weekDaysList: ["Lun", "Mar","Mer","Jeu","Ven","Sam","Dim"], //Optional
      monthList: ["Jan","Fev","Mar","Avr","Mai","Juin","Jui","Aou","Sep","Oct", "Nov", "Dec"], //Optional
      templateType: 'modal', //Optional
      showTodayButton: 'true', //Optional
      modalHeaderColor: 'bar-positive', //Optional
      modalFooterColor: 'bar-positive', //Optional
      from: new Date(),   //Optional
      to: new Date(2018, 8, 25),    //Optional
      callback: function (val) {    //Mandatory
        console.log(val);
          $scope.foot.date = val;
          $scope.date = moment(val).locale('fr').format("DD MMM yy");
        }
      };

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
    $rootScope.nbGoBack = -3;
    $location.path('/foot/'+foot.id);
  });
}

$scope.toggleAll = function(){
  if(!$scope.toggleClicked){
    $scope.toggleClicked = true;
    $('.target_toggle_friends').prop('disabled', true);
    $scope.foot.toInvite = _.pluck($localStorage.getArray('friends'),('id'));
  }
  else{
    $scope.toggleClicked = false;
    $('.target_toggle_friends').prop('disabled', false);
    $scope.foot.toInvite = [];
  }
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


.controller('SingleFootController', function ($scope,$http,$localStorage,$location,$stateParams,$ionicLoading,$ionicModal,$confirmation,$cordovaDatePicker,$handleNotif,$rootScope,$foot, chats, $validated,$timeout, chat) {
  $ionicLoading.show({
    content: 'Loading Data',
    animation: 'fade-out',
    showBackdrop: true
  });
  $scope.user = $localStorage.getObject('user');
  $rootScope.friends = $localStorage.getArray('friends');
  $scope.players = [];
  $scope.ready = false; //Show after loading
  $scope.isPlaying;
  // Here we are going to call 2 queries in the same time, the first should be faster, but to make sur we create 2 variables

  $foot.loadInfo($stateParams.id,function(result){
    $scope.foot = result.foot;
    $scope.invited = result.invited;
    $scope.isInvited = result.isInvited;
    $scope.isPending = result.isPending;
    $scope.isPlaying = result.isPlaying;
    $scope.players = result.players;
    $scope.isComplete = result.players.length == result.foot.nb_player;
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
      $scope.players = result.players;
      $scope.isComplete = result.players.length == result.foot.nb_player;
      $scope.date = result.date;
      $scope.$broadcast('scroll.refreshComplete');
    });
  }

  $scope.book = function(){
    var user = $localStorage.getObject('user');
    $localStorage.reservationClient = {foot: $scope.foot.id, field: $scope.foot.field.id, date: $scope.foot.date, student_discount:$scope.foot.field.student_discount, user: user.id, userName: user.first_name+" "+user.last_name, userPhone: user.telephone};
    $localStorage.found = 0;
    $localStorage.foot = $scope.foot;
    $location.path('/resa/recap');
  }

  var removePlayerAction = function(userId){
    $foot.removePlayer(userId,$scope.foot.id, $scope.isPlaying, function(){
      $location.path('/user/foots');
    });
  }

  $scope.removePlayer = function(userId){
    $confirmation('Etes vous sur de vouloir vous retirer de ce foot?',function(){removePlayerAction(userId)});
  }

  var deleteFoot = function(){
    $foot.deleteFoot($scope.foot.id, $scope.players, function(){
      $location.path('/user/foots');
      $scope.modal3.hide();
    })
  }

  $scope.confirmDelete = function(userId){
    $confirmation('Etes vous sur de vouloir annuler ce foot?',function(){deleteFoot(userId)});
  }

  $scope.playFoot = function(player){
    $scope.isPlaying = true;
    $scope.foot.date = $scope.date;
    $foot.playFoot(player,$scope.foot,$scope.players);
  }

  $scope.openPublic = function(){
    $http.post(serverAddress+'/foot/update',{id: $scope.foot.id, priv: false}).success(function(){
      $scope.foot.priv = false;
    });
  }

  $scope.closePublic = function(){
    $http.post(serverAddress+'/foot/update',{id: $scope.foot.id, priv: true}).success(function(){
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
      $http.post(serverAddress+'/foot/sendInvits',$scope.foot).success(function(){
        chat.postNewChatter($scope.foot.id, $scope.foot.toInvite);
        async.each($scope.foot.toInvite,function(invited,callback){
          $handleNotif.notify({user:invited, related_user: $localStorage.getObject('user').id, typ:'footInvit',related_stuff: $scope.foot.id},function(){
            callback();
          },true);
        },function(){$scope.invited = $scope.invited.concat($scope.foot.toInvite);});

      });
    }
    $scope.modal2.hide();
  };


  $scope.toggleAll = function(){
    if(!$scope.toggleClicked){
      $scope.toggleClicked = true;
      $('.target_toggle_friends').prop('disabled', true);
      $scope.foot.toInvite = _.difference(_.pluck($localStorage.getArray('friends'),('id')),$scope.invited);
    }
    else{
      $scope.toggleClicked = false;
      $('.target_toggle_friends').prop('disabled', false);
      $scope.foot.toInvite = [];
    }
  } 

  $scope.addToFoot = function(id) {
    $scope.foot.toInvite.push(id);
  };

  $scope.askToPlay = function(id){
    $http.post(serverAddress+'/foot/askToPlay',{userId: id, foot: $scope.foot.id}).success(function(){
      $handleNotif.notify({user:$scope.foot.created_by, related_user: $localStorage.getObject('user').id, typ:'footDemand', related_stuff: $localStorage.getObject('user').id},function(){},true);
      $scope.isPending = true;
      $validated.show({texte: "Votre demande à bien été envoyée.", icon: "ion-checkmark-round"},function(){
      }); //ERROR USING CALLBACK
      $timeout(function(){
        $location.path('/footfinder');
      },1100);
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
      $http.post(serverAddress+'/foot/update',$scope.foot).success(function(){
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
      $http.get(serverAddress+'/field/search/'+$localStorage.getObject('user').id+'/'+word).success(function(data){
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
    var chat = _.find($localStorage.getArray('chats'), function(chat){ return chat.typ == 2 && chat.related == footId });
    if(chat){
      $location.path('/conv/'+chat.id);
    }
    else
      chats.getChat(footId).then(function(){
        $location.path('/conv/'+_.find($localStorage.getArray('chats'), function(chat){ return chat.typ == 2 && chat.related == footId }).id);
      });
  } 
})



.controller('FootFinderController', function ($scope,$http,$localStorage,$location,$cordovaGeolocation,$foot, $rootScope) {
  $scope.go = function(id){
    $location.path('/foot/'+id);
  } 

  if(!$rootScope.paramsFinder)
    $rootScope.paramsFinder = {dateValue: 0, field: '', date: new Date()};


// console.log($rootScope.paramsFinder);

var dates = [new Date(new Date().getTime()), new Date(new Date().getTime() + 24 * 60 * 60 * 1000), new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000),
new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000),new Date(new Date().getTime() + 4 * 24 * 60 * 60 * 1000),new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000), new Date(new Date().getTime() + 6 * 24 * 60 * 60 * 1000), new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), new Date(new Date().getTime() + 8 * 24 * 60 * 60 * 1000), new Date(new Date().getTime() + 9 * 24 * 60 * 60 * 1000)];

$scope.getData = function(){
  // if($localStorage.getObject('user').lat)
  $foot.searchFoot($rootScope.paramsFinder,function(results){
    $scope.results = results;
  })
}

$scope.filterFoots = function (foot) { 
  return foot.organisator != $localStorage.getObject('user').id;
}
$scope.updateDate = function(val){
  if(val)
    value = $rootScope.paramsFinder.dateValue + val;
  else
    value = $rootScope.paramsFinder.dateValue;
  if(value > -1 && value < 10){
    $rootScope.paramsFinder.dateValue = value;
    $scope.date = getJour(dates[value]);
    $rootScope.paramsFinder.date = dates[value];
    $scope.getData($rootScope.paramsFinder);
  }
}
$scope.updateDate();

})