var double_click = true;
var receiver_count = 0;
var recevier_index  = 0;



$(document).ready(function(){
    // request_product_list(user_idx);

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
    });  
    input_file_check(lb.getElem('excel_upload'),["xlsx"],"excel");
});

function addCommas(value) {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
    reader.onload = function(e) {
        if (e.target.readyState == FileReader.DONE) {
            var data = e.target.result;
            data = new Uint8Array(data);
            var workbook = XLSX.read(data, { type: "array" });
            var sheetName = "내부관리용(수불대장)"; // 시트 이름을 지정
            var excelData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

            // 서버로 전송하는 함수 호출
            // processAndSendData(excelData);
            excel_value = excelData;
        }
    };
    reader.readAsArrayBuffer(input.files[0]);
}

// 엑셀 업로드


function processAndSendData() {
    // 데이터 처리 및 전송
    var processedData = excel_value.slice(6).map(row => ({
        no: row[0] || '',
        자재코드: row[1] || '',
        위치: row[2] || '',
        대분류: row[3] || '',
        소분류: row[4] || '',
        품명: row[5] || '',
        규격: row[6] || '',
        제조사: row[7] || '',
        거래처: row[8] || '',
        단위: row[9] || '',
        단가: row[10] ? parseFloat(row[10].replace(/,/g, '').trim()) || 0 : 0, // 문자열로 된 금액을 숫자로 변환, 값이 없으면 0
        입고현황: (() => {
            const data = [];
            const carryOver = parseFloat(row[11] && row[11].trim ? row[11].trim() : 0);  // 이월 누계
            data.push(carryOver);
    
            for (let i = 12; i < 36; i += 2) {
                const amount = parseFloat(row[i] && row[i].trim ? row[i].trim() : 0); // 월별 데이터
                data.push(amount);
            }
            return data;
        })(),
    
        출고현황: (() => {
            const data = [];
            const carryOver = parseFloat(row[40] && row[40].trim ? row[40].trim() : 0);  // 이월 누계
            data.push(carryOver);
    
            for (let i = 41; i < 65; i += 2) {
                const amount = parseFloat(row[i] && row[i].trim ? row[i].trim() : 0); // 월별 데이터
                data.push(amount);
            }
            return data;
        })(),
    }));
    console.log(processedData);
    lb.ajax({
        type: 'JsonAjaxPost',
        list: {
            ctl: 'Addr',
            param1: 'uploadExcel',
            excelData: JSON.stringify(processedData)
        },
        action: 'index.php',
        havior: function(result) {
            // PHP에서 반환된 JSON을 파싱
            try {
                // 서버에서 받은 응답을 JSON으로 파싱
                var response = JSON.parse(result);
                console.log("PHP Response:", response);

                // 각각의 SQL 쿼리 및 결과를 확인
                if (response.sqlMatComing) {
                    console.log("SQL MatComing Query:", response.sqlMatComing);
                }

                if (response.sqlInput) {
                    console.log("SQL Input Query:", response.sqlInput);
                }

                if (response.sqlOutput) {
                    console.log("SQL Output Query:", response.sqlOutput);
                }

                if (response.status === "success") {
                    console.log("Data successfully inserted!");
                } else {
                    console.error("Error Status:", response.status);
                    if (response.error) {
                        console.error("Error Details:", response.error);
                    }
                }
            } catch (e) {
                // JSON 파싱 중 오류 발생시 처리
                console.error("Failed to parse response:", e);
                console.error("Raw response from server:", result);
            }
        }
    });
}

//엑셀 다운로드
// var excelHandler ={
//     getExcelFileName : function(){
//         return "result_table.xlsx";
//     },
//     getSheetName : function(){
//         return "Sheet1";
//     },
//     getExcelData : function(){
//         //Excel 다운시 checkbox 제외시키기
//         var clone_table = document.getElementById('receiver_wrap').cloneNode(true);
//         var tr = clone_table.querySelectorAll('tr');
//         for(var i = 0; i < tr.length; i++){
//             tr[i].removeChild(tr[i].querySelector('.check'));
//         }
//         return clone_table;
//     },
//     getWorksheet : function(){
//         return XLSX.utils.table_to_sheet(this.getExcelData());
//     }
// }

// Excel export를 위한 함수
// function exportExcel() {
//     lb.ajax({
//         type: 'JsonAjaxPost',
//         list: {
//             ctl: 'Addr',
//             param1: 'export_excel',
//         },
//         action: 'index.php',
//         havior: function(response) {
//             var parsedResponse = JSON.parse(response);
//             console.log("Parsed Response:", parsedResponse);  // 파싱된 응답을 확인
//             response = parsedResponse;
//             try {
//                 if (response.result === 1 && response.excelData && response.excelData.length > 0) {
//                     var wb = XLSX.utils.book_new();
//                     var excelData = response.excelData.map(row => 
//                         row.map(cell => cell !== null ? cell : '')
//                     );
//                     var ws = XLSX.utils.aoa_to_sheet(excelData);
//                     XLSX.utils.book_append_sheet(wb, ws, "Exported Data");
//                     var wbout = XLSX.write(wb, {bookType: 'xlsx', type: "binary"});
//                     saveAs(new Blob([s2ab(wbout)], {type: "application/octet-stream"}), "exported_data.xlsx");
//                     console.log("Excel file generated and saved.");
//                 } else {
//                     console.error("Unexpected response or no data to export:", response);
//                 }
//             } catch (error) {
//                 console.error("Error during Excel export:", error);
//             }
//         }
//     });
// }

function exportExcel() {
    lb.ajax({
        type: 'JsonAjaxPost',
        list: {
            ctl: 'ExcelHandle',
            param1: 'export_excel', // PHP에서 엑셀 파일을 생성하고 응답
        },
        action: 'index.php',
        havior: function(response) {
            try {
                // 엑셀 파일이 바로 브라우저로 전송되기 때문에 추가 작업 불필요
            } catch (error) {
                console.error("Error during Excel export:", error);
            }
        }
    });
}

function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i < s.length; i++) {
        view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
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
                else if(name == "mat_in_sum"){
                    let result11 = data[name].toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
                    result11 = result11.replace(/\.00$/, "");

                    elem.innerHTML = result11;
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

