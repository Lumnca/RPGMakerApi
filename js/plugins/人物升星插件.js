//=============================================================================
 /*:
 * @target MZ
 * @plugindesc 人物升星插件
 * @author Lumnca
 * 
 *
 * @param imgUrl
 * @text 拼图图集图片名称
 * @desc 
 * 需要做为拼图的图片来源，只需要一张图即可！（请把对应的图片放在img/system目录下）
 * @default 
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

//================================窗口类==========================================
function Window_SmallMenuActor() {
    this.initialize.apply(this,arguments);
}

Window_SmallMenuActor.prototype = Object.create(Window_MenuStatus.prototype);
Window_SmallMenuActor.prototype.constructor =  Window_SmallMenuActor;

Window_SmallMenuActor.prototype.initialize = function(rect) {
    Window_MenuStatus.prototype.initialize.call(this, rect);
};
Window_SmallMenuActor.prototype.drawItem = function(index) {
    this.drawPendingItemBackground(index);
    const actor = this.actor(index);
    const rect = this.itemRect(index);
    const x = rect.x + 24;
    const y = rect.y + 48; //rect.height / 2 - this.lineHeight() * 1.5;
    this.drawCharacter(actor._characterName,actor._characterIndex,x,y);
    this.drawText(actor.name(),x+24,y-32,120);
    this.drawText("2星3阶",x-20,y+24,120);
};










function Window_ActorStarStatus() {
    this.initialize.apply(this,arguments);
}

Window_ActorStarStatus.prototype = Object.create(Window_EquipStatus.prototype);
Window_ActorStarStatus.prototype.constructor =  Window_ActorStarStatus;

Window_ActorStarStatus.prototype.initialize = function(rect) {
    Window_EquipStatus.prototype.initialize.call(this, rect);

};

Window_ActorStarStatus.prototype.nextStarChange = function(){
    const actor = JsonEx.makeDeepCopy(this._actor);
    actor.addParam(2,8);
    actor.addParam(3,5);
    console.log(actor);
    console.log(this._actor);
    this.setTempActor(actor);
}

Window_ActorStarStatus.prototype.refresh = function() {
    this.contents.clear();
    if (this._actor) {
        const nameRect = this.itemLineRect(0);
        this.resetTextColor();
        this.drawText('升星后属性变化', nameRect.x, 0, nameRect.width,'center');
        this.drawAllParams();
    }
};

Window_ActorStarStatus.prototype.drawAllParams = function() {
    for (let i = 0; i < 6; i++) {
        const x = this.itemPadding();
        const y = Math.floor(this.lineHeight() * (i + 1.5));
        this.drawItem(x, y, 2 + i);
    }
};


function Window_NeedItemWindow() {
    this.initialize(...arguments);
}

Window_NeedItemWindow.prototype = Object.create(Window_Base.prototype);
Window_NeedItemWindow.prototype.constructor = Window_NeedItemWindow;

Window_NeedItemWindow.prototype.initialize = function(rect) {
    Window_Base.prototype.initialize.call(this, rect);
    this._needs = [7,8,9];
    this.refresh();
};

Window_NeedItemWindow.prototype.createTitle = function(){
    this.drawText('升星所需要材料',0,0,this.width,'center');
}

Window_NeedItemWindow.prototype.createNeedItem = function(){
    for (let i = 0; i < this._needs.length; i++) {
        let item = $dataItems[this._needs[i]];
        this.drawIcon(item.iconIndex,0,16+(i+1)*this.lineHeight());
        this.drawText(item.name,36,16+(i+1)*this.lineHeight());
        this.drawText(i*5+"/12",0,16+(i+1)*this.lineHeight(),this.width-32,'right');
    }
   this.createButton();
}

Window_NeedItemWindow.prototype.createButton = function(){
    const button = new Sprite_Button('ok');
    button.x = this.width/2-button.width/2;
    button.y = this.height - this.lineHeight()*2;
    this.addChild(button);
}

Window_NeedItemWindow.prototype.refresh = function(){
    this.createTitle();
    this.createNeedItem();
}


function Window_NextStarInfoWindow() {
    this.initialize(...arguments);
}

Window_NextStarInfoWindow.prototype = Object.create(Window_Base.prototype);
Window_NextStarInfoWindow.prototype.constructor =  Window_NextStarInfoWindow;

Window_NextStarInfoWindow.prototype.initialize = function(rect) {
    Window_Base.prototype.initialize.call(this, rect);
    this.refresh();
};

Window_NextStarInfoWindow.prototype.refresh = function(){
    this.createMessage();
}

Window_NextStarInfoWindow.prototype.createMessage = function(){
    this.drawText('当前星级: 2星',0,0);
    this.drawTextEx('下一星级: 3星,你将获得技能\\i[64] 火焰',0,this.lineHeight());
}


//================================界面场景=========================================
function Scene_PStar() {
    this.initialize.apply(this, arguments);
}

Scene_PStar.prototype = Object.create(Scene_Base.prototype);
Scene_PStar.prototype.constructor = Scene_PStar;

Scene_PStar.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
    this._w = Graphics.width;
    this._h = Graphics.height;
    this._actorMenuWidth = this._w *0.25;
    this._td = 0.7;
};

Scene_PStar.prototype.create = function(){
    this.createWindow();
    this._actorMenuWindow.activate();
    this._actorMenuWindow.select(0);
}


Scene_PStar.prototype.createWindow = function(){
    this._actorMenuWindow = new Window_SmallMenuActor({x:0,y:0,width:this._actorMenuWidth,height:this._h});
    this.addChild(this._actorMenuWindow);
    this._actorMenuWindow.show();
    this._actorStarWindow  = new Window_ActorStarStatus({x:this._actorMenuWindow.width,y:0,width:(this._w-this._actorMenuWidth)/2,height:this._h*this._td});
    this.addChild(this._actorStarWindow);
    this._actorMenuWindow.setHandler("ok", this.onActorOk.bind(this));
    this._needWindow = new Window_NeedItemWindow({x:this._actorStarWindow.x+this._actorStarWindow.width,y:0,
        width:(this._w-this._actorMenuWidth)/2,height:this._h*this._td})
    this.addChild(this._needWindow);
    
    this._nextStarWindow = new Window_NextStarInfoWindow({x:this._actorStarWindow.x,y:this._actorStarWindow.height,width:(this._w-this._actorMenuWidth),height:this._h*(1-this._td)})
    this.addChild(this._nextStarWindow);

}

Scene_PStar.prototype.onActorOk = function(){
   
    this._actorStarWindow.setActor($gameParty.menuActor())
    this._actorStarWindow.nextStarChange();
    //this._actorMenuWindow.deactivate();
    this._actorMenuWindow.playOkSound();
    this._actorMenuWindow.activate();
   
}
//
   
