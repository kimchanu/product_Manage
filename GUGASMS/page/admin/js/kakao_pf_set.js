

function createEditor(callback){
    var editor = new Editor();
    editor.callback = callback;
  
    try{
        document.addEventListener('click',clickEventHandler,false);
    }catch(e){
        document.attachEvent('onclick',clickEventHandler);
    }
  
    return editor;
  }
  function clickEventHandler(e){
    var evt = e || window.event;
    var target;
  
    if(evt.target){
        target = evt.target;
    }else{
        target = evt.srcElement;
    }
  
    if(target.className.search('editable') > -1){
        editor.editing(target);
    }
  }
  
  function Editor(){
    this.autosave = false;
    this.source = null;
    this.callback = null;
    this.container = null;
    this.frm = document.createElement('INPUT');
    this.frm.className = 'editor';
    this.frm.model = this;
  
    this.frm.onkeydown = function(e){
        var evt = e || window.event;
  
        if(evt.keyCode == 13){
            try{
                evt.preventDefault();
            }catch(ex){
                evt.returnValue = false;
            }
  
            this.model.complete();
        }
    }
  
    this.frm.onblur = function(e){
        if(this.model.autosave == true){
              this.model.complete();
          }else{
              this.model.cancel();
          }
    }
  }
  
  Editor.prototype.editing = function(obj){
    try{
        this.container = obj;
  
        if(obj.hasChildNodes() == false){
            obj.appendChild(document.createTextNode(''));
        }
  
        this.source = obj.firstChild;
        this.frm.value = this.source.nodeValue;
        this.frm.style.width = '100%';
  
        if(this.container.style.textAlign != undefined && this.container.style.textAlign != ''){
              this.frm.style.textAlign = this.container.style.textAlign;
          }else if(this.container.align != undefined && this.container.align != ''){
              this.frm.style.textAlign = this.container.align;
          }else{
              this.frm.style.textAlign = 'left';
        }
  
        this.container.replaceChild(this.frm,this.source);
        this.frm.focus();
        this.frm.value += '';
    }catch(e){
    }
  }
  
  Editor.prototype.cancel = function(){
    this.finish();
  }
  
  Editor.prototype.complete = function(){
    this.save();
    this.finish();
  
    if(this.callback instanceof Function){
        this.callback(this.container);
    }else{
    }
  }
  
  Editor.prototype.finish = function(){
    this.container.replaceChild(this.source,this.frm);
  }
  
  Editor.prototype.save = function(){
    this.source = document.createTextNode(this.frm.value);
  }


// var abc = document.getElementsByClassName("editable")
// var editor = createEditor(abc);