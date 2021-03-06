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
    // alert(JSON.stringify(error));
    $ionicLoading.hide();
  };

  //this method is to get the user profile info from the facebook api
  obj.getFacebookProfileInfo = function (token) {
    var info = $q.defer();
    $http({
      method: 'GET',
      url: 'https://graph.facebook.com/me?access_token='+token+'&fields=id,name,first_name,last_name,email,birthday'
    }).then(function successCallback(response) {
      info.resolve(response.data);
    }, function errorCallback(response) {
      info.reject(response);
    });
    // facebookConnectPlugin.api('/me?access_token='+token+'&fields=id,name,first_name,last_name,email,birthday', ['email','public_profile','user_friends'],
    //   function (response) {
    //     console.log(response);
    //     info.resolve(response);
    //   },
    //   function (response) {
    //     console.log(response);
    //     info.reject(response);
    //   });
return info.promise;
}



//This method is executed when the user press the "Login with facebook" button
obj.connect = function(){
  if (!window.cordova) {
      //this is for browser only
      facebookConnectPlugin.browserInit(FACEBOOK_APP_ID);
    }
    facebookConnectPlugin.login(['email','public_profile', 'user_friends'], obj.fbLoginSuccess, obj.fbLoginError);
    fbLogged.promise.then(function(authData) {
          var fb_uid = authData.id;
          var fb_access_token = authData.access_token;
          obj.getFacebookProfileInfo(fb_access_token).then(function(data) {
            // console.log('hello1');
            var user = data;
            user.picture = "http://graph.facebook.com/"+fb_uid+"/picture?width=400&height=400";
            user.access_token = fb_access_token;
            if(!data.email)
              user.email = fb_uid+"@facebook.com";
            $http.post(serverAddress+'/facebookConnect',{email: user.email,first_name: user.first_name,last_name: user.last_name,facebook_id: fb_uid,fbtoken:fb_access_token}).success(function(response){
              $localStorage.set('token',response.token);
              $localStorage.setObject('user',response);
              $connection(response.id,function(){
                // console.log('hello3');
                obj.getFacebookFriendsInfos(fb_access_token);
                $location.path('/user/profil');
              },true);
            }).error(function(err){
              console.log(err);
            });
          });
});
}

// obj.connect = function(){
//   if (!window.cordova) {
//       //this is for browser only
//       facebookConnectPlugin.browserInit(FACEBOOK_APP_ID);
//     }


//   facebookConnectPlugin.getLginStatus(function(success){

//     if (success.status != 'connected'){
//       facebookConnectPlugin.login(['email',
//         'public_profile', 'user_friends'], obj.fbLoginSuccess, obj.fbLoginError);
//       console.log('ok here');

//       fbLogged.promise.then(function(authData) {
//           var fb_uid = authData.id;
//           var fb_access_token = authData.access_token;
//           obj.getFacebookProfileInfo(fb_access_token).then(function(data) {
//             var user = data;
//             if(!data.email)
//               user.email = fb_uid+"@facebook.com";
//             user.picture = "http://graph.facebook.com/"+fb_uid+"/picture?width=400&height=400";
//             user.access_token = fb_access_token;
//             $http.post(serverAddress+'/facebookConnect',{email: user.email,first_name: user.first_name,last_name: user.last_name,facebook_id: fb_uid,fbtoken:fb_access_token}).success(function(response){
//               $localStorage.set('token',response.token);
//               $localStorage.setObject('user',response);
//               $connection(response.id,function(){
//                 obj.getFacebookFriendsInfos(fb_access_token);
//                 $location.path('/user/profil');
//               },true);
//             }).error(function(err){
//               console.log(err);
//             });
//           });
//       });
//   }
// // TODO CLEAN ALL THAT SHIT !!
//   else{
//           console.log('ok here');
//           var authData = success.authResponse;
//           var fb_uid = authData.id;
//           var fb_access_token = authData.access_token || authData.accessToken;
//           obj.getFacebookProfileInfo(fb_access_token).then(function(data) {
//             var user = data;

//             if(!fb_uid)
//               fb_uid = user.id;

//             user.picture = "http://graph.facebook.com/"+fb_uid+"/picture?width=400&height=400";
//             user.access_token = fb_access_token;

//             $http.post(serverAddress+'/facebookConnect',{email: user.email,first_name: user.first_name,last_name: user.last_name,facebook_id: fb_uid,fbtoken:fb_access_token}).success(function(response){
//               $localStorage.set('token',response.token);
//               $localStorage.setObject('user',response);
//               $connection(response.id,function(){
//                 obj.getFacebookFriendsInfos(fb_access_token);
//                 $location.path('/user/profil');
//               },true);
//             }).error(function(err){
//               console.log(err);
//             });
//           });
//       }
// });
// }

// obj.connect_wf = function(authData, callback){
//             var fb_uid = authData.id;
//           var fb_access_token = authData.access_token;
//           console.log('hi');
//           obj.getFacebookProfileInfo(fb_access_token).then(function(data) {
//             console.log('hello1');
//             var user = data;
//             user.picture = "http://graph.facebook.com/"+fb_uid+"/picture?width=400&height=400";
//             user.access_token = fb_access_token;

//             $http.post(serverAddress+'/facebookConnect',{email: user.email,first_name: user.first_name,last_name: user.last_name,facebook_id: fb_uid,fbtoken:fb_access_token}).success(function(response){
//               console.log('hello2');
//               $localStorage.set('token',response.token);
//               $localStorage.setObject('user',response);
//               $connection(response.id,function(){
//                 console.log('hello3');
//                 obj.getFacebookFriendsInfos(fb_access_token);
//                 $location.path('/user/profil');
//               },true);
//             }).error(function(err){
//               console.log(err);
//             });
//           });
// }

obj.getFacebookFriends = function (token, callback) {
  var friends = $q.defer();

  $http({
    method: 'GET',
    url: 'https://graph.facebook.com/me/friends?access_token='+token+'&fields=id,picture,name'
  }).then(function successCallback(response) {
    friends.resolve(response.data);
  }, function errorCallback(response) {
   friends.reject(response);
 });
  // facebookConnectPlugin.api('/me/friends?access_token='+token+'&fields=id,picture,name', ['email','public_profile','user_friends'],
  //   function (result) {
  //     friends.resolve(result);
  //   }, 
  //   function (error) { 
  //     friends.reject(error);
  //   });
return friends.promise;
}

obj.getFacebookFriendsInfos = function(token){
  obj.getFacebookFriends(token).then(function(friends){
    var friendsId = _.pluck(friends.data,'id');
    $http.post(serverAddress+"/user/getViaFbId",{users:friendsId}).success(function(data){
      $localStorage.setObject("facebookFriends", data);
    });
  });
}

obj.logout = function(){
  facebookConnectPlugin.logout(
    function(success){
    },
    function(faillure){
      console.log(faillure);
    }
    )
}
return obj;

}])