<?php
	class s3Manager {
		private $s3Client;
		private $region = 'ap-northeast-2';
		private $bucket_name = "persona";
		private $s3_key = "AKIAZTRDQI25JQPXYVMC";
		private $secret = "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";
		function __construct(){
			//use Aws\S3\S3Client;
			//use Aws\Exception\AwsException;
			try{
				$this->s3Client = new Aws\S3\S3Client([
					'region' => $this->region,
					'version' => 'latest',
					'credentials' => [
						'key' => $this->s3_key,
						'secret' => $this->secret
					]
				]);

			} catch(S3Exception $e){
				echo $e->getMessage() . "\n";
			}
		}

		public function createFolder($dir){
			try{//s3 사용자 홈페이지 소스저장 폴더 생성
				$result = $this->s3Client->putObject([
					'Bucket' => $this->bucket_name,
					'Key' => $dir,
					'ACL' => 'public-read'
				]);

			} catch(S3Exception $e){
				echo $e->getMessage() . "\n";
			}
		}

		public function setText($dir,$str){
			try{//s3 파일에 내용삽입
				$result = $this->s3Client->putObject([
					'Bucket' => $this->bucket_name,
					'Key' => $dir,
					'ACL' => 'public-read',
					'Body'   => $str
				]);

			} catch(S3Exception $e){
				echo $e->getMessage() . "\n";
			}
		}

		public function insertFile($dir,$file){
			$error_code = false;
			try{//s3 디렉토리에 파일 저장
				$result = $this->s3Client->putObject([
					'Bucket' => $this->bucket_name,
					'Key' => $dir,//위치및 파일 이름
					'SourceFile' => $file,//파일
					'ACL' => 'public-read'
				]);
			} catch(S3Exception $e){
				//return $e->getMessage();
				$error_code = "305";
			}

			return $error_code;
		}

		public function getData($file){
			try {//디렉토리의 파일 내용 가져오기
				// Get the object
				$result = $this->s3Client->getObject(array(
					'Bucket' => $this->bucket_name,
					'Key'    => $file
				));

				$data = $result['Body'];
			} catch (S3Exception $e) {
				echo $e->getMessage() . "\n";
			}

			return $data;
		}

		public function multiDel($link,$delete_array){//여러객체 삭제
			$array = array();
			$error_msg = false;
			foreach($delete_array as $key => $value){
				$del = array(
					"Key" => $link.$value
				);
				array_push($array,$del);
			}

			if(count($delete_array)>0){
				try{
					$result = $this->s3Client->deleteObjects(array(
						'Bucket'  => $this->bucket_name,
						'Delete' => array(
							'Objects' => $array
						)
					));

				} catch(S3Exception $e){
					//return $e->getMessage();
					$error_msg = "304";
				}
			}

			return $error_msg;
		}

		public function delFile($file){//여러 객체 삭제 (실제로 수정 필요함 사용은 하지 않고있음 
			$error_msg=false;
			try{
				$result = $this->s3Client->deleteObject(array(
					'Bucket' => $this->bucket_name,
					'Key'    => $file
				));

			} catch(S3Exception $e){
				//$error_msg = $e->getMessage();
				$error_msg = "304";
			}

			return $error_msg;
		}

		public function folderList($dir){//폴더 리스트 
			$result= $this->s3Client->listObjects(array(
				"Bucket" => $this->bucket_name,
				"Prefix" => $dir
			));

			$files = $result["Contents"];

			$s3path = preg_replace("/\\/\$/", "", $dir);
			$s3path = preg_replace("/^\\//", "", $s3path);

			$finalfiles = array();
			$folders = array();
			foreach ($files as $file) {
				if (preg_match("|^" . preg_replace("/^\\//", "", $s3path) . '/' . "[^/]*/?\$|", $file['Key'])) {
					$fname = $file['Key'];
					if (!$fname || $fname == preg_replace("/\\/\$/", "", $s3path) || $fname == preg_replace("/\$/", "/", $s3path)) {
						continue;
					}
					$finalfiles[] = preg_replace("/\\/\$/", "", $fname);
				} else {
					$matches = array();
					if ($res = preg_match("|^" . preg_replace("/^\\//", "", $s3path) . '/' . "(.*?)\\/|", $file['Key'], $matches)) {
						$folders[$matches[1]] = true;
					}
				}
			}
			// Folders retrieved differently, as it's not a real object on S3
			foreach ($folders as $forlderName => $tmp) {
				if (!in_array(preg_replace("/^\\//", "", $s3path) . "/" . $forlderName, $finalfiles)) {
					$finalfiles[] = preg_replace("/^\\//", "", $s3path) . "/" . $forlderName;
				}
			}

			sort($finalfiles);

			return $finalfiles;
		}

		public function objectList($dir){
			$result= $this->s3Client->listObjects(array(
				"Bucket" => $this->bucket_name,
				"Prefix" => $dir
			));

			$ary = array();
			
			$count = 0;
			foreach ($result['Contents'] as $object) {
				$ary[$count] = $object['Key'];
				$count = $count+1;
			}

			return $ary;
		}

		public function AllObjectList($dir){
			try {
				$results = $this->s3Client->getPaginator('ListObjects', array(
					"Bucket" => $this->bucket_name,
					"Prefix" => $dir
				));
					
				$ary = array();
			
				$count = 0;
				foreach ($results as $result) {
					foreach ($result['Contents'] as $object) {
						print_r($object);
						$ary[$count] = $object['Key'];
						$count = $count+1;
					}
				}
			} catch (S3Exception $e) {
				//echo $e->getMessage() . PHP_EOL;
			}

			return $ary;
		}

		public function ObjectDownLoad($file,$file_name){
			try {
				// Get the object.
				$result = $this->s3Client->getObject(array(
					"Bucket" => $this->bucket_name,
					'Key'    => $file
				));
			
				// Display the object in the browser.
				header ( "Content-Type: {$result['ContentType']}" );
                header ( "Content-Disposition: attachment; filename=" . $file_name );
                header ('Pragma: public');
				echo $result ['Body'];
			} catch (S3Exception $e) {
				echo $e->getMessage() . PHP_EOL;
			}
		}

		public function fileOpen($dir,$str,$type){
			//$data = file_get_contents('s3://bucket/key');
			$this->s3Client->registerStreamWrapper();
			$stream = fopen("s3://".$this->bucket_name."/".$dir, $type);
			fwrite($stream, $str);
			fclose($stream);
		}

		public function fileData($dir){
			$this->s3Client->registerStreamWrapper();
			$exsit = file_exists("s3://".$this->bucket_name."/".$dir);
			$data = "";
			if($exsit){
				$data = file_get_contents("s3://".$this->bucket_name."/".$dir);
			}
			
			return $data;
		}

		public function fileExists($dir){
			$this->s3Client->registerStreamWrapper();
			$exsit = file_exists("s3://".$this->bucket_name."/".$dir);
			return $exsit;
		}
	}
?>