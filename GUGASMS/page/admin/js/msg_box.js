$(document).ready(function(){
    // request_product_list(user_idx);
});




var double_click = true;
var receiver_count = 0;
var recevier_index  = 0;

function request_product_list(target){
    target = group_idx;
    if(double_click){
        double_click = false;
        $('#receiver_wrap').empty();
        addr_click_flag = true;
        receiver_count = 0;
        var total_elem = document.getElementById('receiver_total');
        total_elem.innerHTML ="<i>Total</i>"+receiver_count;
        console.log(target);
        lb.ajax({
            type : "JsonAjaxPost",
            list : {
                ctl : "Addr",
                param1 : "product_list2",
                idx : target,
            },
            action : "index.php",
            havior : function(result){
                double_click = true;
                console.log(result);
                result = JSON.parse(result);
                if(result.result == 1){
                    if(result.value.length == 0){
                        alert('등록하신 자재가 없습니다.');
                    }else{
                        init_addr_list(result.value);
                    }
                }
            }
        })
    }else{
        alert("리스트 호출중입니다.");
    }
}

function init_addr_list(data){
    $('.loading').fadeIn();
    lb.auto_view({
        wrap : "receiver_wrap",
        copy : "receiver_copy",
        attr: '["data-attr"]',
        json: data,
        havior: function (elem, data, name, copy_elem) { 
            if (copy_elem.getAttribute('data-copy') == "receiver_copy") {
                copy_elem.setAttribute('data-copy', '');
                copy_elem.id = 0;
            }
			if(name == "check_box"){
                // elem.id = "receiver_check_"+recevier_index ;
                elem.classList.add('receiver_check');
                elem.value = data.incom_id;
        }
            else{
                if(typeof data[name] != undefined && typeof data[name] != "undefined" && data[name] != null && data[name] != "null"){
                    elem.innerHTML = data[name];
                }
                if(name == "mat_in_code"){
                    receiver_count++;
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
            $('.loading').fadeOut();
            var total_elem = document.getElementById('receiver_total');
            total_elem.innerHTML ="<i>Total</i>"+receiver_count;
        }
    })
}

function search(){

    var mat_code = document.getElementById('mat_in_code').value;
    // var department = document.getElementById('send_kind');
    var mat_in_amount = document.getElementById('mat_in_amount').value;
    var mat_in_name = document.getElementById('mat_in_name').value;
    var mat_in_stand = document.getElementById('mat_in_stand').value;
    if(typeof mat_code == undefined || typeof mat_code == null){
        mat_code = "";
    }
    console.log(mat_code, mat_in_amount, mat_in_name);
    search_list(mat_code, mat_in_amount, mat_in_name, mat_in_stand);
}

function search_list(mat_code, department, mat_in_name, mat_in_stand){
    var target = group_idx;
    if(double_click){
        double_click = false;
        $('#receiver_wrap').empty();
        addr_click_flag = true;
        receiver_count = 0;
        var total_elem = document.getElementById('receiver_total');
        total_elem.innerHTML ="<i>Total</i>"+receiver_count;
        // console.log(target);
        lb.ajax({
            type : "JsonAjaxPost",
            list : {
                ctl : "Addr",
                param1 : "product_list3",
                idx : target,
                mat_in_code : mat_code,
                mat_in_amount : department,
                mat_in_name : mat_in_name,
                mat_in_stand : mat_in_stand,
            },
            action : "index.php",
            havior : function(result){
                double_click = true;
                console.log(result);
                result = JSON.parse(result);
                if(result.result == 1){
                    if(result.value.length == 0){
                        alert('검색하신 자재가 없습니다.');
                    }else{
                        init_addr_list(result.value);
                    }
                }
            }
        })
    }else{
        alert("리스트 호출중입니다.");
    }
}


    
function init_search(){
    var mat_in_code = document.getElementById('mat_in_code');
    var mat_in_name = document.getElementById('mat_in_name');
    var mat_in_stand = document.getElementById('mat_in_stand');
    var mat_in_amount = document.getElementById('mat_in_amount');

    mat_in_code.value = "";
    mat_in_name.value = "";
    mat_in_stand.value = "";
    mat_in_amount.value = "";
    request_product_list(1);
}

function user_detail(data){
    var id = document.getElementById('id');
    var pw = document.getElementById('pw');
    var name = document.getElementById('user_name');
    var role =document.getElementById('role');
    var sms = document.getElementById('sms');

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
