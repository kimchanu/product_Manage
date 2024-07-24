var double_click = true;
var receiver_count = 0;
var recevier_index  = 0;
$(document).ready(function(){
    code_init();
    $('#mat_in_code').keypress(function(event) {
    if (event.which == 13) { // 엔터 키의 키 코드
        search();
    }
    });

    $('#input_date1').click(function() {
        $('.datepicker').datepicker().datepicker('show');
    });

    $('.datepicker').datepicker({
        dateFormat: 'yy-mm-dd',
        onSelect: function(dateText) {
            $('.date-cell').text(dateText);
            all_date_input = dateText;
        }
    })
});

var dupli;
var all_date_input;
function abc(data) {
    // 중복 제거 후 객체 배열로 변환
    const uniqueCodes = [...new Set(data.map(item => item.mat_in_code))].map(code => {
        return { label: code, value: code };
    });
    dupli = uniqueCodes.map(codeObj => codeObj.value);

    // console.log(dupli);

    // jQuery UI Autocomplete 설정
    $("#mat_in_code").autocomplete({
        source: function(request, response) {
            const results = $.ui.autocomplete.filter(uniqueCodes, request.term);
            // console.log(results);
            response(results.slice(0, 5)); // 최대 10개의 항목만 표시
        },
        minLength: 2, // 최소 두 글자 입력 후 자동완성 시작
        select: function(event, ui) {
            // console.log("선택된 자재코드:", ui.item.value);
            // 검색 결과를 처리하는 코드 추가
        }
    });

    // 입력 길이 제한 설정
    $("#mat_in_code").on('input', function() {
        const maxLength = 6;
        const currentValue = $(this).val();
        if (currentValue.length > maxLength) {
            alert('자재코드는 6글자를 초과할 수 없습니다.');
            $(this).val(currentValue.substring(0, maxLength));
        }
    });
}



$(document).on('click', '#getRowValue', function() {
    var allRows = [];
    $('#table_elem tbody tr').each(function() {
        var cellValue = $(this).find('td').eq(0).val(); // 자재 id
        var selectValue = $(this).find('td').eq(1).find('select').val();
        console.log(all_date_input);
        allRows.push([cellValue, selectValue]);
        
    });
    console.log(allRows);
    if(allRows.length === 0){
        alert('아무것도 입력하지 않으셨습니다');
        return;
    }
    condition = window.confirm("정말로 저장하시겠습니까? 되돌릴 수 없습니다.");
    if(condition && (allRows[0][1] !== undefined)){
        update_b_class(allRows);
    }
    if(condition && (all_date_input !== undefined)){
        date_update(allRows);
    }

    search();
});



function update_b_class(allRows){
    if(allRows[0][1] == undefined){
        alert('dfafdas');
        return;
    }
    for(var i=0; i<allRows.length; i++){
        console.log(allRows[i][0], allRows[i][1]);
        lb.ajax({
            type : "JsonAjaxPost",
            list : {
                ctl : "Addr",
                param1 : "update_b_class",
                incom_id : allRows[i][0],
                bc_in_b_class : allRows[i][1],
            },
            action : "index.php",
            havior : function(result){
                $('#receiver_wrap').empty();
                console.log(result);
            }
        });
            
    }
}

function date_update(allRows){
    if(all_date_input == undefined){
        alert('dfafdas');
        return;
    }
    for(var i=0; i<allRows.length; i++){
        console.log(allRows[i][0], allRows[i][1]);
        lb.ajax({
            type : "JsonAjaxPost",
            list : {
                ctl : "Addr",
                param1 : "date_update",
                incom_id : allRows[i][0],
                date : all_date_input,
            },
            action : "index.php",
            havior : function(result){
                $('#receiver_wrap').empty();
                console.log(result);
            }
        });
            
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
                    elem.value = data.incom_id;
                }
                if(name == "mat_in_sum"){
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

function search(){
    var mat_in_code = document.getElementById('mat_in_code').value;
    console.log(mat_in_code);
    if(mat_in_code == undefined || mat_in_code == null || mat_in_code == ""){
        alert('자재를 입력해주세요');
        return;
    }
    const isInData = dupli.includes(mat_in_code);
    console.log(isInData)
    if (!isInData) {
        alert('없는 자재코드입니다.');
        return;
    }
    search_list(mat_in_code);
}

function search_list(mat_in_code){
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
                mat_in_code : mat_in_code,
            },
            action : "index.php",
            havior : function(result){
                double_click = true;
                // console.log(result);
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

function code_init(){
    var target = group_idx;
    if(double_click){
        double_click = false;
        $('#receiver_wrap').empty();
        lb.ajax({
            type : "JsonAjaxPost",
            list : {
                ctl : "Addr",
                param1 : "product_list4",
                idx : target,
            },
            action : "index.php",
            havior : function(result){
                double_click = true;
                result = JSON.parse(result);
                if(result.result == 1){
                    if(result.value.length == 0){
                        alert('실패');
                    }else{
                        abc(result.value);
                    }
                }
            }
        })
    }else{
        alert("호출중입니다.");
    }
}

