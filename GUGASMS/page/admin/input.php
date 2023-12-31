<!doctype html>
<html lang="kr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>입고등록</title>
        <!-- FONT -->
        <link
            href="https://fonts.googleapis.com/css?family=Gothic+A1:100,200,300,400,500,700,800,900&display=swap"
            rel="stylesheet">
        <link
            rel="stylesheet"
            type="text/css"
            href="GUGASMS/page/admin/css/common.css<?php echo $this->version; ?>"/>
        <link
            rel="stylesheet"
            type="text/css"
            href="GUGASMS/page/admin/css/reset.css<?php echo $this->version; ?>"/>
        <link
            rel="stylesheet"
            type="text/css"
            href="GUGASMS/page/admin/css/admin.css<?php echo $this->version; ?>"/>
        <link
            rel="stylesheet"
            type="text/css"
            href="GUGASMS/page/admin/css/adm_sub.css<?php echo $this->version; ?>"/>
        <link
            rel="stylesheet"
            type="text/css"
            href="GUGASMS/page/admin/css/admin.modal.css<?php echo $this->version;?>"/>
        <link
            rel="stylesheet"
            type="text/css"
            href="GUGASMS/page/admin/css/adm_table.css<?php echo $this->version; ?>"/>
        <link
            rel="stylesheet"
            type="text/css"
            href="GUGASMS/page/admin/css/common2.css<?php echo $this->version; ?>"/>
        <!-- FONTAWESOME -->
        <link
            rel="stylesheet"
            href="https://use.fontawesome.com/releases/v5.2.0/css/all.css">

        <link rel="stylesheet" href="GUGASMS/page/admin/css/jquery-ui.min.css">
        <script src="GUGASMS/page/admin/js/jquery/jquery-3.3.1.min.js"></script>

        <!-- sript시작 -->

        <script src="GUGASMS/page/admin/js/xlsx.full.min.js"></script>
        <script src="GUGASMS/page/admin/js/FileSaver.min.js"></script>
        <script src="GUGASMS/page/admin/js/lb.js<?php echo $this->version; ?>"></script>
        <script src="GUGASMS/page/admin/js/admin.js<?php echo $this->version;?>"></script>
        <script src="GUGASMS/page/admin/js/add_main.js<?php echo $this->version;?>"></script>
    </head>
    <body>
        <div class="wrap">
            <?php include_once $this->dir."page/admin/include/admin_sidebar.php"; ?>
            <div class="adm_container">
                <?php include_once $this->dir."page/admin/include/admin_header.php"; ?>
                <div class="adm_section_container_head pb-0">
                    <h2>입고등록</h2>
                </div>
                <div class="adm_main_container">
                    <section class="adm_section_container">
                        <div class="adm_section_container_body p-1">
                            <div class="btn-list-con align-right mb-1">
                                <p>검색 월
                                    <input type="date" id="start_date"></p>
                                <p>검색어
                                    <input type="text" id="search_product"></p>
                                <p>
                                    <button
                                        type="button"
                                        id="all_del_btn"
                                        onclick="all_del_receiver()"
                                        class="btn-sm btn-defalut">전체삭제</button>
                                </p>
                                <p>
                                    <button
                                        type="button"
                                        id="select_del_btn"
                                        onclick="select_del_receiver()"
                                        class="btn-sm btn-defalut">선택삭제</button>
                                </p>
                                <p>
                                    <button type="button" onclick="exportExcel();" class="btn-sm btn-primary">엑셀다운</button>
                                </p>
                                <p>
                                    <button type="button" onclick="open_add_modal();" class="btn-sm btn-secondary">자재추가</button>
                                </p>
                            </div>
                            <div class="adm_table_container">
                                <p class="adm_table_total" id="receiver_total">
                                    <i>Total</i>0</p>
                                <div class="adm_table_long_responsive">
                                    <table class="adm_table adm_fixed_table mb-1">
                                        <thead>
                                            <tr>
                                                <th class="check">
                                                    <label class="check_label m-auto" value="yes">
                                                        <input
                                                            type="checkbox"
                                                            id="all_check_receiver"
                                                            onchange="all_check('receiver', this);">
                                                        <span class="checkmark"></span>
                                                    </label>
                                                </th>
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
                                                <th class="number">수량</th>
                                                <th class="number">금액</th>
                                                <th class="number">도입일자</th>
                                                <th class="number">이미지</th>
                                            </tr>
                                        </thead>
                                        <tbody data-wrap="receiver_wrap" id="receiver_wrap">
                                            <!-- <tr> <td class="check"> <label class="check_label m-auto" value="yes">
                                            <input type="checkbox"> <span class="checkmark"></span> </label> </td>
                                            <td>홍길동</td> <td class="number">010-3021-1125</td> </tr> <tr> <td colspan = "3"
                                            class="align-center" height="185">내용이 없습니다.</td> </tr> -->
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
            <!-- 모달화면 -->
            <div class="modal admin_modal" id="addr_modal" style="display:none;">
                <div class="popup_wrap modal-xl">
                    <div class="adm_popup_container">
                        <h4>자재 추가</h4>
                        <section class="adm_section_container">
                            <div class="adm_modal_input_container">
                                <div class="modal_table">
                                    <div class="wi_board_form_row">
                                        <div class="wi_board_form_title">
                                            <label for="" class="wi_board_label_control">자재코드</label>
                                        </div>
                                        <div class="wi_board_form_content">
                                            <input
                                                type="text"
                                                id="product_code"
                                                class="wi_board_input_control"
                                                autocomplete="off">
                                        </div>
                                    </div>

                                    <div class="wi_board_form_row">
                                        <div class="wi_board_form_title">
                                            <label for="" class="wi_board_label_control">위치</label>
                                        </div>
                                        <div class="wi_board_form_content">
                                            <input
                                                type="text"
                                                id="product_position"
                                                class="wi_board_input_control"
                                                autocomplete="off">
                                        </div>
                                    </div>
                                    <div class="wi_board_form_row">
                                        <div class="wi_board_form_title">
                                            <label for="" class="wi_board_label_control">대분류</label>
                                        </div>
                                        <div class="wi_board_form_content">
                                            <input
                                                type="text"
                                                id="product_b_class"
                                                class="wi_board_input_control"
                                                autocomplete="off">
                                        </div>
                                    </div>
                                    <div class="wi_board_form_row">
                                        <div class="wi_board_form_title">
                                            <label for="" class="wi_board_label_control">소분류</label>
                                        </div>
                                        <div class="wi_board_form_content">
                                            <input
                                                type="text"
                                                id="product_s_class"
                                                class="wi_board_input_control"
                                                autocomplete="off">
                                        </div>
                                    </div>
                                    <div class="wi_board_form_row">
                                        <div class="wi_board_form_title">
                                            <label for="" class="wi_board_label_control">품명</label>
                                        </div>
                                        <div class="wi_board_form_content">
                                            <input
                                                type="text"
                                                id="product_name"
                                                class="wi_board_input_control"
                                                autocomplete="off">
                                        </div>
                                    </div>
                                    <div class="wi_board_form_row">
                                        <div class="wi_board_form_title">
                                            <label for="" class="wi_board_label_control">규격</label>
                                        </div>
                                        <div class="wi_board_form_content">
                                            <input
                                                type="text"
                                                id="product_stand"
                                                class="wi_board_input_control"
                                                autocomplete="off">
                                        </div>
                                    </div>
                                    <div class="wi_board_form_row">
                                        <div class="wi_board_form_title">
                                            <label for="" class="wi_board_label_control">제조사</label>
                                        </div>
                                        <div class="wi_board_form_content">
                                            <input
                                                type="text"
                                                id="product_maker"
                                                class="wi_board_input_control"
                                                autocomplete="off">
                                        </div>
                                    </div>
                                    <div class="wi_board_form_row">
                                        <div class="wi_board_form_title">
                                            <label for="" class="wi_board_label_control">거래처</label>
                                        </div>
                                        <div class="wi_board_form_content">
                                            <input
                                                type="text"
                                                id="product_custom"
                                                class="wi_board_input_control"
                                                autocomplete="off">
                                        </div>
                                    </div>
                                    <div class="wi_board_form_row">
                                        <div class="wi_board_form_title">
                                            <label for="" class="wi_board_label_control">단위</label>
                                        </div>
                                        <div class="wi_board_form_content">
                                            <input
                                                type="text"
                                                id="product_union"
                                                class="wi_board_input_control"
                                                autocomplete="off">
                                        </div>
                                    </div>
                                    <div class="wi_board_form_row">
                                        <div class="wi_board_form_title">
                                            <label for="" class="wi_board_label_control">단가</label>
                                        </div>
                                        <div class="wi_board_form_content">
                                            <input
                                                type="text"
                                                id="product_price"
                                                class="wi_board_input_control"
                                                autocomplete="off">
                                        </div>
                                    </div>
                                    <div class="wi_board_form_row">
                                        <div class="wi_board_form_title">
                                            <label for="" class="wi_board_label_control">수량</label>
                                        </div>
                                        <div class="wi_board_form_content">
                                            <input
                                                type="text"
                                                id="product_amount"
                                                class="wi_board_input_control"
                                                autocomplete="off">
                                        </div>
                                    </div>
                                    <div class="wi_board_form_row">
                                        <div class="wi_board_form_title">
                                            <label for="" class="wi_board_label_control">금액</label>
                                        </div>
                                        <div class="wi_board_form_content">
                                            <input
                                                type="text"
                                                id="product_sum"
                                                class="wi_board_input_control"
                                                autocomplete="off">
                                        </div>
                                    </div>
                                    <div class="wi_board_form_row">
                                        <div class="wi_board_form_title">
                                            <label for="" class="wi_board_label_control">도입일자</label>
                                        </div>
                                        <div class="wi_board_form_content">
                                            <input
                                                type="text"
                                                id="product_in_date"
                                                class="wi_board_input_control"
                                                autocomplete="off">
                                        </div>
                                    </div>
                                    <div class="wi_board_form_row">
                                        <div class="wi_board_form_title">
                                            <label for="" class="wi_board_label_control">이미지</label>
                                        </div>
                                        <div class="wi_board_form_content">
                                            <input
                                                type="text"
                                                id="product_image"
                                                class="wi_board_input_control"
                                                autocomplete="off">
                                        </div>
                                    </div>
                                </div>
                            </section>
                            <div class="adm_table_btn">
                                <ul>
                                    <li><input
                                        class="btn-sm btn-default"
                                        type="button"
                                        value="자재추가"
                                        id="btnClose"
                                        onclick="request_add_product();"/></li>
                                    <li><input
                                        class="btn-sm btn-default"
                                        type="button"
                                        value="닫기"
                                        id="btnClose"
                                        onclick="close_add_modal();"/></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <?php include_once $this->dir."page/admin/include/admin_footer.php"; ?>
    </body>

</html>