
//=============================================================================
/*:
* @target MZ
* @plugindesc 推理类插件对功能的修改
* @author Lumnca
* 
*
* @param useText
* @text 使用物品的名称
* @desc 
* @default 使用
*
* @param giveupText
* @text 丢弃物品的名称
* @desc 
* @default 丢弃
* @help
* ============================================================================
* Introduction
* ============================================================================
*
* 本插件特定类型游戏,不一定适用！
*
* ============================================================================
* Plugin Commands
* ============================================================================
*
* 物品新名词需要在备注中加入   <name:{1}月{2}日的纸条>
* 其中{1}和{2}代表变量表第一个和第二个的值
*
* ============================================================================
* Changelog
* ============================================================================
*
* Version 1.0:
* 初始创建
*/

(function () {
    const tuiLiParam = PluginManager.parameters('推理类定制插件');

    function Window_ItemSelect() {
        this.initialize(...arguments);
    }

    Window_ItemSelect.prototype = Object.create(Window_Command.prototype);
    Window_ItemSelect.prototype.constructor = Window_ItemSelect;

    Window_ItemSelect.prototype.initialize = function (rect) {
        Window_Command.prototype.initialize.call(this, rect);
        this.hide();
    };

    Window_ItemSelect.prototype.makeCommandList = function () {
        this.addCommand(tuiLiParam["useText"], "use");
        this.addCommand(tuiLiParam["giveupText"],'remove');
    };

    const create = Scene_Item.prototype.create;
    Scene_Item.prototype.create = function(){
        create.call(this);
        this._itemSelectWindow = new Window_ItemSelect({x:0,y:0,width:180,height:120});
        this.addChild(this._itemSelectWindow);

        this._itemSelectWindow.setHandler("use", this.onItemUse.bind(this));
        this._itemSelectWindow.setHandler("remove", this.removeItem.bind(this));
        this._itemSelectWindow.setHandler("cancel", ()=>{
            this.reSelect();
            this._itemWindow.activate();
        });
    }

    Scene_Item.prototype.reSelect = function(){
        this._itemSelectWindow.hide();
        this._itemSelectWindow.activate();
        this._itemSelectWindow.select(0);
    }

    Scene_Item.prototype.onItemUse = function(){
        if(this.item().noUse){
            SoundManager.playBuzzer();
            this._itemSelectWindow.activate();
        }
        else{
            $gameParty.setLastItem(this.item());
            this.determineItem();
            this.reSelect();
        }
    }

    Scene_Item.prototype.removeItem = function(){
        if(this.item().noUse){
            $gameParty.loseItem(this.item(),9,true)  
        }
        else{
            $gameParty.loseItem(this.item(),1)  
        }
       
        this.activateItemWindow();
        this.reSelect();
    }

    Window_MenuStatus.prototype.numVisibleRows = function() {
        return 8;
    };

    Window_MenuStatus.prototype.drawItem = function(index) {
        this.drawPendingItemBackground(index);
        const rect = this.itemRect(index);
        const actor = this.actor(index);
        this.drawActorCharacter(actor,rect.x+32,rect.y+this.itemHeight()/2+20);
        this.drawText(actor.name(),rect.x + 120,rect.y+this.lineHeight()/2)
    };

    const onItemOk = Scene_Item.prototype.onItemOk;
    Scene_Item.prototype.onItemOk = function() {
        var rect = this._itemWindow.itemLineRect(this._itemWindow.index());
        this._itemSelectWindow.x =  this._itemWindow.x + rect.x+rect.width-180;
        this._itemSelectWindow.y =  this._itemWindow.y + rect.y;
        this._itemSelectWindow.show();
    };


    Window_Status.prototype.drawBlock2 = function() {
        const y = this.block2Y();
        this.drawActorCharacter(this._actor, 32, y+32);
    };

    Window_StatusParams.prototype.setActor = function(actor) {
        if (this._actor !== actor &&  actor._actorId===1) {
            this._actor = actor;
            this.refresh();
        }
    };
    


    Window_ItemList.prototype.isEnabled = function(item) {
        if(item.atypeId || item.wtypeId ||  !$gameParty.canUse(item)){
            item.noUse = true;
        }
        return true;
        //return $gameParty.canUse(item);
    };
    const swapOrder = Game_Party.prototype.swapOrder;
    Game_Party.prototype.swapOrder = function(index1, index2) {
        if(index1===0||index2===0){
            SoundManager.playBuzzer();
        }
        else{
            swapOrder.call(this,index1,index2);
        }

    };


    Game_Actor.prototype.tradeItemWithParty = function(newItem, oldItem){
        if (newItem && !$gameParty.hasItem(newItem)) {
            return false;
        } else {
            return true;
        }
    }

    const gainItem = Game_Party.prototype.gainItem;
    Game_Party.prototype.gainItem = function (item, amount, includeEquip) {
        if (item) {
            //新名词解析
            let name = item.meta["name"];
            if (name) {
                let r = /\{\d\}/gi;
                item.name = name.replace(r, (str) => {
                    let v = $gameVariables.value([Number(str.substr(1, str.length - 2))]);
                    if (v) return v;
                    else return 'X';
                })

            }
            gainItem.call(this, item, amount, includeEquip);
        }

    }
})();
