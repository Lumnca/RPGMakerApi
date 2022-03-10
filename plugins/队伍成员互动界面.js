//==============================================================
//
//=============================================================
/*:
* @plugindesc 队伍成员互动窗口界面与互动
* @author Lumnca
*
* @param commandPartyActName
* @text 菜单界面的名称
* @desc 菜单界面显示的名称
* @default 队伍
*
*
* 
*===================================================
* @help
*===================================================
* 
* 若要在窗口显示立绘，则在角色备注中添加<img:立绘图片文件名>
* 注意文件名不含后缀名。
*
* 按钮图片名称为bu可自行修改
*
*
*
* ============================================================================
* Plugin Commands
* ============================================================================
*
* 无
*
*
*
* ============================================================================
* Changelog
* ============================================================================
*
* Version 1.0:
* 初始创建
* 增加一个新的界面，可以查看人物属性，交互按钮，显示立绘
* 
* 
*/
var Lumnca = Lumnca || {};
Lumnca.Param = Lumnca.Param || {};
Object.assign(Lumnca.Param, PluginManager.parameters('队伍成员互动界面'))
Lumnca.Param.commandPartyActName = String(Lumnca.Param.commandPartyActName || '队伍');

(function () {

    const Window_MenuCommand_addMainCommands = Window_MenuCommand.prototype.addMainCommands;
    Window_MenuCommand.prototype.addMainCommands = function () {
        Window_MenuCommand_addMainCommands.call(this);
        this.addCommand(Lumnca.Param.commandPartyActName, 'partyAct');
    }
    
    const Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function () {
        Scene_Menu_createCommandWindow.call(this);
        this._commandWindow.setHandler('partyAct', this.commandPartyAct.bind(this));
    };
    


})();



Scene_Menu.prototype.commandPartyAct = function () {
    this._statusWindow.setFormationMode(false);
    this._statusWindow.selectLast();
    this._statusWindow.activate();
    this._statusWindow.setHandler('ok', () => {
        SceneManager.push(Scene_PartyAct);
    });
    this._statusWindow.setHandler('cancel', this.onPersonalCancel.bind(this));
};
//=====================================================================================
//场景界面
//=====================================================================================
function Scene_PartyAct() {
    this.initialize.apply(this, arguments);
}

Scene_PartyAct.prototype = Object.create(Scene_Base.prototype);
Scene_PartyAct.prototype.constructor = Scene_PartyAct;

Scene_PartyAct.prototype.initialize = function () {
    Scene_Base.prototype.initialize.call(this);
};

Scene_PartyAct.prototype.create = function () {
    Scene_Base.prototype.create.call(this);
    this.createBackground();
    this._partyActWindow = new Window_PartyAct();
    this.addChild(this._partyActWindow)
};



Scene_PartyAct.prototype.start = function () {
    this._actor = $gameParty.menuActor();
    this._partyActWindow.setActor(this._actor )
};

Scene_PartyAct.prototype.createBackground = function() {
    this._backgroundSprite = new Sprite();
    this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
    this.addChild(this._backgroundSprite);
};
//=====================================================================================
//队伍互动窗口界面
//=====================================================================================
function Window_PartyAct() {
    this.initialize.apply(this, arguments);
}

Window_PartyAct.prototype = Object.create(Window_Selectable.prototype);
Window_PartyAct.prototype.constructor = Window_PartyAct;

Window_PartyAct.prototype.initialize = function () {
    var width = Graphics.boxWidth;
    var height = Graphics.boxHeight;
    Window_Selectable.prototype.initialize.call(this, 0, 0, width, height);
    this._actor = null;
    this._buttons = {};
    this.loadImg();
    this.refresh();
    this.activate();
    this.setHandler('cancel',this.cancel.bind(this));
};

Window_PartyAct.prototype.loadImg = function(){
    this.reserveFaceImages();
  
    this._iconBitmap = ImageManager.loadSystem('en');
}

Window_PartyAct.prototype.drawActorImg = function(x,y){
    if(this._actorImg){
        let img = new Sprite(this._actorImg);
        img.x = x + (x - 360)/2;
        img.y = y;
        this.addChild(img);
    }
}

Window_PartyAct.prototype.cancel = function(){
    SceneManager.pop();
}

Window_PartyAct.prototype.setActor = function (actor) {
    if (this._actor !== actor) {
        this._actor = actor;
        if($dataActors[actor._actorId].meta.img) this._actorImg = ImageManager.loadPicture($dataActors[actor._actorId].meta.img)
        this.refresh();
    }
};
Window_PartyAct.prototype.refresh = function () {
    
    this.contents.clear();
    this.drawBasicInfo(0, 0);
    this.drawActorImg(this.contentsWidth()/2,0)

}
Window_PartyAct.prototype.drawBasicInfo = function (x, y) {
    var lineHeight = this.lineHeight();
    if (this._actor && this._actor._sex === 1) {
        this.drawActorFace(this._actor, x,y,160,160)
        this.iconCreate(this._actor._vargin, x+170, y);
        this.drawText(this._actor._vargin===20? '处女':'非处女',x+200, y,160,'right')
        this.iconCreate(this._actor._type, x+170, y+lineHeight);
        this.drawText('少女',x+200, y+lineHeight,160,'right')
        //this.drawActorLevel(this._actor, x+170, y + lineHeight * 0);
        this.drawActorIcons(this._actor, x+170, y + lineHeight * 1);
        this.drawActorHp(this._actor, x+170, y + lineHeight * 2);
        this.drawActorMp(this._actor, x+170, y + lineHeight * 3);
        this.drawHorzLine(164);
    }
    this.drawVerLine();
    this.createButtons(0,40,220,'离队');
    this.createButtons(5,120,220,'互动');
    this.createCommand();
};

Window_PartyAct.prototype.standardFontSize = function(){
    return 20;
}

Window_PartyAct.prototype.iconCreate = function(index,x,y){
    let bw = 26;
    let bh = 26;
    let sprite = new Sprite();
    sprite.bitmap =  this._iconBitmap?  this._iconBitmap : ImageManager.loadSystem('en');
    this.contents.blt(sprite.bitmap,(index % 6) * bw,(Math.floor(index / 6)*(index===0?bh:bh+2)),bw,bh,x,y+4);
}

Window_PartyAct.prototype.drawVerLine = function() {
    this.contents.paintOpacity = 48;
    this.contents.fillRect( this.contentsWidth()/2 , 0 , 2,this.contentsHeight() ,this.normalColor());
    this.contents.paintOpacity = 255;
};

Window_PartyAct.prototype.drawHorzLine = function(y) {
    var lineY = y + this.lineHeight() / 2 - 1;
    this.contents.paintOpacity = 48;
    this.contents.fillRect(0, lineY, this.contentsWidth()/2 - 16, 2, this.normalColor());
    this.contents.paintOpacity = 255;
};

Window_PartyAct.prototype.createButtons = function(i,x,y,symbol){
    let bh = 32;
    let bw = 64;
    let button = new Sprite_Button();
    button.bitmap = ImageManager.loadSystem('bu');
    button.setColdFrame(bw * (i%4),Math.floor(i / 4) * bh,bw,bh);
    button.setHotFrame(bw * (i%4),Math.floor(i / 4 + 1)  * bh,bw,bh);
    button.x = x;
    button.y = y;
    this.addChild(button);
    this._buttons[symbol] = button;
}

Window_PartyAct.prototype.createCommand = function(){
    this._buttons['离队'].setClickHandler(()=>{
       if(!this._f){
            this._f = 1;
            this.showTalk(this._actor,'好吧，那我先离开了！')
            $gameParty.removeActor(this._actor._actorId);
            this.cancel();
       }
    });
}

Window_PartyAct.prototype.showTalk = function(actor,txt){
    $gameMessage._faceName = actor._faceName;
    $gameMessage._faceIndex = actor._faceIndex;
    $gameMessage.add(txt)
}
