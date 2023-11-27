<?php
	class auto_loader{
		private $_filepath;
		function __construct($filepath){
			error_reporting(E_ALL);
			ini_set("display_errors", 1);
			$this->_filepath=$filepath;
			spl_autoload_register(array($this, 'load'));
		}

		public function load($class) {
			$ary = explode('\\',$class);
			$dir = $this->_filepath.'/'.$ary[(count($ary)-1)].'.php';
			if(file_exists($dir)){
				include_once $dir;
			}
		}
	}
?>