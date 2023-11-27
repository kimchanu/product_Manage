$(document).ready(function(){
    request_msg_box();
    
    s_char_input("s_char");
    s_char_input("imo");
})

// 1: sms 3:mms(lms)
var send_flag = 1;

var mms_state = 0;
var byte = 0;

var double_click = true;

function request_msg_box(){
    if(double_click){
        double_click = false;
        $(".loading").fadeIn();
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
                        $(".loading").fadeOut();
                    }else{
                        init_msg_box_list(result.value);
                    }
                }
            }
        })
    }
}

function request_msg_list(target){
    // var all_check_msg = document.getElementById('all_check_msg');
    var search_name = document.getElementById('search_name');
    var search_content = document.getElementById('search_content');
    if(double_click){
        double_click = false;
        $(".loading").fadeIn();
        msg_count = 0;
        $('#msg_wrap').empty();
        // all_check_msg.checked = false;
        lb.ajax({
            type : "JsonAjaxPost",
            list : {
                ctl : "Msg",
                param1 : "msg_list",
                box_idx : target,
                search_name : search_name.value,
                search_content : search_content.value,
            },
            action : "index.php",
            havior : function(result){
                double_click = true;
                console.log(result);
                result = JSON.parse(result);
                if(result.result == 1){
                    if(result.value.length == 0){
                        alert('작성된 메시지가 없습니다.');
                        $(".loading").fadeOut();
                        var total_elem = document.getElementById('total_elem');
                        total_elem.innerHTML = "<i>Total</i>"+msg_count;
                    }else{
                        init_msg_list(result.value);
                    }
                }
            }
        })
    }
}

var msg_count = 0;

function init_msg_list(data){
    lb.auto_view({
        wrap : "msg_wrap",
        copy : "msg_copy",
        attr: '["data-attr"]',
        json: data,
        havior: function (elem, data, name, copy_elem) { 
            if (copy_elem.getAttribute('data-copy') == "msg_copy") {
                copy_elem.setAttribute('data-copy', '');
                // copy_elem.style.cursor = "pointer";
                copy_elem.id = "msg_copy_target"+data.idx;
            }
            if(name == "name"){
                elem.innerHTML = data.msg_name;
                // elem.onclick = function(){
                //     open_modal(data,'modify');
                // }
            }else if(name == "check_box"){
                elem.value = data.idx;
                elem.setAttribute('class','msg_check_box');
            }else if(name == "content"){
                // elem.style.overflow = "hidden";
                // elem.style.whiteSpace = "nowrap";
                // elem.style.textOverflow = "ellipsis";
                if(typeof data.msg_content != "undefined" && typeof data.msg_content != undefined && data.msg_content != null && data.msg_content !="null"){
                    elem.innerHTML = data.msg_content;
                }
            }else if(name == "modify_btn"){
                elem.onclick = function(){
                    open_modal(data,'modify');
                }
                msg_count++;
            }else if(name == "del_btn"){
                elem.onclick = function(){
                    single_del(data.idx);
                }
            }
        },
        end : function(){
            var total_elem = document.getElementById('total_elem');
            total_elem.innerHTML = "<i>Total</i>"+msg_count;
            $(".loading").fadeOut();
        }
    })
}

function single_del(target){
    if(double_click){
        double_click = false;
        var confirm_result = confirm('메시지를 삭제하시겠습니까?');
        if(confirm_result){
            lb.ajax({
                type : "JsonAjaxPost",
                list : {
                    ctl : "Msg",
                    param1 : "msg_single_del",
                    target_idx : target,
                },
                action : "index.php",
                havior : function(result){
                    double_click = true;
                    console.log(result);
                    result = JSON.parse(result);
                    if(result.result == 1){
                        alert('메시지 삭제를 성공했습니다.');
                        $('#msg_copy_target'+target).remove();
                        msg_count = msg_count -1;
                        var total_elem = document.getElementById('total_elem');
                        total_elem.innerHTML = "<i>Total</i>"+msg_count;
                        $(".loading").fadeOut();
                    }else{
                        alert('메시지 삭제를 실패했습니다.');
                    }
                }
            })
        }
        
    }
}


function init_msg_box_list(data){
    var open_modal_btn = document.getElementById('open_modal_btn');
    var all_delete_elem = document.getElementById('all_delete');
    var select_delete_elem = document.getElementById('select_delete');
    var search_btn = document.getElementById('search_btn');
    var search_init_btn = document.getElementById('search_init_btn');

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
                    request_msg_list(data.idx);
                    request_msg_box_detail(data.idx, copy_elem);
                    all_delete_elem.onclick = function(){
                        all_delete(data.idx);
                    }
                    select_delete_elem.onclick = function(){
                        select_delete(data.idx);
                    }
                    open_modal_btn.onclick = function(){
                        open_modal(data);
                    }
                    search_btn.onclick = function(){
                        search(data.idx);
                    }
                    search_init_btn.onclick = function(){
                        search_init(data.idx);
                    }

                    // var folder_icon_elem = this.children[0].children[0].children[0];
                    // var all_folder_icon_elems = document.getElementsByClassName('out');
                    // for (var i= 0; i<all_folder_icon_elems.length; i++){
                    //     var all_folder_icons = all_folder_icon_elems[i].children[0].children[0].children[0];
                    //     if(all_folder_icons.classList.contains('fa-folder-open')){
                    //         all_folder_icons.classList.remove('fa-folder-open');
                    //         all_folder_icons.classList.add('fa-folder');
                    //     }
                    // }
                    // if(folder_icon_elem.classList.contains('fa-folder')){
                    //     folder_icon_elem.classList.remove('fa-folder');
                    //     folder_icon_elem.classList.add('fa-folder-open');
                    // }else if(folder_icon_elem.classList.contains('fa-folder-open')){
                    //     folder_icon_elem.classList.remove('fa-folder-open');
                    //     folder_icon_elem.classList.add('fa-folder');
                    // }

                }
            }
            if(name == "name"){
                elem.innerHTML = "<i class = 'fas fa-folder select_folder'></i>"+data.msg_box_name;
            }else if(name == "content"){
                if(typeof data.msg_content != "undefined" && typeof data.msg_content != undefined && data.msg_content != null && data.msg_content !="null"){

                }
                elem.innerHTML = data.msg_box_content;
            }
        },
        end : function(){
            $(".loading").fadeOut();
            
        }
    })
}

function request_register_msg(target){
    var msg_content = document.getElementById('msg_content');
    var msg_name = document.getElementById('msg_name');

    if(double_click){
        double_click = false;
        if( msg_name.value == ""){
            alert('메시지 설명을 입력해주세요');
        }else if(msg_content.value == ""){
            alert('메시지 내용을 입력해주세요');
        }else{
            lb.ajax({
                type : "JsonAjaxPost",
                list : {
                    ctl : "Msg",
                    param1 : "add_msg",
                    box_idx : target,
                    msg_name : msg_name.value,
                    msg_content : msg_content.value,
                },
                action : "index.php",
                havior : function(result){
                    double_click = true;
                    console.log(result);
                    result = JSON.parse(result);
                    if(result.result == 1){
                        alert('메시지를 등록했습니다.');
                        close_modal();
                        request_msg_list(target);
                    }
                }
            })
        }
    }else{
        alert('메시지를 등록중입니다.');
    }
}

function request_update_msg(target){
    var msg_content = document.getElementById('msg_content');
    var msg_name = document.getElementById('msg_name');

    if(double_click){
        double_click = false;
        if( msg_name.value == ""){
            alert('메시지 설명을 입력해주세요');
        }else if(msg_content.value == ""){
            alert('메시지 내용을 입력해주세요');
        }else{
            lb.ajax({
                type : "JsonAjaxPost",
                list : {
                    ctl : "Msg",
                    param1 : "update_msg",
                    idx : target,
                    msg_name : msg_name.value,
                    msg_content : msg_content.value,
                },
                action : "index.php",
                havior : function(result){
                    double_click = true;
                    console.log(result);
                    result = JSON.parse(result);
                    if(result.result == 1){
                        alert('메시지를 수정했습니다.');
                        close_modal();
                        request_msg_list(result.target);
                    }
                }
            })
        }
    }else{
        alert('메시지를 수정중입니다.');
    }
}


//전체 체크
function all_check(elem){
    var input = elem.children[0];
    
    var msg_check_box = document.getElementsByClassName('msg_check_box');
    for(var i = 0; i<msg_check_box.length; i++){
        if(input.checked == true){
            msg_check_box[i].checked = true;
        }else{
            msg_check_box[i].checked = false;
        }    
    }
}

function all_delete(target){
    if(typeof target != "undefined" && typeof target != undefined && target != null && target != "null"){
        var confirm_result = confirm('메시지함의 모든 메시지를 삭제하시겠습니까?');
        if(confirm_result){
            lb.ajax({
                type : "JsonAjaxPost",
                list : {
                    ctl : "Msg",
                    param1 : "all_delete_msg",
                    box_idx : target,
                },
                action : "index.php",
                havior : function(result){
                    double_click = true;
                    console.log(result);
                    result = JSON.parse(result);
                    if(result.result == 1){
                        alert('메시지함을 비웠습니다.');
                        msg_count = 0;
                        var total_elem = document.getElementById('total_elem');
                        total_elem.innerHTML = "<i>Total</i>"+msg_count;
                        $('#msg_wrap').empty();
                    }
                }
            })
        }
    }else{
        alert('메시지함을 선택해주세요');
    }
}

function select_delete(target){
    if(typeof target != "undefined" && typeof target != undefined && target != null && target != "null"){
        var confirm_result = confirm('선택된 메시지를 삭제하시겠습니까?');
        if(confirm_result){
            var msg_check_box = document.getElementsByClassName('msg_check_box');
            var del_msg = [];

            for(var i = 0; i<msg_check_box.length; i++){
                if(msg_check_box[i].checked == true){
                    del_msg.push(msg_check_box[i].value);
                }
            }
            
            if(del_msg.length > 0){
                lb.ajax({
                    type : "JsonAjaxPost",
                    list : {
                        ctl : "Msg",
                        param1 : "select_delete_msg",
                        box_idx : target,
                        target : JSON.stringify(del_msg),
                    },
                    action : "index.php",
                    havior : function(result){
                        double_click = true;
                        console.log(result);
                        result = JSON.parse(result);
                        if(result.result == 1){
                            alert('메시지함을 비웠습니다.');
                            $('#msg_wrap').empty();
                            
                            request_msg_list(target);
                        }
                    }
                })
            }else{
                alert('삭제할 메시지를 선택해주세요');
            }
        }
    }else{
        alert('메시지함을 선택해주세요');
    }
}

function open_modal(target, type){
    if(typeof target != "undefined" && typeof target != undefined && target != "null" && target != null){
        var msg_modal = document.getElementById('msg_modal');
        msg_modal.style.display = "block";
        
        var msg_content = document.getElementById('msg_content');
        var msg_name =document.getElementById('msg_name');
        var btn_register = document.getElementById('btn_register');
        if(type =="modify"){
            if(typeof target.msg_content != "undefined" && typeof target.msg_content != undefined && target.msg_content != null && target.msg_content !="null"){
                msg_content.value = target.msg_content;
            }
            
            msg_name.value = target.msg_name;
            btn_register.onclick = function(){
                request_update_msg(target.idx);
            }
        }else{
            btn_register.onclick = function(){
                request_register_msg(target.idx);
            }
        }
    }else{
        alert('메시지함을 선택해주세요');
    }
    
}

function close_modal(){
    var msg_modal =document.getElementById('msg_modal');
    msg_modal.style.display = "none";
    var msg_content = document.getElementById('msg_content');
    var msg_name =document.getElementById('msg_name');
    var count_text = document.getElementById('count_text');
    msg_content.value = "";
    msg_name.value = "";

    count_text.innerHTML ="0 / 90 Byte (SMS)";

    var btn_register = document.getElementById('btn_register');
    btn_register.onclick = function(){};
}






// 문자입력부분
function s_char_input(type){
    if(type == "s_char"){
        var s_char = document.getElementById("s_char");
    }else if(type == "imo"){
        var s_char = document.getElementById("imo");
    }
    var msg_text = document.getElementById("msg_content");
    for(var i=0; i<s_char.children.length; i++){
        s_child = s_char.children[i];
        for(var j = 0; j<s_child.children.length; j++){
            var char = s_child.children[j].children[0];
            char.onclick = function(){
                msg_text.value = msg_text.value + this.innerHTML;
                byteCheckViewDisplay(msg_text);
            }
        }
    }
}

function byteCheckViewDisplay(obj){
    var count = document.getElementsByClassName('count-txt')[0];
    var text = obj.value;
    byte = calByte.getByteLength(obj.value);
    
    if(byte >2000){
        alert('2000byte 이상 입력하실 수 없습니다.');
        obj.value = calByte.cutByteLength(obj.value,2000); 
    }
    
    if(byte <= 90 && mms_state == 0){
        send_flag = 1;
        count.innerHTML = calByte.getByteLength(obj.value) + " / 90 Byte (SMS)";
    }else if(byte > 90 && mms_state == 0){
        send_flag = 3;
        count.innerHTML = calByte.getByteLength(obj.value) + " / 2000 Byte (LMS)";
    }else{
        send_flag = 3;
        count.innerHTML = calByte.getByteLength(obj.value) + " / 2000 Byte (MMS)";
    }
}

var calByte = {
    getByteLength : function(s){
        if(s == null || s.length == 0){
            return 0;
        }
        var size = 0;
        for(var i =0; i<s.length; i++){
            size += this.charByteSize(s.charAt(i));
        }
        return size;
    },
    cutByteLength : function(s, len){
        if(s == null || s.length == 0){
            return 0;
        }
        var size = 0;
        var rIndex = s.length;
        for(var i = 0; i < s.length; i++){
            size += this.charByteSize(s.charAt(i));
            if(size == len){
                rIndex = i + 1;
                break;
            }else if(size > len){
                rIndex = i;
                break;
            }
        }
        return s.substring(0, rIndex);
    },
    charByteSize : function(ch){
        if(ch == null || ch.length == 0){
            return 0;
        }

        var oneChar = escape(ch.charAt(0));
        if(oneChar.length == 1){
            return 1;
        }else if(oneChar.indexOf("%u") != -1){
            return 2;
        }else if(oneChar.indexOf("%") != -1){
            return 1;
        }  

        // var charCode = ch.charCodeAt(0);
        // if(charCode <= 0x00007F){
        //     return 1;
        // }else if(charCode <= 0x0007FF){
        //     return 2;
        // }else if(charCode <= 0x00FFFF){
        //     return 3;
        // }else{
        //     return 4;
        // }
    }
};

function search(target){
    if(typeof target != "undefined" && typeof target != undefined && target != "null" && target != null){
        var search_name = document.getElementById('search_name');
        var search_content = document.getElementById('search_content');
        
        if(search_name.value == "" && search_content.value == ""){
            alert('검색할 메시지 설명 또는 내용을 입력해주세요');
        }else{
            request_msg_list(target)
        }
    }else{
        alert('메시지함을 선택해주세요');
    }
}

function search_init(target){
    if(typeof target != "undefined" && typeof target != undefined && target != null && target != "null"){
        var search_name = document.getElementById('search_name');
        var search_content = document.getElementById('search_content');
        var search_init_btn = document.getElementById('search_init_btn');

        search_name.value = "";
        search_content.value = "";

        request_msg_list(target);
        // search_init_btn.onclick = function(){
        //     search_init();
        // }
    }else{
        alert('메시지함을 선택해주세요');
    }
    
}





function request_msg_box_detail(target, elem){
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
                    init_msg_box_detail(result.value[0], elem);
                }
            }
        }
    });
}

function init_msg_box_detail(data, elem){
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

    var target = elem.children[0].children[0].children[0];
    var select_folder = document.getElementsByClassName('select_folder');

    for(var i= 0; i<select_folder.length; i++){
        if(target == select_folder[i]){
            elem.classList.add('table_select');
        }else{
            var copy_elem = select_folder[i].parentNode.parentNode.parentNode;
            if(copy_elem.classList.contains('table_select')){
                copy_elem.classList.remove('table_select');
            }
        } 
    }

    // var selec
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
                        request_msg_box();
                        init_add_input();
                    }
                }
            });
        }        
    }else{
        alert('메시지함을 선택해주세요');
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
                            request_msg_box();
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
                            request_msg_box();
                        }
                    }
                });
            }
        }
    }else{
        alert('메시지함을 등록중입니다.');
    }
}

