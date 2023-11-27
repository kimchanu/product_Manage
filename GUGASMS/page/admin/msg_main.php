<!doctype html>
<html lang="kr">
<head>
	<meta charset="UTF-8">
	<!-- <meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;"/> -->
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="X-UA-Compatible" content="ie=edge">
	
	<title>메시지전송</title>
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
	<link rel="stylesheet" href="GUGASMS/page/admin/css/wickedpicker.min.css">
	<link rel="stylesheet" href="GUGASMS/page/admin/css/timepicki.css">
	<script src="GUGASMS/page/admin/js/jquery/jquery-3.3.1.min.js"></script>
	<script src="GUGASMS/page/admin/js/jquery-ui.min.js"></script>
	<script src="GUGASMS/page/admin/js/wickedpicker.min.js"></script>
	<script src="GUGASMS/page/admin/js/timepicki.js"></script>
	
	<!-- sript시작 -->
	<script src="GUGASMS/page/admin/js/xlsx.full.min.js"></script>
	<script src="GUGASMS/page/admin/js/lb.js<?php echo $this->version; ?>"></script>
	<script src="GUGASMS/page/admin/js/admin.js<?php echo $this->version;?>"></script>
	<script src="GUGASMS/page/admin/js/msg_main.js<?php echo $this->version;?>"></script>


	<script>
		var session_receiver = <?php echo $receiver?>;
	</script>
</head>
<body>
	<div class="loading"><img class="loading_img" src ="GUGASMS/page/admin/images/Spinner.gif"></div>
	<div class="wrap">
        <?php include_once $this->dir."page/admin/include/admin_sidebar.php";?>
		<div class="adm_container">
			<?php include_once $this->dir . "page/admin/include/admin_header.php"; ?>
			<div class="adm_section_container_head pb-0">
				<h2>메시지전송</h2>
			</div>
			<div class="adm_main_container overflow-y">
				<div class="clearfix row">
					<div class="col-md-8 col-lg-12">
						<ul class="row">
							<li class="col-md-4 col-sm-12 phone-display">
								<section class="adm_section_container">
									<div class="adm_section_container_body p-1">
										<div class="img-phone img-bg sm-img-phone">
											<div class="phone-screen overflow-y">
												<div class = "inner">
													<p class="count-txt align-right">0 / 90 Byte (SMS)</p>
												</div>
												<!-- 이미지 영역 -->
												<div class="inner inner_img1 d-none">
													<img src="" id = "inner_img_1"/>
												</div>
												<div class="inner inner_img2 d-none">
													<img src="" id = "inner_img_2"/>
												</div>
												<div class="inner inner_img3 d-none">
													<img src="" id = "inner_img_3"/>
												</div>
												<!-- 이미지 영역 // -->
												<div class="inner">
													<textarea onkeyup="byteCheckViewDisplay(this);" id ="msg_text"></textarea>
												</div>
												<div class="inner table-container">
													<table class="icon-table border-bt">
														<tbody id ="s_char">
															<tr>
																<td><i>☆</i></td>
																<td><i>★</i></td>
																<td><i>♡</i></td>
																<td><i>♥</i></td>
																<td><i>♧</i></td>
																<td><i>♣</i></td>
																<td><i>◁</i></td>
																<td><i>◀</i></td>
																<td><i>▷</i></td>
																<td><i>▶</i></td>
																<td><i>♤</i></td>
																<td><i>♠</i></td>
																<td><i>§</i></td>
																<td><i>※</i></td>
																<td><i>⊙</i></td>
															</tr>
															<tr>
																<td><i>○</i></td>
																<td><i>●</i></td>
																<td><i>◎</i></td>
																<td><i>◇</i></td>
																<td><i>◆</i></td>
																<td><i>⇔</i></td>
																<td><i>△</i></td>
																<td><i>▲</i></td>
																<td><i>▽</i></td>
																<td><i>▼</i></td>
																<td><i>▒</i></td>
																<td><i>▥</i></td>
																<td><i>▨</i></td>
																<td><i>▧</i></td>
																<td><i>▦</i></td>
															</tr>
															<tr>
																<td><i>▩</i></td>
																<td><i>◈</i></td>
																<td><i>◐</i></td>
																<td><i>◑</i></td>
																<td><i>♨</i></td>
																<td><i>☏</i></td>
																<td><i>☎</i></td>
																<td><i>☜</i></td>
																<td><i>☞</i></td>
																<td><i>♭</i></td>
																<td><i>♩</i></td>
																<td><i>♪</i></td>
																<td><i>♬</i></td>
																<td><i>㉿</i></td>
																<td><i>㈜</i></td>
																<td><i></i></td>
																<td><i></i></td>
																<td><i></i></td>
																<tds><i></i></td>
															</tr>
														</tbody>
													</table>
													<table class="icon-table border-bt">
														<tbody id ="imo">
															<tr>
																<td><i>^.^</i></td>
																<td><i>^_^</i></td>
																<td><i>^0^</i></td>
																<td><i>^^;</i></td>
																<td><i>*^^*</i></td>
																<td><i>(^-^)</i></td>
																<td><i>*^_^*</i></td>
																<td><i>^m^</i></td>
																<td><i>(X_X)</i></td>
															</tr>
															<tr>
																<td><i>*.-)</i></td>
																<td><i>^.~</i></td>
																<td><i>^_+</i></td>
																<td><i>(@.@)</i></td>
																<td><i>-_-ㆀ</i></td>
																<td><i>☞_☜</i></td>
																<td><i>★.★</i></td>
																<td><i>⊙.⊙</i></td>
																<td><i>(Z_Z)</i></td>
															</tr>
															<tr>
																<td><i>TmT</i></td>
																<td><i>ㅠ.ㅠ</i></td>
																<td><i>T.T</i></td>
																<td><i>(>_<)</i></td>
																<td><i>(=_=)</i></td>
																<td><i>♡.♡</i></td>
																<td><i>*♥o♥*</i></td>
																<td><i>(*_*)</i></td>
																<td><i>($_$)</i></td>
															</tr>
														</tbody>
													</table>
												</div>
											</div>
											<div class="phone-btn-container clearfix">
												<p><button type="button" onclick = "request_send_msg();">전송하기</button></p>
												<p><button type="button" onclick ="save_open_modal();">저장</button></p>
											</div>
										</div>
										<div class="mt-1 mb-1">
											<h3>예약구분</h3>
											<ul class="clearfix row chk-list-container mt-1" id ="check_box_list">
												<li class="col-md-6">
													<label class="check_label">
														<span class="chk-txt">즉시</span>
														<input type="checkbox" id = "direct_box">
														<span class="checkmark"></span>
													</label>
												</li>
												<li class="col-md-6">
													<label class="check_label">
														<span class="chk-txt">예약</span>
														<input type="checkbox" id = "reserve_box">
														<span class="checkmark"></span>
													</label>
												</li>
											</ul>
										</div>
										<div id ="reserve_elem" style = "display:none;">
											<ul class="clearfix row input-list-container">
												<!-- 예약날짜 -->
												<li class="col-md-12 mb-1">
													<p class="input-tit">예약날짜</p>
													<div class="insert"><input placeholder="yyyy-mm-dd" type="text" id ="reserve_date"></div>
												</li>
												<!-- 예약시간 -->
												<li class="col-md-12 mb-1">
													<p class="input-tit">예약시간</p>
													<!-- <div class="insert"><input id ="reserve_time" onkeyup="init_time_box(this)" type="text" placeholder="HH:MM" maxlength="5"></div> -->
													<div class="insert"><input placeholder="HH:MM" id ="reserve_time" type="text"></div>
												</li>
											</ul>
										</div>
										<div class="mt-1">
											<h3>발신번호</h3>
											<ul class="clearfix row input-list-container">
												<li class="col-md-12">
													<div class="insert" style="width:100%;">
														<input value="14331500" id ="send_number" type="text" placeholder="'-'빼고 입력" readonly>
													</div>
												</li>
											</ul>
											<p class="etc-txt"><b>유선전화번호</b> : 지역번호를 포함하여 등록(예 : 02YYYZZZZ, 051YYYZZZZ)</p>
											<p class="etc-txt"><b>이동통신전화번호</b> : 010, 011, 016, 017, 018, 019 (예 : 010ABYYYYYY)</p>
											<p class="etc-txt"><b>대표전화번호</b>(번호 앞 지역번호 금지) : 15YY, 16YY, 18YY (예 : 1666YYYY)</p>
											<p class="etc-txt"><b>공통서비스식별번호</b>(번호 앞 지역번호 금지) : 0N0계열 (예 : 070YYYYZZZZ)</p>
										</div>
										
									</div>
								</section>
							</li>
							<li class="col-md-8 col-sm-12 msg-display-right">
								<section class="adm_section_container">
									<div class="con-list-tab">
										<p class="current" id ="address">주소록</p>
										<p id ="inbox">메시지</p>
									</div>
									<!-- 탭 주소록 // -->
									<div class="adm_section_container_body p-1" id = "tab_address">
										<div class="btn-list-con align-right mb-1">
											<p><button type="button" id ="addr_add_btn" onclick ="addr_add_btn();" class="btn-sm btn-primary">이동</button></p>
										</div>
										<div class="adm_table_container">
											<div class="adm_table_long_responsive">
												<table class="adm_table adm_fixed_table mb-1">
													<thead>
														<tr>
															<th class="check">
																<label class="check_label m-auto" onclick ="all_check_addr(this)" value="yes">
																	<input type="checkbox" id ="addr_all_check_elem">
																	<span class="checkmark"></span>
																</label>
															</th>
															<th class="tit">그룹이름</th>
															<!-- <th class="etc">비고</th> -->
														</tr>
													</thead>
													<tbody data-wrap="address_wrap" id ="address_wrap">
														<!-- <tr class="out">
															<td class="check">
																<label class="check_label m-auto" value="yes">
																	<input type="checkbox">
																	<span class="checkmark"></span>
																</label>
															</td>
															<td class="tit"><span>인사팀</span></td>
															<td class="number"><span>비고</span></td>
														</tr>
														<tr class="in">
															<td class="check">
																<label class="check_label m-auto" value="yes">
																	<input type="checkbox">
																	<span class="checkmark"></span>
																</label>
															</td>
															<td class="tit"><span>전산팀</span></td>
															<td class="number"><span>울산광역시</span></td>
														</tr> -->
														<!-- 하위 // -->
														<!-- 내용이 비었을 경우 -->
														<!-- <tr>
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
									<!-- 탭 - 메시지함// -->
									<div class="adm_section_container_body p-1" id = "tab_message" style = "display:none;">
										<div class="btn-list-con align-right mb-1">
											<!-- <p><button type="button" class="btn-sm btn-primary">추가</button></p> -->
										</div>
										<div class="adm_table_container">
											<div class="adm_table_long_responsive">
												<table class="adm_table adm_fixed_table mb-1">
													<thead>
														<tr>
															<th class="tit">메시지그룹명</th>
															<th class="number">설명</th>
														</tr>
													</thead>
													<tbody data-wrap ="message_group" id ="message_group">
														<!-- <tr class="out">
															<td class="tit"><span><i class="fas fa-folder"></i>전체</span></td>
															<td class="number">최상위</td>
														</tr> -->
														<!-- <tr class="in in_1" style = "display:none;">
															<td class="tit"><span><i class="fas fa-folder"></i>메시지함1</span></td>
															<td class="number">발신번호</td>
														</tr>
														<tr class="in2 in2_1" style = "display:none;">
															<td class="tit"><span><i class="fas fa-arrow-right"></i>메시지함1내용</span></td>
															<td class="number">발신번호</td>
														</tr> -->
														<!-- <tr>
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
							</li>
						</ul>
					</div>
					<div class="col-md-4  col-lg-12">
						<section class="adm_section_container">
							<div class="adm_section_container_body p-1">
								<div class="adm_table_container">
									<div class="btn-list-con align-right mt-1">
										<p><button type="button" onclick = "select_del_receiver();" class="btn-sm btn-defalut">선택취소</button></p>
										<p><button type="button" onclick = "all_del_receiver();" class="btn-sm btn-defalut">전체취소</button></p>
									</div>
									<p class="adm_table_total" id ="receiver_total">수신자 <i>Total</i>0</p>
									<div class="adm_table_long_responsive mb-1" style="height:350px;">
										<table class="adm_table adm_fixed_table">
											<thead>
												<tr>
													<th class="check align-center">
														<label class="check_label m-auto" value="yes">
															<input type="checkbox" id = "all_check_receiver" onchange = "all_check('receiver', this);">
															<span class="checkmark"></span>
														</label>
													</th>
													<th class="etc align-center">이름</th>
													<th class="number align-center">휴대번호</th>
												</tr>
											</thead>
											<tbody data-wrap="receiver_wrap">
												<!-- <tr>
													<td class="check">
														<label class="check_label m-auto" value="yes">
															<input type="checkbox">
															<span class="checkmark"></span>
														</label>
													</td>
													<td class="etc">이름</td>
													<td class="number">휴대번호</td>
												</tr> -->
												<tr id = "receiver_nothing" style ="display:table-row">
													<td colspan="3" class="align-center" height="285">내용이 없습니다.</td>
												</tr>
												<!-- 내용이 비었을 경우 // -->
											</tbody>
										</table>
									</div>
									<!-- adm_table_responsive // -->
								</div>
								<div>
									<form id = "form">
										<h3>이미지 삽입</h3>
										<div class="upload-container mb-1">
											<span onclick = "file_cancel(this,'img');" class="uplad-cancel d-none"><i>&#10006;</i></span>
											<input class="upload-name" value="파일선택" disabled="disabled">
											<label for="add_img_1" class="upload-btn" >이미지첨부</label>
											<input id ="add_img_1" class="upload-file wi_upload_hidden" name ="files[]" type="file" style="display:none;">
										</div>
										<div class="upload-container mb-1">
											<span onclick = "file_cancel(this,'img');" class="uplad-cancel d-none"><i>&#10006;</i></span>
											<input class="upload-name" value="파일선택" disabled="disabled">
											<label for="add_img_2" class="upload-btn" >이미지첨부</label>
											<input id ="add_img_2" class="upload-file wi_upload_hidden" name ="files[]" type="file" style="display:none;">
										</div>
										<div class="upload-container mb-1">
											<span onclick = "file_cancel(this,'img');" class="uplad-cancel d-none"><i>&#10006;</i></span>
											<input class="upload-name" value="파일선택" disabled="disabled">
											<label for="add_img_3" class="upload-btn" >이미지첨부</label>
											<input id ="add_img_3" class="upload-file wi_upload_hidden" name ="files[]" type="file" style="display:none;">
										</div>
										<p class="etc-txt">권장 사이즈 : 176px * 144px, 20KB 미만</p>
										<p class="etc-txt">제한 사이즈 : 1000px * 1000px, 1MB 미만(폰에 따라 실패)</p>
										<p class="etc-txt">파일형식 및 크기 : jpg / 최대 1MB 미만</p>
										<p class="etc-txt">하나의 메시지당 총 3개의 이미지 정보만 넣을 수 있습니다.</p>
										<p class="etc-txt">1MB 미만이라도 통신사, 휴대폰에 따라 수신이 지원이 안되거나 크기가 줄어들 수 있습니다.</p>
									</form>
								</div>
								<div class="mt-1">
									<h3>수신자 엑셀업로드</h3>
									<div class="upload-container">
										<span onclick = "file_cancel(this,'xlsx');" class="uplad-cancel d-none"><i>&#10006;</i></span>
										<input class="upload-name" value="파일선택" disabled="disabled">
										<label for = "excel_upload" class="upload-btn" onclick="">파일 첨부</label>
										<input id = "excel_upload" class="upload-file wi_upload_hidden" type="file" style="display:none;">
									</div>
									<div class="btn-list-con align-right">
										<p class="mt-1"><a href="GUGASMS/inc/sample.xlsx" download><button type="button" class="btn-sm btn-defalut">양식다운로드</button></a></p>
										<p class="mt-1"><button type="button" onclick = "excel_upload();" class="btn-sm btn-primary">업로드</button></p>
									</div>
								</div>
								<div class="mb-1">
									<h3>수신번호</h3>
									<ul class="clearfix row input-list-container">
										<li class="col-md-12">
											<div class="insert" style="width:100%;">
												<input  id ="recept_number" type="text" placeholder="'-'빼고 입력, 지역번호 포함">
											</div>
											<div class="btn-list-con align-right">
												<p class="mt-1"><button type="button" onclick="receiver_add()" class="btn-sm btn-primary">추가</button></p>
											</div>
										</li>
									</ul>
								</div>
								<div class="mt-1">
									<h3>수신자 붙여넣기</h3>
									<ul class="clearfix row input-list-container">
										<li class="col-md-12">
											<div class="insert" style="width:100%;">
												<textarea class="txtarea-custom1" id ="paste_receiver" placeholder=" 홍길동 01000000000 &#13;&#10 홍길동 01012341234"></textarea>
											</div>
										</li>
									</ul>
									<div class="btn-list-con align-right">
										<p class="mt-1"><button type="button" onclick = "receiver_paste_add();" class="btn-sm btn-primary">추가</button></p>
									</div>
								</div>
								
							</div>
						</section>
					</div>
				</div>
			</div>
		</div>
		<!-- adm_container끝 -->
		<?php include_once $this->dir . "page/admin/include/admin_footer.php"; ?>
	</div>
	<!-- wrap끝 -->
	<!-- 모달화면 -->
	<div class="modal admin_modal" id="msg_modal" style= "display:none;">
		<div class="popup_wrap modal-md">
			<div class="adm_popup_container">
				<h4 id = "msg_group_title">메시지 리스트</h4>
				<section class="adm_section_container">
					<div class="adm_simple_input" style="height:500px; overflow:auto;">
						<!-- <table class="adm_table" >
							<thead>
								<tr>
									<th class="adm_table_number">메시지 설명</th>
									<th class="adm_table_number">메시지 내용</th>
								</tr>
							</thead>
							<tbody data-wrap ="msg_list_wrap" id ="msg_list_wrap">

							</tbody>
						</table> -->
						<div class="adm_inner_title">
							<h1>문자목록</h1>
							<p>입력하고자 하시는 메세지를 선택해주세요.</p>
						</div>						
						<div class="admin_modal_search">
							<input type="text" id ="msg_search_word" placeholder="검색할 제목을 입력해주세요"/>
							<div class="admin_search_btn" id ="msg_search_btn" onclick ="msg_list_search();">검색</div>
						</div>						
						<ul class="adm_msg_text_wrap clearfix" data-wrap ="msg_list_wrap"  id ="msg_list_wrap">
							<!-- <li>
								<div class="adm_inner_text">
									<textarea style="resize: none;"></textarea>
								</div>
								<p class="adm_msg_title">12시, 18시 SMS 문자</p>
								<button class="adm_msg_select">선택하기</button>
							</li>
							<li>
								<div class="adm_inner_text">
									<textarea style="resize: none;"></textarea>
								</div>
								<p class="adm_msg_title">대우건설 SMS 문자</p>
								<button class="adm_msg_select">선택하기</button>
							</li> -->
						</ul>
					</div>
				</section>
				<div class="adm_table_btn">
					<ul>
						<li><input class="btn-sm btn-default" type="button" value="닫기" id="btnClose" onclick="close_modal();"/></li>
					</ul>
				</div>
			</div>
		</div>
	</div>
	<!-- 모달화면 -->
	<div class="modal admin_modal" id="addr_modal" style= "display:none;">
		<div class="popup_wrap modal-md modal-md-other">
			<div class="adm_popup_container">
				<h4 id = "addr_group_title"></h4>
				<section class="adm_section_container">
					<div class="adm_simple_input" style="height:500px; overflow:auto;">				
						<div class="admin_modal_addr_search">
							<input type="text" id ="addr_search_word" placeholder="이름 검색"/>
							<div class="admin_search_btn" id ="addr_search_btn" onclick ="addr_list_search();">검색</div>
						</div>		
						<table class="adm_table">
							<thead>
								<tr>
									<th class="check">
										<label class="check_label m-auto" value="yes">
											<input type="checkbox" id ="all_addr_list_check_elem"  onchange ="all_addr_list_check(this)">
											<span class="checkmark"></span>
										</label>
									</th>
									<th class="adm_table_number">이름</th>
								</tr>
							</thead>
							<tbody data-wrap ="addr_list_wrap" id ="addr_list_wrap">
								
							</tbody>
						</table>
					</div>
				</section>
				<div class="adm_table_btn">
					<ul>
						<li><input class="btn-sm btn-default" type="button" value="이동" id="move_addr_list_btn"/></li>
						<li><input class="btn-sm btn-default" type="button" value="닫기" id="btnClose" onclick="close_addr_modal();"/></li>
					</ul>
				</div>
			</div>
		</div>
	</div>
	<!-- 모달화면 -->
	<div class="modal admin_modal" id="save_msg_modal" style= "display:none;">
		<div class="popup_wrap modal-md">
			<div class="adm_popup_container">
				<h4 id = "msg_group_title">메시지 저장</h4>
				<section class="adm_section_container">
					<div class="adm_modal_input_container">
						<div class="modal_table">
							<div class="wi_board_form_row">
								<div class="wi_board_form_title"><label for="" class="wi_board_label_control">메시지함 선택</label></div>
								<div class="wi_board_form_content">
									<select id ="msg_box_list" class="wi_board_input_control">
										<option value="0">메시지함 선택</option>
									</select>
								</div>
							</div>
							<div class="wi_board_form_row">
								<div class="wi_board_form_title"><label for="" class="wi_board_label_control">메시지 설명</label></div>
								<div class="wi_board_form_content">
									<input type="text" id="msg_name" class="wi_board_input_control" autocomplete="off">
								</div>
							</div>
						</div>
					</div>
				</section>
				<div class="adm_table_btn">
					<ul>
						<li><input class="btn-sm btn-default" type="button" value="메시지 저장" id="btnClose" onclick="request_msg_add();"/></li>
						<li><input class="btn-sm btn-default" type="button" value="닫기" id="btnClose" onclick="save_close_modal();"/></li>
					</ul>
				</div>
			</div>
		</div>
	</div>
	<div style="display:none;">
		<table>
			<tr data-copy = "receiver_copy">
				<td class="check">
					<label class="check_label m-auto" value="yes">
						<input type="checkbox" data-attr="check_box">
						<span class="checkmark"></span>
					</label>
				</td>
				<td class="etc" data-attr="name"></td>
				<td class="number" data-attr="phone_number"></td>
			</tr>
			<tr class="out" data-copy ="address_copy">
				<td class="check">
					<label class="check_label m-auto" value="yes">
						<input type="checkbox" data-attr="check_box">
						<span class="checkmark"></span>
					</label>
				</td>
				<td class="tit"><span data-attr="name">인사팀</span></td>
				<!-- <td class="number"><span data-attr="content">비고</span></td> -->
			</tr>
			<tr class="out" data-copy ="message_group_copy">
				<td class="tit"><span data-attr="name"><i class="fas fa-folder"></i></span></td>
				<td class="number" data-attr="content"></td>
			</tr>
			<tr data-copy = "addr_list_copy">
				<td class="check">
					<label class="check_label m-auto" value="yes">
						<input type="checkbox" data-attr="check_box">
						<span class="checkmark"></span>
					</label>
				</td>
				<td class="tit"><span data-attr="name"></span></td>
			</tr>
			<!-- <tr data-copy="msg_list_copy">
				<td class="adm_table_number" data-attr="name"></td>
				<td class="adm_table_number" data-attr="content"></td>
			</tr> -->
			<li data-copy="msg_list_copy">
				<div class="adm_inner_text">
					<textarea data-attr="content" style="resize: none;" readonly></textarea>
				</div>
				<p class="adm_msg_title" data-attr="name">12시, 18시 SMS 문자</p>
				<button type ="button" class="adm_msg_select" data-attr="btn">선택하기</button>
			</li>
		</table>
	</div>
</body>
</html>