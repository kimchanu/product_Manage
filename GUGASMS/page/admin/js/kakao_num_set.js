var double_click = true;
$(document).ready(function(){
    page_init();
})

function page_init(){
    lb.ajax({
        type : "JsonAjaxPost",
        list : {
            ctl : "Callback",
            param1 : "select_number",
        },
        action : "index.php",
        havior : function(result){
            // console.log(result);
            result = JSON.parse(result);
            if(result.result == 1){
                init_board(result.value);
            }
        }
    });
}

function init_board(data){
    if(data.length == 0){
        notice_wrap.appendChild(none_notice);
        none_notice.style.display = "";
    }
    //총 게시굴 개수 표시
    lb.auto_view({
        wrap : "notice_wrap",
        copy : "notice_copy",
        attr : '["data-attr"]',
        json : data,
        havior : function(elem, data, name, copy_elem){
            if (copy_elem.getAttribute('data-copy') == "notice_copy") {
                copy_elem.setAttribute('data-copy', '');
                copy_elem.style.cursor = "pointer";
                copy_elem.id = data["idx"];
                copy_elem.setAttribute('onclick', 'check_num(this);');
            }
            if(name == "callback_num"){
                elem.innerHTML = phoneFormatter(data[name]);
            }else if(name == "regdate"){
                elem.innerHTML = dateFormat(data[name]);
            }
        }
    });
}

//발신번호를 등록하는 함수
function register_number(){
    if(double_click){
        double_click = false;
        var reg_call_num = document.querySelector('#reg_call_num').value;
        if(reg_call_num == ""){
            alert("발신번호를 입력해주세요");
            double_click = true;
        }else{
            lb.ajax({
                type: "JsonAjaxPost",
                list: {
                    ctl: "Callback",
                    param1: "register_number",
                    reg_call_num: reg_call_num,
                },
                action: "index.php",
                havior: function (result) {
                    console.log(result);
                    double_click = true;
                    result = JSON.parse(result);
                    if(result.result==1){
                        location.reload();
                    }else{
                        alert("관리자에게 문의해주세요");
                    }
                }
            });
        }
    }
}

//발신번호를 삭제하는 함수
function delete_number(){
    if(double_click){
        double_click = false;
        if(document.querySelector('.check_num') == null){
            alert("삭제할 발신번호를 체크해주세요");
            double_click = true;
        }else if(!confirm('발신번호를 삭제하시면 관련 발신프로필, 알림톡 템플릿도 함께 삭제됩니다. 삭제하시겠습니까?')){
            double_click = true;
        }else{
            lb.ajax({
                type: "JsonAjaxPost",
                list: {
                    ctl: "Callback",
                    param1: "delete_number",
                    idx: check_id,
                },
                action: "index.php",
                havior: function (result) {
                    //console.log(result);
                    double_click = true;
                    result = JSON.parse(result);
                    if(result.result==1){
                        location.reload();
                    }else{
                        alert("관리자에게 문의해주세요");
                    }
                }
            });
        }
    }
}

//발신번호 리스트에서 발신번호를 검색하는 함수
function search_number(){
    if(double_click){
        double_click = false;
        var search_call_num = document.querySelector('#search_call_num').value;
        if(search_call_num == ""){
            alert("검색할 번호를 입력해주세요");
            double_click = true;
        }else{
            lb.ajax({
                type: "JsonAjaxPost",
                list: {
                    ctl: "Callback",
                    param1: "search_number",
                    search_call_num: search_call_num,
                },
                action: "index.php",
                havior: function (result) {
                    // console.log(result);
                    double_click = true;
                    result = JSON.parse(result);
                    if(result.result==1){
                        none_notice = document.querySelector('#none_notice').cloneNode(true);
                        $('#notice_wrap').empty();
                        setTimeout(function(){
                            init_board(result.value);
                        },100);
                    }else{
                        alert("관리자에게 문의해주세요");
                    }
                }
            });
        }
    }
}

//신규작성 클릭시 발신번호 입력칸 초기화
function reg_reset(){
    reg_call_num.value = "";
    reg_call_num.focus();
}

//검색창의 발신번호 value를 초기화 시키고 발신번호 리스트도 초기화
function search_reset(){
    search_call_num.value = "";
    search_call_num.focus();
    $('#notice_wrap').empty();
    page_init();
}

var check_id = null;
//발신번호 리스트에서 발신번호 클릭시 발생
function check_num(elem){
    var tr = document.querySelectorAll('.check_num');
    for(var i = 0; i < tr.length; i++){
        tr[i].style.backgroundColor = "white";
        tr[i].style.color = "black";
        tr[i].classList.remove('check_num');
    }
    elem.style.backgroundColor = "gray";
    elem.style.color = "white";
    elem.classList.add('check_num');
    check_id = elem.id;
}

//휴대폰 번호 사이에 -를 붙혀주는 함수
function phoneFormatter(num) {
    var formatNum = '';
    if (num.length == 11) {
        formatNum = num.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    } else if (num.length == 8) {
          formatNum = num.replace(/(\d{4})(\d{4})/, '$1-$2');
    } else {
        if (num.indexOf('02') == 0) {
            formatNum = num.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
        } else {
            formatNum = num.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
        }
    }
    return formatNum;
 }
 
//2020-11-23 형식으로 날짜를 format 해주는 함수
function dateFormat(date){
    var regdate = new Date(date);
    console.log(regdate);
    var year = regdate.getFullYear(); //년
    var month = regdate.getMonth() + 1; //월
    var date = regdate.getDate(); //일
    //월 or 일이 10보다 작으면 0 붙혀주기
    if(month < 10){
        month = "0" + month;
    }
    if(date < 10){ 
        date = "0" + date;
    }
    return year + "-" + month + "-" + date;
}

function enter_Check() {
    if (event.keyCode == 13) {
        search_number();
    }
}