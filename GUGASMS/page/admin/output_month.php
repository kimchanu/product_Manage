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
    
    <!-- script 시작 -->
    <script src="GUGASMS/page/admin/js/xlsx.full.min.js"></script>
    <script src="GUGASMS/page/admin/js/FileSaver.min.js"></script>
    <script src="GUGASMS/page/admin/js/lb.js<?php echo $this->version; ?>"></script>
    <script src="GUGASMS/page/admin/js/admin.js<?php echo $this->version; ?>"></script>
    <script src="GUGASMS/page/admin/js/output_month.js<?php echo $this->version; ?>"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
        }
        .container {
            width: 80%;
            margin: 50px auto;
            text-align: center;
            background: #fff;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            display: flex;
            flex-wrap: wrap;
        }
        .chart-container {
            position: relative;
            margin: 20px;
            height: 500px;
            width: calc(70% - 40px); /* 전체 넓이의 70% */
        }
        .pie-chart-container {
            position: relative;
            margin: 30px auto;
            height: 300px;
            width: 300px;
        }
        h1 {
            color: #333;
            width: 100%;
        }
        .total-usage {
            margin: 20px;
            text-align: left;
            width: calc(30% - 40px); /* 전체 넓이의 30% */
        }
    </style>
</head>
<body>
    <div class="wrap">
        <div class="adm_container">
            <?php include_once $this->dir . "page/admin/include/admin_header.php"; ?>
            <div class="container">
                <div class="chart-container">
                    <canvas id="barChart"></canvas>
                </div>
                <div class="total-usage" id="totalUsage" style = "height : 300px;">
                    <!-- 총 사용 금액이 표시될 영역 -->
                </div>
                <div class="pie-chart-container" >
                    <canvas id="pieChart"></canvas>
                </div>
            </div>
        </div>
        <!-- adm_container 끝 -->
        <?php include_once $this->dir . "page/admin/include/admin_footer.php"; ?>
    </div>
</body>
</html>
