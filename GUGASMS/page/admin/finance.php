<html>
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta http-equiv='Content-Type' content='text/html; charset=utf-8' />
		<style>
			table{font-size: 90%; border-collapse : collapse; margin : auto; text-align:center;}
			tr{height:30px;}
			a { text-decoration: none; }
			a:visited {color: red;}
			.bb  {border-top: 1px solid black;border-bottom: 1px solid black;border-left: 1px solid black;border-right: 1px solid black;}
			.bc  {border-top: 1px solid black;border-left: 1px solid black;border-right: 1px solid black;}
		</style>

		<!-- FONT -->
	<link href="https://fonts.googleapis.com/css?family=Gothic+A1:100,200,300,400,500,700,800,900&display=swap" rel="stylesheet">
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/common.css<?php echo $this->version; ?>" />
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/reset.css<?php echo $this->version; ?>" />
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/admin.css<?php echo $this->version; ?>" />
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/adm_sub.css<?php echo $this->version; ?>" />
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/admin.modal.css<?php echo $this->version;?>"/>
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/adm_table.css<?php echo $this->version; ?>" />
	<link rel="stylesheet" type="text/css" href="GUGASMS/page/admin/css/common2.css<?php echo $this->version; ?>" />

		<title>자재수불명세서</title>
		<script src="GUGASMS/page/admin/js/jquery/jquery-3.3.1.min.js"></script>
		<script src="GUGASMS/page/admin/js/xlsx.full.min.js"></script>
		<script src="GUGASMS/page/admin/js/FileSaver.min.js"></script>
		<script src="GUGASMS/page/admin/js/lb.js<?php echo $this->version; ?>"></script>
		<script src="GUGASMS/page/admin/js/admin.js<?php echo $this->version;?>"></script>
	</head>

	<body>
	<div class="wrap">
    <div class="adm_container">
        <?php include_once $this->dir."page/admin/include/admin_header.php"; ?>
        <table cellpadding="5px">
            <colgroup>
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
                <col width="3%">
            </colgroup>
            <tr>
                <td align="center" colspan="26" rowspan="2" class="bb" style="color:#000000">
                    <div style="font-size:24pt">
                        <strong>2024년 3월 자재수불명세서대장</strong>
                    </div>
                </td>

                <td align="center" colspan="2" rowspan="2" class="bb" style="color:#000000">결<br/>재</td>

                <td align="center" colspan="3" rowspan="1" class="bb" style="color:#000000">담 당</td>

                <td align="center" colspan="3" rowspan="1" class="bb" style="color:#000000">&nbsp;</td>

                <td align="center" colspan="3" rowspan="1" class="bb" style="color:#000000">&nbsp;</td>

                <td align="center" colspan="3" rowspan="1" class="bb" style="color:#000000">&nbsp;</td>

            </tr>
            <tr>

                <td align="center" colspan="3" rowspan="1" class="bb" style="color:#000000">
                    <div style="font-size:28pt">&nbsp;</div>
                </td>

                <td align="center" colspan="3" rowspan="1" class="bb" style="color:#000000">
                    <div style="font-size:28pt">&nbsp;</div>
                </td>

                <td align="center" colspan="3" rowspan="1" class="bb" style="color:#000000">
                    <div style="font-size:28pt">&nbsp;</div>
                </td>

                <td align="center" colspan="3" rowspan="1" class="bb" style="color:#000000">
                    <div style="font-size:28pt">&nbsp;</div>
                </td>

            </tr>
            <tr>
                <td align="right" style="color:#000000">
                    <div style="font-size:12pt">
                        <strong>&nbsp;</strong>
                    </div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">&nbsp;</td>
                <td align="right" style="color:#000000">&nbsp;</td>
                <td align="right" style="color:#000000">&nbsp;</td>
                <td align="right" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
            </tr>
            <tr>
                <td align="center" colspan="10" rowspan="1" class="bb" style="color:#000000">
                    <div style="font-size:12pt">문서번호</div>
                </td>

                <td align="center" colspan="10" rowspan="1" class="bb" style="color:#000000">
                    <div style="font-size:12pt">GK-24-C-003</div>
                </td>

                <td align="center" colspan="10" rowspan="1" class="bb" style="color:#000000">
                    <div style="font-size:12pt">작성일자</div>
                </td>

                <td align="center" colspan="10" rowspan="1" class="bb" style="color:#000000">
                    <div style="font-size:12pt">2024.3.5.</div>
                </td>

            </tr>
            <tr>
                <td align="center" colspan="10" rowspan="1" class="bb" style="color:#000000">
                    <div style="font-size:12pt">부서명</div>
                </td>

                <td align="center" colspan="10" rowspan="1" class="bb" style="color:#000000">
                    <div style="font-size:12pt">GK사업소</div>
                </td>

                <td align="center" colspan="10" rowspan="1" class="bb" style="color:#000000">
                    <div style="font-size:12pt">작성자</div>
                </td>

                <td align="center" colspan="10" rowspan="1" class="bb" style="color:#000000">
                    <div style="font-size:12pt">김찬우</div>
                </td>

            </tr>
            <tr>
                <td align="right" style="color:#000000">
                    <div style="font-size:12pt">
                        <strong>&nbsp;</strong>
                    </div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">&nbsp;</td>
                <td align="right" style="color:#000000">&nbsp;</td>
                <td align="right" style="color:#000000">&nbsp;</td>
                <td align="right" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
            </tr>
            <tr>
                <td align="center" colspan="3" rowspan="2" class="bb" style="color:#000000">
                    <div style="font-size:12pt">구 분</div>
                </td>

                <td align="center" colspan="5" rowspan="2" class="bb" style="color:#000000">
                    <div style="font-size:12pt">전월재고</div>
                </td>

                <td align="center" colspan="10" rowspan="1" class="bb" style="color:#000000">
                    <div style="font-size:12pt">입 고</div>
                </td>

                <td align="center" colspan="10" rowspan="1" class="bb" style="color:#000000">
                    <div style="font-size:12pt">출 고</div>
                </td>

                <td align="center" colspan="5" rowspan="2" class="bb" style="color:#000000">
                    <div style="font-size:12pt">재 고</div>
                </td>

                <td align="center" colspan="4" rowspan="2" class="bb" style="color:#000000">재고율<br/>(입고대비)</td>

                <td align="center" colspan="3" rowspan="2" class="bb" style="color:#000000">재고비율<br/>(구 분 별)</td>

            </tr>
            <tr>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    <div style="font-size:12pt">당 월</div>
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    <div style="font-size:12pt">누 계</div>
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    <div style="font-size:12pt">당 월</div>
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    <div style="font-size:12pt">누 계</div>
                </td>

            </tr>
            <tr>
                <td align="center" colspan="3" rowspan="1" class="bb" style="color:#000000">(E)TCS</td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    100,069,200
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    -
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    281,419,200
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    -
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    181,350,000
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    100,069,200
                </td>

                <td align="center" colspan="4" rowspan="1" class="bb" style="color:#000000">35.6%</td>

                <td align="center" colspan="3" rowspan="1" class="bb" style="color:#000000">62.1%</td>

            </tr>
            <tr>
                <td align="center" colspan="3" rowspan="1" class="bb" style="color:#000000">FTMS</td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    39,595,930
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    -
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    181,434,530
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    -
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    141,838,600
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    39,595,930
                </td>

                <td align="center" colspan="4" rowspan="1" class="bb" style="color:#000000">21.8%</td>

                <td align="center" colspan="3" rowspan="1" class="bb" style="color:#000000">24.6%</td>

            </tr>
            <tr>
                <td align="center" colspan="3" rowspan="1" class="bb" style="color:#000000">전 산</td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    21,031,100
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    -
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    224,934,810
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    1,754,200
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    205,657,910
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    19,276,900
                </td>

                <td align="center" colspan="4" rowspan="1" class="bb" style="color:#000000">8.6%</td>

                <td align="center" colspan="3" rowspan="1" class="bb" style="color:#000000">12.0%</td>

            </tr>
            <tr>
                <td align="center" colspan="3" rowspan="1" class="bb" style="color:#000000">기 타</td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    2,213,750
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    -
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    99,412,957
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    -
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    97,199,207
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    2,213,750
                </td>

                <td align="center" colspan="4" rowspan="1" class="bb" style="color:#000000">2.2%</td>

                <td align="center" colspan="3" rowspan="1" class="bb" style="color:#000000">1.4%</td>

            </tr>
            <tr>
                <td align="center" colspan="3" rowspan="1" class="bb" style="color:#000000">
                    <div style="font-size:12pt">합 계</div>
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    <div style="font-size:12pt">
                        162,909,980
                    </div>
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    <div style="font-size:12pt">
                        -
                    </div>
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    <div style="font-size:12pt">
                        787,201,497
                    </div>
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    <div style="font-size:12pt">
                        1,754,200
                    </div>
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    <div style="font-size:12pt">
                        626,045,717
                    </div>
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    <div style="font-size:12pt">
                        161,155,780
                    </div>
                </td>

                <td align="center" colspan="4" rowspan="1" class="bb" style="color:#000000">
                    <div style="font-size:12pt">20.5%</div>
                </td>

                <td align="center" colspan="3" rowspan="1" class="bb" style="color:#000000">
                    <div style="font-size:12pt">100.0%</div>
                </td>

            </tr>
            <tr>
                <td align="left" style="color:#000000">
                    <div style="font-size:12pt">&nbsp;</div>
                </td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">
                    <strong>&nbsp;</strong>
                </td>
                <td align="center" style="color:#000000">
                    <strong>&nbsp;</strong>
                </td>
                <td align="center" style="color:#000000">
                    <strong>&nbsp;</strong>
                </td>
                <td align="center" style="color:#000000">
                    <strong>&nbsp;</strong>
                </td>
                <td align="center" style="color:#000000">
                    <strong>&nbsp;</strong>
                </td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">
                    <strong>&nbsp;</strong>
                </td>
                <td align="center" style="color:#000000">
                    <strong>&nbsp;</strong>
                </td>
                <td align="center" style="color:#000000">
                    <strong>&nbsp;</strong>
                </td>
                <td align="center" style="color:#000000">
                    <strong>&nbsp;</strong>
                </td>
                <td align="center" style="color:#000000">
                    <strong>&nbsp;</strong>
                </td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
                <td align="center" style="color:#000000">&nbsp;</td>
            </tr>
            <tr>
                <td align="left" style="color:#000000">
                    <div style="font-size:12pt">
                        <strong>
                            예산집행 현황 (2024년)</strong>
                    </div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
                <td align="right" style="color:#000000">
                    <div style="font-size:10pt">&nbsp;</div>
                </td>
            </tr>
            <tr>
                <td align="center" colspan="3" rowspan="2" class="bb" style="color:#000000">
                    <div style="font-size:12pt">구 분</div>
                </td>

                <td align="center" colspan="5" rowspan="2" class="bb" style="color:#000000">
                    <div style="font-size:12pt">예 산</div>
                </td>

                <td align="center" colspan="10" rowspan="1" class="bb" style="color:#000000">
                    <div style="font-size:12pt">당월집행</div>
                </td>

                <td align="center" colspan="10" rowspan="1" class="bb" style="color:#000000">
                    <div style="font-size:12pt">집행누계</div>
                </td>

                <td align="center" colspan="5" rowspan="2" class="bb" style="color:#000000">
                    <div style="font-size:12pt">잔 액</div>
                </td>

                <td align="center" colspan="4" rowspan="2" class="bb" style="color:#000000">
                    <div style="font-size:12pt">집행률</div>
                </td>

                <td align="center" colspan="3" rowspan="2" class="bb" style="color:#000000">
                    <div style="font-size:12pt">비 고</div>
                </td>

            </tr>
            <tr>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    <div style="font-size:12pt">MRO</div>
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    <div style="font-size:12pt">기 타</div>
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    <div style="font-size:12pt">MRO</div>
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    <div style="font-size:12pt">기 타</div>
                </td>

            </tr>
            <tr>
                <td align="center" colspan="3" rowspan="1" class="bb" style="color:#000000">6월</td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    44,090,000
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    -
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    -
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    -
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    1,754,200
                </td>

                <td align="center" colspan="5" rowspan="1" class="bb" style="color:#000000">
                    42,335,800
                </td>

                <td align="center" colspan="4" rowspan="1" class="bb" style="color:#000000">4.0%</td>

                <td align="center" colspan="3" rowspan="1" class="bb" style="color:#000000">&nbsp;</td>

            </tr>
        </table>
    </div>
</div>
</body>
</html>