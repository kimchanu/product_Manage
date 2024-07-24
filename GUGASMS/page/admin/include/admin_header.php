<script>
	var param1 = "<?php echo $param1?>";
	var user_idx ="<?php echo $user_idx?>";
	var user_role ="<?php echo $user_role?>";
</script>
<header class="adm_header on">
	<div class="adm_header_container">
		<!-- <div style="padding-top: 15px; float:left;" id = "adm_menu_bar">
			<svg width="25" height="30"> 
				<path d="M0,5 25,5" stroke="#fff" stroke-width="2"></path>
				<path d="M0,13 25,13" stroke="#fff" stroke-width="2"></path>
				<path d="M0,21 25,21" stroke="#fff" stroke-width="2"></path>
			</svg>
		</div> -->
		<!-- hamburger // -->
		<div class="header_left" id = "login_header_menu" style = "display:none;">
			<div class="header-menu">
			<ul class="depth1-con clearfix">
					<li class="depth1" data-side="">
						<a class="depth2-a" id ="kakao_side" href="#" onclick = "side_bar(this); return false;">자재찾기</a>
						<ul class="depth2-con" style ="display:none;">

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
						<a href="?ctl=Move&param1=input">입고(엑셀)</a>
					</li>
					<!-- <li class="depth2"><a href="?ctl=Move&param1=msg_main">자재등록</a></li> -->
					<li class="depth2">
						<a href="?ctl=Move&param1=input_list">입고현황</a>
					</li>

					<li class="depth2">
						<a href="?ctl=Move&param1=input_month">입고집계</a>
					</li>

				</ul>
			</li>
			<li class="depth1" data-side="">
				<a id="kakao_side" href="#" onclick="side_bar(this); return false;">을지</a>
				<ul class="depth2-con" style="display:none;">
					<!-- <li class="depth2"><a href="?ctl=Move&param1=kakao_main">알림톡전송</a></li> -->
					<li side_bar();="side_bar();" class="depth2 admin_none">
						<a href="?ctl=Move&param1=output">출고</a>
					</li>
					<li side_bar();="side_bar();" class="depth2 admin_none">
						<a href="?ctl=Move&param1=output_list">출고현황</a>
					</li>
					<li side_bar();="side_bar();" class="depth2 admin_none">
						<a href="?ctl=Move&param1=output_month">출고집계</a>
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
				</ul>
			</li>
	
				</ul>
			</div>
		</div>
		<div>
			<div class="adm_utill" id ="logout_elem" style = "display:none;">
				
				<span class="header-user-info" id = "login_name"><em></em></span>
				<span class="header-user-info2">
					<span class="header-user-info2-con" id ="sms_elem"></span>
					</span>
					<!-- <span class="header-user-info2-con" id ="lms_elem"></span>
					<span class="header-user-info2-con" id ="mms_elem"></span> -->
				</span>
				<span class="adm_logout logout_on" onclick="request_admin_logout()">로그아웃</span>
			</div><!-- 세션으로 관리한다. -->
		</div>
	</div>
</header>
<!-- adm_header끝 -->