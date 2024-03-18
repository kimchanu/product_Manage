<!doctype html>
<html lang="kr">
<head>
	<meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
	<title>일별통계</title>
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
	<script src="GUGASMS/page/admin/js/state_day.js<?php echo $this->version; ?>"></script>
</head>
<body> 
	<div class="loading"><img class="loading_img" src ="GUGASMS/page/admin/images/Spinner.gif"></div>
	<div class="wrap">

		<div class="adm_container">
			<?php include_once $this->dir . "page/admin/include/admin_header.php"; ?>
			<div class="adm_section_container_head pb-0">
				<h2>일별통계</h2>
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
                                        <p class="input-tit">조회시작일</p>
                                        <div class="insert"><input placeholder="yyyy-mm-dd" type="text" id="start_date"></div>
                                    </li>
                                    <li class="col-md-6">
                                        <p class="input-tit">조회종료일</p>
                                        <div class="insert"><input placeholder="yyyy-mm-dd" type="text" id="end_date"></div>
                                    </li>
                                    <li class="col-md-6 mt-1">
                                        <p class="input-tit">전송분류</p>
                                        <div class="insert">
                                            <select id="msg_type">
                                                <option value="0">전체</option>
                                                <option value="1">SMS</option>
                                                <option value="2">LMS</option>
                                                <option value="3">MMS</option>
												<option value="6">알림톡</option>
												<!-- <option value="7">친구톡</option> -->
                                            </select>
                                        </div>
									</li>
                                </ul>
                                <div class="btn-list-con align-right mt-1 border-t">
                                    <p class="mt-1"><button type="button" class="btn-sm btn-clear" onclick="value_reset();">초기화</button></p>
                                    <p class="mt-1"><button type="button" class="btn-sm btn-primary" onclick="search();">검색</button></p>
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
                                                    <th class="number">날짜</th>
                                                    <th class="number">유형</th>
                                                    <th class="etc">총건수</th>
                                                    <th class="number">성공</th>
                                                    <th class="etc">실패</th>
													<th class="tit">성공률</th>
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
												<!-- <tr id="nothing">
													<td colspan = "7" class="align-center" height="185">내용이 없습니다.</td>
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
				<td class="number" data-attr="date"></td>
				<td class="etc" data-attr="msg_type"></td>
				<td class="number" data-attr="total"></td>
				<td class="etc" data-attr="success"></td>
				<td class="etc" data-attr="fail"></td>
				<td class="etc" data-attr="percent"></td>
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
		</table>
	</div>
</body>
</html>