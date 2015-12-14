angular.module('resetPassword',[]).controller('ResetPasswordCtrl', function($http, $scope, $validated){

	$scope.sendResetMail = function(email){

		$http.post(serverAddress+'/user/resetPassword',{email:email}).success(function(data){
			$scope.erreur ="";
			$validated.show({texte: "Nous avons envoyé des instructions à l'e-mail indiqué", icon: "ion-checkmark-round"},function(){
				
			});
		}).error(function(err){
			$scope.erreur="Nous n'avons pas trouvé de compte associé à cette adresse mail";
		});

	}

})