//GLOBAL FUNCTIONS

// var serverAddress = "62.210.115.66:9000";
var serverAddress = "localhost:1337";
console.log("Connected to "+serverAddress);



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
var newTime = function (oldTime){
  return moment(oldTime).locale("fr").format('Do MMM, HH:mm');
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


var app = angular.module('starter', ['ionic','ngCordova','ionic.service.core','ionic.service.push','connections','field','foot','friends','profil','user','chat','friend', 'note', 'conv','notif','resetPassword','election','ui-rangeSlider'])

app.config(['$ionicAppProvider', function($ionicAppProvider) {
  // Identify app
  $ionicAppProvider.identify({
    // The App ID (from apps.ionic.io) for the server
    app_id: 'b7af9bfc',
    //GOOGLE APP
    gcm_id: 'wefoot-985',
    // The public API key all services will use for this app
    api_key: '2003098b5fe09a127f008b601758317e99136f05329ca5c6',
    // Set the app to use development pushes
    dev_push: false
  });
}])


.run(function($ionicPlatform,$rootScope,$http,$localStorage,$handleNotif,$ionicLoading, $ionicHistory, $cordovaPush, chat, chats) {
  $rootScope.toShow = false;
  $rootScope.notifs = $localStorage.getArray('notifs'); //Prevent for bug if notif received before the notif page is opened
  $localStorage.footInvitation = [];
  $localStorage.footTodo = [];
  $localStorage.footPlayers = []; //EACH LINE FOR EACH PLAYERS
  $rootScope.nbNotif = 0;
  $rootScope.nbChatsUnseen = 0;
  $rootScope.chats = [];

  $rootScope.$on('loading:hide', function() {
    $ionicLoading.hide()
  })

  $rootScope.$on('$cordovaPush:notificationReceived',function (event,notif){
    if(notification.alert) {
      navigator.notification.alert(notification.alert);
    }
  });

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
      $http.post('http://'+serverAddress+'/connexion/delete',{id : $localStorage.getObject('user').id});
  });

  io.socket.on('connect', function(){
    // if($localStorage.getObject('user') && $localStorage.getObject('user').id){
    //   io.socket.post('http://'+serverAddress+'/connexion/setSocket',{id: $localStorage.getObject('user').id});
    //   chats.getNewChats().then(function(){
    //     chats.getNewChatters().then(function(){
    //       chats.getNewMessages();
    //     });
    //   });
    // }
  });

  // Notification event handler
  io.socket.on('notif',function(data){
    $rootScope.nbNotif++;
    $rootScope.$digest();//Wait the notif to be loaded

    if(data.typ == 'newFriend')
        $localStorage.newFriend = true;  //refresh on actu load his data

      if(data.typ == 'footInvit'){
        $http.get('http://'+serverAddress+'/foot/getInfo/'+data.id).success(function(info){
          data.organisator = info.orga;
          data.orgaName = info.orgaName;
          data.field = info.field;
          $localStorage.footInvitation.push(data);
        });
      }

      if(data.typ == 'footAnnul'){
        if($localStorage.footTodo){
          var plucked = _.pluck($localStorage.footTodo,'id');
          index = plucked.indexOf(data.related_stuff);
          if(index>-1) $localStorage.footTodo.splice(index,1);
        }
      }
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
    $localStorage.set('lastTimeUpdated', moment().format());
    chat.addMessage(message);
    chat.setSeenStatus(message.chat);
  });
  //Nouvel user dans un chat existant
  io.socket.on('newChatter', function(chatter){
    $localStorage.set('lastTimeUpdated', moment().format());
    chat.addChatter(chatter);
  })


  $rootScope.getNbChatsNotif = function (){
      return chats.getNbNotif();
  };


  $ionicPlatform.ready(function() {

    $rootScope.$broadcast('appReady');

    // $ionicPlatform.on('offline',function(){
    //   console.log('offline');
    //   alert("Vous n'êtes pas connecté à internet, veuillez vous reconnecter pour pouvoir continuer");
    // });
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
  if(window.cordova && window.cordova.plugins.Keyboard) {
    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
  }
  if(window.StatusBar) {
    StatusBar.styleDefault();
  }
});

  $ionicPlatform.on('resume',function(){
    if($localStorage.getObject('user') && $localStorage.getObject('user').id){
      $http.post('http://'+serverAddress+'/user/getLastNotif',$localStorage.getObject('user')).success(function(nb){
        console.log(nb);
        $rootScope.nbNotif = nb.length;
        $rootScope.$digest();
      });
      $http.post('http://'+serverAddress+'/user/update',{id: $localStorage.getObject('user').id, pending_notif: 0});

    }
  });

  $rootScope.goBack = function (value){
    if(value)
      $ionicHistory.goBack(value);
    $ionicHistory.goBack();
  };
})
app.config(function($stateProvider, $urlRouterProvider, $httpProvider, $ionicConfigProvider) {

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
    cache: true,
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
    cache: true,
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
    cache: true,
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

  $httpProvider.interceptors.push(function($q, $location, $localStorage,$rootScope) {
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
          $location.path('/login');
        }
        $rootScope.$broadcast('loading:hide');
        console.log(response.status);
        $rootScope.err = "Erreur connexion";
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
  $ionicConfigProvider.views.forwardCache(true);
  $ionicConfigProvider.tabs.position("bottom"); 
});


app.directive('searchloader', function(){
  return {
    templateUrl: 'templates/searchLoader.html'
  };
});