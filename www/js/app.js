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


var notify = function(notif,callback){
  if(callback)
    io.socket.post('http://localhost:1337/actu/newNotif',notif,callback());
  else
    io.socket.post('http://localhost:1337/actu/newNotif',notif);
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
    app_id: '82c453c4',
    // The public API key all services will use for this app
    api_key: '72368d6e12d814f27c62c1c661533630011c436206637e5f',
    // Set the app to use development pushes
    dev_push: false
  });
}])



//Creating local Storage Function
.factory('$localStorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
}])


.factory('$confirmation',['$ionicPopup',function($ionicPopup) {
  var showConfirm = function(text,ok){
    var confirmPopup = $ionicPopup.confirm({
      title: text.toUpperCase(),
      template: 'Etes vous sur de vouloir '+text
    });
    confirmPopup.then(function(res) {
      if(res)
        ok();
    });
  };
  return showConfirm;
}])


.factory('$connection',['$http','$localStorage','$rootScope','$ionicPush','$ionicUser',function($http,$localStorage,$rootScope,$ionicPush,$ionicUser){

  //Execute all functions asynchronously.

  var connect = function(userId, generalCallback,setUUID){
    var allFunction = [];

    var pushRegister = function() {

    // Register with the Ionic Push service.  All parameters are optional.
      $ionicPush.register({
        canShowAlert: true, //Can pushes show an alert on your screen?
        canSetBadge: true, //Can pushes update app icon badges?
        canPlaySound: true, //Can notifications play a sound?
        canRunActionsOnWake: true, //Can run actions outside the app,
        onNotification: function(notification) {
        // Handle new push notifications here
          console.log(notification);
          return true;
       }
      });
    };
    
    if(window.device && window.device.model.indexOf('x86')==-1){  // No device on testing second argument removes emulators
    allFunction.push(function(callback){
      $ionicUser.identify($localStorage.user.push).then(function(){  
        pushRegister();
        $rootScope.$on('$cordovaPush:tokenReceived', function(event, data) {
        $localStorage.user.pushToken = data.token;
          $http.post('http://localhost:1337/push/create',{user: userId, pushId: data.token},function(){
            callback();
          });
        });
      });
    });
    }

    allFunction.push(function(callback){
      io.socket.post('http://localhost:1337/connexion/setConnexion',{id: userId},function(){
        callback();
      }); 
    });

    if(setUUID && window.device){  //no device on testing
      allFunction.push(function(callback){
        $http.post('http://localhost:1337/session/create',{user: userId, uuid: window.device.uuid}).success(function(){
          callback();
        });
      });
    }

    allFunction.push(function(callback){
      $http.get('http://localhost:1337/getAllFriends/'+userId+'/0').success(function(data){
        $localStorage.friends = data[0];
          angular.forEach($localStorage.friends,function(friend,index){   // Add attribute statut to friends to keep favorite
            friend.statut = data[1][index].stat; 
            friend.friendship = data[1][index].friendship;
            if(index == $localStorage.friends.length-1) callback();
          });
      });
    });

    allFunction.push(function(callback){
      $http.get('http://localhost:1337/getAllChats/'+userId).success(function(data){
        $localStorage.chats=data;
        $rootScope.initChatsNotif();
        callback();
      });
    });

    allFunction.push(function(callback){
      $http.post('http://localhost:1337/user/getLastNotif',$localStorage.user).success(function(nb){
        $rootScope.nbNotif = nb.length;
        callback();
      });         
    });


    async.each(allFunction, function(oneFunc,callback){
      oneFunc(function(){callback();})
    },function(){
      generalCallback();
    });
};

  return connect;

}])

.factory('$confirmation',['$ionicPopup',function($ionicPopup) {
  var showConfirm = function(text,ok){
    var confirmPopup = $ionicPopup.confirm({
      title: text.toUpperCase(),
      template: 'Etes vous sur de vouloir '+text
    });
    confirmPopup.then(function(res) {
      if(res)
        ok();
    });
  };
  return showConfirm;
}])



//Get all necessary info on the notif: texte attribute related_user name and link (called in NotifController and app.run)
.factory('$handleNotif',['$http','$localStorage',function($http,$localStorage){
  var handle = {};
  handle.handleNotif = function(notif,callback){

    var parseNotif = function(typ){
      switch(typ){
        case 'newFriend':
        return ['vous a ajouté à ses amis.','/friend/'];
        case 'hommeDuMatch':
        return ['avez été élu homme du match.'];
        case 'chevreDuMatch':
        return['avez été élu chèvre du match.'];
        case 'footInvit':
        return ['vous à invité à un foot.','/foot/'];
        case 'footConfirm':
        return ['à confirmé sa présence à votre foot.','/foot/'];
        case 'footAnnul':
        return ['à annulé son foot.'];
        case 'footDemand':
        return['demande à participer à votre foot.','/friend/'];
        case 'footEdit':
        return['à modifié son foot.','/foot/'];
        case 'endGame':
        return['cliquer pour élir l\'homme et la chèvre du match.', '/election/'];
        case 'demandAccepted':
        return ['à accepté votre demande pour rejoindre son foot.','/foot/'];
        case 'demandRefused':
        return ['à accepté votre demande pour rejoindre son foot.'];
        case '3hoursBefore':
        return ['avez prévu un foot dans 3 heures, n\'oubliez pas votre rendez-vous !'];
      }
    };


    $http.get('http://localhost:1337/user/get/'+notif.related_user).success(function(user){
      if(user.id == $localStorage.user.id)
       notif.userName == "Vous";
     else{
      if(notif.typ!="endGame")
        notif.userName = user.first_name;
      else
        notif.userName = "Le foot de "+user.first_name+" est terminé, ";
    }
    notif.picture = user.picture;
    notif.texte = parseNotif(notif.typ)[0];
    if(notif.related_stuff)
      notif.url = parseNotif(notif.typ)[1]+notif.related_stuff;

    date = new Date(notif.createdAt);
    notif.date = getHour(date)+', le '+getJour(date).substring(getJour(date).indexOf(date.getDate()),getJour(date).length); //('20h06, le 27 Mai')
    if(callback)
      callback();

  });
  };

  handle.handleActu = function(actu,callback){

    var parseActu = function(typ){
      switch(typ){
        case 'newFriend':
        return ['est amis avec','/friend/'];
        case 'hommeDuMatch':
        return ['a été élu homme du match','/friend/'];
        case 'chevreDuMatch':
        return['a été élu chèvre du match.','/friend/'];
        case 'footConfirm':
        return ['participe à un foot.','/foot/'];
        case 'demandAccepted':
        return ['participe à un foot.','/foot/'];
      }
    };
    $http.get('http://localhost:1337/user/get/'+actu.related_user).success(function(user){
      actu.userName = user.first_name;
      actu.userLink = '/friend/'+user.id;
      actu.texte = parseActu(actu.typ)[0];
      actu.picture = user.picture;

      if(actu.typ == 'footConfirm' || actu.typ == 'demandAccepted'){
        $http.get('http://localhost:1337/foot/get/'+actu.related_stuff).success(function(data){
          actu.related_info = data;
          date = new Date(data.date);
          actu.related_info.dateString = getJour(date)+' à '+getHour(date);
          actu.related_info.format = Math.floor(data.nbPlayer/2)+"|"+Math.floor(data.nbPlayer/2)
          if(callback)
            callback();
        });
      }
      else if(actu.typ == 'newFriend'){
        $http.get('http://localhost:1337/user/get/'+actu.user).success(function(data){
          actu.userName2 = data.first_name;
          actu.userLink2 = '/friend/'+data.id;
          actu.picture2 = data.picture;
          if(callback)
            callback();
        });
      }
      else if(callback){
        callback();
      }
    });
};

return handle;
}])


.run(function($ionicPlatform,OpenFB,$rootScope,$http,$localStorage,$handleNotif,$ionicLoading) {
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


  $rootScope.$on('$stateChangeSuccess',function(e,toState,toParams,fromState){    //EVENT WHEN LOCATION CHANGE
    setTimeout(function(){   // PERMET DE CHARGER LA VUE AVANT
      if(toState.url.indexOf('profil')>-1)                  // Menu transparent pour profil
        $('.actu_header').addClass('transparent');
      if(toState.url.indexOf('notif')>-1)
        $rootScope.nbNotif = 0;
      if(fromState.url.indexOf('profil')>-1)
        $('.actu_header').removeClass('transparent');
      if(fromState.url.indexOf('friends')>-1)
        $('.iconHeader').removeClass('icon_friend');
      if(toState.url.indexOf('friends')>-1)
        $('.iconHeader').addClass('icon_friend');
    },0);
  });

  io.socket.on('disconnect',function(){
    if($localStorage.user && $localStorage.user.id)
      $http.post('http://localhost:1337/connexion/delete',{id : $localStorage.user.id});
  });

  io.socket.on('connect', function(){
    if($localStorage.user && $localStorage.user.id && $localStorage.user.pushToken){
      io.socket.post('http://localhost:1337/connexion/setConnexion',{id: $localStorage.user.id, pushId:$localStorage.user.pushToken}); 
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
    var lastTimeSeen = moment($localStorage.chats[index].lastTime).add(5, 'seconds');
    console.log(lastMessage);
    console.log(lastTimeSeen);
    console.log(lastMessage.diff(lastTimeSeen));
    if(lastMessage.diff(lastTimeSeen)>0){
      $localStorage.chats[index].seen = false;
    }

    var indexToUpdate = getIndex(message.chat, $localStorage.chatsDisplay);
    var newDate = new Date(message.createdAt);
    var lastMessage = shrinkMessage(message.messagestr);
    var chatPic = getStuffById(message.senderId, $localStorage.chats[index].users).picture;
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
    }
  });

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
        if ($localStorage.token) {
          config.headers.Authorization = $localStorage.token;
        }
        return config;
      },
      'responseError': function(response) {
        if(response.status === 403) {
          $location.path('/login');
        }
        $rootScope.$broadcast('loading:hide');
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
});