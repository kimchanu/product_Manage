<!doctype html>
<html lang="kr">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
	<title>자재출고</title>
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

	<link rel="stylesheet" href="GUGASMS/page/admin/css/jquery-ui.min.css">
	<script src="GUGASMS/page/admin/js/jquery/jquery-3.3.1.min.js"></script>

	<!-- sript시작 -->
	
	<script src="GUGASMS/page/admin/js/xlsx.full.min.js"></script>
	<script src="GUGASMS/page/admin/js/FileSaver.min.js"></script>
	<script src="GUGASMS/page/admin/js/lb.js<?php echo $this->version; ?>"></script>
	<script src="GUGASMS/page/admin/js/admin.js<?php echo $this->version;?>"></script>
	<script src="GUGASMS/page/admin/js/add_main.js<?php echo $this->version;?>"></script>
</head>
	<body>
        <div class="wrap">

          <div class="adm_container">
            <?php include_once $this->dir."page/admin/include/admin_header.php"; ?>
			<div class="adm_section_container_head pb-0">
				<h2>출고등록</h2>
			</div>
		<div class="adm_main_container">
            <section class="adm_section_container">
				<div class="adm_section_container_body p-1">
					<div class="btn-list-con align-right mb-1">
						<p><button type="button" onclick ="open_add_modal();" class="btn-sm btn-secondary">자재검색</button></p>
								</div>
								<div class="adm_table_container">
									<p class="adm_table_total" id ="receiver_total"><i>Total</i>0</p>
									<div class="adm_table_long_responsive">
										<table class="adm_table adm_fixed_table mb-1">
											<thead>
												<tr>
													<th class="check">
														<label class="check_label m-auto" value="yes">
															<input type="checkbox" id = "all_check_receiver" onchange = "all_check('receiver', this);">
															<span class="checkmark"></span>
														</label>
													</th>
													<th class="tight2">자재코드</th>
                                                <th class="tight2">위치</th>
                                                <th class="tight2">대분류</th>
                                                <th class="tight2">소분류</th>
                                                <th class="number">품명</th>
                                                <th class="number">규격</th>
                                                <th class="tight1">제조사</th>
                                                <th class="tight1">거래처</th>
                                                <th class="tight2">단위</th>
                                                <th class="tight1">단가</th>
                                                <th class="tight2">재고수량</th>
                                                <th class="tight1">재고금액</th>
												</tr>
											</thead>
											<tbody data-wrap = "receiver_wrap" id = "receiver_wrap">
												<!-- <tr>
													<td class="check">
														<label class="check_label m-auto" value="yes">
															<input type="checkbox">
															<span class="checkmark"></span>
														</label>
													</td>
													<td>홍길동</td>
													<td class="number">010-3021-1125</td>
												</tr>
												<tr>
													<td colspan = "3" class="align-center" height="185">내용이 없습니다.</td>
												</tr> -->
												<!-- 내용이 비었을 경우 // -->
											</tbody>
										</table>
									</div>
									<!-- adm_table_responsive // -->
								</div>
							</div>
							<!-- adm_section_container_body // -->
						</section>
						<!-- adm_section_container // -->
        </div>
	</div>
