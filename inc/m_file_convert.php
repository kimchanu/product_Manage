<?php
	class m_file_convert{
		function convert_description($s3Path,$zip_dir,$s3Link,$description,$s3){ 
            
            $description_array = [];
            // echo $description;
            
            $s3Manage = $s3;
            //data-filename 삭제하기 끝

            //base64 찾는 string
            $base64StartString = '<img src="data:image/';
            $base64EndString = '" data-filename=';
            //image파일 시작지점 찾기
            $pos = strpos($description, $base64StartString);
            $end = strpos($description, $base64EndString);

            while($pos !== false){

                //확장자 가져오기
                $extensionStartString = 'data:image/';
                $extensionEndString = ';base64';

                $extensionStartpos = strpos($description, $extensionStartString);
                $extensionEnd = strpos($description, $extensionEndString);
                $extension = substr($description, $extensionStartpos+11, ($extensionEnd-$extensionStartpos)-11);
                if($extension=="jpeg"){
                    $extension="jpg";
                }
                //확장자 가져오기 끝

                $pos = $pos + 10;  //searchString 글자수만큼+
                //base64파일이 있음


                //파일이름 및 확장자
                $fileName = $this->rand_name(); //파일명은 랜덤으로 만듬
                $fileName = $fileName.".".$extension; //랜덤으로 만든 파일이름과 확장자를 합쳐줌

                //base64 String가져오기
                $base64FileString = substr($description,$pos,$end-$pos); //base64형식의 파일 string
                
             
                $s3Manage->insertFile($s3Path.$fileName ,$this->base64_to_image($base64FileString,"temp/".$fileName));

                $file_size = filesize("temp/".$fileName);
                $percent = "0.2";
                if($file_size < 2097152){
                    $percent = "0.9";
                }elseif(2097152 <= $file_size &&  $file_size < 4194304){
                    $percent = "0.85";
                }elseif( 4194304 <= $file_size &&  $file_size < 6291456){
                    $percent = "0.8";
                }elseif( 6291456 <= $file_size &&  $file_size < 8388608){
                    $percent = "0.75";
                }elseif( 8388608 <= $file_size &&  $file_size < 10485760){
                    $percent = "0.7";
                }elseif( 10485760 <= $file_size &&  $file_size < 12582912){
                    $percent = "0.65";
                }elseif( 12582912 <= $file_size &&  $file_size < 14680064){
                    $percent = "0.6";
                }elseif( 14680064 <= $file_size &&  $file_size < 16777216){
                    $percent = "0.55";
                }elseif( 14680064 <= $file_size &&  $file_size < 16777216){
                    $percent = "0.55";
                }elseif( 16777216 <= $file_size &&  $file_size < 18874368){
                    $percent = "0.5";
                }elseif( 18874368 <= $file_size &&  $file_size < 20971520){
                    $percent = "0.45";
                }elseif( 20971520 <= $file_size &&  $file_size < 23068672){
                    $percent = "0.4";
                }elseif( 23068672 <= $file_size &&  $file_size < 25165824){
                    $percent = "0.4";
                }elseif( 25165824 <= $file_size &&  $file_size < 27262976){
                    $percent = "0.35";
                }elseif( 27262976 <= $file_size &&  $file_size < 29360128){
                    $percent = "0.3";
                }

                $create_file = $this->img_resize(array(
                    "percent"=>$percent,
                    "file_name"=>$fileName,
                    "file"=>"temp/".$fileName,
                    "file_size"=>102400
                ));

                $result = $s3Manage->insertFile($zip_dir.$fileName,$create_file);
                unlink($create_file);


                //링크 대체하기전 0부터 base64해당 부분까지 string 짜르기
                $description_front = substr($description,0,$end);
                $description_array[] = str_replace($base64FileString,$s3Link.$fileName,$description_front); //짜른 부분 링크대체후 array push

                //앞에 자른부분은 필요없으니 원본 description은 짜른 이후 부분만 넣어줌
                $description = substr($description, $end);


                //data-filename 삭제하기 
                //*다음파일 찾을때 방해됨
                $filenameStartString = 'data-filename="';
                $filenameEndString = '" style=';
                $end = strpos($description, $base64EndString);
                $filename_pos = strpos($description, $filenameStartString, $end);
                $filename_end = strpos($description, $filenameEndString, $filename_pos+15);
                $fileName = substr($description, $filename_pos, ($filename_end - $filename_pos)+1);

                //data-filename 삭제하기전 해당 부분까지 string 짜르기
                $filename_front = substr($description,0,$filename_end+1);
                $description_array[] = str_replace($fileName,"",$filename_front);
                //앞에 자른부분은 필요없으니 원본 description은 짜른 이후 부분만 넣어줌
                $description = substr($description, $filename_end+1);
                //data-filename 삭제하기 끝

                $pos = strpos($description, $base64StartString);
                $end = strpos($description, $base64EndString);
            }
            $complete_description = "";
            //array description 합치기
            for($i=0; $i<count($description_array); $i++){
                $complete_description = $complete_description.$description_array[$i];
            }
            $complete_description = $complete_description.$description; //나머지 뒷부분 description 합치기
            // echo $complete_description."\n";
            return $complete_description;
        }

        //temp폴더에 파일 임시 생성
        function base64_to_image($base64_string, $output_file) {
            // open the output file for writing
            $ifp = fopen($output_file, 'w' ); //root폴더의 temp폴더에 임시 생성
            // split the string on commas
            // $data[ 0 ] == "data:image/png;base64"
            // $data[ 1 ] == <actual base64 string>
            $data = explode( ',', $base64_string );
            // we could add validation here with ensuring count( $data ) > 1
            fwrite( $ifp, base64_decode( $data[ 1 ] ) );
            // clean up the file resource
            fclose( $ifp ); 
            return $output_file; 
        }

        function uuidgen4() {
            return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
               mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff),
               mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000,
               mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
             );
         }
         
        /********************************************************************* 
        // 함수명: get_s3_image_array($a,$b,$c) 
        // 함수 설명 : description 내용에 있는 s3 LINK인 파일의 이름을 배열로 리턴
        // $description: description 내용
        // $s3Link: s3 이미지 링크 ex: https://s3.ap-northeast-2.amazonaws.com/lbplatform/files/life_in/boardImage
        // 만든이: 과장 만든날 : 2019-05-15
        *********************************************************************/
       
		 
		 function get_s3_image_array($description, $s3Link){
            $array = array();

            $img_startString = '<img src="'.$s3Link;
            $img_pos = strpos($description, $img_startString);
            while($img_pos !== false){
                $description = substr($description, $img_pos);// base64StartString앞부분을 제거후 뒷부분만 가져옴

                $img_endString = '">';
                $img_end_pos = strpos($description, $img_endString);
                $img_tag = substr($description, 0, $img_end_pos+2); //img tag 원문                


                //파일이름 빼내기
                $link_startString = $s3Link;
                $link_endString = 'style=';
                $link_pos = strpos($description, $link_startString);
                $link_end = strpos($description, $link_endString);
                $link = substr($description, $link_pos, $link_end-$link_pos); 

                $file_name_array = explode( '/', $link);
                $file_name = $file_name_array[count($file_name_array)-1];
                $file_name = str_replace(" ","",$file_name);
                $file_name = str_replace('"',"",$file_name);
                
                

                $array[] = $file_name;
                
                $description = str_replace($img_tag,"",$description);
                
                $img_pos = strpos($description, $img_startString);
            }
            return $array;
        }

        function rand_name(){
			$someTime=((strtotime(date("Y-m-d H:i:s",time()))-(9*60*60))-(strtotime("1971-1-1 00:00:00 GMT"))).mt_rand(1, 100000);
			return $someTime;
        }

        function img_resize($object){
			$percent = $object["percent"];

			$file_size = filesize($object["file"]);
			$o_file = $object["file"];//원본 파일 이된다.
			$o_target_file = "temp/".$object["file_name"];
			$info = new SplFileInfo($object["file_name"]);
			//원본이미지 저장
			move_uploaded_file($object["file"], $o_target_file);
			
			if($file_size>$object["file_size"]){
				// Get new dimensions
				list($width, $height) = getimagesize($o_target_file);
				$new_width = ($width * $percent);
				$new_height = ($height * $percent);

				// Resample
				$image_p = imagecreatetruecolor($new_width, $new_height);            

				switch ($info->getExtension()) {
					case 'jpg':
						$image = imagecreatefromjpeg($o_target_file);
						break;
					case 'jpeg':
						$image = imagecreatefromjpeg($o_target_file);
						break;
					case 'png':
						$image = imagecreatefrompng($o_target_file);
						break;
					case 'gif':
						$image = imagecreatefromgif($o_target_file);
						break;
					default:
						$image = imagecreatefromjpeg($o_target_file);
				}

				imagecopyresampled($image_p, $image, 0, 0, 0, 0, $new_width, $new_height, $width, $height);
				$target_file="temp/".$object["file_name"];
				//unlink($o_target_file);
				imagejpeg($image_p, $target_file);
				return $target_file;
			}else{
				return $o_target_file;
			}
		}
        
         
	}
?>