<?php 
require_once('PhpConsole.phar');

if(isset($_GET["action"])) {

	mysql_connect('localhost','root',''); 
	mysql_select_db('mypokerleague'); 
	setlocale(LC_ALL, 'fr_FR');
    mysql_query("SET @@lc_time_names = 'fr_FR'");
	mysql_query("SET character_set_results = 'utf8', character_set_client = 'utf8', character_set_connection = 'utf8', character_set_database = 'utf8', character_set_server = 'utf8'");

ini_set('display_errors',1);
error_reporting(E_ALL);

	$blnquery = true;

	$arr = array();

	if ($_GET["action"]=="TournamentList") {
		$activeseason=$_GET["activeseason"];
		$rs = mysql_query("SELECT ev.*, 
			ev.dates as date, monthname(ev.dates) as month, day(ev.dates) as day,ev.locid,l.venue as lieu, l.street, l.plz, l.city,l.locdescription, IF(ev.dates > Date(NOW()), 1, 0) as infutur, 
			count(p.id_player) as nbplayer
			FROM events as ev
			LEFT JOIN lieux  as l ON ev.locid = l.id
			LEFT JOIN pokerpoints  as p ON ev.id = p.id_event AND p.notes <>'NOK'
			WHERE ev.season=" . $activeseason . "
			GROUP BY ev.id
			ORDER BY ev.season, ev.episode
			");
	}

	if ($_GET["action"]=="Lieux") {
		$rs = mysql_query("SELECT * FROM lieux ");
	}


	if ($_GET["action"]=="Tournament") {

		if ($_GET["Info"]=="Details") {
		$rs = mysql_query("SELECT ev.*, 
			ev.dates as date, monthname(ev.dates) as month, day(ev.dates) as day,ev.locid, l.venue as lieu, l.street, l.plz, l.city, l.locdescription,IF(ev.dates > Date(NOW()), 1, 0) as infutur, 
			COALESCE(p.nbplayer,0) as nbplayer, COALESCE(p2.nbplayernok,0) as nbplayernok, ((SELECT count(id) from users WHERE Actif =1) - COALESCE(p.nbplayer,0) - COALESCE(p2.nbplayernok,0)) as nbuser
			FROM events as ev
			LEFT JOIN lieux  as l ON ev.locid = l.id
			LEFT JOIN (SELECT id_event, COALESCE(count(id_player),0) as nbplayer from pokerpoints WHERE (notes ='OK' OR tournamentpts>0) GROUP BY id_event) as p ON ev.id = p.id_event
			LEFT JOIN (SELECT id_event, COALESCE(count(id_player),0) as nbplayernok from pokerpoints WHERE notes ='NOK' GROUP BY id_event) as p2 ON ev.id = p2.id_event 
			WHERE ev.season = ". $_GET['season'] . " and ev.episode =" . $_GET['episode'] 
			);
		}

		if ($_GET["Info"]=="Players") {
			$eventid=$_GET["eventId"];
			$rs = mysql_query("SELECT u.username, u.id as id_user, p.*, COALESCE(p.rank,0) as rank, u.avatar
			FROM users as u
			LEFT JOIN pokerpoints as p ON u.id = p.id_player AND p.id_event = ". $eventid ."
			WHERE u.Actif = 1
			ORDER by p.notes desc, p.rank, u.username");
		}			

		if ($_GET["Info"]=="Players2") {
			$rs = mysql_query("SELECT p.*, u.*
			FROM pokerpoints as p
			LEFT JOIN users as u ON p.id_player = u.id
			RIGHT JOIN events   as ev ON ev.id = p.id_event AND ev.season = ". $_GET['season'] . " and ev.episode =" . $_GET['episode']  . "
			WHERE p.notes <>'NOK' 
			ORDER by p.rank");
		}


		if ($_GET["Info"]=="addPlayer") {
			$eventid=$_GET["eventId"];
			$playerId=$_GET["playerId"];
			$notes=$_GET["Presence"];
			$rs = mysql_query("DELETE FROM pokerpoints WHERE id_event= " . $eventid . " and id_player = " . $playerId);
			$rs = mysql_query("INSERT INTO pokerpoints (id_event, id_player, notes, registerdate) VALUES ('$eventid','$playerId','$notes',now())");
			$blnquery = false;
			$arr = array("Insert with success");
		}


		if ($_GET["Info"]=="saveTournoi") {
			$eventid=$_GET["episode"];
			$seasonid=$_GET["season"];

			$postdata = file_get_contents("php://input");
			$request = json_decode($postdata);

			$sql = "UPDATE events SET locid = ". $request->locid   .", dates = '" . date('Y-m-d', strtotime($request->date)) . "' WHERE episode= " . $eventid . " and season = " . $seasonid;
			var_dump($sql);
			$rs = mysql_query($sql) or trigger_error(mysql_error()." ".$sql);
			$blnquery = false;
			$arr = array("Insert with success");
		}
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