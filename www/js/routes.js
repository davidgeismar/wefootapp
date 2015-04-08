app.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
  $urlRouterProvider.otherwise('/')

  $stateProvider.state('home', {
    url: '/',
    templateUrl: 'templates/home.html',
    controller: 'HomeCtrl'
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

    $stateProvider.state('foots.crees', {
        url: "/crees",
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