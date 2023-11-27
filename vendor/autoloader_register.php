<?php
	include_once($Root.'/vendor/autoloader.php');
	class AutoLoaderRegister{
		function __construct($folder){
			for($i=0;$i<count($folder);$i++){
				new auto_loader($folder[$i]);
			}
		}
	}
?>