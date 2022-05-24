//=========================================================================================
 /*:
 * @plugindesc 显示所有装备信息的图鉴
 * @author Lumnca
 * 
 * 
 * @help
 * 
 * 仅适配使用了GT_ObjectInfoWindow插件
 *
 */
//=========================================================================================
//=====================================窗口=================================================
/**
 * 装备分类窗口
 */
function Window_EquipType() {
    this.initialize.apply(this, arguments);
}

Window_EquipType.prototype = Object.create(Window_Command.prototype);
Window_EquipType.prototype.constructor = Window_EquipType;

Window_EquipType.prototype.initialize = function(x,y) {
    Window_Command.prototype.initialize.call(this, x,y);
    this._text = '';
    this.createTypeEvent();
};

Window_EquipType.prototype.windowWidth = function() {
    return 160;
};

Window_EquipType.prototype.windowHeight = function() {
    return Graphics.height;
};

Window_EquipType.prototype.makeCommandList = function() {
    this.getAllType();
};

Window_EquipType.prototype.getAllType = function(){
    const types1 =  $dataSystem.weaponTypes;
    types1.forEach((type,i) => {
        if(type!=="") {
            this.addCommand(type,"w"+i);
        }
    });
}
Window_EquipType.prototype.createTypeEvent= function(){
    const types1 =  $dataSystem.weaponTypes;
    types1.forEach((type,i) => {
        if(type!=="") {
            this.setHandler("w"+i,this.setItemType.bind(this));
        }
    });
}

Window_EquipType.prototype.setEquipWindow = function(window){
    this._equipsWindow = window;
}

Window_EquipType.prototype.setItemType = function(){
    if(this._equipsWindow){
        this._equipsWindow.setItem(this.currentData());
        this._equipsWindow.setType(this.currentSymbol());
    }
}



/**
 * 对应类型的装备
 */
function Window_EquipItemAsType() {
    this.initialize.apply(this, arguments);
}

Window_EquipItemAsType.prototype = Object.create(Window_Command.prototype);
Window_EquipItemAsType.prototype.constructor = Window_EquipItemAsType;

Window_EquipItemAsType.prototype.initialize = function(x,y) {
    Window_Command.prototype.initialize.call(this, x,y);
    this._type = null;
    this._items = [];
};

Window_EquipItemAsType.prototype.windowWidth = function() {
    return Graphics.width - 160;
};

Window_EquipItemAsType.prototype.windowHeight = function() {
    return Graphics.height;
};

Window_EquipItemAsType.prototype.makeCommandList = function() {
    this.getAllItemByType();
};

Window_EquipItemAsType.prototype.maxCols = function() {
    return 2;
};

Window_EquipItemAsType.prototype.drawItem = function(index) {
    var rect = this.itemRectForText(index);
    var align = this.itemTextAlign();
    this.changePaintOpacity(this.isCommandEnabled(index));
    var item = this._items[index];
    if(item.meta){
        if(item.meta.PCTipColor){
            this.changeTextColor(item.meta.PCTipColor);
        }
        else{
            this.changeTextColor(this.normalColor());
        }
    }
    this.drawIcon(item.iconIndex,rect.x,rect.y);
    this.drawText(this.commandName(index), rect.x+Window_Base._iconWidth, rect.y, rect.width, align);
};

Window_EquipItemAsType.prototype.getAllItemByType = function(){
    this._items = [];
    if(this._type){
        $dataWeapons.forEach((item,i)=>{
            if(item){
                if("w"+item.wtypeId==this._type){
                    this.addCommand(item.name,"ws"+(this._items.length));
                    this._items.push(item);
                }
            }
        })
    }
}

Window_EquipItemAsType.prototype.callOkHandler = function(){
    if(this._typeWindow){
        this._typeWindow.activate()
        this.deselect();
        this.contents.clear()
    }
}

Window_EquipItemAsType.prototype.setTypeWindow = function(window){
    this._typeWindow = window;
}




Window_EquipItemAsType.prototype.setItem = function(item){
    this._item = item;
}

Window_EquipItemAsType.prototype.item = function(){
    return this._items[this.index()] || null;
}

Window_EquipItemAsType.prototype.setType = function(type){
    this._type = type;
    this.refresh();
}

Window_EquipItemAsType.prototype.refresh = function() {
    this._handlers = {};
    this.activate()
    Window_Command.prototype.refresh.call(this);
};


//==============================================================================



//==============================场景==============================================
function Scene_EquipInfo() {
    this.initialize.apply(this, arguments);
}

Scene_EquipInfo.prototype = Object.create(Scene_Base.prototype);
Scene_EquipInfo.prototype.constructor = Scene_EquipInfo;

Scene_EquipInfo.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
};

Scene_EquipInfo.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    this._equipInfoWindow = new Window_EquipType(0,0);
    this._equipInfoWindow.setHandler('cancel', this.onItemCancel.bind(this));
    this.addChild(this._equipInfoWindow);
    //=====================================================================
    this._equipsWindow = new Window_EquipItemAsType(this._equipInfoWindow.width,0);
    this._equipsWindow.setTypeWindow(this._equipInfoWindow);
    this.addChild(this._equipsWindow);
    this._equipInfoWindow.setEquipWindow(this._equipsWindow);
    //=======================================================================
    this._objInfoWindow = new Window_ObjectInfo(GT.Param.OIWSceneEquipSet);
    this._equipsWindow.setObjInfoWindow(this._objInfoWindow);
    this.addChild(this._objInfoWindow);
};

Scene_EquipInfo.prototype.onItemCancel = function(){
    console.log("++++++++++++++++++++++++++++")
    //this._equipsWindow.deselect();
    //this._equipInfoWindow.activate();
    SceneManager.pop();
}



