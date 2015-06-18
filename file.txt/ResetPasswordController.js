angular.module('resetPassword',[]).controller('ResetPasswordCtrl', function($http, $scope){

	$scope.sendResetMail = function(email){

		$http.post('http://62.210.115.66:9000/user/resetPassword',{email:email}).success(function(data){
			console.log(data);
			$scope.erreur ="";
		}).error(function(err){
			$scope.erreur="Nous n'avons pas trouvé de compte associé à cette adresse mail";
		});

	}

})