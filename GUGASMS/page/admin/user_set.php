<!doctype html>
<html lang="kr">
<head>
	<meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
	<title>사용자관리</title>
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
	<script src="GUGASMS/page/admin/js/admin.js<?php echo $this->version; ?>"></script>
	<script src="GUGASMS/page/admin/js/user_set.js<?php echo $this->version; ?>"></script>
</head>
<body>
	<div class="wrap">
		<div class="loading"><img class="loading_img" src ="GUGASMS/page/admin/images/Spinner.gif"></div>
        <?php include_once $this->dir."page/admin/include/admin_sidebar.php";?>
		<div class="adm_container">
			<?php include_once $this->dir . "page/admin/include/admin_header.php"; ?>
			<div class="adm_section_container_head pb-0">
				<h2>사용자관리</h2>
			</div>
			<div class="adm_main_container overflow-y">
				<div class="clearfix row">
					<div class="col-md-7 col-lg-12">
                        <section class="adm_section_container">
							<div class="adm_section_container_head bg-light-gray other_head">
								<h2>사용자검색</h2>
							</div>
							<div class="adm_section_container_body p-1">
								<ul class="clearfix row input-list-container">
                                    <li class="col-md-12">
                                        <p class="input-tit">권한그룹</p>
										<div class="insert">
                                            <select id ="search_role">
												<option value = "0">권한그룹을 선택해주세요</option>
												<option value = "1">관리자</option>
												<option value = "2">사용자</option>
                                            </select>
                                        </div>
                                    </li>
                                    <li class="col-md-12 mt-1">
                                        <p class="input-tit">사용자ID</p>
										<div class="insert"><input type="text" id ="search_id"></div>
                                    </li>
                                    <li class="col-md-12 mt-1">
                                        <p class="input-tit">사용자명</p>
										<div class="insert"><input type="text" id ="search_name"></div>
                                    </li>
                                </ul>
								<div class="btn-list-con align-right">
                                    <p class="mt-1"><button onclick = "search_init();" type="button" class="btn-sm btn-clear">초기화</button></p>
									<p class="mt-1"><button onclick = "search();" type="button" class="btn-sm btn-primary">검색</button></p>
								</div>
							</div>
                        </section>
						<!-- 주소록 엑셀 업로드 -->
						<section class="adm_section_container">
							<div class="adm_section_container_body p-1">
								<div class="btn-list-con align-right mb-1">
                                    <!-- <p><button type="button" class="btn-sm btn-defalut">전체삭제</button></p> -->
                                    <p><button type="button" onclick = "select_del('list');" class="btn-sm btn-defalut">선택삭제</button></p>
									<!-- <p><button type="button" class="btn-sm btn-primary">엑셀다운</button></p> -->
								</div>
								<div class="adm_table_container">
									<p class="adm_table_total" id = "total_elem"><i>Total</i>0</p>
									<div class="adm_table_long_responsive" style="height:396px;">
										<table class="adm_table adm_fixed_table mb-1">
											<thead>
												<tr>
													<th class="check">
														<label class="check_label m-auto" value="yes">
															<input type="checkbox"onchange ="all_check(this);">
															<span class="checkmark"></span>
														</label>
													</th>
                                                    <th class="etc">사용자명</th>
                                                    <th class="etc">사용자ID</th>
                                                    <th class="number">권한그룹</th>
                                                    <th class="number">SMS 월별발송량</th>
                                                    <th class="etc">SMS 사용량</th>
                                                    <th class="number">LMS 월별발송량</th>
                                                    <th class="etc">LMS 사용량</th>
													<th class="number">MMS 월별발송량</th>
                                                    <th class="etc">MMS 사용량</th>
													<th class="number">알림톡 월별발송량</th>
                                                    <th class="etc">알림톡 사용량</th>
													<th class="number">친구톡 월별발송량</th>
                                                    <th class="etc">친구톡 사용량</th>
												</tr>
											</thead>
											<tbody data-wrap="user_wrap" id ="user_wrap">
												<!-- <tr>
													<td class="check">
														<label class="check_label m-auto" value="yes">
															<input type="checkbox" >
															<span class="checkmark"></span>
														</label>
													</td>
                                                    <td class="etc">홍길동</td>
                                                    <td class="etc">아이디</td>
                                                    <td class="number">내용</td>
                                                    <td class="number">내용</td>
                                                    <td class="etc">내용</td>
                                                    <td class="number">내용</td>
                                                    <td class="etc">내용</td>
												</tr>
												<tr>
													<td colspan = "8" class="align-center" height="321">내용이 없습니다.</td>
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
						<section class="adm_section_container">
							<div class="adm_section_container_body p-1">
								<div class="btn-list-con align-right mb-1">
                                    <!-- <p><button type="button" class="btn-sm btn-defalut">전체삭제</button></p> -->
                                    <p><button type="button" onclick = "select_del('list');" class="btn-sm btn-defalut">선택삭제</button></p>
									<!-- <p><button type="button" class="btn-sm btn-primary">엑셀다운</button></p> -->
								</div>
								<div class="adm_table_container">
									<p class="adm_table_total" id = "total_elem"><i>Total</i>0</p>
									<div class="adm_table_long_responsive" style="height:396px;">
										<table class="adm_table adm_fixed_table mb-1">
											<thead>
												<tr>
													<th class="check">
														<label class="check_label m-auto" value="yes">
															<input type="checkbox"onchange ="all_check(this);">
															<span class="checkmark"></span>
														</label>
													</th>
                                                    <th class="etc">부서</th>
                                                    <th class="etc">ID</th>
                                                    <th class="number">이름</th>
                                                    <th class="number">직책</th>
                                                    <th class="etc">휴대전화</th>
													<!-- <th class="etc">SMS 사용량</th>
													<th class="etc">SMS 사용량</th> -->
												</tr>
											</thead>
											<tbody data-wrap="user_wrap2" id ="user_wrap2">
												<!-- <tr>
													<td class="check">
														<label class="check_label m-auto" value="yes">
															<input type="checkbox" >
															<span class="checkmark"></span>
														</label>
													</td>
                                                    <td class="etc">홍길동</td>
                                                    <td class="etc">아이디</td>
                                                    <td class="number">내용</td>
                                                    <td class="number">내용</td>
                                                    <td class="etc">내용</td>
                                                    <td class="number">내용</td>
                                                    <td class="etc">내용</td>
												</tr>
												<tr>
													<td colspan = "8" class="align-center" height="321">내용이 없습니다.</td>
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
					</div>
					<div class="col-md-5 col-lg-12">
						<section class="adm_section_container">
							<div class="adm_section_container_body p-1">
                                <div class="btn-list-con align-right">
                                    <p class="mb-1"><button type="button" id ="single_del" class="btn-sm btn-defalut" onclick = "select_del()">삭제</button></p>
                                    <p class="mb-1"><button type="button" class="btn-sm btn-secondary" onclick = "new_init();">신규작성</button></p>
									<p class="mb-1"><button id ="register_btn" type="button" class="btn-sm btn-primary" onclick = "signup();">저장</button></p>
								</div>
								<ul class="clearfix row input-list-container">
                                    <li class="col-md-12">
                                        <p class="input-tit">사용자ID</p>
										<div class="insert"><input type="text" id ="id"></div>
                                    </li>
                                    <li class="col-md-12 mt-1">
                                        <p class="input-tit">사용자명</p>
										<div class="insert"><input type="text" id ="user_name" maxlength = "8"></div>
                                    </li>
                                    <li class="col-md-12 mt-1">
                                        <p class="input-tit">비밀번호</p>
										<div class="insert"><input type="password" autocomplete="off" id ="pw"></div>
                                    </li>
                                    <li class="col-md-12 mt-1">
                                        <p class="input-tit">권한그룹</p>
										<div class="insert">
                                            <select id ="role">
												<option value = "0">권한그룹을 선택해주세요</option>
												<option value = "1">관리자</option>
												<option value = "2">사용자</option>
                                            </select>
                                        </div>
									</li>
									<li class="col-md-12 mt-1">
                                        <p class="input-tit">발신번호</p>
										<div class="insert"><input value="143345" placeholder="-는 제외하고 입력해주세요" type="text" id ="send_number"></div>
                                    </li>
									<li class="col-md-12 mt-1">
                                        <p class="input-tit">SMS 월별 발송량</p>
										<div class="insert"><input value = "100" type="text" id ="sms"></div>
                                    </li>
                                    <li class="col-md-12 mt-1">
                                        <p class="input-tit">SMS 사용량</p>
										<div class="insert"><input placeholder="0" type="text"readonly id ="use_sms"></div>
                                    </li>
									<li class="col-md-12 mt-1">
                                        <p class="input-tit">LMS 월별 발송량</p>
										<div class="insert"><input value = "100" type="text"  id ="lms"></div>
                                    </li>
                                    <li class="col-md-12 mt-1">
                                        <p class="input-tit">LMS 사용량</p>
										<div class="insert"><input placeholder="0" type="text" readonly id ="use_lms"></div>
                                    </li>
                                    <li class="col-md-12 mt-1">
                                        <p class="input-tit">MMS 월별 발송량</p>
										<div class="insert"><input value = "100" type="text"  id ="mms"></div>
                                    </li>
                                    <li class="col-md-12 mt-1">
                                        <p class="input-tit">MMS 사용량</p>
										<div class="insert"><input placeholder="0" type="text" readonly id ="use_mms"></div>
                                    </li>
                                    <li class="col-md-12 mt-1">
                                        <p class="input-tit">알림톡 월별 발송량</p>
										<div class="insert"><input value = "100" type="text"  id ="t_kakao"></div>
                                    </li>
                                    <li class="col-md-12 mt-1">
                                        <p class="input-tit">알림톡 사용량</p>
										<div class="insert"><input placeholder="0" type="text" readonly id ="use_t_kakao"></div>
                                    </li>
                                    <li class="col-md-12 mt-1">
                                        <p class="input-tit">친구톡 월별 발송량</p>
										<div class="insert"><input value = "100" type="text"  id ="f_kakao"></div>
                                    </li>
                                    <li class="col-md-12 mt-1">
                                        <p class="input-tit">친구톡 사용량</p>
										<div class="insert"><input placeholder="0" type="text" readonly id ="use_f_kakao"></div>
                                    </li>
                                    <li class="col-md-12 mt-1">
                                        <p class="input-tit">비고</p>
										<div class="insert">
                                            <textarea class="txtarea-custom1" id ="comment"></textarea>
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
			<tr data-copy ="user_copy">
				<td class="check">
					<label class="check_label m-auto" value="yes">
						<input type="checkbox" data-attr="check_box">
						<span class="checkmark"></span>
					</label>
				</td>
				<td class="etc" data-attr="name">홍길동</td>
				<td class="etc" data-attr="id">아이디</td>
				<td class="number" data-attr="role">내용</td>
				<td class="number" data-attr="sms">내용</td>
				<td class="etc" data-attr="use_sms">내용</td>
				<td class="number" data-attr="lms">내용</td>
				<td class="etc" data-attr="use_lms">내용</td>
				<td class="number" data-attr="mms">내용</td>
				<td class="etc" data-attr="use_mms">내용</td>
				<td class="number" data-attr="t_kakao">내용</td>
				<td class="etc" data-attr="use_t_kakao">내용</td>
				<td class="number" data-attr="f_kakao">내용</td>
				<td class="etc" data-attr="use_f_kakao">내용</td>
			</tr>
		</table>
	</div>
	<!-- wrap끝 -->
	<div style="display:none;">
		<table>
			<tr data-copy ="user_copy2">
				<td class="check">
					<label class="check_label m-auto" value="yes">
						<input type="checkbox" data-attr2="check_box">
						<span class="checkmark"></span>
					</label>
				</td>
				<td class="etc" data-attr2="group_id">부서</td>
				<td class="etc" data-attr2="user_id">ID</td>
				<td class="number" data-attr2="user_name">이름</td>
				<td class="number" data-attr2="user_duty">직책</td>
				<td class="etc" data-attr2="user_phone">휴대전화</td>
			</tr>
		</table>
	</div>
</body>
</html>