var double_click = true;
$(document).ready(function(){
	request_ready_msg_queue();
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

	console.log(user_idx);
});

var excelHandler ={
    getExcelFileName : function(){
        return "result_table.xlsx";
    },
    getSheetName : function(){
        return "Sheet1";
    },
    getExcelData : function(){
        //Excel 다운시 checkbox 제외시키기
        var clone_table = document.getElementById('table_elem').cloneNode(true);
        var tr = clone_table.querySelectorAll('tr');
        // for(var i = 0; i <= tr.length - 1; i++){
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


//검색창 value reset
function value_reset(){
    document.querySelector('#start_date').value = "";
    document.querySelector('#end_date').value = "";
    document.querySelector('#msg_type').value = 0;
    document.querySelector('#send_type').value = 0;
    document.querySelector('#callback').value = "";
    document.querySelector('#dstaddr').value = "";
    $('#notice_wrap').empty();
}
//메시지 전송 결과 검색
function search_msg(type){
    $('#notice_wrap').empty();
    var start_date = document.querySelector('#start_date').value + " 00:00:00"; //발송시작일
    var end_date = document.querySelector('#end_date').value + " 23:59:59"; //발송종료일
    var msg_type = document.querySelector('#msg_type').value; //전송분류
    var send_type = document.querySelector('#send_type').value; //전송결과
    var callback = document.querySelector('#callback').value; //발신자번호
    var dstaddr = document.querySelector('#dstaddr').value; //수신자번호
    if(double_click){
        // $(".loading").fadeIn();
        double_click = false;
        if(document.querySelector('#start_date').value == ""){
            $(".loading").fadeOut();
            alert("발송시작일을 입력해주세요");
            double_click = true;
        }else if(document.querySelector('#end_date').value == ""){
            $(".loading").fadeOut();
            alert("발송종료일을 입력해주세요");
            double_click = true;
        }else if(new Date(start_date).getTime() > new Date(end_date).getTime()){
            $(".loading").fadeOut();
            alert("종료일은 시작일보다 늦어야합니다");
            double_click = true;
        }else{
            lb.ajax({
                type: "JsonAjaxPost",
                list: {
                    ctl: "Msg",
                    param1: "search_msg",
                    start_date: start_date,
                    end_date: end_date,
                    msg_type: msg_type,
                    send_type: send_type,
                    callback: callback,
                    dstaddr: dstaddr,
                    user_idx : user_idx,
                    type: type,
                },
                action: "index.php",
                havior: function (result) {
                    //console.log(result);
                    double_click = true;
                    result = JSON.parse(result);
                    if(result.result==1){
                        if(result.message == "no_db"){
                            alert("검색결과가 없습니다");
                            $(".loading").fadeOut();
                        }else{
                            if(result.value.length == 0){
                                alert("검색결과가 없습니다");
                                $(".loading").fadeOut();
                            }else{
                                init_board(result.value);
                            }
                        }     
                    }else{
                        $(".loading").fadeOut();
                        alert("관리자에게 문의해주세요");
                    }
                }
            });
        }
    }else{
        alert("글 검색중입니다.");
    }
}

var msg_type_text = ["전체", "SMS", "LMS", "MMS", "", "", "알림톡"];
var send_type_text = ["전체", "성공", "실패", "송신중/송신완료"];
var total_count = 0;
function init_board(data){
	total_count = data.length;
	var num = 1;
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

			if(name == "elem_num"){
				elem.innerHTML = num++;
			}else if(name == "send_time"){
                elem.innerHTML = dateFormat(data[name]);
                // elem.innerHTML = data[name];
            }else if(name == "send_hour"){
                
                elem.innerHTML = hourformat(data.send_time, 'time');
            }else if(name == "callback"){
                elem.innerHTML = phoneFormatter(data[name]);
            }else if(name == "msg_type"){
//                console.log(data);
                if(data.msg_type == "3" && data.filecnt == "0"){
                    elem.innerHTML = "LMS";
                }else{
                    elem.innerHTML = msg_type_text[data[name]];
                }
            }else if(name == "dstaddr"){
                elem.innerHTML = phoneFormatter(data[name]);
            }else if(name == "send_type"){
                if(data["result"] == 100){
                    elem.innerHTML = "성공";
                // }else if(data["result"] == 200){

                // }else if(data["result"] == 201){
                    
                // }else if(data["result"] == 202){
                    
                // }else if(data["result"] == 203){
                    
                // }else if(data["result"] == 209){
                    
                // }else if(data["result"] == 210){
                    
                }else{
                    elem.innerHTML = "실패";
                }
            }else if(name == "text"){
                elem.style.overflow = "hidden";
                elem.style.whiteSpace = "nowrap";
                elem.style.textOverflow = "ellipsis";
                elem.innerHTML = data[name];
                elem.onclick = function(){
                    open_content_modal(data.text);
                }
            }else if(name == "check"){
                elem.id = data["mseq"];
                elem.classList.add('data-check');
            }else{
                elem.innerHTML = data[name];
            }
        },
        end : function(){
            $(".loading").fadeOut();
        }
    });
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

//2020-11-23 형식으로 날짜를 format 해주는 함수
function dateFormat(date){
    
    var year = date.substring(0,4);
    var month = date.substring(5,7);
    var date = date.substring(8, 10);
    // var minute
    return year + "-" + month + "-" + date;
}

 //날짜 포메터
 function hourformat(data, type){
    var date = data.substring(0, 10);
    var time = data.substring(11, 19);

    if(type=="date"){
        return date;
    }else if(type == "time"){
        return time;
    }
 }


function date_hour(date){
    
    var hour = date.substring(0,4);
    var month = date.substring(5,7);
    var date = date.substring(8, 10);
    // var minute
    return year + "-" + month + "-" + date;
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

 var check_list = [];
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


function refresh_ready(){
    request_ready_msg_queue();
}


function request_ready_msg_queue(){
    var result_kind = "sms";
    
    if(window.location.href.split("param1=").length > 1){
        var param1 = window.location.href.split("param1=")[1];
        if(param1.split("_")[0] == "kakao"){
            result_kind = "kakao";
        }
    }
    $("#ready_wrap").empty();
    $(".loading").fadeIn();
    lb.ajax({
        type: "JsonAjaxPost",
        list: {
            ctl: "Msg",
            param1: "ready_msg_queue",
            result_kind : result_kind,
        },
        action: "index.php",
        havior: function (result) {
//            console.log(result);
            result = JSON.parse(result);
            if(result.result==1){
                if(result.value.length == 0){
                    document.getElementById("ready_wrap").innerHTML = '<tr id="none_notice"><td colspan = "7" class="align-center" height="185">발송대기중인 메시지가 없습니다.</td></tr>';
                }else{
                    init_ready_msg_queue(result.value);
                }
                $(".loading").fadeOut();
            }else{
                $(".loading").fadeOut();
            }
        }
    });
}


function init_ready_msg_queue(data){
    lb.auto_view({
        wrap : "ready_wrap",
        copy : "ready_copy",
        attr : '["data-attr"]',
        json : data,
        havior : function(elem, data, name, copy_elem){
            if (copy_elem.getAttribute('data-copy') == "ready_copy") {
                copy_elem.setAttribute('data-copy', '');
            }
            if(name == "send_time"){
                elem.innerHTML = dateFormat(data.request_time);
            }else if(name == "send_hour"){
                elem.innerHTML = hourformat(data.request_time, 'time');
            }else if(name == "callback"){
                elem.innerHTML = phoneFormatter(data[name]);
            }else if(name == "msg_type"){
                if(data.msg_type == "3" && data.filecnt == "0"){
                    elem.innerHTML = "LMS";
                }else{
                    elem.innerHTML = msg_type_text[data[name]];
                }
            }else if(name == "dstaddr"){
                elem.innerHTML = phoneFormatter(data[name]);
            }else if(name == "stat"){
                if(data.stat == 0){
                    elem.innerHTML = "미발송";
                }else if(data.stat == 1){
                    elem.innerHTML = "송신중";   
                }else if(data.stat == 2){
                    elem.innerHTML = "송신완료";   
                }else{
                    elem.innerHTML = "발송대기중";
                }
            }else if(name == "text"){
                elem.style.overflow = "hidden";
                elem.style.whiteSpace = "nowrap";
                elem.style.textOverflow = "ellipsis";
                elem.innerHTML = data[name];
                elem.onclick = function(){
                    open_content_modal(data.text);
                }
            }else{
                elem.innerHTML = data[name];
            }
        },
        end : function(){
            $(".loading").fadeOut();
        }
    });
}