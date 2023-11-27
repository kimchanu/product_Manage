<?php
   class App {
      function __construct($json,$dir){
            // $version = "?v=1.0.9"; //javascript 수정시 version up
            date_default_timezone_set('Asia/Seoul');
            $version = "?v=".date("Y-m-d H:i:s"); //javascript 수정시 version up
            $db = new db("msg"); // DB변경시 여기 수정
            $init_object = array();
            $init_object["dir"] = $dir;
            $init_object["adm_dir"]="GUGASMS/";
            $init_object["json"] = $json;
            $init_object["version"] = $version;
            $init_object["db"] = new AppDB($db); //db 연결시 주석 해제
            // print_r($json);
            if(!isset($json["move_page"])){
				$json["move_page"]="1";
            }
            $data = json_encode($json);

            $init_object["data"]=$data;
            if(isset($json["ctl"])){
                $ctl = $json["ctl"]."Controller";                
                new $ctl($init_object);
            }else{
                $controller = new MoveController($init_object);
            }
        }
    }
?>