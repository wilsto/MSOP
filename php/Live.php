<?php 

if(isset($_GET["action"])) {

	mysql_connect('localhost','root',''); 
	mysql_select_db('mypokerleague'); 
	setlocale(LC_ALL, 'fr_FR');
    mysql_query("SET @@lc_time_names = 'fr_FR'");
	mysql_query("SET character_set_results = 'utf8', character_set_client = 'utf8', character_set_connection = 'utf8', character_set_database = 'utf8', character_set_server = 'utf8'");

	$blnquery = true;
	$arr = array();



	if ($_GET["action"]=="FindLiveTournament") {

		$rs = mysql_query("SELECT ev.id, ev.season, ev.episode, ev.title, ev.level, ev.start, ev.end, ev.leveltime, ev.lastpause, ev.pausetime, ev.status, UNIX_TIMESTAMP(ev.leveltime) as levelStart, UNIX_TIMESTAMP(ev.leveltime + INTERVAL 25 MINUTE + INTERVAL ev.pausetime SECOND) as levelStop, UNIX_TIMESTAMP(NOW()) as levelNow,
			ev.dates as date, monthname(ev.dates) as month, day(ev.dates) as day,l.alias as lieu, l.street, l.plz, l.city, IF(ev.dates > Date(NOW()), 1, 0) as infutur, 
			COALESCE(p.nbplayer,0) as nbplayer, COALESCE(p2.nbplayernok,0) as nbplayernok, ((SELECT count(id) from users WHERE Actif =1) - COALESCE(p.nbplayer,0) - COALESCE(p2.nbplayernok,0)) as nbuser
			FROM events as ev
			LEFT JOIN lieux  as l ON ev.locid = l.id
			LEFT JOIN (SELECT id_event, COALESCE(count(id_player),0) as nbplayer from pokerpoints WHERE notes <>'NOK' GROUP BY id_event) as p ON ev.id = p.id_event
			LEFT JOIN (SELECT id_event, COALESCE(count(id_player),0) as nbplayernok from pokerpoints WHERE notes ='NOK' GROUP BY id_event) as p2 ON ev.id = p2.id_event 
			WHERE start > 0 and end = 0"
			);
	}



	if ($_GET["action"]=="Start") {
		$eventid=$_GET["eventId"];
		$rs = mysql_query("UPDATE events SET start = Now() WHERE id = " . $eventid );
		$blnquery = false;
		$arr = array("Update with success");
	}


	if ($_GET["action"]=="EndTournoi") {
		$eventid=$_GET["eventId"];
		$rs = mysql_query("UPDATE events SET end = Now() WHERE id = " . $eventid );
		$blnquery = false;
		$arr = array("Update with success");
	}


	if ($_GET["action"]=="PlayGame") {
		$eventid=$_GET["eventId"];
		$rs = mysql_query("UPDATE events SET pausetime = pausetime + TIME_TO_SEC(TIMEDIFF(Now(),lastpause)), lastpause = NULL WHERE id = " . $eventid );
		$blnquery = false;
		$arr = array("Update with success");
	}

	if ($_GET["action"]=="PauseGame") {
		$eventid=$_GET["eventId"];
		$rs = mysql_query("UPDATE events SET lastpause = Now() WHERE id = " . $eventid );
		$blnquery = false;
		$arr = array("Update with success");
	}

	if ($_GET["action"]=="Reset") {
		$eventid=$_GET["eventId"];
		$rs = mysql_query("DELETE FROM pokerpoints WHERE id_event = " .  $eventid );
		$rs = mysql_query("DELETE FROM comments WHERE id_event = " .  $eventid );
		$rs = mysql_query("UPDATE events SET level=0, leveltime = NULL,  lastpause = NULL, pausetime =0, status =0  WHERE id = " . $eventid );
		$blnquery = false;
		$arr = array("Delete with success");
	}


	if ($_GET["action"]=="Changelevel") {
		$eventid=$_GET["eventId"];
		$followlevel=$_GET["followlevel"];
		$level = ($followlevel == 'next') ? "level = level + 1": "level = GREATEST(level - 1,0)";
		$rs = mysql_query("UPDATE events SET " . $level .", leveltime = Now(),  pausetime =0, status =1  WHERE id = " . $eventid );
		$blnquery = false;
		$arr = array("Update with success");
	}

	if ($_GET["action"]=="buyIn") {
		$eventid=$_GET["eventId"];
		$playerId=$_GET["playerId"];
		$buyin = 20;
		$str = "SELECT count(*)  FROM pokerpoints WHERE id_event = " . $eventid . " AND id_player =" . $playerId ;
		$rs = mysql_query($str);
		$row = mysql_fetch_row($rs);
		$nbrows = $row[0];

		if($nbrows==0) {
			$rs = mysql_query("INSERT INTO pokerpoints (id_event, id_player, buyin, notes, registerdate) VALUES ('$eventid', '$playerId', '$buyin', 'OK', now())");
		}else {
			$rs = mysql_query("UPDATE pokerpoints SET buyin = " . $buyin . ", notes ='OK' WHERE id_event = " . $eventid . " AND id_player =" . $playerId );
		}
	
		$blnquery = false;
		$arr = array("Update with success - ");
	}

	if ($_GET["action"]=="kicker") {
		$eventid=$_GET["eventId"];
		$playerId=$_GET["playerId"];
		$kickermanId=$_GET["kickermanId"];

		/*on calcule son rang */
		/***********************/

		$rs = mysql_query("SELECT count(*) as rank FROM pokerpoints WHERE id_event = " . $eventid ." AND buyin > 0 AND COALESCE(rank,0) < 1 ");
		$row = mysql_fetch_row($rs);
		$rank = $row[0];

		/*on calcule son score */
		/***********************/
		$rs = mysql_query("SELECT count(*) as nbplayer, sum(buyin) as pot FROM pokerpoints WHERE id_event = " . $eventid ." AND buyin > 0 ");
		$row2 = mysql_fetch_row($rs);
		$nbplayer = $row2[0];
		$pot = ($row2[1] *($nbplayer-1)/$nbplayer) * 0.85; /* hote gratuit + 15% pour le championnat */

		$rs = mysql_query("SELECT knockouts FROM pokerpoints WHERE id_event = " . $eventid . " AND id_player =" . $playerId );
		$row3 = mysql_fetch_row($rs);
		$knockouts = $row3[0];

		$score = 500*$nbplayer* pow(0.7, $rank)+100*$knockouts ;

		/*on calcule son argent */
		/***********************/

		$money = 0;
		switch ($rank) {
		    case 1:
		        $money = 5 * round($pot * 0.58/ 5); ;
		        break;
		    case 2:
		        $money = 5 * round($pot * 0.29/ 5); ;
		        break;
		    case 3:
		        $money = 5 * round($pot * 0.13/ 5); ;
		        break;
		}			


		/*on effectue la mise à jour */
		/***********************/
		$rs = mysql_query("UPDATE pokerpoints SET rank = " . $rank . ", tournamentpts =  " . $score . ", payout= " . $money . ", kickermanId = " . $kickermanId . " WHERE id_event = " . $eventid . " AND id_player =" . $playerId );


		/*on calcule le nombre de kill pour ce kickerman et on met à jour */
		/***********************/
		if ($kickermanId !==$playerId) {
			$rs = mysql_query("UPDATE pokerpoints SET knockouts = COALESCE(knockouts,0)+1 WHERE id_event = " . $eventid . " AND id_player =" . $kickermanId );
		}

		$blnquery = false;
		$arr = $row;
	}




	if ($blnquery) {
		while($obj = mysql_fetch_object($rs)) {
			$arr[] = $obj;
		}
	}
	echo json_encode($arr,JSON_NUMERIC_CHECK);

	mysql_close(); 
}

?>