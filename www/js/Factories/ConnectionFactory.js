app.factory('$connection',['$http','$localStorage','$rootScope','$ionicPush','$ionicUser','$ionicLoading','$ionicPlatform','$cordovaPush',function($http,$localStorage,$rootScope,$ionicPush,$ionicUser,$ionicLoading,$ionicPlatform,$cordovaPush){
  console.log(window.device);
  //Execute all functions asynchronously.

  var connect = function(userId, generalCallback,setUUID){
    $localStorage.user.lastUpdate = moment();

    var allFunction = [];
    var errors = [];


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
        $http.post('http://'+serverAddress+'/push/create',{user: userId, push_id: result}).success(function(){
          callback();
        }).error(function(err){
          errors.push(err);
        });
      },function(err){
        console.log(err);
      });
    }, function(err) {
      errors.push(err);
    });
  });
  }


  allFunction.push(function(callback){
    io.socket.post('http://'+serverAddress+'/connexion/setConnexion',{id: userId},function(){
      callback();
    }); 
  });



    allFunction.push(function(callback){
      $http.post('http://'+serverAddress+'/user/update/',{id: userId, pending_notif: 0}).success(function(){
        callback();
      });
    });


    allFunction.push(function(callback){
      $http.get('http://'+serverAddress+'/getAllFriends/'+userId+'/0').success(function(data){
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
      $http.get('http://'+serverAddress+'/getAllChats/'+userId).success(function(data){
        $localStorage.chats=data;
        $rootScope.initChatsNotif();
        callback();
      }).error(function(err){
        errors.push(err);
      });
    });

    allFunction.push(function(callback){
      $http.post('http://'+serverAddress+'/user/getLastNotif',$localStorage.user).success(function(nb){
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