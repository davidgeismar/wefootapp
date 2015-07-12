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