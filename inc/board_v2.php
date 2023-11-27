<?php
	class board_v2 extends db{
		private $intStart;
		private $intEnd;
		private $page;
		private $page_size;
		private $page_count;
		private $select_str;
		private $from_str;
		private $where_str;
		private $search;
		private $idx;
		private $range_str;
		private $l_pagecount;
        private $page_name;
        private $param;
		private $url;
		private $null_array;

		function __construct($database) {
			parent::__construct($database);
		}

		function init($array){
			$this->page_name = $array["page_name"];
			$this->idx=$array["idx"];
			$this->page_size=(int)$array["page_size"];
			$this->page_count=(int)$array["page_count"];
			$this->select_str=$array["select_str"];
			$this->from_str=$array["from_str"];
			$this->where_str=$array["where_str"];
            $this->range_str=$array["range_str"];
			$this->param = $array["param"];
			
			if(isset($array["null_array"])){
				$this->null_array = $array["null_array"];
			}

            if(isset($this->param[$this->page_name])){
				if($this->param[$this->page_name]==""){
					$this->page=1;
				}else{
					$this->page = (int)$this->param[$this->page_name];
				}
            }else{
                $this->page = 1;
            }

            //param 넘어오면 url로 모두 변경 

			foreach($this->param as $key => $value){
                if($key!=$this->page_name){
					$this->url[$key] = $value;
				}
			}
		
			$this->intStart = (int) ( ( $this->page - 1 ) / $this->page_count ) * $this->page_count + 1;
			$this->intEnd = (int)( ( ( $this->page - 1 ) + $this->page_count ) / $this->page_count ) * $this->page_count;
        }

		function getSql(){
			$result = "";
			$sql="select ".$this->select_str;
			$sql=$sql." from ".$this->from_str;
			$sql=$sql." where ".$this->where_str;
			$sql=$sql." ".$this->range_str;
			$sql=$sql." limit ".($this->page_size*($this->page-1)).",".$this->page_size;
			$sql_count = "select count(".$this->idx.") as total_count from ".$this->from_str." where ".$this->where_str;
			$result = $this->get_result($sql_count);
			if ($result->num_rows > 0) {
				while($row = $result->fetch_assoc()) {
					$total_count=$row["total_count"];
				}
				$result = $sql;
			} else {
				$total_count=0;
				$result = false;
			}
			
			$page_width = $this->page_size-1;
			$this->l_pagecount = (int)(($total_count+$page_width)/$this->page_size);
			return $result;
		}

		function row_num($count){
			$rownum = $this->page_size*($this->page-1)+($count+1);
			return $rownum;
		}
		
		function where($json){
			$search = "";
			if($json["allFlag"]==false){
				foreach($json["where"] as $key){
					$search = $search." ".$key["condition"]." ".$key["name"].$key["operation"].$key["value"];
				}
			}
			return $search;
		}

		function getPage(){
			$array = array(
				"firstBtn"=>null,
				"prevBtn"=>null,
				"number"=>array(
					"num"=>array(),
					"state"=>array()
				),
				"nextBtn"=>null,
				"lastBtn"=>null,
                "page"=>$this->page,
				"url"=>$this->url,
				"page_name"=>$this->page_name
			);

			$prev = $this->intStart;
			
			if ($prev > 1){
				$prev = $prev -1;
				$array["firstBtn"]=1;
				$array["prevBtn"]=$prev;

			}else{
				$array["firstBtn"]=0;
				$array["prevBtn"]=0;
			}

			for($intA=$this->intStart; $intA<=$this->intEnd; $intA++){
				if($intA == $this->page ){
					array_push($array["number"]["num"],$intA);
					array_push($array["number"]["state"],1);
				}else{
					array_push($array["number"]["num"],$intA);
					array_push($array["number"]["state"],0);
				}

				if ($intA >= $this->l_pagecount){
					break;
				}
			}

			if($this->intEnd < $this->l_pagecount){
				$this->intEnd = $this->intEnd + 1;
				
				$array["lastBtn"]=$this->l_pagecount;
				$array["nextBtn"]=$this->intEnd;

			}else{
				$array["nextBtn"]=0;
				$array["lastBtn"]=0;
			}

			return $array;
		}
	}
?>