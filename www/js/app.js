//GLOBAL FUNCTIONS

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
    message = message.substring(0,88)+"...";
  }
  return message;

};


var device = window.device;


var app = angular.module('starter', ['ionic','ngCordova','ionic.service.core','ionic.service.push','openfb','connections','field','foot','friends','profil','user','chat','friend', 'note', 'conv','notif','resetPassword','election','ui-rangeSlider'])

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


.run(function($ionicPlatform,OpenFB,$rootScope,$http,$localStorage,$handleNotif,$ionicLoading, $ionicHistory, $cordovaPush) {
  $rootScope.toShow = false;
  $rootScope.notifs = []; //Prevent for bug if notif received before the notif page is opened
  $localStorage.footInvitation = [];
  $localStorage.footTodo = [];
  $localStorage.footPlayers = []; //EACH LINE FOR EACH PLAYERS
  $rootScope.nbNotif = 0;
  $rootScope.nbChatsUnseen = 0;
  $localStorage.chats = [];

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
    if($localStorage.user && $localStorage.user.id)
      $http.post('http://localhost:1337/connexion/delete',{id : $localStorage.user.id});
  });

  io.socket.on('connect', function(){
    if($localStorage.user && $localStorage.user.id && $localStorage.user.pushToken){
      io.socket.post('http://localhost:1337/connexion/setConnexion',{id: $localStorage.user.id, push_id:$localStorage.user.pushToken}); 

    }
  })

  // Notification event handler
  io.socket.on('notif',function(data){
    $rootScope.nbNotif++;
    $rootScope.$digest();//Wait the notif to be loaded
    if(data.typ == 'newFriend'){
      $http.get('http://localhost:1337/user/get/'+data.related_stuff).success(function(user){
        user.statut = 0;
        $localStorage.friends.push(user);
        $localStorage.newFriend = true;  //refresh on actu load his data
      });
    }

    if(data.typ == 'footInvit'){
      $http.get('http://localhost:1337/foot/getInfo/'+data.id).success(function(info){
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
    $localStorage.chats.push(chat);
  });

  //Nouveau message dans un chat
  io.socket.on('newMessage',function(message){

    var index = getIndex(message.chat, $localStorage.chats);
    $localStorage.chats[index].messages.push(message);

    var lastMessage = moment($localStorage.chats[index].messages[$localStorage.chats[index].messages.length-1].createdAt);
    var last_time_seen = moment($localStorage.chats[index].lastTime).add(5, 'seconds');
    if(lastMessage.diff(last_time_seen)>0){
      $localStorage.chats[index].seen = false;
    }

    var indexToUpdate = getIndex(message.chat, $localStorage.chatsDisplay);
    var newDate = new Date(message.createdAt);
    var lastMessage = shrinkMessage(message.messagestr);
    var chatPic = getStuffById(message.sender_id, $localStorage.chats[index].users).picture;
    $localStorage.chatsDisplay[indexToUpdate] = {id:message.chat, lastTime:newTime(newDate), lastMessage:lastMessage, titre:$localStorage.chats[index].desc, seen:$localStorage.chats[index].seen, chatPic:chatPic};


    if(typeof $rootScope.updateMessage == 'function'){
      $rootScope.updateMessage();
    }
  });

$rootScope.updateChatDisplay = function(){



}

  //Nouvel user dans un chat existant

  io.socket.on('newChatter', function(chatter){
    var index = getIndex(chatter.chat, $localStorage.chats);
    $localStorage.chats[index].users.push(chatter);
  })


  $rootScope.initChatsNotif = function (){
    $localStorage.chats.forEach(function(chat, i) {
      if(chat.messages.length>0){
        var lastMessage = new Date(chat.messages[chat.messages.length-1].createdAt);
        var lastTime = new Date (chat.lastTime);
        if(lastMessage>lastTime){
          $localStorage.chats[i].seen = false;
        }
        else
          $localStorage.chats[i].seen = true;
      }
      else
        $localStorage.chats[i].seen = true;
    });
  };

  $rootScope.getNbChatsNotif = function (){
    var cpt = 0;
    for (var i = 0; i<$localStorage.chats.length; i++){
      if(!$localStorage.chats[i].seen){
        cpt++;
      }
    }
    return cpt;
  };


  OpenFB.init('491593424324577','http://localhost:8100/oauthcallback.html',window.localStorage);

  $ionicPlatform.ready(function() {
    $rootScope.$broadcast('appReady');
    console.log('here is the thing');
    console.log($localStorage.get('token'));
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
    if($localStorage.user && $localStorage.user.id){
      $http.post('http://localhost:1337/user/getLastNotif',$localStorage.user).success(function(nb){
        $rootScope.nbNotif = nb.length;
        $rootScope.$digest();
      });
      $http.post('http://localhost:1337/user/update',{id: $localStorage.user.id, pending_notif: 0});
    }
  });

  $rootScope.goBack = function (){
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
    url: '/conv',
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

  $httpProvider.interceptors.push(function($q, $location, $localStorage,$rootScope) {
    return {
      'request': function (config) {
        config.headers = config.headers || {};
        if ($localStorage.get('token')) {
          config.headers.Authorization = $localStorage.token;
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