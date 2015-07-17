app.factory('$connection',['$http','$localStorage','$rootScope','$ionicPush','$ionicUser','$ionicLoading','$ionicPlatform','$cordovaPush','chats',function($http,$localStorage,$rootScope,$ionicPush,$ionicUser,$ionicLoading,$ionicPlatform,$cordovaPush,chats){
  //Execute all functions asynchronously.

  var connect = function(userId, generalCallback,setUUID){
    var guy = $localStorage.getObject('user');
    guy.lastUpdate = moment();
    $localStorage.setObject('user',guy);

    var allFunction = [];
    var errors = [];


if(setUUID && window.device && window.device.model.indexOf('x86')==-1){  // No device on testing second argument removes emulators
  allFunction.push(function(callback){
    $ionicPlatform.ready(function () {
      var registerOptions;

      if(ionic.Platform.isIOS()){
        registerOptions = {
          badge: true,
          sound: true,
          alert: true
        };
      }
      else if (ionic.Platform.isAndroid()){
        registerOptions =    {
          "senderID": "wefoot-978"
        };
      }

      $cordovaPush.register(registerOptions).then(function (result) {
        guy.pushToken = result;
        $localStorage.setObject('user',guy);
        $http.post('http://'+serverAddress+'/push/create',{user: userId, push_id: result, is_ios: ionic.Platform.isIOS()}).success(function(){
          callback();
        }).error(function(err){
          errors.push("Error push");
        });
      },function(err){
        console.log(err);
      });
    }, function(err) {
      errors.push("Error push");
    });
  });
}


allFunction.push(function(callback){
  io.socket.post('http://'+serverAddress+'/connexion/setConnexion',{id: userId},function(){
    callback();
  }); 
});



allFunction.push(function(callback){
  $http.post('http://'+serverAddress+'/user/update/',{id: userId, pending_notif: 0}).success(function(){
    callback();
  });
});

if(setUUID){
  allFunction.push(function(callback){
    $http.get('http://'+serverAddress+'/getAllFriends/'+userId+'/0').success(function(data){
      var friends = data[0];
      if(data[0].length==0) {
        $localStorage.setObject('friends',[]);
        callback();
      }
          angular.forEach(friends,function(friend,index){   // Add attribute statut to friends to keep favorite
            friend.statut = data[1][index].stat; 
            friend.friendship = data[1][index].friendship;
            if(index == friends.length-1){
             $localStorage.setObject('friends',friends);
             callback();
           }
         });
        }).error(function(err){
          errors.push("Error friends");

        });
      });
}


allFunction.push(function(callback){
  $http.get('http://'+serverAddress+'/getAllChats/'+userId).success(function(data){
    $localStorage.set('lastTimeUpdated', moment());
    $localStorage.setObject('chats',data);
    chats.initNotif();
    chats.initDisplayer();
    callback();
  }).error(function(err){
    errors.push("Error chats");
  });
});

allFunction.push(function(callback){
  $http.post('http://'+serverAddress+'/user/getLastNotif',$localStorage.getObject('user')).success(function(nb){
    $rootScope.nbNotif = nb.length;
    callback();
  }).error(function(){
    errors.push("Error notif");
  });       
});


async.each(allFunction, function(oneFunc,callback){
  oneFunc(function(){callback();})
},function(){
  if(errors.length==0)
    generalCallback();
  else{
    $ionicLoading.hide();
    console.log(errors);
    $rootScope.toShow = true;
  }
});
};

return connect;

}])



.factory('$paiement',['$http','$ionicLoading','$searchLoader','$confirmation',function($http,$ionicLoading,$searchLoader,$confirmation){
  var paiement = {};

  paiement.getAllCards = function(user,callback){
    $searchLoader.show();
    $http.post('http://'+serverAddress+'/pay/getCards',{user: user}).success(function(result){
      $searchLoader.hide();
      callback(result[0],result[1]);
    });
  }

  paiement.registerCard = function(user,card,callback){
    $ionicLoading.show({
      content: 'Loading Data',
      animation: 'fade-out',
      showBackdrop: false,
      hideOnStateChange: false
    });
    $http.post('http://'+serverAddress+'/pay/registerCard',{user: user, info: card}).success(function(newCard){
      newCard.Alias = card.number;
      newCard.Id = newCard.CardId;
      callback(newCard);
      $ionicLoading.hide();
    }).error(function(){
      $ionicLoading.hide();
      callback(0);
    });
  }

  paiement.proceed = function(mangoId,cardId,resa,foot,callback){
    $confirmation('Nous allons procéder à une préauthorisation de paiement de '+price+'€.',function(){
      $ionicLoading.show({
        content: 'Loading Data',
        animation: 'fade-out',
        showBackdrop: false
      });
      $http.post('http://'+serverAddress+'/pay/preauthorize',{mangoId: mangoId, cardId: cardId, price: resa.price, footId: foot}).success(function(){
        callback();
        $ionicLoading.hide();
      }).error(function(){
        callback(0);
      });
    });
    
  }
  return paiement;

}])

.factory('$profil',['$http','$ionicLoading','$handleNotif','$localStorage',function($http,$ionicLoading,$handleNotif,$localStorage){
  var profil = {};

  profil.getLastId = function(actusByDay){
    var actusByDay  = $localStorage.getObject('actus');
    if(_.allKeys(actusByDay).length == 0 || actusByDay.length==0 || $localStorage.newFriend){
      $localStorage.newFriend = false;
      return 0;
    }
    else{
      return actusByDay[0][0].id;
    }
  }
  
  profil.getAllActu = function(callback3){
    var dates = $localStorage.getObject('dates');
    var oldActu = $localStorage.getObject('actus');
    var lastId = profil.getLastId();
    if(Object.prototype.toString.call( dates ) != '[object Array]'){
      dates = [];
      oldActu = [];
    }
    if(lastId == 0){
      $ionicLoading.show({
        content: 'Loading Data',
        animation: 'fade-out',
        showBackdrop: false
      });
    }
    var friends_id = _.pluck($localStorage.getObject('friends'),'id');
    $http.post('http://'+serverAddress+'/actu/getActu/',{user:$localStorage.getObject('user'), friends: friends_id, skip:lastId}).success(function(data){
      var actusByDay = _.values(data);
      if(actusByDay.length==0) $ionicLoading.hide();
      async.each(actusByDay,function(actus,callback2){
        async.each(actus,function(actu,callback){
          $handleNotif.handleActu(actu,function(){
            callback();
          });
        },function(){
          callback2();
        });
      },function(){
      if( lastId > 0 ){ //On update
        var indexOldDates = [];
        var newElems = [];  //Keep new elems to replace them in the right order
        var count = -1;
        _.each(data,function(array,index){ //Index = a date here
          count++;
          if(dates.indexOf(index)>-1)
            oldActu[dates.indexOf(index)] =array.concat(oldActu[dates.indexOf(index)]);
          else{
            newElems.push(array);
          }
          if(count == _.allKeys(data).length-1){
            for(i = newElems.length-1; i>-1; i--){ //Concatenate 2 2D Arrays
              oldActu.unshift(newElems[i]);
            }
          }
        });
       dates = _.union(_.allKeys(data),dates);
       $localStorage.setObject('actus', oldActu);
       $localStorage.setObject('dates',dates);
      }
      else{
        $localStorage.setObject('actus',actusByDay);
        $localStorage.setObject('dates',_.allKeys(data));
        $ionicLoading.hide();
      }
      if(callback3) callback3();
    });
});
}

return profil;
}])


.factory('$foot',['$http','$ionicLoading','$handleNotif','$localStorage','$cordovaDatePicker','$searchLoader','$cordovaGeolocation',function($http,$ionicLoading,$handleNotif,$localStorage,$cordovaDatePicker, $searchLoader, $cordovaGeolocation){
  
  var foot = {};

  var ionicLoading =  function(){
      $ionicLoading.show({
        content: 'Loading Data',
        animation: 'fade-out',
        showBackdrop: false
      });
  }

  foot.getOptionsDatepicker = function(){
    return [{
    date: new Date(),
    mode: 'date',
    minDate:  new Date(),
      doneButtonLabel: 'OK',
      doneButtonColor: '#000000',
      cancelButtonLabel: 'CANCEL',
      cancelButtonColor: '#000000'
    },
    {
      date: new Date(),
      minDate: new Date(),
      minuteInterval: 30,
      mode: 'time', // or 'time'
      doneButtonLabel: 'OK',
      doneButtonColor: '#000000',
      cancelButtonLabel: 'CANCEL',
      cancelButtonColor: '#000000'
    }];
  }

  foot.pickDate = function(date,callback){
    $cordovaDatePicker.show(getOptionsDatepicker[0]).then(function(dateChosen){
      var jour = new Date(dateChosen);
      date.setDate(jour.getDate());
      date.setMonth(jour.getMonth());
      date.setFullYear(jour.getFullYear());
      dateString = getJour(date);
      callback({date: date, dateString: dateString});
    });
  }

  foot.pickDate = function(date,callback){
    $cordovaDatePicker.show(getOptionsDatepicker[1]).then(function(dateChosen){
      var jour = new Date(dateChosen);
      date.setHours(jour.getHours());
      date.setMinutes(jour.getMinutes());
      dateString = getHour(date);
      callback({date: date, dateString: dateString});
    });
  }

  foot.setDefaultOptions = function(values){
    values.date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); //DEFAULT TOMMOROW
    values.date.setHours(20,30,00);
    values.nb_player = 10;
    values.friend_can_invite = true;
    values.priv = true;
    values.level = 0;
    values.created_by = $localStorage.getObject('user').id;
    return values; 
  }

  foot.searchFields = function(word,callback){
    if(word.length>0){
      $searchLoader.show();
      $http.get('http://'+serverAddress+'/field/search/'+$localStorage.getObject('user').id+'/'+word).success(function(data){
        callback(data);
        $searchLoader.hide();
      });
    }
    else if(word.length==0) {
      $searchLoader.show();
      var posOptions = {timeout: 10000, enableHighAccuracy: false};
      $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
        var lat  = position.coords.latitude
        var long = position.coords.longitude
        $http.get('http://'+serverAddress+'/field/near/'+$localStorage.getObject('user').id+'/'+lat+'/'+long).success(function(data){
          $searchLoader.hide();
          callback(data);
        });
      }, function(err) {
      }); 
    }
  }

  foot.create = function(params,callback2){
    ionicLoading();
    var user = $localStorage.getObject('user');
    $http.post('http://'+serverAddress+'/foot/create',params).success(function(foot){
      chatters = params.toInvite;
      chatters.push($localStorage.getObject('user').id);
      $http.post('http://'+serverAddress+'/chat/create',{users :chatters, typ:2, related:foot.id, desc:"Foot de "+ user.first_name}).success(function(){
      });
      async.each(params.toInvite,function(invited,callback){
        $handleNotif.notify({user:invited, related_user: user.id, typ:'footInvit',related_stuff: foot.id},function(){
          callback();
        },true);
      },function(){});
        callback2(foot);
    });
  }

  foot.loadFoot = function(callback2){
    $localStorage.footInvitation = [];
    $localStorage.footTodo = [];
    $http.get('http://'+serverAddress+'/getFootByUser/'+$localStorage.getObject('user').id).success(function(data){ //Send status with it as an attribute
      if(data.length==0) $ionicLoading.hide();
      async.each(data, function(foot,callback){
        $http.get('http://'+serverAddress+'/foot/getInfo/'+foot.id).success(function(elem){
          foot.organisator = elem.orga;
          foot.orgaName = elem.orgaName;
          foot.field = elem.field;
          foot.orgaPic = elem.picture;
          foot.dateString = getJour(new Date(foot.date))+', '+getHour(new Date(foot.date));
          callback();
        }).error(function(err){
          console.log(err);
          callback();
        });
        if(foot.statut==1)
          $localStorage.footInvitation.push(foot);
        else if(foot.statut>1)
          $localStorage.footTodo.push(foot);
      },function(){
        callback2();
      });
    });
  }


  foot.loadInfo = function(id,callback){
    var date;
    var finish = false;
    var user = $localStorage.getObject('user');
    var result = { players: [] };
    $http.get('http://'+serverAddress+'/foot/get/'+id).success(function(data){  //Get foot attributes
      result.foot = data;
      date = new Date(data.date);
      date = getJour(date)+' '+getHour(date);
      $http.get('http://'+serverAddress+'/foot/getInfo/'+id).success(function(info){  //Get foot info
        result.foot.organisator = info.orga;
        result.foot.orgaName = info.orgaName;
        result.foot.field = info.field;
        if(finish) callback(result);
        finish = true;
      });
    });

    $http.get('http://'+serverAddress+'/foot/getAllPlayers/'+id).success(function(allPlayers){  //Get list of playersId
      result.invited = _.pluck(_.filter(allPlayers,function(player){return player.statut>0}),'user');
      result.isInvited = (result.invited.indexOf($localStorage.getObject('user').id)>-1);
      result.isPending =  (_.pluck(_.filter(allPlayers,function(player){return player.statut==0}),'id').indexOf(user.id)>-1);
      data = _.filter(allPlayers,function(player){return player.statut>1});
      data = _.pluck(data,'user'); //All confirmed players ids.
      result.isPlaying = (data.indexOf(user.id)>-1);
      async.each(data, function(player,callback){
          $http.get('http://'+serverAddress+'/user/get/'+player).success(function(user){   //Get all players attributes
            result.players.push(user);
            callback();
          });
        },function(err){             //Indicate loading all players is finish
          result.date = date;
          if(finish) callback(result);
          finish = true; // Show everything
        });
    });
  }

  foot.removePlayer = function(userId,footId,isPlaying,callback){
    $http.post('http://'+serverAddress+'/foot/removePlayer',{foot: footId, user: userId}).success(function(){
      if(!isPlaying){
        var plucked = _.pluck($localStorage.footInvitation,'id');
        index = plucked.indexOf(footId);
        if(index>-1) $localStorage.footInvitation.splice(index,1);
      }
      else{
        var plucked = _.pluck($localStorage.footTodo,'id');
        index = plucked.indexOf(footId);
        if(index>-1) $localStorage.footTodo.splice(index,1);
      }
      callback();
    });
  }

  foot.deleteFoot = function(footId, players,callback2){
    var userId = $localStorage.getObject('user').id;
    $http.post('http://'+serverAddress+'/foot/deleteFoot',{foot: footId}).success(function(){
      var pos = _.pluck(players,'id').indexOf(userId);
      var toNotify = players; //Notify all players except the organisator
      toNotify.splice(pos,1);
      if(toNotify.length == 0) callback2();
      async.each(toNotify,function(guy,callback){
        $handleNotif.notify({user:guy.id,related_user:userId,typ:'footAnnul',related_stuff:footId},function(){callback();},true);
      },function(){
        var plucked = _.pluck($localStorage.footTodo,'id');
        index = plucked.indexOf(footId);
        if(index>-1) $localStorage.footTodo.splice(index,1);
        callback2();
      });
    });
  }

  foot.playFoot = function(player,foot,players){
      var user = $localStorage.getObject('user');
      $http.post('http://'+serverAddress+'/player/update',{foot:foot.id,user:player}).success(function(){
      players.push($localStorage.getObject('user'));
      var plucked = _.pluck($localStorage.footInvitation,'id');
      index = plucked.indexOf(foot.id);
      if(index>-1) $localStorage.footInvitation.splice(index,1);
      foot.dateString = date;
      var indexOrga = _.pluck(players,'id');
      indexOrga = indexOrga.indexOf(foot.created_by);
      foot.orgaPic = players[indexOrga].picture;
      $localStorage.footTodo.push(foot);
      var notif = {user:foot.organisator, related_user: user.id, typ:'footConfirm', related_stuff:foot.id};
      $handleNotif.notify(notif,function(){},true);
    });
  }

  foot.searchFoot = function(params,callback2){
    $http.post('http://'+serverAddress+'/foot/query',params).success(function(data){
      results =[];
      async.each(data,function(foot,callback){
        var finish = false;
        $http.get('http://'+serverAddress+'/foot/getInfo/'+foot.id).success(function(info){  //Get foot info
          foot.organisator = info.orga;
          foot.orgaName = info.orgaName;
          foot.field = info.field;
          foot.orgaPic = info.picture;
          results.push(foot);
          callback();
        });
      },function(){ callback2(results);
      });
    });
  }
  return foot;
}])

