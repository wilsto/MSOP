<?php
require 'db.class.php';
$db = new DB();
session_start();
if(isset($_COOKIE['auth']) && !isset($_SESSION['Auth'])){
    $auth = $_COOKIE['auth'];
    $auth = explode('-----', $auth);
    $user = $db->row('SELECT id, username, password FROM users WHERE id=:id', array('id' => $auth[0]));
    $key = sha1($user->username . $user->password);
    if($key == $auth[1]){
        $_SESSION['Auth'] = (array)$user;
        setcookie('auth', $user->id . '-----' . $key, time() + 3600 * 24 * 3, '/', 'localhost', false, true);
    }else{
        setcookie('auth', '', time() - 3600, '/', 'localhost', false, true);
    }
}