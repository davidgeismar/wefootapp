//Creating local Storage Function
app.factory('$localStorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
        return JSON.parse($window.localStorage[key] || '{}');
    },
    clearAll:function(){
      $window.localStorage.clear();
    },
    clear:function(key){
       $window.localStorage.removeItem[key];
    },
    setAttribute: function(key, property, attribute){
      var object = JSON.parse($window.localStorage[key] || '{}');
      object[property] = attribute;
      $window.localStorage[key] = object;
    },
    addElement: function(key, element){
      var object = JSON.parse($window.localStorage[key] || '[]');
      object.push(element);
      $window.localStorage[key] = JSON.stringify(object);
    },
    removeElement: function(key, element){
      var object = JSON.parse($window.localStorage[key] || '[]');
      object.splice(key,1);
      $window.localStorage[key] = JSON.stringify(object);
    },
    getArray: function(key) {
      return JSON.parse($window.localStorage[key] || '[]');
    }
  }
}])