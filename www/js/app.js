
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

app.controller('LoginCtrl', function($scope, $http, $location, $localStorage){
  $scope.err = "";
  $scope.user={};

  if($localStorage.user) $location.path('/user/profil/'+$localStorage.user.id);  // TODO FIX PROB
  $scope.launchReq = function(){
    $http.post('http://localhost:1337/session/login',$scope.user).success(function(data){
      $localStorage.token = data.token;
      $localStorage.user = data;
      $location.path('/user/profil/'+data.id);
      $http.get('http://localhost:1337/getAllFriends/'+data.id).success(function(data){
        $localStorage.friends = data[0];
        angular.forEach($localStorage.friends,function(friend,index){   // Add attribute statut to friends to keep favorite
          friend.statut = data[1][index]; 
        });  
      }).error(function(err){ console.log('error')});
    }).error(function(){
       $scope.err = "Identifiant ou mot de passe incorrect.";
    });
  }
})

app.controller('RegisterCtrl', function($scope, $http, $location, $localStorage){
  $scope.err = "";
  $scope.user={};
  $scope.launchReq = function(){
    $http.post('http://localhost:1337/user/create',$scope.user).success(function(data){
       $localStorage.token = data.token;
       $localStorage.user = data;
       $location.path('/user/profil/'+data.id);
    }).error(function(){
      $scope.err = "Erreur veuillez vérifier que tous les champs sont remplis.";
    });
  }
})

app.controller('ChatCtrl', function($scope, $localStorage){
   $scope.user = $localStorage.user;
})

app.controller('ProfilCtrl', function($scope, $stateParams, $location, $http, $localStorage){
  $scope.user = $localStorage.user;
  switchIcon('icon_none','');
  $http.post('http://localhost:1337/checkConnect',{id:$scope.user.id}).success(function(){    // Check if connected
  }).error(function(){
    $location.path('/login');
  });
})

app.controller('MenuController', function($scope, $ionicSideMenuDelegate,$localStorage) { 
  $scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };
})

app.controller('UserCtrl',function($scope,$localStorage,$location,$ionicModal,$http){

  $scope.user = $localStorage.user;
  $scope.friends = {};

//Handle edit inputs on left menu
  $scope.toEdit = [false,false];
  if($scope.user && $scope.user.favorite_club==null){
    $scope.user.favorite_club = "Entrer un club";
  }
  if($scope.user && $scope.user.poste==null){
    $scope.user.poste = "Entrer votre poste";
  }

  //EDITIONS
  $scope.editClub = function(value){
    var self = this;
    if(value.length>0){
      $http.post('http://localhost:1337/editUser',{favorite_club: value}).success(function(){
        self.user.favorite_club = value;
        self.toEdit[0] = false;
      }).error(function(){
        console.log('error');
      });
    }
  }

    $scope.editPoste = function(value){
    var self = this;
    if(value.length>0){
      $http.post('http://localhost:1337/editUser',{poste: value}).success(function(){
        self.user.poste = value;
        self.toEdit[1] = false;
      }).error(function(){
        console.log('error');
      });
    }
  }


  //END EDITIONS
//END Handle Menu
  $scope.logout = function (){
    $localStorage.user = {};
    $localStorage.token = "";
    $location.path('/')
  };
  //MODAL HANDLER
  $ionicModal.fromTemplateUrl('templates/search.html', {
      scope: $scope,
      animation: 'slide-in-up'
  }).then(function(modal) {
      $scope.modal = modal;
  });
  $scope.openModal = function() {
      $scope.modal.show();
  };
  $scope.closeModal = function() {
      $scope.modal.hide();
  };
  $scope.switchSearchFb = function(){
      $('.opened_search').removeClass('opened_search');
      $('.switch_fb').addClass('opened_search');
      $('.hidden').removeClass('hidden');
      $('.content_wf_search').addClass('hidden');
  }
  $scope.switchSearchWf = function(){
      $('.opened_search').removeClass('opened_search');
      $('.switch_wf').addClass('opened_search');
      $('.hidden').removeClass('hidden');
      $('.content_fb_search').addClass('hidden');
    }
  $scope.searchQuery = function(word){
      $scope.friendsId = [];
      angular.forEach($localStorage.friends,function(friend){
        $scope.friendsId.push(friend.id);
      });
      if(word.length>2){
       $http.get('http://localhost:1337/search/'+word).success(function(data){
          $scope.results = data;
          }).error(function(){
          console.log('error');
        });
    }
  }
  $scope.addFriend = function(target){
    $http.post('http://localhost:1337/addFriend',{user1: $localStorage.user.id, user2: target}).success(function(data){
      $localStorage.friends.push(data[0]);
      $localStorage.friends[$localStorage.friends.length-1].statut = 0;
      $scope.friendsId.push(data[0].id);
      $scope.friends.push(data);
      $scope.friends[$localStorage.friends.length-1].statut = 0;
    }).error(function(){
      console.log('error');
    })
  }
})

app.controller('FriendsCtrl',function($scope, $localStorage, $http, $location){
  $http.post('http://localhost:1337/checkConnect',{id:$localStorage.user.id}).success(function(){    // Check if connected
    }).error(function(){
      $location.path('/login');
    });
   $scope.user = $localStorage.user;
   switchIcon('icon_friend','search');
   $scope.friends = $localStorage.friends;

   $scope.addFavorite = function(target){
      console.log('hello');
      var targetPosition = -1;
      angular.forEach($localStorage.friends,function(friend,index){
        if(friend.id == target){
          targetPosition = index;
        }
      });
    if($scope.friends[targetPosition].statut==0){
     console.log("Wrong");
     $http.post('http://localhost:1337/addFavorite',{id1: $localStorage.user.id, id2: target}).success(function(){
          $scope.friends[targetPosition].statut = 1;
      }).error(function(){
        console.log('error');
      });
    }
    else if($scope.friends[targetPosition].statut==1){
      console.log("RIght");
      $http.post('http://localhost:1337/removeFavorite',{id1: $localStorage.user.id, id2: target}).success(function(){
          $scope.friends[targetPosition].statut = 0;
      }).error(function(){
        console.log('error');
      });
    }
   } 
  })

app.controller('FootCtrl',function($scope){})

app.controller('FieldCtrl', function($scope, $http, $cordovaImagePicker){
  $scope.field = {};
  $scope.field.origin = "private";
    var options = {
      maximumImagesCount: 1,
      width: 800,
      height: 800,
      quality: 80
    };

  $scope.getPic = function(){
    $cordovaImagePicker.getPictures(options)
    .then(function (results) {
      for (var i = 0; i < results.length; i++) {
        console.log('Image URI: ' + results[i]);
      }
    }, function(error) {
      console.log('error');
    });
}

  $scope.launchReq = function(){
    $http.post('http://localhost:1337/field/create',$scope.field).success(function(){
    }).error(function(){
      console.log('error');
    });
  }
})


//Routes

// angular.module('ionicApp', ['ionic'])
app.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
  $urlRouterProvider.otherwise('/')

  $stateProvider.state('home', {
    url: '/',
    templateUrl: 'templates/home.html',
  })

  $stateProvider.state('chat', {
    url: '/chat',
    templateUrl: 'templates/chat.html',
  })
  
   $stateProvider.state('conv', {
    url: '/conv',
    templateUrl: 'templates/conv.html',
  })
  
  $stateProvider.state('foots', {
      url: '/foots',
      abstract: true,
      templateUrl: 'templates/foots.html',
      controller: 'FootCtrl'

    })
    .state('foots.crees', {
        url: "/crees.html",
        views: {
          'crees-tab': {
            templateUrl: "templates/crees.html",
             controller: 'FootCreesCtrl'
          }
        }
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

  $stateProvider.state('user',{    // LAYOUT UN FOIS CONNECTE
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

  $stateProvider.state('user.profil', {
    cache: false,
    url: '/profil/:userId',
    views: {
      'menuContent' :{
      templateUrl: "templates/profil.html",
      controller: 'ProfilCtrl'
      }
    }
  })

  $stateProvider.state('user.new_field', {
    url: '/new_field',
    templateUrl: 'templates/new_field.html',
    controller: 'FieldCtrl'
  })

  $stateProvider.state('user.friends', {
    cache: false,
    url: '/friends',
    views: {
      'menuContent' :{
      templateUrl: "templates/friends.html",
      controller: 'FriendsCtrl'
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
        });
     })
