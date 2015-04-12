app.controller('HomeCtrl', function($scope){
  $scope.facebookConnect = function(){
  	  openFB.init('491593424324577','http://localhost:8100/oauthcallback.html', window.localStorage);
      openFB.login('email',function(){
      	console.log('here');
        openFB.api({
            path: '/me',
            success: function(data) {
                console.log(JSON.stringify(data));
            },
            error: function(error){alert(error.message);}
        });
      },function(){alert('error')});
    };
})