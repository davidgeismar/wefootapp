app.factory('$confirmation',['$ionicPopup',function($ionicPopup) {
  var showConfirm = function(text,ok){
    var confirmPopup = $ionicPopup.confirm({
      title: text.toUpperCase(),
      template: 'Etes vous sur de vouloir '+text
    });
    confirmPopup.then(function(res) {
      if(res) {
        console.log('here');
        ok();
      }
      else{
        console.log('not');
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