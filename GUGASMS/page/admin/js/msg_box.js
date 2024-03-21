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
                mat_code : mat_code,
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

var contents = document.getElementsByClassName( "aaaa" );

document.addEventListener("DOMContentLoaded", function() {
    console.log(contents);


    // @breif rowColumn 클래스의 갯수 만큼 반복문을 실행한다.
    Array.from(contents).forEach(function(content) {
        console.log("hihi");

        // @breif 마우스로 해당영역을 더블클릭 한경우
        content.addEventListener("dblclick", function(event) {


            // @breif 전체 테이블 컬럼( td > p )에서 현재 사용중인 값의 존재여부를 확인한다.
            Array.from(contents).forEach(function(defaultVal) {


                /*
                // @details 빈값( null )이 존재하는지 체크한다.
                if(
                       defaultVal.textContent == ""
                    || defaultVal.textContent == null
                    || defaultVal.textContent == undefined
                    || (defaultVal.textContent != null
                    && typeof defaultVal.textContent == "object"
                    && !Object.keys(defaultVal.textContent).length == ""))
                {

                    // @details 내용이 존재하지 않다면 data 태그의 기본값으로 되돌린다.
                    defaultVal.textContent = defaultVal.dataset.default;
                }
                */

                // @details 저장하지 않은 내용이라고 판단하여 data 태그의 기본값으로 되돌린다.
                defaultVal.textContent = defaultVal.dataset.default;

                // @breif 수정 불가 상태로 되돌린다.
                defaultVal.contentEditable = false;
                defaultVal.style.border = "0px";
            });


            if(content.isContentEditable == false) {


                // @details 편집 가능 상태로 변경
                content.contentEditable = true;


                // @details 텍스트 문구 변경
                // content.textContent = "";


                // @details CSS 효과 추가
                content.style.border = "1px solid #FFB6C1";


                // @details 포커스 지정
                content.focus();
            }
        });


        // @breif 키보드 입력이 방생한 경우 실행
        content.addEventListener("keypress", function(event) {


            // @breif Enter키 입력시 실행
            if(event.key === "Enter") {


                // @details 입력된 값이 빈값( null )인지 체크한다.
                if(
                       content.textContent == ""
                    || content.textContent == null
                    || content.textContent == undefined
                    || (content.textContent != null
                    && typeof content.textContent == "object"
                    && !Object.keys(content.textContent).length == ""))
                {


                    // @details 내용이 존재하지 않다면 data 태그의 기본값으로 되돌린다.
                    content.textContent = content.dataset.default;
                } else {


                    // @details 내용의 수정이 완료되었다면 data 태그의 기본값도 바꿔준다.
                    content.dataset.default = content.textContent;
                }


                // @breif 수정 불가 상태로 되돌린다.
                content.contentEditable = false;
                content.style.border = "0px";
            }
        });
    });
});