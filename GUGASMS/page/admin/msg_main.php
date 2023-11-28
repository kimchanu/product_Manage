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
            <table class="custom_table">
              <thead>
                <tr>
                  <th >No</th>
                  <th>이미지</th>
                  <th>자재코드</th>
                  <th>위치</th>
                  <th>대분류</th>
                  <th>소분류</th>
                  <th>품명</th>
                  <th>규격</th>
                  <th>제조사</th>
                  <th>거래처</th>
                  <th>단위</th>
                  <th>단가</th>
                  <th>재고수량</th>
                  <th>날짜</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td>john@example.com</td>
                  <td>Admin</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>Jane Smith</td>
                  <td>jane@example.com</td>
                  <td>User</td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>Bob Johnson</td>
                  <td>bob@example.com</td>
                  <td>User</td>
                </tr>
              </tbody>
        </table>
        </div>
      </div>
        <?php include_once $this->dir."page/admin/include/admin_footer.php"; ?>
    </body>
</html>