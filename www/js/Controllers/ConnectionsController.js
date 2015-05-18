angular.module('connections',[])



.controller('HomeCtrl', function($scope,OpenFB,$http,$localStorage,$location){
  $scope.facebookConnect = function(){
      OpenFB.login('email','public_profile','user_friends').then(function(){
        OpenFB.get('/me').success(function(data){ console.log(data);
          $http.post('http://localhost:1337/facebookConnect',{email: data.email,first_name: data.first_name,last_name: data.last_name,facebook_id: data.id}).success(function(response){
            $localStorage.token = response.token;
            $localStorage.user = response;
            $location.path('/user/profil/'+response.id);
            $http.get('http://localhost:1337/getAllFriends/'+response.id).success(function(data){
              $localStorage.friends = data[0];
              angular.forEach($localStorage.friends,function(friend,index){   // Add attribute statut to friends to keep favorite
                friend.statut = data[1][index]; 
              });  
            }).error(function(err){ console.log('error')});
          }).error(function(err){ $scope.err = err});
        });
      },function(){alert('error')});
    };
})


.controller('LoginCtrl', function($scope, $http, $location, $localStorage){
  $scope.err = "";
  $scope.user={};

  if($localStorage.user) $location.path('/user/profil/'+$localStorage.user.id);  // TODO FIX PROB
  $scope.launchReq = function(){
    $http.post('http://localhost:1337/session/login',$scope.user).success(function(data){
      $localStorage.token = data.token;
      $localStorage.user = data;
      $location.path('/user/profil/'+data.id);
      $http.get('http://localhost:1337/getAllFriends/'+data.id).success(function(data){
        $localStorage.friends = data[0];
        angular.forEach($localStorage.friends,function(friend,index){   // Add attribute statut to friends to keep favorite
          friend.statut = data[1][index]; 
        });  
      }).error(function(err){ console.log('error')});
    }).error(function(){
       $scope.err = "Identifiant ou mot de passe incorrect.";
    });
  }
})

.controller('RegisterCtrl', function($scope, $http, $location, $localStorage){
  $scope.err = "";
  $scope.user={};
  $scope.launchReq = function(){
    $http.post('http://localhost:1337/user/create',$scope.user).success(function(data){
       $localStorage.token = data[0].token;
       $localStorage.user = data[0];
       $location.path('/user/profil/'+data.id);
    }).error(function(){
      $scope.err = "Erreur veuillez vérifier que tous les champs sont remplis.";
    });
  }
})