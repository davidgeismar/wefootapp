angular.module('connections',[])

.controller('HomeCtrl', function($scope,$http,$localStorage,$ionicUser,$location,$rootScope, $ionicLoading,$connection,$ionicPlatform,$ionicHistory,$state, $q, fbConnect, $cordovaNetwork,error_reporter){

  $rootScope.toShow = false;
 //Prevent for loading to early

 $ionicPlatform.ready(function(){
  if(window.device && $cordovaNetwork.isOffline()){ //HANDLE OFFLINE CONNEXION (SET SOCKET ETC PB)
    error_reporter.show({texte: "Connectez vous d'abord à internet!"});
  }
  else{
    if($localStorage.getObject('user') && $localStorage.getObject('user').id && $localStorage.get('token')){ //If user has already sat connection from this device he will be logged automatically
      $ionicLoading.show({
        content: 'Loading Data',
        animation: 'fade-out',
        showBackdrop: false,
        hideOnStateChange: false
      });
      $connection($localStorage.getObject('user').id,function(){
        $location.path('/user/profil');
      },false);
    }
    else{
      $rootScope.toShow = true;
    }
}
});

$scope.facebookConnect = function() {
  if(window.device && $cordovaNetwork.isOffline()){
    error_reporter.show({texte: "Connectez vous d'abord à internet!"});
  }
  else{
    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();
    fbConnect.connect();
  }
};

})


.controller('LoginCtrl', function($scope, $http, $location, $localStorage, $rootScope,$ionicLoading,$connection,$ionicHistory,$cordovaNetwork){
  $scope.err = "";
  $scope.user={};

  $scope.launchReq = function(){
    if($scope.err)
      delete $scope.err;
    if(window.device && $cordovaNetwork.isOffline()){
      error_reporter.show({texte: "Connectez vous d'abord à internet!"});
    }
    else{
      $ionicHistory.clearCache();
      $ionicHistory.clearHistory();
      $ionicLoading.show({
        content: 'Loading Data',
        animation: 'fade-out',
        showBackdrop: false,
        hideOnStateChange: false
      });
      $http.post(serverAddress+'/session/login',$scope.user).success(function(data){
        $localStorage.set('token',data.token);
        $localStorage.setObject('user',data);
        $connection(data.id,function(){
          $location.path('/user/profil');
        },true);                
      }).error(function(){
       $ionicLoading.hide();
       $scope.err = "Identifiant ou mot de passe incorrect.";
     });
    }   
  }

})

.controller('RegisterCtrl', function($scope, $http, $location, $localStorage,$ionicLoading, $ionicHistory, mySock, user,$cordovaNetwork){
  $ionicHistory.clearCache();
  $ionicHistory.clearHistory();
  $scope.err = "";
  $scope.user={};
  $scope.launchReq = function(){
    if($scope.err)
      delete $scope.err;
    if(window.device && $cordovaNetwork.isOffline()){
      error_reporter.show({texte: "Connectez vous d'abord à internet!"});
    }
    else{
      $ionicLoading.show({
        content: 'Loading Data',
        animation: 'fade-out',
        showBackdrop: false,
        hideOnStateChange: true
      });
      $http.post(serverAddress+'/user/create',$scope.user).success(function(data){
       $localStorage.set('token',data[0].token);
       $localStorage.setObject('user',data[0]);
       $localStorage.setObject('friends',[]);
       user.getCoord();
       mySock.req(serverAddress+'/connexion/setSocket',{id: data[0].id}); //Link socket_id with the user.id
       $location.path('/user/profil');
      }).error(function(err){
        $ionicLoading.hide();
        $scope.err = "Erreur veuillez vérifier que tous les champs sont remplis.";
      });
    }
  }
})