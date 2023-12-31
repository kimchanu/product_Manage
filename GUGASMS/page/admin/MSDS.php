<!doctype html>
<html lang="kr">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
	<title>MSDS</title>
	<!-- FONT -->
	<link href="https://fonts.googleapis.com/css?family=Gothic+A1:100,200,300,400,500,700,800,900&display=swap" rel="stylesheet">
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/common.css<?php echo $this->version; ?>" />
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/reset.css<?php echo $this->version; ?>" />
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/admin.css<?php echo $this->version; ?>" />
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/adm_sub.css<?php echo $this->version; ?>" />
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/admin.modal.css<?php echo $this->version;?>"/>
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/adm_table.css<?php echo $this->version; ?>" />
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/common2.css<?php echo $this->version; ?>" />

	<!-- FONTAWESOME -->
	<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.2.0/css/all.css">

	<!-- sript시작 -->
	<script src="GUGASMS/page/admin/js/jquery/jquery-3.3.1.min.js"></script>
	<script src="GUGASMS/page/admin/js/xlsx.full.min.js"></script>
	<script src="GUGASMS/page/admin/js/FileSaver.min.js"></script>
	<script src="GUGASMS/page/admin/js/lb.js<?php echo $this->version; ?>"></script>
	<script src="GUGASMS/page/admin/js/admin.js<?php echo $this->version;?>"></script>
	<script src="GUGASMS/page/admin/js/kakao_f_main.js"></script>
</head>
    <body>
        <div class="wrap">
          <?php include_once $this->dir."page/admin/include/admin_sidebar.php"; ?>
          <div class="adm_container">
            <?php include_once $this->dir."page/admin/include/admin_header.php"; ?>
			<div class="adm_section_container_head pb-0 align-center">
				<h2>MSDS 화학물질정보검색</h2>
			</div>
			<div class="adm_main_container">
				<div class="clearfix row adm_section_container_mid">
					<section class="adm_section_container container_mid">
						<form action="">
							<table id="sch_box" class="display_msds">
								<colgroup>
									<col style="width:auto">
									<col style="width:80px">
								</colgroup>
								<tbody><tr>
									<td colspan="2">
										<select name="type" id="type" class="selectCSS" style="width:200px">
											<option value="0">물질명(관용명/동의어)</option>
											<option value="1">CAS NO</option>
											<option value="2">UN NO</option>
											<option value="3">KE NO</option>
											<option value="4">EN NO</option>
										</select>
									</td>
								</tr>
								<tr>
									<td><input type="text" name="keyword" value="" placeholder="화학물질명, CAS NO. 등 찾고자 하는 화학물질의 검색어를 입력해주세요"></td>
									<td><button>검색</button></td>
								</tr>
								</tbody></table>
						</form>
						<div class = "display_msds">
							<h1 class="">화학물질정보</h1>
							<table class="">
								<tbody><tr>
									<th>CAS No.</th>
									<th>화학물질명</th>
									<th>EN No.</th>
									<th>KE No.</th>
									<th>UN No.</th>
								</tr>
												<tr>
									<td colspan="8"><center>화학물질명, CAS NO. 등 찾고자 하는 화학물질의 검색어를 입력해주세요</center></td>
								</tr>
											</tbody></table>
						
							<ul class="align-left">
								<li style="display : block; background-color : yellow"><a onclick="history.back()">목록</a></li>
							</ul>
							<ul style = "list-style:none;">
								<li style = "float: left; margin-right : 5px;"><a>이전</a></li style = "float: left; margin-right : 5px;"><li style = "float: left; margin-right : 5px;"><a>1</a></li><li style = "float: left;"><a>다음</a></li></ul>
						</div>
					</section>
				</div>
			</div>
		   </div>
        </div>
        <?php include_once $this->dir."page/admin/include/admin_footer.php"; ?>
    </body>
</html>