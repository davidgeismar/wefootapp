app.controller('HomeCtrl', function($scope){
  $scope.facebookConnect = function(){
      openFB.login(callback, {scope: 'email'});
    };
})