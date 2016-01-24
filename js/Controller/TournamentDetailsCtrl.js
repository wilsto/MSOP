app.controller('TournamentDetailsCtrl', function($scope, $http, $routeParams, $location) {

    $scope.currentUserId = $scope.userId;

    if (typeof $scope.menuDetails == 'undefined') {
        $scope.menuDetails = "Resume";
    }

    $scope.seasonId = $routeParams.seasonId;
    $scope.episodeId = $routeParams.episodeId;


    $scope.LoadTournoi = function() {
        $http.get('php/Tournament.php?action=Tournament&Info=Details&season=' + $scope.seasonId + '&episode=' + $scope.episodeId).success(function(data) {
            $scope.tournament = data[0];
            $scope.btndisabled = ($scope.tournament.infutur) ? "" : "Disabled";
            $scope.eventId = $scope.tournament.id;

            /* On va ensuite chercher les joueurs */
            $http.get('php/Tournament.php?action=Tournament&Info=Players&eventId=' + $scope.eventId).success(function(data) {
                $scope.players = data;

                $scope.blnvainqueur = false;
                if ($scope.players[0].rank == 1) {
                    $scope.blnvainqueur = true;
                    $scope.vainqueur = $scope.players[0].username;
                    $scope.vainqueuravatar = $scope.players[0].avatar;
                }

                /* mise en cache des infos du joueur */
                angular.forEach($scope.players, function(value, key) {
                    if (value.id_user == $scope.currentUserId) {
                        this.push(value);
                    }
                }, $scope.myPlayer);
                $scope.myPlayer = $scope.myPlayer[0];
                $scope.percent = ($scope.tournament.nbplayer - $scope.myPlayer.rank + 1) / $scope.tournament.nbplayer * 100;
            });

            /* On va ensuite chercher les commentaires */
            $http.get('php/Comment.php?action=ListComment&eventId=' + $scope.eventId).success(function(data) {
                $scope.comments = data;
            });

        });
    };

    $scope.LoadTournoi();


    $scope.saveTournoi = function() {
        $http.post('php/Tournament.php?action=Tournament&Info=SaveTournoi&season=' + $scope.seasonId + '&episode=' + $scope.episodeId, $scope.tournament).success(function(data) {

        });
    };


    $scope.ReponsePlayer = function(playerId, reponse, player) {

        if (typeof player !== 'undefined') {
            switch (reponse) {
                case null:
                    player.notes = 'OK';
                    break;
                case '':
                    player.notes = 'OK';
                    break;
                case 'OK':
                    player.notes = 'NOK';
                    break;
                case 'NOK':
                    player.notes = '';
                    break;
                default:
                    player.notes = '';
                    break;
            }
            $scope.reponse = player.notes;
            $scope.username = $scope.username;
        } else {
            $scope.playerName = $scope.username;
            $scope.reponse = reponse;
        }

        switch ($scope.reponse) {
            case '':
                $scope.comment = $scope.username + " ne sait pas s il viendra";
                break;
            case 'OK':
                $scope.comment = $scope.username + " sera present";
                break;
            case 'NOK':
                $scope.comment = $scope.username + " sera absent";
                break;
            default:
                $scope.comment = $scope.username + " action inconnue";
                break;
        }

        $http.get('php/Tournament.php?action=Tournament&Info=addPlayer&playerId=' + playerId + '&eventId=' + $scope.eventId + '&Presence=' + $scope.reponse).success(function(data) {

            /* On le note dans les commentaires */
            $http.get('php/Comment.php?action=Add&Info=OnePost&userId=' + playerId + '&eventId=' + $scope.eventId + '&details=' + $scope.comment).success(function(data) {});

            createAutoClosingAlert("#alert-message", 2000);
            $scope.LoadTournoi();
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