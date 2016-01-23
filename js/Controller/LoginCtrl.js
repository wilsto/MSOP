app.controller('LoginCtrl', function($scope, $http){

	$scope.username = '';
	$scope.userId =0 ;
	$scope.loggedIn = false ;
	$scope.loggedOut = true ;
	$scope.myPlayer =[];
	$scope.percent = 0;
	
	$http.get('php/session.php').success(function(data) {
		$scope.user = data;
		if( typeof($scope.user.username) !== 'undefined' ){
			$scope.loggedIn = true;
			$scope.loggedOut = false ;
			$scope.username = $scope.user.username;
			$scope.userId = $scope.user.id;
		}
	});

	$http.get('php/season.php').success(function(data) {
		$scope.seasons = data;
		if(typeof $scope.activeseason == 'undefined') {
				$scope.activeseason = $scope.seasons[7].season;
		}
	});

	$scope.ChangePassword = function(){
		$.post("php/ChangePassword.php",$("#FormChangePWD").serialize(),function(texte){
				$("div#message").append(texte);
		});
	};
});