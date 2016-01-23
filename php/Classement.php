<?php 
	
mysql_connect('localhost','root',''); 
mysql_select_db('mypokerleague'); 
	setlocale(LC_ALL, 'fr_FR');
    mysql_query("SET @@lc_time_names = 'fr_FR'");
	mysql_query("SET character_set_results = 'utf8', character_set_client = 'utf8', character_set_connection = 'utf8', character_set_database = 'utf8', character_set_server = 'utf8'");

$arr = array();
 
$activeseason=$_GET["activeseason"];
$rs = mysql_query("SELECT u.id, u.username, u.avatar, sum(tournamentpts) as totalpts , count(tournamentpts) as nbtournois, sum(knockouts) as knockouts , sum(payout) as payout 
	FROM users as u 
	LEFT JOIN pokerpoints as p on u.id = p.id_player 
	RIGHT JOIN events as ev ON ev.id = p.id_event and ev.season=" . $activeseason . " 
	GROUP BY u.id
	ORDER BY totalpts DESC");
 
while($obj = mysql_fetch_object($rs)) {
$arr[] = $obj;
}
echo json_encode($arr,JSON_NUMERIC_CHECK);

mysql_close(); 
/*
//The json object is :
{"members":[{"id":"1","title":"Mr","firstname":"Peter","surname":"Ventouris"},{"id":"2","title":"Mr","firstname":"David","surname":"Dabel"},{"id":"3","title":"Mr","firstname":"John","surname":"Merkel"},{"id":"4","title":"Mr","firstname":"James","surname":"Eltons"}]}
*/

?>