<?php 

class SMS {
    private $user_id    = "lbcontentssms";
    private $secure_key    = "73bfb8d0eea518afcf1d07b85ff22d32";
    private $sms_url    = "http://sslsms.cafe24.com/sms_sender.php"; // 전송요청 URL
    private $send_num    = array("070", "4095", "9278");
    
    /*

     * 등록된 전송번호는 010-2222-3333 일 경우엔 array("010", "2222", "3333") 으로...

     * 1544-9999 일 경우엔 array("1544", "9999") 로 설정
     * Cafe24 SMS 전송
     * $telnum    : 전송받을 전화번호
     * $message    : 전송할 문자열
     * $smstype    : LMS일 경우만 사용, LMS일 경우 L로 넘겨줘야 함
     * $subject : LMS일 경우만 사용, 제목
     * 
     * return 값
     * 배열
     * ["result"]    : 성공/실패 여부 true/false
     * ["error"]    : 실패 일 경우 코드에 따른 에러 메시지
     * ["remain"]    : 성공일 경우 남은 전송가능 건 수 
     * */
    
    public function sendSMS($telnum, $message, $smstype = null, $subject = null) {    
        $sms_url             = $this->sms_url;
        $sms["user_id"]        = base64_encode($this->user_id);
        $sms["secure"]        = base64_encode($this->secure_key);
        $sms["msg"]            = base64_encode(stripslashes($message));
        $data = "";
        if( $smstype == "L"){
            $sms["subject"] = base64_encode($subject);
        }
        
        $sms["rphone"]         = base64_encode($telnum);
        $sms["sphone1"]     = base64_encode($this->send_num[0]);
        $sms["sphone2"]     = base64_encode($this->send_num[1]);
        $sms["sphone3"]     = base64_encode($this->send_num[2]);
        $sms["rdate"]         = base64_encode("");
        $sms["rtime"]         = base64_encode("");
        $sms["mode"]         = base64_encode("1");
        $sms["returnurl"]     = base64_encode("");
        $sms["testflag"]     = base64_encode("");
        $sms["destination"] = strtr(base64_encode(""), "+/=", "-,");
        $returnurl             = "";
        $sms["repeatFlag"]    = base64_encode("");
        $sms["repeatNum"]     = base64_encode("");
        $sms["repeatTime"]     = base64_encode("");
        $sms["smsType"]     = base64_encode($smstype);
        $nointeractive         = "1";
        $host_info            = explode("/", $sms_url);
        $host                 = $host_info[2];
        $path                 = $host_info[3];
        srand((double)microtime()*1000000);
        $boundary             = "---------------------".substr(md5(rand(0,32000)),0,10);
        
        $header             = "POST /".$path ." HTTP/1.0\r\n";
        $header             .= "Host: ".$host."\r\n";
        $header             .= "Content-type: multipart/form-data, boundary=".$boundary."\r\n";
        
        foreach($sms AS $index => $value){
            $data    .= "--$boundary\r\n";
            $data    .= "Content-Disposition: form-data; name=\"".$index."\"\r\n";
            $data    .= "\r\n".$value."\r\n";
            $data    .= "--$boundary\r\n";
        }
        
        $header                .= "Content-length: " . strlen($data) . "\r\n\r\n";
        $fp                 = fsockopen($host, 80);
        
        $send_result    = array(
                "result"    => true,
                "error"        => "",
                "remain"    => 0
        );
        
        if ($fp) {
            fputs($fp, $header.$data);
            $rsp    = "";
            
            while (!feof($fp)) {
                $rsp    .= fgets($fp, 8192);
            }
            
            fclose($fp);
            $msg    = explode("\r\n\r\n", trim($rsp));
            $rMsg    = explode(",", $msg[1]);
            $Result    = $rMsg[0];
            $Count    = $rMsg[1];
        
            if ($Result == "success") {
                $send_result["result"]    = true;
                $send_result["remain"]    = $Count;
            } else if ($Result == "reserved") {
                $send_result["result"]    = false;
                $send_result["remain"]    = $Count;
            } else {
                $send_result["result"]    = false;
                $send_result["error"]    = ($smstype == "L") ? $this->getLMSErrorMsg($Result) : $this->getSMSErrorMsg($Result);
                $send_result["remain"]    = 0;
            }
        } else {
            $send_result["result"]    = false;
            $send_result["error"]    = "Connection Failed";
            $send_result["remain"]    = 0;
        }
        
        return $send_result;
    }
    
    
    function getSMSErrorMsg($error) {
        $sms_error  = array(
                "-100" => "서버 에러",
                "-101" => "변수 부족 에러",
                "-102" => "인증 에러",
                "-105" => "예약 시간 에러",
                "-110" => "1000건 이상 발송 불가",
                "-114" => "등록/인증되지 않은 발신번호",
                "-201" => "sms 건수 부족 에러",
                "-202" => "문자 '됬'은 사용불가능한 문자입니다.",
                "-203" => "sms 대량 발송 에러",
                "0001" => "서비스 번호 오류",
                "0002" => "메지시 구성 결여",
                "0003" => "메시지 포맷 오류",
                "0004" => "메시지 body길이 오류",
                "0005" => "Connect 필요",
                "0099" => "기타 오류(DB오류시스템장애)",
                "0044" => "스팸메시지 차단(배팅, 바카라, 도박, 섹스, liveno1 ,카지노 등을 포함한 스팸메시지는 발송이 실패됩니다.)",
                "3201" => "발송시각 오류",
                "3202" => "폰넘버 오류",
                "3203" => "SMS 메시지 Base64 Encoding 오류",
                "3204" => "CallBack메시지 Base64 Encoding 오류)",
                "3205" => "번호형식 오류",
                "3206" => "전송 성공",
                "3207" => "비가입자 결번 서비스정지",
                "3208" => "단말기 Power-off 상태",
                "3209" => "음영",
                "3210" => "단말기 메시지 FULL",
                "3211" => "기타에러(이통사)",
                "3214" => "기타에러(무선망)",
                "3213" => "번호이동관련",
                "3217" => "조합메시지 형식오류",
                "3218" => "메시지 중복 오류",
                "3219" => "월 송신건수 초과",
                "3220" => "UNKNOWN",
                "3221" => "착신번호 에러(자리수 에러)",
                "3222" => "착신번호 에러(없는 국번)",
                "3223" => "수신거부 메시지 부분 없음",
                "3224" => "21시 이후 광고"
        );

        if (isset($sms_error[$error])) {
             return $sms_error[(string)$error];
        } else {
            return "알 수 없는 오류";
        }
    }
    
    
    function getLMSErrorMsg($error) {
        $lms_error    = array(
                "1"     => "시스템 장애",
                "41"    => "MMS content 생성 실패",
                "42"    => "MMS 결과코드 에러",
                "112"   => "레포트 수신 시간 만료",
                "114"   => "번호도용/변작방지 차단",
                "116"   => "번호 세칙 위반",
                "202"   => "착신가입자없음",
                "203"   => "비가입자, 결번, 서비스정지 등 수신자 오류",
                "204"   => "단말기 전원 꺼짐",
                "205"   => "음영 지역",
                "206"   => "단말기 메시지 FULL",
                "207"   => "단말기 오류",
                "209"   => "번호이동된 가입자",
                "210"   => "SMS 착신전환회수초과",
                "211"   => "기간만료",
                "212"   => "이통사 오류",
                "216"   => "수신번호 오류",
                "245"   => "메시지 전송불가(단말기에서 착신 거부)",
                "253"   => "전송 실패(무선망), 단말기 일시정지",
                "254"   => "전송 실패(무선망 -> 단말기단), 가입자 VLR 없음",
                "2003"  => "미지원 단말",
                "4005"  => "이통사 서비스 에러",
                "4007"  => "클라이언트 오류",
                "4008"  => "통신사 서버 과부하",
                "4301"  => "미 가입자 에러 오류(KTF), 결번",
                "4305"  => "단말기 오류",
                "4307"  => "일시정지 가입자 오류",
                "6072"  => "MMS 미지원단말기",
                "8012"  => "SKT MMS 오류",
                "8200"  => "단말기 오류",
                "9999"  => "알 수 없는 에러"                
        );
        
        if (isset($lms_error[$error])) {
            return $lms_error[$error];
        } else {
            return "알 수 없는 오류";
        }
        
    }

    //핸드폰번호 -하이픈 달기
    function format_phone($phone){
        $phone = preg_replace("/[^0-9]/", "", $phone);
        $length = strlen($phone);
    
        switch($length){
          case 11 :
              return preg_replace("/([0-9]{3})([0-9]{4})([0-9]{4})/", "$1-$2-$3", $phone);
              break;
          case 10:
              return preg_replace("/([0-9]{3})([0-9]{3})([0-9]{4})/", "$1-$2-$3", $phone);
              break;
          default :
              return $phone;
              break;
        }
    }
}
?>