// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic', 'ngCordova'])




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

.run(function($ionicPlatform, $cordovaSplashscreen) {

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
      setTimeout(function() {
    $cordovaSplashscreen.hide()}, 1000)

    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

//Controllers

app.controller('LoginCtrl', function($scope, $http, $location, $localStorage){
  $scope.err = "";
  $scope.user={};
  if($localStorage.user) $location.path('/user/profil/'+$localStorage.user.id);  // TODO FIX PROB
  $scope.launchReq = function(){
    $http.post('http://localhost:1337/session/login',$scope.user).success(function(data){
      $localStorage.token = data.token;
      $location.path('/user/profil/'+data.id);
    }).error(function(){
       $scope.err = "Identifiant ou mot de passe incorrect.";
       // $location.path('/user/profil/'+data.id);
    });
  }
})

app.controller('RegisterCtrl', function($scope, $http, $location, $localStorage){
  $scope.err = "";
  $scope.user={};  
  $scope.launchReq = function(){
    $http.post('http://localhost:1337/user/create',$scope.user).success(function(data){
       $localStorage.token = data.token;
       $location.path('/user/profil/'+data.id);
    }).error(function(){
      $scope.err = "Erreur veuillez vérifier que tous les champs sont remplis.";
    });
  }
})

app.controller('ProfilCtrl', function($scope, $stateParams, $http, $localStorage){
  $http.get('http://localhost:1337/user/profil/'+$stateParams.userId).success(function(data){
    $scope.user = data;
    $localStorage.user = data;
  }).error(function(){
    console.log('error profil');
  });
})

app.controller('MenuController', function($scope, $ionicSideMenuDelegate) {
  $scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };
})

// app.controller('UserCtrl',function($scope){})

app.controller('FieldCtrl', function($scope, $http, $ionicPlatform, $cordovaImagePicker, $cordovaFileTransfer){


  var imageUrl;

  $scope.field = {};
  $scope.field.origin = "private";
  var optionsGetPic = {
   maximumImagesCount: 1,
   width: 800,
   height: 800,
   quality: 80
  };

  var optionsFt = {

    params : {
      fieldId : "fieldID"
    }
  };
 
  $scope.getPic = function(){
    
    $ionicPlatform.ready(function() {

    $cordovaImagePicker.getPictures(optionsGetPic)
    .then(function (results) {
      imageUrl = results[0] ;

      //   $cordovaFileTransfer.upload('http://localhost:1337/up/upload', results[0], optionsFt )
      // .then(function(result) {  
      //   // Success!
      //   console.log("successssss");
      // }, function(err) {
      //   // Error
      //   console.log("fail");
      // }, function (progress) {
      //   console.log("progress");
      //   // constant progress updates
      // });




    }, function(error) {
      console.log('error');
    });
  });
}



  $scope.launchReq = function(){
    $http.post('http://localhost:1337/field/create',$scope.field).success(function(data, status) {

      console.log(data);

  })
    .error(function(){
      console.log('error');
    });
  }



})


//Routes

app.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
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

  // $stateProvider.state('login', {
  //   url: '/login',
  //   templateUrl: 'templates/login.html',
  //   controller: 'LoginCtrl'   
  // })

  $stateProvider.state('user',{    // LAYOUT UN FOIS CONNECTE
    abstract: true,
    url: '/user',
    templateUrl: "templates/layout.html",
    controller: 'UserCtrl'
  })

  $stateProvider.state('user.profil', {
    url: '/profil/:userId',
    views: {
      'menuContent' :{
      templateUrl: "templates/profil.html",
      controller: 'ProfilCtrl'
      }
    }  
  })

    $stateProvider.state('new_field', {
    url: '/new_field',
    templateUrl: 'templates/new_field.html',
    controller: 'FieldCtrl'
  })

        $stateProvider.state('test', {
    url: '/test',
    templateUrl: 'templates/test.html',
    controller: 'FieldCtrl'
  })



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
