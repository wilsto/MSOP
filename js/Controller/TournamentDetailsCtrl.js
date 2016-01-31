app.controller('TournamentDetailsCtrl', function($scope, $http, $routeParams, $location, $filter) {

    $scope.currentUserId = $scope.userId;

    if (typeof $scope.menuDetails == 'undefined') {
        $scope.menuDetails = "Resume";
    }

    $scope.seasonId = $routeParams.seasonId;
    $scope.episodeId = $routeParams.episodeId;

    $scope.showLieux = function() {
        var selected = $filter('filter')($scope.lieux, {
            value: $scope.tournament.locid
        });
        return ($scope.tournament.locid && selected.length) ? selected[0].text : 'Not set';
    };

    $scope.lieux = [];
    $scope.loadLieux = function() {
        return $scope.lieux.length ? null : $http.get('php/Tournament.php?action=Lieux').success(function(data) {
            $scope.lieux = [];
            angular.forEach(data, function(value, key) {
                $scope.lieux.push({
                    value: value.id,
                    text: value.venue,
                    city: value.city,
                    street: value.street,
                    plz: value.plz,
                    locdescription: value.locdescription
                });
            });
        });
    };

    $scope.$watch('tournament.locid', function(newVal, oldVal) {
        if (newVal !== oldVal) {
            var selected = $filter('filter')($scope.lieux, {
                value: $scope.tournament.locid
            });
            $scope.tournament.lieu = selected.length ? selected[0].text : $scope.tournament.lieu;
            $scope.tournament.city = selected.length ? selected[0].city : $scope.tournament.city;
            $scope.tournament.street = selected.length ? selected[0].street : $scope.tournament.street;
            $scope.tournament.plz = selected.length ? selected[0].plz : $scope.tournament.plz;
            $scope.tournament.locdescription = selected.length ? selected[0].locdescription : $scope.tournament.locdescription;
        }
    });

    $scope.LoadTournoi = function() {


        $http.get('php/Tournament.php?action=Tournament&Info=Details&season=' + $scope.seasonId + '&episode=' + $scope.episodeId).success(function(data) {
            $scope.tournament = data[0];
            $scope.btndisabled = ($scope.tournament.infutur) ? "" : "Disabled";
            $scope.eventId = $scope.tournament.id;

            /* On va ensuite chercher les joueurs */
            $http.get('php/Tournament.php?action=Tournament&Info=Players&eventId=' + $scope.eventId).success(function(data) {
                $scope.players = data;
            });

            /* On va ensuite chercher les commentaires */
            $http.get('php/Comment.php?action=ListComment&eventId=' + $scope.eventId).success(function(data) {
                $scope.comments = data;
            });

        });


    };

    $scope.LoadTournoi();


    $scope.saveTournoi = function() {
        $http.post('php/Tournament.php?action=Tournament&Info=saveTournoi&season=' + $scope.seasonId + '&episode=' + $scope.episodeId, $scope.tournament).success(function(data) {

        });
    };


    $scope.ReponsePlayer = function(playerId, reponse, player) {
        if (typeof player !== 'undefined') {
            switch (reponse) {
                case null:
                case '':
                    player.notes = 'OK';
                    break;
                case 'OK':
                    player.notes = '';
                    break;
                default:
                    player.notes = '';
                    break;
            }

            $scope.reponse = player.notes;
            $scope.playerName = player.username;
        } else {
            $scope.playerName = $scope.username;
            $scope.reponse = reponse;
        }

        switch ($scope.reponse) {
            case 'OK':
                $scope.comment = $scope.playerName + " sera present";
                break;
            case '':
            case null:
                $scope.comment = $scope.playerName + " sera absent";
                break;
            default:
                $scope.comment = $scope.playerName + " action inconnue";
                break;
        }
        console.log('$scope.reponse', $scope.reponse);

        $http.get('php/Tournament.php?action=Tournament&Info=addPlayer&playerId=' + playerId + '&eventId=' + $scope.eventId + '&Presence=' + $scope.reponse).success(function(data) {

            /* On le note dans les commentaires */
            $http.get('php/Comment.php?action=Add&Info=OnePost&userId=' + $scope.currentUserId + '&eventId=' + $scope.eventId + '&details=' + $scope.comment).success(function(data) {});

            createAutoClosingAlert("#alert-message", 2000);
            $scope.LoadTournoi();
        });

    };

    $scope.ReCalculate = function() {

        $http.get('php/Tournament.php?action=Tournament&Info=recalculer&eventId=' + $scope.eventId).success(function(data) {
            /* On le note dans les commentaires */
            $http.get('php/Comment.php?action=Add&Info=OnePost&userId=' + $scope.currentUserId + '&eventId=' + $scope.eventId + '&details=Le tournoi a été recalculé').success(function(data) {

            });
        });
    };

    $scope.LiveOn = function(playerId, tournoiId) {
        console.log(tournoiId);
        $http.get('php/Live.php?action=Start&eventId=' + tournoiId).success(function(data) {
            /* On le note dans les commentaires */
            $http.get('php/Comment.php?action=Add&Info=OnePost&userId=' + $scope.currentUserId + '&eventId=' + tournoiId + '&details=Le tournoi commence').success(function(data) {
                $location.path('/Live');
            });
        });
    };
});