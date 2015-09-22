angular.module('field',[])
.controller('FieldCtrl', function($scope, $rootScope, $localStorage, $http, $cordovaFileTransfer, $cordovaImagePicker, $location, $ionicHistory, $ionicModal){
  $scope.field = {};
  $scope.field.origin = "private";
  $scope.field.related_to = $localStorage.getObject('user').id;

  $scope.imageUri;

  var options = {
    maximumImagesCount: 1,
    width: 800,
    height: 800,
    quality: 80
  };


  $scope.getPic = function(){
    $cordovaImagePicker.getPictures(options)
    .then(function (results) {
      $scope.imageUri = results[0]; 

    }, function(error) {
      console.log('Error pic');
    });
  }
// $scope.test = function(){
//   console.log($scope.field.address.city());
// }


  $scope.launchReq = function(){
    $scope.err = "";
      $http.post(serverAddress+'/field/create',$scope.field).success(function(data, status) {
        if($scope.imageUri){
          var optionsFt = {
            params : {
              fieldId: data.id
            },
            headers : {
              Authorization:$localStorage.get('token')
            }
          };
          $cordovaFileTransfer.upload(serverAddress+'/field/uploadPic', $scope.imageUri, optionsFt)
          .then(function(result) {
            $confirmation.showConfirm("Votre terrain a bien été inséré, recherchez le dans la liste !");  
            $ionicHistory.goBack();
          }, function(err) {
        // Error
        console.log("fail");
      }, function (progress) {
        console.log("progress");
        // constant progress updates
      });
        }
        else{
          $confirmation.showConfirm("Votre terrain a bien été inséré, recherchez le dans la liste !");  
          $ionicHistory.goBack();
        }
      });

  }
})
