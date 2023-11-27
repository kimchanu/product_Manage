<!doctype html>
<html lang="kr">
<head>
	<meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
	<title>메시지전송결과</title>
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
	<script src="GUGASMS/page/admin/js/msg_result.js<?php echo $this->version; ?>"></script>
</head>
<body>
	<div class="loading"><img class="loading_img" src ="GUGASMS/page/admin/images/Spinner.gif"></div>
	<div class="wrap">
        <?php include_once $this->dir."page/admin/include/admin_sidebar.php";?>
		<div class="adm_container">
			<?php include_once $this->dir . "page/admin/include/admin_header.php"; ?>
			<div class="adm_section_container_head pb-0">
				<h2>메시지전송결과</h2>
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
                                        <p class="input-tit">발송시작일</p>
                                        <div class="insert"><input placeholder="yyyy-mm-dd" readonly type="text" id="start_date"></div>
                                    </li>
                                    <li class="col-md-6">
                                        <p class="input-tit">발송종료일</p>
                                        <div class="insert"><input placeholder="yyyy-mm-dd" readonly type="text" id="end_date"></div>
                                    </li>
                                    <li class="col-md-6 mt-1">
                                        <p class="input-tit">전송분류</p>
                                        <div class="insert">
                                            <select id="msg_type">
                                                <option value="0">전체</option>
                                                <option value="1">SMS</option>
                                                <option value="2">LMS</option>
                                                <option value="3">MMS</option>
                                            </select>
                                        </div>
									</li>
                                    <li class="col-md-6 mt-1">
                                        <p class="input-tit">전송결과</p>
                                        <div class="insert">									
											<select id="send_type">
                                                <option value="0">전체</option>
                                                <option value="1">성공</option>
                                                <option value="2">실패</option>
                                                <option value="3">송신중/송신완료(결과대기)</option>
                                            </select>
										</div>
                                    </li>
                                    <li class="col-md-6 mt-1">
                                        <p class="input-tit">발신번호</p>
                                        <div class="insert"><input type="text" id="callback" onKeyup="this.value=this.value.replace(/[^0-9]/g,'');" placeholder="-는 제외하고 번호만 입력해주세요"></div>
                                    </li>
                                    <li class="col-md-6 mt-1">
                                        <p class="input-tit">수신자번호</p>
                                        <div class="insert"><input type="text" id="dstaddr" onKeyup="this.value=this.value.replace(/[^0-9]/g,'');" placeholder="-는 제외하고 번호만 입력해주세요"></div>
                                    </li>
                                </ul>
                                <div class="btn-list-con align-right mt-1 border-t">
                                    <p class="mt-1"><button type="button" class="btn-sm btn-clear" onclick="value_reset();">초기화</button></p>
                                    <p class="mt-1"><button type="button" class="btn-sm btn-primary" onclick="search_msg(0);">검색</button></p>
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
                                    <!-- <p><button type="button" class="btn-sm btn-defalut">전체삭제</button></p>
                                    <p><button type="button" class="btn-sm btn-defalut">선택삭제</button></p> -->
									<p><button type="button" onclick="exportExcel();" class="btn-sm btn-primary">엑셀다운</button></p>
								</div>
								<div class="adm_table_container">
									<div class="adm_table_long_responsive">
										<table class="adm_table adm_fixed_table mb-1" id="table_elem">
											<thead>
												<tr>
													<!-- <th class="check">
														<label class="check_label m-auto" value="yes">
															<input type="checkbox" onclick='checkAll(this);'>
															<span class="checkmark"></span>
														</label>
                                                    </th> -->
													<th class="number">번호</th>
													<th class="number">발송일</th>
													<th class="number">발송시간</th>
                                                    <th class="number">발신번호</th>
                                                    <th class="etc">전송분류</th>
                                                    <th class="number">수신자번호</th>
                                                    <th class="etc">전송결과</th>
													<th class="tit">내용</th>
                                                    <th class="etc">결과코드</th>
                                                    <th class="etc">통신사</th>
												</tr>
											</thead>
											<tbody data-wrap="notice_wrap" id="notice_wrap">
												<!-- <tr>
													<td class="check">
														<label class="check_label m-auto" value="yes">
															<input type="checkbox">
															<span class="checkmark"></span>
														</label>
                                                    </td>
                                                    <td class="number">2020-02-01</td>
                                                    <td class="number">010-2224-1123</td>
                                                    <td class="etc">SMS</td>
                                                    <td class="number">010-2225-3333</td>
                                                    <td class="etc">발송</td>
													<td class="tit"></td>
                                                    <td class="etc"></td>
                                                    <td class="etc">SKT</td>
                                                </tr>
                                                <tr>
													<td class="check">
														<label class="check_label m-auto" value="yes">
															<input type="checkbox">
															<span class="checkmark"></span>
														</label>
                                                    </td>
                                                    <td class="number">2020-02-01</td>
                                                    <td class="number">010-2224-1123</td>
                                                    <td class="etc">SMS</td>
                                                    <td class="number">010-1123-3555</td>
                                                    <td class="etc">발송</td>
													<td class="tit"></td>
                                                    <td class="etc"></td>
                                                    <td class="etc">KT</td>
                                                </tr> -->
												<tr id="none_notice">
													<td colspan = "9" class="align-center" height="185">내용이 없습니다.</td>
												</tr>
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
								<div class="flex-between">
									<div class="btn-list-con mb-1">
										<h2>발송대기/미발송 내역</h2>
									</div>
									<div class="btn-list-con align-right mb-1">
										<!-- <p><button type="button" class="btn-sm btn-defalut">전체삭제</button></p>
										<p><button type="button" class="btn-sm btn-defalut">선택삭제</button></p> -->
										<p><button type="button" onclick="refresh_ready();" class="btn-sm btn-primary">새로고침</button></p>
									</div>
								</div>
								<div class="adm_table_container">
									<div class="adm_table_long_responsive">
										<table class="adm_table adm_fixed_table mb-1">
											<thead>
												<tr>
													<th class="number">발송일</th>
													<th class="number">발송시간</th>
                                                    <th class="number">발신번호</th>
                                                    <th class="etc">전송분류</th>
													<th class="number">수신자번호</th>
													<th class="etc">상태</th>
													<th class="tit">내용</th>
												</tr>
											</thead>
											<tbody data-wrap="ready_wrap" id="ready_wrap">
												<!-- <tr id="none_notice">
													<td colspan = "7" class="align-center" height="185">발송대기중인 메시지가 없습니다.</td>
												</tr> -->
											</tbody>
										</table>
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
			<tr data-copy="notice_copy">
				<!-- <td class="check">
					<label class="check_label m-auto" value="yes">
						<input type="checkbox" data-attr="check">
						<span class="checkmark"></span>
					</label>
				</td> -->
				<td class="number" data-attr="elem_num"></td>
				<td class="number" data-attr="send_time"></td>
				<td class="number" data-attr="send_hour"></td>
				<td class="number" data-attr="callback"></td>
				<td class="etc" data-attr="msg_type"></td>
				<td class="number" data-attr="dstaddr"></td>
				<td class="etc" data-attr="send_type"></td>
				<td class="tit" data-attr="text"></td>
				<td class="etc" data-attr="result"></td>
				<td class="etc" data-attr="telecom"></td>
			</tr>
			<!-- <tr data-copy = "notice_copy">
				<td class="check">
					<label class="check_label" value="yes">
						<input type="checkbox" data-attr="board_idx">
						<span class="checkmark" style = "margin:0 auto;"></span>
					</label>
				</td>
				<td class="number" data-attr="number"></td>
				<td class="name" data-attr="title"></td>
				<td class="name" data-attr="kr"></td>
				<td class="name" data-attr="en"></td>
				<td class="more" data-attr="indate"></td>
			</tr> -->
			<tr data-copy="ready_copy">
				<td class="number" data-attr="send_time"></td>
				<td class="number" data-attr="send_hour"></td>
				<td class="number" data-attr="callback"></td>
				<td class="etc" data-attr="msg_type"></td>
				<td class="number" data-attr="dstaddr"></td>
				<td class="etc" data-attr="stat"></td>
				<td class="tit" data-attr="text"></td>
			</tr>
		</table>
	</div>
</body>
</html>