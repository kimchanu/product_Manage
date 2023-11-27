$(document).ready(function(){
    request_msg_box_list();
})

var double_click = true;

function request_msg_box_list(){
    if(double_click){
        double_click = false;
        $('#msg_box_wrap').empty();
        lb.ajax({
            type : "JsonAjaxPost",
            list : {
                ctl : "Msg",
                param1 : "msg_box_list",
            },
            action : "index.php",
            havior : function(result){
                double_click = true;
                console.log(result);
                result = JSON.parse(result);
                if(result.result == 1){
                    if(result.value.length == 0){
                        alert('메시지 그룹이 비어있습니다.');
                    }else{
                        init_msg_box_list(result.value);
                    }
                }
            }
        });
    }
}

function init_msg_box_list(data){
    lb.auto_view({
        wrap : "msg_box_wrap",
        copy : "msg_box_copy",
        attr: '["data-attr"]',
        json: data,
        havior: function (elem, data, name, copy_elem) { 
            if (copy_elem.getAttribute('data-copy') == "msg_box_copy") {
                copy_elem.setAttribute('data-copy', '');
                copy_elem.style.cursor = "pointer";
                copy_elem.onclick =function(){
                    request_msg_box_detail(data.idx);
                }
            }
            if(name == "name"){
                elem.innerHTML = "<i class = 'fas fa-folder'></i>"+data.msg_box_name;
            }else if(name == "content"){
                elem.innerHTML = data.msg_box_content;
            }
        }
    })
}


function request_msg_box_detail(target){
    lb.ajax({
        type : "JsonAjaxPost",
        list : {
            ctl : "Msg",
            param1 : "msg_box_detail",
            box_idx : target,
        },
        action : "index.php",
        havior : function(result){
            double_click = true;
            console.log(result);
            result = JSON.parse(result);
            if(result.result == 1){
                if(result.value.length == 0){
                    alert('삭제되었거나 없는 메시지함입니다.');
                }else{
                    init_msg_box_detail(result.value[0]);
                }
            }
        }
    });
}

function init_msg_box_detail(data){
    var msg_box_name =document.getElementById('msg_box_name');
    var msg_box_content = document.getElementById('msg_box_content');
    var register_btn = document.getElementById('register_btn');
    var del_btn = document.getElementById('del_btn');

    msg_box_name.value = data.msg_box_name;
    msg_box_content.value = data.msg_box_content;

    register_btn.onclick = function(){
        request_msg_box_add('modify',data.idx);
    }
    del_btn.onclick = function(){
        request_msg_box_delete(data.idx);
    }
}

function init_add_input(){
    var msg_box_name =document.getElementById('msg_box_name');
    var msg_box_content = document.getElementById('msg_box_content');
    var register_btn = document.getElementById('register_btn');

    msg_box_name.value = "";
    msg_box_content.value = "";

    register_btn.onclick = function(){
        request_msg_box_add('add');
    }
}


function request_msg_box_add(type, target){
    if(double_click){
        double_click = false;
        var name_value = document.getElementById('msg_box_name').value;
        var content_value = document.getElementById('msg_box_content').value;
        if(name_value == ""){
            alert('메시지함 이름을 입력해주세요');
            double_click = true;
        }else{
            if(type == "add"){
                lb.ajax({
                    type : "JsonAjaxPost",
                    list : {
                        ctl : "Msg",
                        param1 : "msg_box_add",
                        name : name_value,
                        content : content_value,
                    },
                    action : "index.php",
                    havior : function(result){
                        double_click = true;
                        console.log(result);
                        result = JSON.parse(result);
                        if(result.result == 1){
                            alert('메시지함이 등록되었습니다');
                            request_msg_box_list();
                        }
                    }
                });
            }else if(type =="modify"){
                lb.ajax({
                    type : "JsonAjaxPost",
                    list : {
                        ctl : "Msg",
                        param1 : "msg_box_modify",
                        box_idx : target,
                        name : name_value,
                        content : content_value,
                    },
                    action : "index.php",
                    havior : function(result){
                        double_click = true;
                        console.log(result);
                        result = JSON.parse(result);
                        if(result.result == 1){
                            alert('메시지함이 수정되었습니다');
                            request_msg_box_list();
                        }
                    }
                });
            }
        }
    }else{
        alert('메시지함을 등록중입니다.');
    }
}


function request_msg_box_delete(target){
    if(typeof target != "undefined" && typeof target != undefined && target != null && target != "null"){
        var confirm_result = confirm("해당 메시지함을 삭제하시겠습니까? 삭제하면 모든 메시지가 삭제됩니다.");
        if(confirm_result){
            lb.ajax({
                type : "JsonAjaxPost",
                list : {
                    ctl : "Msg",
                    param1 : "msg_box_delete",
                    box_idx : target,
                },
                action : "index.php",
                havior : function(result){
                    double_click = true;
                    console.log(result);
                    result = JSON.parse(result);
                    if(result.result == 1){
                        alert('메시지함이 삭제되었습니다.');
                        request_msg_box_list();
                        init_add_input();
                    }
                }
            });
        }        
    }else{
        alert('메시지함을 선택해주세요');
    }
}