'use strict';
angular.module('foot').controller('ReservationController', function ($scope, $localStorage, $location, $http, $ionicLoading, $ionicScrollDelegate) {
  var user = $localStorage.getObject('user');
    //RECAP RESA To Clean
    if(!$localStorage.reservationClient.indoor){
      $scope.indoor = { text: "INDOOR", checked: 1 };
      $localStorage.reservationClient.indoor = $scope.indoor.checked;
    }
    else{
      $scope.indoor = {};
      $scope.indoor.checked = $localStorage.reservationClient.indoor;
      $scope.indoor.text = $localStorage.reservationClient.indoor ? "INDOOR" : "OUTDOOR";
      $scope.prix = $localStorage.reservationClient.prix;
    }


    $localStorage.reservationClient.date = new Date($localStorage.reservationClient.date);
    $scope.date = getJour($localStorage.reservationClient.date);
    $scope.hour = getHour($localStorage.reservationClient.date);
    $scope.resa = 60;
    //Durée de base : 1h
    $localStorage.reservationClient.date_fin = moment($localStorage.reservationClient.date).add(60, 'minutes');
    $localStorage.reservationClient.duree = 60;
    $scope.reservationClient = $localStorage.reservationClient;
    $localStorage.reservationClient.api_ref = "classic";
    $scope.foot = $localStorage.foot;
    $scope.found = 0;
    if($localStorage.found)
      $scope.found = $localStorage.found;

    var discount = $localStorage.reservationClient.student_discount;

    $localStorage.reservationClient.student_discount = 0;
    if(discount!=0 ||discount!=null){
      $scope.student = { text: "NON", checked: 0, discount:discount };
    }
    $scope.goBackResa = function (value){
      console.log("here");
      if($scope.edit){
        $scope.found = 0;
        $scope.edit = false
      }
      else{
        $rootScope.nbGoBack = -1;
        if(value)
          $ionicHistory.goBack(value);
        $ionicHistory.goBack();
      }
    };


    $scope.setDuree = function(duree){
      $localStorage.reservationClient.date_fin = moment($localStorage.reservationClient.date).add(duree, 'minutes');
      $localStorage.reservationClient.duree = duree;
    }
    $scope.getTerrainsFree = function(){
      $http.post(serverAddress+'/reservation/getTerrainsFree',$localStorage.reservationClient).success(function(field){
        $scope.freeField= field;
        if($scope.freeField){
          $scope.found = 1;
          $localStorage.reservationClient.terrain = field.id;
          $localStorage.reservationClient.prix = field.prix;
          $scope.prix = field.prix;
          $ionicScrollDelegate.scrollTop();
          $scope.edit = true;

        }
        else
          $location.path('/resa/dispo');
      });
    }
    $scope.toggleCheckStudent = function(){
      if ($scope.student.checked == 1){
        $scope.student.checked = 0;
        $localStorage.reservationClient.student_discount = 0;
        $scope.student.text =  "NON";
      }else{
        $scope.student.checked = 1;
        $localStorage.reservationClient.student_discount = $scope.student.discount;
        $scope.student.text =  "OUI";
      }
    }

    $scope.toggleCheckIndoor = function(){
      if ($scope.indoor.checked == 1){
        $scope.indoor.checked = 0;
        $localStorage.reservationClient.indoor = 0;
        $scope.indoor.text =  "OUTDOOR";
      }else{
        $scope.indoor.checked = 1;
        $localStorage.reservationClient.indoor = 1;
        $scope.indoor.text =  "INDOOR";
      }
    }


  })

//Disponibilité
.controller('ResaDispoController', function ($scope, $localStorage, $location, $http, $ionicLoading) {
  $scope.reservationClient = $localStorage.reservationClient;
  $scope.results = [];

  var getTerrainsFreeHours = function(reservationClient,fonction,vari){
    var options = {
      field: $localStorage.reservationClient.field,
      date: moment($localStorage.reservationClient.date).add(vari,'Hours').format(),
      indoor: $localStorage.reservationClient.indoor,
      api_ref: $localStorage.reservationClient.api_ref
    }
    $http.post(serverAddress+'/reservation/getTerrainsFree',
      options).success(function(freeField){
        if(freeField){
          var newHour = {};
          newHour.fieldId = freeField.id;
          newHour.prix = freeField.prix;
          newHour.hour = getHour(new Date(options.date));
          newHour.date = moment(options.date).format();
          $scope.results.push(newHour);
          fonction();
        }

      });
    }


    var getOtherHours = function(){
      var tab = [ -2, -1, 1, 2 ];
      async.each(tab, function(vari,callback){
        getTerrainsFreeHours($localStorage.reservationClient,function(){callback(); }, vari);
      });
    }

    getOtherHours();


    $scope.setNewHour = function(resa){
      $localStorage.reservationClient.prix = resa.prix;
      $localStorage.reservationClient.date = resa.date;
      $localStorage.found = 1;
      $location.path('/resa/recap');
    }



    $scope.showfree = function(terrain){
      $http.post(serverAddress+'/terrain/showreservations',terrain).success(function(terrain){
        for(var i=0; i<$scope.listeterrain.length;i++){
          if($scope.listeterrain[i].id == terrain[0].id){
            $localStorage.terrain = $scope.listeterrain[i];
            $location.path('/reservation');
          }
        }
      })
    }

  })
.controller('PaiementController', function ($localStorage,$scope,$ionicModal,$rootScope, $http, $paiement,$ionicLoading,$location,$validated,$timeout) {
  var user = $localStorage.getObject('user');
  if(!user.birthday || !user.telephone){

    $ionicModal.fromTemplateUrl('templates/modalPhone.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });

    $scope.infos = {id: user.id};

    $scope.hideModal = function(){
      if($scope.infos.telephone.length>9 && $scope.infos.birthday){
        $http.post(serverAddress+'/user/update',$scope.infos).success(function(newUser){
          user = newUser;
          console.log(user);
          $paiement.getAllCards(newUser,function(card,newUser){
            $scope.cards = [];
            $localStorage.setObject('user',newUser);
            $scope.modal.hide();
          });
        });
      }
      else
        $scope.err = "Veuillez renseigner les deux champs s'il vous plait."
    }
    $scope.cancel = function(){
      $rootScope.goBack(-2);
      $scope.modal.hide();
    }
  }
  else{
    $paiement.getAllCards(user,function(cards,newUser){
      $scope.cards = cards;
      if(!user.mangoId)
        $localStorage.setObject('user',newUser);
      user = newUser;
    });
  }

  $ionicModal.fromTemplateUrl('templates/modalCard.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal){
    $scope.modal2 = modal;
  });

  $scope.showModal2 = function(){
    $scope.modal2.show();
    $scope.card = {};
  }
  $scope.hideModal2 = function(){
    $scope.modal2.hide();
  }
  $scope.registerCard = function(){
    $scope.card.expirationDate = $scope.card.expirationDate.replace("/","");
    $paiement.registerCard(user,$scope.card,function(card){
      if(card === 0)
        $scope.err= 'Erreur les informations sont invalides';
      else{
        $scope.cards.push(card);
        $scope.modal2.hide();
      }
    });
  }
  $scope.pay = function(cardId){
    $paiement.proceed(user.mangoId,cardId,$localStorage.reservationClient,$localStorage.reservationClient.foot,function(result){
      if(result == 0)
        $scope.err = 'Erreur une carte à surement déjà été enregistrée pour ce foot';
      else
        $validated.show({texte: "Votre réservation à bien été enregistrée", icon: "ion-checkmark-round"},function(){
        });
      $timeout(function(){$location.path('/foot/'+$localStorage.reservationClient.foot)},1000);
    });
  }
})
