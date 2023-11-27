<?php
	$Root = $_SERVER["DOCUMENT_ROOT"];
	include_once('vendor/autoloader_register.php');
	$dir = $Root.'/GUGASMS/';
	$DirInc = $Root.'/inc';
	$DirApp = $dir.'app';
	$MVC = $dir.'mvc';

	$autoloader = new AutoLoaderRegister([$MVC,$DirInc,$DirApp]);
	$app = new App($json,$dir);
?>