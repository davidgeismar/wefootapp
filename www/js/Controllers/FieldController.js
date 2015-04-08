app.controller('FieldCtrl', function($scope, $http, $cordovaImagePicker){
  $scope.field = {};
  $scope.field.origin = "private";
    var options = {
      maximumImagesCount: 1,
      width: 800,
      height: 800,
      quality: 80
    };

  $scope.getPic = function(){
    $cordovaImagePicker.getPictures(options)
    .then(function (results) {
      for (var i = 0; i < results.length; i++) {
        console.log('Image URI: ' + results[i]);
      }
    }, function(error) {
      console.log('error');
    });
}

  $scope.launchReq = function(){
    $http.post('http://localhost:1337/field/create',$scope.field).success(function(){
    }).error(function(){
      console.log('error');
    });
  }
})
