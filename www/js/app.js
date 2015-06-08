//GLOBAL FUNCTIONS


var modalLink = "";
var switchIcon = function (icon,link) {       // Switch the icon in the header bar
	modalLink = link;
	elem = document.getElementsByClassName('iconHeader')[0];
	if(elem.className.indexOf("icon_")>-1)
		elem.className = elem.className.substring(0,elem.className.indexOf("icon_")-1) + " " + icon;
	else
		elem.className = elem.className + " " + icon;
};

var newTime = function (oldTime){
	return oldTime.getHours()+":"+oldTime.getMinutes()+", le "+oldTime.getDay()+"/"+oldTime.getMonth();
};

var getStuffById = function(id,stuffArray){
	for(var i = 0; i<stuffArray.length;i++){
		if (id == stuffArray[i].id)
			return stuffArray[i];
	}
};

var getJour = function(date){
  var semaine = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
  var mois = ['Janvier','Fevrier','Mars','Avril','Mai','Juin','Juillet','Aout','Septembre','Octobre','Novembre','Decembre'];
  var m = mois[date.getMonth()];
  var j = semaine[date.getDay()];
  return(j+' '+date.getDate()+' '+m);
};
var getHour = function(date){
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
}



var app = angular.module('starter', ['ionic', 'ngCordova','openfb','connections','field','foot','friends','profil','user','chat','friend', 'note', 'conv','notif','resetPassword','ui-rangeSlider'])

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
      if(res) {
        console.log('here');
        ok();
      }
      else{
        console.log('not');
      }
    });
  };
  return showConfirm;
}])


//Get all necessary info on the notif: texte attribute related_user name and link (called in NotifController and app.run)
.factory('$handleNotif',['$http','$localStorage',function($http,$localStorage){

var handle = function(notif,callback){

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
        return ['à confirmé sa présence à votre foot.','/friend/'];
      case 'footAnnul':
        return['à annulé son foot.'];
    }
  };

  $http.get('http://localhost:1337/user/get/'+notif.related_user).success(function(user){
    if(user.id == $localStorage.user.id)
     notif.userName == "Vous";
    else
      notif.userName = user.first_name; 

   notif.texte = parseNotif(notif.typ)[0];
    if(notif.related_stuff)
      notif.url = parseNotif(notif.typ)[1]+notif.related_stuff;

    date = new Date(notif.createdAt);    
    notif.date = getHour(date)+', le '+getJour(date).substring(getJour(date).indexOf(date.getDate()),getJour(date).length); //('20h06, le 27 Mai')
    if(callback)
      callback();

  });
};
return handle;
}])

.run(function($ionicPlatform,OpenFB,$rootScope,$http,$localStorage,$handleNotif) {
  $localStorage.notifs = []; //Prevent for bug if notif received before the notif page is opened
  $localStorage.footInvitation = [];
  $localStorage.footTodo = [];
  $localStorage.footPlayers = []; //EACH LINE FOR EACH PLAYERS
  $rootScope.nbNotif = 0;

  $rootScope.$on('$stateChangeSuccess',function(e,toState,toParams,fromState){    //EVENT WHEN LOCATION CHANGE
    setTimeout(function(){   // PERMET DE CHARGER LA VUE AVANT
      if(toState.url.indexOf('profil')>0)                  // Menu transparent pour profil
        $('.actu_header').addClass('transparent');
      if(toState.url.indexOf('notif')>0)
        $rootScope.nbNotif = 0; 
      if(fromState.url.indexOf('profil')>0){
        $('.actu_header').removeClass('transparent');
      }
    },0);
  });

  io.socket.on('disconnect',function(){
    if($localStorage.user && $localStorage.user.id)
      $http.post('http://localhost:1337/connexion/delete',{id : $localStorage.user.id});
  });
  
  // Notification event handler
  io.socket.on('notif',function(data){
    $rootScope.nbNotif++;
    $handleNotif(data);
    $rootScope.$digest();//Wait the notif to be loaded

    if(data.typ == 'newFriend'){
      $http.get('http://localhost:1337/user/get/'+data.related_stuff).success(function(user){
        user.statut = 0;
        $localStorage.friends.push(user);
      });
    }

    if(data.typ == 'footInvit'){
        var isFinish = false; //Two actions in the same time
        $http.get('http://localhost:1337/foot/getInfo/'+data.id).success(function(info){
          data.organisator = info.orga;
          data.orgaName = info.orgaName;
          data.field = info.field;
          if(isFinish)
            $localStorage.footInvitation.push(data);
          isFinish = true;
        });
        $http.get('http://localhost:1337/foot/getPlayers/'+data.id).success(function(players){
          $localStorage.footPlayers.push([data.id]);
          $localStorage.footPlayers[$localStorage.footPlayers.length-1] = $localStorage.footPlayers[$localStorage.footPlayers.length-1].concat(players);
          data.confirmedPlayers = players.length;
          if(isFinish)
            $localStorage.footInvitation.push(data);
          isFinish = true;
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

  OpenFB.init('491593424324577','http://localhost:8100/oauthcallback.html',window.localStorage);

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
  if(window.cordova && window.cordova.plugins.Keyboard) {
    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
  }
  if(window.StatusBar) {
    StatusBar.styleDefault();
  }
});

})
  app.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
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
    cache: false,
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
    url: '/conv',
    templateUrl: "templates/conv.html",
    controller: 'ConvCtrl'
  })

  $stateProvider.state('user.profil', {
    cache: false,
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
    url: '/noter',
    templateUrl: "templates/noter.html",
    controller: 'NoteCtrl'

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
    cache: true,
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

  $httpProvider.interceptors.push(function($q, $location, $localStorage) {
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
        return $q.reject(response);
      }
    };
  })
});