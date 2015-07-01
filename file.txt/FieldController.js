angular.module('field',[])
.controller('FieldCtrl', function($scope, $localStorage, $http, $cordovaFileTransfer, $cordovaImagePicker){
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
      $scope.imageUri = results[0] ; 

    }, function(error) {
      console.log('Error pic');
    });
  }



  $scope.launchReq = function(){
  if($scope.imageUri){
    $scope.field.related_to = $localStorage.user.id;
  }
    $http.post('http://'+serverAddress+'/field/create',$scope.field).success(function(data, status) {
      console.log('CALLEEDDDD');

      if($scope.imageUri){
        var optionsFt = {
          params : {
            fieldId: data.id
          }

        };
        $cordovaFileTransfer.upload('http://'+serverAddress+'/field/uploadPic', $scope.imageUri, optionsFt)
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
    })
  }
})
