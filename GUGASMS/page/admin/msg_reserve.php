<!doctype html>
<html lang="kr">
<head>
	<meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
	<title>예약메시지</title>
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
	<script src="GUGASMS/page/admin/js/msg_reserve.js<?php echo $this->version; ?>"></script>
</head>
<body>
	<div class="loading"><img class="loading_img" src ="GUGASMS/page/admin/images/Spinner.gif"></div>
	<div class="wrap">
        <?php include_once $this->dir."page/admin/include/admin_sidebar.php";?>
		<div class="adm_container">
			<?php include_once $this->dir . "page/admin/include/admin_header.php"; ?>
			<div class="adm_section_container_head pb-0">
				<h2>입고현황</h2>
			</div>
			<div class="adm_main_container">
				<div class="clearfix row">
					<div class="col-md-7 col-lg-12">
						<section class="adm_section_container">
                            <div class="adm_section_container_head bg-light-gray other_head">
                                <h2>검색</h2>
                            </div>
							<div class="adm_section_container_body p-1">
                                <ul class="clearfix row input-list-container">
                                    <li class="col-md-6">
                                        <p class="input-tit">검색시작일</p>
                                        <div class="insert"><input placeholder="yyyy-mm-dd" id ="start_date" type="text"></div>
                                    </li>
                                    <li class="col-md-6">
                                        <p class="input-tit">검색종료일</p>
                                        <div class="insert"><input placeholder="yyyy-mm-dd" id ="end_date" type="text"></div>
                                    </li>
                                    <!-- <li class="col-md-6 mt-1">
                                        <p class="input-tit">전송분류</p>
                                        <div class="insert">
                                            <select id ="send_kind">
                                                <option value = "0">전체</option>
                                                <option value = "1">SMS</option>
												<option value = "2">LMS</option>
                                                <option value = "3">MMS</option>
                                            </select>
                                        </div>
                                    </li> -->
                                    <!-- <li class="col-md-6 mt-1">
                                        <p class="input-tit">발신번호</p>
                                        <div class="insert"><input placeholder="-는 제외하고 번호만 입력해주세요" id ="send_number" type="text"></div>
                                    </li>
                                    <li class="col-md-6 mt-1">
                                        <p class="input-tit">수신자번호</p>
                                        <div class="insert"><input placeholder="-는 제외하고 번호만 입력해주세요" id ="receiver_number" type="text"></div>
                                    </li> -->
                                    <li class="col-md-6 mt-1">
                                        <p class="input-tit">내용</p>
                                        <div class="insert"><input id ="msg_content" type="text"></div>
                                    </li>
                                </ul>
                                <div class="btn-list-con align-right mt-1 border-t">
                                    <p class="mt-1"><button type="button" onclick = "init_search_elem();" class="btn-sm btn-clear">초기화</button></p>
                                    <p class="mt-1"><button type="button" onclick = "search();" class="btn-sm btn-primary">검색</button></p>
                                </div>
                            </div>
							<!-- adm_section_container_body // -->
						</section>
						<!-- adm_section_container끝 -->
					</div>
					<div class="col-md-12">
						<section class="adm_section_container">
							<div class="adm_section_container_body p-1">
								<div class="btn-list-con align-right mb-1">
                                    <!-- <p><button type="button" onclick="all_del_check();" class="btn-sm btn-defalut">전체삭제</button></p>
                                    <p><button type="button" class="btn-sm btn-defalut">선택삭제</button></p> -->
									<p><button type="button" onclick="exportExcel();" class="btn-sm btn-primary">엑셀다운</button></p>
								</div>
								<div class="adm_table_container">
									<div class="adm_table_long_responsive">
										<table id ="table_elem" class="adm_table adm_fixed_table mb-1">
											<thead>
												<tr>
													<!-- <th class="check">
														<label class="check_label m-auto" value="yes" >
															<input type="checkbox" onchange ="all_check(this);">
															<span class="checkmark"></span>
														</label>
                                                    </th> -->
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
                                                    <!-- <th class="etc">등록자</th> -->
												</tr>
											</thead>
											<tbody data-wrap="reserve_wrap" id ="reserve_wrap">
												<!-- <tr>
													<td class="check">
														<label class="check_label m-auto" value="yes">
															<input type="checkbox">
															<span class="checkmark"></span>
														</label>
													</td>
													<td class="etc">SMS</td>
                                                    <td class="number">010-3021-551</td>
                                                    <td class="number">010-233-1341</td>
                                                    <td class="etc">김정민</td>
                                                    <td class="number">2020-02-01</td>
                                                    <td class="number">18:12:54</td>
                                                    <td class="etc">발송</td>
													<td class="tit"><span claㄴss="ellipsis"></span></td>
                                                    <td class="etc">김철수</td>
                                                </tr>
                                                <tr>
													<td class="check">
														<label class="check_label m-auto" value="yes">
															<input type="checkbox">
															<span class="checkmark"></span>
														</label>
													</td>
													<td class="etc">SMS</td>
                                                    <td class="number">010-302-1551</td>
                                                    <td class="number">010-233-1341</td>
                                                    <td class="etc">홍길동</td>
                                                    <td class="number">2020-02-01</td>
                                                    <td class="number">18:12:54</td>
                                                    <td class="etc">발송</td>
													<td class="tit"><span class="ellipsis"></span></td>
                                                    <td class="etc">홍길동</td>
												</tr> -->
												<!-- 내용이 비었을 경우 -->
												<!-- <tr id ="reserve_nothing">
													<td colspan = "8" class="align-center" height="185">내용이 없습니다.</td>
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
	<div class="modal admin_modal" id="content_modal" style= "display:none;">
		<div class="popup_wrap modal-md modal-md-other">
			<div class="adm_popup_container" style ="width:396px;">
				<h4>메시지 전송내용</h4>
				<section class="adm_section_container">
					<div class="adm_simple_input" style ="width:298px; height:262px;">
						<textarea style ="width:298px; height:262px; font-size:16px;" id ="msg_text"></textarea>
					</div>
				</section>
				<div class="adm_table_btn">
					<ul>
						<li><input class="btn-sm btn-default" type="button" value="닫기" id="btnClose" onclick="close_content_modal();"/></li>
					</ul>
				</div>
			</div>
		</div>
	</div>
	<!-- wrap끝 -->
	<div style="display:none;">
		<table>
			<tr data-copy ="reserve_copy">
				<!-- <td class="check">
					<label class="check_label m-auto" value="yes">
						<input type="checkbox" data-attr ="check_box">
						<span class="checkmark"></span>
					</label>
				</td> -->
				<td class="etc" data-attr ="send_kind"></td>
				<td class="number" data-attr="sender_number"></td>
				<td class="number" data-attr="receiver_number"></td>
				<td class="number" data-attr="send_date"></td>
				<td class="number" data-attr="send_time"></td>
				<td class="etc" data-attr="state"></td>
				<td class="tit"><span class="ellipsis" data-attr="content"></span></td>
				<!-- <td class="etc">관리자</td> -->
			</tr>
		</table>
	</div>
</body>

</html>