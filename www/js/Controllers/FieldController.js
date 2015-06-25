angular.module('field',[])
.controller('FieldCtrl', function($scope, $localStorage, $http, $cordovaFileTransfer, $cordovaImagePicker, $location){
  $scope.field = {};
  $scope.field.origin = "private";
  $scope.field.related_to = $localStorage.user.id;

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



  $scope.launchReq = function(){
    $scope.err = "";
    if(!$scope.field.zip_code === parseInt($scope.field.zip_code,10) && !$scope.field.zip_code.length==5)
      $scope.err = "Veuillez vérifier le code postal";
    if(!$scope.field.address && !$scope.field.zip_code && !$scope.field.city && !$scope.field.name){
      $scope.err = "Veuillez vérifier les champs";
    }
    else {

      $http.post('http://localhost:1337/field/create',$scope.field).success(function(data, status) {

        if($scope.imageUri){
          var optionsFt = {
            params : {
              fieldId: data.id
            }

          };
          $cordovaFileTransfer.upload('http://localhost:1337/field/uploadPic', $scope.imageUri, optionsFt)
          .then(function(result) {  
        // Success!
        console.log("successssss");
      }, function(err) {
        // Error
        console.log("fail");
      }, function (progress) {
        console.log("progress");
        // constant progress updates
      });
        }
        $location.path('/footparams');
      })
    }

  }
})
