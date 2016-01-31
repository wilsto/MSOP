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


    function EvalSound(firstsoundobj, secondsoundobj, thirdsoundobj, fourthsoundobj) {

        var first = document.getElementById(firstsoundobj);
        var second = document.getElementById(secondsoundobj);
        var third = document.getElementById(thirdsoundobj);
        var fourth = document.getElementById(fourthsoundobj);
        var error = document.getElementById('PlayerUnkown');
        console.log('first', first);
        console.log('second', second);
        console.log('third', third);
        console.log('fourth', fourth);
        first.addEventListener('ended', function() {
            firstClone = first.cloneNode(true);
            first.parentNode.replaceChild(firstClone, first);

            if (typeof second !== 'undefined' && second !== null) {
                second.addEventListener('ended', function() {
                    secondClone = second.cloneNode(true);
                    second.parentNode.replaceChild(secondClone, second);

                    if (typeof third !== 'undefined' && third !== null) {
                        third.addEventListener('ended', function() {
                            thirdClone = third.cloneNode(true);
                            third.parentNode.replaceChild(thirdClone, third);

                            if (typeof fourth !== 'undefined' && fourth !== null) {
                                fourth.play();
                            } else {
                                error.play();
                            }
                        });

                        third.play();
                    }
                });

                second.play();
            } else {
                error.play();
            }
        });

        first.play();
    }

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
                    $scope.currentlevel = $scope.levels[$scope.tournament.level - 1];
                    $scope.nextlevel = $scope.levels[$scope.tournament.level];
                    $scope.nextlevelType = $scope.levels[$scope.tournament.level].typelevel;
                    $scope.nextlevelBlinds = $scope.levels[$scope.tournament.level].smallblind + '-' + $scope.levels[$scope.tournament.level].bigblind;
                    $scope.leveltime = ($scope.currentlevel) ? $scope.currentlevel.time : 25;

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
                    if (typeof $scope.listplayers === 'undefined') {
                        $scope.listplayers = $scope.players;
                    }
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

        $scope.listplayers = $scope.players;
        // a amléiorer en sélectionnant uniquement les joueurs inscrits et non encore sorti.
        $scope.items = _.compact($scope.players.map(function(obj) {
            if ((obj.buyin > 0) && (obj.rank < 1)) {
                return obj.username;
            }
        }));
        $scope.itemsId = _.compact($scope.players.map(function(obj) {
            if ((obj.buyin > 0) && (obj.rank < 1)) {
                return obj.id_user;
            }
        }));

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
                        EvalSound('gunShot', player.username, 'kicker', $scope.kickerman);
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
        $scope.listplayers = $scope.players;
        $http.get('php/Live.php?action=buyIn&playerId=' + player.id_user + '&eventId=' + $scope.eventId).success(function(data) {
            if (data[0]) {
                /* On le note dans les commentaires */
                $http.get('php/Comment.php?action=Add&Info=OnePost&userId=' + $scope.userId + '&eventId=' + $scope.eventId + '&details=' + player.username + ' a payé pour jouer').success(function(data) {
                    $scope.LoadTournoi();
                    EvalSound(player.username, 'buyIn');
                });
            }
        });
    };

    $scope.Reset = function() {

        $http.get('php/Live.php?action=Reset&eventId=' + $scope.eventId).success(function(data) {
            if (data[0]) {
                $scope.LoadTournoi();
                EvalSound('TournoiReset');

            }
        });
    };

    $scope.StartTournoi = function() {
        $scope.listplayers = $scope.players;
        $scope.Changelevel('next');
        EvalSound('TournoiStart', 'Blinds-25-50', 'level25');

    };

    $scope.EndTournoi = function() {

        $http.get('php/Live.php?action=EndTournoi&eventId=' + $scope.eventId).success(function(data) {
            if (data[0]) {
                $scope.LoadTournoi();
                EvalSound('TournoiEnd');
            }
        });
    };



    $scope.PlayGame = function() {
        $scope.listplayers = $scope.players;
        $http.get('php/Live.php?action=PlayGame&eventId=' + $scope.eventId).success(function(data) {
            if (data[0]) {
                $scope.LoadTournoi();
                EvalSound('TournoiPlay');
            }
        });
    };


    $scope.PauseGame = function() {
        $scope.listplayers = $scope.players;
        $http.get('php/Live.php?action=PauseGame&eventId=' + $scope.eventId).success(function(data) {
            if (data[0]) {
                $scope.LoadTournoi();
                EvalSound('TournoiPause');
            }
        });
    };

    $scope.Changelevel = function(level) {
        $http.get('php/Live.php?action=Changelevel&eventId=' + $scope.eventId + '&followlevel=' + level).success(function(data) {
            if (data[0]) {
                /* On le note dans les commentaires */
                $http.get('php/Comment.php?action=Add&Info=OnePost&userId=' + $scope.userId + '&eventId=' + $scope.eventId + '&details=Le level ' + $scope.tournament.level + ' vient de se terminer. Les blinds passent désormais à 1000 / 2000 pendant 25 min.').success(function(data) {
                    if ($scope.nextlevelType === 'Round') {
                        if ($scope.currentlevel && $scope.currentlevel.level > 0) {
                            EvalSound('roundNext', 'Blinds-' + $scope.nextlevelBlinds, 'level25');
                        }
                    } else {
                        EvalSound('roundNext', 'Pause10');
                    }
                    $scope.LoadTournoi();
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
                EvalSound($scope.playerName, 'PlayerIn');
                break;
            case '':
            case null:
                $scope.comment = $scope.playerName + " sera absent";
                EvalSound($scope.playerName, 'PlayerOut');
                break;
            default:
                $scope.comment = $scope.playerName + " action inconnue";
                break;
        }

        $http.get('php/Tournament.php?action=Tournament&Info=addPlayer&playerId=' + playerId + '&eventId=' + $scope.eventId + '&Presence=' + $scope.reponse).success(function(data) {

            /* On le note dans les commentaires */
            $http.get('php/Comment.php?action=Add&Info=OnePost&userId=' + $scope.currentUserId + '&eventId=' + $scope.eventId + '&details=' + $scope.comment).success(function(data) {});

            createAutoClosingAlert("#alert-message", 2000);
            $scope.LoadTournoi();
        });

    };

    // Kick off the interval
    $scope.intervalFunction();



    $scope.LoadTournoi();

});