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
      callback2(results);
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