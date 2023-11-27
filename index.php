<?php
	// error_reporting(E_ALL);
	// ini_set("display_errors", 1);
	date_default_timezone_set('Asia/Seoul');
	$json = array();
	$json = $_REQUEST;
	
	
	header('Access-Control-Allow-Origin: *');
	include_once "GUGASMS/action.php"; //거가대교
?>