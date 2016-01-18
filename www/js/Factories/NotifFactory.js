//Get all necessary info on the notif: texte attribute related_user name and link (called in NotifController and app.run)
app.factory('$handleNotif',['$http','$localStorage','mySock',function($http,$localStorage, mySock){
  var handle = {};
  handle.handleNotif = function(notif,callback){

    var parseNotif = function(typ){
      switch(typ){
        case 'newFriend':
        return ['vous a ajouté à ses amis.','/friend/'];
        case 'resultFoot':
        return ['Découvrez l\'homme et la chèvre du match.', '/result/'];
        // case 'chevreDuMatch':
        // return['avez été élu chèvre du match.'];
        case 'footInvit':
        return ['vous a invité à un foot.','/foot/'];
        case 'footConfirm':
        return ['a confirmé sa présence à votre foot.','/foot/'];
        case 'footAnnul':
        return ['a annulé son foot.'];
        case 'footDemand':
        return['demande à participer à votre foot.','/friend/'];
        case 'footEdit':
        return['a modifié son foot.','/foot/'];
        case 'endGame':
        return['cliquer pour élire l\'homme et la chèvre du match.', '/election/'];
        case 'demandAccepted':
        return ['a accepté votre demande pour rejoindre son foot.','/foot/'];
        case 'demandRefused':
        return ['a refusé votre demande pour rejoindre son foot.'];
        case '3hoursBefore':
        return ['avez prévu un foot dans 3 heures, n\'oubliez pas votre rendez-vous !'];
        case 'footLeav':
        return["s'est retiré de votre foot.",'/foot/'];
      }
    };



    $http.get(serverAddress+'/user/get/'+notif.related_user).success(function(user){
      if(notif.typ=="endGame"){
        if(user.id == $localStorage.getObject('user').id)
          notif.userName = "Votre foot est terminé, ";
        else
          notif.userName = "Le foot de "+user.first_name+" est terminé, ";
      }
      else if (notif.typ=="resultFoot"){}
      else{
        if(user.id == $localStorage.getObject('user').id)
         notif.userName = "Vous";
       else
        notif.userName = user.first_name;
    }

    notif.picture = user.picture;
    notif.texte = parseNotif(notif.typ)[0];
    if(notif.related_stuff)
      notif.url = parseNotif(notif.typ)[1]+notif.related_stuff;

    date = new Date(notif.createdAt);
    notif.date = getHour(date)+', le '+getJour(date).substring(getJour(date).indexOf(date.getDate()),getJour(date).length); //('20h06, le 27 Mai')
    if(callback)
      callback();

  });
  };

  handle.handleActu = function(actu,callback){
    var parseActu = function(typ){
      switch(typ){
        case 'newFriend':
        return ['est ami avec','/friend/'];
        case 'hommeDuMatch':
        return ['a été élu homme du match','/friend/'];
        case 'chevreDuMatch':
        return['a été élu chèvre du match.','/friend/'];
        case 'footConfirm':
        return ['participe à un foot.','/foot/'];
        case 'demandAccepted':
        return ['participe à un foot.','/foot/'];
      }
    };
    if(actu.typ == 'WF'){
      actu.texte = actu.attached_text;
      actu.picture = "img/logo.jpg";
      if(callback) callback();
    }
    else{
      $http.get(serverAddress+'/user/get/'+actu.related_user).success(function(user){
        actu.userName = user.first_name;
        actu.userLink = '/friend/'+user.id;
        actu.texte = parseActu(actu.typ)[0];
        actu.picture = user.picture;

        if(actu.typ == 'footConfirm' || actu.typ == 'demandAccepted'){
          $http.get(serverAddress+'/foot/get/'+actu.related_stuff).success(function(data){
            actu.related_info = data;
            date = new Date(data.date);
            actu.related_info.dateString = getJour(date)+' à '+getHour(date);
            actu.related_info.format = Math.floor(data.nb_player/2)+"|"+Math.floor(data.nb_player/2)
            if(callback)
              callback();
          });
        }
        else if(actu.typ == 'newFriend'){
          $http.get(serverAddress+'/user/get/'+actu.user).success(function(data){
            actu.userName2 = data.first_name;
            actu.userLink2 = '/friend/'+data.id;
            actu.picture2 = data.picture;
            if(callback)
              callback();
          });
        }
        else if(callback){
          callback();
        }
      });
}
};

handle.notify = function(notif,callback,push){

  mySock.req(serverAddress+'/actu/newNotif',notif);

  if(push){
    var content = {};
    handle.handleNotif(notif,function(){
      content.user = notif.user;
      content.texte = $localStorage.getObject('user').first_name + " " + notif.texte;
      if(callback)
        $http.post(serverAddress+'/push/sendPush',content).success(function(){callback()});
      else
        $http.post(serverAddress+'/push/sendPush',content);
    });
  }
};

handle.push = function(texte, users, data, callback){
  var user = $localStorage.getObject('user');
  if(texte.length > 100)
    texte = texte.substring(0,47)+"...";
  if(!callback)
    callback = function(){};
  if(users[0] && typeof(users[0])!= 'number')
    users = _.pluck(users,'id');
  users = _.reject(users,function(elem){return elem == user.id;});
  $http.post(serverAddress+'/push/sendPush',{texte:texte,user:users, data:data}).success(function(){callback();});
}

handle.pushChat = function(texte, users, data, chatId ,callback){
  var user = $localStorage.getObject('user');
  if(texte.length > 100)
    texte = texte.substring(0,47)+"...";
  if(!callback)
    callback = function(){};
  if(users[0] && typeof(users[0])!= 'number')
    users = _.pluck(users,'id');
  users = _.reject(users,function(elem){return elem == user.id;});
  $http.post(serverAddress+'/push/sendChatPush',{texte:texte,user:users, data:data, chat:chatId}).success(function(){callback();});
}

return handle;
}])
