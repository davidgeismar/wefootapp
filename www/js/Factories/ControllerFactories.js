app.factory('$connection',['$http','$localStorage','$rootScope','$ionicUser','$ionicLoading','$ionicPlatform','$cordovaPush','chats', 'mySock','user','push',function($http,$localStorage,$rootScope,$ionicUser,$ionicLoading,$ionicPlatform,$cordovaPush,chats,mySock,user,push){
  //Execute all functions asynchronously.

  var connect = function(userId, generalCallback,setUUID){
    var guy = $localStorage.getObject('user');
    guy.lastUpdate = moment();
    $localStorage.setObject('user',guy);

    var allFunction = [];
    var errors = [];


if(setUUID && window.device){  // No device on testing second argument removes emulators
  allFunction.push(function(callback){
    push.setToken(userId);
    callback();
  });
}

allFunction.push(function(callback){
  mySock.req(serverAddress+'/connexion/setSocket',{id: $localStorage.getObject('user').id}, function(){
    callback();  
  });
});


allFunction.push(function(callback){
  $http.post(serverAddress+'/user/update/',{id: userId, pending_notif: 0}).success(function(){
    callback();
  });
});

if(setUUID){
  allFunction.push(function(callback){
    $http.get(serverAddress+'/getAllFriends/'+userId+'/0').success(function(data){
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
  $http.get(serverAddress+'/getAllChats/'+userId).success(function(data){
    $localStorage.set('lastTimeUpdated', moment().format());
    $localStorage.setObject('chats',data);
    chats.initNotif(function(){
      chats.initDisplayer();
      callback();
    });
    
  }).error(function(err){
    errors.push("Error chats");
  });
});

allFunction.push(function(callback){
  $http.post(serverAddress+'/user/getLastNotif',$localStorage.getObject('user')).success(function(nb){
    $rootScope.nbNotif = nb.length;
    callback();
  }).error(function(){
    errors.push("Error notif");
  });       
});


allFunction.push(function(callback){
  user.getCoord();
  callback();
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
    $http.post(serverAddress+'/pay/getCards',{user: user.id}).success(function(result){
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
    $http.post(serverAddress+'/pay/registerCard',{user: user, info: card, userId: user.id}).success(function(newCard){
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
    $confirmation('Nous allons procéder à une préauthorisation de paiement de '+resa.prix+'€.',function(){
      $ionicLoading.show({
        content: 'Loading Data',
        animation: 'fade-out',
        showBackdrop: false
      });
      $http.post(serverAddress+'/pay/preauthorize',{mangoId: mangoId, cardId: cardId, price: resa.prix, footId: foot, field: resa.field}).success(function(){
        $http.post(serverAddress+'/reservation/create',resa).success(function(){
          callback();
          $ionicLoading.hide();
        }).error(function(){
          callback(0);
        });
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
    var friends_id = _.pluck($localStorage.getArray('friends'),'id');
    $http.post(serverAddress+'/actu/getActu/',{user:$localStorage.getObject('user'), friends: friends_id, skip:lastId}).success(function(data){
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
            dates = _.union(_.allKeys(data),dates);
            $localStorage.setObject('actus', oldActu);
            $localStorage.setObject('dates',dates);
            $ionicLoading.hide();
          }
        });
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
      minuteInterval: 30,
      mode: 'time',
      doneButtonLabel: 'OK',
      doneButtonColor: '#000000',
      cancelButtonLabel: 'CANCEL',
      cancelButtonColor: '#000000',
      is24Hour:true,
      locale:"fr_fr"
    }];
  }

  foot.pickDate = function(date,callback){
    $cordovaDatePicker.show(foot.getOptionsDatepicker()[0]).then(function(dateChosen){
      var jour = new Date(dateChosen);
      date.setDate(jour.getDate());
      date.setMonth(jour.getMonth());
      date.setFullYear(jour.getFullYear());
      dateString = getJour(date);
      callback({date: date, dateString: dateString});
    });
  }

  foot.pickHour = function(date,callback){
    var options =
    {
      minuteInterval: 30,
      mode: 'time',
      doneButtonLabel: 'OK',
      doneButtonColor: '#000000',
      cancelButtonLabel: 'CANCEL',
      cancelButtonColor: '#000000',
      is24Hour:true,
      locale:"fr_fr"
    };

    if(date)
      options.date = date;
    else
      options.date = new Date();

    $cordovaDatePicker.show(options).then(function(dateChosen){
      var jour = new Date(dateChosen);
      if(jour.getMinutes()>45){
        jour.setHours(jour.getHours()+1)
        jour.setMinutes(0);
      }
      if(jour.getMinutes()>15){
        jour.setHours(jour.getHours())
        jour.setMinutes(30);
      }
      else{
        jour.setHours(jour.getHours())
        jour.setMinutes(0);
      }
      date.setHours(jour.getHours());
      date.setMinutes(jour.getMinutes());
      dateString = getHour(date);
      callback({date: date, dateString: dateString});
    });
  }

  foot.setDefaultOptions = function(values){
    values.date = new Date();
    values.date.setHours((new Date().getHours()+1)%23,00,00);
    values.nb_player = 10;
    values.friend_can_invite = true;
    values.priv = true;
    values.level = 0;
    values.created_by = $localStorage.getObject('user').id;
    return values; 
  }

  foot.searchFields = function(word,callback){
    var user = $localStorage.getObject('user');
    $searchLoader.show();
    $http.get(serverAddress+'/field/searchFields/?id='+user.id+'&lat='+user.lat+'&long='+user.lng+'&word='+word).success(function(data){
      $searchLoader.hide();
      callback(data);
    });
  }

  foot.create = function(params,callback2){
    ionicLoading();
    var user = $localStorage.getObject('user');
    $http.post(serverAddress+'/foot/create',params).success(function(foot){
      var chatters = [];
      angular.copy(params.toInvite, chatters);
      chatters.push(user.id);
      $http.post(serverAddress+'/chat/create',{users :chatters, typ:2, related:foot.id, desc:"Foot de "+ user.first_name}).success(function(){
      });
      async.each(params.toInvite,function(invited,callback){
        $handleNotif.notify({user:invited, related_user: user.id, typ:'footInvit',related_stuff: foot.id},function(){
          callback();
        },true);
      },function(){});
      //Data to display
      foot.dateString = getJourShort(new Date(foot.date))+', '+getHour(new Date(foot.date));
      foot.orgaName = user.first_name + " " + user.last_name;
      foot.orgaPic = user.picture;
      foot.field = $localStorage.fieldChosen;
      $localStorage.footTodo.push(foot);
      callback2(foot);
    }).error(function(){console.log(params);});
  }

  foot.loadFoot = function(callback2){
    $localStorage.footInvitation = [];
    $localStorage.footTodo = [];
    $http.get(serverAddress+'/getFootByUser/'+$localStorage.getObject('user').id).success(function(data){ //Send status with it as an attribute
      if(data.length==0 || data.rowCount==0){ $ionicLoading.hide(); callback2(); }
      else{
        async.each(data, function(foot,callback){
          $http.get(serverAddress+'/foot/getInfo/'+foot.id).success(function(elem){
            foot.organisator = elem.orga;
            foot.orgaName = elem.orgaName;
            foot.field = elem.field;
            foot.orgaPic = elem.picture;
            foot.dateString = getJourShort(new Date(foot.date))+', '+getHour(new Date(foot.date));
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
      }
    });
  }


  foot.loadInfo = function(id,callback){
    var date;
    var finish = false;
    var user = $localStorage.getObject('user');
    var result = { players: [] };
    $http.get(serverAddress+'/foot/get/'+id).success(function(data){  //Get foot attributes
      result.foot = data;
      date = new Date(data.date);
      date = getJour(date)+' '+getHour(date);
      $http.get(serverAddress+'/foot/getInfo/'+id).success(function(info){  //Get foot info
        result.foot.organisator = info.orga;
        result.foot.orgaName = info.orgaName;
        result.foot.field = info.field;
        if(finish) callback(result);
        finish = true;
      });
    });

    $http.get(serverAddress+'/foot/getAllPlayers/'+id).success(function(allPlayers){  //Get list of playersId
      result.invited = _.pluck(_.filter(allPlayers,function(player){return player.statut>0}),'user');
      result.isInvited = (result.invited.indexOf($localStorage.getObject('user').id)>-1);
      result.isPending =  (_.pluck(_.filter(allPlayers,function(player){return player.statut==0}),'id').indexOf(user.id)>-1);
      data = _.filter(allPlayers,function(player){return player.statut>1});
      data = _.pluck(data,'user'); //All confirmed players ids.
      result.isPlaying = (data.indexOf(user.id)>-1);
      async.each(data, function(player,callback){
          $http.get(serverAddress+'/user/get/'+player).success(function(user){   //Get all players attributes
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
  $http.post(serverAddress+'/foot/removePlayer',{foot: footId, user: userId}).success(function(){
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
  $http.post(serverAddress+'/foot/deleteFoot',{foot: footId}).success(function(){
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
  $http.post(serverAddress+'/player/update',{foot:foot.id,user:player}).success(function(){
    players.push($localStorage.getObject('user'));
    var plucked = _.pluck($localStorage.footInvitation,'id');
    index = plucked.indexOf(foot.id);
    if(index>-1) $localStorage.footInvitation.splice(index,1);
    foot.dateString = getJourShort(new Date(foot.date))+', '+getHour(new Date(foot.date));
    var indexOrga = _.pluck(players,'id');
    indexOrga = indexOrga.indexOf(foot.created_by);
    foot.orgaPic = players[indexOrga].picture;
    $localStorage.footTodo.push(foot);
    var notif = {user:foot.organisator, related_user: user.id, typ:'footConfirm', related_stuff:foot.id};
    $handleNotif.notify(notif,function(){},true);
  });
}

foot.searchFoot = function(params,callback2){
  $searchLoader.show();
  var footList = [];
  var filtered = [];
  var reduceResults = function() {  //REMOVE FOOT WHERE USER IS PLAYING
    filtered = _.filter(filtered,function(elem) {
      return footList.indexOf(elem.id)==-1 ; 
    });
  }
  var userId = $localStorage.getObject('user').id;
  var finish = false;
  $http.get(serverAddress+'/getFootByUser/'+userId).success(function(foots){
    footList = _.pluck(foots,'id');
    if(finish){
      reduceResults();
      callback2(filtered);
    }
    finish = true;
  });
  
  $http.post(serverAddress+'/foot/query',params).success(function(data){
    async.each(data,function(foot,callback){
      var finish = false;
        $http.get(serverAddress+'/foot/getInfo/'+foot.id).success(function(info){  //Get foot info
          foot.organisator = info.orga;
          foot.orgaName = info.orgaName;
          foot.field = info.field;
          foot.orgaPic = info.picture;
          foot.dateString = getHour(foot.date);
          filtered.push(foot);
          callback();
        });
      },function(){
        $searchLoader.hide();
        if(finish){
          reduceResults();
          callback2(filtered);
        }
        finish = true;
      });
  });
}
return foot;
}])

.factory('mySock',['$localStorage',function($localStorage){
  var mySock = {};

  mySock.req = function(url, params, callback, methode){
    if(!methode){
      methode = 'post';
    }
    io.socket.request({method:methode,url:url,headers:{Authorization :$localStorage.get('token')},params:params}, callback);
  };


  return mySock;
}])

.factory('user',['$http','$ionicLoading','$handleNotif','$localStorage','$rootScope','$cordovaGeolocation','$ionicPlatform',function($http,$ionicLoading,$handleNotif,$localStorage,$rootScope,$cordovaGeolocation,$ionicPlatform){
  var user = {};

  user.getCoord = function(){
    $ionicPlatform.ready(function () {
      var posOptions = {timeout: 10000, enableHighAccuracy: true};
      $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
        var user = $localStorage.getObject('user');
        user.lat  = position.coords.latitude;
        user.lng = position.coords.longitude;
        $http.post(serverAddress+'/user/update',{id: user.id, last_lat : user.lat, last_long: user.lng});
        $localStorage.setObject('user', user);
        $rootScope.getCoord = true;
      });
    });
  }

  //FRIENDS ACTION

  user.addFriend = function(postData, target){
    return $http.post(serverAddress+'/addFriend',postData);
  }

  user.isFriendWith = function(userId){
    return $http.post(serverAddress+'/user/isFriendWith',{user1: $localStorage.getObject('user').id, user2: userId});
  }


  return user;
}])

.factory('push',['$http','$localStorage','$ionicPlatform','$location','$rootScope','$ionicLoading',function($http,$localStorage,$ionicPlatform,$location,$rootScope, $ionicLoading){
  var push = {};
  $ionicPlatform.ready(function(){
    if(window.device){
      var cordovaPush = PushNotification.init(
      { 
        "android": {"senderID": "124322564355"},
        "ios": {"alert": "true", "badge": "true", "sound": "true"} 
      });


      cordovaPush.on('registration', function(data) {
        var user = $localStorage.getObject('user');
        $localStorage.set('pushToken',data.registrationId);
      });

      cordovaPush.on('notification', function(notification){  // TRIGGERED ON CLICK ON NOTIF
        var pushLocation = '/user/notif';

        if(notification.additionalData && notification.additionalData.url)
          pushLocation = notification.additionalData.url;
        if(pushLocation.indexOf("conv")>-1){
          $rootScope.nextUrl = '/user/profil';
        }
        if(!notification.additionalData.foreground){
          $location.path(pushLocation);
          $ionicLoading.hide();
        }
      });
    }
  });
    // push.unregister = function(){
    //   cordovaPush.unregister(function(success){
    //   }, 
    //   function(error){
    //     console.log(error);
    //   });
    // }

    push.setToken = function(userId){
      $http.post(serverAddress+'/push/create',{user: userId, push_id: $localStorage.get('pushToken'), is_ios: ionic.Platform.isIOS()}).success(function(){});
    };
    return push;

  }])

