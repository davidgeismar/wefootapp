app.factory('$confirmation',['$ionicPopup',function($ionicPopup) {
  var showConfirm = function(text,ok){
    var confirmPopup = $ionicPopup.confirm({
      title: 'CONFIRMATION',
      template: text
      //       buttons:[{ text: 'Annuler' },
      // {
      //   text: '<b>Ok</b>',
      //   type: 'button-positive'}],
    });
    confirmPopup.then(function(res) {
      if(res) {
        if(ok)
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
      obj.texte+
      "</div>"+
      "<div class='validated-icon'>"+
      "<i class='"+obj.icon+"'></i>"+
      "</div>"+
      "</div>"+
      "</div>";

      $('ion-view').append(html);
      $('.validated-container').fadeIn();
      setTimeout(function(){
        $('.validated-container').fadeOut(400,function(){
          $(this).remove();
        });
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
    
    var header = $(document).find('.actu_header');
    if(header.length != 0)
      var position = header.offset().top + header.height();

    if(!obj)
      var obj = {};
    if(!obj.texte)
      obj.texte = "Erreur lors de la requête.";
    var elem = $(document).find('.error_popup_container');
    if(elem.length == 0){
      var html = "<div class='error_popup_container' style='top:"+position+"px;'>"+
      "<div class='error_popup_content'>"+obj.texte+
      "<i class='ion-close-circled'></i>"+
      "</div>"+
      "</div>";
      $('ion-content').append(html);
      var elem = $(document).find('.error_popup_container');
        $('.error_popup_container i').click(function(){   //Bind the hide function
          error_reporter.hide();
        });
        elem.fadeIn();
        if(obj.timeout){
          setTimeout(function(){
            elem.fadeOut(400,function(){
              $(this).remove();
            });
            if(callback)
              callback();
          },obj.timeout);
        }
      }
    };

    error_reporter.hide = function(){
      var elem = $(document).find('.error_popup_container');
      if(elem)
        elem.fadeOut(400,function(){
          $(this).remove();
        });
    };

    return error_reporter;
  }])