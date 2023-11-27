<!doctype html>
<html lang="kr">
<head>
	<meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
	<title>알림톡템플릿관리</title>
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
	<script src="GUGASMS/page/admin/js/kakao_tpl_set.js<?php echo $this->version; ?>"></script>
</head>
<body>
	<div class="loading"><img class="loading_img" src ="GUGASMS/page/admin/images/Spinner.gif"></div>
	<div class="wrap">
        <?php include_once $this->dir."page/admin/include/admin_sidebar.php";?>
		<div class="adm_container">
			<?php include_once $this->dir . "page/admin/include/admin_header.php"; ?>
			<div class="adm_section_container_head pb-0">
				<h2>알림톡템플릿관리</h2>
			</div>
			<div class="adm_main_container overflow-y">
				<div class="clearfix row">
					<div class="col-md-6 col-lg-12">
                        <!-- 검색 -->
                        <section class="adm_section_container">
							<div class="adm_section_container_head bg-light-gray other_head">
								<h2>검색</h2>
							</div>
							<div class="adm_section_container_body p-1">
								<ul class="clearfix row input-list-container">
                                    <li class="col-md-12 mb-1">
                                        <p class="input-tit">옐로아이디</p>
										<div class="insert"><input type="text" id="search_yellow_id" onkeydown="enter_Check();"></div>
                                    </li>
                                    <li class="col-md-12">
                                        <p class="input-tit">템플릿명</p>
										<div class="insert"><input type="text" id="search_tpl_name" onkeydown="enter_Check();"></div>
                                    </li>
                                </ul>
								<div class="btn-list-con align-right">
                                    <p class="mt-1"><button type="button" class="btn-sm btn-clear" onclick="search_reset();">초기화</button></p>
									<p class="mt-1"><button type="button" class="btn-sm btn-primary" onclick="search_template();">검색</button></p>
								</div>
							</div>
                        </section>
                        <!-- 검색 // -->
						<section class="adm_section_container">
							<div class="adm_section_container_body p-1">
								<div class="adm_table_container">
									<div class="adm_table_long_responsive" style="height:480px;">
										<table class="adm_table adm_fixed_table mb-1">
											<thead>
												<tr>
                                                    <th class="number">템플릿명</th>
                                                    <th class="number">템플릿코드</th>
                                                    <th class="tit">템플릿내용</th>
                                                    <th class="tit">발신프로필(옐로아이디)</th>
                                                    <th class="etc">등록일</th>
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
													<td class="number">test</td>
                                                    <td class="number">프로필</td>
                                                    <td class="number"><span class="ellipsis">fb318164e47a6dc7de6ab625749ccd9960250366</span></td>
													<td class="number">대표발신번호</td>
													<td class="number">발신프로필</td>
                                                    <td class="number">등록일</td>
												</tr> -->
												<!-- <tr>
													<td colspan = "5" class="align-center" height="415" id="none_notice">내용이 없습니다.</td>
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
                                <div class="btn-list-con align-right">
									<p class="mb-1"><button type="button" class="btn-sm btn-defalut" onclick="delete_template();">삭제</button></p>
                                    <p class="mb-1"><button type="button" class="btn-sm btn-secondary" onclick="value_reset(2);">신규</button></p>
									<p class="mb-1"><button type="button" class="btn-sm btn-primary" onclick="check_template(1);" id="register_template_btn">저장</button></p>
								</div>
								<ul class="clearfix row input-list-container">
                                    <li class="col-md-12 mb-1">
                                        <p class="input-tit">템플릿명</p>
										<div class="insert"><input type="text" id="reg_tpl_name"></div>
                                    </li>
                                    <li class="col-md-12 mb-1">
                                        <p class="input-tit">템플릿코드</p>
										<div class="insert"><input type="text" id="tpl_key"></div>
                                    </li>
                                    <li class="col-md-12 mb-1">
                                        <p class="input-tit">발신프로필(옐로우아이디)</p>
										<div class="insert">
											<!-- <input type="text" id="reg_yellow_id"> -->
											<select id="reg_yellow_id">
                                                <option value="0">선택</option>
                                            </select>
										</div>
                                    </li>
                                    <li class="col-md-12 mb-1">
                                        <p class="input-tit">버튼타입1</p>
										<div class="insert">
                                            <select id="btn_type" onchange="btn_display(this, 1);">
                                                <option value="0">없음</option>
                                                <option value="1">웹링크</option>
                                                <option value="2">앱링크</option>
                                            </select>
                                        </div>
									</li>
									<div id="btn_div" style="display: none;">
										<li class="col-md-12 mb-1">
											<p class="input-tit">버튼명</p>
											<div class="insert"><input type="text" id="btn_name"></div>
										</li>
										<li class="col-md-12 mb-1">
											<p class="input-tit">버튼 URL1</p>
											<div class="insert"><input type="text" placeholder="PC LINK" id="btn_url1"></div>
										</li>
										<li class="col-md-12 mb-1">
											<p class="input-tit">버튼 URL2</p>
											<div class="insert"><input type="text" placeholder="MOBILE LINK" id="btn_url2"></div>
										</li>
									</div>
									<li class="col-md-12 mb-1">
										<p class="input-tit">버튼타입2</p>
										<div class="insert">
											<select id="btn_type2" onchange="btn_display(this, 2);">
												<option value="0">없음</option>
												<option value="1">웹링크</option>
												<option value="2">앱링크</option>
											</select>
										</div>
									</li>
									<div id="btn_div2" style="display: none;">
										<li class="col-md-12 mb-1">
											<p class="input-tit">버튼명</p>
											<div class="insert"><input type="text" id="btn_2_name"></div>
										</li>
										<li class="col-md-12 mb-1">
											<p class="input-tit">버튼 URL1</p>
											<div class="insert"><input type="text" placeholder="PC LINK" id="btn_2_url1"></div>
										</li>
										<li class="col-md-12 mb-1">
											<p class="input-tit">버튼 URL2</p>
											<div class="insert"><input type="text" placeholder="MOBILE LINK" id="btn_2_url2"></div>
										</li>
									</div>
									<li>
										<p class="input-tit">템플릿 내용</p>
										<textarea id="content" cols="90" style="margin-bottom: 20px; padding: 10px;" maxlength="1000"></textarea>
									</li>
									<li>
										<span id="text_length">0</span><span> / 1000</span>
									</li>
                                    <li class="col-md-12 mb-1">
                                        <p class="input-tit hidden">설명</p>
										<div class="insert">
                                            <p class="etc-txt">1.버튼타입의 설정은 알림톡 내용에 URL링크를 넣고자 할 때 사용합니다.</p>
                                            <p class="etc-txt">2.링크가 필요없을 경우 버튼 타입을 '없음'으로 선택하여 주세요.</p>
                                            <p class="etc-txt">3.버튼타입이 '웹링크'일때, '버튼 URL'항목은 모바일웹링크주소를 입력(필수 입력값), '버튼 URL 2'항목은 PC링크주소를 입력하여 주세요.</p>
                                            <p class="etc-txt mb-0">4.버튼타입이 '앱링크'일때, '버튼 URL'항목은 IOS앱링크주소를 입력(필수 입력값), '버튼 URL 2'항목은 안드로이드앱링크주소(필수입력값)를 입력하여 주세요.</p>
											<p class="etc-txt mb-0">5.템플릿 내용 등록시 사용가능한 고정변수입니다.( #{수신자명} )</p>
											<p class="etc-txt mb-0">6.템플릿 내용 등록시 사용가능한 가변변수입니다.( #{변수1} , #{변수2}, {#변수3} )</p>
                                        </div>
                                    </li>
                                    
                                </ul>
							</div>
                        </section>
                        <!-- 발신번호 신규 // -->
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
			<tr data-copy="notice_copy">
				<td class="number" data-attr="tpl_name"></td>
				<td class="number"><span class="ellipsis" data-attr="tpl_key"></span></td>
				<td class="number"><span class="ellipsis" data-attr="content"></td>
				<td class="number" data-attr="yellow_id"></td>
				<td class="number" data-attr="regdate"></td>
			</tr>

			<tr>
				<td colspan = "5" class="align-center" height="415" id="none_notice">내용이 없습니다.</td>
			</tr>
		</table>
	</div>
</body>
</html>