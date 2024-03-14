<?php
    class AddrModel extends gf{
        private $json;
        private $dir;
        private $version;
        private $conn;

        function __construct($init_object){
            $this->param = $init_object["json"];
            $this->dir = $init_object["dir"];
            $this->version = $init_object["version"];
            $this->conn = $init_object["db"];
            $this->result = array(
                "result" => null,
                "error_code" => null,
                "message" => null,  
                "value" => null,
            );
        }

        /********************************************************************* 
        // 함 수 : empty 체크
        // 설 명 : array("id","pw")
        // 만든이: 안정환
        *********************************************************************/
        function value_check($check_value_array){
            $object = array(
                "param"=>$this->param,
                "array"=>$check_value_array
            );
            $check_result = $this->empty_check($object);
            if($check_result["result"]){//param 값 체크 비어있으면 실행 안함
                if($check_result["value_empty"]){//필수 값이 비었을 경우
                    $this->result["result"]="0";
                    $this->result["error_code"]="101";
                    $this->result["message"]=$check_result["value_key"]."가 비어있습니다.";
                    return false;
                }else{
                    return true;
                }
            }else{
                $this->result["result"]="0";
                $this->result["error_code"]="100";
                $this->result["message"]=$check_result["value"]." 가 없습니다.";
                return false;
            }
        }

        /********************************************************************* 
        // 함 수 : addr_group_list()
        // 설 명 : 주소록 그룹 리스트
        // 만든이 : 최진혁
        *********************************************************************/
        function addr_group_list(){
            $param = $this->param;

            $sql = "select * from addr_group order by idx asc ";

            $result = $this->conn->db_select($sql);
            if($result["result"] == 1){
                $this->result = $result;
            }else{
                $this->result = $result;
            }
            
            echo $this->jsonEncode($this->result);
        }

        function product_list(){
            $param = $this->param;

            $sql = "select * from its_mat_temp where user_id = ".$param["idx"]." order by incom_id asc";

            $result = $this->conn->db_select($sql);
            if($result["result"] == 1){
                $this->result = $result;
            }else{
                $this->result = $result;
            }
            
            echo $this->jsonEncode($this->result);
        }


        /********************************************************************* 
        // 함 수 : add_group()
        // 설 명 : 주소록 그룹 추가
        // 만든이 : 최진혁
        *********************************************************************/
        function add_group(){
            $param = $this->param;
            if($this->value_check(array("group_name"))){
                $sql ="insert into addr_group(group_name, content, regdate) values (";
                $sql = $sql . $this->null_check($param["group_name"]). " , ";
                if($param["group_content"] != ""){
                    $sql = $sql . $this->null_check($param["group_content"]). " , ";
                }else{
                    $sql = $sql . "'null' , ";
                }
                $sql = $sql . " now() ";
                $sql = $sql . ")";

                $result = $this->conn->db_insert($sql);
                if($result["result"] == 1){
                    $this->result = $result;
                }else{
                    $this->result = $result;
                }
            }
            echo $this->jsonEncode($this->result);
        }

        /********************************************************************* 
        // 함 수 : update_group()
        // 설 명 : 주소록 그룹 수정
        // 만든이 : 최진혁
        *********************************************************************/
        function update_group(){
            $param = $this->param;
            if($this->value_check(array("group_name", "group_idx"))){
                $sql = "update addr_group set ";
                $sql = $sql . "group_name = " . $this->null_check($param["group_name"]) . " , ";
                $sql = $sql . "update_date = now() , ";
                if($param["group_content"] != ""){
                    $sql = $sql . "content = ".$this->null_check($param["group_content"])." ";
                }else{
                    $sql = $sql . "content = 'null' ";   
                }
                $sql = $sql . "where idx= ".$param["group_idx"]."";
               
                $result = $this->conn->db_update($sql);
                if($result["result"] == 1){
                    $this->result = $result;
                }else{
                    $this->result = $result;
                }
            }
            echo $this->jsonEncode($this->result);
        }

        /********************************************************************* 
        // 함 수 : addr_group_detail()
        // 설 명 : 주소록 그룹 추가
        // 만든이 : 최진혁
        *********************************************************************/
        function addr_group_detail(){
            $param = $this->param;
            if($this->value_check(array("group_idx"))){
                $sql = "select * from addr_group where idx = ".$param["group_idx"]."";

                $result = $this->conn->db_select($sql);
                if($result["result"] == 1){
                    $this->result = $result;
                }else{
                    $this->result = $result;
                }
            }
            echo $this->jsonEncode($this->result);
        }
        /********************************************************************* 
        // 함 수 : addr_group_delete()
        // 설 명 : 주소록 그룹 삭제
        // 만든이 : 최진혁
        *********************************************************************/
        function addr_group_delete(){
            $param = $this->param;
            if($this->value_check(array("group_idx"))){
                $sql = "delete from addr_group  where idx = ".$param["group_idx"]. " ";

                $result = $this->conn->db_delete($sql);
                if($result["result"] == 1){
                    $sql = "delete from addr_list where group_idx =".$param["group_idx"]."";

                    $result = $this->conn->db_delete($sql);
                    if($result["result"] ==0){
                        $this->result = $result;
                    }else{
                        $this->result = $result;    
                    }
                }else{
                    $this->result = $result;
                }
            }
            echo $this->jsonEncode($this->result);
        }
        /********************************************************************* 
        // 함 수 : addr_list()
        // 설 명 : 주소록 번호 리스트
        // 만든이 : 최진혁
        *********************************************************************/
        function addr_list(){
            $param = $this->param;
            if($this->value_check(array("group_idx"))){
                $sql = "select * from addr_list where ";
                if($param["search_name"] != ""){
                    if($param["search_phone_number"] != ""){
                        $sql = $sql . " ( ";
                    }
                    $sql = $sql . "  name like '%".$param["search_name"]."%' ";
                }
                if($param["search_phone_number"] != ""){
                    if($param["search_name"] != ""){
                        $sql = $sql . " or ";
                    }else{
                        $sql = $sql . "(";
                    }
                    $sql = $sql . "  phone_number like '%".$param["search_phone_number"]."%' ) ";
                }
                if($param["search_name"] != "" || $param["search_phone_number"] != ""){
                    $sql = $sql . " and ";    
                }
                $sql = $sql . "  group_idx = ".$param["group_idx"]." ";
                
                
                $result = $this->conn->db_select($sql);
                if($result["result"] == 1){
                    $this->result = $result;
                }else{
                    $this->result = $result;
                }
            }
            echo $this->jsonEncode($this->result);
        }

        /********************************************************************* 
        // 함 수 : add_addr()
        // 설 명 : 주소록 번호 추가
        // 만든이 : 최진혁
        *********************************************************************/
	function its_add_product() {
		   	$param = $this->param;
	    // SQL statement to insert data into the mat_register table
		    	$sql = "insert into its_mat_temp (
        	        user_id, group_id, mat_in_code, mat_in_place, bc_in_b_class, bc_in_s_class, 
                	mat_in_name, mat_in_stand, mat_in_maker, mat_in_custom, mat_in_union, mat_in_price, 
	                mat_in_amount,mat_in_sum
		        	) values (";

            // Append values from $param, using null_check for optional fields
                    $sql .= $this->null_check($param["user_id"]) . ", ";
                    $sql .= $this->null_check($param["group_id"]) . ", ";
                    $sql .= $this->null_check($param["mat_in_code"]) . ", ";
                    $sql .= $this->null_check($param["mat_in_place"]) . ", ";
                    $sql .= $this->null_check($param["bc_in_b_class"]) . ", ";
                    $sql .= $this->null_check($param["bc_in_s_class"]) . ", ";
                    $sql .= $this->null_check($param["mat_in_name"]) . ", ";
                    $sql .= $this->null_check($param["mat_in_stand"]) . ", ";
                    $sql .= $this->null_check($param["mat_in_maker"]) . ", ";
                    $sql .= $this->null_check($param["mat_in_custom"]) . ", ";
                    $sql .= $this->null_check($param["mat_in_union"]) . ", ";
                    $sql .= $this->null_check($param["mat_in_price"]) . ", ";
                    $sql .= $this->null_check($param["mat_in_amount"]) . ", ";
                    $sql .= $this->null_check($param["mat_in_sum"]);
                    // $sql .= $this->null_check($param["mat_image"]);
                    $sql .= ")";

                // Execute the query
                    $result = $this->conn->db_insert($sql);
                    if($result["result"] == 1){
                        $this->result = $result;
                    }else{
                        $this->result["result"] = 0;
                    }
                    
                echo $this->jsonEncode($this->result);
}

function its_add_product_real() {
    $param = $this->param;
// SQL statement to insert data into the mat_register table
     $sql = "insert into its_mat_coming (
         user_id, group_id, mat_in_code, mat_in_place, bc_in_b_class, bc_in_s_class, 
         mat_in_name, mat_in_stand, mat_in_maker, mat_in_custom, mat_in_union, mat_in_price, 
         mat_in_amount,mat_in_sum
         ) values (";

 // Append values from $param, using null_check for optional fields
         $sql .= $this->null_check($param["user_id"]) . ", ";
         $sql .= $this->null_check($param["group_id"]) . ", ";
         $sql .= $this->null_check($param["mat_in_code"]) . ", ";
         $sql .= $this->null_check($param["mat_in_place"]) . ", ";
         $sql .= $this->null_check($param["bc_in_b_class"]) . ", ";
         $sql .= $this->null_check($param["bc_in_s_class"]) . ", ";
         $sql .= $this->null_check($param["mat_in_name"]) . ", ";
         $sql .= $this->null_check($param["mat_in_stand"]) . ", ";
         $sql .= $this->null_check($param["mat_in_maker"]) . ", ";
         $sql .= $this->null_check($param["mat_in_custom"]) . ", ";
         $sql .= $this->null_check($param["mat_in_union"]) . ", ";
         $sql .= $this->null_check($param["mat_in_price"]) . ", ";
         $sql .= $this->null_check($param["mat_in_amount"]) . ", ";
         $sql .= $this->null_check($param["mat_in_sum"]);
         // $sql .= $this->null_check($param["mat_image"]);
         $sql .= ")";

     // Execute the query
     if($sql == ""){
        $this->result["result"] = "sql에 아무것도 없음.";
    }else{
             $result = $this->conn->db_insert($sql);
             if($result["result"] == 1){
                 $this->result = $result;
             }else{
                 $this->result["result"] = 0;
             }
            }
         
     echo $this->jsonEncode($this->result);
}

function products_real(){
    $param = $this->param;
    if($this->value_check(array("target_idx"))){
        $param["target_idx"] = json_decode($param["target_idx"], true);
        $target = $param["target_idx"];
        // $this->result = $sql;
        if(count($target) == 0){
            $this->result["result"] = 0;
            $this->result["error_code"] = "200";
            $this->result["message"] = "선택된 사용자가 없습니다.";
            $this->result["value"] = $target.$param["target_idx"];
        }else{
            $sql = "select * from its_mat_temp ";
            for($i = 0; $i<count($target); $i++){
                if(count($target) == 1){
                    $sql = $sql . "where incom_id = ".$target[$i]."";
                }else{
                    if($i == 0){
                        $sql = $sql . "where incom_id in ( ".$target[$i]." , ";
                    }else if ($i == (count($target) -1)){
                        $sql = $sql . " ".$target[$i]."  ) ";
                    }else{
                        $sql = $sql . " ".$target[$i].", ";
                    }
                }
            }
            
            if($sql == ""){
                $this->result["result"] = "sql에 아무것도 없음.";
            }else{
                $select_result = $this->conn->db_select($sql);
                if($select_result["result"] == 0){
                    $this->result = $select_result;
                }else{
                    $this->result = $select_result;
                    $this->result["total"] = count($select_result["value"]);
                }
            }
        }
    }
    echo json_encode($this->result,JSON_UNESCAPED_UNICODE);
}

        /********************************************************************* 
        // 함 수 : addr_add_excel()g
        // 설 명 : 주소록 번호 추가 (엑셀 등록)
        // 만든이 : 최진혁
        *********************************************************************/
        function addr_add_excel(){
            $param = $this->param;
            if($this->value_check(array("group_idx","name","phone"))){
                $param["name"] = json_decode($param["name"], true);
                $param["phone"] = json_decode ($param["phone"], true);
                $param["phone"] = json_decode ($param["mat_in_amount"], true);
                $param["phone"] = json_decode ($param["mat_in_sum"], true);
                $param["phone"] = json_decode ($param["mat_in_union"], true);

                
                $sql = "insert into its_mat_coming (group_id, mat_in_name, mat_in_price, mat_in_amount, mat_in_sum, mat_in_union) values ";
                for($i = 0; $i<count($param["name"]); $i++){
                    $sql = $sql . "( ";
                    $sql = $sql . $param["group_idx"] . ", ";
                    $sql = $sql . $this->null_check($param["name"][$i]) . ", ";
                    $sql = $sql . $this->null_check($param["phone"][$i]) . ", ";
                    $sql = $sql . $this->null_check($param["mat_in_amount"][$i]) . ", ";
                    $sql = $sql . $this->null_check($param["mat_in_sum"][$i]) . ", ";
                    $sql = $sql . $this->null_check($param["mat_in_union"][$i]);
                    if(count($param["name"]) == 1){
                        $sql = $sql . ")";
                    }else{
                        if($i == (count($param["name"]) -1)){
                            $sql = $sql . " )";
                        }else{
                            $sql = $sql . "),";
                        }
                    }
                }
                
                $this->conn->s_transaction();
                $result = $this->conn->db_insert($sql);
                if($result["result"] == 1){
                    $sql = "select mat_in_sum, mat_in_name, mat_in_price, mat_in_amount from its_mat_coming ";
                    $sql = $sql . "where group_id = ".$param["group_idx"]."";

                    $result = $this->conn->db_select($sql);
                    if($result["result"] == 1){
                        $this->conn->commit();
                        $this->result = $result;
                    }else{
                        $this->conn->rollback();
                        $this->result = $result;
                    }
                }else{
                    $this->result = $result;
                }
            }
            echo $this->jsonEncode($this->result);
        }

        
        /********************************************************************* 
        // 함 수 : addr_del()
        // 설 명 : 주소록 번호 선택 삭제
        // 만든이 : 최진혁
        *********************************************************************/
        function addr_sel_del(){
            $param = $this->param;
            if($this->value_check(array("addr_idx"))){
                $param["addr_idx"] = json_decode($param["addr_idx"],true);
                $target = $param["addr_idx"];
                if(count($param["addr_idx"]) != 0){
                    $sql = "delete from its_mat_temp ";
                    for($i = 0; $i<count($target); $i++){
                        if(count($target) == 1){
                            $sql = $sql . "where incom_id = ".$target[$i]."";
                        }else{
                            if($i == 0){
                                $sql = $sql . "where incom_id in ( ".$target[$i]." , ";
                            }else if ($i == (count($target) -1)){
                                $sql = $sql . " ".$target[$i]."  ) ";
                            }else{
                                $sql = $sql . " ".$target[$i].", ";
                            }
                        }
                    }

                    $result = $this->conn->db_delete($sql);
                    if($result["result"] == 1){
                        $this->result = $result;
                    }else{
                        $this->result = $result;
                    }
                }else{
                    $this->result["result"] = 0;
                    $this->result["error_code"] = "620";
                    $this->result["message"] = "선택된 리스트가 없습니다.";
                }
            }
            echo $this->jsonEncode($this->result);
        }

        /********************************************************************* 
        // 함 수 : addr_all_del()
        // 설 명 : 주소록 번호 전체 삭제
        // 만든이 : 최진혁
        *********************************************************************/
        function addr_all_del(){
            $param = $this->param;
            if($this->value_check(array("group_idx"))){
                $sql = "delete from addr_list where group_idx = ".$param["group_idx"]."";

                $result = $this->conn->db_delete($sql);
                if($result["result"] == 1){
                    $this->result = $result;
                }else{
                    $this->result = $result;
                }
            }
            echo $this->jsonEncode($this->result);
        }

         /********************************************************************* 
        // 함 수 : receiver_addr_list()
        // 설 명 : 메인화면 주소록 수신자 등록
        // 만든이 : 최진혁
        *********************************************************************/
        function receiver_addr_list(){
            $param = $this->param;
            if($this->value_check(array("group_idx"))){
                $param["group_idx"] = json_decode($param["group_idx"] , true);

                $sql = "select name, phone_number from addr_list where ";
                for($i = 0; $i<count($param["group_idx"]); $i++){
                    if(count($param["group_idx"])==1){
                        $sql = $sql . " group_idx = ".$param["group_idx"][$i]." ";
                    }else{
                        if($i == 0){
                            $sql = $sql . " group_idx in ( ".$param["group_idx"][$i]." , ";
                        }else if($i == (count($param["group_idx"]) -1 ) ){
                            $sql = $sql . "" . $param["group_idx"][$i] . " ) ";
                        }else{
                            $sql = $sql . "" . $param["group_idx"][$i] . " , ";
                        }
                    }
                }
                if(isset($param["search_name"])){
                    if($param["search_name"] != ""){
                        $sql = $sql . " and name like '%" . $param["search_name"] . "%' ";
                    }
                }

                $result = $this->conn->db_select($sql);
                
                if($result["result"] == 1){
                    $this->result = $result;
                }else{
                    $this->result = $result;
                }
            }
            echo $this->jsonEncode($this->result);
        }



    }
?>