/**
 * OpenFB is a micro-library that lets you integrate your JavaScript application with Facebook.
 * OpenFB works for both BROWSER-BASED apps and CORDOVA/PHONEGAP apps.
 * This library has no dependency: You don't need (and shouldn't use) the Facebook SDK with this library. Whe running in
 * Cordova, you also don't need the Facebook Cordova plugin. There is also no dependency on jQuery.
 * OpenFB allows you to login to Facebook and execute any Facebook Graph API request.
 * @author Christophe Coenraets @ccoenraets
 * @version 0.1
 */
var openFB = (function() {

    var FB_LOGIN_URL = 'https://www.facebook.com/dialog/oauth',

        // By default we store fbtoken in sessionStorage. This can be overriden in init()
        tokenStore = window.sessionStorage,

        fbAppId,
        oauthRedirectURL,

        // Because the OAuth login spawns multiple processes, we need to keep the success/error handlers as variables
        // inside the module as opposed to keeping them local within the function.
        loginSuccessHandler,
        loginErrorHandler;

    /**
     * Initialize the OpenFB module. You must use this function and initialize the module with an appId before you can
     * use any other function.
     * @param appId - The id of the Facebook app
     * @param redirectURL - The OAuth redirect URL. Optional. If not provided, we use sensible defaults.
     * @param store - The store used to save the Facebook token. Optional. If not provided, we use sessionStorage.
     */
    function init(appId, redirectURL, store) {
        fbAppId = appId;
        if (redirectURL) oauthRedirectURL = redirectURL;
        if (store) tokenStore = store;
    }

    /**
     * Login to Facebook using OAuth. If running in a Browser, the OAuth workflow happens in a a popup window.
     * If running in Cordova container, it happens using the In-App Browser. Don't forget to install the In-App Browser
     * plugin in your Cordova project: cordova plugins add org.apache.cordova.inappbrowser.
     * @param scope - The set of Facebook permissions requested
     * @param success - Callback function to invoke when the login process succeeds
     * @param error - Callback function to invoke when the login process fails
     * @returns {*}
     */
    function login(scope, success, error) {

        if (!fbAppId) {
            return error({error: 'Facebook App Id not set.'});
        }

        var loginWindow;

        scope = scope || '';

        loginSuccessHandler = success;
        loginErrorHandler = error;

        if (!oauthRedirectURL) {
            if (runningInCordova()) {
                oauthRedirectURL = 'https://www.facebook.com/connect/login_success.html';
            } else {
                // Trying to calculate oauthRedirectURL based on the current URL.
                var index = document.location.href.indexOf('index.html');
                if (index > 0) {
                    oauthRedirectURL = window.document.location.href.substring(0, index) + 'oauthcallback.html';
                } else {
                    return alert("Can't reliably guess the OAuth redirect URI. Please specify it explicitly in openFB.init()");
                }
            }
        }

        loginWindow = window.open(FB_LOGIN_URL + '?client_id=' + fbAppId + '&redirect_uri=' + oauthRedirectURL +
            '&response_type=token&display=popup&scope=' + scope, '_blank', 'location=no');

        // If the app is running in Cordova, listen to URL changes in the InAppBrowser until we get a URL with an access_token
        if (runningInCordova()) {
            loginWindow.addEventListener('loadstart', function (event) {
                var url = event.url;
                if (url.indexOf("access_token=") > 0) {
                    loginWindow.close();
                    oauthCallback(url);
                }
            });

            loginWindow.addEventListener('exit', function (event) {
                // Handle the situation where the user closes the login window manually before completing the login process
                var url = event.url;
                if (url.indexOf("access_token=") > 0) {
                    deferredLogin.reject();
                }
            });
        }
        // Note: if the app is running in the browser the loginWindow dialog will call back by invoking the
        // oauthCallback() function. See oauthcallback.html for details.

    }

    /**
     * Called either by oauthcallback.html (when the app is running the browser) or by the loginWindow loadstart event
     * handler defined in the login() function (when the app is running in the Cordova/PhoneGap container).
     * @param url - The oautchRedictURL called by Facebook with the access_token in the querystring at the ned of the
     * OAuth workflow.
     */
    function oauthCallback(url) {
        // Parse the OAuth data received from Facebook
        var hash = decodeURIComponent(url.substr(url.indexOf('#') + 1)),
            params = hash.split('&'),
            oauthData = {};
        params.forEach(function (param) {
            var splitter = param.split('=');
            oauthData[splitter[0]] = splitter[1];
        });
        var fbtoken = oauthData['access_token'];
        if (fbtoken) {
            tokenStore['fbtoken'] = fbtoken;
            if (loginSuccessHandler) loginSuccessHandler();
        } else {
            if (loginErrorHandler) loginErrorHandler();
        }
    }

    /**
     * Application-level logout: we simply discard the token.
     */
    function logout() {
        tokenStore['fbtoken'] = undefined;
    }

    /**
     * Lets you make any Facebook Graph API request.
     * @param obj - Request configuration object. Can include:
     *  method:  HTTP method: GET, POST, etc. Optional - Default is 'GET'
     *  path:    path in the Facebook graph: /me, /me.friends, etc. - Required
     *  params:  queryString parameters as a map - Optional
     *  success: callback function when operation succeeds - Optional
     *  error:   callback function when operation fails - Optional
     */
    function api(obj) {

        var method = obj.method || 'GET',
            params = obj.params || {},
            xhr = new XMLHttpRequest(),
            url;

        params['access_token'] = tokenStore['fbtoken'];

        url = 'https://graph.facebook.com' + obj.path + '?' + toQueryString(params);

        xhr.onreadystatechange = function() {
            console.log(xhr.readyState + ' ' + xhr.status);
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    if (obj.success) obj.success(JSON.parse(xhr.responseText));
                } else {
                    var error = xhr.responseText ? JSON.parse(xhr.responseText).error : {message: 'An error has occurred'};
                    if (obj.error) obj.error(error);
                }
            }
        }

        xhr.open(method, url, true);
        xhr.send();
    }

    /**
     * Helper function to de-authorize the app
     * @param success
     * @param error
     * @returns {*}
     */
    function revokePermissions(success, error) {
        return api({method: 'DELETE',
            path:'/me/permissions',
            success: function() {
                tokenStore['fbtoken'] = undefined;
                success();
            },
            error: error});
    }

    function toQueryString(obj) {
        var parts = [];
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
            }
        }
        return parts.join("&");
    }

    function runningInCordova() {
        return window.device && window.device.cordova;
    }

    // The public API
    return {
        init: init,
        login: login,
        logout: logout,
        revokePermissions: revokePermissions,
        api: api,
        oauthCallback: oauthCallback
    }

}());
var modalLink = "";
var switchIcon = function (icon,link) {       // Switch the icon in the header bar
      modalLink = link;
      elem = document.getElementsByClassName('iconHeader')[0];
      if(elem.className.indexOf("icon_")>-1)
        elem.className = elem.className.substring(0,elem.className.indexOf("icon_")-1) + " " + icon;
      else
        elem.className = elem.className + " " + icon;
};
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
app.controller('ChatCtrl', function($scope, $localStorage){
   $scope.user = $localStorage.user;
})
app.controller('FieldCtrl', function($scope, $http, $cordovaFileTransfer, $cordovaImagePicker){
  $scope.field = {};
  $scope.field.origin = "private";

  var imageUri;

    var options = {
      maximumImagesCount: 1,
      width: 800,
      height: 800,
      quality: 80
    };



  $scope.getPic = function(){
    $cordovaImagePicker.getPictures(options)
    .then(function (results) {
      imageUri = results[0] ; 

    }, function(error) {
      console.log('Error pic');
    });
}



  $scope.launchReq = function(){
    $http.post('http://localhost:1337/field/create',$scope.field).success(function(data, status) {
      console.log(data.field);

          var optionsFt = {
                  params : {
                    fieldId: data.field
                    }
                  
    };

      $cordovaFileTransfer.upload('http://localhost:1337/field/uploadPic', imageUri, optionsFt)
      .then(function(result) {  
        // Success!
        console.log("successssss");
      }, function(err) {
        // Error
        console.log("fail");
      }, function (progress) {
        console.log("progress");
        // constant progress updates
      });
                  


  })
    .error(function(){
      console.log('error');
    })
  }
})

app.controller('FootCtrl',function($scope){
$ionicModal.fromTemplateUrl('foot-modal.html', {
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
  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });
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
app.controller('HomeCtrl', function($scope){
  $scope.facebookConnect = function(){
  	  openFB.init('491593424324577','http://localhost/openfb/oauthcallback.html', window.localStorage);
      openFB.login('email',function(){
      	console.log('here');
        openFB.api({
            path: '/me',
            success: function(data) {
                console.log(JSON.stringify(data));
            },
            error: function(error){alert(error.message);}
        });
      },function(){alert('error')});
    };
})
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
app.controller('MenuController', function($scope, $ionicSideMenuDelegate,$localStorage) { 
  $scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };
})
app.controller('ProfilCtrl', function($scope, $stateParams, $location, $http, $localStorage){
  $scope.user = $localStorage.user;
  switchIcon('icon_none','');
  $http.post('http://localhost:1337/checkConnect',{id:$scope.user.id}).success(function(){    // Check if connected
  }).error(function(){
    $location.path('/login');
  });
})
app.controller('RegisterCtrl', function($scope, $http, $location, $localStorage){
  $scope.err = "";
  $scope.user={};
  $scope.launchReq = function(){
    $http.post('http://localhost:1337/user/create',$scope.user).success(function(data){
       $localStorage.token = data[0].token;
       $localStorage.user = data[0];
       $location.path('/user/profil/'+data.id);
    }).error(function(){
      $scope.err = "Erreur veuillez vérifier que tous les champs sont remplis.";
    });
  }
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
var modalLink = "";
var switchIcon = function (icon,link) {       // Switch the icon in the header bar
      modalLink = link;
      elem = document.getElementsByClassName('iconHeader')[0];
      if(elem.className.indexOf("icon_")>-1)
        elem.className = elem.className.substring(0,elem.className.indexOf("icon_")-1) + " " + icon;
      else
        elem.className = elem.className + " " + icon;
};
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