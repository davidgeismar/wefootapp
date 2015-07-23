app.factory('fbConnect',['$http','$localStorage','$rootScope','$ionicLoading','$ionicPlatform','$location','$q','$connection',function($http,$localStorage,$rootScope,$ionicLoading,$ionicPlatform,$location, $q, $connection){

//FACEBOOK CONNECT BEGINS

var FACEBOOK_APP_ID = 1133277800032088;
var fbLogged = $q.defer();


var obj = {};

//This is the success callback from the login method
obj.fbLoginSuccess = function(response) {


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
obj.fbLoginError = function(error){
    fbLogged.reject(error);
    alert(error);
    $ionicLoading.hide();
  };

  //this method is to get the user profile info from the facebook api
obj.getFacebookProfileInfo = function () {
    var info = $q.defer();
    facebookConnectPlugin.api('/me', "",
      function (response) {
        alert("Result: " + JSON.stringify(response));
        info.resolve(response);
      },
      function (response) {
        info.reject(response);
      });
    return info.promise;
  }



//This method is executed when the user press the "Login with facebook" button
obj.connect = function(){
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
          'public_profile', 'user_friends'], obj.fbLoginSuccess, obj.fbLoginError);

        fbLogged.promise.then(function(authData) {
          var fb_uid = authData.id,
          fb_access_token = authData.access_token;

            //get user info from FB
            obj.getFacebookProfileInfo().then(function(data) {
              var user = data;

              user.picture = "http://graph.facebook.com/"+fb_uid+"/picture?width=400&height=400";
              user.access_token = fb_access_token;

              //save the user data
              //for the purpose of this example I will store it on ionic local storage but you should save it on a database

              $http.post(serverAddress+'/facebookConnect',{email: user.email,first_name: user.first_name,last_name: user.last_name,facebook_id: fb_uid,fbtoken:fb_access_token}).success(function(response){
                $localStorage.set('token',response.token);
                $localStorage.setObject('user',response);
                $connection(response.id,function(){
                  // $ionicLoading.hide();
                  $location.path('/user/profil');


                },true);
              }).error(function(err){
                console.log(err);
              });
            });
          });
// }
});


}

	obj.getFacebookFriends = function () {
    var friends = $q.defer();
    facebookConnectPlugin.api('/me/friends?fields=picture,name', ["basic_info", "user_friends"],
      function (result) {
        console.log('friends');
        console.log(result);
        friends.resolve(result);
      }, 
      function (error) { 
        alert("Failed: " + error);
        friends.reject(error);
      });
    return friends.promise;
  }

	  return obj;

}])