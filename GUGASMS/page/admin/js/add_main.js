var double_click = true;
var receiver_count = 0;
var recevier_index  = 0;



$(document).ready(function(){
    request_product_list(user_idx);
    // number_check(lb.getElem('addr_phone_number'));
    // console.log(user_idx);
    $("#product_price, #product_amount").change( function(){
        let aa = document.getElementById('product_price').value;
        aa = aa.replace(/,/g, "");
        let num1 = parseInt(aa);
        let num2 = parseInt(document.getElementById('product_amount').value);
        let result1 = num1 * num2;
        result1 = result1.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
        let num3 = num1.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
        $( '#product_sum' ).prop( 'value', result1);
        $( '#product_price' ).prop( 'value', num3);
        // document.getElementById('product_price').innerText = num1;
    });  
    input_file_check(lb.getElem('excel_upload'),["xlsx"],"excel");
});

function addCommas(value) {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}


// 검색
function search(target){
    if(typeof target != undefined && target != null && typeof target != "undefined" && target != "null"){
        if(addr_click_flag){
            var addr_name = document.getElementById('search_addr_name');
            var addr_phone_number = document.getElementById('search_addr_phone_number');
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

// 검색 초기화

function init_search(){
    var addr_name = document.getElementById('search_addr_name');
    var addr_phone_number = document.getElementById('search_addr_phone_number');

    addr_name.value = "";
    addr_phone_number.value = "";
}



function createTable(data) {
  var tableHtml = '<tr> <td class="check"> <label class="check_label m-auto" value="yes"><input t' +
        'ype="checkbox"> <span class="checkmark"></span> </label> </td>';

    // for (var i = 0; i < Object.keys(data).length; i++) {
    //     tableHtml += '<td>';
    //     tableHtml += data[i].code + '</td>';
    //     tableHtml += '<td>' + data[i].position + '</td>';
    //     // tableHtml += '<td>' + data[i].country + '</td>';
    //     tableHtml += '</tr>';
    // }
    Object.keys(data).forEach(function(key) {
        tableHtml += '<td>';
        tableHtml += data[key] + '</td>';
    });

    tableHtml += '</tr>';
    tableHtml += '</table>';
    
     // 생성된 HTML을 파싱하여 요소로 변환
     var tempElem = document.createElement('div');
     tempElem.innerHTML = tableHtml;
     console.log(tableHtml);
 
     // 파싱된 요소를 기존 테이블에 추가
     var element = document.getElementById('receiver_wrap');
     element.innerHTML += tableHtml;
    //  element.appendChild(tempElem.innerHTML);
     console.log(element.innerHTML);
}

function ss_user_detail(){
    var result_return;
    return new Promise(function(resolve, reject) {
    lb.ajax({
        type : "JsonAjaxPost",
        list : {
            ctl : "Admin",
            param1 : "admin_detail",
            target : user_idx,
        },
        action : "index.php",
        havior : function(result){
            result = JSON.parse(result);
            result_return = result;
            resolve(result.value[0]);
        }
        });
    });
}


async function request_add_product(){
    var product_code = document.getElementById('product_code');
    var product_position = document.getElementById('product_position');
    var product_b_class = document.getElementById('product_b_class');
    var product_s_class = document.getElementById('product_s_class');
    var product_name = document.getElementById('product_name');
    var product_stand = document.getElementById('product_stand');
    var product_maker = document.getElementById('product_maker');
    var product_custom = document.getElementById('product_custom');
    var product_union = document.getElementById('product_union');
    var product_price = document.getElementById('product_price');
    var product_amount = document.getElementById('product_amount');
    
    // var product_in_date = document.getElementById('product_in_date');
    // var product_image = document.getElementById('product_image');
    var data1 = await ss_user_detail().then(function(tableData) {
        var result22 = {
            idx: tableData.idx,
            name: tableData.name,
            group: tableData.sms,
            id: tableData.id
        }
        data1 = result22;
        console.log(data1);
        return result22;
    }).catch(function(error) {
        console.error(error); // 프로미스가 거부될 때 발생한 오류를 처리합니다.
    });

    console.log(data1);
    let charrc = "";
    let idx1 = user_idx;
    let group_id1 = data1.group;
    
    if(group_id1 == 0){
        charrc = "its"
    }else if(group_id1 == 1){
        charrc = "its"
    }else if(group_id1 == 2){
        charrc = "its"
    }else if(group_id1 == 3){
        charrc = "its"
    }
    if(double_click){
        double_click = false;
        if(product_name.value == ""){
            alert('품명을 입력해주세요');
            double_click = true;
        }else if(product_price.value == ""){
            alert('단가를 입력해주세요');
            double_click = true;
        }else if(product_amount.value == ""){
            alert('수량을 입력해주세요');
            double_click = true;
        }else if(product_in_date.value == ""){
            alert('날짜를 입력해주세요');
            double_click = true;
        }else{
            var product_sum = parseInt(product_price.value.replace(/,/g , '')) * parseInt(product_amount.value.replace(/,/g , ''));
            lb.ajax({
               type : "JsonAjaxPost",
               list : {
                   ctl : "Addr",
                   param1 : charrc + "_add_product",
                   user_id : idx1,
                   group_id : group_id1,
                   mat_in_code : product_code.value,
                   mat_in_place : product_position.value,
                   bc_in_b_class : product_b_class.value,
                   bc_in_s_class : product_s_class.value,
                   mat_in_name : product_name.value,
                   mat_in_stand : product_stand.value,
                   mat_in_maker : product_maker.value,
                   mat_in_custom : product_custom.value,
                   mat_in_union : product_union.value,
                   mat_in_price : product_price.value,
                   mat_in_amount : product_amount.value,
                   mat_in_sum : product_sum,
                //    into_date : product_in_date.value,
                //    mat_image : product_image.value,
               },
                   
               action : "index.php",
               havior : function(result){
                   double_click = true;
                   console.log(result);
                   result = JSON.parse(result);
                   if(result.result == 1){
                       alert('자재를 추가하였습니다.');
                       close_add_modal();
                       request_product_list(user_idx);
                   }else{
                       if(result.error_code == 601){
                           alert(result.message);
                           
                       }else{
                           alert('자재추가 오류');
                       }
                   }
               }
           })
       }
        
        
    }
           
}


//선택 취소
function select_del_receiver(){
        var del_count = 0;
        var select_check = document.getElementsByClassName('receiver_check');
        var select_length = select_check.length;
        if(select_length == 0){
            alert('삭제할 자재를 선택해주세요');
        }else{
            var confirm_result = confirm('선택된 자재를 삭제하시겠습니까?');
            if(confirm_result){
                var del_addr_check_list = [];
                for(var i = 0; i<select_length; i++){
                    if(select_check[i].checked == true){
                        del_addr_check_list.push(select_check[i].value);
                        del_count++;
                    }
                }
                double_click = true;
                if(double_click){
                    double_click =false;
                    lb.ajax({
                        type : "JsonAjaxPost",
                        list : {
                            ctl : "Addr",
                            param1 : "addr_sel_del",
                            addr_idx : JSON.stringify(del_addr_check_list),
                        },
                        action : "index.php",
                        havior : function(result){
                            double_click = true;
                            result = JSON.parse(result);
                            if(result.result == 1){
                                // alert('해당 자재를 삭제하였습니다.');
                                var total_elem = document.getElementById('receiver_total');
                                receiver_count = receiver_count - del_count;
                                total_elem.innerHTML ="<i>Total</i>"+receiver_count;
                                var all_check_elem =document.getElementById('all_check_receiver');
                                all_check_elem.checked = false;
                                request_product_list(user_idx);
                            }else{
                                alert(result.message);
                                console.log(result);
                                if(result.error_code == 620){
                                    alert(result.message);
                                }
                            }
                        }
                    });
                }
            }
        }
}

function product_to_real(){
    if(double_click){
        var target = [];
        var check_elems = document.getElementsByClassName('receiver_check');
        for(var i = 0; i<check_elems.length; i++){
            if(check_elems[i].checked == true){
                target.push(check_elems[i].value);
            }
        }
        // console.log(target);
        if(target.length == 0 || (typeof target[0] == "undefind" ||  target[0] == null || target[0] =="null")){
            alert('자재를 선택해주세요');
        }else{
            confirm_result = confirm("선택한 자재를 추가 하시겠습니까?");
            if(confirm_result){
                double_click = false;
                $('.loading').fadeIn();
                // $('#receiver_check').empty();
                console.log(JSON.stringify(target));
                lb.ajax({
                    type : "JsonAjaxPost",
                    list : {
                        ctl : "Addr",
                        param1 : "products_real",
                        target_idx : JSON.stringify(target),
                    },
                    action : "index.php",
                    havior : function(result){
                        double_click = true;
                        console.log(result);
                        // console.log(result["result"]);
                        // if(result["result"] == undefined){
                        //     alert('등록 실패');
                        //     $('.loading').fadeOut();
                        // }
                        if(result.total != 0){
                            result = JSON.parse(result);
                            console.log(result.total);
                            i_count = result.total;
                            // console.log(parseInt(result.value[0].group_id), parseInt(result.value[0].user_phone.replace(/-/g, '')));
                            for(i=0;i<i_count;i++){
                                lb.ajax({
                                    type : "JsonAjaxPost",
                                    list : {
                                        ctl : "Addr",
                                        param1 : "its_add_product_real",
                                        user_id : result.value[i].user_id,
                                        group_id : result.value[i].group_id,
                                        mat_in_code : result.value[i].mat_in_code,
                                        mat_in_place : result.value[i].mat_in_place,
                                        bc_in_b_class : result.value[i].bc_in_b_class,
                                        bc_in_s_class : result.value[i].bc_in_s_class,
                                        mat_in_name : result.value[i].mat_in_name,
                                        mat_in_stand : result.value[i].mat_in_stand,
                                        mat_in_maker : result.value[i].mat_in_maker,
                                        mat_in_custom : result.value[i].mat_in_custom,
                                        mat_in_union : result.value[i].mat_in_union,
                                        mat_in_price : result.value[i].mat_in_price,
                                        mat_in_amount : result.value[i].mat_in_amount,
                                        mat_in_sum : result.value[i].mat_in_sum,
                                    },
                                    action : "index.php",
                                    havior : function(res){
                                        double_click = true;
                                        select_del_receiver();
                                        // console.log(res["result"]);
                                        // res = JSON.parse(res.value);
                                        // if(res.result == 1){
                                            
                                        // }else{
                                        //     if(res.error_code == "533"){
                                        //         alert(res.message);
                                        //     }else{
                                        //         alert('사용자 등록 실패');
                                        //     }
                                        // }
                                    }
                                })
                        }
                        }else{
                            alert('사용자 등록 실패');
                            $('.loading').fadeOut();
                        }
                    }
                })    
            }
        }
    }else{
        alert('기다려주세요');
    }
}

//엑셀
//파일 업로드 체크(type = "img", type = "excel")
function input_file_check(elem, ext_array, type){
    var file_name_elem = elem.files;
    console.log(file_name_elem);
    //바이트 수
    var msg_text = document.getElementById("msg_text");
    var standard = elem.id.split('_');
    var standard_number = standard[standard.length -1];
    var img_elem = document.getElementById('inner_img_'+standard_number);
    $(elem).change(function(e){
        var file_value = $(elem).val().split("\\");
        var file_name = file_value[file_value.length -1];
        console.log(file_value, file_name);
        if($(this).val() != ""){
            var ext =  $(this).val().split(".").pop().toLowerCase();
            // 매개변수로 받을 값
            if($.inArray(ext, ext_array) == -1){
                if(ext_array[0] == "jpg"){
                    alert('jpg 파일만 업로드 해주세요');
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
                var maxSize = 1024*1024;
                if(fileSize > maxSize){
                    alert('파일용량 1MB를 초과했습니다.');
                    $(this).val("");
                    file_name_elem.value ="파일선택";
                    return;
                }

                var file = this.files[0];
                var _URL = window.URL || window.webkitURL;
                var img = new Image();
                img.src = _URL.createObjectURL(file);
                img.onload = function(){
                    if(img.width > 1000){
                        alert('가로와 세로 길이는 1000px을 넘을 수 없습니다');
                        $(elem).val("");
                        file_name_elem.value ="파일선택";
                        mms_state = 0;
                        byteCheckViewDisplay(msg_text);
                        $(img_elem).attr('src', "");
                        img_elem.classList.add('d-none');
                        return;
                    }else{
                        var reader = new FileReader();
                        // if(img_elem.parentNode.classList.contains('d-none')){
                        //     img_elem.parentNode.classList.remove("d-none");
                        //     reader.onload = function(e){
                        //         mms_state = 1;
                        //         byteCheckViewDisplay(msg_text);
                        //         $(img_elem).attr('src', e.target.result);
                        //     }
                        //     reader.readAsDataURL(elem.files[0]);
                        // }
                        //설정값 입력
                        file_name_elem.value = file_name;
                    }
                }
            }else{
                excel_code(this);
                file_name_elem.value = file_name;
            }
        }
    });
}

// 엑셀 파일 읽어서 변수에 저장
function excel_code(elem){
    var input = elem;
    var reader = new FileReader();
    reader.onload = function(e){
        if(e.target.readyState == FileReader.DONE){
            var data = e.target.result;
            data = new Uint8Array(data);
            var workbook = XLSX.read(data, {type :"array"});
            var sheetName = "";
            workbook.SheetNames.forEach(function(data,idx){
                if(idx == 0){
                    sheetName = data;
                    excel_value = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
                }
            });
        }
    };
    reader.readAsArrayBuffer(input.files[0]);
}

// 엑셀 업로드
function excel_upload(){
    console.log(group_idx);
    if(typeof excel_value != "undefined" && excel_value != null){
        var correct = true;
        var excel_mat_in_name = [];
        var excel_mat_in_price = [];
        var excel_mat_in_amount = [];
        var excel_mat_in_sum = [];
        var excel_mat_in_union = [];
        var excel_mat_in_code = [];
        var excel_mat_in_place = [];
        var excel_bc_in_b_class = [];
        var excel_bc_in_s_class = [];
        var excel_mat_in_stand = [];
        var excel_mat_in_custom = [];

        for(var i in excel_value){
            excel_mat_in_code.push(excel_value[i].mat_in_code);
            excel_mat_in_place.push(excel_value[i].mat_in_place);
            excel_bc_in_b_class.push(excel_value[i].bc_in_b_class);
            excel_bc_in_s_class.push(excel_value[i].bc_in_s_class);
            excel_mat_in_stand.push(excel_value[i].mat_in_stand);
            excel_mat_in_custom.push(excel_value[i].mat_in_custom);
            
            if(typeof excel_value[i].mat_in_name == "undefined" || excel_value[i].mat_in_name == null){
                alert('자재명이 비어있는 행이 있습니다.');
                correct = false;
                break;
            }else{
                excel_mat_in_name.push(excel_value[i].mat_in_name);
            }
            if(typeof excel_value[i].mat_in_price == "undefined" || excel_value[i].mat_in_price == null){
                alert('가격이 비어있는 행이 있습니다.');
                correct = false;
                break;
            }else{
                excel_mat_in_price.push(excel_value[i].mat_in_price);
            }
            if(typeof excel_value[i].mat_in_amount == "undefined" || excel_value[i].mat_in_amount == null){
                alert('수량이 비어있는 행이 있습니다.');
                correct = false;
                break;
            }else{
                excel_mat_in_amount.push(excel_value[i].mat_in_amount);
            }
            if(typeof excel_value[i].mat_in_sum == "undefined" || excel_value[i].mat_in_sum == null){
                alert('총가격이 비어있는 행이 있습니다.');
                correct = false;
                break;
            }else{
                excel_mat_in_sum.push(excel_value[i].mat_in_sum);
            }
            if(typeof excel_value[i].mat_in_union == "undefined" || excel_value[i].mat_in_union == null){
                alert('단위가 비어있는 행이 있습니다.');
                correct = false;
                break;
            }else{
                excel_mat_in_union.push(excel_value[i].mat_in_union);
            }
            
        }
        if(correct == true){
            excel_add_list(excel_mat_in_name, excel_mat_in_price, excel_mat_in_amount, excel_mat_in_sum, excel_mat_in_union, excel_mat_in_code, excel_mat_in_place, excel_bc_in_b_class, excel_bc_in_s_class,excel_mat_in_stand, excel_mat_in_custom);
        }
    }else{
        alert('업로드할 파일을 첨부해주세요');
    }
}

function excel_add_list(mat_in_name, mat_in_price, excel_mat_in_amount, excel_mat_in_sum,excel_mat_in_union,excel_mat_in_code, excel_mat_in_place, excel_bc_in_b_class, excel_bc_in_s_class,excel_mat_in_stand, excel_mat_in_custom){
    if(double_click){
        double_click =false;
        lb.ajax({
            type : "JsonAjaxPost",
            list : {
                ctl : "Addr",
                param1 : "addr_add_excel",
                group_idx : group_idx,
                mat_in_name : JSON.stringify(mat_in_name),
                mat_in_price : JSON.stringify(mat_in_price),
                mat_in_amount : JSON.stringify(excel_mat_in_amount),
                mat_in_sum : JSON.stringify(excel_mat_in_sum),
                mat_in_union : JSON.stringify(excel_mat_in_union),
                excel_mat_in_code : JSON.stringify(excel_mat_in_code),
                excel_mat_in_place : JSON.stringify(excel_mat_in_place),
                excel_bc_in_b_class : JSON.stringify(excel_bc_in_b_class),
                excel_bc_in_s_class : JSON.stringify(excel_bc_in_s_class),
                excel_mat_in_stand : JSON.stringify(excel_mat_in_stand),
                excel_mat_in_custom : JSON.stringify(excel_mat_in_custom),
            },
            action : "index.php",
            havior : function(result){
                double_click = true;
                console.log(result);
                result = JSON.parse(result);
                if(result.result == 1){
                    alert('자재가 등록되었습니다.');
                    $('#receiver_wrap').empty();
                    receiver_count = 0;
                    request_product_list(user_idx);
                }
            }
        });
    }
}


//엑셀 다운로드
var excelHandler ={
    getExcelFileName : function(){
        return "result_table.xlsx";
    },
    getSheetName : function(){
        return "Sheet1";
    },
    getExcelData : function(){
        //Excel 다운시 checkbox 제외시키기
        var clone_table = document.getElementById('receiver_wrap').cloneNode(true);
        var tr = clone_table.querySelectorAll('tr');
        for(var i = 0; i < tr.length; i++){
            tr[i].removeChild(tr[i].querySelector('.check'));
        }
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


 
// 번호 체크
function number_check(elem){
    $(elem).on('propertychange change keyup paste input', function(){
        $(this).val($(this).val().replace(/[^0-9]/g,""));
    })
}


var addr_click_flag = false;

function request_product_list(target){
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
                param1 : "product_list",
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

function open_add_modal(){
    var addr_modal = document.getElementById('addr_modal');
    addr_modal.style.display = "block";
}

function close_add_modal(){
    var addr_modal = document.getElementById('addr_modal');
    addr_modal.style.display = "none";
}

//전체 체크 receiver_check
function all_check(elem){
    var check_elems = document.getElementsByClassName('receiver_check');
    for(var i=0; i<check_elems.length; i++){
        if(elem.checked == true){
            check_elems[i].checked = true;
        }else{
            check_elems[i].checked = false;
        }
    }
}


