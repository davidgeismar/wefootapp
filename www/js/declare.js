var app = angular.module('starter', ['ionic', 'ngCordova','openfb','connections','field','foot','friends','profil','user','chat','friend', 'note'])

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


.run(function($ionicPlatform,OpenFB,$rootScope) {
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
  io.socket.on('connect',function(){
    console.log('CONNECTEDD');
  });
  io.socket.on('notif',function(data){
    console.log('received');
    console.log(data);
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