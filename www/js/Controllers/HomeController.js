app.controller('HomeCtrl', function($scope,OpenFB){
  $scope.facebookConnect = function(){
  	  OpenFB.init('491593424324577');
      OpenFB.login('email',function(){
      	console.log('here');
        OpenFB.api({
            path: '/me',
            success: function(data) {
                console.log(JSON.stringify(data));
            },
            error: function(error){alert(error.message);}
        });
      },function(){alert('error')});
    };
})