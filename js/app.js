var app = angular.module('MSOP', ['ngRoute', 'ngAnimate', 'easypiechart', 'ui.bootstrap']);

app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/Tournament', {
            templateUrl: 'partials/TournamentList.html',
            controller: 'TournamentCtrl'
        }).
        when('/TournamentDetails/:seasonId/:episodeId', {
            templateUrl: 'partials/TournamentDetails.html',
            controller: 'TournamentDetailsCtrl'
        }).
        when('/Classement', {
            templateUrl: 'partials/Classement.html',
            controller: 'ClassementCtrl'
        }).
        when('/HallOfFame', {
            templateUrl: 'partials/HallOfFame.html',
            controller: 'HallOfFameCtrl'
        }).
        when('/Live', {
            templateUrl: 'partials/Live.html',
            controller: 'LiveCtrl'
        }).
        when('/Login', {
            templateUrl: 'partials/login.html',
            controller: 'LoginCtrl'
        }).
        otherwise({
            redirectTo: '/Tournament'
        });
    }
]);


app.factory('UserService', function() {
    return {
        username: 'anonymous',
        userId: 0
    };
});

function HeaderController($scope, $location) {
    $scope.isActive = function(viewLocation) {
        return viewLocation === $location.path();
    };
}