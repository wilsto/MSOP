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

app.directive('audios', function($sce) {
    return {
        restrict: 'A',
        scope: {
            code: '='
        },
        replace: true,
        template: '<audio id="{{code}}" ><source src="{{url}}" ></source></audio>',
        link: function(scope) {
            scope.$watch('code', function(newVal, oldVal) {
                if (newVal !== undefined) {
                    scope.url = $sce.trustAsResourceUrl("sounds/" + newVal + ".wav");
                }
            });
        }
    };
})

.directive('tabs', function() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {},
        controller: ["$scope",
            function($scope) {
                var panes = $scope.panes = [];

                $scope.select = function(pane) {
                    angular.forEach(panes, function(pane) {
                        pane.selected = false;
                    });
                    pane.selected = true;
                };

                this.addPane = function(pane) {
                    if (panes.length === 0) $scope.select(pane);
                    panes.push(pane);
                };
            }
        ],
        template: '<div class="tabbable">' +
            '<ul class="nav nav-tabs">' +
            '<li ng-repeat="pane in panes" ng-class="{ tabactive:pane.selected}">' +
            '<a href="" ng-click="select(pane)">{{pane.title}}</a>' +
            '</li>' +
            '</ul>' +
            '<div class="tab-content" ng-transclude></div>' +
            '</div>',
        replace: true
    };
})

.directive('pane', function() {
    return {
        require: '^tabs',
        restrict: 'E',
        transclude: true,
        scope: {
            title: '@'
        },
        link: function(scope, element, attrs, tabsCtrl) {
            tabsCtrl.addPane(scope);
        },
        template: '<div class="tab-pane" ng-class="{active: selected}" ng-transclude>' +
            '</div>',
        replace: true
    };
});

function HeaderController($scope, $location) {
    $scope.isActive = function(viewLocation) {
        return viewLocation === $location.path();
    };
}