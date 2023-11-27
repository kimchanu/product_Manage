var double_click = true;
var check_list = [];
$(document).ready(function(){
    page_init();
})

function page_init(){
    lb.ajax({
        type : "JsonAjaxPost",
        list : {
            ctl : "Callback",
            param1 : "select_profile",
        },
        action : "index.php",
        havior : function(result){
            // console.log(result);
            result = JSON.parse(result);
            if(result.result == 1){
                init_board(result.value);
                init_call_num(); // 프로필 등록에 대표발신번호 list 생성
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
            }
            if(name == "callback_num"){
                elem.innerHTML = phoneFormatter(data[name]);
            }else if(name == "check"){
                elem.id = data["idx"];
                elem.classList.add('data-check');
            }else{
                elem.innerHTML = data[name];
            }
        }
    });
}

// 프로필 등록에 대표발신번호 list 생성
function init_call_num(){
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
                var select_callback = document.querySelector('#callback_num');
                for(var i = 0; i < result.value.length; i++){
                    var option = document.createElement('option');
                    option.id = result.value[i].idx;
                    option.value = result.value[i].callback_num;
                    option.textContent = result.value[i].callback_num;
                    select_callback.appendChild(option);
                }
            }
        }
    });
}

//발신번호를 등록하는 함수
function register_profile(){
    if(double_click){
        double_click = false;
        var rec_id = document.querySelector('#rec_id');
        var rec_profile_name = document.querySelector('#rec_profile_name');
        var profile_key = document.querySelector('#profile_key');
        var callback_num = document.querySelector('#callback_num');
        if(rec_id.value == ""){
            alert("옐로아아디를 입력해주세요");
            rec_id.focus();
            double_click = true;
        }else if(rec_profile_name.value == ""){
            alert("발신프로필명을 입력해주세요");
            rec_profile_name.focus();
            double_click = true;
        }else if(profile_key.value == ""){
            profile_key.focus();
            alert("발신프로필키를 입력해주세요");
            double_click = true;
        }else if(callback_num.value == 0){
            alert("대표발신번호를 선택해주세요");
            double_click = true;
        }else{
            var idx = callback_num.options[callback_num.selectedIndex].id;
            lb.ajax({
                type: "JsonAjaxPost",
                list: {
                    ctl: "Callback",
                    param1: "register_profile",
                    yellow_id: rec_id.value,
                    profile_name: rec_profile_name.value,
                    profile_key: profile_key.value,
                    callback_num: callback_num.value,
                    idx: idx,
                },
                action: "index.php",
                havior: function (result) {
                    // console.log(result);
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
function delete_profile(){
    if(double_click){
        double_click = false;
        if(check_list.length == 0){
            double_click = true;
        }else if(!confirm('발신프로필을 삭제하시면 관련 알림톡 템플릿도 함께 삭제됩니다. 삭제하시겠습니까?')){
            double_click = true;
        }
        else{
            lb.ajax({
                type: "JsonAjaxPost",
                list: {
                    ctl: "Callback",
                    param1: "delete_profile",
                    idx: JSON.stringify(check_list),
                },
                action: "index.php",
                havior: function (result) {
                    // console.log(result);
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
function search_profile(){
    if(double_click){
        double_click = false;
        var search_id = document.querySelector('#search_id');
        var search_profile_name = document.querySelector('#search_profile_name');
        if(search_id.value == "" && search_profile_name.value == ""){
            double_click = true;
        }else{
            lb.ajax({
                type: "JsonAjaxPost",
                list: {
                    ctl: "Callback",
                    param1: "search_profile",
                    yellow_id: search_id.value,
                    profile_name: search_profile_name.value,
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
    rec_id.value = "";
    rec_profile_name.value = "";
    profile_key.value = "";
    callback_num.value = 0;
    rec_id.focus();
}

//검색창의 발신번호 value를 초기화 시키고 발신번호 리스트도 초기화
function search_reset(){
    search_id.value = "";
    search_profile_name.value = "";
    search_id.focus();
    $('#notice_wrap').empty();
    page_init();
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
    return [year, month, date].join("-");
}

//게시글을 클릭하면 해당 게시글의 id 값을 check_list 배열에 넣음
//이미 클릭된 게시글을 클릭하면 해당 게시글의 id 값을 배열에서 삭제
function check(check){
    if(check.checked==true){
        check_list.push(check.id);
    }else{
        for(var i= 0 ; i < check_list.length; i++){
            if(check_list[i]==check.id){
                check_list.splice(i, 1);
                i = i - 1;
            }
        }
    }
}

//현재 페이지의 모든 게시글의 idx를 obj.value.check_list 배열에 담아줌
function checkAll(object){
    var checkList = document.querySelectorAll('.data-check');
    if(object.checked == true){ //전체 클릭을 선택
        check_list=[];
        for(var i = 0; i < checkList.length; i++){
            check_list.push(checkList[i].id);
            checkList[i].checked = true;
        }
            
    }else{ //전체 클릭을 해제
        for(var i = 0; i < checkList.length; i++){
            checkList[i].checked = false;
        }
        check_list=[];
    }
}

function enter_Check() {
    if (event.keyCode == 13) {
        search_profile();
    }
}