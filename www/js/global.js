var modalLink = "";
var switchIcon = function (icon,link) {       // Switch the icon in the header bar
	modalLink = link;
	elem = document.getElementsByClassName('iconHeader')[0];
	if(elem.className.indexOf("icon_")>-1)
		elem.className = elem.className.substring(0,elem.className.indexOf("icon_")-1) + " " + icon;
	else
		elem.className = elem.className + " " + icon;
};

var newTime = function (oldTime){
	console.log("test"+oldTime);
	return oldTime.getHours()+":"+oldTime.getMinutes()+" le "+oldTime.getDay()+"/"+oldTime.getMonth();
};

var getStuffById = function(id,stuffArray){
	for(var i = 0; i<stuffArray.length;i++){
		if (id == stuffArray[i].id)
			return stuffArray[i];
	}
};