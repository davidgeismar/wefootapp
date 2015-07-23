//Get all necessary info on the notif: texte attribute related_user name and link (called in NotifController and app.run)
app.factory('$handleNotif',['$http','$localStorage',function($http,$localStorage){
  var handle = {};
  handle.handleNotif = function(notif,callback){

    var parseNotif = function(typ){
      switch(typ){
        case 'newFriend':
        return ['vous a ajouté à ses amis.','/friend/'];
        case 'hommeDuMatch':
        return ['avez été élu homme du match.'];
        case 'chevreDuMatch':
        return['avez été élu chèvre du match.'];
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
        return['cliquer pour élir l\'homme et la chèvre du match.', '/election/'];
        case 'demandAccepted':
        return ['a accepté votre demande pour rejoindre son foot.','/foot/'];
        case 'demandRefused':
        return ['a accepté votre demande pour rejoindre son foot.'];
        case '3hoursBefore':
        return ['avez prévu un foot dans 3 heures, n\'oubliez pas votre rendez-vous !'];
      }
    };



    $http.get(serverAddress+'/user/get/'+notif.related_user).success(function(user){

      if(user.id == $localStorage.getObject('user').id)
       notif.userName = "Vous";
     else{
      if(notif.typ!="endGame")
        notif.userName = user.first_name;
      else
        notif.userName = "Le foot de "+user.first_name+" est terminé, ";
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
};

handle.notify = function(notif,callback,push){

  io.socket.post(serverAddress+'/actu/newNotif',notif);

  if(push){
    var content = {};
    handle.handleNotif(notif,function(){
      content.user = notif.user;
      content.texte = $localStorage.getObject('user').first_name + " " + notif.texte;
      if(callback)
        io.socket.post(serverAddress+'/push/sendPush',content,callback());
      else
        io.socket.post(serverAddress+'/push/sendPush',content);
    });
  }
};

return handle;
}])