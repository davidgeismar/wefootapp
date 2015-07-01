angular.module('connections',[])


.controller('HomeCtrl', function($scope,$http,$localStorage,$ionicUser,$ionicPush, $location,$rootScope, $ionicLoading,$connection,$ionicPlatform,$ionicHistory,$state, $q){
  $rootScope.toShow = false;
 //Prevent for loading to early

 $ionicPlatform.ready(function(){

  //Check internet connection

  if($localStorage.getObject('user') && $localStorage.getObject('user').id){ //If user has already sat connection from this device he will be logged automatically
          $ionicLoading.show({
            content: 'Loading Data',
            animation: 'fade-out',
            showBackdrop: false,
            hideOnStateChange: false
          });
          $connection($localStorage.getObject('user').id,function(){
            $location.path('/user/profil');
          },false);
  }
  else{
    $rootScope.toShow = true;
  }
});


// $scope.facebookConnect = function(){
//   $ionicHistory.clearCache();
//   $ionicHistory.clearHistory();
//   OpenFB.login('email','public_profile','user_friends').then(function(){
//     OpenFB.get('/me').success(function(data){
//       $ionicLoading.show({
//         content: 'Loading Data',
//         animation: 'fade-out',
//         showBackdrop: false,
//         hideOnStateChange: false
//       });
//       $http.post('http://62.210.115.66:9000/facebookConnect',{email: data.email,first_name: data.first_name,last_name: data.last_name,facebook_id: data.id,fbtoken:window.localStorage.fbtoken}).success(function(response){
//         $localStorage.token = response.token;
//         $localStorage.user = response;
//         $connection(response.id,function(){
//           $location.path('/user/profil');
//         },true);
//       });
//     });
//   },function(){$ionicLoading.hide(); $scope.err = "Erreur lors de la connexion via facebook"});

// };



//FACEBOOK CONNECT BEGINS

var FACEBOOK_APP_ID = 1133277800032088;
var fbLogged = $q.defer();

//This is the success callback from the login method
var fbLoginSuccess = function(response) {


  if (!response.authResponse){
    fbLoginError("Cannot find the authResponse");
    return;
  }
  var expDate = new Date(
    new Date().getTime() + response.authResponse.expiresIn * 1000
    ).toISOString();

  var authData = {
    id: String(response.authResponse.userID),
    access_token: response.authResponse.accessToken,
    expiration_date: expDate
  }
  fbLogged.resolve(authData);
};

  //This is the fail callback from the login method
  var fbLoginError = function(error){
    fbLogged.reject(error);
    alert(error);
    $ionicLoading.hide();
  };

  //this method is to get the user profile info from the facebook api
  var getFacebookProfileInfo = function () {
    var info = $q.defer();
    facebookConnectPlugin.api('/me', "",
      function (response) {
        info.resolve(response);

      },
      function (response) {
        info.reject(response);

      }
      );
    return info.promise;
  }

  var getFacebookFriends = function () {
    var friends = $q.defer();
    facebookConnectPlugin.api('/me/friends?fields=picture,name', ["basic_info", "user_friends"],
      function (result) {
        friends.resolve(result);
      }, 
      function (error) { 
        alert("Failed: " + error);
        friends.reject(error);
      });
    return friends.promise;
  }

//This method is executed when the user press the "Login with facebook" button
$scope.facebookConnect = function() {
  $ionicHistory.clearCache();
  $ionicHistory.clearHistory();
  if (!window.cordova) {
      //this is for browser only
      facebookConnectPlugin.browserInit(FACEBOOK_APP_ID);
    }

    //check if we have user's data stored
    //var user = UserService.getUser();

    facebookConnectPlugin.getLoginStatus(function(success){
      // alert(success.status);

      //TO DO : SI STATUS = CONNECTED MAIS QU'ON TROUVE PAS LE TOKEN IL FAUT VIRER LE MEC DE LA BD
      // if(success.status === 'connected'){
      //   // the user is logged in and has authenticated your app, and response.authResponse supplies
      //   // the user's ID, a valid access token, a signed request, and the time the access token
      //   // and signed request each expire
      //   $location.path('/user/profil');

      // } else {
        //if (success.status === 'not_authorized') the user is logged in to Facebook, but has not authenticated your app
        //else The person is not logged into Facebook, so we're not sure if they are logged into this app or not.

        $ionicLoading.show({
          content: 'Loading Data',
          animation: 'fade-out',
          showBackdrop: false,
          hideOnStateChange: false
        });
        $rootScope.toShow = false;
        //ask the permissions you need
        //you can learn more about FB permissions here: https://developers.facebook.com/docs/facebook-login/permissions/v2.2
        facebookConnectPlugin.login(['email',
          'public_profile', 'user_friends'], fbLoginSuccess, fbLoginError);

        fbLogged.promise.then(function(authData) {

          var fb_uid = authData.id,
          fb_access_token = authData.access_token;

            //get user info from FB
            getFacebookProfileInfo().then(function(data) {

              var user = data;
              user.picture = "http://graph.facebook.com/"+fb_uid+"/picture?type=large";
              user.access_token = fb_access_token;

              //save the user data
              //for the purpose of this example I will store it on ionic local storage but you should save it on a database

              $http.post('http://'+serverAddress+'/facebookConnect',{email: user.email,first_name: user.first_name,last_name: user.last_name,facebook_id: fb_uid,fbtoken:fb_access_token}).success(function(response){
                $localStorage.set('token',response.token);
                $localStorage.setObject('user',response);
                $connection(response.id,function(){
                  getFacebookFriends().then(function(data){
                    $localStorage.facebookFriends = data.data;
                    $location.path('/user/profil');
                  });
                  // }).error(function(err){
                  //   $location.path('/user/profil');
                  // });


                },true);
              }).error(function(err){
                console.log(err);
              });
            });
});
// }
});
}




})


.controller('LoginCtrl', function($scope, $http, $location, $localStorage, $rootScope,$ionicLoading,$connection,$ionicHistory){
  $scope.err = "";
  $scope.user={};

  $scope.launchReq = function(){
    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();
    $ionicLoading.show({
      content: 'Loading Data',
      animation: 'fade-out',
      showBackdrop: false,
      hideOnStateChange: false
    });
    $http.post('http://'+serverAddress+'/session/login',$scope.user).success(function(data){
      $localStorage.set('token',data.token);
      $localStorage.setObject('user',data);
      $connection(data.id,function(){
        $location.path('/user/profil');
      },true);                
    }).error(function(){
     $ionicLoading.hide();
     $scope.err = "Identifiant ou mot de passe incorrect.";
   });   
  }

})

.controller('RegisterCtrl', function($scope, $http, $location, $localStorage,$ionicLoading, $ionicHistory){
  $ionicHistory.clearCache();
  $ionicHistory.clearHistory();
  $scope.err = "";
  $scope.user={};
  $scope.launchReq = function(){
    $ionicLoading.show({
      content: 'Loading Data',
      animation: 'fade-out',
      showBackdrop: false,
      hideOnStateChange: true
    });
    $http.post('http://'+serverAddress+'/user/create',$scope.user).success(function(data){
     $localStorage.token = data[0].token;
     $localStorage.setObject('user',data[0]);
     $localStorage.setObject('friends',[]);
     io.socket.post('http://'+serverAddress+'/connexion/setSocket',{id: data[0].id}); //Link socket_id with the user.id
     $location.path('/user/profil');
   }).error(function(err){
    $ionicLoading.hide();
    console.log(err);
    console.log($scope.user);
    $scope.err = "Erreur veuillez vérifier que tous les champs sont remplis.";
  });
 }
})