<?php
require 'conf.php';
$error = false;
if (!empty($_POST)) {
    $user = $db->row('SELECT id, username, password FROM users WHERE username=:username AND password=:password', array(
        'username' => $_POST['username'],
        'password' => md5($_POST['password'])
    ));
    
    if($user){
        $_SESSION['Auth'] = (array)$user;
        setcookie('auth', $user->id . '-----' . sha1($user->username . $user->password), time() + 3600 * 24 * 3, '/', 'localhost', false, true);


        mysql_connect('localhost','root',''); 
        mysql_select_db('mypokerleague'); 
        setlocale(LC_ALL, 'fr_FR');
        mysql_query("SET @@lc_time_names = 'fr_FR'");
        mysql_query("SET character_set_results = 'utf8', character_set_client = 'utf8', character_set_connection = 'utf8', character_set_database = 'utf8', character_set_server = 'utf8'");
        $sql = 'UPDATE users SET lastvisitDate = Now() WHERE id='.$user->id;
        $rs = mysql_query($sql);
        header('Location: http://'.$_SERVER['HTTP_HOST'].'/mypokerleague/#/login');
    }else{
        $error = true;
    }
}
?>
          <h4 class="modal-title" id="myModalLabel">Se connecter</h4>

          <form style="margin: 0px" accept-charset="UTF-8" action="login.php" method="post">
           <div style="margin:0;padding:0;display:inline">
             <input name="utf8" type="hidden" value="&#x2713;" />
             <input name="authenticity_token" type="hidden" value="4L/A2ZMYkhTD3IiNDMTuB/fhPRvyCNGEsaZocUUpw40=" /></div>
             <fieldset class='textbox loginset'>
               Identifiant&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="text" placeholder="Identifiant" name="username"  /><br>
               Mot de passe &nbsp;&nbsp;&nbsp;<input style="margin-top: 18px" type="password" placeholder="Mot de passe" name="password" /><br>
               <input  style="margin-top: 18px" class="btn btn-primary" name="commit" type="submit" value="Se connecter" />
             </fieldset>
           </form>
         </div>

<div class="panel2">

    <a class="btn" href="/mypokerleague">Retourner à l'accueil</a>

</div>
<!--
      
<p>
<a  class="btn btn-primary social-login-btn social-facebook" href="/auth/facebook"><i class="fa fa-facebook"></i></a>
<a class="btn btn-primary social-login-btn social-twitter" href="/auth/twitter"><i class="fa fa-twitter"></i></a>
</p>
<p>
<a class="btn btn-primary social-login-btn social-linkedin" href="/auth/linkedin"><i class="fa fa-linkedin"></i></a>
<a class="btn btn-primary social-login-btn social-google" href="/auth/google"><i class="fa fa-google-plus"></i></a>
</p>

<br><br>

		    <small class="text-muted">Or sign in with [your service]</small>
		    <br><br>

   <form class="form-signin" method="post" action="php/login.php">
      <small class="text-muted">Renseigner votre nom (Pseudo) et votre mot de passe pour vous connecter</small><br><br>
              <?php if ($error): ?>
            <div class="alert alert-error">
                Identifiants Incorrects
            </div>
        <?php endif ?>
      <input class="ember-view ember-text-field form-control login-input" placeholder="Identifiant" name="username" type="text">
      <input class="ember-view ember-text-field form-control login-input-pass" placeholder="Mot de passe" name="password" type="password">

      <button class="btn btn-lg btn-primary btn-block btn-center" type="submit" >Se connecter</button>
      <br> <br> <br>
      <small class="create-account text-muted">Pas encore membre ?&nbsp;&nbsp;&nbsp;&nbsp;<button id="ember363" class="ember-view btn btn-sm btn-default"> Me créer un compte </button> </small>
    </form>

  

        <div class="span6">
            <h4>Contenu de la session $_SESSION</h4>
            <?= var_dump($_SESSION); ?>
        </div>
        <div class="span6">
            <h4>Contenu du COOKIE $_COOKIE</h4>
            <?= var_dump($_COOKIE); ?>
        </div>
       -->

