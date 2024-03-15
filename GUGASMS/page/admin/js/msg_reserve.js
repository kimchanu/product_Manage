$(document).ready(function(){
    request_product_list(user_idx);
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
        },
        end : function(){
            $('.loading').fadeOut();
            var total_elem = document.getElementById('receiver_total');
            total_elem.innerHTML ="<i>Total</i>"+receiver_count;
        }
    })
}

function search(target){
    if(typeof target != undefined && target != null && typeof target != "undefined" && target != "null"){
        if(addr_click_flag){
            var addr_name = document.getElementById('mat_in_code');
            var addr_phone_number = document.getElementById('send_kind');
            if(addr_name.value == "" && addr_phone_number.value == ""){
                alert('이름 또는 휴대전화를 입력해주세요');
            }else{
                request_addr_list(target);    
            }
        }else{
            alert('주소록을 선택해주세요');
        }
    }else{
        alert('주소록을 선택해주세요');
    }
}

function init_search(){
    var addr_name = document.getElementById('mat_in_code');
    var addr_phone_number = document.getElementById('send_kind');

    addr_name.value = "";
    addr_phone_number.value = "";
}
