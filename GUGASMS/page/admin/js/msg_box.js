$(document).ready(function(){
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
            if(name == "modify"){
                elem.style.cursor = "pointer";
                elem.onclick = function(){
                    user_detail(data);
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
    // var department = document.getElementById('send_kind');
    var mat_in_amount = document.getElementById('mat_in_amount').value;
    var mat_in_name = document.getElementById('mat_in_name').value;
    var mat_in_stand = document.getElementById('mat_in_stand').value;
    if(typeof mat_code == undefined || typeof mat_code == null){
        mat_code = "";
    }
    console.log(mat_code, mat_in_amount, mat_in_name);
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
        // console.log(target);
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
                console.log(result);
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

function init_search(){
    var mat_in_code = document.getElementById('mat_in_code');
    var mat_in_name = document.getElementById('mat_in_name');
    var mat_in_stand = document.getElementById('mat_in_stand');
    var mat_in_amount = document.getElementById('mat_in_amount');

    mat_in_code.value = "";
    mat_in_name.value = "";
    mat_in_stand.value = "";
    mat_in_amount.value = "1";
    request_product_list(1);
}

function user_detail(data){
    var product_code = document.getElementById('product_code');
    var product_b_class = document.getElementById('product_b_class');
    var product_name = document.getElementById('product_name');
    var product_stand =document.getElementById('product_stand');
    var product_union = document.getElementById('product_union');
    var product_price = document.getElementById('product_price');
    var product_amount = document.getElementById('product_amount');
    var product_sum = document.getElementById('product_sum');
    btnopen = document.getElementById('btnopen');
    product_code.value = data.mat_in_code;
    product_code.setAttribute('readonly', true);
    product_b_class.value = data.bc_in_b_class;
    product_name.value = data.mat_in_name;
    product_stand.value = data.mat_in_stand;
    product_union.value = data.mat_in_union;
    product_price.value = data.mat_in_price;
    product_price.setAttribute('readonly', true);
    product_amount.value = data.mat_in_amount;

    let result11 = data.mat_in_sum.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
    result11 = result11.replace(/\.00$/, "");
    product_sum.value = result11;
    product_sum.setAttribute('readonly', true);
    

    btnopen.onclick = function(){
        user_modify(data.incom_id);
    }
}

function open_add_modal(){
    var addr_modal = document.getElementById('addr_modal');
    addr_modal.style.display = "block";
}


function user_modify(target){
    if(double_click){
        double_click = false;
        var product_amount = document.getElementById('product_amount').value;
        var product_sum = document.getElementById('product_sum').value;
        product_sum = product_sum.replace(/,/g, "");
        product_sum = parseInt(product_sum);
        console.log(product_amount);
        if(product_amount.value == ""){
            alert('수량을 입력해주세요');
            double_click = true;
        }else{
            lb.ajax({
                type : "JsonAjaxPost",
                list : {
                    ctl : "Addr",
                    param1 : "mat_modify",
                    incom_id : target,
                    mat_in_amount : product_amount,
                    mat_in_sum : product_sum,
    
                },
                action : "index.php",
                havior : function(result){
                    double_click = true;
                    console.log(result);
                    result = JSON.parse(result);
                    if(result.result == 1){
                        alert('수정되었습니다.');
                        search();
                    }else{
                        alert('수정 실패');
                    }
                }
            })
        }
    }else{
        alert('등록중입니다.');
    }
}