app.controller('TournamentCtrl', function($scope, $http) {

    if (typeof $scope.menu == 'undefined') {
        $scope.menu = "All";
    }

    $scope.$watch('menu', function() {
        $scope.statusFilter =
            ($scope.menu == 'Past') ? {
            'infutur': 0
        } :
            ($scope.menu == 'Futur') ? {
            'infutur': 1
        } :
            null;
    });

    $scope.$watch('activeseason', function() {
        if ($scope.activeseason < 8) {
            $scope.menu = "Past";
        } else {
            $scope.menu = "Futur";
        }
        $scope.LoadSeason();
    });

    $scope.LoadSeason = function() {
        $http.get('php/Tournament.php?action=TournamentList&activeseason=' + $scope.activeseason).success(function(data) {
            $scope.tournaments = data;

            // déterminer le prochain tournoi
            var blnNext = false;
            angular.forEach($scope.tournaments, function(value, key) {
                value.next = false;
                if (new Date(value.date) > Date.now()) {
                    if (blnNext === false) {
                        value.next = true;
                        blnNext = true;
                    }
                }
            });
        });
    };

});