<?php
    class AdminModel extends gf{
        private $json;
        private $dir;
        private $conn;

        function __construct($array){
            $this->json = $array["json"];
            $this->dir = $array["dir"];
            $this->conn = $array["db"];
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
                "param"=>$this->json,
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
        // 함 수 : login()
        // 설 명 : 관리자로그인
        // 담당자: 최진혁
        *********************************************************************/
        function login(){
            $param = $this->json;
            // print_r($param);
            if($this->value_check(array("id","pw"))){
                $param = $this->null_check_v3($param,array("id","pw"));
                $sql = "select * from admin where id=".$param["id"]." and pw=".$param["pw"];
                $result = $this->conn->db_select($sql);
                if($result["result"] == "1"){ //쿼리가 성공이면
                    $list = $result["value"];
                    if($list){
                        if($result["value"][0]["role"] != 4){
                            $session=new Session();
                            // $session->success_admin_login($list[0]["idx"]);
                            $session->success_admin_login($list[0]["idx"], $list[0]["role"]);
                            $this->result = $result;
                            $this->result["message"] = "관리자 로그인 성공";
                        }else{
                            $this->result["result"]="0";
                            $this->result["error_code"]="500";
                            $this->result["message"]="계정이 존재하지 않습니다.";
                        }
                    }else{
                        $this->result["result"]="0";
                        $this->result["error_code"]="500";
                        $this->result["message"]="계정이 존재하지 않습니다.";
                    }
                }else{
                    $this->result = $result;
                }
            }
            echo json_encode($this->result,JSON_UNESCAPED_UNICODE);
        }
        function logout(){//로그아웃 세션 모두삭제
            $session = new Session();
            $session->admin_logout();
        }
        /********************************************************************* 
        // 함 수 : signup()
        // 설 명 : 회원가입
        // 담당자: 최진혁
        *********************************************************************/

        function signup(){
            $param = $this->json;
            if($this->value_check(array("id","pw","name", "role"))){

                $sql = "select id from admin where id = ".$this->null_check($param["id"])."";
                $result = $this->conn->db_select($sql);
                if($result["result"] == 0){
                    $this->result = $result;
                }else{
                    if(count($result["value"]) != 0){
                        $this->result["result"] = 0;
                        $this->result["error_code"]="533";
                        $this->result["message"] = "중복된 아이디입니다.";
                    }else{
                        $sql = "insert into admin(id, pw, name, role, send_number, sms, mms, comment, regdate) values(";
                        $sql = $sql . $this->null_check($param["id"]) . " , ";
                        $sql = $sql . $this->null_check($param["pw"]) . " , ";
                        $sql = $sql . $this->null_check($param["name"]) . " , ";
                        $sql = $sql . $param["role"] . " , ";
                        if($param["send_number"] == ""){
                            $sql = $sql . " null , ";
                        }else{
                            $sql = $sql . $this->null_check($param["send_number"]) . " , ";
                        }
                        if($param["sms"] == ""){
                            $sql = $sql . " 0 , ";
                        }else{
                            $sql = $sql . $param["sms"] . " , ";
                        }
                        if($param["mms"] == ""){
                            $sql = $sql . " 0 , ";
                        }else{
                            $sql = $sql . $param["mms"] . " , ";
                        }
                        if($param["comment"] == ""){
                            $sql = $sql . " null , now() ";
                        }else{
                            $sql = $sql . $this->null_check($param["comment"]) . " , now() ";
                        }
                        $sql = $sql . ")";

                        $result = $this->conn->db_insert($sql);
                        if($result["result"] == 0){
                            $this->result = $result;
                        }else{
                            $this->result = $result;
                        }
                    }
                }
            }
            echo json_encode($this->result,JSON_UNESCAPED_UNICODE);
        }

        function sign_up2(){
            $param = $this->json;
            if($this->value_check(array("group_idx","user_id","user_name","user_pw","user_duty","user_phone"))){

                $sql = "select user_id from mat_users where user_id = '".$param["user_id"]."'";

                $result = $this->conn->db_select($sql);
                if($result["result"] == 0){
                    $this->result = $result;
                }else{
                    if(count($result["value"]) != 0){
                        $this->result["result"] = 0;
                        $this->result["error_code"]="533";
                        $this->result["message"] = "중복된 아이디입니다.";
                    }else{
                        $sql = "insert into mat_users(group_id, user_id, user_name, user_pw, user_duty, user_phone, reg_time) values(";
                        $sql = $sql . $this->null_check($param["group_idx"]) . " , ";
                        $sql = $sql . $this->null_check($param["user_id"]) . " , ";
                        $sql = $sql . $this->null_check($param["user_name"]) . " , ";
                        $sql = $sql . $this->null_check($param["user_pw"]) . " , ";
                        $sql = $sql . $this->null_check($param["user_duty"]) . " , ";
                        $sql = $sql . $this->null_check($param["user_phone"]) . " , ";
                        $sql = $sql . "now() ";
                        $sql = $sql . ")";

                        $result = $this->conn->db_insert($sql);
                        if($result["result"] == 0){
                            $this->result = $result;
                        }else{
                            $this->result = $result;
                        }
                    }
                }
            }
            echo json_encode($this->result,JSON_UNESCAPED_UNICODE);
        }

        
        /********************************************************************* 
        // 함 수 : user_modify()
        // 설 명 : 수정
        // 담당자: 최진혁
        *********************************************************************/

        function user_modify(){
            $param = $this->json;
            if($this->value_check(array("target_idx","pw","name", "role"))){
                $sql = "update admin set ";
                $sql = $sql . "pw = ".$this->null_check($param["pw"])." , ";
                $sql = $sql . "name = ".$this->null_check($param["name"])." , ";
                $sql = $sql . "role = ".$param["role"]." , ";
                if($param["send_number"] != ""){
                    $sql = $sql . "send_number = ".$this->null_check($param["send_number"])." , ";
                }else{
                    $sql = $sql . "send_number = null , ";
                }
                if($param["sms"] != ""){
                    $sql = $sql . "sms = ".$param["sms"]." , ";
                }
                if($param["sms"] != ""){
                    $sql = $sql . "lms = ".$param["lms"]." , ";
                }
                if($param["mms"] != ""){
                    $sql = $sql . "mms = ".$param["mms"]." , ";
                }
                if($param["comment"] != ""){
                    $sql = $sql . "comment = ".$this->null_check($param["comment"])." , ";
                }               
                $sql = $sql . "update_date = now() ";
                $sql = $sql . "where idx = ".$param["target_idx"]."";

                $result = $this->conn->db_update($sql);
                if($result["result"] == 0){
                    $this->result = $result;
                }else{
                    $this->result = $result;
                }
            }
            echo json_encode($this->result,JSON_UNESCAPED_UNICODE);
        }
        /********************************************************************* 
        // 함 수 : user_list()
        // 설 명 : 사용자리스트
        // 담당자: 최진혁
        *********************************************************************/

        function user_list(){
            $param = $this->json;
            $sql = "select * from admin where role != 3 and role != 4 ";
            if($param["search_role"] != 0){
                $sql = $sql . " and role = ".$param["search_role"]." ";
            }
            if($param["search_id"] != ""){
                $sql = $sql . " and id like '%".$param["search_id"]."%' ";
            }
            if($param["search_name"] != ""){
                $sql = $sql . " and name like '%".$param["search_name"]."%' ";
            }

            $result = $this->conn->db_select($sql);
            if($result["result"] == 0){
                $this->result = $result;
            }else{
                $total_sql ="select count(idx) as total from admin where role != 3 and role != 4 ";
                if($param["search_role"] != 0){
                    $total_sql = $total_sql . " and role = ".$param["search_role"]." ";
                }
                if($param["search_id"] != ""){
                    $total_sql = $total_sql . " and id like '%".$param["search_id"]."%' ";
                }
                if($param["search_name"] != ""){
                    $total_sql = $total_sql . " and name like '%".$param["search_name"]."%' ";
                }
                $total_result = $this->conn->db_select($total_sql);
                $this->result = $result;
                $this->result["total"] = $total_result["value"][0]["total"];
            }
            echo json_encode($this->result,JSON_UNESCAPED_UNICODE);
        }


        function mat_users(){
            $param = $this->json;
            $sql = "select * from mat_users ";
            // if($param["search_role"] != 0){
            //     $sql = $sql . " and role = ".$param["search_role"]." ";
            // }
            // if($param["search_id"] != ""){
            //     $sql = $sql . " and id like '%".$param["search_id"]."%' ";
            // }
            // if($param["search_name"] != ""){
            //     $sql = $sql . " and name like '%".$param["search_name"]."%' ";
            // }

            $result = $this->conn->db_select($sql);
            if($result["result"] == 0){
                $this->result = $result;
            }else{
                $total_sql ="select count(idx) as total from mat_users";
                // if($param["search_role"] != 0){
                //     $total_sql = $total_sql . " and role = ".$param["search_role"]." ";
                // }
                // if($param["search_id"] != ""){
                //     $total_sql = $total_sql . " and id like '%".$param["search_id"]."%' ";
                // }
                // if($param["search_name"] != ""){
                //     $total_sql = $total_sql . " and name like '%".$param["search_name"]."%' ";
                // }
                $total_result = $this->conn->db_select($total_sql);
                $this->result = $result;
                $this->result["total"] = $total_result["value"][0]["total"];
            }
            echo json_encode($this->result,JSON_UNESCAPED_UNICODE);
        }


        /********************************************************************* 
        // 함 수 : select_del_user()
        // 설 명 : 사용자 선택삭제
        // 담당자: 최진혁
        *********************************************************************/

        function select_del_user(){
            $param = $this->json;
            if($this->value_check(array("target_idx"))){
                $param["target_idx"] = json_decode($param["target_idx"], true);
                $target = $param["target_idx"];

                if(count($target) == 0){
                    $this->result["result"] == 0;
                    $this->result["error_code"] == "200";
                    $this->result["message"] == "선택된 사용자가 없습니다.";
                }else{
                    // $sql = "delete from admin ";
                    $sql = "update admin set ";
                    $sql = $sql . "role = 4 ";
                    for($i = 0; $i<count($target); $i++){
                        if(count($target) == 1){
                            $sql = $sql . "where idx = ".$target[$i]."";
                        }else{
                            if($i == 0){
                                $sql = $sql . "where idx in ( ".$target[$i]." , ";
                            }else if ($i == (count($target) -1)){
                                $sql = $sql . " ".$target[$i]."  ) ";
                            }else{
                                $sql = $sql . " , ".$target[$i]." ";
                            }
                        }
                    }
                    $result = $this->conn->db_delete($sql);
                    if($result["result"] == 0){
                        $this->result = $result;
                    }else{
                        $select_sql = "select * from admin where role != 3 and role != 4 ";

                        $select_result = $this->conn->db_select($select_sql);
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
        // 함 수 : admin_detail()
        // 설 명 : 사용자 상세내용
        // 담당자: 최진혁
        *********************************************************************/
        function admin_detail(){
            $param = $this->json;
            if($this->value_check(array("target"))){
                $sql = "select * from admin ";
                $sql = $sql . "where idx = ".$param["target"]." ";
                
                $result = $this->conn->db_select($sql);

                if($result["result"] == 0){
                    $this->result = $result;
                }else{
                    $this->result = $result;
                }
            }

            echo json_encode($this->result,JSON_UNESCAPED_UNICODE);
        }

    }
?>