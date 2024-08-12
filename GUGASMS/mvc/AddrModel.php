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
        // 함 수 : product_list
        // 설 명 : 잡자재 입고, 출고, 현황 list
        // 만든이 : 김찬우
        *********************************************************************/
        function now_list(){
            $param = $this->param;
            $sql = "
            SELECT 
                m.incom_id,
                m.mat_in_code,
                m.mat_in_name,
                m.mat_in_stand,
                m.mat_in_price,
                COALESCE(i.total_input_amount, 0) - COALESCE(o.total_output_amount, 0) AS mat_in_amount,
                (COALESCE(i.total_input_amount, 0) - COALESCE(o.total_output_amount, 0)) * 
                CAST(REPLACE(REPLACE(m.mat_in_price, ',', ''), ' ', '') AS DECIMAL(15, 2)) AS mat_in_sum
            FROM 
                its_mat_coming m
            LEFT JOIN 
                (
                    SELECT 
                        incom_id,
                        SUM(COALESCE(amount, 0) + COALESCE(carry_over, 0)) AS total_input_amount
                    FROM 
                        its_input
                    GROUP BY 
                        incom_id
                ) i ON m.incom_id = i.incom_id
            LEFT JOIN 
                (
                    SELECT 
                        incom_id,
                        SUM(COALESCE(amount, 0) + COALESCE(carry_over, 0)) AS total_output_amount
                    FROM 
                        its_output
                    GROUP BY 
                        incom_id
                ) o ON m.incom_id = o.incom_id
            WHERE 
                COALESCE(i.total_input_amount, 0) - COALESCE(o.total_output_amount, 0) >= " . $param["mat_in_amount"];
            
            if (!empty($param["mat_in_code"])) {
                $sql .= " AND m.mat_in_code LIKE '%" . $param["mat_in_code"] . "%'";
            }
            
            if (!empty($param["mat_in_name"])) {
                $sql .= " AND m.mat_in_name LIKE '%" . $param["mat_in_name"] . "%'";
            }
            
            if (!empty($param["mat_in_stand"])) {
                $sql .= " AND m.mat_in_stand LIKE '%" . $param["mat_in_stand"] . "%'";
            }
            
            $sql .= "
            ORDER BY 
                m.incom_id DESC;";


            $result = $this->conn->db_select($sql);
            if($result["result"] == 1){
                $this->result = $result;
            }else{
                $this->result = $result;
            }
            
            echo $this->jsonEncode($this->result);
        }

        function product_list2(){
            $param = $this->param;
            $startDate = $param['startDate'];
            $endDate = $param['endDate'];

            // Ensure dates are properly formatted for SQL query
            $startDate = date('Y-m-d', strtotime($startDate . '-01'));
            $endDate = date('Y-m-t', strtotime($endDate . '-01'));
            $sql = "SELECT 
            *,
            (COALESCE(o.amount, 0) + COALESCE(o.carry_over, 0)) AS mat_in_amount,
            (COALESCE(o.amount, 0) + COALESCE(o.carry_over, 0)) * CAST(REPLACE(REPLACE(m.mat_in_price, ',', ''), ' ', '') AS DECIMAL(15, 2)) AS mat_in_sum
        FROM 
            its_mat_coming m
        LEFT JOIN 
            its_output o ON m.incom_id = o.incom_id
        WHERE 
            o.date BETWEEN '$startDate' AND '$endDate' 
        ORDER BY 
            m.incom_id DESC";

            $result = $this->conn->db_select($sql);
            
            if($result["result"] == 1){
                $this->result = $result;
            }else{
                $this->result = $result;
            }
            
            echo $this->jsonEncode($this->result);
        }

        
        function search_list(){
            $param = $this->param;
            $sql = "SELECT 
            *,
            i.date AS input_date,
            (COALESCE(i.amount, 0) + COALESCE(i.carry_over, 0)) AS mat_in_amount,
            (COALESCE(i.amount, 0) + COALESCE(i.carry_over, 0)) * CAST(REPLACE(REPLACE(m.mat_in_price, ',', ''), ' ', '') AS DECIMAL(15, 2)) AS mat_in_sum
            
        FROM 
            its_mat_coming m
        LEFT JOIN 
            its_input i ON m.incom_id = i.incom_id
        WHERE 
            m.group_id = " . $param["idx"] . " AND
            m.mat_in_code LIKE '%" . $param["mat_in_code"] . "%'
        ORDER BY 
            m.incom_id DESC";
            $result = $this->conn->db_select($sql);
            
            if($result["result"] == 1){
                $this->result = $result;
            }else{
                $this->result = $result;
            }
            
            echo $this->jsonEncode($this->result);
        }

        function mat_code_init(){
            $param = $this->param;

            $sql = "select mat_in_code from its_mat_coming where group_id = ".$param["idx"]." order by incom_id desc";

            $result = $this->conn->db_select($sql);
            if($result["result"] == 1){
                $this->result = $result;
            }else{
                $this->result = $result;
            }
            
            echo $this->jsonEncode($this->result);
        }

        function budget(){
            $param = $this->param;

            $sql = "SELECT budget_amount 
            FROM GK_budget 
            WHERE gk_year = YEAR(NOW()) 
              AND department = "."'".$param["department"]."'";

            $result = $this->conn->db_select($sql);
            if($result["result"] == 1){
                $this->result = $result;
            }else{
                $this->result = $result;
            }
            
            echo $this->jsonEncode($this->result);
        }
        

        function date_update(){
            $param = $this->param;

            $sql = "update its_input set date = '".$param["date"]."' where incom_id = ".$param["incom_id"];

            $result = $this->conn->db_select($sql);
            if($result["result"] == 1){
                $this->result = $result;
            }else{
                $this->result = $result;
            }
            
            echo $this->jsonEncode($this->result);
        }

        function update_b_class(){
            $param = $this->param;

            $sql = "update its_mat_coming set bc_in_b_class = "."'".$param["bc_in_b_class"]."'"." where incom_id = ".$param["incom_id"];

            $result = $this->conn->db_select($sql);
            if($result["result"] == 1){
                $this->result = $result;
            }else{
                $this->result = $result;
            }
            
            echo $this->jsonEncode($this->result);
        }

        function accumulate(){
            $param = $this->param;

            $sql = $param["query"];

            $result = $this->conn->db_select($sql);
            if($result["result"] == 1){
                $this->result = $result;
            }else{
                $this->result = $result;
            }
            
            echo $this->jsonEncode($this->result);
        }

        /********************************************************************* 
        // 함 수 : add_its() 잡자재 추가(임시)
        // 설 명 : 잡자재 수동추가
        // 만든이 : 김찬우
        *********************************************************************/
	function its_add_product() {
		   	$param = $this->param;
		    $sql = "insert into its_mat_temp (
        	        user_id, group_id, mat_in_code, mat_in_place, bc_in_b_class, bc_in_s_class, 
                	mat_in_name, mat_in_stand, mat_in_maker, mat_in_custom, mat_in_union, mat_in_price, 
	                mat_in_amount,mat_in_sum
		        	) values (";

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
        $sql = "insert into its_mat_coming (
            user_id, group_id, mat_in_code, mat_in_place, bc_in_b_class, bc_in_s_class, 
            mat_in_name, mat_in_stand, mat_in_maker, mat_in_custom, mat_in_union, mat_in_price, 
            mat_in_amount,mat_in_sum
            ) values (";

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

    function output_insert(){
        $param = $this->param;
        $formattedDate = date('Y-m-d', strtotime($param["date"]));

        $sql = "INSERT INTO its_output (incom_id, user_id, amount, `date`, comment) 
                VALUES (
                    " . $param["idx"] . ",
                    " . $param["user_id"] . ",
                    " . $param["amount"] . ",
                    '" . $formattedDate . "',
                    '" . $param["comment"] . "'
                )";


        $result = $this->conn->db_insert($sql);


        if ($result["result"] == 1){
            $this->result = $result;
        } else {
            $this->result["result"] = 0;
        }


        echo $this->jsonEncode($this->result);

    }

    function product_to_modify(){
        $param = $this->param;
        $param["idx"] = json_decode($param["idx"],true);
        $target = $param["idx"];
        if(count($param["idx"]) != 0){
            $sql = "
            SELECT 
                m.incom_id,
                m.mat_in_code,
                m.mat_in_name,
                m.mat_in_stand,
                m.mat_in_price,
                COALESCE(i.total_input_amount, 0) - COALESCE(o.total_output_amount, 0) AS mat_in_amount,
                (COALESCE(i.total_input_amount, 0) - COALESCE(o.total_output_amount, 0)) * 
                CAST(REPLACE(REPLACE(m.mat_in_price, ',', ''), ' ', '') AS DECIMAL(15, 2)) AS mat_in_sum
            FROM 
                its_mat_coming m
            LEFT JOIN 
                (
                    SELECT 
                        incom_id,
                        SUM(COALESCE(amount, 0) + COALESCE(carry_over, 0)) AS total_input_amount
                    FROM 
                        its_input
                    GROUP BY 
                        incom_id
                ) i ON m.incom_id = i.incom_id
            LEFT JOIN 
                (
                    SELECT 
                        incom_id,
                        SUM(COALESCE(amount, 0) + COALESCE(carry_over, 0)) AS total_output_amount
                    FROM 
                        its_output
                    GROUP BY 
                        incom_id
                ) o ON m.incom_id = o.incom_id 
            ";

            for($i = 0; $i<count($target); $i++){
                if(count($target) == 1){
                    $sql = $sql . "where m.incom_id = ".$target[$i]."";
                }else{
                    if($i == 0){
                        $sql = $sql . "where m.incom_id in ( ".$target[$i]." , ";
                    }else if ($i == (count($target) -1)){
                        $sql = $sql . " ".$target[$i]."  ) ";
                    }else{
                        $sql = $sql . " ".$target[$i].", ";
                    }
                }
            }

            $result = $this->conn->db_select($sql);
            if($result["result"] == 1){
                $this->result = $result;
            }else{
                $this->result = $result;
            }
        }else{
            $this->result["result"] = 0;
            $this->result["error_code"] = "620";
            $this->result["message"] = "선택된 자재가 없습니다.";
        }
        echo $this->jsonEncode($this->result);

    }

        /********************************************************************* 
        // 함 수 : add_excel()
        // 설 명 : 자재 추가 (엑셀 등록)
        // 만든이 : 김찬우
        *********************************************************************/

        function input_excel(){
            $param = $this->param;
            if($this->value_check(array("incom_id"))){
                $param["incom_id"] = json_decode($param["incom_id"], true);
                $param["carry_over"] = json_decode ($param["carry_over"], true);
                $sql = "insert into its_input (group_id, incom_id, carry_over) values ";
                for($i = 0; $i<count($param["incom_id"]); $i++){
                    $sql = $sql . "( ";
                    $sql = $sql . $param["group_idx"] . ", ";
                    $sql = $sql . $this->null_check($param["incom_id"][$i]) . ", ";
                    $sql = $sql . $this->null_check($param["carry_over"][$i]);
                    if(count($param["incom_id"]) == 1){
                        $sql = $sql . ")";
                    }else{
                        if($i == (count($param["incom_id"]) -1)){
                            $sql = $sql . " )";
                        }else{
                            $sql = $sql . "),";
                        }
                    }
                }
                $this->conn->s_transaction();
                $result = $this->conn->db_insert($sql);
                if($result["result"] == 1){
                    $sql = "select * from its_input ";
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

        function input_excel_new(){
            $param = $this->param;
            if($this->value_check(array("incom_id"))){
                $param["incom_id"] = json_decode($param["incom_id"], true);
                $param["date"] = json_decode ($param["date"], true);
                $param["amount"] = json_decode ($param["amount"], true);
                $sql = "insert into its_input (group_id, incom_id, date, amount) values ";
                for($i = 0; $i<count($param["incom_id"]); $i++){
                    $sql = $sql . "( ";
                    $sql = $sql . $param["group_idx"] . ", ";
                    $sql = $sql . $this->null_check($param["incom_id"][$i]) . ", ";
                    $sql = $sql . $this->null_check($param["date"][$i]) . ", ";
                    $sql = $sql . $this->null_check($param["amount"][$i]);
                    if(count($param["incom_id"]) == 1){
                        $sql = $sql . ")";
                    }else{
                        if($i == (count($param["incom_id"]) -1)){
                            $sql = $sql . " )";
                        }else{
                            $sql = $sql . "),";
                        }
                    }
                }
                $this->conn->s_transaction();
                $result = $this->conn->db_insert($sql);
                if($result["result"] == 1){
                    $sql = "select * from its_input ";
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

        function output_excel(){
            $param = $this->param;
            if($this->value_check(array("incom_id"))){
                $param["incom_id"] = json_decode($param["incom_id"], true);
                $param["carry_over"] = json_decode ($param["carry_over"], true);
                $sql = "insert into its_output(group_id, incom_id, carry_over) values ";
                for($i = 0; $i<count($param["incom_id"]); $i++){
                    $sql = $sql . "( ";
                    $sql = $sql . $param["group_idx"] . ", ";
                    $sql = $sql . $this->null_check($param["incom_id"][$i]) . ", ";
                    $sql = $sql . $this->null_check($param["carry_over"][$i]);
                    if(count($param["incom_id"]) == 1){
                        $sql = $sql . ")";
                    }else{
                        if($i == (count($param["incom_id"]) -1)){
                            $sql = $sql . " )";
                        }else{
                            $sql = $sql . "),";
                        }
                    }
                }
                $this->conn->s_transaction();
                $result = $this->conn->db_insert($sql);
                if($result["result"] == 1){
                    $sql = "select * from its_output ";
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

        function output_excel_new(){
            $param = $this->param;
            if($this->value_check(array("incom_id"))){
                $param["incom_id"] = json_decode($param["incom_id"], true);
                $param["date"] = json_decode ($param["date"], true);
                $param["amount"] = json_decode ($param["amount"], true);
                $sql = "insert into eletech_output (group_id, incom_id, date, amount) values ";
                for($i = 0; $i<count($param["incom_id"]); $i++){
                    $sql = $sql . "( ";
                    $sql = $sql . $param["group_idx"] . ", ";
                    $sql = $sql . $this->null_check($param["incom_id"][$i]) . ", ";
                    $sql = $sql . $this->null_check($param["date"][$i]) . ", ";
                    $sql = $sql . $this->null_check($param["amount"][$i]);
                    if(count($param["incom_id"]) == 1){
                        $sql = $sql . ")";
                    }else{
                        if($i == (count($param["incom_id"]) -1)){
                            $sql = $sql . " )";
                        }else{
                            $sql = $sql . "),";
                        }
                    }
                }
                $this->conn->s_transaction();
                $result = $this->conn->db_insert($sql);
                if($result["result"] == 1){
                    $sql = "select * from eletech_output ";
                   

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
    
        function uploadExcel() {
            $param = $this->param;
            $response = []; // 자바스크립트로 전달할 응답 배열
        
            try {
                $excelData = json_decode($param['excelData'], true);
                $response['excelData'] = $excelData;
        
                // SQL 준비
                $sqlMatComing = "INSERT INTO eletech_mat_coming (incom_id, mat_in_code, mat_in_place, bc_in_b_class, bc_in_s_class, mat_in_name, mat_in_stand, mat_in_maker, mat_in_custom, mat_in_union, mat_in_price) VALUES ";
                $valuesMatComing = [];
                $sqlInput = "INSERT INTO eletech_input (carry_over, amount, date, comment, incom_id) VALUES ";
                $valuesInput = [];
                $sqlOutput = "INSERT INTO eletech_output (carry_over, amount, date, comment, incom_id) VALUES ";
                $valuesOutput = [];
                $currentYear = date('Y');
                $includedCarryOver = []; // 이월 누계가 이미 포함된 incom_id를 추적하기 위한 배열
        
                foreach ($excelData as $row) {
                    if (!isset($row['no']) || $row['no'] === null || $row['no'] === '') {
                        continue; // no 값이 없으면 건너뜀
                    }
        
                    // its_mat_coming 데이터 준비
                    $values = [
                        $row['no'],
                        isset($row['자재코드']) ? $row['자재코드'] : '',
                        isset($row['위치']) ? $row['위치'] : '',
                        isset($row['대분류']) ? $row['대분류'] : '',
                        isset($row['소분류']) ? $row['소분류'] : '',
                        isset($row['품명']) ? $row['품명'] : '',
                        isset($row['규격']) ? $row['규격'] : '',
                        isset($row['제조사']) ? $row['제조사'] : '',
                        isset($row['거래처']) ? $row['거래처'] : '',
                        isset($row['단위']) ? $row['단위'] : '',
                        isset($row['단가']) ? $row['단가'] : 0
                    ];
                    $valuesMatComing[] = "(" . implode(", ", array_map([$this, 'null_check'], $values)) . ")";
        
                    // its_input 데이터 준비
                    $carryOver = isset($row['입고현황'][0]) ? $row['입고현황'][0] : 0; // 이월 누계 가져오기
                    if ($carryOver > 0) {
                        // 이월 누계만 입력
                        $valuesInput[] = "(" . implode(", ", [
                            $this->null_check($carryOver),
                            "NULL", // amount는 NULL
                            "'" . $currentYear . "-01-01'", // 이월 누계의 일자
                            "NULL",
                            $this->null_check($row['no'])
                        ]) . ")";
                    }
        
                    for ($i = 1; $i <= 12; $i++) {
                        $amount = isset($row['입고현황'][$i]) ? $row['입고현황'][$i] : 0;
                        if ($amount > 0) {
                            $date = "'" . $currentYear . '-' . str_pad($i, 2, '0', STR_PAD_LEFT) . "-01'";
                            $valuesInput[] = "(" . implode(", ", [
                                "NULL", // carryOver는 NULL
                                $this->null_check($amount),
                                $date,
                                "NULL",
                                $this->null_check($row['no'])
                            ]) . ")";
                        }
                    }
        
                    // its_output 데이터 준비
                    $carryOver = isset($row['출고현황'][0]) ? $row['출고현황'][0] : 0;
                    if ($carryOver > 0 && !in_array($row['no'], $includedCarryOver)) {
                        // 이월 누계만 입력
                        $valuesOutput[] = "(" . implode(", ", [
                            $this->null_check($carryOver),
                            "NULL", // amount는 NULL
                            "'" . $currentYear . "-01-01'", // 이월 누계의 일자
                            "NULL",
                            $this->null_check($row['no'])
                        ]) . ")";
                        $includedCarryOver[] = $row['no']; // 중복 방지
                    }
        
                    for ($i = 1; $i <= 12; $i++) {
                        $amount = isset($row['출고현황'][$i]) ? $row['출고현황'][$i] : 0;
                        if ($amount > 0) {
                            $date = "'" . $currentYear . '-' . str_pad($i, 2, '0', STR_PAD_LEFT) . "-01'";
                            $valuesOutput[] = "(" . implode(", ", [
                                "NULL", // carryOver는 NULL
                                $this->null_check($amount),
                                $date,
                                "NULL",
                                $this->null_check($row['no'])
                            ]) . ")";
                        }
                    }
                }
        
                $response['valuesMatComing'] = $valuesMatComing;
                $response['valuesInput'] = $valuesInput;
                $response['valuesOutput'] = $valuesOutput;
        
                if (!empty($valuesMatComing)) {
                    $sqlMatComing .= implode(", ", $valuesMatComing);
                    $this->conn->s_transaction();
        
                    $resultMatComing = $this->conn->db_insert($sqlMatComing);
                    $response['resultMatComing'] = $resultMatComing;
        
                    if ($resultMatComing["result"] == 1) {
                        if (!empty($valuesInput)) {
                            $sqlInput .= implode(", ", $valuesInput);
                            $response['sqlInput'] = $sqlInput;
        
                            $resultInput = $this->conn->db_insert($sqlInput);
                            $response['resultInput'] = $resultInput;
                        } else {
                            $resultInput = ["result" => 1];
                        }
        
                        if ($resultInput["result"] == 1) {
                            if (!empty($valuesOutput)) {
                                $sqlOutput .= implode(", ", $valuesOutput);
                                $response['sqlOutput'] = $sqlOutput;
        
                                $resultOutput = $this->conn->db_insert($sqlOutput);
                                $response['resultOutput'] = $resultOutput;
                            } else {
                                $resultOutput = ["result" => 1];
                            }
        
                            if ($resultOutput["result"] == 1) {
                                $this->conn->commit();
                                $response['status'] = "success";
                            } else {
                                $this->conn->rollback();
                                $response['status'] = "rollback on output";
                                $response['error'] = $resultOutput;
                            }
                        } else {
                            $this->conn->rollback();
                            $response['status'] = "rollback on input";
                            $response['error'] = $resultInput;
                        }
                    } else {
                        $this->conn->rollback();
                        $response['status'] = "rollback on mat_coming";
                        $response['error'] = $resultMatComing;
                    }
                } else {
                    $response['status'] = "no data to insert";
                }
            } catch (Exception $e) {
                $response['status'] = "error";
                $response['message'] = $e->getMessage();
            }
        
            echo json_encode($response);
        }
}
?>