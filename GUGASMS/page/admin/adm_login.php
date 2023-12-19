<!doctype html>
<html lang="kr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>로그인 | 한국인프라</title>

        <!-- FONT -->
        <link
            href="https://fonts.googleapis.com/css?family=Gothic+A1:100,200,300,400,500,700,800,900&display=swap"
            rel="stylesheet">
        <link
            rel="stylesheet"
            type="text/css"
            href="GUGASMS/page/admin/css/adm_sub.css<?php echo $this->version; ?>"/>
        <link
            rel="stylesheet"
            type="text/css"
            href="GUGASMS/page/admin/css/reset.css<?php echo $this->version;?>"/>
        <link
            rel="stylesheet"
            type="text/css"
            href="GUGASMS/page/admin/css/common.css<?php echo $this->version;?>"/>
        <link
            rel="stylesheet"
            type="text/css"
            href="GUGASMS/page/admin/css/admin.modal.css<?php echo $this->version;?>"/>
        <link
            rel="stylesheet"
            type="text/css"
            href="GUGASMS/page/admin/css/admin.css<?php echo $this->version;?>"/>
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

        <!-- sript시작 -->
        <script src="GUGASMS/page/admin/js/jquery/jquery-3.3.1.min.js"></script>
        <script src="GUGASMS/page/admin/js/lb.js<?php echo $this->version;?>"></script>
        <script src="GUGASMS/page/admin/js/admin.js<?php echo $this->version;?>"></script>
        <!-- script끝 -->
    </head>
    <body>
        <div class="wrap">
            <?php include_once $this->dir."page/admin/include/admin_sidebar.php"; ?>
            <div class="adm_container">
                <?php include_once $this->dir."page/admin/include/admin_header.php"; ?>
                <div
                    class="adm_main_container d-flex align-items-center justify-content-center">
                    <section class="adm_section_container">
                        <div class="pt-2 align-center"><img src="GUGASMS/page/admin/images/ci-origin.png" alt="" style="height:48px;"/></div>
                        <div class="adm_section_container_head">
                            <h2>로그인</h2>
                        </div>
                        <div class="adm_section_container_body p-1">
                            <div class="login_container">
                                <div class="input_control"><input type="text" id="id" placeholder="아이디입력" onkeydown="Enter_Check()"></div>
                                <div class="input_control"><input type="password" id="pw" placeholder="비밀번호입력" onkeydown="Enter_Check()"></div>
                                <div class="btn_control">
                                    <button
                                        type="button"
                                        class="btn-primary"
                                        onclick="login()"
                                        style="bottom-margin : 10px;">로그인</button>
                                </div>
                                <div class="btn_control">
                                    <button type="button" class="btn-primary" onclick="open_add_modal()">회원가입</button>
                                </div>
                                <div></div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 모달화면 -->
            <div class="modal admin_modal" id="addr_modal" style="display:none;">
                <div class="popup_wrap modal-xl">
                    <div class="adm_popup_container">
                        <h4>회원가입</h4>
                        <section class="adm_section_container">
                            <div class="adm_modal_input_container">
                                <div class="modal_table">
                                    <table width="100%" border="0" cellpadding="0" cellspacing="0">
                                        <colgroup>
                                            <col width="20%">
                                            <col width="80%">
                                        </colgroup>
                                        <tbody>
                                            <tr>
                                                <th><!-- 아이디 -->아이디</th>
                                                <td><input
                                                    type="text"
                                                    name="reg_id"
                                                    class="form-control"
                                                    value=""
                                                    maxlength="11"></td>
                                            </tr>
                                            <tr>
                                                <th><!-- 비밀번호 -->비밀번호
                                                </th>
                                               <td><input
                                                    type="password"
                                                    name="reg_password"
                                                    class="form-control"
                                                    value=""
                                                    maxlength="11"></td>
                                            </tr>
                                            <tr>
                                                <th><!-- 회원명 -->회원명</th>
                                                <td><input
                                                    type="text"
                                                    name="reg_name"
                                                    class="form-control"
                                                    value=""
                                                    maxlength="11"></td>
                                            </tr>
                                            <tr>
                                                <th><!-- 직책 -->직책</th>
                                                <td><input
                                                    type="text"
                                                    name="reg_grade"
                                                    class="form-control"
                                                    value=""
                                                    maxlength="11"></td>
                                            </tr>
                                            <tr>
                                                <th><!-- 휴대폰번호 -->휴대폰번호
                                                </th>
                                                <td><input
                                                    type="text"
                                                    name="reg_number"
                                                    class="form-control"
                                                    maxlength="11"></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                        <div class="adm_table_btn">
                            <ul>
                                <li><input
                                    class="btn-sm btn-default"
                                    type="button"
                                    value="회원가입"
                                    id="btnClose"
                                    onclick="sign_up();"/></li>
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
            <?php include_once $this->dir."page/admin/include/admin_footer.php"; ?>
        </div>
    </body>
</html>