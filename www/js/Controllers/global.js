var modalLink = "";
var switchIcon = function (icon,link) {       // Switch the icon in the header bar
      modalLink = link;
      elem = document.getElementsByClassName('iconHeader')[0];
      if(elem.className.indexOf("icon_")>-1)
        elem.className = elem.className.substring(0,elem.className.indexOf("icon_")-1) + " " + icon;
      else
        elem.className = elem.className + " " + icon;
};