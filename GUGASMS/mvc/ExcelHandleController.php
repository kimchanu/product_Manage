<?php
class ExcelHandleController {
    private $param;
    private $dir;
    private $version;
    private $db;

    function __construct($init_object) {
        $this->param = $init_object["json"];
        $this->dir = $init_object["dir"];
        $this->version = $init_object["version"];
        $this->db = $init_object["db"];
        
        $json = $this->param;
        $model = new ExcelHandleModel($init_object);
        if (isset($json["param1"])) {
            $param1 = $json["param1"];
            if (method_exists($model, $param1)) {
                $model->$param1();
            } else {
                $this->sendError("Method not found");
            }
        } else {
            $this->sendError("Not found");
        }
    }

    private function sendError($message) {
        $error = array(
            "result" => "0",
            "error_code" => "404",
            "message" => $message,
        );
        echo json_encode($error, JSON_UNESCAPED_UNICODE);
    }
}
?>