app.factory('$connection',['$http','$localStorage','$rootScope','$ionicPush','$ionicUser',function($http,$localStorage,$rootScope,$ionicPush,$ionicUser){

  //Execute all functions asynchronously.

  var connect = function(userId, generalCallback,setUUID){
    var allFunction = [];

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
  
if(window.device && window.device.model.indexOf('x86')==-1){  // No device on testing second argument removes emulators
  allFunction.push(function(callback){
    $localStorage.user.push = $ionicUser.get();
    $localStorage.user.push.user_id = $localStorage.user.id.toString();
    console.log($localStorage.user.push);
    $ionicUser.identify($localStorage.user.push).then(function(){  
      pushRegister();
      $rootScope.$on('$cordovaPush:tokenReceived', function(event, data) {
        $localStorage.user.pushToken = data.token;
        console.log('3ACTION')
        $http.post('http://62.210.115.66:9000/push/create',{user: userId, pushId: data.token}).success(function(){
          callback();
        }).error(function(err){
          console.log(err);
        });
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
          angular.forEach($localStorage.friends,function(friend,index){   // Add attribute statut to friends to keep favorite
            friend.statut = data[1][index].stat; 
            friend.friendship = data[1][index].friendship;
            if(index == $localStorage.friends.length-1) callback();
          });
        });
    });

    allFunction.push(function(callback){
      $http.get('http://localhost:1337/getAllChats/'+userId).success(function(data){
        $localStorage.chats=data;
        $rootScope.initChatsNotif();
        callback();
      });
    });

    allFunction.push(function(callback){
      $http.post('http://localhost:1337/user/getLastNotif',$localStorage.user).success(function(nb){
        $rootScope.nbNotif = nb.length;
        callback();
      });         
    });


    async.each(allFunction, function(oneFunc,callback){
      oneFunc(function(){callback();})
    },function(){
      generalCallback();
    });
  };

  return connect;

}])