angular.module('resetPassword',[]).controller('ResetPasswordCtrl', function($http, $scope){

	$scope.sendResetMail = function(email){

		$http.post(serverAddress+'/user/resetPassword',{email:email}).success(function(data){
			$scope.erreur ="";
		}).error(function(err){
			$scope.erreur="Nous n'avons pas trouvé de compte associé à cette adresse mail";
		});

	}

})