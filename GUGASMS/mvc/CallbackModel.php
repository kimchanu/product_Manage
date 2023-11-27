<?php
    class CallbackModel extends gf{
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
        // 함 수 : 발신번호관리 페이지에서 발신번호를 등록하는 함수
        // 설 명 : 
        // 만든이: 조경민
        *********************************************************************/
        function register_number(){
            $param = $this->param;
            if($this->value_check(array("reg_call_num"))){
                $sql = "insert into callback_num(callback_num, regdate) values(";
                $sql = $sql.$this->null_check($param["reg_call_num"]).",";
                $sql = $sql."now())";
                $result = $this->conn->db_insert($sql);
                if($result["result"] == "1"){
                    $this->result = $result;
                    $this->result["message"] = "callback_num 발신번호 등록 성공";
                }else{
                    $this->result["result"] = "0";
                    $this->result["error_code"] = "10";
                    $this->result["message"] = "callback_num 발신번호 등록 성공";
                }
            }
            echo json_encode($this->result,JSON_UNESCAPED_UNICODE);
        }

        /********************************************************************* 
        // 함 수 : 발신번호관리 페이지에서 발신번호를 수정하는 함수
        // 설 명 : 
        // 만든이: 조경민
        *********************************************************************/
        function modify_number(){
            $param = $this->param;
            if($this->value_check(array("reg_call_num", "idx"))){
                $sql = "update callback_num set callback_num = ".$this->null_check($param["reg_call_num"])." where idx = ".$param["idx"];
                $this->conn->s_transaction(); //트랜잭션 시작
                $result = $this->conn->db_update($sql);
                if($result["result"] == "1"){
                    $this->conn->commit(); //커밋
                    $this->result = $result;
                    $this->result["message"] = "callback_num 발신번호 수정 성공";
                }else{
                    $this->result["result"] = "0";
                    $this->result["error_code"] = "10";
                    $this->result["message"] = "callback_num 발신번호 수정 성공";
                }
            }
            echo json_encode($this->result,JSON_UNESCAPED_UNICODE);
        }

        /********************************************************************* 
        // 함 수 : 발신번호 Table에서 데이터를 가져오는 함수
        // 설 명 : 
        // 만든이: 조경민
        *********************************************************************/
        function select_number(){
            // $param = $this->param;
            $sql = "select * from callback_num";
            $result = $this->conn->db_select($sql);
            if($result["result"] == "1"){
                $this->result = $result;
                $this->result["message"] = "callback_num 발신번호 검색 성공";
            }else{
                $this->result["result"] = "0";
                $this->result["error_code"] = "10";
                $this->result["message"] = "callback_num 발신번호 검색 성공";
            }
            echo json_encode($this->result,JSON_UNESCAPED_UNICODE);
        }

        
        /********************************************************************* 
        // 함 수 : 발신번호관리 페이지에서 발신번호를 삭제하는 함수
        // 설 명 : 
        // 만든이: 조경민
        *********************************************************************/
        function delete_number(){
            $param = $this->param;
            if($this->value_check(array("idx"))){
                $sql = "select idx from callback_pf where num_idx = ".$param["idx"];
                $result = $this->conn->db_select($sql);
                if($result["result"] == "1"){
                    $this->result = $result;
                    $this->result["message"] = "callback_pf num_idx 검색 성공";
                    if(count($result["value"]) != 0){
                        $sql = "delete from kakao_tpl where pf_idx = ";
                        for($i = 0; $i < count($result["value"]); $i++){
                            if($i == 0){
                                $sql .= $result["value"][$i]["idx"];
                            }else{
                                $sql .= " or pf_idx = ".$result["value"][$i]["idx"];
                            }
                        }
                        $this->conn->s_transaction(); //트랜잭션 시작
                        $result = $this->conn->db_delete($sql);
                    }
                    $sql = "delete from callback_pf where num_idx = ".$param["idx"];
                    $result = $this->conn->db_delete($sql);
                    if($result["result"] == "1"){
                        $this->result = $result;
                        $this->result["message"] = "callback_pf 삭제 성공";
                        $sql = "delete from callback_num where idx = ".$param["idx"];
                        $result = $this->conn->db_delete($sql);
                        if($result["result"] == "1"){
                            $this->conn->commit(); //커밋
                            $this->result = $result;
                            $this->result["message"] = "callback_num 발신번호 삭제 성공";
                        }else{
                            $this->result["result"] = "0";
                            $this->result["error_code"] = "10";
                            $this->result["message"] = "callback_num 발신번호 삭제 실패";
                        }
                    }else{
                        $this->result["result"] = "0";
                        $this->result["error_code"] = "10";
                        $this->result["message"] = "callback_pf 삭제 실패";
                    }
                    
                }else{
                    $this->result["result"] = "0";
                    $this->result["error_code"] = "10";
                    $this->result["message"] = "callback_pf num_idx 검색 실패";
                }
            }
            echo json_encode($this->result,JSON_UNESCAPED_UNICODE);
        }
        /********************************************************************* 
        // 함 수 : 발신번호리스트에서 발신번호를 검색하는 함수
        // 설 명 : 
        // 만든이: 조경민
        *********************************************************************/
        function search_number(){
            $param = $this->param;
            if($this->value_check(array("search_call_num"))){
                $sql = "select * from callback_num where callback_num like '%".$param["search_call_num"]."%'";
                $result = $this->conn->db_select($sql);
                if($result["result"] == "1"){
                    $this->result = $result;
                    $this->result["message"] = "callback_num 발신번호 검색 성공";
                }else{
                    $this->result["result"] = "0";
                    $this->result["error_code"] = "10";
                    $this->result["message"] = "callback_num 발신번호 검색 실패";
                }
            }
            echo json_encode($this->result,JSON_UNESCAPED_UNICODE);
        }

        /********************************************************************* 
        // 함 수 : 발신프로필 리스트에서 프로필을 검색하는 함수
        // 설 명 : 
        // 만든이: 조경민
        *********************************************************************/
        function select_profile(){
            // $param = $this->param;
            $sql = "select * from callback_pf";
            $result = $this->conn->db_select($sql);
            if($result["result"] == "1"){
                $this->result = $result;
                $this->result["message"] = "발신프로필 검색 성공";
            }else{
                $this->result["result"] = "0";
                $this->result["error_code"] = "10";
                $this->result["message"] = "발신프로필 검색 성공 실패";
            }
            echo json_encode($this->result,JSON_UNESCAPED_UNICODE);
        }

		
        /********************************************************************* 
        // 함 수 : 발신프로필 리스트에서 프로필을 클릭하면 해당 리스트의 정보를 가져오는 함수
        // 설 명 : 
        // 만든이: 조경민
        *********************************************************************/
        function request_pf_info(){
            $param = $this->param;
            if($this->value_check(array("idx"))){
                $sql = "select * from callback_pf where idx = ".$param["idx"];
                $result = $this->conn->db_select($sql);
                if($result["result"] == "1"){
                    $this->result = $result;
                    $this->result["message"] = "발신프로필 검색 성공";
                }else{
                    $this->result["result"] = "0";
                    $this->result["error_code"] = "10";
                    $this->result["message"] = "발신프로필 검색 성공 실패";
                }
            }
            echo json_encode($this->result,JSON_UNESCAPED_UNICODE);
        }

        /********************************************************************* 
        // 함 수 : 발신프로필을 등록하는 함수
        // 설 명 : 
        // 만든이: 조경민
        *********************************************************************/
        function register_profile(){
            $param = $this->param;
            if($this->value_check(array("idx" ,"yellow_id", "profile_name", "profile_key", "callback_num"))){
                $sql = "insert into callback_pf(num_idx, yellow_id, profile_name, profile_key, callback_num, regdate) values(";
                $sql = $sql.$this->null_check($param["idx"]).",";
                $sql = $sql.$this->null_check($param["yellow_id"]).",";
                $sql = $sql.$this->null_check($param["profile_name"]).",";
                $sql = $sql.$this->null_check($param["profile_key"]).",";
                $sql = $sql.$this->null_check($param["callback_num"]).",";
                $sql = $sql."now())";
                $result = $this->conn->db_insert($sql);
                if($result["result"] == "1"){
                    $this->result = $result;
                    $this->result["message"] = "발신프로필 등록 성공";
                }else{
                    $this->result["result"] = "0";
                    $this->result["error_code"] = "10";
                    $this->result["message"] = "발신프로필 등록 실패";
                }
            }
            echo json_encode($this->result,JSON_UNESCAPED_UNICODE);
        }

		
        /********************************************************************* 
        // 함 수 : 발신프로필을 수정하는 함수
        // 설 명 : 
        // 만든이: 조경민
        *********************************************************************/
        function modify_profile(){
            $param = $this->param;
            if($this->value_check(array("num_idx", "pf_idx" ,"yellow_id", "profile_name", "profile_key", "callback_num"))){
                $sql = "update callback_pf set num_idx = ".$param["num_idx"].",";
                $sql .= "yellow_id = ".$this->null_check($param["yellow_id"]).",";
                $sql .= "profile_name = ".$this->null_check($param["profile_name"]).",";
                $sql .= "profile_key = ".$this->null_check($param["profile_key"]).",";
                $sql .= "callback_num = ".$this->null_check($param["callback_num"]);
                $sql .= " where idx = ".$param["pf_idx"];
                $this->conn->s_transaction(); //트랜잭션 시작
                $result = $this->conn->db_update($sql);
                if($result["result"] == "1"){
                    $this->conn->commit(); //커밋
                    $this->result = $result;
                    $this->result["message"] = "발신프로필 수정 성공";
                }else{
                    $this->result["result"] = "0";
                    $this->result["error_code"] = "10";
                    $this->result["message"] = "발신프로필 수정 실패";
                }
            }
            echo json_encode($this->result,JSON_UNESCAPED_UNICODE);
        }

       
        /********************************************************************* 
        // 함 수 : 발신프로필을 등록하는 함수
        // 설 명 : 
        // 만든이: 조경민
        *********************************************************************/
        function delete_profile(){
            $param = $this->param;
            if($this->value_check(array("idx"))){
                $sql = "delete from kakao_tpl where pf_idx = ".$param["idx"];
                $result = $this->conn->db_delete($sql);
                if($result["result"] == "1"){
                    $this->result = $result;
                    $this->result["message"] = "알림톡 템플릿 삭제 성공";
                    $sql = "delete from callback_pf where idx = ".$param["idx"];
                    $this->conn->s_transaction(); //트랜잭션 시작
                    $result = $this->conn->db_delete($sql);
                    if($result["result"] == "1"){
                        $this->conn->commit(); //커밋
                        $this->result = $result;
                        $this->result["message"] = "발신프로필 삭제 성공";
                    }else{
                        $this->result["result"] = "0";
                        $this->result["error_code"] = "10";
                        $this->result["message"] = "발신프로필 삭제 실패";
                    }
                }else{
                    $this->result["result"] = "0";
                    $this->result["error_code"] = "10";
                    $this->result["message"] = "알림톡 템플릿 삭제 실패";
                }
            }
            echo json_encode($this->result,JSON_UNESCAPED_UNICODE);
        }

        /********************************************************************* 
        // 함 수 : 발신프로필을 검색하는 함수
        // 설 명 : 
        // 만든이: 조경민
        *********************************************************************/
        function search_profile(){
            $param = $this->param;
            $sql = "select * from callback_pf where";
            $flag = false;
            if($param["yellow_id"] != "" && $param["yellow_id"] != "undefiend" && $param["yellow_id"] != null){
                $sql = $sql." yellow_id like '%".$param["yellow_id"]."%'";
                $flag = true;
            }
            if($param["profile_name"] != "" && $param["profile_name"] != "undefiend" && $param["profile_name"] != null){
                if($flag){
                    $sql = $sql." and";
                }
                $sql = $sql." profile_name like '%".$param["profile_name"]."%'";
            }
            $result = $this->conn->db_select($sql);
            if($result["result"] == "1"){
                $this->result = $result;
                $this->result["message"] = "발신프로필 검색 성공";
            }else{
                $this->result["result"] = "0";
                $this->result["error_code"] = "10";
                $this->result["message"] = "발신프로필 검색 실패";
            }
            echo json_encode($this->result,JSON_UNESCAPED_UNICODE);
        }

        /********************************************************************* 
        // 함 수 : 알림톡 템플릿 등록 함수
        // 설 명 : 
        // 만든이: 조경민
        *********************************************************************/
        function register_template(){
            $param = $this->param;
            if($this->value_check(array("idx", "tpl_name", "tpl_key", "btn_type", "btn_type2"))){
                $sql = "insert into kakao_tpl(pf_idx ,tpl_name, tpl_key, btn_type, btn_name, btn_url1, btn_url2, content, regdate, btn_type2, btn_2_name, btn_2_url1, btn_2_url2) values(";
                $sql = $sql.$this->null_check($param["idx"]).",";
                $sql = $sql.$this->null_check($param["tpl_name"]).",";
                $sql = $sql.$this->null_check($param["tpl_key"]).",";
                $sql = $sql.$this->null_check($param["btn_type"]).",";
                $sql = $sql.$this->null_check($param["btn_name"]).",";
                $sql = $sql.$this->null_check($param["btn_url1"]).",";
                $sql = $sql.$this->null_check($param["btn_url2"]).",";
                $sql = $sql.$this->null_check($param["content"]).",";
                $sql = $sql." now(),";
                $sql = $sql.$this->null_check($param["btn_type2"]).",";
                $sql = $sql.$this->null_check($param["btn_2_name"]).",";
                $sql = $sql.$this->null_check($param["btn_2_url1"]).",";
                $sql = $sql.$this->null_check($param["btn_2_url2"]).")";

                $this->conn->s_transaction(); //트랜잭션 시작
                $result = $this->conn->db_insert($sql);
                // print_r($result);
                if($result["result"] == "1"){
                    $this->conn->commit(); //커밋
                    $this->result = $result;
                    $this->result["message"] = "알림톡 템플릿 등록 성공";
                }else{
                    $this->result["result"] = "0";
                    $this->result["error_code"] = "10";
                    $this->result["message"] = "알림톡 템플릿 등록 실패";
                }
                echo json_encode($this->result,JSON_UNESCAPED_UNICODE);
            }
        }
		
        /********************************************************************* 
        // 함 수 : 알림톡 템플릿 수정 함수
        // 설 명 : 
        // 만든이: 조경민
        *********************************************************************/
        function modify_template(){
            $param = $this->param;
            if($this->value_check(array("tpl_name", "tpl_key", "btn_type", "pf_idx", "tpl_idx"))){
                $sql = "update kakao_tpl set ";
                $sql .= "pf_idx = ".$param["pf_idx"].",";
                $sql .= "tpl_name = ".$this->null_check($param["tpl_name"]).",";
                $sql .= "tpl_key = ".$this->null_check($param["tpl_key"]).",";
                $sql .= "btn_type = ".$this->null_check($param["btn_type"]).",";
                $sql .= "btn_name = ".$this->null_check($param["btn_name"]).",";
                $sql .= "btn_url1 = ".$this->null_check($param["btn_url1"]).",";
                $sql .= "btn_url2 = ".$this->null_check($param["btn_url2"]).",";
                $sql .= "btn_type2 = ".$this->null_check($param["btn_type2"]).",";
                $sql .= "btn_2_name = ".$this->null_check($param["btn_2_name"]).",";
                $sql .= "btn_2_url1 = ".$this->null_check($param["btn_2_url1"]).",";
                $sql .= "btn_2_url2 = ".$this->null_check($param["btn_2_url2"]).",";
                $sql .= "content = ".$this->null_check($param["content"]);
                $sql .= " where idx = ".$param["tpl_idx"];
                $this->conn->s_transaction(); //트랜잭션 시작
                $result = $this->conn->db_update($sql);
                if($result["result"] == "1"){
                    $this->conn->commit(); //커밋
                    $this->result = $result;
                    $this->result["message"] = "알림톡 템플릿 수정 성공";
                }else{
                    $this->result["result"] = "0";
                    $this->result["error_code"] = "10";
                    $this->result["message"] = "알림톡 템플릿 수정 실패";
                }
                echo json_encode($this->result,JSON_UNESCAPED_UNICODE);
            }
        }

        /********************************************************************* 
        // 함 수 : 템플릿 게시글을 클릭하면 글 등록 form에 보여줄 해당 게시글의 정보를 가져오는 함수
        // 설 명 : 
        // 만든이: 조경민
        *********************************************************************/
        function request_tpl_info(){
            $param = $this->param;
            if($this->value_check(array("idx"))){
                $sql = "select * from kakao_tpl left join callback_pf on kakao_tpl.pf_idx = callback_pf.idx";
                $sql .= " where kakao_tpl.idx = ".$param["idx"];
                $result = $this->conn->db_select($sql);
                if($result["result"] == "1"){
                    $this->result = $result;
                    $this->result["message"] = "알림톡 템플릿 검색 성공";
                }else{
                    $this->result["result"] = "0";
                    $this->result["error_code"] = "10";
                    $this->result["message"] = "알림톡 템플릿 검색 실패";
                }
                echo json_encode($this->result,JSON_UNESCAPED_UNICODE);
            }
        }


        /********************************************************************* 
        // 함 수 : 알림톡 템플릿 데이터를 가져오는 함수
        // 설 명 : 
        // 만든이: 조경민
        *********************************************************************/
        function select_template(){
            // $param = $this->param;
            $sql = "select callback_pf.yellow_id, kakao_tpl.* from kakao_tpl left join callback_pf on kakao_tpl.pf_idx = callback_pf.idx";
            $result = $this->conn->db_select($sql);
            if($result["result"] == "1"){
                $this->result = $result;
                $this->result["message"] = "템플릿 검색 성공";
            }else{
                $this->result["result"] = "0";
                $this->result["error_code"] = "10";
                $this->result["message"] = "템플릿 검색 성공 실패";
            }
            echo json_encode($this->result,JSON_UNESCAPED_UNICODE);
        }


        /********************************************************************* 
        // 함 수 : 알림톡 템플릿 검색 함수
        // 설 명 : 
        // 만든이: 조경민
        *********************************************************************/
        function search_template(){
            $param = $this->param;
            $sql = "select t1.*, t2.yellow_id from kakao_tpl as t1 left join callback_pf as t2 on t1.pf_idx = t2.idx where";
            $flag = false;
            if($param["yellow_id"] != "" && $param["yellow_id"] != "undefiend" && $param["yellow_id"] != null){
                $sql = $sql." t2.yellow_id like '%".$param["yellow_id"]."%'";
                $flag = true;
            }
            if($param["tpl_name"] != "" && $param["tpl_name"] != "undefiend" && $param["tpl_name"] != null){
                if($flag){
                    $sql = $sql." and";
                }
                $sql = $sql." t1.tpl_name like '%".$param["tpl_name"]."%'";
            }
            $result = $this->conn->db_select($sql);
            if($result["result"] == "1"){
                $this->result = $result;
                $this->result["message"] = "알림톡 템플릿 검색 성공";
            }else{
                $this->result["result"] = "0";
                $this->result["error_code"] = "10";
                $this->result["message"] = "알림톡 템플릿 검색 실패";
            }
            echo json_encode($this->result,JSON_UNESCAPED_UNICODE);
        }


        /********************************************************************* 
        // 함 수 : 발신프로필 호출함수 (알림톡,친구톡 전송 페이지)
        // 설 명 : 
        // 만든이: 최진혁
        *********************************************************************/
        function send_profile_list(){
            $param = $this->param;
            $sql = "select * from callback_pf as t1 ";
            // $sql .= "left join callback_num as t2 ";
            // $sql .= "on t1.num_idx = t2.idx ";

            $result = $this->conn->db_select($sql);
            if($result["result"] ==0){
                $this->result = $result;
            }else{
                $this->result = $result;
            }
            echo json_encode($this->result,JSON_UNESCAPED_UNICODE);
        }

         /********************************************************************* 
        // 함 수 : 발신번호 호출함수 (알림톡,친구톡 전송 페이지)
        // 설 명 : 
        // 만든이: 최진혁
        *********************************************************************/
        function send_number_list(){
            $param = $this->param;
            if($this->value_check(array("target"))){
                $sql = "select * from callback_num ";

                $result = $this->conn->db_select($sql);
                if($result["result"] == 0){
                    $this->result = $result;
                }else{
                    $profile_sql = "select num_idx from callback_pf where idx = ".$param["target"]." ";

                    $profile_result = $this->conn->db_select($profile_sql);
                    if($profile_result["result"] == 0){
                        $this->result = $profile_result;
                    }else{
                        $list = $result["value"];

                        $send_number_idx = 0;

                        for($i = 0; $i<count($list); $i++){
                            if(isset($profile_result["value"][0]["num_idx"])){
                                if($list[$i]["idx"] == $profile_result["value"][0]["num_idx"]){
                                    $send_number_idx = $list[$i]["idx"];
                                }
                            }
                        }
                        $this->result = $result;
                        $this->result["send_number_idx"] = $send_number_idx;
                    }
                }
            }
            echo json_encode($this->result,JSON_UNESCAPED_UNICODE);
        }

         /********************************************************************* 
        // 함 수 : 발신템플릿 호출함수 (알림톡,친구톡 전송 페이지)
        // 설 명 : 
        // 만든이: 최진혁
        *********************************************************************/
        function send_template_list(){
            $param = $this->param;
            if($this->value_check(array("target"))){
                $sql = "select * from kakao_tpl where pf_idx = ".$param["target"]." ";

                $result = $this->conn->db_select($sql);
                if($result["result"] == 0){
                    $this->result = $result;
                }else{
                    $this->result = $result;
                }
                echo json_encode($this->result,JSON_UNESCAPED_UNICODE);
            }
        }
                    
        /********************************************************************* 
        // 함 수 : 알림톡 템플릿을 삭제하는 함수
        // 설 명 : 
        // 만든이: 조경민
        *********************************************************************/
        function delete_template(){
            $param = $this->param;
            if($this->value_check(array("idx"))){
                $sql = "delete from kakao_tpl where idx = ".$param["idx"];
                $this->conn->s_transaction(); //트랜잭션 시작
                $result = $this->conn->db_delete($sql);
                if($result["result"] == "1"){
                    $this->conn->commit(); //커밋
                    $this->result = $result;
                    $this->result["message"] = "알림톡 템플릿 삭제 성공";
                }else{
                    $this->result["result"] = "0";
                    $this->result["error_code"] = "10";
                    $this->result["message"] = "알림톡 템플릿 삭제 실패";
                }
            }
            echo json_encode($this->result,JSON_UNESCAPED_UNICODE);
        }

    }
?>