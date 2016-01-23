<?php 

if(isset($_GET["action"])) {

	mysql_connect('localhost','root',''); 
	mysql_select_db('mypokerleague'); 
	setlocale(LC_ALL, 'fr_FR');

	$blnquery = true;

	$arr = array();

	/*********************************/
	/* Lister tous les commentaires */
	/*********************************/

	if ($_GET["action"]=="ListComment") {
		$eventid=$_GET["eventId"];
		$rs = mysql_query("SELECT c.*, u.username
			FROM comments as c
			left join users as u ON c.id_user = u.id
			WHERE c.id_event = ". $eventid . "
			ORDER BY c.time DESC
			");
	}

	/*********************************/
	/* Ajouter tous les commentaires */
	/*********************************/

	if ($_GET["action"]=="Add") {
		$blnquery = false;

		/* Supprimer tous les commentaires */
		if ($_GET["Info"]=="OnePost") {
			$eventid=$_GET["eventId"];
			$userId=$_GET["userId"];
			$details=$_GET["details"];
			$rs = mysql_query("INSERT INTO comments (id_event, id_user, details, time) VALUES ('$eventid','$userId','$details',now())");
			$arr = array("Insert with success");
		}
	}

	/*********************************/
	/* Supprimer tous les commentaires */
	/*********************************/

	if ($_GET["action"]=="Delete") {
		$blnquery = false;

		/* Supprimer tous les commentaires */
		if ($_GET["Info"]=="ResetAll") {
			$eventid=$_GET["eventId"];
			$rs = mysql_query("DELETE FROM comments WHERE id_event= " . $eventid);
			$arr = array("Delete with success");
		}

		/* Supprimer un commentaire */
		if ($_GET["Info"]=="OnePost") {
			$commentId=$_GET["commentId"];
			$rs = mysql_query("DELETE FROM comments WHERE id= " . $commentId );
			$arr = array("Delete with success");
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