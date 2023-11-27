<?php
    class AdminController{
        function __construct($array){
            $model = new AdminModel($array);
            $json = $array["json"];
            /********************************************************************* 
            // 설 명 : 관련 함수 Model로 이동
            // 담당자: 이은영
            *********************************************************************/
            $param1 = null;
            if(isset($json["param1"])){
                $param1 = $json["param1"];
                if($param1=="login"){//로그인 세션 체크는 필요 없기 때문에 따로 설정
                    $model->login();
                }else{
                    $session = new Session();
                    if($session->is_admin_login()){
                        $model->$param1();
                    }
                }
            }
        }
    }
?>