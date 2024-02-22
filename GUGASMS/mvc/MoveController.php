<?php
    class MoveController{
        private $param;
        private $dir;
        private $version;
        function __construct($init_object){
            $this->param = $init_object["json"];
            $this->dir = $init_object["dir"];
            $this->version = $init_object["version"];
            $this->session=new Session();
            $this->move();
        }
        /********************************************************************* 
        // 함수 설명- 엡 페이지 이동 담당
        // 만든이: 안정환 
        *********************************************************************/
        function move(){
            $param1 = null;
            if($this->session->is_admin_login_php()){
                $user_idx = $this->session->get_admin_idx();
                $user_role =$this->session->get_admin_role();

                $receiver = $this->session->get_receiver_list();

                if(isset($this->param["param1"])){
                    $param1 = $this->param["param1"];
                    if($param1 == "user_set"){
                        if($user_role != 2){
                            include_once $this->dir.$this->create_page($param1);
                        }else{
                            include_once $this->dir."page/admin/main.php";
                        }
                    }else if($param1 == "adm_login"){
                        include_once $this->dir."page/admin/adm_login.php";
                    }else{
                        include_once $this->dir.$this->create_page($param1);
                    }
                }else{
                    $param1 = "main";
                    include_once $this->dir."page/admin/main.php";
                }
            }else{
                $user_idx = 0;
                $user_role = 0;
                $user_role = 0;
                include_once $this->dir."page/admin/adm_login.php";
            }
        }
        function create_page($param1){
            return "page/admin/".$param1.".php";
        }


        function side_bar(){
            if($this->session->is_admin_login_php()){
                $user_idx = $this->session->get_admin_idx();
                $user_role = $this->session->get_admin_role();
                if($user_role == "2" || $user_role == "0"){
                    echo "style='display:none'";
                }
            }
        }
    }
?>