<?php
	class db{
		private $conn;
		
		//생성자 db생성
		private $dataBase;
		function __construct($dataBase){
			// Create connection
			$this->dataBase = $dataBase;
			// $this->conn = new \mysqli('13.209.181.9', 'sampleUser', '1234', $dataBase);
			// $this->conn = new \mysqli('15.165.94.122', 'sampleUser', '1234', $dataBase);
			// $this->conn = new \mysqli('127.0.0.1', 'root', 'guga!%2019', $dataBase);
			// $this->conn = new \mysqli('10.12.14.150', 'gugasms', 'guga!%2019', $dataBase);
			$this->conn = new \mysqli('10.12.14.150', 'gugasms', 'guga!%2019', $dataBase);
      // Check connection
			if ($this->conn->connect_error) {
				die("데이터베이스 연결실패: " . $this->conn->connect_error);
			}
		}

		function get_result($sql){
			$result = $this->conn->query($sql);
			return $result;
		}

		function get_query($sql){//최종본 에러코드와 함께 전달
			$result = $this->conn->query($sql);
			$array = array(
				"error_code"=>$this->conn->errno,
				"error_msg"=>$this->conn->error,
				"result"=>$result
			);
			return $array;
		}

		public function get_conn(){
			return $this->conn;
		}

		public function s_transaction(){
			$this->conn->query("start transaction");
		}

		public function commit(){
			$this->conn->query("commit");
		}

		public function begin(){
			$this->conn->query("begin");
		}

		public function rollback(){
			$this->conn->query("rollback");
		}

		public function close(){//fianl 변경 불가능
			$this->conn->close();
		}
	}
?>