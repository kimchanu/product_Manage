<!doctype html>
<html lang="kr">
<head>
	<meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
	<title>메시지함관리</title>
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
	<script src="GUGASMS/page/admin/js/admin.js<?php echo $this->version; ?>"></script>
	<script src="GUGASMS/page/admin/js/msg_box_set.js<?php echo $this->version; ?>"></script>
</head>
<body>
	<div class="wrap">
        <?php include_once $this->dir."page/admin/include/admin_sidebar.php";?>
		<div class="adm_container">
			<?php include_once $this->dir . "page/admin/include/admin_header.php"; ?>
			<div class="adm_section_container_head pb-0">
				<h2>메시지함관리</h2>
			</div>
			<div class="adm_main_container">
				<div class="clearfix row">
					<div class="col-md-6">
						<section class="adm_section_container">
							<div class="adm_section_container_body p-1">
								<div class="adm_table_container">
									<div class="adm_table_long_responsive" style="height:480px">
										<table class="adm_table adm_fixed_table mb-1">
											<thead>
												<tr>
													<th class="tit">메시지그룹이름</th>
													<th class="number">설명</th>
													<!-- <th class="etc">추가</th> -->
												</tr>
											</thead>
											<tbody data-wrap="msg_box_wrap" id ="msg_box_wrap">
												<!-- <tr class="out">
													<td class="tit"><span><i class="fas fa-folder"></i>테스트 메시지 함</span></td>
													<td class="number">비고</td>
													<td class="etc">추가</td>
												</tr> -->
												<!-- <tr class="in">
													<td class="tit"><span><i class="fas fa-arrow-right"></i>전산팀</span></td>
													<td class="number">비고</td>
													<td class="etc"><span class="add-btn">추가</span></td>
												</tr>
												<tr>
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
					<div class="col-md-6">
						<section class="adm_section_container">
							<div class="adm_section_container_body p-1">
								<div class="btn-list-con align-right mb-1">
                                    <p><button type="button" id ="del_btn" onclick ="request_msg_box_delete();" class="btn-sm btn-defalut">그룹삭제</button></p>
                                    <p><button type="button" onclick = "init_add_input();" class="btn-sm btn-secondary">신규작성</button></p>
									<p><button type="button" id = "register_btn" onclick = "request_msg_box_add('add');" class="btn-sm btn-primary">저장</button></p>
								</div>
								<ul class="clearfix row input-list-container">
                                    <li class="col-md-12">
                                        <p class="input-tit">메시지그룹이름</p>
										<div class="insert"><input type="text" id ="msg_box_name"></div>
                                    </li>
									<li class="col-md-12 mt-1">
                                        <p class="input-tit">비고</p>
                                        <div class="insert"><input type="text" id ="msg_box_content"></div>
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
			<tr class="out" data-copy ="msg_box_copy">
				<td class="tit"><span data-attr="name"><i class="fas fa-folder"></i></span></td>
				<td class="number" data-attr="content"></td>
				<!-- <td class="etc" data-attr="plus">추가</td> -->
			</tr>
		</table>
	</div>
</body>
</html>