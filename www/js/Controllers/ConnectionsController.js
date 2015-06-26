angular.module('connections',[])


.controller('HomeCtrl', function($scope,OpenFB,$http,$localStorage,$ionicUser,$ionicPush, $location,$rootScope, $ionicLoading,$connection,$ionicPlatform,$ionicHistory){
  $rootScope.toShow = false;
 //Prevent for loading to early
 $ionicPlatform.ready(function(){
  if(window.device){ //If user has already sat connection from this device he will be logged automatically
    $http.post('http://62.210.115.66:9000/session/isConnected',{uuid: window.device.uuid}).success(function(response){
      if(response.userId>0){  //Connexion finded
        $http.get('http://62.210.115.66:9000/user/'+response.userId).success(function(data){
          $localStorage.user = data;
          $localStorage.token = data.token;
          $ionicLoading.show({
            content: 'Loading Data',
            animation: 'fade-out',
            showBackdrop: false,
            hideOnStateChange: false
          });
          $connection(response.userId,function(){
            $location.path('/user/profil');
          },false);
        });
      }
      else{
        $rootScope.toShow = true;
      }
    }).error(function(){
      $rootScope.toShow = true;
      $rootScope.err = "Veuillez vérifier votre connexion internet.";
    });
  }
  else{
    $rootScope.toShow = true;
  }
});


$scope.facebookConnect = function(){
  $ionicHistory.clearCache();
  $ionicHistory.clearHistory();
  OpenFB.login('email','public_profile','user_friends').then(function(){
    OpenFB.get('/me').success(function(data){
      $ionicLoading.show({
        content: 'Loading Data',
        animation: 'fade-out',
        showBackdrop: false,
        hideOnStateChange: false
      });
      $http.post('http://62.210.115.66:9000/facebookConnect',{email: data.email,first_name: data.first_name,last_name: data.last_name,facebook_id: data.id,fbtoken:window.localStorage.fbtoken}).success(function(response){
        $localStorage.token = response.token;
        $localStorage.user = response;
        $connection(response.id,function(){
          $location.path('/user/profil');
        },true);
      });
    });
  },function(){$ionicLoading.hide(); $scope.err = "Erreur lors de la connexion via facebook"});

};
})


.controller('LoginCtrl', function($scope, $http, $location, $localStorage, $rootScope,$ionicLoading,$connection,$ionicHistory){
  $scope.err = "";
  $scope.user={};

  if($localStorage.user && $localStorage.user.id) $location.path('/user/profil');  // TODO FIX PROB
  $scope.launchReq = function(){
    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();
    $ionicLoading.show({
      content: 'Loading Data',
      animation: 'fade-out',
      showBackdrop: false,
      hideOnStateChange: false
    });
    $http.post('http://62.210.115.66:9000/session/login',$scope.user).success(function(data){
      $localStorage.token = data.token;
      $localStorage.user = data;
      $connection(data.id,function(){
        $ionicLoading.hide();
        $location.path('/user/profil');
      },true);                
    }).error(function(){
     $ionicLoading.hide();
     $scope.err = "Identifiant ou mot de passe incorrect.";
   });   
  }

})

.controller('RegisterCtrl', function($scope, $http, $location, $localStorage,$ionicLoading){
  $ionicHistory.clearCache();
  $ionicHistory.clearHistory();
  $scope.err = "";
  $scope.user={};
  $scope.launchReq = function(){
    $ionicLoading.show({
      content: 'Loading Data',
      animation: 'fade-out',
      showBackdrop: false,
      hideOnStateChange: true
    });
    $http.post('http://62.210.115.66:9000/user/create',$scope.user).success(function(data){
     $localStorage.token = data[0].token;
     $localStorage.user = data[0];
     $localStorage.friends = [];
     io.socket.post('http://62.210.115.66:9000/connexion/setSocket',{id: data[0].id}); //Link socket_id with the user.id
     $location.path('/user/profil');
   }).error(function(err){
    $ionicLoading.hide();
    console.log(err);
    console.log($scope.user);
    $scope.err = "Erreur veuillez vérifier que tous les champs sont remplis.";
  });
 }
})