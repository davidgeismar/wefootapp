angular.module('foot',[]).controller('FootController', function ($scope, $cordovaDatePicker,$ionicModal,$http,$localStorage) {
  $scope.foot = {};
  if($localStorage.friends){
    $scope.friends = $localStorage.friends;
  }
  $scope.toInvite = [];
  $scope.addToFoot = function(id){
    var index = $scope.toInvite.indexOf(id);
    if(index>-1)
      $scope.toInvite.splice(index,1);
    else
      $scope.toInvite.push(id);
    console.log($scope.toInvite);
  }
  $scope.date = "11/02/2013"; //DEFAULT FOR TESTING
  $scope.hour = "16h";
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
    var options1 = {
      date: new Date(),
      mode: 'time', // or 'time'
      doneButtonLabel: 'DONE',
      doneButtonColor: '#F2F3F4',
      cancelButtonLabel: 'CANCEL',
      cancelButtonColor: '#000000'
    };
    $scope.showDatePicker = function(){
        $cordovaDatePicker.show(options).then(function(date){
        $scope.foot.date = date
      });
    }
      $scope.showHourPicker = function(){
        $cordovaDatePicker.show(options1).then(function(hour){
        $scope.foot.hour = hour;
      });
    }

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