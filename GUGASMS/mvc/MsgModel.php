<?php
    class MsgModel extends gf{
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
        // 함 수 : remove_file_from_table()
        // 설 명 : 관리자로그인
        // 만든이 : 최진혁
        *********************************************************************/
        function remove_file_from_table(){
            $param = $this->param;

            $sql = "select table_name as t from information_schema.tables ";
            $sql = $sql . "where table_schema = 'msg' ";
            $sql = $sql . "and table_name like '%msg_result_%'";

            $result =$this->conn->db_select($sql);
            if($result["result"] == 0){
                $this->result = $result;
            }else{
                $table_arr = $result["value"];
                $table_count = count($table_arr);
                if(count($table_arr)==0){
                    $this->result = $result;
                }else{
                    for($i = 0; $i<count($table_arr); $i++){
                        if(count($table_arr) == 1){
                            $sql = "select ";
                            $sql = $sql . "t".($i+1).".fileloc1 as t".($i+1)."_fileloc1, ";
                            $sql = $sql . "t".($i+1).".fileloc2 as t".($i+1)."_fileloc2 , ";
                            $sql = $sql . "t".($i+1).".fileloc3 as t".($i+1)."_fileloc3 , ";
                            $sql = $sql . "t".($i+1).".request_time as t".($i+1)."_rt  ";
                            $sql = $sql . "from ";
                            // $sql = "select fileloc1, fileloc2, fileloc3 from ";
                        }else{
                            if($i == 0){
                                $sql = "select ";
                                $sql = $sql . "t".($i+1).".fileloc1 as t".($i+1)."_fileloc1, ";
                                $sql = $sql . "t".($i+1).".fileloc2 as t".($i+1)."_fileloc2 , ";
                                $sql = $sql . "t".($i+1).".fileloc3 as t".($i+1)."_fileloc3 , ";
                                $sql = $sql . "t".($i+1).".request_time as t".($i+1)."_rt,  ";
                            }else if($i == (count($table_arr) -1 )){
                                $sql = $sql . "t".($i+1).".fileloc1 as t".($i+1)."_fileloc1, ";
                                $sql = $sql . "t".($i+1).".fileloc2 as t".($i+1)."_fileloc2, ";
                                $sql = $sql . "t".($i+1).".fileloc3 as t".($i+1)."_fileloc3, ";
                                $sql = $sql . "t".($i+1).".request_time as t".($i+1)."_rt from ";
                            }else{
                                $sql = $sql . "t".($i+1).".fileloc1 as t".($i+1)."_fileloc1, ";
                                $sql = $sql . "t".($i+1).".fileloc2 as t".($i+1)."_fileloc2, ";
                                $sql = $sql . "t".($i+1).".fileloc3 as t".($i+1)."_fileloc3, ";
                                $sql = $sql . "t".($i+1).".request_time as t".($i+1)."_rt,  ";
                                // $sql = $sql . "t".$table_count.".fileloc1, t".$table_count.".fileloc2, t".$table_count.".fileloc3, ";
                            }
                        }
                    }
                    for($i = 0; $i<count($table_arr); $i++){
                        if(count($table_arr) == 1){
                            $sql = $sql . $table_arr[$i]["t"] . " as t".($i+1)." ";
                        }else{
                            if($i == (count($table_arr) -1)){
                                $sql = $sql . $table_arr[$i]["t"] . " as t".($i+1)." ";
                            }else{
                                $sql = $sql . $table_arr[$i]["t"] . " as t".($i+1)." , ";
                            }
                        }
                    }
                    for($i = 0; $i<count($table_arr); $i++){
                        if(count($table_arr) == 1){
                            $sql = $sql . "group by t".($i+1)."_rt ";
                        }else{
                            if($i == (count($table_arr) -1)){
                                $sql = $sql . "t".($i+1)."_rt ";
                            }else if($i == 0){
                                $sql = $sql . "group by t".($i+1)."_rt ,";
                            }else{
                                $sql = $sql . "t".($i+1)."_rt , ";
                            }
                        }
                    }

                    $result = $this->conn->db_select($sql);
                    if($result["result"]==0){
                        $this->result = $result;
                    }else{
                        $select_list = $result["value"];
                        $select_count = count($select_list);
                        if($select_count != 0){
                            for($j = 0; $j<$select_count; $j++){
                                for($i = 1; $i<=$table_count; $i++){
                                    for($k = 1; $k<=3; $k++){
                                        $file = $select_list[$j]["t".$i."_fileloc".$k.""];
                                        if($file != ""){
                                            if(file_exists($file)){
                                                unlink($file);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        $this->result["result"] = 1;
                        $this->result["message"] = "업로드 폴더를 업데이트했습니다.";
                    }
                }
            }
            echo $this->jsonEncode($this->result);
        }


        // folder, file_name, extention
        function file_name_check($array){
            $folder = $array["folder"];
            $file_name = $array["file_name"];
            $file_extension = $array["extension"];
            $new_file_path = $folder.$file_name;
            $file_name = explode('.',$file_name);
            $only_file_name = $file_name[0];
            while(file_exists($new_file_path)){
                $new_file_path = $folder.$only_file_name.".".$file_extension;
            }
            $new_file_name = str_replace($folder, "", $new_file_path);
            return $new_file_name;
        }

        /********************************************************************* 
        // 함 수 : send_msg()
        // 설 명 : 관리자로그인
        // 만든이 : 최진혁
        *********************************************************************/
        function send_msg(){
            $param = $this->param;
            if($this->value_check(array("msg_type","text","send_number", "receiver_list"))){
                $param["receiver_list"] = json_decode($param["receiver_list"], true);


                $msg_count = count($param["receiver_list"]);
                $msg_type = $param["msg_type"];
                $user = $param["user_idx"];
                $count_file = $_FILES["files"];
                $file_count = 0;
                foreach($count_file["error"] as $n => $f_err){
                    if($f_err != "4"){
                        $file_count++;
                    }
                }
                $result = $this->user_msg_count(array(
                        "msg_type" => $msg_type,
                        "msg_count" => $msg_count,
                        "user_idx" => $user,
                        "file_cnt" => $file_count,
                    )
                );

                if($result["result"] == 0){
                    $this->result = $result;
                }else{
                    //이미지 파일
                    $file = $_FILES["files"];
                    $folder = $this->dir . "/mmsimg/";
                    if(!is_dir($folder)){
                        mkdir($folder);
                    }
                    $file_name_arr = array();
                    $real_file_name_arr = array();
                    $temp_file_arr = array();
                    $file_cnt = 0;
                    foreach($file["error"] as $n => $f_err){
                        if($f_err != "4"){
                            $name = $file["name"][$n];
                            $tmp_name = $file["tmp_name"][$n];
                            $info = new SplFileInfo($name);
                            $file_name = $this->rand_name() . "." . $info->getExtension();
                            $file_name = $this->file_name_check(array(
                                "folder" => $folder,
                                "file_name" => $file_name,
                                "extension" => $info->getExtension(),
                            ));
                            if(move_uploaded_file($tmp_name, $folder.$file_name)){
                                array_push($real_file_name_arr, $name);
                                array_push($file_name_arr, $folder.$file_name);
                                array_push($temp_file_arr, $tmp_name);
                                $file_cnt++;
                            }
                        }
                    }

                    //수신자 리스트
                    //예약
                    if(isset($param["reserve_date"])){
                        $request_time = $param["reserve_date"] . " " . $param["reserve_time"];
                        $request_time = $this->null_check($request_time);
                    }else{
                        $request_time = "sysdate()";
                    }

                    $sql = "insert into msg_queue(opt_id, msg_type, dstaddr, callback, stat, text, request_time";
                    for($i = 0; $i<count($file_name_arr); $i++){
                        if(count($file_name_arr) == 1){
                            $sql = $sql . " , filecnt ";
                            $sql = $sql . " , fileloc".($i+1);
                        }else{
                            if($i == (count($file_name_arr) - 1)){
                                $sql = $sql . "fileloc".($i+1);
                            }else if($i == 0){
                                $sql = $sql . " , filecnt ";
                                $sql = $sql . " , fileloc".($i+1). " , ";
                            }else{
                                $sql = $sql . "fileloc".($i+1) . ",";
                            }
                        }
                    }
                    $sql = $sql . ") values";
                    for($i = 0; $i<count($param["receiver_list"]); $i++){
                        $sql = $sql . "( ";
                        $sql = $sql . $user ." , ";
                        $sql = $sql . $this->null_check($param["msg_type"]) ." , ";
                        $sql = $sql . $this->null_check($param["receiver_list"][$i]) . " , ";
                        $sql = $sql . $this->null_check($param["send_number"]) . " , ";
                        $sql = $sql . "'0' , ";
                        $sql = $sql . $this->null_check($param["text"]) . " , ";
                        $sql = $sql . $request_time;
                        //파일 입력
                        for($j = 0; $j<count($file_name_arr); $j++){
                            if(count($file_name_arr) == 1){
                                $sql = $sql . " , " . $file_cnt . " , ";
                                $sql = $sql . $this->null_check($file_name_arr[$j]) . " ";
                            }else{
                                if($j == (count($file_name_arr) - 1)){
                                    $sql = $sql . $this->null_check($file_name_arr[$j]) . " ";
                                }else if($j == 0){
                                    $sql = $sql . " , " . $file_cnt . " , ";
                                    $sql = $sql . $this->null_check($file_name_arr[$j]) . " , ";
                                }else{
                                    $sql = $sql . $this->null_check($file_name_arr[$j]) . " , ";
                                }
                            }
                        }
                        if(count($param["receiver_list"]) == 1){
                            $sql = $sql . ")";
                        }else{
                            if($i == count($param["receiver_list"]) -1 ){
                                $sql = $sql . ")";
                            }else{
                                $sql = $sql . "),";
                            }
                        }
                    }
                    
                    $result = $this->conn->db_insert($sql);
                    if($result["result"] == 1){
                        $this->result = $result;
                    }else{
                        $this->result = $result;
                    }
                }
            }
            echo $this->jsonEncode($this->result);
        }

        //msg_type, user_idx, msg_count, file_cnt
        function user_msg_count($array){
            if(!isset($array["user_idx"])){
                return;
            }
            if(!isset($array["msg_type"])){
                return;
            }
            if(!isset($array["msg_count"])){
                return;
            }
            if(!isset($array["file_cnt"])){
                return;
            }
            $user = $array["user_idx"];
            $type = $array["msg_type"];
            $count = $array["msg_count"];
            $file_cnt = $array["file_cnt"];

            $select_sql = "select id, use_lms, lms, use_mms, mms, use_sms, sms, use_t_kakao, t_kakao, use_f_kakao, f_kakao from admin ";
            $select_sql = $select_sql . "where idx = ".$user." ";

            $select_result = $this->conn->db_select($select_sql);
            if($select_result["result"]== 0){
                return $select_result;
            }else{
                $select = $select_result["value"][0];
                if($type == 1){
                    $total = $select["use_sms"] + $count;
                    
					if($select["id"] != "gklink"){
                        if($select["sms"] < $total){
                            $result = array(
                                "result" => 0,
                                "error_code" => 620,
                                "message" => "사용가능한 SMS 횟수를 초과하였습니다.",
                            );
                            return $result;
                        }
                    }
                }else if($type == 3){
                    if($file_cnt == 0){
                        $total = $select["use_lms"] + $count;
                        if($select["id"] != "gklink"){
                            if($select["lms"] < $total){
                                $result = array(
                                    "result" => 0,
                                    "error_code" => 622,
                                    "message" => "사용가능한 LMS 횟수를 초과하였습니다.",
                                );
                                return $result;
                            }
                        }
                    }else{
                        $total = $select["use_mms"] + $count;
                        if($select["id"] != "gklink"){
                            if($select["mms"] < $total){
                                $result = array(
                                    "result" => 0,
                                    "error_code" => 621,
                                    "message" => "사용가능한 MMS 횟수를 초과하였습니다.",
                                );
                                return $result;
                            }
                        }
                    }
                }else if($type == 6){
                    $total = $select["use_t_kakao"] + $count;
					if($select["id"] != "gklink"){
						if($select["t_kakao"] < $total){
							$result = array(
								"result" => 0,
								"error_code" => 623,
								"message" => "사용가능한 알림톡 횟수를 초과하였습니다.",
							);
							return $result;
						}
					}
                }else if($type == 7){
                    $total = $select["use_f_kakao"] + $count;
					if($select["id"] != "gklink"){
						if($select["f_kakao"] < $total){
							$result = array(
								"result" => 0,
								"error_code" => 624,
								"message" => "사용가능한 친구톡 횟수를 초과하였습니다.",
							);
							return $result;
						}
					}
                }

                if($type == 1){
                    $sql = "update admin set ";
                    $sql = $sql . " use_sms = ".$total.", ";
                    $sql = $sql . " total_sms = total_sms + ".$total." ";
                    $sql = $sql . "where idx = ".$user."";
                }else if($type == 3){
                    if($file_cnt == 0){
                        $sql = "update admin set ";
                        $sql = $sql . " use_lms = ".$total.", ";
                        $sql = $sql . " total_lms = total_lms + ".$total." ";
                        $sql = $sql . "where idx = ".$user."";
                    }else{
                        $sql = "update admin set ";
                        $sql = $sql . " use_mms = ".$total.", ";
                        $sql = $sql . " total_mms = total_mms + ".$total." ";
                        $sql = $sql . "where idx = ".$user."";
                    }
                }else if($type == "6"){
                    $sql = "update admin set ";
                    $sql = $sql . " use_t_kakao = ".$total.", ";
                    $sql = $sql . " total_t_kakao = total_t_kakao + ".$count." ";
                    $sql = $sql . "where idx = ".$user."";
                }else if($type == "7"){
                    $sql = "update admin set ";
                    $sql = $sql . " use_f_kakao = ".$total.", ";
                    $sql = $sql . " total_f_kakao = total_f_kakao + ".$count." ";
                    $sql = $sql . "where idx = ".$user."";
                }
    
                $result = $this->conn->db_update($sql);
                if($result["result"] == 0){
                    return $result;
                }else{
                    return $result;
                }
            }
        }
        /********************************************************************* 
        // 함 수 : msg_box_list()
        // 설 명 : 메시지 박스 리스트
        // 만든이 : 최진혁
        *********************************************************************/
        function msg_box_list(){
            $param = $this->param;
            $sql = "select idx, msg_box_name, msg_box_content from msg_box ";

            $result = $this->conn->db_select($sql);
            if($result["result"] == 0){
                $this->result = $result;
            }else{
                $this->result = $result;
            }
            echo $this->jsonEncode($this->result);
        }
        /********************************************************************* 
        // 함 수 : msg_box_detail()
        // 설 명 : 메시지 박스 세부정보
        // 만든이 : 최진혁
        *********************************************************************/
        function msg_box_detail(){
            $param = $this->param;
            if($this->value_check(array("box_idx"))){
                $sql = "select idx, msg_box_name, msg_box_content from msg_box ";
                $sql = $sql . "where idx = ".$param["box_idx"]."";

                $result = $this->conn->db_select($sql);
                if($result["result"] == 0){
                    $this->result = $result;
                }else{
                    $this->result = $result;
                }

            }
            echo $this->jsonEncode($this->result);
        }
        /********************************************************************* 
        // 함 수 : msg_box_add()
        // 설 명 : 메시지 박스 등록
        // 만든이 : 최진혁
        *********************************************************************/
        function msg_box_add(){
            $param = $this->param;
            if($this->value_check(array("name"))){
                $sql = "insert into msg_box (msg_box_name, msg_box_content, regdate) values (";
                $sql = $sql . $this->null_check($param["name"]) . " , ";
                if($param["content"] != ""){
                    $sql = $sql . $this->null_check($param["content"]) . " , ";
                }else{
                    $sql = $sql . " null , ";
                }
                $sql = $sql . " now() ";
                $sql = $sql . ")";

                $result = $this->conn->db_insert($sql);
                if($result["result"] == 0){
                    $this->result = $result;
                }else{
                    $this->result = $result;
                }
            }
            echo $this->jsonEncode($this->result);
        }
        /********************************************************************* 
        // 함 수 : msg_box_modify()
        // 설 명 : 메시지 박스 수정
        // 만든이 : 최진혁
        *********************************************************************/
        function msg_box_modify(){
            $param = $this->param;
            if($this->value_check(array("name", "box_idx"))){
                $sql = "update msg_box set ";
                $sql = $sql . "msg_box_name = ".$this->null_check($param["name"])." , ";
                if($param["content"] != ""){
                    $sql = $sql . "msg_box_content = ".$this->null_check($param["content"])." , ";
                }
                $sql = $sql . "update_date = now() ";
                $sql = $sql . "where idx = ".$param["box_idx"]."";

                $result = $this->conn->db_insert($sql);
                if($result["result"] == 0){
                    $this->result = $result;
                }else{
                    $this->result = $result;
                }
            }
            echo $this->jsonEncode($this->result);
        }

        /********************************************************************* 
        // 함 수 : msg_box_delete()
        // 설 명 : 메시지 박스 삭제
        // 만든이 : 최진혁
        *********************************************************************/
        function msg_box_delete(){
            $param = $this->param;
            if($this->value_check(array("box_idx"))){

                $sql = "delete from msg_box ";
                $sql .= "where idx = ".$param["box_idx"]."";

                $result = $this->conn->db_delete($sql);
                if($result["result"] == 0){
                    $this->result = $result;
                }else{
                    $sql = "delete from msg_list where box_idx =".$param["box_idx"]."";
                    $result=$this->conn->db_delete($sql);
                    if($result["result"] == 0){
                        $this->result = $result;    
                    }else{
                        $this->result = $result;
                    }
                    $this->result = $result;
                }
            }
            echo $this->jsonEncode($this->result);
        }
        /********************************************************************* 
        // 함 수 : add_msg()
        // 설 명 : 메시지 박스 추가
        // 만든이 : 최진혁
        *********************************************************************/
        function add_msg(){
            $param = $this->param;
            if($this->value_check(array("box_idx","msg_name","msg_content"))){

                $sql = "insert into msg_list (box_idx, msg_name, msg_content, regdate) values (";
                $sql = $sql . $param["box_idx"] . " , ";
                $sql = $sql . $this->null_check($param["msg_name"]) . " , ";
                $sql = $sql . $this->null_check($param["msg_content"]) . " , now() ";
                $sql = $sql . ")";

                $result = $this->conn->db_insert($sql);

                if($result["result"] == 0){
                    $this->result = $result;
                }else{
                    $this->result = $result;
                }
            }
            echo $this->jsonEncode($this->result);
        }
        /********************************************************************* 
        // 함 수 : update_msg()
        // 설 명 : 메시지 박스 수정
        // 만든이 : 최진혁
        *********************************************************************/
        function update_msg(){
            $param = $this->param;
            if($this->value_check(array("idx","msg_name","msg_content"))){

                $sql = "update msg_list set ";
                $sql = $sql . "msg_name = " . $this->null_check($param["msg_name"]) . " , ";
                $sql = $sql . "msg_content = " . $this->null_check($param["msg_content"]) . " , ";
                $sql = $sql . "update_date = now() ";
                $sql = $sql . "where idx =".$param["idx"]."";

                $result = $this->conn->db_update($sql);

                if($result["result"] == 0){
                    $this->result = $result;
                }else{

                    $sql = "select box_idx from msg_list where idx = ".$param["idx"]."";

                    $result= $this->conn->db_select($sql);
                    if($result["result"] == 0){
                        $this->result = $result;
                    }else{
                        $this->result = $result;
                        $this->result["target"] = $result["value"][0]["box_idx"];
                    }
                }
            }
            echo $this->jsonEncode($this->result);
        }

        /********************************************************************* 
        // 함 수 : all_delete_msg()
        // 설 명 : 메시지함 비우기
        // 만든이 : 최진혁
        *********************************************************************/

        function all_delete_msg(){
            $param = $this->param;
            if($this->value_check(array("box_idx"))){

                $sql = "delete from msg_list ";
                $sql = $sql . "where box_idx = ".$param["box_idx"]." ";

                $result = $this->conn->db_delete($sql);
                if($result["result"] == 0){
                    $this->result = $result;
                }else{
                    $this->result = $result;
                }
            }
            echo $this->jsonEncode($this->result);
        }
        /********************************************************************* 
        // 함 수 : select_delete_msg()
        // 설 명 : 메시지함 비우기( 선택)
        // 만든이 : 최진혁
        *********************************************************************/
        function select_delete_msg(){
            $param = $this->param;
            if($this->value_check(array("box_idx","target"))){
                $target = json_decode($param["target"],true);

                $sql = "delete from msg_list ";
                $sql = $sql . "where box_idx = ".$param["box_idx"]." ";
                for($i = 0; $i<count($target); $i++){
                    if(count($target) == 1){
                        $sql = $sql . "and idx = ".$target[$i]." ";
                    }else{
                        if($i == 0){
                            $sql = $sql . "and idx in ( ".$target[$i]. " , ";
                        }else if($i == (count($target) - 1)){
                            $sql = $sql . "".$target[$i]." ) ";
                        }else{
                            $sql = $sql . "".$target[$i]." , ";
                        }
                    }
                }

                $result = $this->conn->db_delete($sql);
                if($result["result"] == 0){
                    $this->result = $result;
                }else{
                    $this->result = $result;
                }
            }
            echo $this->jsonEncode($this->result);
        }


        /********************************************************************* 
        // 함 수 : msg_list()
        // 설 명 : 메시지 리스트
        // 만든이 : 최진혁
        *********************************************************************/
        function msg_list(){
            $param = $this->param;
            if($this->value_check(array("box_idx"))){
                $sql = "select * from msg_list ";
                $sql = $sql . "where box_idx = ".$param["box_idx"]." ";
                if(isset($param["search_name"])){
                    if($param["search_name"] != ""){
                        $sql = $sql . "and msg_name like '%".$param["search_name"]."%' ";
                    }
                }
                if(isset($param["search_content"])){
                    if($param["search_content"] != ""){
                        $sql = $sql . "and msg_content like '%".$param["search_content"]."%' ";
                    }
                }
                $result = $this->conn->db_select($sql);
                if($result["result"] == 0){
                    $this->result = $result;
                }else{
                    $this->result = $result;
                }
            }
            echo $this->jsonEncode($this->result);
        }



        /********************************************************************* 
        // 함 수 : msg_single_del()
        // 설 명 : 메시지 하나 삭제
        // 만든이 : 최진혁
        *********************************************************************/
        function msg_single_del(){
            $param = $this->param;
            if($this->value_check(array("target_idx"))){
                $sql = "delete from msg_list where idx = ".$param["target_idx"]."";

                $result = $this->conn->db_delete($sql);
                if($result["result"] == 0){
                    $this->result = $result;
                }else{
                    $this->result = $result;
                }
            }
            echo $this->jsonEncode($this->result);
        }
        /********************************************************************* 
        // 함 수 : search_reserve_msg()
        // 설 명 : 예약메시지 리스트
        // 만든이 : 최진혁
        *********************************************************************/
        function search_reserve_msg(){
            $param = $this->param;
            if($this->value_check(array("start_date","end_date"))){
                $start_db = $param["start_date"];
                $end_db = $param["end_date"];
                
                $sql = "select opt_id, mseq, msg_type, dstaddr, callback, stat, request_time, text, filecnt  from ";
                $sql = $sql . "msg_queue ";
                $sql = $sql . "where request_time >= ".$this->null_check($start_db)." ";
                $sql = $sql . "and request_time <= ".$this->null_check($end_db)." ";
                if($param["send_kind"] != "0"){
                    $kind = $param["send_kind"];
                    if($kind == 1){
                        $sql = $sql . "and (msg_type = 1 or msg_type = 2) ";
                    }else if($kind == 2){
                        $sql = $sql . "and msg_type = 3 and filecnt = 0 ";   
                    }else if($kind == 3){
                        $sql = $sql . "and (msg_type = 3 or msg_type = 4) ";
                    }
                }
                if($param["send_number"] != ""){
                    $sql = $sql . "and callback = ".$this->null_check($param["send_number"])." ";
                }
                if($param["receiver_number"] != ""){
                    $sql = $sql . "and dstaddr = ".$this->null_check($param["receiver_number"])." ";
                }
                if($param["msg_content"] != ""){
                    $sql = $sql . "and text like '%".$param["msg_content"]."%' ";
                }
                if($param["user_idx"] != "1"){
                    $sql = $sql . "and opt_id = ".$param["user_idx"]." ";
                }
                $sql = $sql . " order by mseq desc";


                $result = $this->conn->db_select($sql);

                if($result["result"]==0){
                    $this->result = $result;
                }else{
                    $this->result = $result;
                }

            }
            echo $this->jsonEncode($this->result);
        }

        /********************************************************************* 
        // 함 수 : search_msg()
        // 설 명 : 메세지 전송결과 리스트 검색
        // 만든이 : 조경민
        *********************************************************************/
        function search_msg(){
            $param = $this->param;
            if($this->value_check(array("start_date","end_date", "type"))){
                //입력받은 발송시작일과 발송종료일의 데이터를 가져오는 쿼리문
                $start_db = substr(str_replace('-', "", $param["start_date"]), 0, 6); 
                $end_db = substr(str_replace('-', "", $param["end_date"]), 0, 6);
                $sql_flag = false;
                if($start_db == $end_db){
                    $sql_flag = true;
                }
                $sql = "";
                //입력한 월별 테이블이 있는지 없는지 확인
                for($i = $start_db; $i <= $end_db; $i++){
                    if($i % 100 === 13){ //월이 13이 되면 다음년도로 01월로 만들어주기
                        $i = $i + 88;
                    }
                    $db = "'msg_result_".$i."'";
                    $sql = $sql."select count(*) cnt from information_schema.tables where table_name = ".$db;
                    if($i != $end_db){
                        $sql = $sql." union all ";
                    }
                }
                $result = $this->conn->db_select($sql);
                $this->result = $result;
                $this->result["message"] = "no_db";
                $count = 0;
                for($i = 0; $i < count($result["value"]); $i++){
                    if($result["value"][$i]["cnt"] == 1){
                        $count++; //범위에 존재하는 DB의 개수
                    }
                }
                $sql = "";
                if($sql_flag){ //발송시작일과 발송종료일이 같을때
                    if($result["value"][0]["cnt"] != 0){
                        $sql = $sql."select * from msg_result_".$start_db." where send_time between ";
                        $sql = $sql.$this->null_check($param["start_date"])." and ".$this->null_check($param["end_date"]);
                        $sql = $this->search_msg_sql($sql, $param);
                        $sql = $sql." order by send_time desc";
                    }
                }else{
                    $j = 0; 
                    for($i = $start_db; $i <= $end_db; $i++){
                        if($i % 100 === 13){ //월이 13이 되면 다음년도로 01월로 만들어주기
                            $i = $i + 88;
                        }
                        if($result["value"][$j]["cnt"] != 0){ //DB가 있을때
                            $count--;
                            if($i == $start_db){ //발송시작일과 일치할때
                                $sql = $sql."select * from msg_result_".$i." where send_time >= ".$this->null_check($param["start_date"]);
                                $sql = $this->search_msg_sql($sql, $param);
                                if($count != 0){
                                    $sql = $sql." union all ";
                                }
                            }else if($i == $end_db){ //발송종료일과 일치할때
                                $sql = $sql."select * from msg_result_".$i." where send_time <= ".$this->null_check($param["end_date"]);
                                $sql = $this->search_msg_sql($sql, $param);
                                if($count != 0){
                                    $sql = $sql." union all ";
                                }
                            }else{
                                $k = 0;
                                $sql = $sql."select * from msg_result_".$i." where";
                                if($param["msg_type"] != 0){ //전체 선택이 아닌경우
                                    if($k == 0){ 
                                        if($param["msg_type"] == 3){
                                            $sql = $sql." msg_type = ".$param["msg_type"]." and filecnt != 0";
                                        }else if($param["msg_type"] == 2){
                                            $sql = $sql." (msg_type = ".$param["msg_type"]." or (msg_type = 3 and filecnt = 0))";
                                        }else{
                                            $sql = $sql." msg_type = ".$param["msg_type"];
                                        }
                                        $k++;
                                    }else{
                                        if($param["msg_type"] == 3){
                                            $sql = $sql." and (msg_type = 3 and filecnt != 0 )";
                                        }else if($param["msg_type"] == 2){
                                            $sql = $sql." and (msg_type = ".$param["msg_type"]." or (msg_type = 3 and filecnt = 0))";
                                            // $sql = $sql." and (msg_type = 3 and filecnt = 0) ";
                                        }else{
                                            $sql = $sql." and msg_type = ".$param["msg_type"];
                                        } 
                                    }
                                }

                                if($param["send_type"] != 0){ //전체 선택이 아닌경우
                                    if($k == 0){
                                        // $sql = $sql." send_type = ".$param["send_type"];
                                        if($param["send_type"] == 1){
                                            $sql = $sql." result = 100";
                                        }else{
                                            $sql = $sql." result > 100";
                                        }
                                        $k++;
                                    }else{
                                        // $sql = $sql." and send_type = ".$param["send_type"];
                                        if($param["send_type"] == 1){
                                            $sql = $sql." and result = 100";
                                        }else{
                                            $sql = $sql." and result > 100";
                                        }
                                    }
                                }

                                if($param["dstaddr"] != "" && $param["dstaddr"] != null && $param["dstaddr"] != "undefined"){ //빈값이 아닌경우
                                    if($k == 0){
                                        $sql = $sql." dstaddr = ".$this->null_check($param["dstaddr"]);
                                    }else{
                                        $sql = $sql." and dstaddr = ".$this->null_check($param["dstaddr"]);
                                    }
                                }

                                if($param["callback"] != "" && $param["callback"] != null && $param["callback"] != "undefined"){ //빈값이 아닌경우
                                    if($k == 0){
                                        $sql = $sql." callback = ".$this->null_check($param["callback"]);
                                    }else{
                                        $sql = $sql." and callback = ".$this->null_check($param["callback"]);
                                    }  
                                }
                                if($param["type"] == 0){
                                    if($k == 0){
                                        $sql = $sql." sender_key is null";
                                    }else{
                                        $sql = $sql." and sender_key is null"; //type이 0이면 일반 메세지
                                    }
                                    
                                }else{
                                    if($k == 0){
                                        $sql = $sql." sender_key is not null";
                                    }else{
                                        $sql = $sql." and sender_key is not null"; //type이 0이 아니면 카카오 메세지
                                    }
                                }
                                if($param["user_idx"] != 1){
                                    $sql = $sql ." and opt_id = ".$param["user_idx"]." ";
                                }
                                if($count != 0){
                                    $sql = $sql." union all ";
                                }
                            }
                        }
                        $j++;
                    }
                    $sql = $sql." order by send_time desc";
                }
                if($sql != ""){
                    $result = $this->conn->db_select($sql);
                    if($result["result"] == "1"){
                        $this->result = $result;
                        $this->result["message"] = "msg_result table 검색 성공";
                    }else{
                        $this->result["result"] = "0";
                        $this->result["error_code"] = "10";
                        $this->result["message"] = "msg_result table 검색 실패";
                    }
                }
            }
            echo json_encode($this->result,JSON_UNESCAPED_UNICODE);
        }
        //search_msg에서 중복되는 sql문 정리
        function search_msg_sql($sql, $param){
            if($param["msg_type"] != 0){ //전체 선택이 아닌경우
                if($param["msg_type"] == 3){
                    $sql = $sql." and msg_type = ".$param["msg_type"]." and filecnt != 0";
                }else if($param["msg_type"] == 2){
                    $sql = $sql." and (msg_type = ".$param["msg_type"]." or (msg_type = 3 and filecnt = 0))";
                }else{
                    $sql = $sql." and msg_type = ".$param["msg_type"];
                }
            }
            if($param["send_type"] != 0){ //전체 선택이 아닌경우
                // $sql = $sql." and send_type = ".$param["send_type"];
                if($param["send_type"] == 1){
                    $sql = $sql." and result = 100";
                }else{
                    $sql = $sql." and result > 100";
                }
            }
            if($param["dstaddr"] != "" && $param["dstaddr"] != null && $param["dstaddr"] != "undefined"){ //빈값이 아닌경우
                $sql = $sql." and dstaddr = ".$this->null_check($param["dstaddr"]);
            }
            if($param["callback"] != "" && $param["callback"] != null && $param["callback"] != "undefined"){ //빈값이 아닌경우
                $sql = $sql." and callback = ".$this->null_check($param["callback"]);
            }
            if($param["type"] == 0){
                $sql = $sql." and sender_key is null"; //type이 0이면 일반 메세지
            }else{
                $sql = $sql." and sender_key is not null"; //type이 0이 아니면 카카오 메세지
            }
            if($param["user_idx"] != 1){
                $sql = $sql . " and opt_id = ".$param["user_idx"]." ";
            }


//			print_r($sql);
            return $sql;
        }


        /********************************************************************* 
        // 함 수 : stateday()
        // 설 명 : 일별통계
        // 만든이 : 최진혁
        *********************************************************************/
        function stateday(){
            $param = $this->param;
            if($this->value_check(array("start_date","end_date"))){

                $sql = "select table_name as t from information_schema.tables ";
                $sql = $sql . "where table_schema = 'msg' ";
                $sql = $sql . "and table_name like '%msg_result_%'";
    
                $result =$this->conn->db_select($sql);
                if($result["result"] == 0){
                    $this->result = $result;
                }else{
                    //0 : t -> 테이블 이름
                    $table = $result["value"];
                    $sql = "select count(*) as total, DATE(request_time) as basedate, msg_type, filecnt, SUM(if(result != 100, 1, 0)) as fail, SUM(if(result = 100, 1, 0)) as success from ";
                    for($i = 0; $i<count($table); $i++){
                        if(count($table) == 1){
                            $sql = $sql . " ( select * from " . $table[$i]["t"] . " ";
                            $sql = $sql . " where request_time >= ".$this->null_check($param["start_date"])." and request_time <= ".$this->null_check($param['end_date']).") ";
                        }else{
                            if($i == (count($table) -1)){
                                $sql = $sql . " UNION ( select * from " . $table[$i]["t"] . " ";
                                $sql = $sql . " where request_time >= ".$this->null_check($param["start_date"])." and request_time <= ".$this->null_check($param['end_date']).") )  ";
                            }else if($i == 0){
                                $sql = $sql . " ( ( select * from " . $table[$i]["t"] . " ";
                                $sql = $sql . " where request_time >= ".$this->null_check($param["start_date"])." and request_time <= ".$this->null_check($param['end_date']).") ";
                            }else{
                                $sql = $sql . " UNION ( select * from " . $table[$i]["t"] . " ";
                                $sql = $sql . " where request_time >= ".$this->null_check($param["start_date"])." and request_time <= ".$this->null_check($param['end_date'])." ) ";
                            }
                        }
                    }
                    $sql = $sql . " as t ";
                    if($param["msg_type"] != 0){
                        if($param["msg_type"] == 1){
                            $sql = $sql . " where t.msg_type = 1 or t.msg_type = 2 ";    
                        }else if($param["msg_type"] == 2){
                            $sql = $sql . " where t.msg_type = 3 and t.filecnt = 0 ";
                        }else if($param["msg_type"] == 3){
                            $sql = $sql . " where (t.msg_type = 3 and t.filecnt != 0) or (t.msg_type = 4) ";
                        }else if($param["msg_type"] == 6){
                            $sql = $sql . " where t.msg_type = 6 ";
                        }else if($param["msg_type"] == 7){
                            $sql = $sql . " where t.msg_type = 7 ";
                        }
                    }
                    $sql = $sql . " group by basedate ";
                    
                    $result = $this->conn->db_select($sql);
                    if($result["result"] == 0){
                        $this->result = $result;
                    }else{
                        $this->result = $result;
                    }
                }
            }
            echo json_encode($this->result,JSON_UNESCAPED_UNICODE);
        }

        

        /********************************************************************* 
        // 함 수 : statemonth()
        // 설 명 : 일별통계
        // 만든이 : 최진혁
        *********************************************************************/
        function statemonth(){
            $param = $this->param;
            if($this->value_check(array("year_date"))){

                $sql = "select table_name as t from information_schema.tables ";
                $sql = $sql . "where table_schema = 'msg' ";
                $sql = $sql . "and table_name like '%msg_result_".$param["year_date"]."%'";
    
                $result =$this->conn->db_select($sql);
                if($result["result"] == 0){
                    $this->result = $result;
                }else{
                    //0 : t -> 테이블 이름
                    $table = $result["value"];
                    $sql = "select count(*) as total, MONTH(request_time) as basedate, msg_type, filecnt, SUM(if(result != 100, 1, 0)) as fail, SUM(if(result = 100, 1, 0)) as success from ";
                    for($i = 0; $i<count($table); $i++){
                        if(count($table) == 1){
                            $sql = $sql . " ( select * from " . $table[$i]["t"] . " ) ";
                        }else{
                            if($i == (count($table) -1)){
                                $sql = $sql . " UNION ( select * from " . $table[$i]["t"] . " ) ) ";
                            }else if($i == 0){
                                $sql = $sql . " ( ( select * from " . $table[$i]["t"] . " ) ";
                            }else{
                                $sql = $sql . " UNION ( select * from " . $table[$i]["t"] . " ) ";
                            }
                        }
                    }
                    $sql = $sql . " as t ";
                    if($param["msg_type"] != 0){
                        if($param["msg_type"] == 1){
                            $sql = $sql . " where t.msg_type = 1 or t.msg_type = 2 ";    
                        }else if($param["msg_type"] == 2){
                            $sql = $sql . " where t.msg_type = 3 and t.filecnt = 0 ";
                        }else if($param["msg_type"] == 3){
                            $sql = $sql . " where (t.msg_type = 3 and t.filecnt != 0) or (t.msg_type = 4) ";
                        }else if($param["msg_type"] == 6){
                            $sql = $sql . " where t.msg_type = 6 ";
                        }else if($param["msg_type"] == 7){
                            $sql = $sql . " where t.msg_type = 7 ";
                        }
                    }
                    $sql = $sql . " group by basedate ";
                    
                    $result = $this->conn->db_select($sql);
                    if($result["result"] == 0){
                        $this->result = $result;
                    }else{
                        $this->result = $result;
                    }
                }
            }
            echo json_encode($this->result,JSON_UNESCAPED_UNICODE);
        }


        
        /********************************************************************* 
        // 함 수 : session_receiver_list()
        // 설 명 : 세션 수신자리스트 저장
        // 만든이 : 최진혁
        *********************************************************************/
        function session_receiver_save(){
            $param = $this->param;
            if($this->value_check(array("save_list"))){
                $session = new Session();
                $session->receiver_list($param["save_list"]);

                $this->result["result"] = 1;
            }
            echo json_encode($this->result,JSON_UNESCAPED_UNICODE);
        }

        /********************************************************************* 
        // 함 수 : session_receiver_remove()
        // 설 명 : 세션 수신자리스트 해제
        // 만든이 : 최진혁
        *********************************************************************/
        function session_receiver_remove(){
            $session = new Session();
            $session->receiver_remove();

            $this->result["result"] = 1;
            echo json_encode($this->result,JSON_UNESCAPED_UNICODE);
        }
		
        /********************************************************************* 
        // 함 수 : send_k_f_talk()
        // 설 명 : 카카오 친구톡 보내기
        // 만든이 : 최진혁
        *********************************************************************/
        function send_k_f_talk(){
            $param = $this->param;
            if($this->value_check(array("text","k_send_profile", "k_send_number"))){

                // 수신자 목록
                $receiver_number = json_decode($param["receiver_list"], true);

                //이미지 파일
                $file = $_FILES["files"];
                $folder = $this->dir . "/mmsimg/";
                if(!is_dir($folder)){
                    mkdir($folder);
                }
                $file_name_arr = array();
                $real_file_name_arr = array();
                $temp_file_arr = array();
                $file_cnt = 0;
                foreach($file["error"] as $n => $f_err){
                    if($f_err != "4"){
                        $name = $file["name"][$n];
                        $tmp_name = $file["tmp_name"][$n];
                        $info = new SplFileInfo($name);
                        $file_name = $this->rand_name() . "." . $info->getExtension();
                        $file_name = $this->file_name_check(array(
                            "folder" => $folder,
                            "file_name" => $file_name,
                            "extension" => $info->getExtension(),
                        ));
                        if(move_uploaded_file($tmp_name, $folder.$file_name)){
                            array_push($real_file_name_arr, $name);
                            array_push($file_name_arr, $folder.$file_name);
                            array_push($temp_file_arr, $tmp_name);
                            $file_cnt++;
                        }
                        // $file_cnt++;
                    }
                }

                $msg_count = count($receiver_number);
                $user = $param["user_idx"];

                $result = $this->user_msg_count(array(
                    "msg_type" => 7,
                    "msg_count" => $msg_count,
                    "user_idx" => $user,
                    "file_cnt" => $file_cnt,
                    )
                );
                
                if($result["result"] == 0){
                    $this->result = $result;
                }else{

                    // 프로필idx로 디비 검색
                    $sql = "select * from callback_pf ";
                    $sql .= "where idx = ".$param["k_send_profile"]." ";

                    $profile_result = $this->conn->db_select($sql);
                    if($profile_result["result"] == 0){
                        $this->result = $profile_result;
                    }else{
                        // 발신번호 idx로 디비 검색
                        $sql = "select * from callback_num ";
                        $sql .= "where idx = ".$param["k_send_number"]." ";

                        $number_result = $this->conn->db_select($sql);
                        if($number_result["result"] ==0){
                            $this->result = $number_result["result"];
                        }else{
                            $number_list = $number_result["value"];
                            $profile_list = $profile_result["value"];

                            // 첨부 json값 버튼 , 이미지
                            $attach = json_decode($param["attach"], true);

                            if($file_cnt != 0){
                                if($param["img_link"] != ""){
                                    $attach["attachment"]["image"] = array(
                                        "img_url" => "%s",
                                        "img_link" => $param["img_link"],
                                    );    
                                }
                            }
                            $attach = json_encode($attach,JSON_UNESCAPED_UNICODE);
                            $attach = str_replace('\\/', '/', $attach);

                            if('{"attachment":{"button":[]}}' == $attach){
                                $attach = null;
                            }
                            //수신자 리스트
                            //예약
                            if(isset($param["reserve_date"])){
                                $request_time = $param["reserve_date"] . " " . $param["reserve_time"];
                                $request_time = $this->null_check($request_time);
                            }else{
                                $request_time = "sysdate()";
                            }

                            $sql = "insert into msg_queue(msg_type, dstaddr, callback, stat, subject, text, ";
                            if($param["replace_flag"] == 1){
                                $sql .= " text2, ";
                            }
                            $sql .= " request_time, filecnt, ";
                            if($file_cnt != 0){
                                $sql .= " fileloc1, ";
                            }
                            $sql .= " k_next_type, sender_key ";
                            if($attach != null){
                                $sql .= " ,k_attach ";
                            }
                            $sql .= ") ";
                            $sql .= "values ";
                            for($i = 0; $i<count($receiver_number); $i++){
                                if(count($receiver_number) == 1){
                                    $sql .= "('7', ";
                                    $sql .= " ".$this->null_check($receiver_number[$i])." , ";
                                    $sql .= " ".$this->null_check($number_list[0]["callback_num"])." , ";
                                    $sql .= " 0, '카카오 친구톡 ', ";
                                    $sql .= " ".$this->null_check($param["text"]).", ";
                                    if($param["replace_flag"] ==1){
                                        if($param["replace_msg"] == 1){
                                            $sql .= " ".$this->null_check($param["replace_msg_text"]).", ";
                                        }else{
                                            $sql .= " ".$this->null_check($param["text"]).", ";
                                        }
                                    }
                                    $sql .= " ".$request_time.", ".$file_cnt." , ";
                                    if($file_cnt != 0){
                                        $sql .= " ".$this->null_check($file_name_arr[0])." , ";
                                    }
                                    if($param["replace_flag"] == 1){
                                        if($file_cnt != 0){
                                            $sql .= " 9, ";
                                        }else if($file_cnt == 0 && $param["msg_type"] == 1){
                                            $sql .= " 7, ";
                                        }else if($file_cnt == 0 && $param["msg_type"] == 3){
                                            $sql .= " 8, ";
                                        }else{
                                            $sql .= " 7, ";
                                        }
                                    }else{
                                        $sql .= " 0, ";
                                    }
                                    $sql .= " ".$this->null_check($profile_list[0]["profile_key"])." ";
                                    if($attach != null){
                                        $sql .= ", '".$attach."' ";
                                    }
                                    $sql .= " )";

                                }else{
                                    if($i == count($receiver_number) -1 ){
                                        $sql .= "('7', ";
                                        $sql .= " ".$this->null_check($receiver_number[$i])." , ";
                                        $sql .= " ".$this->null_check($number_list[0]["callback_num"])." , ";
                                        $sql .= " 0, '카카오 친구톡 ', ";
                                        $sql .= " ".$this->null_check($param["text"]).", ";
                                        if($param["replace_flag"] ==1){
                                            if($param["replace_msg"] == 1){
                                                $sql .= " ".$this->null_check($param["replace_msg_text"]).", ";
                                            }else{
                                                $sql .= " ".$this->null_check($param["text"]).", ";
                                            }
                                        }
                                        $sql .= " ".$request_time.", ".$file_cnt." , ";
                                        if($file_cnt != 0){
                                            $sql .= " ".$this->null_check($file_name_arr[0])." , ";
                                        }
                                        if($param["replace_flag"] == 1){
                                            if($file_cnt != 0){
                                                $sql .= " 9, ";
                                            }else if($file_cnt == 0 && $param["msg_type"] == 1){
                                                $sql .= " 7, ";
                                            }else if($file_cnt == 0 && $param["msg_type"] == 3){
                                                $sql .= " 8, ";
                                            }else{
                                                $sql .= " 7, ";
                                            }
                                        }else{
                                            $sql .= " 0, ";
                                        }
                                        $sql .= " ".$this->null_check($profile_list[0]["profile_key"])." ";
                                        if($attach != null){
                                            $sql .= ", '".$attach."' ";
                                        }
                                        $sql .= " )";
                                    }else{
                                        $sql .= "('7', ";
                                        $sql .= " ".$this->null_check($receiver_number[$i])." , ";
                                        $sql .= " ".$this->null_check($number_list[0]["callback_num"])." , ";
                                        $sql .= " 0, '카카오 친구톡 ', ";
                                        $sql .= " ".$this->null_check($param["text"]).", ";
                                        if($param["replace_flag"] ==1){
                                            if($param["replace_msg"] == 1){
                                                $sql .= " ".$this->null_check($param["replace_msg_text"]).", ";
                                            }else{
                                                $sql .= " ".$this->null_check($param["text"]).", ";
                                            }
                                        }
                                        $sql .= " ".$request_time.", ".$file_cnt." , ";
                                        if($file_cnt != 0){
                                            $sql .= " ".$this->null_check($file_name_arr[0])." , ";
                                        }
                                        if($param["replace_flag"] == 1){
                                            if($file_cnt != 0){
                                                $sql .= " 9, ";
                                            }else if($file_cnt == 0 && $param["msg_type"] == 1){
                                                $sql .= " 7, ";
                                            }else if($file_cnt == 0 && $param["msg_type"] == 3){
                                                $sql .= " 8, ";
                                            }else{
                                                $sql .= " 7, ";
                                            }
                                        }else{
                                            $sql .= " 0, ";
                                        }
                                        $sql .= " ".$this->null_check($profile_list[0]["profile_key"])." ";
                                        if($attach != null){
                                            $sql .= ", '".$attach."' ";
                                        }
                                        $sql .= " ),";
                                    }
                                }
                            }
                            $result = $this->conn->db_insert($sql);
                            if($result["result"] == 0){
                                $this->result = $result;
                            }else{
                                $this->result = $result;
                            }

                        }
                    }
                }

            }
            echo json_encode($this->result,JSON_UNESCAPED_UNICODE);
        }


		
        /********************************************************************* 
        // 함 수 : send_k_talk()
        // 설 명 : 카카오 알림톡 보내기
        // 만든이 : 최진혁
        *********************************************************************/
        function send_k_talk(){
            $param = $this->param;
            if($this->value_check(array("text","k_send_profile", "k_send_number", "k_select_template"))){
                // 수신자 목록
                $receiver_number = json_decode($param["receiver_list"], true);
                $receiver_name = json_decode($param["receiver_name_list"], true);

                $msg_count = count($receiver_number);
                $user = $param["user_idx"];
                $file_count = 0;

                $result = $this->user_msg_count(array(
                    "msg_type" => 6,
                    "msg_count" => $msg_count,
                    "user_idx" => $user,
                    "file_cnt" => $file_count,
                    )
                );

				
                $message_length = mb_strwidth($param["text"], 'UTF-8');
                $param["msg_type"] = 1;
                if($message_length > 90){
                    $param["msg_type"] = 3;
                }
                
                if($result["result"] == 0){
                    $this->result = $result;
                }else{
                    // 프로필idx로 디비 검색
                    $sql = "select * from callback_pf ";
                    $sql .= "where idx = ".$param["k_send_profile"]." ";

                    $profile_result = $this->conn->db_select($sql);
                    if($profile_result["result"] == 0){
                        $this->result = $profile_result;
                    }else{
                        // 발신번호 idx로 디비 검색
                        $sql = "select * from callback_num ";
                        $sql .= "where idx = ".$param["k_send_number"]." ";

                        $number_result = $this->conn->db_select($sql);
                        if($number_result["result"] ==0){
                            $this->result = $number_result["result"];
                        }else{
                            
                            $sql = "select * from kakao_tpl ";
                            $sql .= "where idx = ".$param["k_select_template"]." ";

                            $template_result = $this->conn->db_select($sql);
                            if($template_result["result"] == 0){
                                $this->result = $template_result["result"];
                            }else{
                                $template_list = $template_result["value"];
                                if(count($template_list) == 0){
                                    $this->result["result"] = 0;
                                    $this->result["message"] = "템플릿을 찾을 수 없습니다.";
                                }else{
                                    
                                    $k_select_template = $template_list[0]["tpl_key"];
                                    $number_list = $number_result["value"];
                                    $profile_list = $profile_result["value"];

                                    // 첨부 json값 버튼 , 이미지
                                    $attach = $param["attach"];
                                    
                                    //수신자 리스트
                                    //예약
                                    if(isset($param["reserve_date"])){
                                        $request_time = $param["reserve_date"] . " " . $param["reserve_time"];
                                        $request_time = $this->null_check($request_time);
                                    }else{
                                        $request_time = "sysdate()";
                                    }

                                    $sql = "insert into msg_queue(msg_type, dstaddr, callback, stat, subject, text, ";
                                    if($param["replace_flag"] == 1){
                                        $sql .= " text2, ";
                                    }
                                    $sql .= " request_time, ";
                                    // $sql .= " k_next_type, sender_key, k_attach) ";
                                    $sql .= " k_next_type, sender_key, k_template_code ";
                                    if($attach != "null"){
                                        $sql .= ", k_attach ";
                                    }
                                    $sql .= ")";
                                    $sql .= "values ";
                                    for($i = 0; $i<count($receiver_number); $i++){
                                        $cur_text = str_replace("#{수신자명}",$receiver_name[$i], $param["text"]);
                                        if(count($receiver_number) == 1){
                                            $sql .= "('6', ";
                                            $sql .= " ".$this->null_check($receiver_number[$i])." , ";
                                            $sql .= " ".$this->null_check($number_list[0]["callback_num"])." , ";
                                            $sql .= " 0, '카카오 알림톡 ', ";
                                            $sql .= " ".$this->null_check($cur_text).", ";
                                            if($param["replace_flag"] ==1){
                                                if($param["replace_msg"] == 1){
                                                    $sql .= " ".$this->null_check($param["replace_msg_text"]).", ";
                                                }else{
                                                    $sql .= " ".$this->null_check($cur_text).", ";
                                                }
                                            }
                                            $sql .= " ".$request_time.",  ";
                                            if($param["replace_flag"] == 1){
                                                if($param["msg_type"] == 1){
                                                    $sql .= " 7, ";
                                                }else if($param["msg_type"] == 3){
                                                    $sql .= " 8, ";
                                                }else{
                                                    $sql .= " 7, ";
                                                }
                                            }else{
                                                $sql .= " 0, ";
                                            }
                                            $sql .= " ".$this->null_check($profile_list[0]["profile_key"]).", ".$this->null_check($k_select_template)." ";
                                            if($attach == "null"){
                                                $sql .= " )";
                                            }else{
                                                $sql .= ",'".$attach."' ) ";
                                            }
                                        }else{
                                            if($i == count($receiver_number) -1 ){
                                                $sql .= "('6', ";
                                                $sql .= " ".$this->null_check($receiver_number[$i])." , ";
                                                $sql .= " ".$this->null_check($number_list[0]["callback_num"])." , ";
                                                $sql .= " 0, '카카오 알림톡 ', ";
                                                $sql .= " ".$this->null_check($cur_text).", ";
                                                if($param["replace_flag"] ==1){
                                                    if($param["replace_msg"] == 1){
                                                        $sql .= " ".$this->null_check($param["replace_msg_text"]).", ";
                                                    }else{
                                                        $sql .= " ".$this->null_check($cur_text).", ";
                                                    }
                                                }
                                                $sql .= " ".$request_time.", ";
                                                if($param["replace_flag"] == 1){
                                                    if($param["msg_type"] == 1){
                                                        $sql .= " 7, ";
                                                    }else if($param["msg_type"] == 3){
                                                        $sql .= " 8, ";
                                                    }else{
                                                        $sql .= " 7, ";
                                                    }
                                                }else{
                                                    $sql .= " 0, ";
                                                }
                                                $sql .= " ".$this->null_check($profile_list[0]["profile_key"]).", ".$this->null_check($k_select_template)." ";
                                                if($attach == "null"){
                                                    $sql .= " )";
                                                }else{
                                                    $sql .= ",'".$attach."' ) ";
                                                }
                                            }else{
                                                $sql .= "('6', ";
                                                $sql .= " ".$this->null_check($receiver_number[$i])." , ";
                                                $sql .= " ".$this->null_check($number_list[0]["callback_num"])." , ";
                                                $sql .= " 0, '카카오 알림톡 ', ";
                                                $sql .= " ".$this->null_check($cur_text).", ";
                                                if($param["replace_flag"] ==1){
                                                    if($param["replace_msg"] == 1){
                                                        $sql .= " ".$this->null_check($param["replace_msg_text"]).", ";
                                                    }else{
                                                        $sql .= " ".$this->null_check($cur_text).", ";
                                                    }
                                                }
                                                $sql .= " ".$request_time.", ";
                                                if($param["replace_flag"] == 1){
                                                    if($param["msg_type"] == 1){
                                                        $sql .= " 7, ";
                                                    }else if($param["msg_type"] == 3){
                                                        $sql .= " 8, ";
                                                    }else{
                                                        $sql .= " 7, ";
                                                    }
                                                }else{
                                                    $sql .= " 0, ";
                                                }
                                                $sql .= " ".$this->null_check($profile_list[0]["profile_key"]).", ".$this->null_check($k_select_template)." ";
                                                if($attach =="null"){
                                                    $sql .= " ),";
                                                }else{
                                                    $sql .= ",'".$attach."' ), ";
                                                }
                                            }
                                        }
                                    }

                                    $result = $this->conn->db_insert($sql);
                                    if($result["result"] == 0){
                                        $this->result = $result;
                                    }else{
                                        $this->result = $result;
                                    }

                                }

                            }


                        }
                    }
                }


                
            }
            echo json_encode($this->result,JSON_UNESCAPED_UNICODE);
        }

        /********************************************************************* 
        // 함 수 : 발송대기중 건()
        // 설 명 : 
        // 만든이 : 최진혁
        *********************************************************************/
        function ready_msg_queue(){
            $param = $this->param;
            $sql = "select * from msg_queue ";
            if($param["result_kind"] == "kakao"){
                $sql .= "where msg_type = 7 or msg_type = 6 ";
            }else{
                $sql .= "where msg_type != 7 and msg_type != 6 ";
            }
            $sql .= " order by mseq desc";
            $result = $this->conn->db_select($sql);
            if($result["result"] == 0){
                $this->result = $result;
            }else{
                $this->result = $result;
            }

            echo json_encode($this->result,JSON_UNESCAPED_UNICODE);
        }
    }
    
?>