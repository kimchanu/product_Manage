<?php
class AddrController{
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
        $model = new AddrModel($init_object);
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

    // function open_api(){
    //     $ch = curl_init();
    //     $url = "https://msds.kosha.or.kr/openapi/service/msdschem/chemlist?serviceKey=3h5o8Pm7wctZGh8LPV70Bcu0Z38%2BE3swtfbcO3%2F4%2FLRh3E9E62nhm5o1JPLHNs7Sxb3MOxucrHIFmzxYWoOt8A%3D%3D&searchWrd=wd&searchCnd=0"
    //     $data =file_get_contents($url);
    //     $xml = simplexml_load_string($data);
    //     $obj_addr=$xml->body[0]->items[0];//->item[0];
    // }
}
?>