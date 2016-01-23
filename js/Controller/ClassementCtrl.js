app.controller('ClassementCtrl', function($scope, $http){

	if(typeof $scope.menuDetails == 'undefined') {
		$scope.menuClassement="Classement";	
	} 

	$scope.$watch('activeseason', function(){
		$scope.LoadSeason();
	});

	$scope.LoadSeason = function(){
		$http.get('php/Classement.php?activeseason='+$scope.activeseason).success(function(data) {
			$scope.players = data;
			});
	};

	$scope.LoadSeason();
});