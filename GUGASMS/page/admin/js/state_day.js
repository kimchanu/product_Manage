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



    // search_list(mat_code, mat_in_amount, mat_in_name, mat_in_stand);
    
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