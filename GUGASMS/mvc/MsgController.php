<?php
class MsgController{
    private $param;
    private $dir;
    private $version;
    private $db;

    function __construct($init_object){
        $this->param = $init_object["json"];
        $this->dir = $init_object["dir"];
        $this->version = $init_object["version"];
        $this->db = $init_object["db"];
        
        $json = $this->param;
        $model = new MsgModel($init_object);
        if(isset($json["param1"])){
            $param1 = $json["param1"];
            $model->$param1();
        }else{
            $error = array(
                "result" => "0",
                "error_code" => "404",
                "message" => "Not found",
            );
            echo json_encode($error,JSON_UNESCAPED_UNICODE);
        }
    }
}
?>