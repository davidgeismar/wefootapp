angular.module('field',[])
.controller('FieldCtrl', function($scope, $http, $cordovaFileTransfer, $cordovaImagePicker){
  $scope.field = {};
  $scope.field.origin = "private";

  var imageUri;

  var options = {
    maximumImagesCount: 1,
    width: 800,
    height: 800,
    quality: 80
  };



  $scope.getPic = function(){
    $cordovaImagePicker.getPictures(options)
    .then(function (results) {
      imageUri = results[0] ; 

    }, function(error) {
      console.log('Error pic');
    });
  }



  $scope.launchReq = function(){
    $http.post('http://localhost:1337/field/create',$scope.field).success(function(data, status) {
      var optionsFt = {
        params : {
          fieldId: data.id
        }

      };



        $cordovaFileTransfer.upload('http://localhost:1337/field/uploadPic', imageUri, optionsFt)
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


          })
      .error(function(){
        console.log('error');
      })

  }
})
