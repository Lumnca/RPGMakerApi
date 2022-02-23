//=============================================================================
// main.js
//=============================================================================

PluginManager.setup($plugins);

window.onload = function() {
    SceneManager.run(Scene_Boot);
};


function Scene_MySelf() {
    this.initialize.apply(this, arguments);
}

Scene_MySelf.prototype = Object.create(Scene_Base.prototype);
Scene_MySelf.prototype.constructor =  Scene_MySelf;

Scene_MySelf.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
    this._txt = "HelloWorld";
};

Scene_MySelf.prototype.create = function(){
    Scene_Base.prototype.create.call(this);
    this.createWindowLayer();

    this._w = new Window_ShopCommand(720);
    let item = new Window_ShopStatus(0,490,720,160);
    let ws = new  Window_ShopBuy(0,90,400,[[0,1,],[1,2,0],[2,2,0]]);

    ws.setStatusWindow(item);
    this.addWindow(this._w);
    this.addWindow(ws);
    this.addWindow(item);
    window.w = this._w;
}

function Window_MySelf() {
    this.initialize.apply(this, arguments);
}

Window_MySelf.prototype = Object.create(Window_HorzCommand.prototype);
Window_MySelf.prototype.constructor = Window_MySelf;

Window_MySelf.prototype.initialize = function( x, y) {
    Window_HorzCommand.prototype.initialize.call(this, x, y);
    this.refresh();
    this.select(0)
    this.activate();
    this.setHanderEvent();
};

Window_MySelf.prototype.makeCommandList = function(){
    this.addCommand('选项一','option1');
    this.addCommand('选项二','option2',false);
    this.addCommand('选项三','option3');
    this.addCommand('选项四','option3');
}

Window_MySelf.prototype.callOkHandler = function() {
    let symbol = this.currentSymbol();
    this.callHandler(symbol);
    this.activate()
};

Window_MySelf.prototype.setHanderEvent = function(){
    this.setHandler('option1',()=>{
        alert('option1 event!')
    });
    this.setHandler('option3',()=>{
        alert('option2 event!')
    });
}

Window_MySelf.prototype.windowWidth = function() {
    return 720;
};

Window_MySelf.prototype.updateHelp = function(){
    Window_Selectable.prototype.updateHelp.call(this); 
    this.setHelpWindowItem({description:this.currentSymbol()});
}