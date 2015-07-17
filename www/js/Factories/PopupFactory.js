app.factory('$confirmation',['$ionicPopup',function($ionicPopup) {
  var showConfirm = function(text,ok){
    var confirmPopup = $ionicPopup.confirm({
      title: 'CONFIRMATION',
      template: text
    });
    confirmPopup.then(function(res) {
      if(res) {
        ok();
      }
    });
  };
  return showConfirm;
}])

app.factory('$searchLoader',[function(){
  var loader = {};
  loader.hide = function(){
    if(!$('.sk-spinner').hasClass('hidden'))
      $('.sk-spinner').addClass('hidden');
  }
  loader.show = function(){
      if($('.sk-spinner').hasClass('hidden'))
        $('.sk-spinner').removeClass('hidden'); 
  }
  return loader;
}])

app.factory('$validated',[function(){
  var validated = {};
  validated.show = function(obj,callback){
    var elem = $(document).find('.validated-container');
    if(elem.length==0){
    var html = 
        "<div class='validated-container'>"+
          "<div class='validated-content'>"+
            "<div class='validated-text'>"+
              obj.texte
            "</div>"+
            "<div class='validated-icon'>"+
              "<i class="+obj.icon+"></i>"+
            "</div>"+
          "</div>"+
        "</div>";

      $('ion-view').append(html);
      $('.validated-container').fadeIn();
      setTimeout(function(){
        $('.validated-container').fadeOut();
        callback();},1000);
    }
    else{
      elem.fadeIn();
      setTimeout(function(){
        $('.validated-container').fadeOut()
        callback();},1000);
    }
  }
  return validated;
}])