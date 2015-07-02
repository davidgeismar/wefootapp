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
        $http.post('http://'+serverAddress+'/push/create',{user: userId, push_id: result}).success(function(){
          callback();
        }).error(function(err){
          errors.push("Error push");
        });
      },function(err){
        console.log(err);
      });
    }, function(err) {
      errors.push("Error push");
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

    if(setUUID){
      allFunction.push(function(callback){
        $http.get('http://'+serverAddress+'/getAllFriends/'+userId+'/0').success(function(data){
          var friends = data[0];
          console.log(friends);
          if(data[0].length==0) {
            $localStorage.setObject('friends',[]);
            callback();
          }
          angular.forEach(friends,function(friend,index){   // Add attribute statut to friends to keep favorite
            friend.statut = data[1][index].stat; 
            friend.friendship = data[1][index].friendship;
            if(index == friends.length-1){
             $localStorage.setObject('friends',friends);
             callback();
            }
          });
        }).error(function(err){
          errors.push("Error friends");

        });
      });
    }


    // if(setUUID){
      allFunction.push(function(callback){
        $http.get('http://'+serverAddress+'/getAllChats/'+userId).success(function(data){
          $localStorage.setObject('chats',data);
          $rootScope.initChatsNotif();
          callback();
        }).error(function(err){
          errors.push("Error chats");
        });
      });
    // } else{
      allFunction.push(function(callback){
        $rootScope.initChatsNotif();
        callback();
      });
    // }

    allFunction.push(function(callback){
      $http.post('http://'+serverAddress+'/user/getLastNotif',$localStorage.getObject('user')).success(function(nb){
        $rootScope.nbNotif = nb.length;
        console.log(nb.length);
        callback();
      }).error(function(){
        errors.push("Error notif");
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
        $rootScope.toShow = true;
      }
    });
  };

  return connect;

}])