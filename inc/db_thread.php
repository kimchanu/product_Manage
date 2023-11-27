<?php
    class db_thread extends Threaded{
		private static $db_singleton;
        private $conn;
		public static function getInstance(){
			if(!isset(db_thread::$db_singleton)) {
				db_thread::$db_singleton = new Singleton();
			}

			return db_thread::$db_singleton;
        }
        
        function conn(){
            return $this->conn;
        }

		function __construct($db_name) {  
            $this->conn = new \mysqli('aaxs8ayejm61a6.chybjdkq1wut.ap-northeast-2.rds.amazonaws.com', 'lbcontents', 'lbcontents12#', $db_name);
        }
        
        function get_result(){
			$result = $this->conn->query($sql);
		}

		function __destruct() {  
        	//echo "소멸";  
	    }
	}
?>