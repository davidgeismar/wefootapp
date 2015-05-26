angular.module('foot',[]).controller('FootController', function ($scope, $cordovaDatePicker,$ionicModal,$http,$localStorage,$location) {
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

  var getJour = function(date){
    var semaine = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
    var mois = ['Janvier','Fevrier','Mars','Avril','Mai','Juin','Juillet','Aout','Septembre','Octobre','Novembre','Decembre'];
    var m = mois[date.getMonth()];
    var j = semaine[date.getDay()];
    return(j+' '+date.getDate()+' '+m);
  }
  var getHour = function(date){
    var n = date.getHours();
    var m = date.getMinutes();
    if(n<10) n= '0'+n;
    if(m<10) m= '0'+m;
    return (n+'h'+m)
  }

  $scope.foot.date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); //DEFAULT
  $scope.hour = getHour($scope.foot.date);
  $scope.date = getJour($scope.foot.date);
  $scope.foot.nbPlayer = 10;
  $scope.foot.friendCanInvite = false;
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
  }).error(function(){
    console.log('err');
  });
}
if($location.path().indexOf('user/foots')>0){
  $localStorage.footInvitation = [];
  $localStorage.footTodo = [];
  $localStorage.footPlayers = []; //EACH LINE FOR EACH PLAYERS
  $scope.footInvitation = $localStorage.footInvitation;
  $scope.footTodo = $localStorage.footTodo;
  $scope.footPlayers = $localStorage.footPlayers;
  $http.get('http://localhost:1337/getFootByUser/'+$localStorage.user.id).success(function(data){
    console.log(data);
    angular.forEach(data, function(foot,index){
      $localStorage.footPlayers[index] = [];
      $localStorage.footPlayers[index].push(foot.id); //FIRST COLUMN CONTAIN ID OF FOOTS 
      $http.get('http://localhost:1337/foot/getInfo/'+foot.id).success(function(data){
        foot.organisator = data.orga;
        foot.orgaName = data.orgaName;
        foot.fieldName = data.field;
      });
      $http.get('http://localhost:1337/foot/getPlayers/'+foot.id).success(function(data){
        $localStorage.footPlayers[index] = $localStorage.footPlayers[index].concat(data);
        foot.confirmedPlayers = data.length;
      })
      if(foot.statut==1)
        $localStorage.footInvitation.push(foot);
      else if(foot.statut>1)
        $localStorage.footTodo.push(foot);
    });
  });
}
});