<!doctype html>
<html lang="kr">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
	<title>자재등록</title>
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
	<script src="GUGASMS/page/admin/js/xlsx.full.min.js"></script>
	<script src="GUGASMS/page/admin/js/FileSaver.min.js"></script>
	<script src="GUGASMS/page/admin/js/jquery/jquery-3.3.1.min.js"></script>
	<script src="GUGASMS/page/admin/js/lb.js<?php echo $this->version; ?>"></script>
	<script src="GUGASMS/page/admin/js/admin.js<?php echo $this->version;?>"></script>
	<script src="GUGASMS/page/admin/js/add_main.js<?php echo $this->version;?>"></script>
</head>


    <body>
        <div class="wrap">
          <?php include_once $this->dir."page/admin/include/admin_sidebar.php"; ?>
          <div class="adm_container">
            <?php include_once $this->dir."page/admin/include/admin_header.php"; ?>
            <section class="adm_section_container">
							<div class="adm_section_container_body p-1">
								<div class="btn-list-con align-right mb-1">
                  <p><button type="button" id ="all_del_btn" onclick ="all_del_receiver()" class="btn-sm btn-defalut">전체삭제</button></p>
                  <p><button type="button" id ="select_del_btn" onclick ="select_del_receiver()" class="btn-sm btn-defalut">선택삭제</button></p>
									<p><button type="button" onclick="exportExcel();"  class="btn-sm btn-primary">엑셀다운</button></p>
									<p><button type="button" onclick ="open_add_modal();" class="btn-sm btn-secondary">자재추가</button></p>
								</div>
								<div class="adm_table_container">
									<p class="adm_table_total" id ="receiver_total"><i>Total</i>0</p>
									
								</div>
							</div>
							<!-- adm_section_container_body // -->
						</section>
						<!-- adm_section_container // -->
        </div>
        <?php include_once $this->dir."page/admin/include/admin_footer.php"; ?>
    </body>
</html>