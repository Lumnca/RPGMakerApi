//=============================================================================
 /*:
 * @plugindesc 时间显示窗口
 * @author Lumnca
 *
 * @param Default Show
 * @text 默认显示
 * @desc 
 * NO - false     YES - true
 * @default true
 *
 * @param X
 * @text 时间窗口处于的位置的x坐标
 * @desc 
 * @default 0
 *  
 * @param Y
 * @text 时间窗口处于的位置的y坐标
 * @desc 
 * @default 0
 *
 * @param FontSize
 * @text 字体大小
 * @desc 
 * @default 28
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * 这个插件可以让你在主地图显示游戏时间
 *
 * ============================================================================
 * Plugin Commands
 * ============================================================================
 *
 * 如果你想关闭或者开启事件，你可以使用下面插件命令:
 *
 * Plugin Command:
 *
 *   dateDisplay hide
 *   隐藏时间窗口
 *
 *   dateDisplay show
 *   显示时间窗口
 *
 *
 * ============================================================================
 * Changelog
 * ============================================================================
 *
 * Version 1.0:
 * 初始创建
 */
//=============================================================================

//=============================================================================
// Parameter Variables
//=============================================================================

var Lumnca = Lumnca || {};
Lumnca.Param  = PluginManager.parameters('时间显示');


Lumnca.Param.DefaultShow = eval(String(Lumnca.Param['Default Show']));
Lumnca.Param.Width = Number(Lumnca.Param ['X']);
Lumnca.Param.Height = Number(Lumnca.Param ['Y']);
Lumnca.Param.FontSize = Number(Lumnca.Param ['FontSize']);
//=============================================================================
// Game_System
// 为游戏加载全局数据
//============================================================================= 
const Game_System_initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
    Game_System_initialize.call(this);
    this._gameDate = {
        _date : new Date(),
        _visiblity : Lumnca.Param.DefaultShow
    }
};

//=============================================================================
// Window_GameDate
// 显示时间窗口
//=============================================================================
function Window_GameDate() {
    this.initialize.apply(this, arguments);
}

Window_GameDate.prototype = Object.create(Window_Base.prototype);
Window_GameDate.prototype.constructor = Window_GameDate;


Window_GameDate.prototype.initialize = function(){
    this._gameDate = $gameSystem._gameDate.date || new Date();
    this._visiblity = $gameSystem._gameDate._visiblity;
    this._bitmap =  ImageManager.loadSystem('MapName');
    this._initTime = new Date();
    var x = Math.max(Lumnca.Param.X);
    var y = Math.max(Lumnca.Param.Y);
    Window_Base.prototype.initialize.call(this, x, y, this.windowWidth(),this.windowHeight());
    this.setBackgroundType(1);
    this.hideBackgroundDimmer();
}
Window_GameDate.prototype.windowWidth = function() {
    return this._bitmap.width + this.standardPadding()*2;
};

Window_GameDate.prototype.windowHeight = function() {
    return this._bitmap.height + this.standardPadding()*2;
};

Window_GameDate.prototype.standardFontFace = function(){
    return 'GameFont';
}
Window_GameDate.prototype.standardFontSize = function() {
    return Lumnca.Param.FontSize || 28;
};

Window_GameDate.prototype.start = function(){
    Window_Base.prototype.start.call(this);
}

Window_GameDate.prototype.update = function(){
    Window_Base.prototype.update.call(this);
    this.contents.clear();
    if(this._visiblity){
        this.show();
        this.contents.blt( this._bitmap, 0,0,313,75,0,0);
        this.drawText(this.dateFotmat(),0,this._bitmap.height/2-this.lineHeight()/2, this.contentsWidth(),'center');
    }
    else{
        this.hide();
    }
   
   
}

Window_GameDate.prototype.dateFotmat = function(){
    this._gameDate = new Date();
    let h = this._gameDate.getHours().padZero(2);   
    let m = this._gameDate.getMinutes().padZero(2);
    let s = this._gameDate.getSeconds().padZero(2);
    /*
    if(s > 50){
      //huanghun
        $gameScreen._tone = [-68,-68,0,68];
    }
    else if(s < 10){
        $gameScreen._tone = [-68,-68,-68,0];
    }
    else if(s >= 10 && s < 20){
        $gameScreen._tone = [-34,-34,-68,170];
    }
    else if(s >= 40 && s < 50){
        $gameScreen._tone = [-68,-34,0,-34];
    }
    else{
        $gameScreen._tone = [0,0,0,0];
    }*/
    return h + ":"+ m+":" + s;
}



const Scene_Map_create = Scene_Map.prototype.start;

/**
 * 每加载一次地图就构建时间显示窗口
 */
Scene_Map.prototype.start = function() {
    Scene_Map_create.call(this);
    this.dm = new Window_GameDate();
    this.addChild(this.dm);
};
Scene_Map.prototype.gameDateIsDisplay = function(v){
    if(v instanceof String){
        this.dm._visiblity = v.translateBoolean();
    }
    else{
        this.dm._visiblity = v;
    }
    $gameSystem._gameDate._visiblity = v;
}
Scene_Map.update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function(){
    Scene_Map.update.call(this);
    if(this.dm._visiblity && this.dm._visiblity.y < 0){
        this.dm._visiblity.y++;
    }
}
//=============================================================================
// Game_Interpreter
//=============================================================================

const Game_Interpreter_pluginCommand =
    Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
  Game_Interpreter_pluginCommand.call(this, command, args)
  if (command === 'dateDisplay'){
    if(args[0]==='show')SceneManager._scene.gameDateIsDisplay(true);
    else if(args[0]==='hide') SceneManager._scene.gameDateIsDisplay(false);
    else console.log('无效命令!')
  } 
};

