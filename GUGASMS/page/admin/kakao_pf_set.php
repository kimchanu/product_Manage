<!doctype html>
<html lang="kr">
<head>
	<meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
	<title>발신프로필관리</title>
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
	<script src="GUGASMS/page/admin/js/kakao_pf_set.js<?php echo $this->version; ?>"></script>
</head>
<body>
	<div class="wrap">
        <?php include_once $this->dir."page/admin/include/admin_sidebar.php";?>
		<div class="adm_container">
			<?php include_once $this->dir . "page/admin/include/admin_header.php"; ?>
			<div class="adm_section_container_head pb-0">
				<h2>발신프로필관리</h2>
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
                                                    <th class="check">
														<label class="check_label m-auto" value="yes">
															<input type="checkbox" onclick="checkAll(this)">
															<span class="checkmark"></span>
														</label>
													</th>
													<th class="number">옐로아이디</th>
                                                    <th class="number">발신프로필명</th>
                                                    <th class="number">발신프로필키</th>
                                                    <th class="number">대표발신번호</th>
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
												</tr> -->
												<!-- <tr id="none_notice" style="display: none;">
													<td colspan = "5" class="align-center" height="415">내용이 없습니다.</td>
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
							<div class="adm_section_container_head bg-light-gray other_head">
								<h2>검색</h2>
							</div>
							<div class="adm_section_container_body p-1">
								<ul class="clearfix row input-list-container">
                                    <li class="col-md-12 mb-1">
                                        <p class="input-tit">옐로아이디</p>
										<div class="insert"><input type="text" id="search_id" onkeydown="enter_Check();"></div>
                                    </li>
                                    <li class="col-md-12">
                                        <p class="input-tit">발신프로필명</p>
										<div class="insert"><input type="text" id="search_profile_name" onkeydown="enter_Check();"></div>
                                    </li>
                                </ul>
								<div class="btn-list-con align-right">
                                    <p class="mt-1"><button type="button" class="btn-sm btn-clear" onclick="search_reset();">초기화</button></p>
									<p class="mt-1"><button type="button" class="btn-sm btn-primary" onclick="search_profile();">검색</button></p>
								</div>
							</div>
                        </section>
                        <!-- 검색 // -->
						<section class="adm_section_container">
							<div class="adm_section_container_body p-1">
                                <div class="btn-list-con align-right">
                                    <p class="mb-1"><button type="button" class="btn-sm btn-defalut" onclick="delete_profile();">삭제</button></p>
                                    <p class="mb-1"><button type="button" class="btn-sm btn-secondary" onclick="reg_reset();">신규작성</button></p>
									<p class="mb-1"><button type="button" class="btn-sm btn-primary" onclick="register_profile();">저장</button></p>
								</div>
								<ul class="clearfix row input-list-container">
                                    <li class="col-md-12 mb-1">
                                        <p class="input-tit">옐로아이디</p>
										<div class="insert"><input type="text" id="rec_id"></div>
                                    </li>
                                    <li class="col-md-12 mb-1">
                                        <p class="input-tit">발신프로필명</p>
										<div class="insert"><input type="text" id="rec_profile_name"></div>
                                    </li>
                                    <li class="col-md-12 mb-1">
                                        <p class="input-tit">발신프로필키</p>
										<div class="insert"><input type="text" id="profile_key"></div>
                                    </li>
                                    <li class="col-md-12 mb-1">
                                        <p class="input-tit">대표발신번호</p>
										<div class="insert">
                                            <select id="callback_num">
                                                <option value="0">선택</option>
                                                <!-- <option>샘플1</option> -->
                                            </select>
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
			<tr data-copy = "notice_copy">
				<td class="check">
					<label class="check_label m-auto" value="yes">
						<input type="checkbox" onclick='check(this)' data-attr="check">
						<span class="checkmark"></span>
					</label>
				</td>
				<td class="number" data-attr="yellow_id">test</td>
				<td class="number" data-attr="profile_name">프로필</td>
				<td class="number"><span class="ellipsis" data-attr="profile_key">fb318164e47a6dc7de6ab625749ccd9960250366</span></td>
				<td class="number" data-attr="callback_num">대표발신번호</td>
				<!-- <td class="more" data-attr="indate"></td> -->
			</tr>
			<tr id="none_notice" style="display: none;">
				<td colspan = "5" class="align-center" height="415">내용이 없습니다.</td>
			</tr>
		</table>
	</div>
</body>
</html>