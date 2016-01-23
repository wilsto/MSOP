<?php
require('conf.php');
session_destroy();
setcookie('auth', '', time() - 3600, '/', 'localhost', false, true);
 header('Location: http://'.$_SERVER['HTTP_HOST'].'/mypokerleague');
?>