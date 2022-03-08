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
    this.refresh();
    this.activate();
    this.setHandler('cancel',this.cancel.bind(this));
};

Window_PartyAct.prototype.cancel = function(){
    SceneManager.pop();
}

Window_PartyAct.prototype.setActor = function (actor) {
    if (this._actor !== actor) {
        this._actor = actor;
        this.refresh();
    }
};
Window_PartyAct.prototype.refresh = function () {
    this.contents.clear();
    this.drawBasicInfo(0, 0);

}
Window_PartyAct.prototype.drawBasicInfo = function (x, y) {
    var lineHeight = this.lineHeight();
    console.log(this._actor);
    if (this._actor) {
        this.drawActorLevel(this._actor, x, y + lineHeight * 0);
        this.drawActorIcons(this._actor, x, y + lineHeight * 1);
        this.drawActorHp(this._actor, x, y + lineHeight * 2);
        this.drawActorMp(this._actor, x, y + lineHeight * 3);
    }
};


