//GLOBAL FUNCTIONS

window.onerror = function (errorMsg, url, lineNumber) {
  if(!window.device)
  alert('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber);
}//DEBUGING START


var serverAddress = "http://wefoot.herokuapp.com:80";

// var serverAddress = "http://wefoot-test.herokuapp.com:80" // staging
// var serverAddress = "http://wefoot.herokuapp.com:80"; //prod
// var serverAddress = "http://localhost:1337"; // local

console.log("Connected to " + serverAddress);




var modalLink = "";
var switchIcon = function (icon,link) {       // Switch the icon in the header bar
	modalLink = link;
	elem = document.getElementsByClassName('iconHeader')[0];
  if(elem){
   if(elem.className.indexOf("icon_")>-1)
    elem.className = elem.className.substring(0,elem.className.indexOf("icon_")-1) + " " + icon;
  else
   elem.className = elem.className + " " + icon;
}
};

var getStuffById = function(id,stuffArray){
	for(var i = 0; i<stuffArray.length;i++){
		if (id == stuffArray[i].id)
			return stuffArray[i];
	}
  return null;
};

var getIndex = function(id, stuffArray){
  for(var i = 0; i<stuffArray.length;i++){
    if (id == stuffArray[i].id)
      return i;
  }
};

var getJour = function(date){
  date = new Date(date);
  var semaine = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
  var mois = ['Janvier','Fevrier','Mars','Avril','Mai','Juin','Juillet','Aout','Septembre','Octobre','Novembre','Decembre'];
  var m = mois[date.getMonth()];
  var j = semaine[date.getDay()];
  return(j+' '+date.getDate()+' '+m);
};

var getJourShort = function(date){
  date = new Date(date);
  var semaine = ['Dim.','Lun.','Mar.','Mer.','Jeu.','Ven.','Sam.'];
  var mois = ['Jan','Fev','Mars','Avr','Mai','Juin','Juil','Aout','Sept','Oct','Nov','Dec'];
  var m = mois[date.getMonth()];
  var j = semaine[date.getDay()];
  return(j+' '+date.getDate()+' '+m);
};

var getHour = function(date){
  date = new Date(date);
  var n = date.getHours();
  var m = date.getMinutes();
  if(n<10) n= '0'+n;
  if(m<10) m= '0'+m;
  return (n+'h'+m)
};


var shrinkMessage = function(message){
  message = message.replace(/[\n\r]/g, ' ');
  if(message.length>80){
    message = message.substring(0,40)+"...";
  }
  return message;

};


var device = window.device;


var app = angular.module('starter', ['ionic','ionic-datepicker','ngCordova','ion-google-place','ionic.service.core','connections','field','foot','friends','profil','user','chat','friend', 'note', 'conv','notif','resetPassword','election','ui-rangeSlider','ngIOS9UIWebViewPatch'])
.run(function($ionicPlatform,$rootScope,$http,$localStorage,$handleNotif,$ionicLoading, $ionicHistory, $cordovaPush,$cordovaGeolocation, chat, chats, mySock, user,error_reporter, $cordovaNetwork, $location) {

  // var goAfterPush = function(){
  //   var goafterpush = $localStorage.get('goafterpush',0);
  //   console.log(goafterpush);
  //   if (goafterpush != 0) {
  //     $localStorage.set('goafterpush',0);
  //     console.log('herePb');
  //        // $state.go('state',{id:goafterpush});
  //     $location.path(goafterpush);
  //   }
  // }

  $localStorage.set('isFromNotif',false);
  $rootScope.toShow = false;
  $rootScope.notifs = $localStorage.getArray('notifs'); //Prevent for bug if notif received before the notif page is opened
  $localStorage.footInvitation = [];
  $localStorage.footTodo = [];
  $localStorage.footPlayers = []; //EACH LINE FOR EACH PLAYERS
  $rootScope.nbNotif = 0;
  $rootScope.chats = [];
  $rootScope.hideError = error_reporter.hide();
  $rootScope.$on('loading:hide', function() {
    $ionicLoading.hide()
  })

  if(window.device)
    screen.lockOrientation('portrait');

  $rootScope.$on('$stateChangeSuccess',function(e,toState,toParams,fromState){    //EVENT WHEN LOCATION CHANGE
    setTimeout(function(){   // PERMET DE CHARGER LA VUE AVANT
      if(toState.url.indexOf('profil')>-1)                  // Menu transparent pour profil
        $('.actu_header').addClass('transparent');
      if(toState.url.indexOf('notif')>-1)
        $rootScope.nbNotif = 0;
      if(fromState.url.indexOf('profil')>-1)
        $('.actu_header').removeClass('transparent');
      if(fromState.url.indexOf('friends')>-1)
        $rootScope.friendsOpen = false;
      if(toState.url.indexOf('friends')>-1)
        $rootScope.friendsOpen = true;
    },0);
  });

  io.socket.on('disconnect',function(){
    if($localStorage.getObject('user') && $localStorage.getObject('user').id)
      $http.post(serverAddress+'/connexion/delete',{id : $localStorage.getObject('user').id});
  });

  io.socket.on('connect', function(){
    if($localStorage.getObject('user') && $localStorage.getObject('user').id && $localStorage.get('lastTimeUpdated')){
      mySock.req(serverAddress+'/connexion/setSocket',{id: $localStorage.getObject('user').id});
      chats.getNewChats().then(function(){
        chats.getNewChatters().then(function(){
          chats.getNewMessages().then(function(){
            $localStorage.set('lastTimeUpdated', moment().format());
          });
        });
      });
    }

  });

  // Notification event handler
  io.socket.on('notif',function(data){
    $rootScope.nbNotif++;
    $rootScope.$digest();//Wait the notif to be loaded

    if(data.typ == 'newFriend')
        $localStorage.newFriend = true;  //refresh on actu load his data

    });
  //Nouveau chat
  io.socket.on('newChat',function(chat){
    console.log(chat);
    $localStorage.set('lastTimeUpdated', moment().format());
    chats.addChat(chat);
  });
  //Nouveau message dans un chat
  io.socket.on('newMessage',function(message){
    console.log(message);
    chat.addMessage(message);
    chat.setSeenStatus(message.chat);
    $localStorage.set('lastTimeUpdated', moment().format());
  });
  //Nouvel user dans un chat existant
  io.socket.on('newChatter', function(chatter){
    console.log(chatter);
    chat.addChatter(chatter);
    $localStorage.set('lastTimeUpdated', moment().format());
  })


  $rootScope.getNbChatsNotif = function (){
    return chats.getNbNotif();
  };



  $ionicPlatform.ready(function() {
    $rootScope.$broadcast('appReady');
    if(window.device){
      navigator.splashscreen.show();
      setTimeout(function() {
        navigator.splashscreen.hide();
      }, 3000);

      if($cordovaNetwork.isOffline())
        error_reporter.show({texte:"Veuillez vous connecter à internet."});

      $rootScope.$on('$cordovaNetwork:offline',function(){
        error_reporter.show({texte:"Pas de connexion internet!"});
      });

      screen.lockOrientation('portrait');
    }

    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
    // goAfterPush();
  });
  //Used to display the distance / or not
  $rootScope.getCoord = false;



  $ionicPlatform.on('resume',function(){
    if(window.device)
      screen.lockOrientation('portrait');
    if($localStorage.getObject('user') && $localStorage.getObject('user').id){
      $http.post(serverAddress+'/user/getLastNotif',$localStorage.getObject('user')).success(function(nb){
        $rootScope.nbNotif = nb.length;
        if(!$rootScope.$$phase) {
          $rootScope.$digest();
        }
      });
      $http.post(serverAddress+'/user/update',{id: $localStorage.getObject('user').id, pending_notif: 0});
      $rootScope.getCoord = false;
      user.getCoord();
      // goAfterPush();
    }
  });

  $rootScope.goBack = function (value){
    if($rootScope.nextUrl){
      $location.path($rootScope.nextUrl);
      $rootScope.nextUrl=null;
    }
    else{
      $rootScope.nbGoBack = -1;
      if(value)
        $ionicHistory.goBack(value);
      $ionicHistory.goBack();
    }
  };

})
app.config(function($stateProvider, $urlRouterProvider, $httpProvider, $ionicConfigProvider) {
  //CENTER ALL TITLES
  
  $urlRouterProvider.otherwise('/');
  $stateProvider.state('home', {
    url: '/',
    templateUrl: 'templates/home.html',
    controller: 'HomeCtrl'
  })

  $stateProvider.state('footfield',{
    cache: false,
    url:'/footfield',
    templateUrl:'templates/footfield.html',
    controller: 'FootController'
  })

  $stateProvider.state('footparams', {
    cache: false,
    url: '/footparams',
    templateUrl: 'templates/footparams.html',
    controller: 'FootController'
  })


  $stateProvider.state('user.foots', {
    cache: false,
    url: '/foots',
    views: {
      'menuContent' :{
        templateUrl: 'templates/foots.html',
        controller: 'FootController'
      }
    }
  })

  $stateProvider.state('register', {
    url: '/register',
    templateUrl: 'templates/register.html',
    controller: 'RegisterCtrl'
  })

  $stateProvider.state('resetPassword', {
    url: '/resetPassword',
    templateUrl: 'templates/resetPassword.html',
    controller: 'ResetPasswordCtrl'
  })

  $stateProvider.state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })

  $stateProvider.state('user',{    // LAYOUT UN FOIS CONNECTE
    cache: true,
    abstract: true,
    url: '/user',
    templateUrl: "templates/layout.html",
    controller: 'UserCtrl'
  })

  $stateProvider.state('user.chat', {
    cache: false,
    url: '/chat',
    views: {
      'menuContent' :{
        templateUrl: "templates/chat.html",
        controller: 'ChatCtrl'
      }
    }
  })

  $stateProvider.state('conv', {
    cache: false,
    url: '/conv/:id',
    templateUrl: "templates/conv.html",
    controller: 'ConvCtrl'
  })

  $stateProvider.state('user.profil', {
    cache: true,
    url: '/profil',
    views: {
      'menuContent' :{
        templateUrl: "templates/profil.html",
        controller: 'ProfilCtrl'
      }
    }
  })

  $stateProvider.state('friend', {
    cache: false,
    url: '/friend/:id',
    templateUrl: "templates/friend.html",
    controller: 'FriendCtrl'

  })
  $stateProvider.state('noter', {
    cache: false,
    url: '/noter/:id',
    templateUrl: "templates/noter.html",
    controller: 'NoteCtrl'

  })

  $stateProvider.state('election', {
    cache: false,
    url: '/election/:id',
    templateUrl: "templates/election.html",
    controller: 'ElectionCtrl'

  })

  $stateProvider.state('newField', {
    url: '/newField',
    templateUrl: 'templates/new_field.html',
    controller: 'FieldCtrl'
  })

  $stateProvider.state('user.friends', {
    cache: false,
    url: '/friends',
    views: {
      'menuContent' :{
        templateUrl: 'templates/friends.html',
        controller: 'FriendsCtrl'
      }
    }
  })

  $stateProvider.state('user.notif',{
    cache: false,
    url: '/notif',
    views: {
      'menuContent' :{
        templateUrl: 'templates/notif.html',
        controller: 'NotifCtrl'
      }
    }
  })

  $stateProvider.state('foot',{
    cache: false,
    url: '/foot/:id',
    templateUrl: 'templates/foot.html',
    controller: 'SingleFootController'
  })

  $stateProvider.state('footfinder',{
    cache: false,
    url: '/footfinder',
    templateUrl: 'templates/footfinder.html',
    controller: 'FootFinderController'
  })

  $stateProvider.state('reservation',{
    abstract: true,
    cache: false,
    url: '/resa',
    templateUrl: "templates/resa.html"
  })

  $stateProvider.state('reservation.recap',{
    cache: false,
    url: '/recap',
    views: {
      'resaContent' :{
        templateUrl: "templates/recapreservation.html",
        controller: 'ReservationController'
      }
    }
  })

  $stateProvider.state('reservation.field',{
    cache: false,
    url: '/field',
    views: {
      'resaContent' :{
        templateUrl: 'templates/autrescentres.html'
      }
    }
  })

  $stateProvider.state('reservation.edit',{
    cache: false,
    url: '/edit',
    views: {
      'resaContent' :{
        templateUrl: 'templates/editResa.html'
      }
    }
  })

  $stateProvider.state('reservation.dispo',{
    cache: false,
    url: '/dispo',
    views: {
      'resaContent' :{
        templateUrl: 'templates/dispo.html',
        controller: 'ResaDispoController'
      }
    }
  })


  $stateProvider.state('reservation.pay',{
    cache: false,
    url: '/pay',
    views: {
      'resaContent' :{
        templateUrl: 'templates/pay.html',
        controller: 'PaiementController'
      }
    }
  })

  $httpProvider.interceptors.push(function($q, $location, $localStorage,$rootScope, error_reporter, $cordovaNetwork) {
    return {
      'request': function (config) {
        config.headers = config.headers || {};
        if ($localStorage.get('token')) {
          config.headers.Authorization = $localStorage.get('token');
        }
        return config;
      },
      'responseError': function(response) {
        if(response.status === 403) {
          $location.path('/home');
        }
        $rootScope.$broadcast('loading:hide');
        if(response.status !== 0){
          if($rootScope.err)
            error_reporter.show({texte:$rootScope.err, timeout: 3000}, function(){
              delete $rootScope.err;
            });
          else
            error_reporter.show({timeout: 3000});
        }
        if(response.status === 0){
          error_reporter.show({texte: "Erreur vérifiez votre connexion internet."});
        }
        return $q.reject(response);
      },
      'response': function(response){
        if(response.status == 200){
          $rootScope.err = "";
          return response;
        }
      }
    };
  })

$ionicConfigProvider.navBar.alignTitle('center');
$ionicConfigProvider.views.swipeBackEnabled(false);
$ionicConfigProvider.views.forwardCache(true);
$ionicConfigProvider.tabs.position("bottom");
});

app.directive('input', function($timeout){
 return {
   restrict: 'E',
   scope: {
     'returnClose': '=',
     'onReturn': '&'
   },
   link: function(scope, element, attr){
    element.bind('keydown', function(e){
      if(e.which == 13){
        if(scope.returnClose){
          console.log('return-close true: closing keyboard');
          element[0].blur();
        }
        if(scope.onReturn){
          console.log('on-return set: executing');
          $timeout(function(){
            scope.onReturn();
          });
        }
      }
    });
  }
}
});


app.directive('searchloader', function(){
  return {
    templateUrl: 'templates/searchLoader.html'
  };
});
