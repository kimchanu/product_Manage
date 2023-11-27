var double_click = true;
var check_list = [];
$(document).ready(function(){
    init_yellow_id(); //발신프로필 select option 생성
    page_init();

    //템플릿 내용 입력에서 글자수 1000자 제한
    var MAX_TEXT_LENGTH = 1000;
    $('#content').keyup(function(){
        var text_length = $(this).val().length;
        if(text_length <= MAX_TEXT_LENGTH){
            $('#text_length').text(text_length);
        }
    });
})

function page_init(){
    lb.ajax({
        type : "JsonAjaxPost",
        list : {
            ctl : "Callback",
            param1 : "select_template",
        },
        action : "index.php",
        havior : function(result){
            console.log(result);
            result = JSON.parse(result);
            if(result.result == 1){
                init_board(result.value);
                $(".loading").fadeOut();
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
            if(name == "check"){
                elem.id = data["idx"];
                elem.classList.add('data-check');
            }else if(name == "regdate"){
                elem.innerHTML = dateFormat(data[name]);
            }else{
                elem.innerHTML = data[name];
            }
        }
    });
}

// 프로필 등록에 대표발신번호 list 생성
function init_yellow_id(){
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
                var reg_yellow_id = document.querySelector('#reg_yellow_id');
                for(var i = 0; i < result.value.length; i++){
                    var option = document.createElement('option');
                    option.id = result.value[i].idx;
                    option.value = result.value[i].yellow_id;
                    option.textContent = result.value[i].yellow_id;
                    reg_yellow_id.appendChild(option);
                }
            }
        }
    });
}

//발신번호를 등록하는 함수
function check_template(type){
    if(double_click){
        double_click = false;
        var yellow_id = document.querySelector('#reg_yellow_id');
        var tpl_name = document.querySelector('#reg_tpl_name');
        var tpl_key = document.querySelector('#tpl_key');
        var btn_type = document.querySelector('#btn_type');
        var btn_name = document.querySelector('#btn_name');
        var btn_url1 = document.querySelector('#btn_url1');
        var btn_url2 = document.querySelector('#btn_url2');
        var btn_type2 = document.querySelector('#btn_type2');
        var btn_2_name = document.querySelector('#btn_2_name');
        var btn_2_url1 = document.querySelector('#btn_2_url1');
        var btn_2_url2 = document.querySelector('#btn_2_url2');
        if(tpl_name.value == ""){
            alert("템플릿명을 입력해주세요");
            tpl_name.focus();
            double_click = true;
        }else if(tpl_key.value == ""){
            alert("템플릿코드를 입력해주세요");
            tpl_key.focus();
            double_click = true;
        }else if(yellow_id.value == 0){
            alert("발신프로필을 선택해주세요");
            double_click = true;
        }else if(btn_type.value != 0 || btn_type2.value != 0){ //버튼 타입1 or 버튼 타입2를 선택한 경우
            double_click = true;
            //
            if(btn_type.value != 0){
                if(btn_name.value == ""){ //버튼명도 둘다 필수 입력 값
                    alert("버튼명을 입력해주세요");
                    btn_name.focus();
                    double_click = true;
                    return;
                }else if(btn_url1.value == ""){ //URL1은 웹, 앱링크 둘다 필수 입력 값
                    alert("버튼 URL1을 입력해주세요");
                    btn_url1.focus();
                    double_click = true;
                    return;
                }else if(btn_url2.value == "" && btn_type.value == 2){ //버튼 타입이 앱링크면 URL2 필수 입력
                    alert("버튼 URL2를 입력해주세요");
                    btn_url2.focus();
                    double_click = true;
                    return;
                }
            }
            
            //
            if(btn_type2.value != 0){
                if(btn_2_name.value == ""){ //버튼명도 둘다 필수 입력 값
                    alert("버튼명을 입력해주세요");
                    btn_2_name.focus();
                    double_click = true;
                    return;
                }else if(btn_2_url1.value == ""){ //URL1은 웹, 앱링크 둘다 필수 입력 값
                    alert("버튼 URL1을 입력해주세요");
                    btn_2_url1.focus();
                    double_click = true;
                    return;
                }else if(btn_2_url2.value == "" && btn_type2.value == 2){ //버튼 타입이 앱링크면 URL2 필수 입력
                    alert("버튼 URL2를 입력해주세요");
                    btn_2_url2.focus();
                    double_click = true;
                    return;
                }
            }
            if(type == 1){
                register_template();
            }else{
                modify_template();
            }
        }else{
            if(type == 1){
                register_template();
            }else{
                modify_template();
            }
        }
    }else{
        alert("글 등록중입니다");
    }
}

function register_template(){
    var tpl_name = document.querySelector('#reg_tpl_name');
    var tpl_key = document.querySelector('#tpl_key');
    var btn_type = document.querySelector('#btn_type');
    var btn_name = document.querySelector('#btn_name');
    var btn_url1 = document.querySelector('#btn_url1');
    var btn_url2 = document.querySelector('#btn_url2');
    var btn_type2 = document.querySelector('#btn_type2');
    var btn_2_name = document.querySelector('#btn_2_name');
    var btn_2_url1 = document.querySelector('#btn_2_url1');
    var btn_2_url2 = document.querySelector('#btn_2_url2');
    var content = document.querySelector('#content');
    double_click = true;
    var idx = reg_yellow_id.options[reg_yellow_id.selectedIndex].id; //옐로 아이디 idx
    lb.ajax({
        type: "JsonAjaxPost",
        list: {
            ctl: "Callback",
            param1: "register_template",
            tpl_name: tpl_name.value,
            tpl_key: tpl_key.value,
            btn_type: btn_type.value,
            btn_name: btn_name.value,
            btn_url1: btn_url1.value,
            btn_url2: btn_url2.value,
            btn_type2: btn_type2.value,
            btn_2_name: btn_2_name.value,
            btn_2_url1: btn_2_url1.value,
            btn_2_url2: btn_2_url2.value,
            content: content.value,
            idx: idx,
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

function modify_template(){
    var tpl_name = document.querySelector('#reg_tpl_name');
    var tpl_key = document.querySelector('#tpl_key');
    var btn_type = document.querySelector('#btn_type');
    var btn_name = document.querySelector('#btn_name');
    var btn_url1 = document.querySelector('#btn_url1');
    var btn_url2 = document.querySelector('#btn_url2');
    var btn_type2 = document.querySelector('#btn_type2');
    var btn_2_name = document.querySelector('#btn_2_name');
    var btn_2_url1 = document.querySelector('#btn_2_url1');
    var btn_2_url2 = document.querySelector('#btn_2_url2');
    var content = document.querySelector('#content');
    double_click = true;
    var pf_idx = reg_yellow_id.options[reg_yellow_id.selectedIndex].id; //옐로 아이디 idx
    lb.ajax({
        type: "JsonAjaxPost",
        list: {
            ctl: "Callback",
            param1: "modify_template",
            tpl_name: tpl_name.value,
            tpl_key: tpl_key.value,
            btn_type: btn_type.value,
            btn_name: btn_name.value,
            btn_url1: btn_url1.value,
            btn_url2: btn_url2.value,
            btn_type2: btn_type2.value,
            btn_2_name: btn_2_name.value,
            btn_2_url1: btn_2_url1.value,
            btn_2_url2: btn_2_url2.value,
            content: content.value,
            pf_idx: pf_idx,
            tpl_idx: check_id,
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

//선택한 템플릿을 삭제시켜주는 함수
function delete_template(){
    if(double_click){
        double_click = false;
        if(document.querySelector('.check_num') == null){
            alert("삭제할 템플릿을 선택해주세요");
            double_click = true;
        }else if(!confirm('알림톡 템플릿을 삭제하시겠습니까?')){
            double_click = true;
        }else{
            lb.ajax({
                type: "JsonAjaxPost",
                list: {
                    ctl: "Callback",
                    param1: "delete_template",
                    idx: check_id,
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

//버튼 타입 변경에 따라 버튼 URL display 변경
function btn_display(elem, type){
    if(type == 1){
        if(elem.value == 0){
            document.querySelector('#btn_div').style.display = "none";
            document.querySelector('#btn_name').value = "";
            document.querySelector('#btn_url1').value = "";
            document.querySelector('#btn_url2').value = "";
        }else{
            document.querySelector('#btn_div').style.display = "block";
        }
    }else{
        if(elem.value == 0){
            document.querySelector('#btn_div2').style.display = "none";
            document.querySelector('#btn_2_name').value = "";
            document.querySelector('#btn_2_url1').value = "";
            document.querySelector('#btn_2_url2').value = "";
        }else{
            document.querySelector('#btn_div2').style.display = "block";
        }
    }
    
}

function search_template(){
    if(double_click){
        double_click = false;
        var yellow_id = document.querySelector('#search_yellow_id');
        var tpl_name = document.querySelector('#search_tpl_name');
        if(yellow_id.value == "" && tpl_name.value == ""){
            double_click = true;
        }else{
            $(".loading").fadeIn();
            lb.ajax({
                type: "JsonAjaxPost",
                list: {
                    ctl: "Callback",
                    param1: "search_template",
                    yellow_id: yellow_id.value,
                    tpl_name: tpl_name.value,
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
                            $(".loading").fadeOut();
                        },100);
                    }else{
                        alert("관리자에게 문의해주세요");
                    }
                }
            });
        }
    }
    
}


//kakao_tpl_set page에서 신규 btn을 누르면 작성중인 input을 초기화 시켜줌
function value_reset(){
    document.querySelector('#reg_tpl_name').value = ""; //템플릿 명
    document.querySelector('#tpl_key').value = ""; //템플릿 코드
    document.querySelector('#reg_yellow_id').value = 0; //옐로 아이디
    document.querySelector('#btn_type').value = 0; //버튼타입1
    document.querySelector('#btn_type2').value = 0; //버튼타입2
    document.querySelector('#btn_div').style.display = "none"; //버튼타입1의 URL 입력 div
    document.querySelector('#btn_div2').style.display = "none"; //버튼타입2의 URL 입력 div
    document.querySelector('#btn_name').value = ""; //버튼타입1의 버튼명
    document.querySelector('#btn_url1').value = ""; //버튼타입1의 url1
    document.querySelector('#btn_url2').value = ""; //버튼타입1의 url2
    document.querySelector('#btn_2_name').value = ""; //버튼타입2의 버튼명
    document.querySelector('#btn_2_url1').value = ""; //버튼타입2의 url1
    document.querySelector('#btn_2_url2').value = ""; //버튼타입2의 url2
    document.querySelector('#content').value = ""; //템플릿 내용
    document.querySelector('#register_template_btn').innerHTML = "등록";
    document.querySelector('#register_template_btn').setAttribute('onclick', 'check_template(1)');
    var tr = document.querySelectorAll('.check_num');
    for(var i = 0; i < tr.length; i++){
        tr[i].style.backgroundColor = "white";
        tr[i].classList.remove('check_num');
    }
}

//kakao_tplset page 검색 div에서 초기화 btn을 누르면 검색 정보 초기화
function search_reset(){
    value_reset();
    $(".loading").fadeIn();
    document.querySelector('#search_yellow_id').value = "";
    document.querySelector('#search_tpl_name').value = "";
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

function enter_Check() {
    if (event.keyCode == 13) {
        search_template();
    }
}

var check_id = null;
//템플릿 리스트에서 발신번호 클릭시 발생
function check_num(elem){
    var tr = document.querySelectorAll('.check_num');
    for(var i = 0; i < tr.length; i++){
        tr[i].style.backgroundColor = "white";
        tr[i].classList.remove('check_num');
    }
    elem.style.backgroundColor = "#e5e5e5";
    elem.classList.add('check_num');
    check_id = elem.id;

    $('#text_length').text(0);
    $(".loading").fadeIn();
    lb.ajax({
        type: "JsonAjaxPost",
        list: {
            ctl: "Callback",
            param1: "request_tpl_info",
            idx: elem.id,
        },
        action: "index.php",
        havior: function (result) {
            // console.log(result);
            double_click = true;
            result = JSON.parse(result);
            console.log(result);
            if(result.result==1){
                document.querySelector('#reg_tpl_name').value = result.value[0].tpl_name;
                document.querySelector('#tpl_key').value = result.value[0].tpl_key;
                document.querySelector('#reg_yellow_id').value = result.value[0].yellow_id;
                //버튼타입1
                document.querySelector('#btn_type').value = result.value[0].btn_type;
                if(result.value[0].btn_type != 0){
                    document.querySelector('#btn_div').style.display = "block"; 
                }
                document.querySelector('#btn_name').value = result.value[0].btn_name;
                document.querySelector('#btn_url1').value = result.value[0].btn_url1;
                document.querySelector('#btn_url2').value = result.value[0].btn_url2;
                //버튼타입2
                document.querySelector('#btn_type2').value = result.value[0].btn_type2;
                if(result.value[0].btn_type2 != 0){
                    document.querySelector('#btn_div2').style.display = "block";
                }
                document.querySelector('#btn_2_name').value = result.value[0].btn_2_name;
                document.querySelector('#btn_2_url1').value = result.value[0].btn_2_url1;
                document.querySelector('#btn_2_url2').value = result.value[0].btn_2_url2;

                document.querySelector('#content').value = result.value[0].content;
                if(result.value[0].content != null){
                    $('#text_length').text(result.value[0].content.length); //content 길이 표시
                }
                document.querySelector('#register_template_btn').innerHTML = "수정";
                document.querySelector('#register_template_btn').setAttribute('onclick', 'check_template(2)');
                $(".loading").fadeOut();
            }else{
                alert("관리자에게 문의해주세요");
            }
        }
    });
}