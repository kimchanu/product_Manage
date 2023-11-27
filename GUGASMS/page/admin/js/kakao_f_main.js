$(document).ready(function(){
    
    $('#reserve_date').datepicker({
        dateFormat : "yy-mm-dd",
    });
    
    var options = { 
        // now: "12:35", //hh:mm 24 hour format only, defaults to current time 
        twentyFour: true, //Display 24 hour format, defaults to false
        upArrow: 'wickedpicker__controls__control-up', //The up arrow class selector to use, for custom CSS 
        downArrow: 'wickedpicker__controls__control-down', //The down arrow class selector to use, for custom CSS 
        close: 'wickedpicker__close', //The close class selector to use, for custom CSS 
        hoverState: 'hover-state', //The hover state class to use, for custom CSS 
        title: '예약시간', //The Wickedpicker's title, 
        showSeconds: false, //Whether or not to show seconds, 
        secondsInterval: 1, //Change interval for seconds, defaults to 1 , 
        minutesInterval: 1, //Change interval for minutes, defaults to 1 
        beforeShow: null, //A function to be called before the Wickedpicker is shown 
        show: null, //A function to be called when the Wickedpicker is shown 
        clearable: false, //Make the picker's input clearable (has clickable "x") 
    };
    var timepicker = $('#reserve_time').wickedpicker(options);
    
    $('#reserve_time').on('click', function(){
        timepicker.wickedpicker('open');
    })
    
    $(".adm_main_container").scroll(function(){
        $('#reserve_date').datepicker("hide");
        $('#reserve_time').wickedpicker("hide");
    })
    
    $('#reserve_date').on('change',function(){
        var date = new Date();    
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();

        if(month < 10){
            month = "0"+month;
        }
        if(day < 10){
            day = "0" + day;
        }
        var curDate = year+"-"+month+"-"+day;
        if(this.value < curDate){
            this.value = "";
            alert('해당 날짜를 선택할 수 없습니다.');
        }
    })

    // // 미리 저장했던 수신자를 불러옴
    // if(session_receiver != 0){
    //     var confirm_result = confirm("수신자가 "+ session_receiver.length + "명 저장되어있습니다 삭제하시겠습니까?");
    //     if(confirm_result){
    //         session_receiver_remove();
    //     }else{
    //         init_receiver(session_receiver);
    //     }
    // }

    // 수신번호  숫자만 입력
    number_check(lb.getElem('recept_number'));

    init_check_box();
    input_file_check(lb.getElem('add_img_1'),["jpg","jpeg"],"img");
    input_file_check(lb.getElem('excel_upload'),["xlsx"],"excel");
    template_input_elem();

    // 실패시 문자로 대체
    show_replace_elem();
    //주소록, 메시지그룹 탭
    tab_display();
    //주소록 리스트
    addr_group_list();
    //메시지 그룹
    request_msg_box_list();

    // 발신프로필 호출
    request_send_profile_list()

})


var file_elem_arr = ["add_img_1", "excel_upload"];


// mms_state 가 1이면 이미지 입력
var mms_state = 0;
var byte = 0;
var excel_value;

// 1: sms 3:mms(lms)
var send_flag = 1;

//예약 구분(0 : 즉시 , 1 : 예약)
var reserve_flag = 0;

//메시지를 보낼 수신번호목록
var cur_receiver_list = [];

//세션에 저장된 수신번호와 수신자이름 목록
var session_receiver_list = [];


// 체크박스 초기값 설정 즉시. 예약.
function init_check_box(){
    var direct_box = document.getElementById('direct_box');
    var reserve_box = document.getElementById('reserve_box');
    var reserve_elem =document.getElementById('reserve_elem');

    direct_box.checked = true;
    direct_box.parentNode.onclick = function(){
        reserve_flag = 0;
        if(direct_box.checked == false){
            direct_box.checked = true;
            reserve_box.checked = false;
            reserve_elem.style.display = "none";
        }
    }
    reserve_box.parentNode.onclick = function(){
        reserve_flag = 1;
        if(reserve_box.checked == false){
            reserve_box.checked = true;
            direct_box.checked = false;
            reserve_elem.style.display = "block";
        }
    }
}

function show_replace_elem(){
    var replace_checkbox = document.getElementById('replace_checkbox');
    var replace_elem = document.getElementById("replace_elem");

    $(replace_checkbox).on("change",function(){
        if(this.checked == true){
            replace_elem.style.display = "block";
        }else{
            replace_elem.style.display = "none";
        }
    })
}


//주소록 불러오기
function addr_group_list(){
    $('#address_wrap').empty();
    lb.ajax({
        type : "JsonAjaxPost",
        list : {
            ctl : "Addr",
            param1 : "addr_group_list",
        },
        action : "index.php",
        havior : function(result){
            double_click = true;
            // console.log(result);
            result = JSON.parse(result);
            if(result.result == 1){
                init_addr(result.value);
            }
        }
    })
}

function init_addr(data){
    // console.log(data);
    lb.auto_view({
        wrap : "address_wrap",
        copy : "address_copy",
        attr: '["data-attr"]',
        json: data,
        havior: function (elem, data, name, copy_elem) { 
            if (copy_elem.getAttribute('data-copy') == "address_copy") {
                copy_elem.setAttribute('data-copy', '');
            }
            if(name == "name"){
                elem.innerHTML = data.group_name;
                elem.parentNode.style.cursor = "pointer";
                elem.parentNode.onclick = function(){
                    open_addr_modal(data.idx, data.group_name);
                }
            }else if(name == "check_box"){
                elem.setAttribute('class','addr_check_box');
                elem.value = data.idx;
            }
            // else if(name == "content"){
            //     if(typeof data.content !="undefined" && typeof data.content != undefined && data.content != null && data.content != "null"){
            //         elem.innerHTML = data.content;
            //     }
            // }
        }
    })
}


function open_addr_modal(target, name){
    var addr_modal = document.getElementById('addr_modal');
    addr_modal.style.display = "block";
    modal_addr_list(target);
    var addr_search_btn = document.getElementById('addr_search_btn');
    var addr_search_word = document.getElementById('addr_search_word');
    var addr_group_title = document.getElementById('addr_group_title');
    addr_group_title.innerHTML = name;
    addr_search_btn.onclick = function(){
        if(addr_search_word.value != ""){
            modal_addr_list(target);    
        }else{
            alert('검색어를 입력해주세요');
        }
    }
    
}

function modal_addr_list(target){
    $('#addr_list_wrap').empty();
    var addr_group_idx_list =[];
    addr_group_idx_list.push(target);
    if(double_click){
        double_click = false;
        var addr_search_word = document.getElementById('addr_search_word');
        lb.ajax({
            type : "JsonAjaxPost",
            list : {
                ctl : "Addr",
                param1 : "receiver_addr_list",
                group_idx : JSON.stringify(addr_group_idx_list),
                search_name : addr_search_word.value,
            },
            action : "index.php",
            havior : function(result){
                double_click = true;
                // console.log(result);
                result = JSON.parse(result);
                if(result.result == 1){
                    init_addr_list(result.value);
                }
            }
        })
    }
}

function init_addr_list(data){
    lb.auto_view({
        wrap : "addr_list_wrap",
        copy : "addr_list_copy",
        attr: '["data-attr"]',
        json: data,
        havior: function (elem, data, name, copy_elem) { 
            if (copy_elem.getAttribute('data-copy') == "addr_list_copy") {
                copy_elem.setAttribute('data-copy', '');
            }
            if(name == "check_box"){
                elem.setAttribute('class','addr_list_check_box');
                elem.value = JSON.stringify(data);
            }else if(name == "name"){
                elem.innerHTML = data.name;
            }
        },
        end : function(){
            var move_addr_list_btn = document.getElementById('move_addr_list_btn');
            var addr_list_elem = document.getElementsByClassName('addr_list_check_box');
            console.log(addr_list_elem);
            var addr_list = [];
            move_addr_list_btn.onclick = function(){
                for(var i= 0;i<addr_list_elem.length; i++){
                    if(addr_list_elem[i].checked == true){
                        var value = JSON.parse(addr_list_elem[i].value);
                        addr_list.push(value);
                    }
                }
                console.log(addr_list);
                init_receiver(addr_list);
            }
        }
    })
}

function all_addr_list_check(elem){
    var addr_list_check_box = document.getElementsByClassName('addr_list_check_box');
    for(var i = 0; i<addr_list_check_box.length; i++){
        if(elem.checked == true){
            addr_list_check_box[i].checked = true;
        }else{
            addr_list_check_box[i].checked = false;
        }
    }
}

function close_addr_modal(){
    var addr_modal = document.getElementById('addr_modal');
    addr_modal.style.display = "none";
    var addr_search_word = document.getElementById('addr_search_word');
    addr_search_word.value = "";
    var addr_group_title = document.getElementById('addr_group_title');
    addr_group_title.innerHTML = "";
    var addr_search_btn = document.getElementById('addr_search_btn');
    addr_search_btn.onclick = function(){

    }
    var all_addr_list_check_elem = document.getElementById('all_addr_list_check_elem');
    all_addr_list_check_elem.checked = false;
}


// //시간 초기값 설정
// function init_time_box(elem){
//     var replaceTime = elem.value.replace(/\:/g, "");
//     if(replaceTime.length >= 4 && replaceTime.length < 5){
//         var hours = replaceTime.substring(0,2);
//         var minute = replaceTime.substring(2,4);

//         //isFinite 함수를 사용하여 문자가 선언되었는지 확인한다.
//         if(isFinite(hours + minute) == false){
//             alert('문자는 입력하실수 없습니다.');
//             elem.value = "00:00";
//             return false;
//         }
//         if(hours + minute > 2400){
//             alert('시간은 24시를 넘길 수 없습니다.');
//             elem.value = "24:00";
//             return false;
//         }
//         if(minute > 60){
//             alert('분은 60분을 넘길 수 없습니다.');
//             elem.value = hours + ":00";
//             return false;
//         }
//         elem.value = hours + ":" + minute;
//     }
// }



//파일 업로드 체크(type = "img", type = "excel")
function input_file_check(elem, ext_array, type){
    var file_cancel = elem.parentNode.children[0];
    var file_name_elem = elem.parentNode.children[1];
    //바이트 수
    var msg_text = document.getElementById("msg_text");
    var standard = elem.id.split('_');
    var standard_number = standard[standard.length -1];
    var img_elem = document.getElementById('inner_img_'+standard_number);

    $(elem).change(function(e){
        var file_value = $(elem).val().split("\\");
        var file_name = file_value[file_value.length -1];
        file_name_elem.value ="파일선택";
        if(!file_cancel.classList.contains('d-none')){
            file_cancel.classList.add('d-none');
        }

        
        if($(this).val() != ""){
            var ext =  $(this).val().split(".").pop().toLowerCase();
            // 매개변수로 받을 값
            if($.inArray(ext, ext_array) == -1){
                if(ext_array[0] == "jpg"){
                    alert('jpg, jpeg 파일만 업로드 해주세요');
                }else if(ext_array[0] == "xlsx"){
                    alert('xlsx 파일만 업로드 해주세요');
                    excel_value = "";
                }
                $(this).val("");
                file_name_elem.value ="파일선택";
                return;
            }
            
            if(type == "img"){
                var fileSize = this.files[0].size;
                //매개변수로 받을 값
                var maxSize = 500*1024;
                if(fileSize > maxSize){
                    alert('파일용량 500KB를 초과했습니다.');
                    $(this).val("");
                    file_name_elem.value ="파일선택";
                    return;
                }
                $(img_elem).attr('src', "");
                img_elem.parentNode.classList.add('d-none');

               
                var file = this.files[0];
                var _URL = window.URL || window.webkitURL;
                var img = new Image();
                img.src = _URL.createObjectURL(file);
                img.onload = function(){
                    var ratio = img.height*1/img.width*1;
                    if(img.width < 500){
                        alert('이미지 크기 제한 : 가로 500px 미만 또는 가로 * 세로 비율이 1:1.5 초과시 업로드가 불가능합니다.');
                        $(elem).val("");
                        file_name_elem.value ="파일선택";
                        mms_state = 0;
                        byteCheckViewDisplay_v2(msg_text);
                        $(img_elem).attr('src', "");
                        img_elem.classList.add('d-none');
                        return;
                    }else if(ratio > 1.5){
                        alert('이미지 크기 제한 : 가로 500px 미만 또는 가로 * 세로 비율이 1:1.5 초과시 업로드가 불가능합니다.');
                        $(elem).val("");
                        file_name_elem.value ="파일선택";
                        mms_state = 0;
                        byteCheckViewDisplay_v2(msg_text);
                        $(img_elem).attr('src', "");
                        img_elem.classList.add('d-none');
                    }else{
                        var reader = new FileReader();
                        if(img_elem.parentNode.classList.contains('d-none')){
                            img_elem.parentNode.classList.remove("d-none");
                            reader.onload = function(e){
                                mms_state = 1;
                                byteCheckViewDisplay_v2(msg_text);
                                $(img_elem).attr('src', e.target.result);
                                
                            }
                            reader.readAsDataURL(elem.files[0]);
                        }
                        //설정값 입력
                        if(file_cancel.classList.contains('d-none')){
                            file_cancel.classList.remove('d-none');
                        }
                        file_name_elem.value = file_name;
                    }
                }
            }else{
                excel_code(this);
                file_name_elem.value = file_name;
                if(file_cancel.classList.contains('d-none')){
                    file_cancel.classList.remove('d-none');
                }
            }
            
        }
        var d_none_count = 0;
        for(var i =1; i<=1; i++){
            var all_img_elems = document.getElementById('inner_img_'+i);
            if(all_img_elems.parentNode.classList.contains('d-none')){
                d_none_count++;
            }
        }
        if(d_none_count == 1){
            mms_state = 0;
            byteCheckViewDisplay_v2(msg_text);
        }
    });
}


function file_cancel(elem, type){
    var init_file_view = elem.parentNode.children[1];
    var init_file_elem = elem.parentNode.children[3];

    if(type == "img"){
        var standard = init_file_elem.id.split('_');
        var standard_number = standard[standard.length -1];
        var img_elem = document.getElementById('inner_img_'+standard_number);
        img_elem.parentNode.classList.add('d-none');
        var d_none_count = 0;
        var msg_text = document.getElementById("msg_text");
        for(var i =1; i<=1; i++){
            var all_img_elems = document.getElementById('inner_img_'+i);
            if(all_img_elems.parentNode.classList.contains('d-none')){
                d_none_count++;
            }
        }
        if(d_none_count == 1){
            mms_state = 0;
            byteCheckViewDisplay_v2(msg_text);
        }
    }
    elem.classList.add('d-none');
    $(init_file_view).val("파일선택");
    $(init_file_elem).val("");
    
}

// 엑셀 파일 읽어서 변수에 저장
function excel_code(elem){
    var input = elem;
    var reader = new FileReader();
    reader.onload = function(){
        var file_data =reader.result;
        var wb = XLSX.read(file_data, {type : 'binary'});
        wb.SheetNames.forEach(function(sheetName, index){
            if(index == 0){
                var rowObj = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);
                excel_value = rowObj;
            }
        })
    }
    reader.readAsBinaryString(input.files[0]);
}

// 엑셀 업로드
function excel_upload(){
    if(typeof excel_value != "undefined" && excel_value != null){
        var regExp =  /^\d{3}-\d{3,4}-\d{4}$/;
        var correct = true;
        for(var i in excel_value){
            if(typeof excel_value[i].name == "undefined" || excel_value[i].name == null){
                alert('이름이 비어있는 행이 있습니다.');
                correct = false;
                break;
            }
            if(typeof excel_value[i].phone_number == "undefined"|| excel_value[i].phone_number == null){
                alert('번호가 비어있는 행이 있습니다');
                correct = false;
                break;
            }else{
                if(!regExp.test(excel_value[i].phone_number)){
                    alert('잘못된 유형의 번호가 있는 행이 있습니다');
                    correct = false;
                    break;
                }
            }
        }
        if(correct == true){
            init_receiver(excel_value);
        }
    }else{
        alert('업로드할 파일을 첨부해주세요');
    }
}

//수신자 붙여넣기
var receiver_count = 0;
var recevier_index = 0;

function receiver_paste_add(){
    var paste_receiver = document.getElementById('paste_receiver');
    var value = paste_receiver.value;
    var regExp =  /^\d{3}-\d{3,4}-\d{4}$/;
    var value_arr = value.split("\n");
    var arr = [];
    for(var i= 0; i<value_arr.length; i++){
        if(value_arr[i].trim() != ""){
            var inner_arr = value_arr[i].split('\t');
            for(var j = 0; j<inner_arr.length; j++){
                if(inner_arr[j].trim() == ""){
                    if(j == 0){
                        alert('이름이 비어있는 행이 있습니다');
                    }else{
                        alert('번호가 비어있는 행이 있습니다');
                    }
                    return;
                }else if(!regExp.test(inner_arr[1])){
                    if(!regExp.test(inner_arr[j])){
                        alert('잘못된 유형의 번호가 있는 행이 있습니다');
                        return;
                    }
                }
            }
            var obj = {};
            obj.name= inner_arr[0];
            obj.phone_number = inner_arr[1];
            arr.push(obj);
        }
    }
    init_receiver(arr);
}

//수신자 목록
function init_receiver(data){
    $('.loading').fadeIn();

    var add_receiver_list = [];
    var nothing = document.getElementById('receiver_nothing');
    if(data.length > 0){
        if(nothing.style.display == "table-row"){
            nothing.style.display = "none";
        }
    }

    var dup_flag = 0;
    if(cur_receiver_list.length != 0){
        for(var i = 0; i<data.length; i++){
            var phone = data[i].phone_number.replace(/\-/g,'');
            for (var j= 0; j<cur_receiver_list.length; j++){
                if(phone == cur_receiver_list[j]){
                    dup_flag = 1;
                }
            }
            if(dup_flag == 0){
                add_receiver_list.push(data[i]);
            }else{
                dup_flag = 0;
            }
        }
    }else{
        add_receiver_list = data;
    }
    if(add_receiver_list.length == 0){
        $('.loading').fadeOut();
        alert('중복된 수신자를 제외한 등록 할 수신자가 없습니다.'); 
    }else{
        lb.auto_view({
            wrap : "receiver_wrap",
            copy : "receiver_copy",
            attr: '["data-attr"]',
            // json: data,
            json : add_receiver_list,
            havior: function (elem, data, name, copy_elem) { 
                if (copy_elem.getAttribute('data-copy') == "receiver_copy") {
                    copy_elem.setAttribute('data-copy', '');
                    copy_elem.id = "receiver_"+recevier_index;
                }
                if(name == "name"){
                    elem.innerHTML = data.name;
                }else if(name == "check_box"){
                    elem.id = "receiver_check_"+recevier_index;
                    elem.classList.add('receiver_check');
                    var phone = data.phone_number.replace(/\-/g,'');
                    elem.value = phone;
                }else if(name == "phone_number"){
                    var phone = data.phone_number.replace(/\-/g,'');
                    elem.innerHTML = phone;
                    elem.classList.add('receiver_pn');
                    receiver_count++;
                    recevier_index++;
                }
            },
            end : function(){
                for(var i = 0; i<add_receiver_list.length; i++){
                    var phone = add_receiver_list[i].phone_number.replace(/\-/g,'');
                    cur_receiver_list.push(phone);
                    session_receiver_list.push(add_receiver_list[i]);
                }
                
                var paste_receiver = document.getElementById('paste_receiver');
                paste_receiver.value = "";
                session_receiver_add();
                alert('수신자가 등록되었습니다.');
                // console.log(session_receiver_list);

            }
        })
        var total_elem = document.getElementById('receiver_total');
        total_elem.innerHTML ="수신자 <i>Total</i>"+receiver_count;
    }
}


function session_receiver_add(){
    lb.ajax({
        type : "JsonAjaxPost",
        list : {
            ctl : "Msg",
            param1 : "session_receiver_save",
            save_list : JSON.stringify(session_receiver_list),
        },
        action : "index.php",
        havior : function(result){
            console.log(result);
            result = JSON.parse(result);
            if(result.result == 1){
                $('.loading').fadeOut();
                
            }
        }
    })
}

function session_receiver_remove(){
    $('.loading').fadeIn();
    lb.ajax({
        type : "JsonAjaxPost",
        list : {
            ctl : "Msg",
            param1 : "session_receiver_remove",
        },
        action : "index.php",
        havior : function(result){
            console.log(result);
            result = JSON.parse(result);
            if(result.result == 1){
                $('.loading').fadeOut();
            }else{
                $('.loading').fadeOut();
            }
        }
    })
}

//주소록 리스트 수신자 목록에 추가
function addr_add_btn(){
    var addr_group_idx_list = [];
    var check_elem = document.getElementsByClassName('addr_check_box');
    for(var i = 0; i<check_elem.length; i++){
        if(check_elem[i].checked == true){
            addr_group_idx_list.push(check_elem[i].value);
        }
    }
    if(addr_group_idx_list.length == 0){
        alert('수신자 목록을 추가할 주소록 그룹을 선택해주세요');
    }else{
        if(double_click){
            double_click = false;
            lb.ajax({
                type : "JsonAjaxPost",
                list : {
                    ctl : "Addr",
                    param1 : "receiver_addr_list",
                    group_idx : JSON.stringify(addr_group_idx_list),
                },
                action : "index.php",
                havior : function(result){
                    double_click = true;
                    // console.log(result);
                    result = JSON.parse(result);
                    if(result.result == 1){
                        for(var i = 0; i<check_elem.length; i++){
                            check_elem[i].checked = false;
                        }
                        if(result.value.length == 0){
                            alert('선택한 주소록은 비어있습니다.');
                        }else{
                            init_receiver(result.value);
                        }
                    }
                }
            })
        }
    }
}

var add_receiver_count = 0;
function receiver_add(){
    var recept_number = document.getElementById('recept_number');
    var regExp =  /^\d{3}\d{3,4}\d{4}$/;
    if(!regExp.test(recept_number.value)){
        alert('번호의 유형이 잘못되었습니다.');
    }else{
        add_receiver_count++;
        var recept_arr = [];
        var obj = {};
        obj.name = "수신자"+add_receiver_count;
        obj.phone_number = recept_number.value;
        recept_arr.push(obj);
        init_receiver(recept_arr);
        recept_number.value = "";
    }
}




//전체 체크
function all_check(target, elem){
    for(var i = 0;i<recevier_index; i++){
        var check_elem = document.getElementById(target+'_check_'+i);
        if(typeof check_elem != "undefined" && check_elem != null && typeof check_elem != undefined && check_elem != "null"){
            if(elem.checked == true){
                check_elem.checked = true;
            }else{
                check_elem.checked = false;
            }
        }
    }
}

//선택 취소
function select_del_receiver(){
    var del_count = 0;
    var select_check = document.getElementsByClassName('receiver_check');
    var select_length = select_check.length;
    var id_arr = [];
    var value_arr = [];
    var new_receiver_list = [];
    
    if(select_check.length != 0){
        for(var i = 0; i<select_length; i++){
            if(select_check[i].checked == true){
                value_arr.push(select_check[i].value);
                id_arr.push(select_check[i].parentNode.parentNode.parentNode.id.split('_')[1]);
                del_count++;
            }
        }
        var dup_flag = 0;
        for(var i = 0; i<cur_receiver_list.length; i++){
            for(var j = 0; j<value_arr.length; j++){
                if(cur_receiver_list[i] == value_arr[j]){
                    dup_flag=1;
                    break;
                }
            }   
            if(dup_flag == 0){
                new_receiver_list.push(cur_receiver_list[i]);
            }else{
                dup_flag = 0;
            }
        }
        cur_receiver_list = new_receiver_list;

        if(cur_receiver_list.length == 0){
            session_receiver_remove();
            session_receiver_list = [];
        }else{
            var new_list = [];
            for(var i = 0; i<cur_receiver_list.length; i++){
                for(var j = 0; j<session_receiver_list.length; j++){
                    if(cur_receiver_list[i] == session_receiver_list[j]["phone_number"]){
                        new_list.push(session_receiver_list[j]);
                    }
                }
            }
            console.log(cur_receiver_list);
            console.log(new_list);
            session_receiver_list = new_list;
            session_receiver_add();
        }
        
        for(var i =0 ; i<id_arr.length; i++){
            $('#receiver_'+id_arr[i]).remove();
        }
        if(select_length == del_count){
            var nothing = document.getElementById('receiver_nothing');
            if(nothing.style.display == "none"){
                nothing.style.display = "table-row";
            }
        }

        var total_elem = document.getElementById('receiver_total');
        receiver_count = receiver_count - del_count;
        total_elem.innerHTML ="수신자 <i>Total</i>"+receiver_count;
        var all_check_elem =document.getElementById('all_check_receiver');
        all_check_elem.checked = false;
    }else{
        alert('취소할 수신자를 선택해주세요');
    }
}


//전체 취소
function all_del_receiver(){
    if(cur_receiver_list.length != 0){
        for(var i = 0;i<recevier_index; i++){
            var del_elem = document.getElementById('receiver_'+i);
            if(typeof del_elem != "undefined" && del_elem != null && typeof del_elem != undefined && del_elem != "null"){
                $(del_elem).remove();
            }
        }
        var nothing = document.getElementById('receiver_nothing');
        if(nothing.style.display == "none"){
            nothing.style.display = "table-row";
        }
        var total_elem = document.getElementById('receiver_total');
        receiver_count = 0;
        cur_receiver_list = [];
        total_elem.innerHTML ="수신자 <i>Total</i>"+receiver_count;
        var all_check_elem =document.getElementById('all_check_receiver');
        all_check_elem.checked = false;
        session_receiver_remove();
    }else{
        alert('취소할 수신자 목록이 없습니다.');
    }
}

//템플리 변수 입력 란
function template_input_elem(){
    var select_btn = document.getElementById('select_btn');
    var template_input2 = document.getElementById('template_input2');
    $(select_btn).change(function(){
        if(this.value != 0){
            if(template_input2.classList.contains('d-none')){
                template_input2.classList.remove('d-none');
            }
        }else{
            if(!template_input2.classList.contains('d-none')){
                template_input2.classList.add('d-none');
            }
        }
    })
}

// 번호 체크
function number_check(elem){
    $(elem).on('propertychange change keyup paste input', function(){
        $(this).val($(this).val().replace(/[^0-9]/g,""));
    })
}

// 친구톡용
function byteCheckViewDisplay_v2(obj){
    var count = document.getElementsByClassName('count-txt')[0];
    var text = obj.value;
    var text_count = text.length;

    if(text_count > 1000){
        // alert("1000자 이상 입력하실수 없습니다.");
        obj.value = calByte_v2.cutByteLength(obj.value,1000);
    }
    if(mms_state == 1){
        count.innerHTML = obj.value.length + " / 400자";
    }else{
        count.innerHTML = obj.value.length + " / 1000자";
    }
}

var calByte_v2 = {
    cutByteLength : function(s, len){
        if(s == null || s.length == 0){
            return 0;
        }
        var rIndex = s.length;
        for(var i = 0; i < s.length; i++){
            if(i == len){
                rIndex = i;
                break;
            }else if(i > len){
                rIndex = i;
                break;
            }
        }
        return s.substring(0, rIndex);
    },
};


function byteCheckViewDisplay(obj){
    var count = document.getElementById('replace_count');
    var text = obj.value;
    byte = calByte.getByteLength(obj.value);
    
    if(byte >2000){
        alert('2000byte 이상 입력하실 수 없습니다.');
        obj.value = calByte.cutByteLength(obj.value,2000); 
    }
    if(byte <= 90 && mms_state == 0){
        send_flag = 1;
        count.innerHTML = calByte.getByteLength(obj.value) + " / 90 Byte (SMS)";
    }else if(byte > 90 && mms_state == 0){
        send_flag = 3;
        count.innerHTML = calByte.getByteLength(obj.value) + " / 2000 Byte (LMS)";
    }else{
        send_flag = 3;
        count.innerHTML = calByte.getByteLength(obj.value) + " / 2000 Byte (MMS)";
    }
}

var calByte = {
    getByteLength : function(s){
        if(s == null || s.length == 0){
            return 0;
        }
        var size = 0;
        for(var i =0; i<s.length; i++){
            size += this.charByteSize(s.charAt(i));
        }
        return size;
    },
    cutByteLength : function(s, len){
        if(s == null || s.length == 0){
            return 0;
        }
        var size = 0;
        var rIndex = s.length;
        for(var i = 0; i < s.length; i++){
            size += this.charByteSize(s.charAt(i));
            if(size == len){
                rIndex = i + 1;
                break;
            }else if(size > len){
                rIndex = i;
                break;
            }
        }
        return s.substring(0, rIndex);
    },
    charByteSize : function(ch){
        if(ch == null || ch.length == 0){
            return 0;
        }

        var oneChar = escape(ch.charAt(0));
        if(oneChar.length == 1){
            return 1;
        }else if(oneChar.indexOf("%u") != -1){
            return 2;
        }else if(oneChar.indexOf("%") != -1){
            return 1;
        }
    }
};




//탭 논 블락
function tab_display(){

    // 메시지, 주소록 부분
    var tab_address = document.getElementById('tab_address');
    var tab_message = document.getElementById('tab_message');
    var address = document.getElementById('address');
    var inbox = document.getElementById('inbox');

    address.onclick = function(){
        tab_address.style.display = "block";
        tab_message.style.display = "none";
        if(!address.classList.contains('current')){
            address.classList.add('current');
        }
        if(inbox.classList.contains('current')){
            inbox.classList.remove('current');
        }
    }

    inbox.onclick = function(){
        tab_address.style.display = "none";
        tab_message.style.display = "block";
        if(!inbox.classList.contains('current')){
            inbox.classList.add('current');
        }
        if(address.classList.contains('current')){
            address.classList.remove('current');
        }
    }

    // 문자메시지 대체 부분
    var tab_talk = document.getElementById("tab_talk");
    var tab_sms = document.getElementById("tab_sms");
    var talk_content = document.getElementById('talk_content');
    var sms_content = document.getElementById('sms_content');
    talk_content.onclick = function(){
        tab_talk.style.display = "block";
        tab_sms.style.display = "none";
        if(!talk_content.classList.contains('current')){
            talk_content.classList.add('current');
        }
        if(sms_content.classList.contains('current')){
            sms_content.classList.remove('current');
        }
    }

    sms_content.onclick = function(){
        tab_talk.style.display = "none";
        tab_sms.style.display = "block";
        if(!sms_content.classList.contains('current')){
            sms_content.classList.add('current');
        }
        if(talk_content.classList.contains('current')){
            talk_content.classList.remove('current');
        }
    }
}


function request_msg_box_list(){
    $("#message_group").empty();
    lb.ajax({
        type : "JsonAjaxPost",
        list : {
            ctl : "Msg",
            param1 : "msg_box_list",
        },
        action : "index.php",
        havior : function(result){
            double_click = true;
            // console.log(result);
            result = JSON.parse(result);
            if(result.result == 1){
               init_msg_box_list(result.value);
            }
        }
    })
}

function init_msg_box_list(data){
    var msg_group_title =document.getElementById('msg_group_title');
    lb.auto_view({
        wrap : "message_group",
        copy : "message_group_copy",
        attr: '["data-attr"]',
        json: data,
        havior: function (elem, data, name, copy_elem) { 
            if (copy_elem.getAttribute('data-copy') == "message_group_copy") {
                copy_elem.setAttribute('data-copy', '');
                copy_elem.style.cursor = "pointer";
                copy_elem.onclick = function(){
                    msg_group_title.innerHTML = data.msg_box_name;
                    open_modal(data.idx);
                }
            }
            if(name == "name"){
                elem.innerHTML = '<i class="fas fa-folder"></i>'+data.msg_box_name;
            }else if(name == "content"){
                if(typeof data.msg_box_content !="undefined" && typeof data.msg_box_content != undefined && data.msg_box_content != null && data.msg_box_content != "null"){
                    elem.innerHTML = data.msg_box_content; 
                }
            }
        }
    })

    var save_msg_box_list = document.getElementById('msg_box_list');
    for(var i= 0; i<data.length; i++){
        var option = document.createElement('option');
        option.text = data[i].msg_box_name;
        option.value = data[i].idx;
        save_msg_box_list.options.add(option);
    }
}

function open_modal(target){
    if(double_click){
        double_click = false;
        var msg_modal = document.getElementById("msg_modal");
        var msg_search_word = document.getElementById('msg_search_word');
        var msg_search_btn = document.getElementById('msg_search_btn');
        msg_search_btn.onclick = function(){
            msg_list_search(target);
        }
        msg_modal.style.display = "block";
        lb.ajax({
            type : "JsonAjaxPost",
            list : {
                ctl : "Msg",
                param1 : "msg_list",
                box_idx : target,
            },
            action : "index.php",
            havior : function(result){
                double_click = true;
                console.log(result);
                result = JSON.parse(result);
                if(result.result == 1){
                    if(result.value.length==0){
                        alert('선택한 메시지함은 비어있습니다.');
                    }else{
                        init_msg_list(result.value);
                    }
                }
            }
        })
    }
}

function msg_list_search(target){
    if(double_click){
        double_click = false;
        if(typeof target != undefined && typeof target != "undefined" && target != null && target != "null"){

            $('#msg_list_wrap').empty();
            var msg_modal = document.getElementById("msg_modal");
            var msg_search_word = document.getElementById('msg_search_word');
            msg_modal.style.display = "block";
            lb.ajax({
                type : "JsonAjaxPost",
                list : {
                    ctl : "Msg",
                    param1 : "msg_list",
                    box_idx : target,
                    search_name : msg_search_word.value,
                },
                action : "index.php",
                havior : function(result){
                    double_click = true;
                    console.log(result);
                    result = JSON.parse(result);
                    if(result.result == 1){
                        if(result.value.length==0){
                            alert('검색결과가 없습니다.');
                        }else{
                            init_msg_list(result.value);
                        }
                    }
                }
            })
        }else{
            alert('검색대상 오류');
            double_click = true;
        }
    }else{
        alert('검색중입니다.');
    }
}

function close_modal(){
    var msg_modal = document.getElementById("msg_modal");
    var msg_group_title =document.getElementById('msg_group_title');
    var msg_search_word = document.getElementById('msg_search_word');
    var msg_search_btn = document.getElementById('msg_search_btn');
    msg_search_btn.onclick = function(){
        msg_list_search();
    }
    msg_search_word.value = "";
    msg_group_title.innerHTML = "";
    msg_modal.style.display = "none";
    $('#msg_list_wrap').empty();
}

function init_msg_list(data){
    var msg_text =  document.getElementById('msg_text');
    lb.auto_view({
        wrap : "msg_list_wrap",
        copy : "msg_list_copy",
        attr: '["data-attr"]',
        json: data,
        havior: function (elem, data, name, copy_elem) { 
            if (copy_elem.getAttribute('data-copy') == "msg_list_copy") {
                copy_elem.setAttribute('data-copy', '');
                // copy_elem.style.cursor = "pointer";
                // copy_elem.onclick = function(){
                //     var confirm_result = confirm("현재 작성된 메시지 내용이 지워지고 선택한 메시지를 입력하시겠습니까?");
                //     if(confirm_result){
                //         msg_text.value = data.msg_content;
                //         byteCheckViewDisplay_v2(msg_text);
                //         close_modal();
                //     }
                // }
            }
            if(name == "name"){
                elem.innerHTML = data.msg_name;
            }else if(name == "content"){
                // elem.style.overflow = "hidden";
                // elem.style.whiteSpace = "nowrap";
                // elem.style.textOverflow = "ellipsis"
                elem.innerHTML = data.msg_content;   
            }else if(name == "btn"){
                elem.onclick = function(){
                    var confirm_result = confirm("현재 작성된 메시지 내용이 지워지고 선택한 메시지를 입력하시겠습니까?");
                    if(confirm_result){
                        msg_text.value = data.msg_content;
                        byteCheckViewDisplay_v2(msg_text);
                        close_modal();
                    }
                }
            }
        }
    })
}


function save_open_modal(){
    var save_msg_modal = document.getElementById('save_msg_modal');
    save_msg_modal.style.display = "block";
}

function save_close_modal(){
    var save_msg_modal = document.getElementById('save_msg_modal');
    var save_msg_box_list = document.getElementById('msg_box_list');
    var msg_name = document.getElementById('msg_name');

    save_msg_box_list.value = 0;
    msg_name.value = "";
    save_msg_modal.style.display = "none";
}


function request_msg_add(){
    
    $(".loading").fadeIn();
    if(double_click){
        double_click =false;
        if(document.getElementById('msg_box_list').value == "0"){
            alert("메시지함을 선택해주세요");
            $(".loading").fadeOut();
            double_click = true;
        }else if(document.getElementById('msg_name').value == ""){
            alert("메시지 설명을 입력해주세요");
            $(".loading").fadeOut();
            double_click = true;
        }else if(document.getElementById('msg_text').value == ""){
            alert("메시지 내용을 입력해주세요");
            $(".loading").fadeOut();
            double_click = true;
        }else{
            lb.ajax({
                type : "JsonAjaxPost",
                list : {
                    ctl : "Msg",
                    param1 : "add_msg",
                    box_idx : document.getElementById('msg_box_list').value,
                    msg_name : document.getElementById('msg_name').value,
                    msg_content : document.getElementById('msg_text').value,
                },
                action : "index.php",
                havior : function(result){
                    $(".loading").fadeOut();
                    double_click = true;
                    result = JSON.parse(result);
                    if(result.result == 1){
                        alert('메시지가 저장되었습니다.');
                        save_close_modal();
                        console.log(result.value)
                    }
                }
            })
        }
    }else{
        alert('메시지를 저장중입니다.');
    }
}



// 발신프로필 호출
function request_send_profile_list(){
    lb.ajax({
        type : "JsonAjaxPost",
        list : {
            ctl : "Callback",
            param1 : "send_profile_list",
        },
        action : "index.php",
        havior : function(result){
            result = JSON.parse(result);
            if(result.result == 1){
                // 발신프로필 셀렉트 박스
                var send_profile_list = document.getElementById('send_profile_list');
                // 발신프로필 셀렉트 박스 옵션 추가
                for(var i= 0; i<result.value.length; i++){
                    var option = document.createElement('option');
                    option.value = result.value[i].idx;
                    option.innerHTML = result.value[i].profile_name + "[" + result.value[i].yellow_id +  "]";
                    send_profile_list.appendChild(option);
                }
                // 발신번호 셀렉트 박스
                var send_number_list = document.getElementById('send_number_list');
                // 발신번호 셀렉틉 박스 기본 값
                var send_number_default_option = document.createElement('option');
                send_number_default_option.value = 0;
                send_number_default_option.innerHTML = "선택";
                // 발신프로필이 변경되면
                $(send_profile_list).on("change", function(){
                    if(this.value == 0){
                        $(send_number_list).empty();
                        send_number_list.appendChild(send_number_default_option);
                    }else{
                        request_send_number_list(this.value);
                    }
                });
            }
        }
    })
}

// 대표발신번호 호출
function request_send_number_list(target){
    lb.ajax({
        type : "JsonAjaxPost",
        list : {
            ctl : "Callback",
            param1 : "send_number_list",
            target : target,
        },
        action : "index.php",
        havior : function(result){
            result = JSON.parse(result);
            if(result.result == 1){
                console.log(result.value);
                // 발신 번호 셀렉트 박스
                var send_number_list = document.getElementById('send_number_list');
                
                // 발신번호 셀렉트 박스 옵션 추가
                for(var i= 0; i<result.value.length; i++){
                    var option = document.createElement('option');
                    option.value = result.value[i].idx;
                    option.innerHTML = result.value[i].callback_num;
                    send_number_list.appendChild(option);
                }

                if(result.send_number_idx != 0){
                    send_number_list.value = result.send_number_idx;
                    $(send_number_list).trigger("change");
                }
            }
        }
    })
}

var double_click = true;

function request_send_msg(){
    //수신자 목록
    var receiver_list = [];
    var receiver_elem = document.getElementsByClassName('receiver_pn');
    for(var i = 0; i<receiver_elem.length; i++){
        receiver_list.push(receiver_elem[i].innerHTML);
    }
    //텍스트 메세지
    var text_value = document.getElementById('msg_text').value;
    //발신번호
    var send_number_value = document.getElementById('send_number').value;
    //예약 날짜
    var reserve_date_value = document.getElementById('reserve_date').value;
    //예약 시간
    var reserve_time_value = document.getElementById('reserve_time').value;
    reserve_time_value =  reserve_time_value.replace(/ /gi, "");

    // 발신프로필 idx
    var k_send_profile_value = document.getElementById('send_profile_list').value;

    // 발신 번호 idx
    var k_send_number_value = document.getElementById('send_number_list').value;

    // 버튼 유무 0 : 없음 1 : 있음
    // 1일 경우 버튼 명, 버튼URL 필수
    var select_btn_value = document.getElementById('select_btn').value;

    // 버튼명
    var button_name_value = document.getElementById('button_name').value;
    // 버튼 url 
    var button_url_value = document.getElementById('button_url').value;

    // 이미지 url
    var f_img_link_value = document.getElementById('f_img_link').value;

    // 문자메시지로 대체
    // 0 : 실패시 문자메시지로 대체 안함, 1 : 실패시 문자메시지로 대체
    var replace_flag = 0;
    var replace_checkbox = document.getElementById("replace_checkbox");
    if(replace_checkbox.checked == true){
        replace_flag = 1;
    }else{
        replace_flag = 0;
    }

    // 대체 메시지 : 0 : 사용안함 1 :사용
    var replace_msg = 0;
    if(sms_content.classList.contains("current")){
        replace_msg = 1;
    }else{
        replace_msg = 0;
    }

    // 대체 메시지 내용
    var replace_msg_text_value = document.getElementById("replace_msg_text").value;

    var attach = {
        "attachment" : {
            "button" : [],
        },
    };
    if(select_btn_value == 1){
        var btn = {};
        btn.name = button_name_value;
        if(button_url_value == ""){
            btn.type = "DS";
        }else{
            btn.type = "WL";
            btn.url_mobile = button_url_value;
            btn.url_pc = button_url_value;
        }
        attach.attachment.button.push(btn);
    }
    
    if(double_click){
        double_click = false;
        if(text_value == ""){
            alert('메시지 내용을 입력해주세요.');
            double_click = true;
        }
        // else if(send_number_value == ""){
        //     alert('발신번호를 입력해주세요.');
        //     double_click = true;
        // }
        else if(receiver_list.length == 0){
            alert('수신자 목록이 비어있습니다.');
            double_click = true;   
        }else if(k_send_profile_value == 0){
            alert("발신프로필을 선택해주세요");
            double_click = true;   
        }else if(k_send_number_value == 0){
            alert("대표발신번호를 선택해주세요");
            double_click = true;
        }else if(select_btn_value == 1 && button_name_value == ""){
            alert("버튼명을 입력해주세요");
            double_click = true;
        }else if(replace_flag == 1 && replace_msg == 1 && replace_msg_text_value == ""){
            alert("대체할 문자내용을 입력해주세요");
            double_click = true;
        }else if(reserve_flag == 1){
            //예약
            if(reserve_date_value == ""){
                alert('예약 날짜를 입력해주세요.');
                double_click = true;                
            }else if(reserve_time_value == ""){
                alert('예약 시간을 입력해주세요.');
                double_click = true;
            }else{
                var confirm_result = confirm("친구톡을 예약하시겠습니까?");
                if(confirm_result){
                    $(".loading").fadeIn();
                    lb.ajax({
                        type : "AjaxFormPost",
                        list : {
                            ctl : "Msg",
                            param1 : "send_k_f_talk",
                            // 대체 메시지사용할때 사용
                            msg_type : send_flag,
                            text : text_value,
                            send_number : send_number_value,
                            reserve_date : reserve_date_value,
                            reserve_time : reserve_time_value,
                            receiver_list : JSON.stringify(receiver_list),
                            user_idx : user_idx,

                            k_send_profile : k_send_profile_value,
                            k_send_number : k_send_number_value,
                            select_btn : select_btn_value,
                            button_name : button_name_value,
                            button_url : button_url_value,

                            attach : JSON.stringify(attach),
                            img_link : f_img_link_value,

                            // 대체 메시지
                            replace_flag : replace_flag,
                            replace_msg : replace_msg,
                            replace_msg_text : replace_msg_text_value,
                            
                        },
                        elem : lb.getElem('form'),
                        action : "index.php",
                        havior : function(result){
                            $(".loading").fadeOut();
                            double_click = true;
                            console.log(result);
                            result = JSON.parse(result);
                            if(result.result == 1){
                                alert("친구톡이 예약되었습니다.");
                            }else{
                                alert(result.message); 
                            }
                        }
                    })
                }else{
                    double_click = true;
                }
            }
        }else{
            //즉시 발송
            var confirm_result = confirm("친구톡을 전송하시겠습니까?");
            if(confirm_result){
                $(".loading").fadeIn();
                lb.ajax({
                    type : "AjaxFormPost",
                    list : {
                        ctl : "Msg",
                        param1 : "send_k_f_talk",
                        msg_type : send_flag,
                        text : text_value,
                        send_number : send_number_value,
                        receiver_list : JSON.stringify(receiver_list),
                        user_idx : user_idx,
                        
                        k_send_profile : k_send_profile_value,
                        k_send_number : k_send_number_value,
                        select_btn : select_btn_value,
                        button_name : button_name_value,
                        button_url : button_url_value,

                        attach : JSON.stringify(attach),
                        img_link : f_img_link_value,

                        // 실패시 문자메시지 1 : 사용 0 : 사용안함
                        replace_flag : replace_flag,
                        // 대체 메시지 1: 사용 0 : 사용안함
                        replace_msg : replace_msg,
                        replace_msg_text : replace_msg_text_value,
                    },
                    elem : lb.getElem('form'),
                    action : "index.php",
                    havior : function(result){
                        $(".loading").fadeOut();
                        double_click = true;
                        console.log(result);
                        result = JSON.parse(result);
                        if(result.result == 1){
                            alert("친구톡이 발송되었습니다.");
                        }else{
                            alert(result.message); 
                        }
                    }
                })
            }else{
                double_click = true;
            }
        }
    }else{
        alert('메시지 전송 중입니다.');
    }
}
