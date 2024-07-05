$(document).ready(function(){
});

$(document).on('change','.input-text', function(){
    var parentElement = $(this).parent();
    var price = $(this).parent().prev().prev().html();
    var now_amount = $(this).parent().prev().html();
    var sonn = $(this).parent().next();
    parentElement.addClass("error");
    sonn.addClass("error");

    update_amount = now_amount - $(this).val();
    // console.log(update_amount);
    price = price.replace(",", "");
    let summ = update_amount * parseInt(price);
    summ = summ.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
    // console.log(summ);
    $(this).parent().next().html(summ);
});


var list_result1 = [];
var update_amount = 0;

$(document).on('click', '#getRowValue', function() {
        var allRows = [];
        var allRows2 = [];
        var date = $('#date1').val();
        var comment = $('#comment').val();
        if(window.confirm("정말로 저장하시겠습니까? 되돌릴 수 없습니다.")){
        $('#table_elem2 tbody tr').each(function() {
            var rowValues = [];
            var rowValues2 = [];
            var cellValue = $(this).find('td:eq(4) input').val(); // 사용수량
            var cellValue2 = $(this).find('td').eq(5).text(); // 남은재고금액
            var cellValue3 = $(this).find('td').eq(3).text(); // 단가
            console.log(parseInt(cellValue2.replace(",", "")));
            rowValues.push((cellValue3-cellValue), parseInt(cellValue2.replace(",", "")));
            rowValues2.push(cellValue, date, comment);
            allRows2.push(rowValues2);
            allRows.push(rowValues);
        });
        
        if (!date || !comment) {
            alert('날짜 또는 출고내용을 입력해 주세요.');
        } else {
            console.log(list_result1, user_idx, allRows2); // 선택한 날짜 값을 콘솔에 출력
        update_product(allRows);
        product_output(allRows2);
        list_result1 = [];
        }
    }
        else{
            let a = 1;
        }
        
        
});

function product_output(allRows2){
    for(var i=0; i<list_result1.length; i++){
        lb.ajax({
            type : "JsonAjaxPost",
            list : {
                ctl : "Addr",
                param1 : "output_insert",
                idx : list_result1[i],
                user_idx : user_idx,
                remain : allRows2[i][0],
                date : allRows2[i][1],
                comment : allRows2[i][2],
            },
            action : "index.php",
            havior : function(result){
                $('#receiver_wrap3').empty();
                console.log(result);
                
            }
        });
            
    }
}

function update_product(allRows){
    for(var i=0; i<list_result1.length; i++){
        console.log(list_result1[i], allRows[i][0], allRows[i][1]);
        lb.ajax({
            type : "JsonAjaxPost",
            list : {
                ctl : "Addr",
                param1 : "mat_modify",
                incom_id : list_result1[i],
                mat_in_amount : allRows[i][0],
                mat_in_sum : allRows[i][1],
            },
            action : "index.php",
            havior : function(result){
                $('#receiver_wrap').empty();
                console.log(result);
            }
        });
            
    }
}

   $(document).on('change', 'input[id="myCheckbox"]', function () {
        if (this.checked) {
            list_result1.push($(this).val());
            let list_aa = [];
            list_aa.push($(this).val());
            lb.ajax({
                type : "JsonAjaxPost",
                list : {
                    ctl : "Addr",
                    param1 : "product_to_modify",
                    idx : JSON.stringify(list_aa),
                },
                action : "index.php",
                havior : function(result){
                    double_click = true;
                    if(result.total != 0){
                        result = JSON.parse(result);
                    }else{
                        alert('등록 실패');
                    }
                    data = result.value;
                    // $('#receiver_wrap3').empty();
                    lb.auto_view({
                        wrap : "receiver_wrap3",
                        copy : "receiver_copy2",
                        attr: '["data-attr"]',
                        json: data,
                        havior: function (elem, data, name, copy_elem) { 
                            if (copy_elem.getAttribute('data-copy') == "receiver_copy2") {
                                copy_elem.setAttribute('data-copy', '');
                                copy_elem.id = 0;
                            }
                            if(name == "check_box"){
                                let a = 1;
                        }
                            else{
                                    if(typeof data[name] != undefined && typeof data[name] != "undefined" && data[name] != null && data[name] != "null"){
                                        elem.innerHTML = data[name];
                                }
                                    if(name == "mat_in_sum"){
                                    let result11 = data[name].toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
                                    result11 = result11.replace(/\.00$/, "");
                
                                    elem.innerHTML = result11;
                                }
                            }
                        },
                    })
                }
            })
            console.log(list_result1);
        }
        if(!this.checked){
            list_result1 = list_result1.filter((num) => num !== $(this).val());
            if(list_result1.length == 0){
                $('#receiver_wrap3').empty();
                let aa = 1;
            }
            else{
                let table = document.getElementById('table_elem2');
            table.deleteRow(-1);
            console.log(table.rows[1]);
            }
        }
        
    });


var double_click = true;
var receiver_count = 0;
var recevier_index  = 0;

function request_product_list(target){
    target = group_idx;
    if(double_click){
        double_click = false;
        $('#receiver_wrap').empty();
        addr_click_flag = true;
        receiver_count = 0;
        var total_elem = document.getElementById('receiver_total');
        total_elem.innerHTML ="<i>Total</i>"+receiver_count;
        console.log(target);
        lb.ajax({
            type : "JsonAjaxPost",
            list : {
                ctl : "Addr",
                param1 : "product_list2",
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
                elem.setAttribute('id', 'myCheckbox');
                elem.value = data.incom_id;
        }
            else{
                if(typeof data[name] != undefined && typeof data[name] != "undefined" && data[name] != null && data[name] != "null"){
                    elem.innerHTML = data[name];
                }


                if(name == "mat_in_code"){
                    receiver_count++;
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

    var mat_code = document.getElementById('mat_in_code').value;
    var mat_in_amount = document.getElementById('mat_in_amount').value;
    var mat_in_name = document.getElementById('mat_in_name').value;
    var mat_in_stand = document.getElementById('mat_in_stand').value;
    if(typeof mat_code == undefined || typeof mat_code == null){
        mat_code = "";
    }
    search_list(mat_code, mat_in_amount, mat_in_name, mat_in_stand);
    
}

function search_list(mat_code, department, mat_in_name, mat_in_stand){
    var target = group_idx;
    if(double_click){
        double_click = false;
        $('#receiver_wrap').empty();
        addr_click_flag = true;
        receiver_count = 0;
        var total_elem = document.getElementById('receiver_total');
        total_elem.innerHTML ="<i>Total</i>"+receiver_count;
        lb.ajax({
            type : "JsonAjaxPost",
            list : {
                ctl : "Addr",
                param1 : "product_list3",
                idx : target,
                mat_in_code : mat_code,
                mat_in_amount : department,
                mat_in_name : mat_in_name,
                mat_in_stand : mat_in_stand,
            },
            action : "index.php",
            havior : function(result){
                double_click = true;
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