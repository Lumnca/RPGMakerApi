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
    let w = new Window_MySelf(0,0,600,200);
    this.addWindow(w);
    window.w = w;
}


function Window_MySelf() {
    this.initialize.apply(this, arguments);
}

Window_MySelf.prototype = Object.create(Window_Base.prototype);
Window_MySelf.prototype.constructor = Window_MySelf;

Window_MySelf.prototype.initialize = function(x, y, width, height) {
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this.create();
};

Window_MySelf.prototype.create = function(){

}

Window_MySelf.prototype.update = function(){
  this.create();
}
