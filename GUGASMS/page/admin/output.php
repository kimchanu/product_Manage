<!doctype html>
<html lang="kr">
<head>
	<meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
	<title>자재출고</title>
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
	<script src="GUGASMS/page/admin/js/msg_box.js<?php echo $this->version; ?>"></script>
	<script src="GUGASMS/page/admin/js/kakao_pf_set.js<?php echo $this->version; ?>"></script>
</head>
<body>
	<div class="loading"><img class="loading_img" src ="GUGASMS/page/admin/images/Spinner.gif"></div>
	<div class="wrap">
        
		<div class="adm_container">
			<?php include_once $this->dir . "page/admin/include/admin_header.php"; ?>
			<div class="adm_section_container_head pb-0">
				<h2>자재출고</h2>
			</div>
			<div class="adm_main_container">
				<div class="clearfix row">
					<div class="col-md-7 col-lg-12">
						<section class="adm_section_container">
                            <!-- <div class="adm_section_container_head bg-light-gray other_head">
                                <h2>검색</h2>
                            </div> -->
							<div class="adm_section_container_body p-1">
                                <ul class="clearfix row input-list-container">
                                    <li class="col-md-6">
                                        <p class="input-tit">자재코드</p>
                                        <div class="insert"><input type="text" id = "mat_in_code"></div>
                                    </li>
                                    <!-- <li class="col-md-6">
                                        <p class="input-tit">검색종료일</p>
                                        <div class="insert"><input placeholder="yyyy-mm-dd" id ="end_date" type="text"></div>
                                    </li> -->
                                    <!-- <li class="col-md-6">
                                        <p class="input-tit">부서</p>
                                        <div class="insert">
                                            <select id ="send_kind">
                                                <option value = "0">ITS</option>
                                                <option value = "1">기전</option>
												<option value = "2">장비</option>
                                                <option value = "3">시설</option>
                                            </select>
                                        </div>
                                    </li> -->
									<li class="col-md-6">
                                        <p class="input-tit">수량</p>
                                        <div class="insert"><input type="text" id = "mat_in_amount"></div>
                                    </li>
									<li class="col-md-6">
                                        <p class="input-tit">품목</p>
                                        <div class="insert"><input type="text" id = "mat_in_name"></div>
                                    </li>
									<li class="col-md-6">
                                        <p class="input-tit">규격</p>
                                        <div class="insert"><input type="text" id = "mat_in_stand"></div>
                                    </li>

                                </ul>
                                <div class="btn-list-con align-right mt-1 border-t">
                                    <p class="mt-1"><button type="button" onclick = "init_search();" class="btn-sm btn-clear">초기화</button></p>
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
								</div>
								<div class="adm_table_container">
								<p class="adm_table_total" id="receiver_total">
                                    <i>Total</i>0</p>
									<div class="adm_table_long_responsive">
										<table id ="table_elem" class="adm_table adm_fixed_table mb-1">
											<thead class = "abcde">
												<tr>
													<!-- <th class="check">
														<label class="check_label m-auto" value="yes" >
															<input type="checkbox" onchange ="all_check(this);">
															<span class="checkmark"></span>
														</label>
                                                    </th> -->
													<th class="tight2">자재코드</th>
													<!-- <th class="tight2">위치</th> -->
													<th class="tight2">대분류</th>
													<!-- <th class="tight2">소분류</th> -->
													<th class="number">품명</th>
													<th class="number">규격</th>
													<!-- <th class="tight1">제조사</th> -->
													<!-- <th class="tight1">거래처</th> -->
													<th class="tight2">단위</th>
													<th class="tight1">단가</th>
													<th class="tight2">재고수량</th>
													<th class="tight1">재고금액</th>
                                                    <!-- <th class="etc">등록자</th> -->
												</tr>
											</thead>
											<tbody data-wrap="receiver_wrap" id ="receiver_wrap">
									
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
        <tbody><tr class="out" data-copy="address_copy">
            <td class="tit"><span data-attr="group_name"><i class="fas fa-folder"></i></span></td>
            <td class="number"><span data-attr="group_content">비고</span></td>
        </tr>
        <tr data-copy="receiver_copy">
            <!-- <td class="check">
                <label class="check_label m-auto" value="yes">
                    <input type="checkbox" data-attr="check_box">
                    <span class="checkmark"></span>
                </label>
            </td> -->
            <!-- <td class="check" data-attr="num"></td>
            <td class="etc" data-attr="name"></td>
            <td class="number" data-attr="phone_number"></td> -->
            <td class="tight2" data-attr="mat_in_code">-</td>
            <!-- <td class="tight2" data-attr="mat_in_place">-</td> -->
            <td class="tight2" data-attr="bc_in_b_class">-</td>
            <!-- <td class="tight2" data-attr="bc_in_s_class">-</td> -->
            <td class="number" data-attr="mat_in_name">-</td>
            <td class="number" data-attr="mat_in_stand">-</td>
            <!-- <td class="tight1" data-attr="mat_in_maker">-</td> -->
            <!-- <td class="tight1" data-attr="mat_in_custom">-</td> -->
            <td class="tight2" data-attr="mat_in_union">-</td>
            <td class="tight1" data-attr="mat_in_price">-</td>
            <td class="tight2 editable" contenteditable="false" data-attr="mat_in_amount">-</td>
            <td class="tight1" data-attr="mat_in_sum">-</td>
        </tr>
    </tbody></table>
	</div>
</body>

</html>