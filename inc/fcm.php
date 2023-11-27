<?php
	class fcm {
		private $project;
		//$project : send에 있음 생성할때 프로젝트 이름으로 server key 구분
		function __construct($project){
			$this->project = $project;
		}
		//list 는 토큰 값 fcm 이라는 매개변수로 전달
		//msg {"title"=>"title", "message"=>"message", "havior"=>"notice"}
		//setting : sound : {'default'}
		function send_fcm ($list, $msg, $setting){

			$notification = $msg;
			
			foreach($setting as $key => $value){
				$notification[$key]=$value;
			}
			$notification["data"]=$msg;

			if($list){
				$tokens = array();
				for($i=0;$i<count($list);$i++){
					$fcm = $list[$i]["fcm"];
					if($fcm!=""){
						array_push($tokens,$fcm);
					}

					if(($i/499)==1){
						$fields = array(
							'registration_ids' => $tokens,
							'data' => $notification,
							'notification'=>$notification
						);
						$this->send($fields);
						$tokens = array();
					}

					if((count($list)-1)==$i){
						if(count($tokens)>0){
							$fields = array(
								'registration_ids' => $tokens,
								'data' => $notification,
								'notification'=>$notification
							);
							$this->send($fields);
							$tokens = array();
						}
					}
					
				}

				
			}else{
				return false;
			}
			
		}

		function send($fields){
			$url = 'https://fcm.googleapis.com/fcm/send';

			$headers=null;
			if($this->project=="disital_art"){
				$headers = array(
					'Authorization:key =AAAApG2VzxM:APA91bEGk-Q0_A7a0tf_2ONY6CQhy1lKav6GvWqn-j6gLRUSDfrGeedeVlyQx8pvrfa0k_vPOngTSgp4hlUVQgQ0soqJwLVKT-wvos-iyH3ESsuKRf4-noNHrGMJrX0kkAmd4ZMcboPp' ,
					'Content-Type: application/json');
			}elseif($this->project=="persona"){
				$headers = array(
					'Authorization:key =AAAAexthHm4:APA91bEFC6Q12vm-Jm2bc_1a_ak0liEdS6vrplBCTrEfowZr1GfCyUVy0W1iBTfai8D2VhE5b4uqpb0Gcd5jCx3QTz79X68BQ0vgGiVhVKl-TRdgpjkfmy5Hjz-VUhJo5mi03zBiSMuv' ,
					'Content-Type: application/json');
			}elseif($this->project=="soulmatie"){
				$headers = array(
					'Authorization:key =AAAA94s8B-U:APA91bFy69mOXBgMLkF1L1krwkclL-RMeSqkNyKLbf4ZVh2ShE_Y_wgZqxVXrMNHgh7qB8WgtbAUcElHt4dH1djf__N6z_fUbHTaep_QYS88CK36D3g-l2PpR67O-zslO3R-4vJxk3GX' ,
					'Content-Type: application/json');
			}

	

			$ch = curl_init();
			curl_setopt($ch, CURLOPT_URL, $url);
			curl_setopt($ch, CURLOPT_POST, true);
			curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
			curl_setopt ($ch, CURLOPT_SSL_VERIFYHOST, 0);
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
			curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($fields));
			$result = curl_exec($ch);
			if ($result === FALSE) {
				die('Curl failed: ' . curl_error($ch));
			}
			
			if ($result === FALSE) {
				return false;
			}else{
				curl_close($ch);
				return true;
			}
			
		}
	}
?>