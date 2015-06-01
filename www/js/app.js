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
// var showLoader = function(){

// }



var app = angular.module('starter', ['ionic', 'ngCordova','openfb','connections','field','foot','friends','profil','user','chat','friend', 'note', 'conv','notif','resetPassword'])

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


.run(function($ionicPlatform,OpenFB,$rootScope,$http,$localStorage) {
  $rootScope.nbNotif = 0;
  $rootScope.$on('$stateChangeSuccess',function(e,toState,toParams,fromState){    //EVENT WHEN LOCATION CHANGE
    setTimeout(function(){   // PERMET DE CHARGER LA VUE AVANT
      if(toState.url.indexOf('profil')>0){                   // Menu transparent pour profil
        $('.actu_header').addClass('transparent');
      }
      else if(fromState.url.indexOf('profil')>0){
        $('.actu_header').removeClass('transparent');
      }
    },0);
  });

  // io.socket.on('connect',function(){
  //   console.log('CONNECTEDD');

    io.socket.on('disconnect',function(){
      $http.post('http://localhost:8100/connexion/delete',{id : $localStorage.user.id});
    });

  // Notification event handler
  io.socket.on('notif',function(data){
    $rootScope.nbNotif++;
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
    url: '/friend',
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