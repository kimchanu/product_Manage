<!doctype html>
<html lang="kr">
<head>
	<meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
	<title>메시지함</title>
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
	<script src="GUGASMS/page/admin/js/jquery/jquery-3.3.1.min.js"></script>
	<script src="GUGASMS/page/admin/js/lb.js<?php echo $this->version; ?>"></script>
	<script src="GUGASMS/page/admin/js/admin.js<?php echo $this->version;?>"></script>
	<script src="GUGASMS/page/admin/js/msg_box.js<?php echo $this->version; ?>"></script>
</head>
<body>
	<div class="loading"><img class="loading_img" src ="GUGASMS/page/admin/images/Spinner.gif"></div>
	<div class="wrap">
        <?php include_once $this->dir."page/admin/include/admin_sidebar.php";?>
		<div class="adm_container">
			<?php include_once $this->dir . "page/admin/include/admin_header.php"; ?>			
			<div class="adm_main_container overflow-y clearfix adm_msg_total_wrap">				
				<div class="adm_section_container_head pb-0" style="padding-left: 0;">
					<h2>메시지 폼관리</h2>
				</div>
				<div class="clearfix col-md-6 adm_msg_total_inner total_inner1">
					<div class="col-md-12">
						<section class="adm_section_container">
							<div class="adm_section_container_body p-1">
								<div class="adm_table_container">
									<div class="adm_table_long_responsive" style="height:400px;">
										<table class="adm_table adm_fixed_table mb-1">
											<thead>
												<tr>
													<th class="tit">메시지그룹명</th>
													<th class="number">설명</th>
												</tr>
											</thead>
											<tbody data-wrap="msg_box_wrap" id ="msg_box_wrap">
												<!-- <tr class="out">
													<td class="tit"><span><i class="fas fa-folder"></i></i>메시지함1</span></td>
													<td class="number">최상위</td>
												</tr> -->
												<!-- <tr class="in">
													<td class="tit"><span><i class="fas fa-arrow-right"></i>메시지함2</span></td>
													<td class="number">발신번호</td>
                                                </tr>
                                                <tr class="in2">
													<td class="tit"><span><i class="fas fa-folder"></i>메시지함2</span></td>
													<td class="number">발신번호</td>
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
					<div class="col-md-12">
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
				<div class="clearfix col-md-6 adm_msg_total_inner total_inner2">					
					<div class="col-md-12">
						
						<!-- 주소록 엑셀 업로드 -->
						<section class="adm_section_container">
							<div class="adm_section_container_body p-1">
								<div class="btn-list-con align-right mb-1">
                                    <p><button type="button" id ="all_delete" onclick ="all_delete();" class="btn-sm btn-defalut">전체삭제</button></p>
                                    <p><button type="button" id ="select_delete" onclick ="select_delete();" class="btn-sm btn-defalut">선택삭제</button></p>
									<p><button type="button" id ="open_modal_btn" onclick = "open_modal();" class="btn-sm btn-primary">메시지작성</button></p>
								</div>
								<div class="adm_table_container">
									<p class="adm_table_total" id = "total_elem"><i>Total</i>0</p>
									<div class="adm_table_long_responsive" style="height:315px;">
										<!-- <table class="adm_table adm_fixed_table mb-1">
											<thead>
												<tr>
													<th class="check">
														<label class="check_label m-auto" onclick ="all_check(this);" value="yes">
															<input type="checkbox" id ="all_check_msg">
															<span class="checkmark"></span>
														</label>
													</th>
													<th class="etc">메시지 설명</th>
													<th class="number">메시지 내용</th>
												</tr>
											</thead>
											<tbody data-wrap="msg_wrap" id ="msg_wrap">												
											</tbody>
										</table> -->
										<ul class="adm_msg_text_wrap clearfix" data-wrap="msg_wrap" id ="msg_wrap">
											<!-- <li>
												<div class="adm_inner_text">
													<textarea style="resize: none;"></textarea>
												</div>
												<p class="adm_msg_title">12시, 18시 SMS 문자</p>
												<ul class="clearfix admin_btn_wrap">
													<li class="msg_check_input">
														<label class="check_label m-auto">
															<input type="checkbox" id ="addr_all_check_elem">
															<span class="checkmark"></span>
														</label>
													</li>
													<li class="adm_edit_btn">
														<button>수정</button>
													</li>
													<li class="adm_del_btn">
														<button>삭제</button>
													</li>
												</ul>
											</li>
											<li>
												<div class="adm_inner_text">
													<textarea style="resize: none;"></textarea>
												</div>
												<p class="adm_msg_title">12시, 18시 SMS 문자</p>
												<ul class="clearfix admin_btn_wrap">
													<li class="msg_check_input">
														<label class="check_label m-auto">
															<input type="checkbox" id ="addr_all_check_elem">
															<span class="checkmark"></span>
														</label>
													</li>
													<li class="adm_edit_btn">
														<button>수정</button>
													</li>
													<li class="adm_del_btn">
														<button>삭제</button>
													</li>
												</ul>
											</li>
											<li>
												<div class="adm_inner_text">
													<textarea style="resize: none;"></textarea>
												</div>
												<p class="adm_msg_title">12시, 18시 SMS 문자</p>
												<ul class="clearfix admin_btn_wrap">
													<li class="msg_check_input">
														<label class="check_label m-auto">
															<input type="checkbox" id ="addr_all_check_elem">
															<span class="checkmark"></span>
														</label>
													</li>
													<li class="adm_edit_btn">
														<button>수정</button>
													</li>
													<li class="adm_del_btn">
														<button>삭제</button>
													</li>
												</ul>
											</li> -->
										</ul>
									</div>
									<!-- adm_table_responsive // -->
								</div>
							</div>
							<!-- adm_section_container_body // -->
						</section>
                        <!-- 검색 -->
                        <section class="adm_section_container">
							<div class="adm_section_container_head bg-light-gray other_head">
								<h2>메세지 검색</h2>
							</div>
							<div class="adm_section_container_body p-1">
								<ul class="clearfix row input-list-container">
                                    <li class="col-md-12">
                                        <p class="input-tit">메시지 설명</p>
										<div class="insert"><input type="text" id ="search_name"></div>
                                    </li>
									<li class="col-md-12 mt-1">
                                        <p class="input-tit">메시지 내용</p>
                                        <div class="insert"><input type="text"  id ="search_content"></div>
                                    </li>
                                </ul>
								<div class="btn-list-con align-right">
                                    <p class="mt-1"><button onclick = "search_init();" id ="search_init_btn" type="button" class="btn-sm btn-clear">초기화</button></p>
									<p class="mt-1"><button onclick = "search();" id ="search_btn" type="button" class="btn-sm btn-primary">검색</button></p>
								</div>
							</div>
                        </section>
                        <!-- 검색 // -->
						<!-- adm_section_container // -->
					</div>
				</div>
			</div>
		</div>
		<!-- adm_container끝 -->
		<?php include_once $this->dir . "page/admin/include/admin_footer.php"; ?>
	</div>
	<!-- 모달화면 -->
	<div class="modal admin_modal" id="msg_modal" style= "display:none;">
		<div class="popup_wrap modal-md">
			<div class="adm_popup_container">
				<h4>메시지 작성</h4>
				<section class="adm_section_container">
					<div class="adm_modal_input_container">
						<!-- <div class="modal_table">
							<div class="wi_board_form_row">
								<div class="wi_board_form_title"><label for="" class="wi_board_label_control">메시지 설명</label></div>
								<div class="wi_board_form_content">
									<input type="text" id="msg_name" class="wi_board_input_control" autocomplete="off">
								</div>
							</div>
							<div class="wi_board_form_row">
								<div class="wi_board_form_title"><label for="" class="wi_board_label_control">메시지 내용</label></div>
								<div class="wi_board_form_content">
									<p class="count-txt align-right" id ="count_text" style ="width:298px; font-size :12px;">0 / 90 Byte (SMS)</p>
									<textarea id="msg_content" onkeyup="byteCheckViewDisplay(this);" style ="width:298px; height :262px; padding:15px; font-size:16px;"></textarea>									
								</div>
							</div>
						</div> -->
						

						<div class="msg_name_wrap">
							<h1>메세지 제목</h1>
							<input type="text" id="msg_name" class="wi_board_input_control" autocomplete="off" placeholder="제목을 입력해주세요"/>
						</div>

						<div class="img-phone img-bg sm-img-phone modal_phone">
							<div class="phone-screen overflow-y">
								<div class = "inner">
									<p class="count-txt align-right" id ="count_text">0 / 90 Byte (SMS)</p>
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
									<textarea id="msg_content" onkeyup="byteCheckViewDisplay(this);"></textarea>
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
						</div>
					</div>
				</section>
				<div class="adm_table_btn">
					<ul>
						<li><input class="btn-sm btn-default" type="button" value="메시지 등록" id="btn_register"/></li>
						<li><input class="btn-sm btn-default" type="button" value="닫기" id="btnClose" onclick="close_modal();"/></li>
					</ul>
				</div>
			</div>
		</div>
	</div>
	<!-- wrap끝 -->
	<div style="display:none;">
		<table>
			<tr class="out" data-copy ="msg_box_copy">
				<td class="tit"><span data-attr="name"><i class="fas fa-folder"></i></span></td>
				<td class="number" data-attr="content"></td>
			</tr>
			<!-- <tr data-copy ="msg_copy">
				<td class="check">
					<label class="check_label m-auto" valsue="yes">
						<input type="checkbox" data-attr="check_box">
						<span class="checkmark"></span>
					</label>
				</td>
				<td class="etc" data-attr="name"></td>
				<td class="number" data-attr="content"></td>
			</tr> -->
		</table>
		<li data-copy ="msg_copy">
			<div class="adm_inner_text">
				<textarea style="resize: none;" data-attr="content" readonly></textarea>
			</div>
			<p class="adm_msg_title" data-attr="name">12시, 18시 SMS 문자</p>
			<ul class="clearfix admin_btn_wrap">
				<li class="msg_check_input">
					<label class="check_label m-auto">
						<input type="checkbox" data-attr="check_box">
						<span class="checkmark"></span>
					</label>
				</li>
				<li class="adm_edit_btn">
					<button type ="button" data-attr="modify_btn">수정</button>
				</li>
				<li class="adm_del_btn">
					<button type ="button" data-attr="del_btn">삭제</button>
				</li>
			</ul>
		</li>
	</div>
</body>
</html>