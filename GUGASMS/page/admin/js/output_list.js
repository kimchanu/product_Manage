function search(){

    const startDate = document.getElementById('start_date').value;
    const endDate = document.getElementById('end_date').value;
    if (!startDate || !endDate) {
        alert('Please select both start and end months.');
        return;
    }
    if (startDate > endDate) {
        alert('Start month cannot be after end month.');
        return;
    }
    search_list(startDate, endDate);
    
}
var receiver_count = 0;

function search_list(startDate, endDate){
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
                param1 : "product_list2",
                idx : target,
                startDate : startDate,
                endDate : endDate,
            },
            action : "index.php",
            havior : function(result){
                double_click = true;
                result = JSON.parse(result);
                console.log(result);
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