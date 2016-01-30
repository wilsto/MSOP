var app = angular.module('MSOP', ['ngRoute', 'ngSanitize', 'ngAnimate', 'easypiechart', 'ui.bootstrap', 'xeditable', 'timer', 'nsPopover']);

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

app.run(function(editableOptions) {
    editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});

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