'use strict';

/**
 * @ngdoc function
 * @name angularApp2App.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the angularApp2App
 */


angular.module('foot').controller('ReservationController', function ($scope, $localStorage, $location, $http, $ionicLoading) {

    //RECAP RESA To Clean 
    if(!$localStorage.reservationClient.indoor){
      $scope.indoor = { text: "INDOOR", checked: 1 };
      $localStorage.reservationClient.indoor = $scope.indoor.checked;
    }
    else{
      $scope.indoor = {};
      $scope.indoor.checked = $localStorage.reservationClient.indoor;
      $scope.indoor.text = $localStorage.reservationClient.indoor ? "INDOOR" : "OUTDOOR";
    }
    $localStorage.reservationClient.date = new Date($localStorage.reservationClient.date);
    $scope.date = getJour($localStorage.reservationClient.date);
    $scope.hour = getHour($localStorage.reservationClient.date);

    $scope.reservationClient = $localStorage.reservationClient;
    $localStorage.reservationClient.api_ref = $localStorage.foot.field.api_ref;
    $scope.foot = $localStorage.foot;
    $scope.found = 0;
    if($localStorage.found)
      $scope.found = $localStorage.found;
   
    $scope.getTerrainsFree = function(){
      $http.post('http://'+serverAddress+'/reservation/getTerrainsFree',$localStorage.reservationClient).success(function(field){
        $scope.freeField= field;
        if($scope.freeField){
          $scope.found = 1;
          $localStorage.reservationClient.terrain = field.id;
          $localStorage.reservationClient.prix = field.prix;
          $scope.prix = field.prix
        }
        else
          $location.path('/resa/dispo');
      });
    }

     $scope.toggleCheck = function(){
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




//Changement de terrain


// $scope.date = $localStorage.reservationClient.date;
// $scope.reservationClient =$localStorage.reservationClient ; 
// $scope.hour = $scope.date.getHours();
// $scope.valrep = 0 ;

//    $scope.listeterrainFreeField = [];
//    var getTerrainsFreeField = function(){
//             $http.post('http://'+serverAddress+'/reservation/getTerrainsFreeField',$localStorage.reservationClient).success(function(reservationClient){
//                 $scope.listeterrainFreeField = reservationClient[0];
//                 $scope.param = reservationClient[1];
//                 $localStorage.listeterrainFreeField = $scope.listeterrainFreeField ;;
//                 if($scope.listeterrainFreeField)
//                     $scope.valrep = 1;
//                 else
//                     $scope.valrep = -1;
//             });
//     }

//     // getTerrainsFreeField();

//     $scope.setpandt = function($index){ 
//         $localStorage.prix = $scope.param[$index].prix;
//         $localStorage.reservationClient.numTerrain = $scope.param[$index].id;

//     } 


// Changement d'heure
   // $scope.getOtherHours = function(reservationClient){
   //          $http.post('http://'+serverAddress+'/reservation/getTerrainsFree',$scope.reservationClient).success(function(listTerrLibre){
   //              $scope.terrainNewFree =listTerrLibre[1]

   //              console.log(' terrain libre');
   //              console.log($scope.terrainNewFree);
   //              $localStorage.terrainNewFree = $scope.terrainNewFree ;
   //              console.log('longueur');
   //              console.log($scope.listeterrainNewFree.length); 
   //              if($scope.terrainNewFree != null){
   //              $scope.valeur = 1;
   //              $localStorage.prix = $localStorage.terrainNewFree.prix;
   //              $localStorage.reservationClient.numTerrain = $localStorage.terrainNewFree.id;
   //              $scope.prix = $localStorage.prix;
   //              }else
   //                $scope.valeur = -1;
   //          });
   //  }


    //   $scope.create = function(reservationClient){
    //           $http.post('http://'+serverAddress+'/reservation/create',
    //             $scope.reservationClient).success(function(reservationClient){
    //                 console.log(reservationClient);
    //               $scope.conf = 1;
    //           });
    // }
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
            $http.post('http://'+serverAddress+'/reservation/getTerrainsFree',  
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
        $http.post('http://'+serverAddress+'/terrain/showreservations',terrain).success(function(terrain){
            for(var i=0; i<$scope.listeterrain.length;i++){
                if($scope.listeterrain[i].id == terrain[0].id){
                    $localStorage.terrain = $scope.listeterrain[i];
                    $location.path('/reservation');
                }
            }
        })
     }

})  
.controller('PaiementController', function ($localStorage,$scope,$ionicModal,$rootScope, $http, $paiement,$ionicLoading) {
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
          $http.post('http://'+serverAddress+'/user/update',$scope.infos).success(function(newUser){
            user = newUser;
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
      $paiement.proceed(user.mangoId,cardId,$localStorage.reservationClient.prix,$localStorage.reservationClient.foot,function(result){
        if(result == 0)
          $scope.err = 'Erreur une carte à surement déjà été enregistrée pour ce foot';
      });
    }
})