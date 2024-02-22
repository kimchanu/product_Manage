<aside class="adm_aside">
    <div class="adm_aside_title adm_lang_en">
        <h3 class="logo">
            <a href="?"><img src="GUGASMS/page/admin/images/ci-gray.png" alt="" style="height:40px;"/></a>
        </h3>
    </div>
    <div id="cssmenu" class="side_main_menu">
        <ul class="depth1-con">
            <li class="depth1" data-side="">
                <a id="kakao_side" href="#" onclick="side_bar(this); return false;">자재찾기</a>
                <ul class="depth2-con" style="display:none;">
				<li class="depth2">
                    <a href="#" onclick="side_bar(this); return false;">관리동-2F</a>
                    <ul class="depth2-con" style="display:none;">
                        <li class="depth3">
                            <a href="?ctl=Move&param1=its">ITS</a>
                        </li>
                        <li class="depth3">
                            <a href="?ctl=Move&param1=manage_gk">관리</a>
                        </li>
                    </ul>
				</li>
				<li class="depth2">
                    <a href="#" onclick="side_bar(this); return false;">관리동-창고</a>
                    <ul class="depth2-con" style="display:none;">
                        <li class="depth3">
                            <a href="?ctl=Move&param1=civil">시설</a>
                        </li>
                        <li class="depth3">
                            <a href="?ctl=Move&param1=electric_engine">전기/기계</a>
                        </li>
                        <li class="depth3">
                            <a href="?ctl=Move&param1=its_outside">ITS</a>
                        </li>
                    </ul>
				</li>
				</ul>
       		</li>

			<li class="depth1" data-side="">
				<a id="msg_side" href="#" onclick="side_bar(this); return false;">내부관리(수불대장)</a>
				<ul class="depth2-con" style="display:none;">
					<li class="depth2">
						<a href="?ctl=Move&param1=input">자재등록</a>
					</li>
					<!-- <li class="depth2"><a href="?ctl=Move&param1=msg_main">자재등록</a></li> -->
					<li class="depth2">
						<a href="?ctl=Move&param1=input_list">자재현황</a>
					</li>
					<!-- <li class="depth2 admin_none"><a
					href="?ctl=Move&param1=msg_result">전송결과</a></li> -->
					<li class="depth2">
						<a href="?ctl=Move&param1=input_month">월 집계</a>
					</li>
					<!-- <li class="depth2"><a
					href="?ctl=Move&param1=product_register">메시지함관리</a></li> -->
					<!-- <li class="depth2"><a href="?ctl=Move&param1=msg_box_set">메시지함관리</a></li>
					-->
				</ul>
			</li>
			<li class="depth1" data-side="">
				<a id="kakao_side" href="#" onclick="side_bar(this); return false;">을지</a>
				<ul class="depth2-con" style="display:none;">
					<!-- <li class="depth2"><a href="?ctl=Move&param1=kakao_main">알림톡전송</a></li> -->
					<li side_bar();="side_bar();" class="depth2 admin_none">
						<a href="?ctl=Move&param1=output">자재출고등록</a>
					</li>
					<li side_bar();="side_bar();" class="depth2 admin_none">
						<a href="?ctl=Move&param1=output_list">자재출고현황</a>
					</li>
					<li side_bar();="side_bar();" class="depth2 admin_none">
						<a href="?ctl=Move&param1=output_month">월 집계</a>
					</li>
					<!-- <li class="depth2 admin_none"<a
					href="?ctl=Move&param1=kakao_tpl_set">알림톡템플릿관리</a></li> -->
				</ul>
			</li>
			<li class="depth1" data-side="">
				<a id="kakao_side" href="?ctl=Move&param1=finance">자재수불명세서대장(갑지)</a>
			</li>
			<li class="depth1" data-side="">
				<a id="kakao_side" href="?ctl=Move&param1=dashboard">월별집계 대시보드</a>
			</li>
			<li class="depth1" data-side="">
				<a id="kakao_side" href="http://msds.safeinfo.co.kr/" target='_blank'>MSDS(위험물질)</a>
			</li>
			<!-- <li class="depth1" <?php echo $this->side_bar();?> data-side=""> <a id
			="addr_side" href="#" onclick = "side_bar(this); return false;">주소록</a> <ul
			class="depth2-con" style ="display:none;"> <li class="depth2"><a
			href="?ctl=Move&param1=add_main">주소록</a></li> <li class="depth2 admin_none"><a
			href="?ctl=Move&param1=add_set">주소록그룹관리</a></li> </ul> </li> -->
			<li side_bar();="side_bar();" class="depth1" data-side="" <?php echo $this->side_bar();?>>
				<a
					class="depth2-a"
					id="user_side"
					href="#"
					onclick="side_bar(this); return false;" <?php echo $this->side_bar();?>>관리자</a>
				<ul class="depth2-con" style="display:none;">
					<li class="depth2">
						<a href="?ctl=Move&param1=user_set" <?php echo $this->side_bar();?>>사용자관리</a>
					</li>
					<!-- <li class="depth2">
						<a href="?ctl=Move&param1=state_day">일별통계</a>
					</li>
					<li class="depth2">
						<a href="?ctl=Move&param1=state_month">월별통계</a>
					</li> -->
				</ul>
			</li>
		</ul>
	</div>
</aside>
	<!-- adm_aside끝 -->