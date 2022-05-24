//=============================================================================
 /*:
 * @target MZ
 * @plugindesc 人物升星插件
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
const perStarParam = PluginManager.parameters('人物升星插件');
let iconIndex = Number(perStarParam["goldIndex"]);
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
    this.drawText(actor.getStarLevel(),x-20,y+24,120);
};

function Window_ActorStarStatus() {
    this.initialize.apply(this,arguments);
}

Window_ActorStarStatus.prototype = Object.create(Window_EquipStatus.prototype);
Window_ActorStarStatus.prototype.constructor =  Window_ActorStarStatus;

Window_ActorStarStatus.prototype.initialize = function(rect) {
    Window_EquipStatus.prototype.initialize.call(this, rect);
    this._params = [];
};

Window_ActorStarStatus.prototype.nextStarChange = function(){
    this.getStarAfter();
    const actor = JsonEx.makeDeepCopy(this._actor);
    this._params.forEach((p,i)=>{
        actor.addParam(i+2,p);
    })
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

Window_ActorStarStatus.prototype.getStarAfter = function(){
    this._params = [];
    if(this._actor&&this._actor._starData){
        if(this._actor._starData[this._actor.getNextStarLevel()]){
            let data = JSON.parse(this._actor._starData[this._actor.getNextStarLevel()]);
            let x1 = data["奖励"]["属性"];
            let x2 = data["奖励"]["武器"];
            let x3 = data["奖励"]["技能"];
            let x4 = data["奖励"]["防具"];
            let x5 = data["奖励"]["物品"];
            this._params = x1 || [];
        }
        else{
            this._params = [];
        }
       
    }
}

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
    this._needs = [];
    this._ableStar = false;
    this.createButton();
};


Window_NeedItemWindow.prototype.setActor = function(actor){
    this._actor = actor;
    this.refresh();
}

Window_NeedItemWindow.prototype.createTitle = function(){
    this.drawText('升星所需要材料',0,0,this.width,'center');
}

Window_NeedItemWindow.prototype.createNeedItem = function(){
    let able = true;
    if(this._needs.length===0){
        able = false;
        this._button.visible = false;
    }
    for (let i = 0; i < this._needs.length; i++) {
        let px = 16+(i+1)*this.lineHeight();
        if(this._needs[i].type==='item'){
            let item = $dataItems[this._needs[i].id];
            this.drawIcon(item.iconIndex,0,px);
            this.drawText(item.name,36,px);
            this.drawText(this._needs[i].count+"/"+this.getItemNumber(0,this._needs[i].id),0,px,this.width-32,'right');
            if(this._needs[i].count > this.getItemNumber(0,this._needs[i].id))able = false;
        }
        else if(this._needs[i].type==='weapon'){
            let item = $dataWeapons[this._needs[i].id];
            this.drawIcon(item.iconIndex,0,px);
            this.drawText(item.name,36,px);
            this.drawText(this._needs[i].count+"/"+this.getItemNumber(2,this._needs[i].id),0,px,this.width-32,'right');
            if(this._needs[i].count > this.getItemNumber(2,this._needs[i].id))able = false;
        }
        else if(this._needs[i].type==='arom'){
            let item = $dataArmors[this._needs[i].id];
            this.drawIcon(item.iconIndex,0,px);
            this.drawText(item.name,36,px);
            this.drawText(this._needs[i].count+"/"+this.getItemNumber(1,this._needs[i].id),0,px,this.width-32,'right');
            if(this._needs[i].count > this.getItemNumber(1,this._needs[i].id))able = false;
        }
        else if(this._needs[i].type==='gold'){
            this.drawIcon(iconIndex,0,px);
            this.drawText('金币',36,px);
            this.drawText(this._needs[i].count,0,px,this.width-32,'right');
            if($gameParty.gold()<this._needs[i].count)able = false;
        }
       
    }
    this._ableStar = able;

}

Window_NeedItemWindow.prototype.getItemNumber = function(type,id){
    if(type===0){
        return $gameParty._items[id] || 0;
    }
    else if(type===1){
        return $gameParty._armors[id] || 0;
    }
    else if(type===2){
        return $gameParty._weapons[id] || 0; 
    }
    else{
        return 0;
    }
}

Window_NeedItemWindow.prototype.createButton = function(){
    const button = new Sprite_Button('ok');
    button.x = this.width/2-button.width/2;
    button.y = this.height - this.lineHeight()*2;
    button._clickHandler = ()=>{
        if(this._ableStar){
            this.playOkSound();
            SceneManager.pop();
            $gameMessage.add('升星强化成功!'+this._actor.name()+" 从"+this._actor.getStarLevel()+" -> "+this._actor.getNextStarLevel())
            this._actor.gainStar(this._needs);
        }
        else{
            this._button.visible = false;
            this.playBuzzerSound();
        }
    }
    this._button = button;
    this.addChild(button);
}

Window_NeedItemWindow.prototype.setupStarData = function(){
    if(this._actor&&this._actor._starData){
        if(this._actor._starData[this._actor.getNextStarLevel()]){
            console.log(this._actor._starData)
            let data = JSON.parse(this._actor._starData[this._actor.getNextStarLevel()]);
            let x = data["需求"]["物品"] || [];
            x.forEach(e => {
                this._needs.push({
                    id : e["物品id"],
                    count : e["数量"],
                    type : 'item'
                })
            });
            let w = data["需求"]["武器"] || [];;
            w.forEach(e => {
                this._needs.push({
                    id : e,
                    count : 1,
                    type : 'weapon'
                })
            });
            let y = data["需求"]["防具"] || [];;
            y.forEach(e => {
                this._needs.push({
                    id : e,
                    count : 1,
                    type : 'arom'
                })
            });
            let z = data["需求"]["金钱"] || 0;
            this._needs.push({
                id : -1,
                count : z,
                type : 'gold'
            })
            this._button.visible = true;
        }
        else{
            this._button.visible = false;
        }
    }
}

Window_NeedItemWindow.prototype.refresh = function(){
    this._needs = [];
    this.contents.clear();
    this.setupStarData();
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
};

Window_NextStarInfoWindow.prototype.setActor = function(actor){
    this._actor = actor;
    this.refresh();
}

Window_NextStarInfoWindow.prototype.refresh = function(){
    this.contents.clear();
    this.createMessage();
}

Window_NextStarInfoWindow.prototype.createMessage = function(){
    if(this._actor&&this._actor._starData){
        if(this._actor._starData[this._actor._nextStarLevel+'星']){
            let data = JSON.parse(this._actor._starData[this._actor._nextStarLevel+'星']);
            this.drawText('当前星级: '+this._actor.getStarLevel(),0,0);
            this.drawTextEx('下一星级: '+this._actor.getNextStarLevel()+','+data["说明"],0,this.lineHeight());
        }
        else{
            this.drawText('无下级数据',0,0);
        }
      
    }
    else{
        this.drawText('无星级评价',0,0);
    }
  
}
//=====================================数据类=====================================
const game_Actor_setup = Game_Actor.prototype.setup;
Game_Actor.prototype.setup = function(actorId){
    game_Actor_setup.call(this,actorId);
    this.setupStarSystem($dataActors[actorId].meta);
    this._curStarLevel = 0;
    this._nextStarLevel = 1;
  
 
}

Game_Actor.prototype.setupStarSystem = function(meta){
    if(meta){
        if(meta['最大星级']){
            this._maxStar = meta['最大星级'];
            for (let i = 0; i <  this._maxStar; i++) {
                let data = meta[`${i+1}星`];
                if(data){
                    this._starData = meta;
                }
            }
        }
    }
}

Game_Actor.prototype.getStarHelper = function(){

}

Game_Actor.prototype.getStarLevel = function(){
    if(this._maxStar){
        return this._curStarLevel+"星";
    }
    else{
        return "无星级";
    }
}

Game_Actor.prototype.getNextStarLevel = function(){
    if(this._maxStar){
        return this._nextStarLevel+"星";
    }
    else{
        return "无星级";
    }
}

Game_Actor.prototype.gainStar = function(needs){
    if(!this._starData)return;
    let str = this._starData[this.getNextStarLevel()];
    if(str){
        let data = JSON.parse(str);
        let ps = data["奖励"]["属性"] || [];
        ps.forEach((p,i)=>{
            this.addParam(i+2,p);
        })
        //技能
        let sk = data["奖励"]["技能"] || [];
        sk.forEach((s)=>{
            this.learnSkill(s);
        })
        let ws = data["奖励"]["武器"]|| [];
        ws.forEach((w)=>{
            if($gameParty._weapons[w]) $gameParty._weapons[w]++;
            else{
                $gameParty._weapons[w] = 1;
            }
        })
        let as =  data["奖励"]["防具"]|| [];
        as.forEach((a)=>{
            if($gameParty._armors[a]) $gameParty._armors[a]++;
            else{
                $gameParty._armors[a] = 1;
            }
        })

        let is = data["奖励"]["物品"]|| [];
        is.forEach((i)=>{
            if($gameParty._items[i]) $gameParty._items[i]++;
            else{
                $gameParty._items[i] = 1;
            }
        })
        this._curStarLevel = this._nextStarLevel;
        this._nextStarLevel = this._curStarLevel+1;
        for (let i = 0; i < needs.length; i++) {
            if(needs[i].type==='item'){
                $gameParty._items[needs[i].id] -= needs[i].count;
            }
            else if(needs[i].type==='weapon'){
                $gameParty._weapons[needs[i].id] -= needs[i].count;
            }
            else if(needs[i].type==='arom'){
                $gameParty._armors[needs[i].id] -= needs[i].count;
            }
            else if(needs[i].type==='gold'){
                $gameParty._gold -= needs[i].count;
            }
        }
    }
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
    this._top = 32;
    this._h = Graphics.height - this._top;
    this._actorMenuWidth = this._w *0.25;
    this._td = 0.7;
};

Scene_PStar.prototype.create = function(){
    this.createButton();
    this.createWindow();
    this._actorMenuWindow.activate();
    this._actorMenuWindow.select(0);
}

Scene_PStar.prototype.createButton = function(){
    let button = new Sprite_Button('cancel');
    
    button.scale.set(0.6);
    button.x = this._w - button.width*0.6;
    button._clickHandler = ()=>{
        SceneManager.pop();
    }
    this.addChild(button);
}

Scene_PStar.prototype.createWindow = function(){

    this._actorMenuWindow = new Window_SmallMenuActor({x:0,y:this._top ,width:this._actorMenuWidth,height:this._h});
    this.addChild(this._actorMenuWindow);
    this._actorMenuWindow.show();
    this._actorStarWindow  = new Window_ActorStarStatus({x:this._actorMenuWindow.width,y:this._top ,width:(this._w-this._actorMenuWidth)/2,height:this._h*this._td});
    this.addChild(this._actorStarWindow);
    this._actorMenuWindow.setHandler("ok", this.onActorOk.bind(this));
    this._needWindow = new Window_NeedItemWindow({x:this._actorStarWindow.x+this._actorStarWindow.width,y:this._top ,
        width:(this._w-this._actorMenuWidth)/2,height:this._h*this._td})
    this.addChild(this._needWindow);
    
    this._nextStarWindow = new Window_NextStarInfoWindow({x:this._actorStarWindow.x,y:this._actorStarWindow.height+this._top ,width:(this._w-this._actorMenuWidth),height:this._h*(1-this._td)})
    this.addChild(this._nextStarWindow);

}

Scene_PStar.prototype.onActorOk = function(){
   
    this._actorStarWindow.setActor($gameParty.menuActor())
    this._needWindow.setActor($gameParty.menuActor())
    this._nextStarWindow.setActor($gameParty.menuActor())
    this._actorStarWindow.nextStarChange()
    //this._actorMenuWindow.deactivate();
    this._actorMenuWindow.playOkSound();
    this._actorMenuWindow.activate();
}

   
