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
    });
})

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
    var confirm_result = confirm('아래 내용을 엑셀다운로드 하시겠습니까?');

    if(confirm_result){
        var wb = XLSX.utils.book_new();

        var newWorksheet = excelHandler.getWorksheet();
    
        XLSX.utils.book_append_sheet(wb, newWorksheet, excelHandler.getSheetName());
    
        var wbout = XLSX.write(wb, {bookType : 'xlsx', type : "binary"});
    
        saveAs(new Blob([s2ab(wbout)], {type : "application/octet-stream"}), excelHandler.getExcelFileName());
    }
}

function search(){
    var start_date =document.getElementById('start_date');
    var end_date =document.getElementById('end_date');
    if(start_date.value == ""){
        alert('조회시작일을 입력해주세요');
    }else if(end_date.value == ""){
        alert('조회종료일을 입력해주세요');
    }else{
        $('#notice_wrap').empty();
        $(".loading").fadeIn();
        lb.ajax({
            type :"JsonAjaxPost",
            list :{
                ctl: "Msg",
                param1: "stateday",
                start_date : start_date.value + " 00:00:00",
                end_date : end_date.value + " 23:59:59",
                msg_type : msg_type.value,
            },
            action : "index.php",
            havior : function(result){
                console.log(result);
                result = JSON.parse(result);
                if(result.result == 1){
                    if(result.value.length == 0){
                        $(".loading").fadeOut();
                        var nothing = document.getElementById('nothing');
                        if(typeof nothing != "undefined" && typeof nothing != undefined && nothing != null && nothing != "null"){
    
                        }else{
                            nothing_elem();
                        }
                    }else{
                        var nothing = document.getElementById('nothing');
                        if(typeof nothing != "undefined" && typeof nothing != undefined && nothing != null && nothing != "null"){
                            $(nothing).remove();
                        }
                        init_state(result.value, msg_type.value);
                    }
                }else{
                    $(".loading").fadeOut();
                }
            }
        })
    }
}

function value_reset(){
    var start_date = document.getElementById('start_date');
    var end_date = document.getElementById('end_date');
    var msg_type = document.getElementById('msg_type');

    start_date.value = "";
    end_date.value = "";
    msg_type.value = 0;
}

function init_state(data, type){
    lb.auto_view({
        wrap : "notice_wrap",
        copy : "notice_copy",
        attr : '["data-attr"]',
        json : data,
        havior : function(elem, data, name, copy_elem){
            if (copy_elem.getAttribute('data-copy') == "notice_copy") {
                copy_elem.setAttribute('data-copy', '');
            }
            if(name == "date"){
                elem.innerHTML = data.basedate;
            }else if(name == "msg_type"){
                if(type == "1"){
                    elem.innerHTML = "SMS";
                }else if(type == "2"){
                    elem.innerHTML = "LMS";
                }else if(type == "3"){
                    elem.innerHTML = "MMS";
                }else if(type == "6"){
                    elem.innerHTML = "알림톡";
                }else if(type == "7"){
                    elem.innerHTML = "친구톡";
                }else{
                    elem.innerHTML = "전체";
                }
            }else if(name == "total"){
                elem.innerHTML = data.total;
            }else if(name == "success"){
                elem.innerHTML = data.success;
            }else if(name == "fail"){
                elem.innerHTML = data.fail;
            }else if(name == "percent"){
                var percent = Math.ceil(data.success*1/data.total*1 * 100);
                elem.innerHTML = percent;
            }
        },
        end : function(){
            $(".loading").fadeOut();
        }
    });
}

function nothing_elem(){
    var notice_wrap = document.getElementById('notice_wrap');
    var tr = document.createElement('tr');
    var td = document.createElement('td');

    td.setAttribute('colspan', 6);
    td.setAttribute('class','align-center');
    td.setAttribute('height', "185");
    td.innerHTML = "내용이 없습니다";

    tr.setAttribute('id', 'nothing');
    tr.appendChild(td);

    notice_wrap.appendChild(tr);
}