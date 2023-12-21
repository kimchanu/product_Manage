// // admin 아코디언 메뉴
// (function($){
// $(document).ready(function(){
//     $('#cssmenu li.depth1>a').on('click', function(){
//         $(this).removeAttr('href');
//         var element = $(this).parent('li');
//         if (element.hasClass('open')) {
//             element.removeClass('open');
//             element.find('.depth2').removeClass('open');
//             element.find('.depth1-con').slideUp(200);
//         }
//         else {
//             element.addClass('open');
//             element.children('ul').slideDown(200);
//             element.siblings('li').children('ul').slideUp(200);
//             element.siblings('li').removeClass('open');
//             element.siblings('li').find('li').removeClass('open');
//             element.siblings('li').find('ul').slideUp(200);
//         };
//     });
// })(jQuery);

// admin 메뉴 반응형 

$(document).ready(function(){
    $('#adm_menu_bar').click(function() {
		$(".adm_aside").toggleClass("on");
		$(".adm_header").toggleClass("on");
		$(".adm_container").toggleClass("on");
		$(".adm_menu_bar").toggleClass("on");
        $(".adm_logo").toggleClass("adm_logo_on");	
        $(".adm_logout").toggleClass("logout_on");	
		$(".adm_aside_overlay").toggleClass("adm_aside_overlay_show");		
    });

    $(".depth1").on('mouseleave',function(){
        var hide_elem = document.getElementsByClassName('depth2-con');
        for(var i= 0; i<hide_elem.length; i++){
            $(hide_elem[i]).slideUp();
        }
    });

    if(typeof param1 != "undefined" && typeof param1 != undefined && param1 != null && param1 != "null"){
        if(param1 == "msg_main" || param1 == "msg_reserve" || param1 == "msg_result" ||param1 == "msg_box"||param1 == "msg_box_set"){
            side_bar(lb.getElem('msg_side'));
        }else if(param1 == "kakao_main" || param1 == "kakao_result" || param1 == "kakao_num_set" ||param1 == "kakao_pf_set"||param1 == "kakao_tpl_set"){
            side_bar(lb.getElem('kakao_side'));
        }else if(param1 == "add_main" || param1 == "add_set"){
            side_bar(lb.getElem('addr_side'));
        }
    }
    if(typeof user_idx != "undefined" && typeof user_idx != undefined && user_idx != null && user_idx != "null"){
        if(user_idx != 0){
            var login_header_menu = document.getElementById('login_header_menu');
            login_header_menu.style.display = "block";
            var logout_elem = document.getElementById('logout_elem');
            logout_elem.style.display = "block";
        }
    }
    s_user_detail();
})

var double_click = true;
function login(){
    if(double_click){
        double_click = false;
        lb.ajax({
            type: "JsonAjaxPost",
            list: {
                ctl: "Admin",
                param1: "login",
                id : document.getElementById('id').value,
                pw : document.getElementById('pw').value,
            },
            action: "index.php",
            havior: function (result) {
                // console.log(result);
                result = JSON.parse(result);
                double_click = true;
                if(result["result"]==1){
                    location.href = "?ctl=Move&param1=main";
                }else{
                    alert('계정정보가 잘못되었습니다.');
                }
            }
        });
    } 
}

function open_add_modal(){
    var addr_modal = document.getElementById('addr_modal');
    addr_modal.style.display = "block";
}

function close_add_modal(){
    var addr_modal = document.getElementById('addr_modal');
    addr_modal.style.display = "none";
}

function signup(){
    if(double_click){
        double_click = false;
        var depart = document.getElementById('type');
        var id = $('input[name=reg_id]');
        var pw = $('input[name=reg_pw]');
        var name = $('input[name=reg_name]');
        var grade = $('input[name=reg_grade]');
        var phone_number = $('input[name=reg_number]');

        if(id.val() == ""){
            alert('사용자ID를 입력해주세요');
            double_click = true;
        }else if(pw.val() == ""){
            alert('비밀번호를 입력해주세요');
            double_click = true;
        }else if(name.val() == ""){
            alert('사용자명을 입력해주세요');
            double_click = true;
        }else{
            lb.ajax({
                type : "JsonAjaxPost",
                list : {
                    ctl : "Admin",
                    param1 : "sign_up2",
                    depart : depart.value,
                    id : id.val(),
                    pw : pw.val(),
                    name : name.val(),
                    grade : grade.val(),
                    phone_number : phone_number.val(),
                },
                action : "index.php",
                havior : function(result){
                    double_click = true;
                    console.log(result);
                    result = JSON.parse(result);
                    if(result.result == 1){
                        alert('사용자가 등록되었습니다.');
                    }else{
                        if(result.error_code == "533"){
                            alert(result.message);
                        }else{
                            alert('사용자 등록 실패');
                        }
                    }
                }
            })
        }
    }else{
        alert('사용자 등록중입니다.');
    }
}


function Enter_Check() {
    if (event.keyCode == 13) {
        login();
    }
}

function request_admin_logout() {//로그인 관리자하고 로그아웃하러 와야함
    lb.ajax({
        type: "JsonAjaxPost",
        list: {
            ctl: "Admin",
            param1: "logout",
        },
        action: "index.php",
        havior: function (result) {
            lb.log(result);
            result = JSON.parse(result);
            if (result.result == 1) {
                alert('로그아웃 되었습니다.');
                location.href = "?ctl=Move&param1=adm_login";
            } else {
                alert("로그인이 되어있지않습니다.");
            }
        }
    });
}



function side_bar(elem){
    // $(elem.parentNode.children[1]).css('display','none');
    var target = elem.parentNode.children[1]
    var parent = elem.parentNode.parentNode.children;
    $(target).slideToggle();
    for(var i = 0; i<parent.length; i++){
        if(parent[i].children[1] != target){
            $(parent[i].children[1]).slideUp();        
        }
    }
}


function s_user_detail(){
    lb.ajax({
        type : "JsonAjaxPost",
        list : {
            ctl : "Admin",
            param1 : "admin_detail",
            target : user_idx,
        },
        action : "index.php",
        havior : function(result){
            result = JSON.parse(result);
            if(result.result == 1){
                s_init_user_detail(result.value[0]);
            }
        }
    })
}

function s_init_user_detail(data){
    
    var login_name = document.getElementById('login_name');
    var sms_elem = document.getElementById('sms_elem');
    var lms_elem = document.getElementById('lms_elem');
    var mms_elem = document.getElementById('mms_elem');
    if(typeof data.name != "undefined" && typeof data.name != undefined && data.name != null && data.name != "null"){
        login_name.innerHTML = '<em>로그인: </em>'+data.name;
    }else{
        login_name.innerHTML = '<em>로그인: </em>님';
    }
    if(typeof data.sms != "undefined" && typeof data.sms != undefined && data.sms != null && data.sms != "null"){
        sms_elem.innerHTML = "<em>SMS: </em>"+data.use_sms+" / "+data.sms;
        lms_elem.innerHTML = "<em>LMS: </em>"+data.use_lms+" / "+data.lms;
        mms_elem.innerHTML = "<em>MMS: </em>"+data.use_mms+" / "+data.mms;
    }
    if(typeof param1 != "undefined" && typeof param1 != undefined && param1 != null && param1 != "null"){
        if(param1 != "user_set"){
            var send_number = document.getElementById('send_number');
            if(typeof send_number != undefined && typeof send_number != "undefined" && send_number != null && send_number != "null"){
                send_number.value = data.send_number;
                if(data.role == 3 || data.role == 1){
                    send_number.removeAttribute('readonly');
                }
            }
        }
    }
    
    
}