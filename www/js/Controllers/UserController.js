app.controller('UserCtrl',function($scope,$localStorage,$location,$ionicModal,$http){

  $scope.user = $localStorage.user;
  $scope.friends = {};

//Handle edit inputs on left menu
  $scope.toEdit = [false,false];
  if($scope.user && $scope.user.favorite_club==null){
    $scope.user.favorite_club = "Entrer un club";
  }
  if($scope.user && $scope.user.poste==null){
    $scope.user.poste = "Entrer votre poste";
  }

  //EDITIONS
  $scope.editClub = function(value){
    var self = this;
    if(value.length>0){
      $http.post('http://localhost:1337/editUser',{favorite_club: value}).success(function(){
        self.user.favorite_club = value;
        self.toEdit[0] = false;
      }).error(function(){
        console.log('error');
      });
    }
  }

    $scope.editPoste = function(value){
    var self = this;
    if(value.length>0){
      $http.post('http://localhost:1337/editUser',{poste: value}).success(function(){
        self.user.poste = value;
        self.toEdit[1] = false;
      }).error(function(){
        console.log('error');
      });
    }
  }


  //END EDITIONS
//END Handle Menu
  $scope.logout = function (){
    $localStorage.user = {};
    $localStorage.token = "";
    $location.path('/')
  };
  //MODAL HANDLER
  $ionicModal.fromTemplateUrl('templates/search.html', {
      scope: $scope,
      animation: 'slide-in-up'
  }).then(function(modal) {
      $scope.modal = modal;
  });
  $scope.openModal = function() {
      $scope.modal.show();
  };
  $scope.closeModal = function() {
      $scope.modal.hide();
  };
  $scope.switchSearchFb = function(){
      $('.opened_search').removeClass('opened_search');
      $('.switch_fb').addClass('opened_search');
      $('.hidden').removeClass('hidden');
      $('.content_wf_search').addClass('hidden');
  }
  $scope.switchSearchWf = function(){
      $('.opened_search').removeClass('opened_search');
      $('.switch_wf').addClass('opened_search');
      $('.hidden').removeClass('hidden');
      $('.content_fb_search').addClass('hidden');
    }
  $scope.searchQuery = function(word){
      $scope.friendsId = [];
      angular.forEach($localStorage.friends,function(friend){
        $scope.friendsId.push(friend.id);
      });
      if(word.length>2){
       $http.get('http://localhost:1337/search/'+word).success(function(data){
          $scope.results = data;
          }).error(function(){
          console.log('error');
        });
    }
  }
  $scope.addFriend = function(target){
    $http.post('http://localhost:1337/addFriend',{user1: $localStorage.user.id, user2: target}).success(function(data){
      $localStorage.friends.push(data[0]);
      $localStorage.friends[$localStorage.friends.length-1].statut = 0;
      $scope.friendsId.push(data[0].id);
      $scope.friends.push(data);
      $scope.friends[$localStorage.friends.length-1].statut = 0;
    }).error(function(){
      console.log('error');
    })
  }
})