<!doctype html>
<html lang="kr">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
	<title>주소록</title>
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
	<div class="loading"><img class="loading_img" src ="GUGASMS/page/admin/images/Spinner.gif"></div>
	<div class="wrap">
        <?php include_once $this->dir."page/admin/include/admin_sidebar.php";?>
		<div class="adm_container">
			<?php include_once $this->dir . "page/admin/include/admin_header.php"; ?>
			<div class="adm_section_container_head pb-0">
				<h2>주소록</h2>
			</div>
			<div class="adm_main_container overflow-y">
				<div class="clearfix row">
					<div class="col-md-6 col-lg-12">
						<section class="adm_section_container">
							<div class="adm_section_container_body p-1">
								<div class="adm_table_container">
									<div class="adm_table_long_responsive" style="height:480px;">
										<table class="adm_table adm_fixed_table mb-1">
											<thead>
												<tr>
													<th class="tit">그룹이름</th>
													<th class="number">비고</th>
												</tr>
											</thead>
											<tbody data-wrap="address_wrap" id ="address_wrap">
												<tr class="out">
													<td class="tit"><span><i class="fas fa-folder"></i>회사명</span></td>
													<td class="number"><span>비고</span></td>
												</tr>
												<!-- <tr class="in">
													<td class="tit"><span><i class="fas fa-arrow-right"></i>전산팀</span></td>
													<td class="number"><span>비고</span></td>
												</tr>
												<tr>
													<td colspan = "2" class="align-center" height="415">내용이 없습니다.</td>
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
						<!-- 검색 -->
						<section class="adm_section_container">
							<div class="adm_section_container_head bg-light-gray">
								<h2>검색</h2>
							</div>
							<div class="adm_section_container_body p-1">
								<ul class="clearfix row input-list-container">
                                    <li class="col-md-12">
                                        <p class="input-tit">이름</p>
										<div class="insert"><input type="text" id ="search_addr_name"></div>
                                    </li>
									<li class="col-md-12 mt-1">
                                        <p class="input-tit">휴대전화</p>
                                        <div class="insert"><input type="text" id ="search_addr_phone_number"></div>
                                    </li>
                                </ul>
								<div class="btn-list-con align-right">
                                    <p class="mt-1"><button type="button" onclick = "init_search();" class="btn-sm btn-clear">초기화</button></p>
									<p class="mt-1"><button type="button" onclick = "search();" id ="search_btn" class="btn-sm btn-primary">검색</button></p>
								</div>
							</div>
						</section>
						<!-- 검색 // -->
						<!-- 주소록 엑셀 업로드 -->
						<section class="adm_section_container">
						<div class="adm_section_container_head bg-light-gray">
							<h2>주소록 엑셀업로드</h2>
						</div>
							<div class="adm_section_container_body p-1">
								<div class="upload-container">
									<input class="upload-name" value="파일선택" disabled="disabled">
									<label for="excel_upload" class="upload-btn" onclick="">파일첨부</label>
									<input id = "excel_upload" class="upload-file wi_upload_hidden" type="file" style="display:none;"/>
								</div>
								<div class="btn-list-con align-right">
                                    <p class="mt-1"><a href="GUGASMS/inc/sample.xlsx" download><button type="button"  class="btn-sm btn-defalut">양식다운로드</button></a></p>
									<p class="mt-1"><button type="button" id ="excel_btn" onclick ="excel_upload();" class="btn-sm btn-primary">등록</button></p>
								</div>
							</div>
							<!-- adm_section_container_body // -->
						</section>
						<!-- 주소록 엑셀 업로드 // -->
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
													<th class="check">번호</th>
													<th class="tit">이미지</th>
													<th class="number">자재코드</th>
													<th class="number">위치</th>
													<th class="number">대분류</th>
													<th class="number">소분류</th>
													<th class="number">품명</th>
													<th class="number">규격</th>
													<th class="number">제조사</th>
													<th class="number">거래처</th>
													<th class="number">단위</th>
													<th class="number">단가</th>
													<th class="number">재고수량</th>
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
			</div>
		</div>
		<!-- adm_container끝 -->
		<?php include_once $this->dir . "page/admin/include/admin_footer.php"; ?>
	</div>
	<!-- 모달화면 -->
	<div class="modal admin_modal" id="addr_modal" style= "display:none;">
		<div class="popup_wrap modal-md">
			<div class="adm_popup_container">
				<h4>자재 추가</h4>
				<section class="adm_section_container">
					<div class="adm_modal_input_container">
						<div class="modal_table">
							<div class="wi_board_form_row">
								<div class="wi_board_form_title"><label for="" class="wi_board_label_control">자재선택</label></div>
								<div class="wi_board_form_content">
									<select id ="addr_group_list" class="wi_board_input_control">
										<option value="0">자재목록</option>
									</select>
								</div>
							</div>
							<div class="wi_board_form_row">
								<div class="wi_board_form_title"><label for="" class="wi_board_label_control">번호</label></div>
								<div class="wi_board_form_content">
									<input type="text" id="addr_name" class="wi_board_input_control" autocomplete="off">
								</div>
							</div>
							<div class="wi_board_form_row">
								<div class="wi_board_form_title"><label for="" class="wi_board_label_control">이미지</label></div>
								<div class="wi_board_form_content">
									<input type="text" id="addr_phone_number" class="wi_board_input_control" autocomplete="off">

							</div>
							<div class="wi_board_form_row">
								<div class="wi_board_form_title"><label for="" class="wi_board_label_control">자재코드</label></div>
								<div class="wi_board_form_content">
									<input type="text" id="addr_phone_number" class="wi_board_input_control" autocomplete="off">
								</div>

							</div>
						</div>
					</div>
				</section>
				<div class="adm_table_btn">
					<ul>
						<li><input class="btn-sm btn-default" type="button" value="자재추가" id="btnClose" onclick="request_add_addr();"/></li>
						<li><input class="btn-sm btn-default" type="button" value="닫기" id="btnClose" onclick="close_add_modal();"/></li>
					</ul>
				</div>
			</div>
		</div>
	</div>
	<!-- wrap끝 -->
	<div style="display:none;">
		<table>
			<tr class="out" data-copy ="address_copy">
				<td class="tit"><span data-attr="group_name"><i class="fas fa-folder"></i></span></td>
				<td class="number"><span  data-attr="group_content">비고</span></td>
			</tr>
			<tr data-copy = "receiver_copy">
				<td class="check">
					<label class="check_label m-auto" value="yes">
						<input type="checkbox" data-attr="check_box">
						<span class="checkmark"></span>
					</label>
				</td>
				<td class="check" data-attr="num"></td>
				<td class="etc" data-attr="name"></td>
				<td class="number" data-attr="phone_number"></td>
			</tr>
		</table>
	</div>
</body>
</html>