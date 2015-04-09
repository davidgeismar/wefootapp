app.controller('HomeCtrl', function($scope){
	console.log('hello');
  $scope.facebookConnect = function(){
  	  openFB.init('491593424324577','https://www.facebook.com/connect/login_success.html', window.localStorage);
      openFB.login('email',function(){alert('done')},function(){alert('error')});
    };
})