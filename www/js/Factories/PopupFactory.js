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
              "<i class='"+obj.icon+"'></i>"+
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
        $('.validated-container').fadeOut();
        callback();},1000);
    }
  }
  return validated;
}])
/* 
error_reporter.show({
  timeout: integer, default to infinite,
  texte: text, default to "Erreur lors de la requête"
},function(){callback();})
*/
app.factory('error_reporter',[function(){
    var error_reporter = {};
    error_reporter.show =  function(obj,callback){
      if(!obj)
        var obj = {};
      if(!obj.texte)
        obj.texte = "Erreur lors de la requête.";
      var elem = $(document).find('.error_popup_container');
      if(elem.length == 0){
        error_reporter.on = true;
        var html = "<div class='error_popup_container'>"+
                      "<div class='error_popup_content'>"+obj.texte+
                      "</div>"+
                    "</div>";
        $('ion-view').append(html);
        $('.error_popup_container').fadeIn();
        if(obj.timeout){
          setTimeout(function(){
            $('.error_popup_container').fadeOut();
            error_reporter.on = false;
            if(callback)
              callback();
          },obj.timeout);
        }
      }
      else{
        if(!error_reporter.on){
          error_reporter.on = true;
          elem.fadeIn();
          if(obj.timeout){
            setTimeout(function(){
              $('.error_popup_container').fadeOut();
              error_reporter.on = false;
              if(callback)
                callback();
            },obj.timeout);
          }
        }
      }
    };

    error_reporter.hide = function(){
      var elem = $(document).find('.error_popup_container');
      if(elem)
        elem.fadeOut();
    }

    error_reporter.on = false;
    return error_reporter;
}])