angular.module('election',[]).controller('ElectionCtrl', function($http, $scope, $ionicPopup, $localStorage, $location, $stateParams ,$ionicLoading, $foot){

	$scope.homme;
	$scope.chevre;
	$scope.foot = $localStorage.footSelected;
	$scope.usersSelected = new Array();
	$scope.user = $localStorage.getObject('user');
	$scope.alreadyVoted = true;

	$scope.users;

	$scope.foot = { id : $stateParams.id};

	$ionicLoading.show({
		content: 'Loading Data',
		animation: 'fade-out',
		showBackdrop: false
	});

	$scope.selectedOrNot = function(hommeOuChevre, userId){
		if(hommeOuChevre=='homme'){
			if($scope.homme==userId){
				return true;
			}
			else
				return false;
		}
		else if (hommeOuChevre=='chevre'){
			if($scope.chevre==userId)
				return true;
			else
				return false;
		}
	}

	$scope.select = function(hommeOuChevre,userId){
		if(hommeOuChevre=='homme'){
			if($scope.chevre!=userId)
			$scope.homme = userId;
		}
		else
			if($scope.homme!=userId)
			$scope.chevre = userId;
	}


	$scope.elir = function(){
		if($scope.homme || $scope.chevre){
			$http.post(serverAddress+'/vote/create',{electeur:$scope.user.id, homme:$scope.homme, chevre:$scope.chevre, foot:$scope.foot.id}).success(function(){

				$scope.showConfirmation();
			}).error(function(){
				console.log('err');
			});
		}
		if(!$scope.chevre && !$scope.homme){
			console.log("choisir des elus");
		}
	}

	$scope.init = function(){
		$http.get(serverAddress+'/getVotedStatus/'+$scope.user.id+'/'+$scope.foot.id).success(function(result){
				//result (vrai == déjà voté, faux == pas encore voté)
				if(!result){
					$scope.alreadyVoted = false;
					$ionicLoading.hide();
			//On récupère les joueurs d'un match
			$http.get(serverAddress+'/getVoters/'+$scope.foot.id).success(function(results){
				$scope.users = results;
			}).error(function(){
				console.log('err');
			});

			$http.get(serverAddress+'/foot/getInfo/'+$scope.foot.id).success(function(elem){
				$scope.foot.organisator = elem.orga;
				$scope.foot.orgaName = elem.orgaName;
				$scope.foot.field = elem.field;
				$scope.foot.date = getJour(new Date(elem.field.date))+' '+getHour(new Date(elem.field.date));
			}).error(function(err){
				console.log(err);
			});
		}
		else{
			$ionicLoading.hide();
			$scope.showAlert();
			//AJOUTER UNE ALERTE
		}
	});
	}



	$scope.init();

  $scope.getElectionData = function(){
    $foot.getInfo($stateParams.id).then(function(infos){$scope.orgaName = infos.data.orgaName; $scope.fieldName = infos.data.field.name; $scope.footDate = infos.data.field.date}, function(err){err});
    $http.get(serverAddress+'/getHommeAndChevre/'+ $stateParams.id).then(function(infos){
      console.log(infos.data);
      _.each(infos.data, function(info, err){
        console.log(info.trophe);
        if (info.trophe.trophe == 0) {
          $scope.chevre_name = info.name;
          $scope.chevre_picture = info.picture;
        }

        if (info.trophe.trophe == 1) {
          $scope.homme_name = info.name;
          $scope.homme_picture = info.picture;
          console.log($scope.homme_picture);
        }
      })
    });
  }

  $scope.getElectionData();



	$scope.showConfirmation = function() {
		var alertPopup = $ionicPopup.alert({
			title: 'Confirmation du vote',
			template: 'Votre vote a bien été enregistré',
			okText: '',
			okType: '',
			cssClass: ''
		});
		alertPopup.then(function(res) {
			$location.path('/user/notif');
		});
	}

	$scope.showAlert = function() {
		var alertPopup = $ionicPopup.alert({
			title: 'Déjà voté',
			template: 'Vous avez déjà voté pour ce foot',
			okText: '',
			okType: '',
			cssClass: ''
		});
		alertPopup.then(function(res) {
			$location.path('/user/notif');
		});
	}


var canvas;
var ctx;
var confettiHandler;
//canvas dimensions
var W;
var H;
var mp = 150; //max particles
var particles = [];

$(window).resize(function () {
    canvas = document.getElementById("canvas");
    //canvas dimensions
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
});
$(document).ready(function () {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    //canvas dimensions
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    for (var i = 0; i < mp; i++) {
        particles.push({
            x: Math.random() * W, //x-coordinate
            y: Math.random() * H, //y-coordinate
            r: randomFromTo(5, 30), //radius
            d: (Math.random() * mp) + 10, //density
            color: "rgba(" + Math.floor((Math.random() * 255)) + ", " + Math.floor((Math.random() * 255)) + ", " + Math.floor((Math.random() * 255)) + ", 0.7)",
            tilt: Math.floor(Math.random() * 10) - 10,
            tiltAngleIncremental: (Math.random() * 0.07) + .05,
            tiltAngle: 0
        });
    }
    StartConfetti();

});


function draw() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < mp; i++) {
        var p = particles[i];
        ctx.beginPath();
        ctx.lineWidth = p.r / 2;
        ctx.strokeStyle = p.color;  // Green path
        ctx.moveTo(p.x + p.tilt + (p.r / 4), p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + (p.r / 4));
        ctx.stroke();  // Draw it
    }

    update();
}
function randomFromTo(from, to) {
    return Math.floor(Math.random() * (to - from + 1) + from);
}
var TiltChangeCountdown = 5;
//Function to move the snowflakes
//angle will be an ongoing incremental flag. Sin and Cos functions will be applied to it to create vertical and horizontal movements of the flakes
var angle = 0;
var tiltAngle = 0;
function update() {
    angle += 0.01;
    tiltAngle += 0.1;
    TiltChangeCountdown--;
    for (var i = 0; i < mp; i++) {

        var p = particles[i];
        p.tiltAngle += p.tiltAngleIncremental;
        //Updating X and Y coordinates
        //We will add 1 to the cos function to prevent negative values which will lead flakes to move upwards
        //Every particle has its own density which can be used to make the downward movement different for each flake
        //Lets make it more random by adding in the radius
        p.y += (Math.cos(angle + p.d) + 1 + p.r / 2) / 2;
        p.x += Math.sin(angle);
        //p.tilt = (Math.cos(p.tiltAngle - (i / 3))) * 15;
        p.tilt = (Math.sin(p.tiltAngle - (i / 3))) * 15;

        //Sending flakes back from the top when it exits
        //Lets make it a bit more organic and let flakes enter from the left and right also.
        if (p.x > W + 5 || p.x < -5 || p.y > H) {
            if (i % 5 > 0 || i % 2 == 0) //66.67% of the flakes
            {
                particles[i] = { x: Math.random() * W, y: -10, r: p.r, d: p.d, color: p.color, tilt: Math.floor(Math.random() * 10) - 10, tiltAngle: p.tiltAngle, tiltAngleIncremental: p.tiltAngleIncremental };
            }
            else {
                //If the flake is exitting from the right
                if (Math.sin(angle) > 0) {
                    //Enter from the left
                    particles[i] = { x: -5, y: Math.random() * H, r: p.r, d: p.d, color: p.color, tilt: Math.floor(Math.random() * 10) - 10, tiltAngleIncremental: p.tiltAngleIncremental };
                }
                else {
                    //Enter from the right
                    particles[i] = { x: W + 5, y: Math.random() * H, r: p.r, d: p.d, color: p.color, tilt: Math.floor(Math.random() * 10) - 10, tiltAngleIncremental: p.tiltAngleIncremental };
                }
            }
        }
    }
}
function StartConfetti() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
    confettiHandler = setInterval(draw, 15);
}
function StopConfetti() {
    clearTimeout(confettiHandler);
    if (ctx == undefined) return;
    ctx.clearRect(0, 0, W, H);
}
//animation loop

})
