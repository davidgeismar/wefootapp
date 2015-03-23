// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic'])


.run(function($ionicPlatform) {
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

//Controllers

app.controller('LoginCtrl', function($scope, $http, $rootScope, $location){
  $scope.user = {};
  $scope.launchReq = function(){
    $http.post('http://localhost:1337/session/login',$scope.user).success(function(data){
      console.log('success');
      $location.path('/profil/'+data.id);
    }).error(function(){
      console.log('error');
    });
  }
})

app.controller('RegisterCtrl', function($scope, $http){
  $scope.user = {};

  $scope.launchReq = function(){
    $http.post('http://localhost:1337/user/create',$scope.user).success(function(){
      console.log('success');
    }).error(function(){
      console.log('error');
    });
  }
})

app.controller('ProfilCtrl', function($scope, $stateParams, $http){
  $http.get('http://localhost:1337/user/'+$stateParams.userId).success(function(data){
    $scope.user = data;
  }).error(function(){
    console.log('error');
  });
})





//Routes

app.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/')

  $stateProvider.state('home', {
    url: '/',
    templateUrl: 'templates/home.html',
  })

  $stateProvider.state('register', {
    url: '/register',
    templateUrl: 'templates/register.html',
    controller: 'RegisterCtrl' 
  })

  $stateProvider.state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'   
  })

  $stateProvider.state('profil', {
    url: '/profil/:userId',
    templateUrl: 'templates/profil.html',
    controller: 'ProfilCtrl'   
  })

})