$(document).ready(function(){
    $('#start_date').datepicker({
        dateFormat : "yy-mm-dd",
    });
    $('#end_date').datepicker({
        dateFormat : "yy-mm-dd",
    });

    $(".adm_main_container").scroll(function(){
        $('#start_date').datepicker("hide");
        $('#end_date').datepicker("hide");
    })

    number_check(lb.getElem('send_number'));
    number_check(lb.getElem('receiver_number'));
})
var double_click = true;

// 번호 체크
function number_check(elem){
    $(elem).on('propertychange change keyup paste input', function(){
        $(this).val($(this).val().replace(/[^0-9]/g,""));
    })
}

var excelHandler ={
    getExcelFileName : function(){
        return "reserve_table.xlsx";
    },
    getSheetName : function(){
        return "Sheet1";
    },
    getExcelData : function(){
        var clone_table = document.getElementById('table_elem').cloneNode(true);
        var tr = clone_table.querySelectorAll('tr');
        // for(var i = 0; i < tr.length; i++){
        //     tr[i].removeChild(tr[i].querySelector('.check'));
        // }
        return clone_table;
    },
    getWorksheet : function(){
        return XLSX.utils.table_to_sheet(this.getExcelData());
    }
}

function s2ab(s){
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for(var i =0; i<s.length; i++){
        view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
}

function exportExcel(){
    var wb = XLSX.utils.book_new();

    var newWorksheet = excelHandler.getWorksheet();

    XLSX.utils.book_append_sheet(wb, newWorksheet, excelHandler.getSheetName());

    var wbout = XLSX.write(wb, {bookType : 'xlsx', type : "binary"});

    saveAs(new Blob([s2ab(wbout)], {type : "application/octet-stream"}), excelHandler.getExcelFileName());
}


function init_search_elem(){
    var start_date = document.getElementById('start_date');
    var end_date = document.getElementById('end_date');
    var send_kind= document.getElementById('send_kind');
    var send_number = document.getElementById('send_number');
    var receiver_number =document.getElementById('receiver_number');
    var msg_content = document.getElementById('msg_content');

    start_date.value = "";
    end_date.value = "";
    send_kind.value = 0;
    send_number.value = "";
    receiver_number.value = "";
    msg_content.value = "";
}

function search(){
    var start_date = document.getElementById('start_date');
    var end_date = document.getElementById('end_date');
    var send_kind= document.getElementById('send_kind');
    var send_number = document.getElementById('send_number');
    var receiver_number =document.getElementById('receiver_number');
    var msg_content = document.getElementById('msg_content');

    if(double_click){
        double_click = false;
        $(".loading").fadeIn();
        $('#reserve_wrap').empty();
        if(start_date.value == ""){
            alert('검색시작일을 입력해주세요');
            $(".loading").fadeOut();
            double_click = true;
        }else if(end_date.value == ""){
            alert('검색종료일을 입력해주세요');
            $(".loading").fadeOut();
            double_click = true;
        }else{
            lb.ajax({
                type : "JsonAjaxPost",
                list : {
                    ctl : "Msg",
                    param1 : "search_reserve_msg",
                    start_date : start_date.value + " 00:00:00",
                    end_date : end_date.value + " 23:59:59",
                    send_kind : send_kind.value,
                    send_number : send_number.value,
                    receiver_number : receiver_number.value,
                    msg_content : msg_content.value,
                    user_idx : user_idx,
                },
                action :"index.php",
                havior : function(result){
                    double_click = true;
                    console.log(result);
                    result =JSON.parse(result);
                    if(result.result == 1){
                        if(result.value.length == 0){
                            $(".loading").fadeOut();
                            alert("검색결과가 없습니다.");
                        }else{
                            init_reserve(result.value);
                        }
                    }
                }
            })
        }
    }else{
        alert('검색 요청중입니다.');
    }
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


 //날짜 포메터
 function DateFormatter(data, type){
    var date = data.substring(0, 10);
    var time = data.substring(11, 19);

    if(type=="date"){
        return date;
    }else if(type == "time"){
        return time;
    }
 }


// 예약 테이블에 검색결과뿌리기
function init_reserve(data){
    // var nothing = document.getElementById('reserve_nothing');
    // if(data.length > 0){
    //     nothing.style.display = "none";
    // }else{
    //     nothing.style.display = "table-row";
    // }
    lb.auto_view({
        wrap : "reserve_wrap",
        copy : "reserve_copy",
        attr: '["data-attr"]',
        json: data,
        havior: function (elem, data, name, copy_elem) { 
            if (copy_elem.getAttribute('data-copy') == "reserve_copy") {
                copy_elem.setAttribute('data-copy', '');
            }
            if(name == "check_box"){
                elem.setAttribute('class','reserve_check');
                elem.value = data.mseq;
            }else if(name == "send_kind"){
                if(data.msg_type  == 1){
                    elem.innerHTML = "SMS";
                }else if(data.msg_type  == 2){
                    elem.innerHTML = "SMS";
                }else if(data.msg_type  == 3){
                    if(data.filecnt == 0){
                        elem.innerHTML = "LMS";
                    }else{
                        elem.innerHTML = "MMS";
                    }
                }else if(data.msg_type  == 4){
                    elem.innerHTML = "MMS";
                }else if(data.msg_type  == 6){
                    elem.innerHTML = "알림톡";
                }else if(data.msg_type  == 7){
                    elem.innerHTML = "친구톡";
                }
            }else if(name == "sender_number"){
                elem.innerHTML = phoneFormatter(data.dstaddr);
            }else if(name == "receiver_number"){
                elem.innerHTML = phoneFormatter(data.callback);
            }else if(name == "send_date"){
                elem.innerHTML = DateFormatter(data.request_time,"date");
            }else if(name == "send_time"){
                elem.innerHTML = DateFormatter(data.request_time,"time");
            }else if(name == "state"){
                if(data.stat == 0){
                    elem.innerHTML = "전송대기";
                }else if(data.stat == 1){
                    elem.innerHTML = "송신중";
                }else if(data.stat == 2){
                    elem.innerHTML = "송신완료";
                }else if(data.stat == 3){
                    elem.innerHTML = "결과수신";
                }
            }else if(name == "content"){
                elem.style.overflow = "hidden";
                elem.style.whiteSpace = "nowrap";
                elem.style.textOverflow = "ellipsis";
                elem.innerHTML = data.text;
                elem.onclick = function(){
                    open_content_modal(data.text);
                }
            }
        },
        end : function(){
            $(".loading").fadeOut();
        }
    })
}


function open_content_modal(data){
    var content_modal = document.getElementById('content_modal');
    content_modal.style.display = "block";
    var msg_text = document.getElementById('msg_text');
    msg_text.value = data;
}

function close_content_modal(){
    var content_modal = document.getElementById('content_modal');
    content_modal.style.display = "none";
    var msg_text = document.getElementById('msg_text');
    msg_text.value = "";
}


function all_check(elem){
    var check_elems = document.getElementsByClassName('reserve_check');
    for(var i=0; i<check_elems.length; i++){
        if(elem.checked == true){
            check_elems[i].checked = true;
        }else{
            check_elems[i].checked = false;
        }
    }
}

function all_del_check(){
    var check_elems = document.getElementsByClassName('reserve_check');
    var del_value_arr = [];
    for(var i= 0; i<check_elems.length; i++){
        if(check_elems[i].checked == true){
            del_value_arr.push(check_elems[i].value);
        }
    }
    console.log(del_value_arr);
}