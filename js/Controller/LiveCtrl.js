app.controller('LiveCtrl', function($scope, $http, $modal, $timeout) {

    if (typeof $scope.menuLive == 'undefined') {
        $scope.menuLive = "Resume";
    }

    $scope.items = [{
        name: "Action"
    }, {
        name: "Another action"
    }, {
        name: "Something else here"
    }];

    var randnums = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    $scope.LoadTournoi = function() {
        $http.get('php/Live.php?action=FindLiveTournament').success(function(data) {
            if (data[0]) {
                $scope.liveOn = true;
                $scope.liveOff = false;
                $scope.tournament = data[0];
                $scope.eventId = $scope.tournament.id;

                /* On va chercher les levels */
                $http.get('data/Templatelevels_MSOP_7.json').success(function(data) {
                    $scope.levels = data;
                    console.log('$scope.levels', $scope.levels);
                    $scope.currentlevel = $scope.levels[$scope.tournament.level - 1];
                    $scope.nextlevel = $scope.levels[$scope.tournament.level];
                    $scope.leveltime = $scope.currentlevel.time;

                    /* On met à jour l'horloge */
                    JBCountDown({
                        secondsColor: "#ffdc50",
                        secondsGlow: "none",

                        minutesColor: "#9cdb7d",
                        minutesGlow: "none",

                        startDate: $scope.tournament.levelStart,
                        endDate: $scope.tournament.levelStop,
                        now: $scope.tournament.levelNow,
                        pause: $scope.tournament.lastpause !== '0000-00-00 00:00:00',

                        time: $scope.leveltime
                    });

                });

                /* On va ensuite chercher les joueurs */
                $http.get('php/Tournament.php?action=Tournament&Info=Players&eventId=' + $scope.eventId).success(function(data) {
                    $scope.players = data;
                });

                /* On va ensuite chercher les commentaires */
                $http.get('php/Comment.php?action=ListComment&eventId=' + $scope.eventId).success(function(data) {
                    $scope.comments = data;
                });



            } else {
                $scope.liveOn = false;
                $scope.liveOff = true;
            }
        });
    };

    $scope.kicker = function(player) {
        // a amléiorer en sélectionnant uniquement les joueurs inscrits et non encore sorti.
        $scope.items = $scope.players.map(function(obj) {
            return obj.username;
        });
        $scope.itemsId = $scope.players.map(function(obj) {
            return obj.id_user;
        });

        var modalInstance = $modal.open({
            templateUrl: 'partials/modal/Kicker.html',
            controller: ModalInstanceCtrl,
            resolve: {
                items: function() {
                    return $scope.items;
                }
            }
        });

        modalInstance.result.then(function(selectedItem) {
            $scope.kickermanId = $scope.itemsId[selectedItem];
            $scope.kickerman = $scope.items[selectedItem];

            $http.get('php/Live.php?action=kicker&playerId=' + player.id_user + '&eventId=' + $scope.eventId + '&kickermanId=' + $scope.kickermanId).success(function(data) {
                if (data[0]) {
                    /* On le note dans les commentaires */
                    $http.get('php/Comment.php?action=Add&Info=OnePost&userId=' + $scope.userId + '&eventId=' + $scope.eventId + '&details=' + player.username + ' est sorti par ' + $scope.kickerman).success(function(data) {
                        $scope.LoadTournoi();
                        EvalSound('kicker');
                    });
                }
            });

        });

    };

    var ModalInstanceCtrl = function($scope, $modalInstance, items) {

        $scope.items = items;
        $scope.selected = {};

        $scope.ok = function() {
            $modalInstance.close($scope.selected.item);
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    };



    $scope.buyIn = function(player) {

        $http.get('php/Live.php?action=buyIn&playerId=' + player.id_user + '&eventId=' + $scope.eventId).success(function(data) {
            if (data[0]) {

                /* On le note dans les commentaires */
                $http.get('php/Comment.php?action=Add&Info=OnePost&userId=' + $scope.userId + '&eventId=' + $scope.eventId + '&details=' + player.username + ' a payé pour jouer').success(function(data) {
                    $scope.LoadTournoi();
                    EvalSound('buyIn');
                });
            }
        });
    };

    $scope.Reset = function() {

        $http.get('php/Live.php?action=Reset&eventId=' + $scope.eventId).success(function(data) {
            if (data[0]) {
                $scope.LoadTournoi();
                EvalSound('buyIn');
            }
        });
    };


    $scope.StartTournoi = function() {
        $scope.Changelevel('next');

    };

    $scope.EndTournoi = function() {

        $http.get('php/Live.php?action=EndTournoi&eventId=' + $scope.eventId).success(function(data) {
            if (data[0]) {
                $scope.LoadTournoi();
                EvalSound('buyIn');
            }
        });
    };



    $scope.PlayGame = function() {
        $http.get('php/Live.php?action=PlayGame&eventId=' + $scope.eventId).success(function(data) {
            if (data[0]) {
                $scope.LoadTournoi();
                EvalSound('buyIn');
            }
        });
    };


    $scope.PauseGame = function() {
        $http.get('php/Live.php?action=PauseGame&eventId=' + $scope.eventId).success(function(data) {
            if (data[0]) {
                $scope.LoadTournoi();
                EvalSound('buyIn');
            }
        });
    };

    $scope.Changelevel = function(level) {
        console.log('php/Live.php?action=Changelevel&eventId=' + $scope.eventId + '&followlevel=' + level);
        $http.get('php/Live.php?action=Changelevel&eventId=' + $scope.eventId + '&followlevel=' + level).success(function(data) {
            if (data[0]) {
                /* On le note dans les commentaires */
                $http.get('php/Comment.php?action=Add&Info=OnePost&userId=' + $scope.userId + '&eventId=' + $scope.eventId + '&details=Le level ' + $scope.tournament.level + ' vient de se terminer. Les blinds passent désormais à 1000 / 2000 pendant 25 min.').success(function(data) {
                    $scope.LoadTournoi();
                    EvalSound('buyIn');
                });
            }
        });
    };

    // Function to replicate setInterval using $timeout service.
    $scope.intervalFunction = function() {
        $timeout(function() {
            $scope.LoadTournoi();
            $scope.intervalFunction();
        }, 60000);
    };

    // Kick off the interval
    $scope.intervalFunction();



    $scope.LoadTournoi();
});