//=========================================================================================
 /*:
 * @plugindesc 显示所有装备信息的图鉴
 * @author Lumnca
 * 
 * 
 * 
 * 
 * @param weasponList
 * @desc 装备图鉴需要显示的武器id号，多个请用逗号隔开例如 1,2,3-7,8
 * @default 1,2,3,7-9,10
 * 
 * 
 * @param aromsponList
 * @desc 装备图鉴需要显示的防具id号，多个请用逗号隔开例如 1,2,3-7,8
 * @default 1,2,3,7-9,10 
 *
 * 
 * @help
 * 仅适配使用了GT_ObjectInfoWindow插件的显示装备图鉴插件，当前版本启用方式使用脚本命令！
 * 
 * 添加装备显示请在插件参数填入对应序号，多个连续可以“-” 减号隔开比如2-5表示2到5所有的装备
 * 多个请用逗号开个例如 1,2,3-5,7,9-20,31
 * 
 * 
 * 脚本命令: SceneManager.push(Scene_EquipInfo)
 *
 */
//=========================================================================================

var parameters_lumnca = PluginManager.parameters('EquipInfo');

var weaShowListString = String(parameters_lumnca['weasponList']).split(",");
var aromsponListString = String(parameters_lumnca['aromsponList']).split(",");
var weaShwoList = [];
var aromShowList = [];
weaShowListString.forEach(str => {
    if(str.indexOf("-")>-1){
        let start = Number( str.split("-")[0]);
        let end = Number(str.split("-")[1]);
        for(let i=start;i<=end;i++)weaShwoList.push(i);
    }
    else{
        weaShwoList.push(Number(str));
    }
});
aromsponListString.forEach(str => {
    if(str.indexOf("-")>-1){
        let start = Number( str.split("-")[0]);
        let end = Number(str.split("-")[1]);
        for(let i=start;i<=end;i++)aromShowList.push(i);
    }
    else{
        aromShowList.push(Number(str));
    }
});



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
    this.createTypeEvent();
    this._types = [];
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
    const types2 = $dataSystem.armorTypes;
    types2.forEach((type,i) => {
        if(type!=="") {
            this.addCommand(type,"a"+i);
        }
    });
}
Window_EquipType.prototype.createTypeEvent= function(){
   /* const types1 =  $dataSystem.weaponTypes;
    types1.forEach((type,i) => {
        if(type!=="") {
            this.setHandler("w"+i,this.setItemType.bind(this));
        }
    });
    const types2 = $dataSystem.armorTypes;
    types2.forEach((type,i) => {
        if(type!=="") {
            this.setHandler("a"+i,this.setItemType.bind(this));
        }
    });*/
}

Window_EquipType.prototype.select = function(index){
    Window_Command.prototype.select.call(this,index);
    this.setItemType();
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
    this.deselect();
    this._type = null;
    this._items = [];
    this._disabled = false;
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
        if(this._type[0]==='w'){
            $dataWeapons.forEach((item,i)=>{
                if(item){
                    if("w"+item.wtypeId==this._type&& weaShwoList.indexOf(item.id)>-1){
                        this.addCommand(item.name,"ws"+(this._items.length));
                        this._items.push(item);
                    }
                }
            })
        }
        else if(this._type[0]==='a'){
            $dataArmors.forEach((item,i)=>{
                if(item){
                    if("a"+item.atypeId==this._type && aromShowList.indexOf(item.id)>-1){
                        this.addCommand(item.name,"as"+(this._items.length));
                        this._items.push(item);
                    }
                }
            })
        }
     
    }
}

Window_EquipItemAsType.prototype.callOkHandler = function(){
    if(this._typeWindow){
        this._typeWindow.activate()
        this.deselect();
        this.deactivate();
        this.contents.clear();
        this._disabled = false;
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
    this._disabled = true;
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
    //===============================================================
    this._cancelButton = new Sprite_Button();
    this._cancelButton.bitmap = ImageManager.loadSystem('ButtonSet');
    this._cancelButton.setColdFrame(0,0,48,48);
    this._cancelButton.setHotFrame(0,48,48,48);
    this.addChild(this._cancelButton);

    this._cancelButton.x = Graphics.width - 48;

    this._cancelButton.setClickHandler(()=>{
        if(this._equipsWindow._disabled){
            this._equipInfoWindow.activate()
            this._equipsWindow.deselect();
            this._equipsWindow.deactivate();
            this._equipsWindow.contents.clear()
            this._equipsWindow._disabled = false;
        }
        else{
            SceneManager.pop();
        }
    })
};

Scene_EquipInfo.prototype.onItemCancel = function(){
    SceneManager.pop();
}



