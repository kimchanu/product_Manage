
<aside class="adm_aside">
	<div class="adm_aside_title adm_lang_en">
		<h3 class="logo"><a href="?"><img src="GUGASMS/page/admin/images/ci-gray.png" alt="" style="height:40px;"/></a></h3>
	</div>
	<div id="cssmenu" class="side_main_menu">
		<ul class="depth1-con">
			<li class="depth1" data-side="">
				<a id ="msg_side" href="#" onclick = "side_bar(this); return false;">입고현황</a>
				<ul class="depth2-con" style ="display:none;">
					<li class="depth2"><a href="?ctl=Move&param1=msg_main">자재등록</a></li>
					<li class="depth2"><a href="?ctl=Move&param1=msg_reserve">자재현황</a></li>
					<li class="depth2 admin_none" <?php echo $this->side_bar();?>><a href="?ctl=Move&param1=msg_result">전송결과</a></li>
					<li class="depth2"><a href="?ctl=Move&param1=msg_box">메시지폼관리</a></li>
					<!-- <li class="depth2"><a href="?ctl=Move&param1=msg_box_set">메시지함관리</a></li> -->
				</ul>
			</li>
			<li class="depth1" data-side="">
				<a id ="kakao_side" href="#" onclick = "side_bar(this); return false;">카카오톡보내기</a>
				<ul class="depth2-con" style ="display:none;">
					<li class="depth2"><a href="?ctl=Move&param1=kakao_main">알림톡전송</a></li>
					<li class="depth2 admin_none" <?php echo $this->side_bar();?>><a href="?ctl=Move&param1=kakao_result">전송결과</a></li>
					<li class="depth2 admin_none" <?php echo $this->side_bar();?>><a href="?ctl=Move&param1=kakao_num_set">발신번호관리</a></li>
					<li class="depth2 admin_none" <?php echo $this->side_bar();?>><a href="?ctl=Move&param1=kakao_pf_set">발신프로필관리</a></li>
					<li class="depth2 admin_none" <?php echo $this->side_bar();?>><a href="?ctl=Move&param1=kakao_tpl_set">알림톡템플릿관리</a></li>
				</ul>
			</li>
			<li class="depth1"  <?php echo $this->side_bar();?> data-side="">
				<a id ="addr_side" href="#" onclick = "side_bar(this); return false;">주소록</a>
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
</aside>
<!-- adm_aside끝 --> 