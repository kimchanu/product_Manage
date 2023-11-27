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
						<a class="depth2-a" id ="msg_side" href="#" onclick = "side_bar(this); return false;">메시지보내기</a>
						<ul class="depth2-con" style ="display:none;">
							<li class="depth2"><a href="?ctl=Move&param1=msg_main">메시지전송</a></li>
							<li class="depth2"><a href="?ctl=Move&param1=msg_reserve">예약메시지</a></li>
							<li class="depth2 admin_none" ><a href="?ctl=Move&param1=msg_result">전송결과</a></li>
							<li class="depth2"><a href="?ctl=Move&param1=msg_box">메시지폼관리</a></li>
						</ul>
					</li>
					<li class="depth1" data-side="">
						<a class="depth2-a" id ="kakao_side" href="#" onclick = "side_bar(this); return false;">카카오톡보내기</a>
						<ul class="depth2-con" style ="display:none;">
							<li class="depth2"><a href="?ctl=Move&param1=kakao_main">알림톡전송</a></li>
<!-- 							<li class="depth2"><a href="?ctl=Move&param1=kakao_f_main">친구톡전송</a></li> -->
							<li class="depth2 admin_none"><a href="?ctl=Move&param1=kakao_result">전송결과</a></li>
							<li class="depth2 admin_none"><a href="?ctl=Move&param1=kakao_num_set">발신번호관리</a></li>
							<li class="depth2 admin_none"><a href="?ctl=Move&param1=kakao_pf_set">발신프로필관리</a></li>
							<li class="depth2 admin_none"><a href="?ctl=Move&param1=kakao_tpl_set">알림톡템플릿관리</a></li>
						</ul>
					</li>
					<li class="depth1"  data-side="">
						<a class="depth2-a" id ="addr_side" href="#" onclick = "side_bar(this); return false;">주소록</a>
						<ul class="depth2-con" style ="display:none;">
							<li class="depth2"><a href="?ctl=Move&param1=add_main">주소록</a></li>
							<li class="depth2 admin_none"><a href="?ctl=Move&param1=add_set">주소록그룹관리</a></li>
						</ul>
					</li>
					<li class="depth1"  <?php echo $this->side_bar();?> data-side="">
						<a class="depth2-a" id ="user_side" href="#" onclick = "side_bar(this); return false;">관리자</a>
						<ul class="depth2-con" style ="display:none;">
							<li class="depth2"><a href="?ctl=Move&param1=user_set">사용자관리</a></li>
							<li class="depth2"><a href="?ctl=Move&param1=state_day">일별통계</a></li>
							<li class="depth2"><a href="?ctl=Move&param1=state_month">월별통계</a></li>
						</ul>
					</li>
				</ul>
			</div>
		</div>
		<div>
			<h3 class="adm_logo c-white adm_logo_on"><a href="?">메시지 발송 시스템</a></h3>
			<div class="adm_utill" id ="logout_elem" style = "display:none;">
				
				<span class="header-user-info" id = "login_name"><em></em></span>
				<span class="header-user-info2">
					<span class="header-user-info2-con" id ="sms_elem"></span>
					<span class="header-user-info2-con" id ="lms_elem"></span>
					<span class="header-user-info2-con" id ="mms_elem"></span>
				</span>
				<span class="adm_logout logout_on" onclick="request_admin_logout()">로그아웃</span>
			</div><!-- 세션으로 관리한다. -->
		</div>
	</div>
</header>
<!-- adm_header끝 -->