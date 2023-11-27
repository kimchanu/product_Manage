$(document).ready(function(){
    addr_group_detail_refresh();
    request_addr_group();
})

var double_click = true;

function request_add_addr_group(type, target){
    var group_name_value = document.getElementById('group_name').value;
    var group_content_value =document.getElementById('group_content').value;

    if(group_name_value == ""){
        alert('주소록 그룹 이름을 입력해주세요.');
    }else{
        if(double_click){
            double_click =false;
            if(type =="modify"){
                lb.ajax({
                    type : "JsonAjaxPost",
                    list : {
                        ctl : "Addr",
                        param1 : "update_group",
                        group_idx : target,
                        group_name : group_name_value,
                        group_content : group_content_value,
                    },
                    action : "index.php",
                    havior : function(result){
                        double_click = true;
                        console.log(result);
                        result = JSON.parse(result);
                        if(result.result == 1){
                            alert('주소록 그룹이 수정되었습니다.');
                            request_addr_group();
                        }
                    }
                });
            }else{
                lb.ajax({
                    type : "JsonAjaxPost",
                    list : {
                        ctl : "Addr",
                        param1 : "add_group",
                        group_name : group_name_value,
                        group_content : group_content_value,
                    },
                    action : "index.php",
                    havior : function(result){
                        double_click = true;
                        console.log(result);
                        result = JSON.parse(result);
                        if(result.result == 1){
                            alert('주소록 그룹이 등록되었습니다.');
                            request_addr_group();
                        }
                    }
                });
            }
            
        }else{
            alert('주소록 등록 중 입니다.');
        }
    }

}

function request_addr_group(){
    if(double_click){
        double_click =false;
        $('#address_wrap').empty();
        addr_group_detail_refresh();
        lb.ajax({
            type : "JsonAjaxPost",
            list : {
                ctl : "Addr",
                param1 : "addr_group_list",
            },
            action : "index.php",
            havior : function(result){
                double_click = true;
                console.log(result);
                result = JSON.parse(result);
                if(result.result == 1){
                    if(result.value.length == 0){
                        alert('주소록 그룹이 비어있습니다.');
                    }else{
                        init_addr_group(result.value);
                    }
                }
            }
        });
    }
}

function request_addr_group_detail(target){
    if(double_click){
        double_click =false;
        lb.ajax({
            type : "JsonAjaxPost",
            list : {
                ctl : "Addr",
                param1 : "addr_group_detail",
                group_idx : target
            },
            action : "index.php",
            havior : function(result){
                double_click = true;
                console.log(result);
                result = JSON.parse(result);
                if(result.result == 1){
                    if(result.value.length == 0){
                        alert('삭제되었거나 없는 그룹입니다.');
                    }else{
                        init_addr_group_detail(result.value);
                    }
                }
            }
        });
    }
}


function request_addr_group_delete(target){
    var result = confirm('주소록 그룹을 삭제하시겠습니까?');
    if(result){
        if(double_click){
            double_click =false;
            lb.ajax({
                type : "JsonAjaxPost",
                list : {
                    ctl : "Addr",
                    param1 : "addr_group_delete",
                    group_idx : target,
                },
                action : "index.php",
                havior : function(result){
                    double_click = true;
                    console.log(result);
                    result = JSON.parse(result);
                    if(result.result == 1){
                        alert('주소록 그룹이 삭제되었습니다.');
                        request_addr_group();
                        
                    }
                }
            });
        }
    }    
}

function init_addr_group_detail(data){
    var addr_plus_btn = document.getElementById('addr_plus_btn');
    var addr_minus_btn = document.getElementById('addr_minus_btn');
    document.getElementById('group_name').value = data[0].group_name;

    if(typeof data[0].content != "undefined" && typeof data[0].content != undefined && data[0].content != null && data[0].content !="null"){
        document.getElementById('group_content').value = data[0].content;
    }else{
        document.getElementById('group_content').value = "";
    }
    
    addr_plus_btn.onclick = function(){
        request_add_addr_group('modify', data[0].idx);
    }
    addr_minus_btn.onclick = function(){
        request_addr_group_delete(data[0].idx);
    }
}

function addr_group_detail_refresh(){
    document.getElementById('group_name').value = "";
    document.getElementById('group_content').value = "";
    var addr_plus_btn = document.getElementById('addr_plus_btn');
    var addr_minus_btn = document.getElementById('addr_minus_btn');
    addr_plus_btn.onclick = function(){
        request_add_addr_group('add');
    }
    addr_minus_btn.onclick = function(){
        alert('삭제할 대상을 선택해주세요');
    }
}

function init_addr_group(data){
    lb.auto_view({
        wrap : "address_wrap",
        copy : "address_copy",
        attr: '["data-attr"]',
        json: data,
        havior: function (elem, data, name, copy_elem) { 
            if (copy_elem.getAttribute('data-copy') == "address_copy") {
                copy_elem.setAttribute('data-copy', '');
            }
            if(name == "group_name"){
                elem.innerHTML = "<i class = 'fas fa-folder'></i>"+data.group_name;
            }else if(name == "group_content"){
                if(typeof data.content != "undefined" && typeof data.content != undefined && data.content != null && data.content !="null"){
                    elem.innerHTML = data.content;
                }
            }else if(name == "group_plus"){
                var btn = document.createElement('button');
                btn.innerHTML = "수정";
                btn.style.cursor ="pointer";
                btn.style.border = "1px solid #e5e5e5";
                btn.style.borderRadius = "3px !important";
                btn.onclick = function(){
                    request_addr_group_detail(data.idx);
                }
                elem.appendChild(btn);
                
            }
        }
    })
}

