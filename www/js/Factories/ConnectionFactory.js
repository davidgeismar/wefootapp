app.factory('$connection',['$http','$localStorage','$rootScope','$ionicPush','$ionicUser','$ionicLoading','$ionicPlatform','$cordovaPush',function($http,$localStorage,$rootScope,$ionicPush,$ionicUser,$ionicLoading,$ionicPlatform,$cordovaPush){
  //Execute all functions asynchronously.

  var connect = function(userId, generalCallback,setUUID){
    var guy = $localStorage.getObject('user');
    guy.lastUpdate = moment();
    $localStorage.setObject('user',guy);

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
        var guy = $localStorage.getObject('user');
        guy.pushToken = result;
        $localStorage.setObject('user',guy);
        $http.post('http://62.210.115.66:9000/push/create',{user: userId, push_id: result}).success(function(){
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
    io.socket.post('http://62.210.115.66:9000/connexion/setConnexion',{id: userId},function(){
      callback();
    }); 
  });



    allFunction.push(function(callback){
      $http.post('http://62.210.115.66:9000/user/update/',{id: userId, pending_notif: 0}).success(function(){
        callback();
      });
    });

    if(setUUID){
      allFunction.push(function(callback){
        $http.get('http://62.210.115.66:9000/getAllFriends/'+userId+'/0').success(function(data){
          var friends = data[0];
          if(data[0].length==0) callback();
          angular.forEach(friends,function(friend,index){   // Add attribute statut to friends to keep favorite
            friend.statut = data[1][index].stat; 
            friend.friendship = data[1][index].friendship;
            if(index == friends.length-1){
             $localStorage.setObject('friends',friends);
             callback();
            }
          });
        }).error(function(err){
          errors.push(err);
        });
      });
    }

    // if(setUUID){
      allFunction.push(function(callback){
        $http.get('http://62.210.115.66:9000/getAllChats/'+userId).success(function(data){
          $localStorage.setObject('chats',data);
          $rootScope.initChatsNotif();
          callback();
        }).error(function(err){
          errors.push(err);
        });
      });
    // } else{
      allFunction.push(function(callback){
        $rootScope.initChatsNotif();
        callback();
      });
    // }

    allFunction.push(function(callback){
      $http.post('http://62.210.115.66:9000/user/getLastNotif',$localStorage.getObject('user')).success(function(nb){
        $rootScope.nbNotif = nb.length;
        console.log(nb.length);
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