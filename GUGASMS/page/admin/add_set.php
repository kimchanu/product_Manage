<!doctype html>
<html lang="kr">
<head>
	<meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
	<title>주소록그룹관리</title>
	<!-- FONT -->
	<link href="https://fonts.googleapis.com/css?family=Gothic+A1:100,200,300,400,500,700,800,900&display=swap" rel="stylesheet">
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/common.css<?php echo $this->version; ?>" />
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/reset.css<?php echo $this->version; ?>" />
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/admin.css<?php echo $this->version; ?>" />
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/adm_sub.css<?php echo $this->version; ?>" />
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/adm_table.css<?php echo $this->version; ?>" />
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/common2.css<?php echo $this->version; ?>" />

	<!-- FONTAWESOME -->
	<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.2.0/css/all.css">

	<!-- sript시작 -->
	<script src="GUGASMS/page/admin/js/jquery/jquery-3.3.1.min.js"></script>
	<script src="GUGASMS/page/admin/js/lb.js<?php echo $this->version; ?>"></script>
	<script src="GUGASMS/page/admin/js/admin.js<?php echo $this->version;?>"></script>
	<script src="GUGASMS/page/admin/js/add_set.js<?php echo $this->version;?>"></script>
</head>
<body>
	<div class="wrap">
        <?php include_once $this->dir."page/admin/include/admin_sidebar.php";?>
		<div class="adm_container">
			<?php include_once $this->dir . "page/admin/include/admin_header.php"; ?>
			<div class="adm_section_container_head pb-0">
				<h2>주소록그룹관리</h2>
			</div>
			<div class="adm_main_container">
				<div class="clearfix row">
					<div class="col-md-6 col-lg-12">
						<section class="adm_section_container">
							<div class="adm_section_container_body p-1">
								<div class="adm_table_container">
									<div class="adm_table_long_responsive" style="height:480px">
										<table class="adm_table adm_fixed_table mb-1">
											<thead>
												<tr>
													<th class="tit">그룹이름</th>
													<th class="number">비고</th>
													<th class="etc">추가</th>
												</tr>
											</thead>
											<tbody data-wrap="address_wrap" id ="address_wrap">
												<!-- <tr class="out">
													<td class="tit"><span><i class="fas fa-folder"></i></i>회사명</span></td>
													<td class="number">비고</td>
													<td class="etc"><span class="add-btn">추가</span></td>
												</tr> -->
												<!-- <tr class="out">
													<td class="tit"><span><i class="fas fa-folder"></i>전산팀</span></td>
													<td class="number">비고</td>
													<td class="etc"><span class="add-btn">추가</span></td>
												</tr> -->
												<!-- <tr>
													<td colspan = "3" class="align-center" height="415">내용이 없습니다.</td>
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
					<div class="col-md-6 col-lg-12">
						<section class="adm_section_container">
							<div class="adm_section_container_body p-1">
								<div class="btn-list-con align-right mb-1">
                                    <p><button type="button" id ="addr_minus_btn" class="btn-sm btn-defalut">그룹삭제</button></p>
                                    <p><button type="button" onclick ="addr_group_detail_refresh();" class="btn-sm btn-secondary">신규작성</button></p>
									<p><button type="button" id ="addr_plus_btn" onclick = "request_add_addr_group('add');" class="btn-sm btn-primary">저장</button></p>
								</div>
								<ul class="clearfix row input-list-container">
                                    <li class="col-md-12">
										<p class="input-tit">주소록그룹이름</p>
										<div class="insert">
											<input type ="text" id = "group_name"/>
											<!-- <select id ="">
												<option>선택</option>
												<option>샘플1</option>
											</select> -->
										</div>
                                    </li>
									<!-- <li class="col-md-12 mt-1">
                                        <p class="input-tit">하위 그룹이름</p>
                                        <div class="insert"><input type="text"></div>
                                    </li> -->
									<li class="col-md-12 mt-1">
                                        <p class="input-tit">비고</p>
                                        <div class="insert"><input type="text" id = "group_content"></div>
                                    </li>
                                </ul>
							</div>
							<!-- adm_section_container_body // -->
						</section>
						<!-- adm_section_container // -->
					</div>
				</div>
			</div>
		</div>
		<!-- adm_container끝 -->
		<?php include_once $this->dir . "page/admin/include/admin_footer.php"; ?>
	</div>
	<!-- wrap끝 -->
	<div style="display:none;">
		<table>
			<tr class="out" data-copy ="address_copy">
				<td class="tit"><span data-attr ="group_name"><i class="fas fa-folder"></i></span></td>
				<td class="number" data-attr ="group_content"></td>
				<td class="etc"><span class="add-btn" data-attr ="group_plus"></span></td>
			</tr>
			<!-- <tr class="out">
				<td class="tit"><span><i class="fas fa-folder"></i>전체</span></td>
				<td class="number">최상위</td>
			</tr>
			<tr class="in in_1" style = "display:none;">
				<td class="tit"><span><i class="fas fa-folder"></i>메시지함1</span></td>
				<td class="number">발신번호</td>
			</tr>
			<tr class="in2 in2_1" style = "display:none;">
				<td class="tit"><span><i class="fas fa-arrow-right"></i>메시지함1내용</span></td>
				<td class="number">발신번호</td>
			</tr> -->
		</table>
		
	</div>
</body>
</html>