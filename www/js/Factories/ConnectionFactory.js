app.factory('$connection',['$http','$localStorage','$rootScope','$ionicPush','$ionicUser','$ionicLoading','$ionicPlatform','$cordovaPush',function($http,$localStorage,$rootScope,$ionicPush,$ionicUser,$ionicLoading,$ionicPlatform,$cordovaPush){

  //Execute all functions asynchronously.

  var connect = function(userId, generalCallback,setUUID){
    $localStorage.user.lastUpdate = moment();

    var allFunction = [];
    var errors = [];

    var pushRegister = function() {

    // Register with the Ionic Push service.  All parameters are optional.
    $ionicPush.register({
        canShowAlert: true, //Can pushes show an alert on your screen?
        canSetBadge: true, //Can pushes update app icon badges?
        canPlaySound: true, //Can notifications play a sound?
        canRunActionsOnWake: true, //Can run actions outside the app,
        onNotification: function(notification) {
        // Handle new push notifications here
        console.log(notification);
        return true;
      }
    });
  };

// if(setUUID && window.device && window.device.model.indexOf('x86')==-1){  // No device on testing second argument removes emulators
//   allFunction.push(function(callback){
//     $localStorage.user.push = $ionicUser.get();
//     $localStorage.user.push.user_id = $localStorage.user.id.toString();
//     console.log($localStorage.user.push);
//     $ionicUser.identify($localStorage.user.push).then(function(){  
//       pushRegister();
//       $rootScope.$on('$cordovaPush:tokenReceived', function(event, data) {
//         $localStorage.user.pushToken = data.token;
//         $http.post('http://localhost:1337/push/create',{user: userId, push_id: data.token}).success(function(){
//           callback();
//         }).error(function(err){
//           errors.push(err);
//         });
//       });
//     });
//   });
// }

if(setUUID && window.device && window.device.model.indexOf('x86')==-1){  // No device on testing second argument removes emulators
  allFunction.push(function(callback){
    $ionicPlatform.ready(function () {
      $cordovaPush.register({
        badge: true,
        sound: true,
        alert: true
      }).then(function (result) {
        $localStorage.user.pushToken = result;
        console.log(result);
        $http.post('http://localhost:1337/push/create',{user: userId, push_id: result}).success(function(){
          callback();
        }).error(function(err){
          errors.push(err);
        });
      },function(err){
        console.log(err);
      });
    });
  });
}

allFunction.push(function(callback){
  io.socket.post('http://localhost:1337/connexion/setConnexion',{id: userId},function(){
    callback();
  }); 
});

    if(setUUID && window.device){  //no device on testing
      allFunction.push(function(callback){
        $http.post('http://localhost:1337/session/create',{user: userId, uuid: window.device.uuid}).success(function(){
          callback();
        });
      });
    }

    allFunction.push(function(callback){
      $http.get('http://localhost:1337/getAllFriends/'+userId+'/0').success(function(data){
        $localStorage.friends = data[0];
        if(data[0].length==0) callback();
        angular.forEach($localStorage.friends,function(friend,index){   // Add attribute statut to friends to keep favorite
          friend.statut = data[1][index].stat; 
          friend.friendship = data[1][index].friendship;
          if(index == $localStorage.friends.length-1) callback();
          });
        }).error(function(err){
          errors.push(err);
        });
    });

    allFunction.push(function(callback){
      $http.get('http://localhost:1337/getAllChats/'+userId).success(function(data){
        $localStorage.chats=data;
        $rootScope.initChatsNotif();
        callback();
      }).error(function(err){
        errors.push(err);
      });
    });

    allFunction.push(function(callback){
      $http.post('http://localhost:1337/user/getLastNotif',$localStorage.user).success(function(nb){
        $rootScope.nbNotif = nb.length;
        callback();
      }).error(function(err){
        errors.push(err);
      });       
    });


    async.each(allFunction, function(oneFunc,callback){
      oneFunc(function(){callback();})
    },function(){
      if(errors.length==0)
        generalCallback();
      else{
        $ionicLoading.hide();
        console.log(errors);
      }
    });
  };

  return connect;

}])