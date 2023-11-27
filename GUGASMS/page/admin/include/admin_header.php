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
		<div>
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