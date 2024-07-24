<!doctype html>
<html lang="kr">
<head>
	<meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
	<title>월집계</title>
	<!-- FONT -->
	<link href="https://fonts.googleapis.com/css?family=Gothic+A1:100,200,300,400,500,700,800,900&display=swap" rel="stylesheet">
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/common.css<?php echo $this->version; ?>" />
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/reset.css<?php echo $this->version; ?>" />
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/admin.css<?php echo $this->version; ?>" />
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/adm_sub.css<?php echo $this->version; ?>" />
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/admin.modal.css<?php echo $this->version;?>"/>
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/adm_table.css<?php echo $this->version; ?>" />
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/common2.css<?php echo $this->version; ?>" />

	<link rel="stylesheet" href="GUGASMS/page/admin/css/jquery-ui.min.css">
	<script src="GUGASMS/page/admin/js/jquery/jquery-3.3.1.min.js"></script>
	<script src="GUGASMS/page/admin/js/jquery-ui.min.js"></script>
	
	<!-- sript시작 -->
	<script src="GUGASMS/page/admin/js/xlsx.full.min.js"></script>
	<script src="GUGASMS/page/admin/js/FileSaver.min.js"></script>
	<script src="GUGASMS/page/admin/js/lb.js<?php echo $this->version; ?>"></script>
	<script src="GUGASMS/page/admin/js/admin.js<?php echo $this->version;?>"></script>
	<script src="GUGASMS/page/admin/js/input_month.js<?php echo $this->version; ?>"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js"></script>
</head>
<body>
	<div class="loading"><img class="loading_img" src ="GUGASMS/page/admin/images/Spinner.gif"></div>
	<div class="wrap">
		<div class="adm_container">
			<?php include_once $this->dir . "page/admin/include/admin_header.php"; ?>
			<canvas id="myChart"></canvas>
		</div>
		<!-- adm_container끝 -->
		<?php include_once $this->dir . "page/admin/include/admin_footer.php"; ?>
	</div>
</body>
 
</html>