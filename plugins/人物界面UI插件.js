
//=============================================================================
 /*:
 * @target MZ
 * @plugindesc 小战场场景
 * @author Lumnca
 * 
 *
 * @param goldIndex
 * @text 金币图标索引
 * @desc 
 * @default 314
 *
 * 
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * 这个插件可以让你的游戏人物开启升星级系统
 *
 * ============================================================================
 * Plugin Commands
 * ============================================================================
 *
 * 无
 *
 * ============================================================================
 * Changelog
 * ============================================================================
 *
 * Version 1.0:
 * 初始创建
 */
//================================================================================
//=============================战斗系统===========================================
function Game_BMSystem() {
    this.initialize(...arguments);
}
Game_BMSystem.prototype.initialize = function() {
    this._start = false;
    this._leftArmy = {};
    this._rightArmy = {};
    this._middlePower = {};

    this.initArmy(this._leftArmy,1);
    this.initArmy(this._rightArmy,2);
};
Game_BMSystem.prototype.initArmy = function(army,type){
    army._type = type;
    army._allpower = 0;
    army._unit = 100;
    army._attack = 5;
    army._define = 5;
    army._armyCount = 10;
    army._home = {x:type===1?0:16,y:4};
    army._goal = {x:type===1?16:0,y:4};
}

Game_BMSystem.prototype.getArmy = function(type){
    if(type===1){
        return this._leftArmy;
    }
    else if(type===2){
        return this._rightArmy;
    }
}

Game_BMSystem.prototype.createArmy = function(type,power){
    let army = this.getArmy(type);
    army._allpower = power;
    army._armyCount = Math.ceil(army._allpower / army._unit);
    army._armyCount = army._armyCount>10? 10:army._armyCount;
    army._characters = [];
    for (let i = 0; i < army._armyCount; i++) {
        const element = new Game_SmBattle(army._type,i);
        army._characters.push(element);
    }
}

Game_BMSystem.prototype.getArmyCharacters = function(type){
    if(type===1){
        return this._leftArmy._characters || [];
    }
    else{
        return this._rightArmy._characters || [];
    }
}

Game_BMSystem.prototype.chongfeng = function(type){
    let army = this.getArmy(type);
    for (let i = 0; i < army._characters.length; i++) {
        const element =  army._characters[i];
        if(element._active){
            element.moveTowardCharacter(army._goal);
        }
    }
}
//=============================战斗对象===========================================
var zfPosTable = [
    {
        name : '',
        pos: [
            [1,4],[1,3],[1,5],[2,4],[3,4],[1,2],[1,6],[2,3],[2,5],[4,4]
        ]
    }
]
function Game_SmBattle() {
    this.initialize(...arguments);
}

Game_SmBattle.prototype = Object.create(Game_Character.prototype);
Game_SmBattle.prototype.constructor = Game_SmBattle;

Game_SmBattle.prototype.initialize = function(type,id) {
    Game_Character.prototype.initialize.call(this);
    this._type = type || 0;
    this._manpower = 1000;
    this._attack = 5;
    this._define = 5;
    this._power = 100;
    this._armyId = id;
    this._zfType = 0;
    this._armyName = "";
    this._active = true;
    this.setImage('Actor2',1);  
    this.setPosAndDir(id);
   
};

Game_SmBattle.prototype.setPosAndDir = function(id){
    let xy = zfPosTable[this._zfType].pos[id];
    this.locate(this._type===1? xy[0]:16-xy[0],xy[1]);

    if(this._type===0){
        this.setDirection(8);
    }
    else if(this._type===1){
        this.setDirection(6);
    }
    else{
        this.setDirection(4);
    }
}

Game_SmBattle.prototype.moveStraight = function(dir){
    if(!this.hitTest(dir)){
        Game_Character.prototype.moveStraight.call(this,dir);
    }
}

Game_SmBattle.prototype.nextPos = function(dir){
    let pos = {x:this._x,y:this._y};
    if(dir===4||dir===6){
        pos.x = (this._x + (dir-5));
    }
    else{
        pos.y = (this._y + (5-dir)/3);
    }
    return pos;
}

Game_SmBattle.prototype.hitTest = function(dir){
    let armys = $gameBMSystem.getArmyCharacters(this._type);
    let res = false;
    for (let i = 0; i < armys.length; i++) {
        const element = armys[i];
        if(element._armyId!==this._armyId){
            res = this.hitCheck(dir,element);
            if(res){
                break;
            }
        }
    }
    return res;
    
}

Game_SmBattle.prototype.hitCheck = function(dir,element){
    if(element._active){
        let pos = this.nextPos(dir);
        if(pos.x===element._x&&pos.y===element._y){
            return true;
        }
        else{
            return false;
        }
    }
    else{
        return false;
    }
}


//============================主窗口=============================================
function Window_BattleMain() {
    this.initialize(...arguments);
}

Window_BattleMain.prototype = Object.create(Window_Base.prototype);
Window_BattleMain.prototype.constructor = Window_BattleMain;

Window_BattleMain.prototype.initialize = function(rect) {
    Window_Base.prototype.initialize.call(this, rect);
    this._time =90;
    this._start = true;
};

Window_BattleMain.prototype.create = function(){

    this._characters = [];

    this._map = new Spriteset_Map();
    this.addChild(this._map);

    this.createCharact();
}


Window_BattleMain.prototype.zj =function(){
    if(this._start){
        for (let i = 0; i < this._characters.length; i++) {
            this._characters[i].moveStraight(6);
        }
    }
}

Window_BattleMain.prototype.createCharact = function(){
    let left = $gameBMSystem.getArmyCharacters(1);
    for (let i = 0; i < left.length; i++) {
        let s = new Sprite_Character(left[i]);
        this._map._characterSprites.push(s);
        this._map._tilemap.addChild(s)
        this._characters.push(left[i]);
    }
    let right = $gameBMSystem.getArmyCharacters(2);
    for (let i = 0; i <  right.length;i++) {
        let s = new Sprite_Character( right[i]);
        this._map._characterSprites.push(s);
        this._map._tilemap.addChild(s)
        this._characters.push( right[i]);
    }
}

Window_BattleMain.prototype.update = function(){
    Window_Base.prototype.update.call(this);
    if(this._start){
        for (let i = 0; i < this._characters.length; i++) {
            this._characters[i].update();
        }
    }
}


//===========================阵法窗口=============================================
function Window_CommandArmy() {
    this.initialize(...arguments);
}

Window_CommandArmy.prototype = Object.create(Window_HorzCommand.prototype);
Window_CommandArmy.prototype.constructor = Window_CommandArmy;

Window_CommandArmy.prototype.initialize = function(rect) {
    Window_HorzCommand.prototype.initialize.call(this, rect);
};

Window_CommandArmy.prototype.lineHeight  = function(){
    return 160-this.itemPadding()*2-16;
}

Window_CommandArmy.prototype.makeCommandList = function(){
    this.addCommand('阵型一','attack');
    this.addCommand('阵型二','define');
    this.addCommand('阵型三','define');
    this.addCommand('阵型四','define');
}

Window_CommandArmy.prototype.drawItem = function(index) {
    const rect = this.itemLineRect(index);
    const align = this.itemTextAlign();
    this.resetTextColor();
    this.changePaintOpacity(this.isCommandEnabled(index));
    this.drawText(this.commandName(index), rect.x, rect.y, rect.width, align);
};


Window_CommandArmy.prototype.processOk = function() {
    Window_Command.prototype.processOk.call(this);
    this.hide();
};
//=============================双方数据窗口=======================================
function Window_BattleSZStatus() {
    this.initialize(...arguments);
}

Window_BattleSZStatus.prototype = Object.create(Window_Selectable.prototype);
Window_BattleSZStatus.prototype.constructor = Window_BattleSZStatus;

Window_BattleSZStatus.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this.hide();
    this.refresh();
};

Window_BattleSZStatus.prototype.refresh = function(){
    
}

Window_BattleSZStatus.prototype.createSatusInfo = function(){
    this.drawText('/')
}
//===============================================================================




//================================================================================
function Scene_BattleSZ() {
    this.initialize(...arguments);
}

Scene_BattleSZ.prototype = Object.create(Scene_Base.prototype);
Scene_BattleSZ.prototype.constructor = Scene_BattleSZ;

Scene_BattleSZ.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
};

Scene_BattleSZ.prototype.create = function(){
    Scene_Base.prototype.create.call(this);
 
    let h = 160;


    this._mainWindow = new Window_BattleMain({x:0,y:12,width:Graphics.width,height:Graphics.height-h});
    this.addChild(this._mainWindow);

    this._armyWindow = new Window_CommandArmy({x:0,y:Graphics.height-h-12,width:Graphics.width,height:h});
    this.addChild(this._armyWindow);

    DataManager.loadMapData(2);
}

Scene_BattleSZ.prototype.isReady = function() {
    if (!this._mapLoaded && DataManager.isMapLoaded()) {
        //地图加载完毕
        $gameMap.setup(2);
        this.onMapLoaded();
        this._mapLoaded = true;
    }
    return this._mapLoaded && Scene_Base.prototype.isReady.call(this);
};

Scene_BattleSZ.prototype.onMapLoaded = function() {
    this._mainWindow.create();
};


function loadBZ(){
    DataManager.loadMapData(2);
    $gameMap.setup(2)
    SceneManager.push(Scene_BattleSZ);
}

var $gameBMSystem = new Game_BMSystem();
