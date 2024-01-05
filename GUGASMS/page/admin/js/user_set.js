$(document).ready(function(){
    user_list();
    mat_users();
    number_check(lb.getElem('send_number'));
    number_check(lb.getElem('sms'));
    number_check(lb.getElem('lms'));
    number_check(lb.getElem('mms'));
    number_check(lb.getElem('t_kakao'));
    number_check(lb.getElem('f_kakao'));
})

var double_click = true;
function signup(){
    if(double_click){
        double_click = false;
        var id = document.getElementById('id');
        var pw = document.getElementById('pw');
        var name = document.getElementById('user_name');
        var role = document.getElementById('role');
        var send_number = document.getElementById('send_number');
        var sms = document.getElementById('sms');
        var mms = document.getElementById('lms');
        var mms = document.getElementById('mms');
        var t_kakao = document.getElementById('t_kakao');
        var f_kakao = document.getElementById('f_kakao');
        var comment = document.getElementById('comment');

        if(id.value == ""){
            alert('사용자ID를 입력해주세요');
            double_click = true;
        }else if(pw.value == ""){
            alert('비밀번호를 입력해주세요');
            double_click = true;
        }else if(name.value == ""){
            alert('사용자명을 입력해주세요');
            double_click = true;
        }else if(role.value == "0"){
            alert('권한그룹을 입력해주세요');
            double_click = true;
        }else{
            lb.ajax({
                type : "JsonAjaxPost",
                list : {
                    ctl : "Admin",
                    param1 : "signup",
                    id : id.value,
                    pw : pw.value,
                    name : name.value,
                    role : role.value,
                    send_number : send_number.value,
                    sms : sms.value,
                    lms : lms.value,
                    mms : mms.value,
                    t_kakao : t_kakao.value,
                    f_kakao : f_kakao.value,
                    comment : comment.value,
                },
                action : "index.php",
                havior : function(result){
                    double_click = true;
                    console.log(result);
                    result = JSON.parse(result);
                    if(result.result == 1){
                        alert('사용자가 등록되었습니다.');
                        user_list();
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

function new_init(){
    var id = document.getElementById('id');
    var pw = document.getElementById('pw');
    var name = document.getElementById('user_name');
    var role =document.getElementById('role');
    var sms = document.getElementById('sms');
    var use_sms =document.getElementById('use_sms');
    var lms =document.getElementById('lms');
    var use_lms =document.getElementById('use_lms');
    var mms =document.getElementById('mms');
    var use_mms =document.getElementById('use_mms');
    var t_kakao =document.getElementById('t_kakao');
    var use_t_kakao =document.getElementById('use_t_kakao');
    var f_kakao =document.getElementById('f_kakao');
    var use_f_kakao =document.getElementById('use_f_kakao');
    var comment = document.getElementById('comment');
    var register_btn =document.getElementById('register_btn');
    var single_del_btn = document.getElementById('single_del');

    id.value = "";
    id.removeAttribute('readonly')
    pw.value ="";
    name.value = "";
    role.value = 0;
    sms.value = "";
    use_sms.value = "";
    lms.value ="";
    use_lms.value = "";
    mms.value ="";
    use_mms.value = "";
    t_kakao.value ="";
    use_t_kakao.value = "";
    f_kakao.value ="";
    use_f_kakao.value = "";
    comment.value = "";
    register_btn.onclick =function(){
        signup();
    }
    single_del_btn.onclick = function(){
        select_del();
    }
}

function nothing_elem(){
    var user_wrap = document.getElementById('user_wrap');
    var nothing_elem = "<tr id = 'nothing'>" +
                            "<td colspan = '14' class='align-center' height='321'>내용이 없습니다.</td>"+
                        "</tr>";
    user_wrap.innerHTML = nothing_elem;
}

function total_view(count){
    var total_elem =document.getElementById('total_elem');
    total_elem.innerHTML = "<i>Total</i>" + count;
}
 
function user_list(){
    $('.loading').fadeIn();
    $('#user_wrap').empty();
    lb.ajax({
        type : "JsonAjaxPost",
        list : {
            ctl : "Admin",
            param1 : "user_list",
            search_id : document.getElementById('search_id').value,
            search_name : document.getElementById('search_name').value,
            search_role : document.getElementById('search_role').value,
        },
        action : "index.php",
        havior : function(result){
            // console.log(result);
            result = JSON.parse(result);
            if(result.result == 1){
                if(result.value.length == 0){
                    nothing_elem();
                    $('.loading').fadeOut();
                    total_view(result.total);
                }else{
                    init_user(result.value);
                    total_view(result.total);
                }
            }
        }
    })
}

function mat_users(){
    $('#user_wrap2').empty();
    lb.ajax({
        type : "JsonAjaxPost",
        list : {
            ctl : "Admin",
            param1 : "mat_users",
            // search_id : document.getElementById('search_id').value,
            // search_name : document.getElementById('search_name').value,
            // search_role : document.getElementById('search_role').value,
        },
        action : "index.php",
        havior : function(result){
            // console.log(result);
            result = JSON.parse(result);
            console.log(result);
            if(result.result == 1){
                if(result.value.length == 0){
                    nothing_elem();
                    $('.loading').fadeOut();
                    // total_view(result.total);
                }else{
                    init_mat_users(result.value);
                    // total_view(result.total);
                }
            }
        }
    })
}

function init_user(data){
    lb.auto_view({
        wrap : "user_wrap",
        copy : "user_copy",
        attr: '["data-attr"]',
        json: data,
        havior: function (elem, data, name, copy_elem) { 
            if (copy_elem.getAttribute('data-copy') == "user_copy") {
                copy_elem.setAttribute('data-copy', '');
            }

            if(name == "check_box"){
                elem.value = data.idx;
                elem.setAttribute('class','user_check');
            }else if(name == "id"){
                elem.innerHTML = data.id;
            }else if(name == "role"){
                if(data.role == 1){
                    elem.innerHTML = "관리자";
                }else{
                    elem.innerHTML = "사용자";
                }
            }else{
                if(typeof data[name] != undefined && typeof data[name] != "undefined" && data[name] != null && data[name] != "null"){
                    elem.innerHTML = data[name];
                }
            }
            if(name != "check_box"){
                var single_del_elem = document.getElementById('single_del');
                elem.style.cursor = "pointer";
                elem.onclick = function(){
                    user_detail(data);
                    single_del_elem.onclick = function(){
                        select_del("single",data.idx);
                    }
                }
            }
        },
        end : function(){
            $(".loading").fadeOut();
            
        }
    })
}

function init_mat_users(data){
    lb.auto_view({
        wrap : "user_wrap2",
        copy : "user_copy2",
        attr: '["data-attr2"]',
        json: data,
        havior: function (elem, data, name, copy_elem) { 
            if (copy_elem.getAttribute('data-copy') == "user_copy2") {
                copy_elem.setAttribute('data-copy', '');
            }

            if(name == "check_box"){
                elem.value = data.idx;
                elem.setAttribute('class','user_check');
            }else if(name == "id"){
                elem.innerHTML = data.user_id;
            }else if(name == "name"){
                elem.innerHTML = data.user_name;
            }else{
                if(typeof data[name] != undefined && typeof data[name] != "undefined" && data[name] != null && data[name] != "null"){
                    console.log(data[name]);
                    elem.innerHTML = data[name];
                }
            }
            // if(name != "check_box"){
            //     var single_del_elem = document.getElementById('single_del');
            //     elem.style.cursor = "pointer";
            //     elem.onclick = function(){
            //         user_detail(data);
            //         single_del_elem.onclick = function(){
            //             select_del("single",data.idx);
            //         }
            //     }
            // }
        },
        end : function(){
            $(".loading").fadeOut();
            
        }
    })
}

function user_detail(data){
    var id = document.getElementById('id');
    var pw = document.getElementById('pw');
    var name = document.getElementById('user_name');
    var role =document.getElementById('role');
    var sms = document.getElementById('sms');
    var use_sms =document.getElementById('use_sms');
    var lms =document.getElementById('lms');
    var use_lms =document.getElementById('use_lms');
    var mms =document.getElementById('mms');
    var use_mms =document.getElementById('use_mms');
    var t_kakao =document.getElementById('t_kakao');
    var use_t_kakao =document.getElementById('use_t_kakao');
    var f_kakao =document.getElementById('f_kakao');
    var use_f_kakao =document.getElementById('use_f_kakao');
    var comment = document.getElementById('comment');
    var register_btn =document.getElementById('register_btn');
    var send_number = document.getElementById('send_number');

    // console.log(data.id);

    id.value = data.id;
    id.setAttribute('readonly', true);
    pw.value = data.pw;
    name.value = data.name;
    role.value = data.role;
    sms.value = data.sms;
    use_sms.value = data.use_sms;
    lms.value = data.lms;
    use_lms.value = data.use_lms;
    mms.value = data.mms;
    use_mms.value = data.use_mms;
    t_kakao.value = data.t_kakao;
    use_t_kakao.value = data.use_t_kakao;
    f_kakao.value = data.f_kakao;
    use_f_kakao.value = data.use_f_kakao;
    comment.value = data.comment;
    send_number.value = data.send_number;

    register_btn.onclick = function(){
        user_modify(data.idx);
    }
}


function user_modify(target){

    if(double_click){
        double_click = false;
        var pw = document.getElementById('pw');
        var name = document.getElementById('user_name');
        var role = document.getElementById('role');
        var send_number = document.getElementById('send_number');
        var sms = document.getElementById('sms');
        var mms = document.getElementById('mms');
        var lms = document.getElementById('lms');
        var t_kakao = document.getElementById('t_kakao');
        var f_kakao = document.getElementById('f_kakao');
        var comment = document.getElementById('comment');

        if(pw.value == ""){
            alert('비밀번호를 입력해주세요');
            double_click = true;
        }else if(name.value == ""){
            alert('사용자명을 입력해주세요');
            double_click = true;
        }else if(role.value == "0"){
            alert('권한그룹을 입력해주세요');
            double_click = true;
        }else{
            lb.ajax({
                type : "JsonAjaxPost",
                list : {
                    ctl : "Admin",
                    param1 : "user_modify",
                    target_idx : target,
                    pw : pw.value,
                    name : name.value,
                    role : role.value,
                    send_number : send_number.value,
                    sms : sms.value,
                    mms : mms.value,
                    lms : lms.value,
                    t_kakao : t_kakao.value,
                    f_kakao : f_kakao.value,
                    comment : comment.value,
                },
                action : "index.php",
                havior : function(result){
                    double_click = true;
                    console.log(result);
                    result = JSON.parse(result);
                    if(result.result == 1){
                        alert('사용자가 수정되었습니다.');
                        user_list();
                    }else{
                        alert('사용자 수정 실패');
                    }
                }
            })
        }
    }else{
        alert('사용자 등록중입니다.');
    }
}

function search(){
    var search_role = document.getElementById('search_role').value;
    var search_id = document.getElementById('search_id').value;
    var search_name = document.getElementById('search_name').value;

    if(search_role == 0 && search_id == "" && search_name == ""){
        alert('검색할 내용을 입력해주세요');
    }else{
        user_list();
    }

}

function search_init(){
    var search_role = document.getElementById('search_role');
    var search_id = document.getElementById('search_id');
    var search_name = document.getElementById('search_name');

    search_role.value = 0;
    search_id.value = "";
    search_name.value = "";

    user_list();
}

// 번호 체크
function number_check(elem){
    $(elem).on('propertychange change keyup paste input', function(){
        $(this).val($(this).val().replace(/[^0-9]/g,""));
    })
}

function all_check(elem){
    var check_elems = document.getElementsByClassName('user_check');
    for(var i=0; i<check_elems.length; i++){
        if(elem.checked == true){
            check_elems[i].checked = true;
        }else{
            check_elems[i].checked = false;
        }
    }
}

// 유저 선택 삭제
function select_del(type, value){
    if(double_click){
        
        var target = [];
        if(type == "list"){
            var check_elems = document.getElementsByClassName('user_check');
            for(var i = 0; i<check_elems.length; i++){
                if(check_elems[i].checked == true){
                    target.push(check_elems[i].value);
                }
            }
        }else{
            target.push(value);
        }

        console.log(target);
        if(target.length == 0 || (typeof target[0] == "undefind" ||  target[0] == null || target[0] =="null")){
            alert('삭제할 유저를 선택해주세요');
        }else{
            confirm_result = confirm("선택한 사용자를 삭제 하시겠습니까?");
            if(confirm_result){
                double_click = false;
                $('.loading').fadeIn();
                $('#user_wrap').empty();
                lb.ajax({
                    type : "JsonAjaxPost",
                    list : {
                        ctl : "Admin",
                        param1 : "select_del_user",
                        target_idx : JSON.stringify(target),
                    },
                    action : "index.php",
                    havior : function(result){
                        double_click = true;
                        console.log(result);
                        result = JSON.parse(result);
                        if(result.result == 1){
                            if(result.value.length == 0){
                                nothing_elem();
                                $('.loading').fadeOut();
                                total_view(result.total);
                            }else{
                                alert('유저를 삭제했습니다.');
                                init_user(result.value);
                                total_view(result.total);
                            }
                        }else{
                            $('.loading').fadeOut();
                        }
                    }
                })    
            }
        }
    }else{
        alert('사용자를 삭제중입니다.');
    }
}

// function all_del(){
//     if(double_click){
//         double_click = false;
//         lb.ajax({
//             type : "JsonAjaxPost",
//             list : {
//                 ctl : "Admin",
//                 param1 : ""
//             },
//             action : "index.php",
//             havior : function(result){
//                 console.log(result);
//                 result = JSON.parse(result);
//                 if(result.result == 1){

//                 }
//             }
//         })
//     }else{
//         alert('사용자를 삭제중입니다.');
//     }
// }