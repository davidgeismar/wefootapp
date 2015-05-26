angular.module('friend',[])
.controller('FriendCtrl',function($scope, $localStorage, $rootScope,  $http, $location){

	$scope.friend = $localStorage.friend;
	// $scope.init = function(){

	// 	angular.forEach($localStorage.friends, function(friend, key) {
	// 		if(friend.id==$stateParams.id){
	// 			console.log(friend);
	// 			return $scope.friend = friend;
	// 		}
	// 	});
	// }

	// $scope.init();


})