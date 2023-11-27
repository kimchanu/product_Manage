<!doctype html>
<html lang="kr">
<head>
	<meta charset="UTF-8">
	<!-- <meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;"/> -->
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="X-UA-Compatible" content="ie=edge">
	
	<title>abcdfad</title>
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
            </div>
        </div>
        <?php include_once $this->dir."page/admin/include/admin_footer.php"; ?>
    </body>
</html>