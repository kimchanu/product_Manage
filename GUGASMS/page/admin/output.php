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
	<link rel="stylesheet" href="https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
	<link rel="stylesheet" href="GUGASMS/page/admin/css/jquery-ui.min.css">
	<script src="GUGASMS/page/admin/js/jquery/jquery-3.3.1.min.js"></script>
	<script src="GUGASMS/page/admin/js/jquery-ui.min.js"></script>
	 
	<!-- sript시작 -->
	<script src="GUGASMS/page/admin/js/xlsx.full.min.js"></script>
	<script src="GUGASMS/page/admin/js/FileSaver.min.js"></script>
	<script src="GUGASMS/page/admin/js/lb.js<?php echo $this->version; ?>"></script>
	<script src="GUGASMS/page/admin/js/admin.js<?php echo $this->version;?>"></script>
	<script src="GUGASMS/page/admin/js/output.js<?php echo $this->version; ?>"></script>
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
					<div class="col-md-12 col-lg-12">
						<section class="adm_section_container">
							<div class="adm_section_container_body p-1">
                                <ul class="clearfix row input-list-container">
                                    <li class="col-md-2">
                                        <p class="input-tit">자재코드</p>
                                        <div class="insert"><input type="text" id = "mat_in_code"></div>
                                    </li>
                                    <li class="col-md-2">
                                        <p class="input-tit">수량</p>
                                        <div class="insert">
                                            <select id ="mat_in_amount">
                                                <option value = "0">0</option>
                                                <option value = "1" selected>1이상</option>
                                            </select>
                                        </div>
                                    </li>

									<li class="col-md-2">
                                        <p class="input-tit">품목</p>
                                        <div class="insert"><input type="text" id = "mat_in_name"></div>
                                    </li>
									<li class="col-md-2">
                                        <p class="input-tit">규격</p>
                                        <div class="insert"><input type="text" id = "mat_in_stand"></div>
                                    </li>
                                    <li class="col-md-2">
                                    <div class="btn-list-con align-right mt-1">
                                    <p class="mt-1"><button type="button" onclick = "search();" class="btn-sm btn-primary" id = "loadDataButton">검색</button></p>
                                </div>
                                    </li>

                                </ul>
                            </div>
							<!-- adm_section_container_body // -->
						</section>
						<!-- adm_section_container끝 -->
					</div>
					<div class="col-md-12" >
						<section class="adm_section_container"  style="width : 55%; display: inline-block;">
							<div class="adm_section_container_body p-1" style="">
								<div class="adm_table_container">
								<p class="adm_table_total " id="receiver_total">
                                    <i>Total</i>0</p>
									<div class="adm_table_long_responsive">
										<table id ="table_elem" class="adm_table adm_fixed_table mb-1">
											<thead class = "abcde">
												<tr>
													<th class="check">
                                                    </th>
													<th class="tight2">자재코드</th>
													<th class="number">품명</th>
													<th class="number">규격</th>
													<th class="tight1">단가</th>
													<th class="tight2">재고수량</th>
													<th class="tight1">재고금액</th>
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
                        <div style = "margin-left: 1px; margin-top: 1px; display: inline-block; height:300px;  float: right; width:43%;">
                        <section class="adm_section_container">
                        <div class="adm_table_long_responsive">
										<table id ="table_elem2" class="adm_table adm_fixed_table mb-1">
											<thead class = "abcde">
												<tr>
                                                    </th>
													<th class="number">품명</th>
													<th class="number">규격</th>
													<th class="tight1">단가</th>
													<th class="tight2">현재수량</th>
													<th class="tight2">사용수량</th>
													<th class="tight1">재고금액</th>

												</tr>
											</thead>
											<tbody data-wrap="receiver_wrap3" id ="receiver_wrap3">
									
											</tbody>
										</table>
									</div>
                            <ul class="clearfix row input-list-container" style="margin-top:20px;">
                            <li class="col-md-12 mt-1" style="margin:10px;">
                                        <p class="input-tit">출고날짜</p>
                                        <div class="insert">
										<input type="date" id="date1" value="xxx" min="yyy" max="zzz" style="width:50%">
                                        </div>
                                    </li>
                                    <li class="col-md-12 mt-1" style="margin:10px;">
                                        <p class="input-tit">출고내용</p>
										<div class="insert">
                                            <textarea class="txtarea-custom1" id ="comment"></textarea>
                                        </div>
                                    </li>
                                </ul>
                                <div class="btn-list-con align-right">
                                <p class="mb-1"><button id ="getRowValue" type="button" class="btn-sm btn-primary" onclick = "" style = "margin-right:10px;">저장</button></p>
                        </div>
                        </section>
                        
                        </div>
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
            <td class="check">
                <label class="check_label m-auto" value="yes">
                    <input type="checkbox" data-attr="check_box" id ="myCheckbox" onclick="">
                    <span class="checkmark"></span>
                </label>
            </td>

            <td class="tight2" data-attr="mat_in_code">-</td>
            <td class="number" data-attr="mat_in_name">-</td>
            <td class="number" data-attr="mat_in_stand">-</td>
            <td class="tight1" data-attr="mat_in_price">-</td>
            <td class="tight2 " data-attr="mat_in_amount">-</td>
            <td class="tight1" data-attr="mat_in_sum">-</td>
        </tr>
    </tbody></table>
	</div>



	<!-- wrap끝 -->
	<div style="display:none;">
    <table>
        <tbody><tr class="out" data-copy="address_copy2">
            <td class="tit"><span data-attr="group_name"><i class="fas fa-folder"></i></span></td>
            <td class="number"><span data-attr="group_content">비고</span></td>
        </tr>
        <tr data-copy="receiver_copy2">
            <td class="number" data-attr="mat_in_name">-</td>
            <td class="number" data-attr="mat_in_stand">-</td>
            <td class="tight1" data-attr="mat_in_price">-</td>
			<td class="tight1" data-attr="mat_in_amount">-</td>
            <td class="tight2" ><input type="text" data-attr="mat_in_new_amount" value = "" class="input-text" style="width : 30px; text-align: center"></td>
            <td class="tight1" data-attr="mat_in_sum">-</td>
        </tr>
    </tbody></table>
	</div>

</body>

</html>