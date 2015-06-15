angular.module('connections',[])



.controller('HomeCtrl', function($scope,OpenFB,$http,$localStorage,$location,$rootScope,$ionicLoading){
  var finish = false;

  $scope.facebookConnect = function(){
    $ionicLoading.show({
      content: 'Loading Data',
      animation: 'fade-out',
      showBackdrop: false,
      hideOnStateChange: true
    });
    OpenFB.login('email','public_profile','user_friends').then(function(){
      OpenFB.get('/me').success(function(data){;
        $http.post('http://localhost:1337/facebookConnect',{email: data.email,first_name: data.first_name,last_name: data.last_name,facebook_id: data.id}).success(function(response){
          $localStorage.token = response.token;
          $localStorage.user = response;
          io.socket.post('http://localhost:1337/connexion/setSocket',{id: response.id}); //Link socketId with the user.

          $http.get('http://localhost:1337/getAllFriends/'+response.id).success(function(data){
            $localStorage.friends = data[0];
            angular.forEach($localStorage.friends,function(friend,index){   // Add attribute statut to friends to keep favorite
              friend.statut = data[1][index]; 
            });

            $http.get('http://localhost:1337/getAllChats/'+$localStorage.user.id).success(function(data){
              $localStorage.chats=data;
            });

            $http.post('http://localhost:1337/user/getLastNotif',response).success(function(nb){
              $rootScope.nbNotif = nb.length;
              $location.path('/user/profil');
            });           
          }).error(function(err){$ionicLoading.hide(); $scope.err = "Erreur lors de la connexion via facebook";});
        });
}).error(function(err){ $ionicLoading.hide(); $scope.err = "Erreur lors de la connexion via facebook";});
},function(){$ionicLoading.hide(); $scope.err = "Erreur lors de la connexion via facebook"});

};
})


.controller('LoginCtrl', function($scope, $http, $location, $localStorage, $rootScope,$ionicLoading){
  $scope.err = "";
  $scope.user={};

  if($localStorage.user && $localStorage.user.id) $location.path('/user/profil');  // TODO FIX PROB
  $scope.launchReq = function(){
    $ionicLoading.show({
      content: 'Loading Data',
      animation: 'fade-out',
      showBackdrop: false,
      hideOnStateChange: true
    });
    $http.post('http://localhost:1337/session/login',$scope.user).success(function(data){
      $localStorage.token = data.token;
      $localStorage.user = data;
      io.socket.post('http://localhost:1337/connexion/setSocket',{id: data.id}); //Link socketId with the user.
      $http.get('http://localhost:1337/getAllFriends/'+data.id).success(function(data){
        $localStorage.friends = data[0];
        angular.forEach($localStorage.friends,function(friend,index){   // Add attribute statut to friends to keep favorite
          friend.statut = data[1][index]; 
        });
      }).error(function(err){ $ionicLoading.hide(); console.log('error');});

      $http.get('http://localhost:1337/getAllChats/'+$localStorage.user.id).success(function(data){
        $localStorage.chats=data;
        console.log($localStorage.chats);
      });

      $http.post('http://localhost:1337/user/getLastNotif',data).success(function(nb){
        $rootScope.nbNotif = nb.length;
        console.log(nb);
        $location.path('/user/profil');
      });                 
    }).error(function(){
     $ionicLoading.hide();
     $scope.err = "Identifiant ou mot de passe incorrect.";
   });   
  }
})

.controller('RegisterCtrl', function($scope, $http, $location, $localStorage,$ionicLoading){
  $scope.err = "";
  $scope.user={};
  $scope.user.picture = "img/default.jpg";
  $scope.launchReq = function(){
    $ionicLoading.show({
      content: 'Loading Data',
      animation: 'fade-out',
      showBackdrop: false,
      hideOnStateChange: true
    });
    $http.post('http://localhost:1337/user/create',$scope.user).success(function(data){
     $localStorage.token = data[0].token;
     $localStorage.user = data[0];
     $localStorage.friends = [];
     io.socket.post('http://localhost:1337/connexion/setSocket',{id: data[0].id}); //Link socketId with the user.
     $location.path('/user/profil');
   }).error(function(){
    $ionicLoading.hide();
    $scope.err = "Erreur veuillez vérifier que tous les champs sont remplis.";
  });
 }
})