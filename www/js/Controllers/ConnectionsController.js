angular.module('connections',[])



.controller('HomeCtrl', function($scope,OpenFB,$http,$localStorage,$location){
  $scope.facebookConnect = function(){
    OpenFB.login('email','public_profile','user_friends').then(function(){
      OpenFB.get('/me').success(function(data){;
        $http.post('http://localhost:1337/facebookConnect',{email: data.email,first_name: data.first_name,last_name: data.last_name,facebook_id: data.id}).success(function(response){
          $localStorage.token = response.token;
          $localStorage.user = response;

          $http.get('http://localhost:1337/getAllFriends/'+response.id).success(function(data){
            $localStorage.friends = data[0];
              angular.forEach($localStorage.friends,function(friend,index){   // Add attribute statut to friends to keep favorite
                friend.statut = data[1][index]; 
              });
              $location.path('/user/profil');  
            }).error(function(err){ console.log('error')});
        }).error(function(err){ $scope.err = err});

      });
    },function(){alert('error')});

  };
})


.controller('LoginCtrl', function($scope, $http, $location, $localStorage){
  $scope.err = "";
  $scope.user={};

  if($localStorage.user && $localStorage.user.id) $location.path('/user/profil');  // TODO FIX PROB
  $scope.launchReq = function(){
    $http.post('http://localhost:1337/session/login',$scope.user).success(function(data){
      $localStorage.token = data.token;
      $localStorage.user = data;
      $http.get('http://localhost:1337/getAllFriends/'+data.id).success(function(data){
        $localStorage.friends = data[0];
        angular.forEach($localStorage.friends,function(friend,index){   // Add attribute statut to friends to keep favorite
          friend.statut = data[1][index]; 
        });  
        $location.path('/user/profil');
      }).error(function(err){ console.log('error')});
    }).error(function(){
     $scope.err = "Identifiant ou mot de passe incorrect.";
   });
    
  }
})

.controller('RegisterCtrl', function($scope, $http, $location, $localStorage){
  $scope.err = "";
  $scope.user={};
  $scope.user.picture = "default.jpg";
  $scope.launchReq = function(){
    $http.post('http://localhost:1337/user/create',$scope.user).success(function(data){

     $localStorage.token = data[0].token;
     $localStorage.user = data[0];
     $location.path('/user/profil');

   }).error(function(){
    $scope.err = "Erreur veuillez vérifier que tous les champs sont remplis.";
  });
 }
})