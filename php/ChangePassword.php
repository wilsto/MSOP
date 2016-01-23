<?php
require 'conf.php';
$error = false;
if (!empty($_POST)) {
  $user = $db->row('SELECT id, username, password FROM users WHERE id=:userId AND password=:password', array(
    'userId' => $_POST['userId'],
    'password' => md5($_POST['oldpassword'])
    ));

  if($user){
    $newpassword = $_POST['newpassword'];
    $newpassword2 = $_POST['newpassword2'];
    if ($newpassword===$newpassword2 && isset($newpassword) && !empty($newpassword)){

  mysql_connect('localhost','root',''); 
  mysql_select_db('mypokerleague'); 
  setlocale(LC_ALL, 'fr_FR');
  mysql_query("SET @@lc_time_names = 'fr_FR'");
  mysql_query("SET character_set_results = 'utf8', character_set_client = 'utf8', character_set_connection = 'utf8', character_set_database = 'utf8', character_set_server = 'utf8'");


    $sql = 'UPDATE users SET password = "' .md5($newpassword) . '" WHERE id='.$_POST['userId'];
    $rs = mysql_query($sql);
      echo "Mot de passe modifié" ;
    } else {
      echo "Erreur : Le nouveau mot de passe et sa confirmation sont différents ou vides.";
    }
  }else{
   echo "Erreur : Le mot de passe actuel est incorrect";
 }
}
?>


