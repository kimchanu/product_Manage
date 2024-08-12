<!doctype html>
<html lang="kr">
<head>
	<meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
	<title>입고현황</title>
	<!-- FONT -->
	<link href="https://fonts.googleapis.com/css?family=Gothic+A1:100,200,300,400,500,700,800,900&display=swap" rel="stylesheet">
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/common.css<?php echo $this->version; ?>" />
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/reset.css<?php echo $this->version; ?>" />
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/admin.css<?php echo $this->version; ?>" />
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/adm_sub.css<?php echo $this->version; ?>" />
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/admin.modal.css<?php echo $this->version;?>"/>
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/adm_table.css<?php echo $this->version; ?>" />
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/common2.css<?php echo $this->version; ?>" />
	<script src="https://use.fontawesome.com/releases/v5.2.0/js/all.js"></script>

	<!-- sript시작 -->
	<script  src="http://code.jquery.com/jquery-latest.min.js"></script>
    <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js"></script>
	<script src="GUGASMS/page/admin/js/xlsx.full.min.js"></script>
	<script src="GUGASMS/page/admin/js/FileSaver.min.js"></script>
	<script src="GUGASMS/page/admin/js/lb.js<?php echo $this->version; ?>"></script>
	<script src="GUGASMS/page/admin/js/admin.js<?php echo $this->version;?>"></script>
	<script src="GUGASMS/page/admin/js/input_list.js<?php echo $this->version; ?>"></script>
	<link rel="stylesheet" href="GUGASMS/page/admin/css/jquery-ui.min.css">

	<style>
        .date-picker-icon {
            cursor: pointer;
            margin-left: 5px;
            position: relative;
        }
    </style>
</head>
<body>
	<div class="loading"><img class="loading_img" src ="GUGASMS/page/admin/images/Spinner.gif"></div>
	<div class="wrap">
        
		<div class="adm_container">
			<?php include_once $this->dir . "page/admin/include/admin_header.php"; ?>

			<div class="adm_main_container">
				<div class="clearfix row">
					<div class="col-md-12 col-lg-12">
						<section class="adm_section_container">
							<div class="adm_section_container_body p-1">
                                <ul class="clearfix row input-list-container">
                                    <li class="col-md-3">
                                        <p class="input-tit">자재코드</p>
                                        <div class="insert"><input type="text" id = "mat_in_code"></div>
                                    </li>
									<li class="col-md-2 mt-1">
									<p class="input-tit">부서</p>
								<div class="insert">
								<select id ="send_kind">
									<option value = "0">ITS</option>
									<option value = "1">기전</option>
									<option value = "2">시설</option>
								</select>
							</div>
						</li>
									</li>
                                    <li class="col-md-6">
                                    <div class="btn-list-con align-right mt-1">
                                    <p class="mt-1"><button type="button" onclick = "search();" class="btn-sm btn-primary">검색</button></p>
                                </div>
                                    </li>

                                </ul>

                            </div>
							<!-- adm_section_container_body // -->
						</section>
						<!-- adm_section_container끝 -->
					</div>
					<div class="col-md-12">
						<section class="adm_section_container">
							<div class="adm_section_container_body p-1">
								<div class="btn-list-con align-right mb-1">
								</div>
								<div class="adm_table_container">
								<p class="adm_table_total" id="receiver_total">
                                    <i>Total</i>0</p>
									<div class="adm_table_long_responsive">
										<table id ="table_elem" class="adm_table adm_fixed_table mb-1">
											<thead class = "abcde">
												<tr>
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
													<th class="tight2">수량</th>
													<th class="tight1">금액</th>
                                                    <th class="tight1" id = "input_date1">입고날짜 <i class="fa fa-calendar-alt" onclick=""></i><input class="datepicker" type="text" style=" visibility : hidden; width : 1px; height : 1px;"></th>
												</tr>
											</thead>
											<tbody data-wrap="receiver_wrap" id ="receiver_wrap">
									
											</tbody>
										</table>
									</div>
									<div class="btn-list-con align-right">
                                	<p class="mb-1"><button id ="getRowValue" type="button" class="btn-sm btn-primary" onclick = "" style = "margin-right:10px;">저장</button></p>
                       			 	</div>
									<!-- adm_table_responsive // -->
								</div>
								
							</div>
							<!-- adm_section_container_body // -->
						</section>
						<!-- adm_section_container // -->
					</div>
				<!-- <div class="col-md-3">
					<p> 예산 : <br>
						기집행액 : <br>
						현재집행액 : <br>
						잔액 :
					</p> -->
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
            <td class="tight2" data-attr="mat_in_code" value = "">-</td>
            <td class="tight2" data-attr="bc_in_b_class"><select id="changeTest">
														<option value="TCS">TCS</option>
														<option value="FTMS">FTMS</option>
														<option value="전산">전산</option>
														<option value="">기타</option>
														</select></td>
            <td class="number" data-attr="mat_in_name">-</td>
            <td class="number" data-attr="mat_in_stand">-</td>
            <td class="tight2" data-attr="mat_in_union">-</td>
            <td class="tight1" data-attr="mat_in_price">-</td>
            <td class="tight2" data-attr="mat_in_amount">-</td>
            <td class="tight1" data-attr="mat_in_sum">-</td>
			<td class="tight1 date-cell" data-attr="input_date">-</td>
        </tr>
    </tbody></table>
	</div>
</body>

</html>