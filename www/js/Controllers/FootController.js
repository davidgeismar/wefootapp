angular.module('foot',[]).controller('FootController', function ($scope, $cordovaDatePicker) {
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

});
