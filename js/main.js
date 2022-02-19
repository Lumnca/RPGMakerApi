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
    let w = new Window_MySelf(0,0,400,160);
    this.addWindow(w);
    w.open()
    window.w = w;
}

function Window_MySelf() {
    this.initialize.apply(this, arguments);
}

Window_MySelf.prototype = Object.create(Window_Command.prototype);
Window_MySelf.prototype.constructor = Window_MySelf;

Window_MySelf.prototype.initialize = function() {
    Window_Command.prototype.initialize.call(this, 0, 0);
    this.updatePlacement();
    this.openness = 0;
    this.selectLast();
};

Window_MySelf._lastCommandSymbol = null;

Window_MySelf.initCommandPosition = function() {
    this._lastCommandSymbol = null;
};

Window_MySelf.prototype.windowWidth = function() {
    return 240;
};

Window_MySelf.prototype.updatePlacement = function() {
    this.x = (Graphics.boxWidth - this.width) / 2;
    this.y = Graphics.boxHeight - this.height - 96;
};

Window_MySelf.prototype.makeCommandList = function() {
    this.addCommand(TextManager.newGame,   'newGame');
    this.addCommand(TextManager.continue_, 'continue', this.isContinueEnabled());
    this.addCommand(TextManager.options,   'options');
};

Window_MySelf.prototype.isContinueEnabled = function() {
    return DataManager.isAnySavefileExists();
};

Window_MySelf.prototype.processOk = function() {
    Window_TitleCommand._lastCommandSymbol = this.currentSymbol();
    Window_Command.prototype.processOk.call(this);
};

Window_MySelf.prototype.selectLast = function() {
    if (Window_TitleCommand._lastCommandSymbol) {
        this.selectSymbol(Window_TitleCommand._lastCommandSymbol);
    } else if (this.isContinueEnabled()) {
        this.selectSymbol('continue');
    }
};



