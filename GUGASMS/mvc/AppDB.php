<?php
class AppDB extends gf
{
    private $conn;

    function __construct($db){
        $this->conn = $db;
        $this->result = array(
            "result" => null,
            "error_code" => null,
            "message" => null,  
            "value" => null,
        );
    }
    
    /********************************************************************* 
    // 함수 설명- 데이터 베이스 select문을 실행함
    // 매개변수 : $select_sql
    // 만든이: 안정환
    // 수정이:
    *********************************************************************/
    function db_select($sql){
        
        $list = $this->conn->get_query($sql);
        if($list["error_code"]){
            $this->result["result"]="0";
            $this->result["error_code"]=$list["error_code"];
            $this->result["message"]=$list["error_msg"];
            // $error_model = new Error_log($this->conn);
            // $error_model->error_add(json_encode($sql),"select");
        }else{
            $list = $this->fetchList($list["result"]);
            $this->result["result"]="1";
            $this->result["value"]=$list;
        }

        return $this->result;
    }

    /********************************************************************* 
    // 함수 설명- 데이터 베이스 update문을 실행함
    // 매개변수 : $select_sql
    // 만든이: 안정환
    // 수정이:
    *********************************************************************/
    function db_update($sql){
        $list = $this->conn->get_query($sql);
        if($list["error_code"]){
            $this->result["result"]="0";
            $this->result["error_code"]=$list["error_code"];
            $this->result["message"]=$list["error_msg"];
            // $error_model = new Error_log($this->conn);
            // $error_model->error_add(json_encode($sql),"update");
        }else{
            //update문이기때문에 value는 필요없음
            $this->result["result"]="1";
        }
        return $this->result;
    }

    /********************************************************************* 
    // 함수 설명- 데이터 베이스 insert문을 실행함
    // 매개변수 : $select_sql
    // 만든이: 안정환
    // 수정이:
    *********************************************************************/
    function db_insert($sql){
        $list = $this->conn->get_query($sql);
        if($list["error_code"]){
            $this->result["result"]="0";
            $this->result["error_code"]=$list["error_code"];
            $this->result["message"]=$list["error_msg"];
            // $error_model = new Error_log($this->conn);
            // $error_model->error_add(json_encode($sql),"insert");
        }else{
            $this->result["result"]="1";
            $this->result["value"] = $this->conn->get_conn()->insert_id;
        }
        return $this->result;
    }
    /********************************************************************* 
    // 함수 설명- 데이터 베이스 insert문을 실행함
    // 매개변수 : $select_sql
    // 만든이: 안정환
    // 수정이:
    *********************************************************************/
    function db_delete($sql){
        $list = $this->conn->get_query($sql);
        if($list["error_code"]){
            $this->result["result"]="0";
            $this->result["error_code"]=$list["error_code"];
            $this->result["message"]=$list["error_msg"];
            // $error_model = new Error_log($this->conn);
            // $error_model->error_add(json_encode($sql),"insert");
        }else{
            $this->result["result"]="1";
        }
        return $this->result;
    }

    function last_id(){
        return $this->conn->get_conn()->insert_id;
    }

    public function s_transaction(){
        $this->conn->s_transaction();
        $this->conn->begin();
    }

    public function begin(){
        $this->conn->s_transaction();
        $this->conn->begin();
    }

    public function commit(){
        $this->conn->commit();
    }

    public function rollback(){
        $this->conn->rollback();
    }

    public function close(){//fianl 변경 불가능
        $this->conn->close();
    }
}
