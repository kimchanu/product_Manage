<!doctype html>
<html lang="kr">
<head>
	<meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
	<title>로그인 | 한국인프라</title>

	<!-- FONT -->
	<link href="https://fonts.googleapis.com/css?family=Gothic+A1:100,200,300,400,500,700,800,900&display=swap" rel="stylesheet">
	
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/reset.css<?php echo $this->version;?>"/>
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/common.css<?php echo $this->version;?>"/>
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/admin.css<?php echo $this->version;?>"/>
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/admin_sub.css<?php echo $this->version;?>"/>
	<!-- 2019-11-21 추가 -->
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/common2.css<?php echo $this->version;?>"/>

	<!-- sript시작 -->
	<script src="GUGASMS/page/admin/js/jquery/jquery-3.3.1.min.js"></script>
	<script src="GUGASMS/page/admin/js/lb.js<?php echo $this->version;?>"></script>
    <script src="GUGASMS/page/admin/js/admin.js<?php echo $this->version;?>"></script>
	<!-- script끝 -->
	
</head>
<body>
	<div class="wrap">
		<?php include_once $this->dir."page/admin/include/admin_sidebar.php"; ?>
		<div class="adm_container">
			<?php include_once $this->dir."page/admin/include/admin_header.php"; ?>
			<div class="adm_main_container d-flex align-items-center justify-content-center">
				<section class="adm_section_container">
					<div class="pt-2 align-center"><img src="GUGASMS/page/admin/images/ci-origin.png" alt="" style="height:48px;"/></div>
					<div class="adm_section_container_head">
						<h2>로그인</h2>
					</div>
					<div class="adm_section_container_body p-1">
						<div class="login_container">
							<div class="input_control"><input type="text" id="id" placeholder="아이디입력" onkeydown="Enter_Check()"></div>
							<div class="input_control"><input type="password" id="pw" placeholder="비밀번호입력" onkeydown="Enter_Check()"></div>
							<div class="btn_control"><button type="button" class="btn-primary" onclick="login()">로그인</button></div>
							<div class="btn_control"><button type="button" class="btn-primary" onclick="login()">회원가입</button></div>
						<div>
					</div>
				</section>
			</div>
		</div>
		  <!-- 모달화면 -->
	<div class="modal admin_modal" id="addr_modal" style= "display:none;">
		<div class="popup_wrap modal-xl">
			<div class="adm_popup_container">
				<h4>자재 추가</h4>
				<section class="adm_section_container">
			
				</section>
				<div class="adm_table_btn">
					<ul>
						<li><input class="btn-sm btn-default" type="button" value="회원가입" id="btnClose" onclick="sign_up();"/></li>
						<li><input class="btn-sm btn-default" type="button" value="닫기" id="btnClose" onclick="close_add_modal();"/></li>
					</ul>
				</div>
			</div>
		</div>
    </div>
		<?php include_once $this->dir."page/admin/include/admin_footer.php"; ?>
	</div>
</body>
</html>