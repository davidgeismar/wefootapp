angular.module('foot',[]).controller('FootController', function ($scope, $cordovaDatePicker,$ionicModal,$http) {
  $scope.foot;

  //$scope.date = "11/02/2013";
  //$scope.hour = "16h";
 $scope.datepicker = function(){
  var options = {
      date: new Date(),
      mode: 'date', // or 'time'
      minDate: new Date() - 10000,
      allowOldDates: false,
      allowFutureDates: true,
      doneButtonLabel: 'DONE',
      doneButtonColor: '#F2F3F4',
      cancelButtonLabel: 'CANCEL',
      cancelButtonColor: '#000000'
    };
    document.addEventListener("deviceready", function () {

      $cordovaDatePicker.show(options).then(function(date){
          $scope.foot.date = date


      });

    }, false);


};


$ionicModal.fromTemplateUrl('modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal1 = modal;
  });

  $scope.openModal1 = function() {
    $scope.modal1.show();
  };
  $scope.closeModal1 = function() {
    $scope.modal1.hide();
  };
  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });
    
    
 $scope.searchQuery = function(word){
    if(word.length>2){
     $http.get('http://localhost:1337/field/search/'+word).success(function(data){
      $scope.results = data;
    }).error(function(){
      console.log('error');
    });
  }
}
});