angular.module('field',[])
.controller('FieldCtrl', function($scope, $localStorage, $http, $cordovaFileTransfer, $cordovaImagePicker, $location, $ionicHistory, $confirmation,$ionicLoading){


  var formatAddress = function(place, callback){
    for (var i=0; i<place.address_components.length; i++)
    {
      if (place.address_components[i].types[0] == "street_number") {
        $scope.field.address = place.address_components[i].long_name;
      }
      if (place.address_components[i].types[0] == "route") {
        if($scope.field.address){
          $scope.field.address += " " +place.address_components[i].long_name;
        }
        else
          $scope.field.address = place.address_components[i].long_name;
      }
      if (place.address_components[i].types[0] == "locality") {
        $scope.field.city = place.address_components[i].long_name;
      }
      if (place.address_components[i].types[0] == "postal_code") {
        $scope.field.zip_code = place.address_components[i].long_name;
      }
    }
    $scope.field.lat = place.lat;
    $scope.field.longi = place.longi;
    // $scope.field.lat = place.
    callback();
  }

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


  $scope.launchReq = function(){
    $scope.err = "";

    if(!$scope.field.name || !$scope.field.googleAddress){
      $scope.err = "Veuillez insérer un nom et une adresse";
    }
    else {
      formatAddress($scope.field.googleAddress, function(){
        delete $scope.field.googleAddress;
        $ionicLoading.show({
          content: 'Loading Data',
          animation: 'fade-out',
          showBackdrop: true
        });
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
              $confirmation("Votre terrain a bien été inséré, recherchez le dans la liste !");
              $ionicLoading.hide();
              $ionicHistory.goBack();
            }, function(err) {
              console.log(err);
            }, function (progress) {
            });
          }
          else{
            $confirmation("Votre terrain a bien été inséré, recherchez le dans la liste !");  
            $ionicLoading.hide();
            $ionicHistory.goBack();
          }
        });
      })
}

}
})
