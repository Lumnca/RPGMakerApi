//==============================================================
//
//=============================================================
/*:
* @plugindesc 攻击穿透玩法插件
* @author Lumnca
*
* @param atkText
* @text 物理穿透名称
* @desc 用于显示物理攻击穿透的名称或者叫法
* @default 物理穿透
*
* @param mtkText
* @text 魔法穿透名称
* @desc 用于显示魔法攻击穿透的名称或者叫法
* @default 魔法穿透
* 
*===================================================
*@help
*===================================================
*
* 这个插件可以让你在战斗计算中添加穿甲属性。使用方法在战斗伤害计算公式中添加穿甲计算即可如:
*
* a.atk * (1 - (b.def - a._ack) / (b.def + 200))
*
* _ack : 物理穿透
* _mck : 魔法穿透
*
* 为装备增加穿甲只需要在装备备注中添加如下标签即可:
*
* <ack:10>
* <mck:10>
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
* Version 2.0:
*
* 修改状态界面显示问题。取消显示装备信息！
*
*/
//=============================================================================

var Lumnca = Lumnca || {};
Lumnca.Param = Lumnca.Param || {};
Object.assign(Lumnca.Param, PluginManager.parameters('攻击穿透添加'))
Lumnca.Param.atkText = Lumnca.Param.atkText===''?'物理穿透':Lumnca.Param.atkText;
Lumnca.Param.mtkText = Lumnca.Param.mtkText===''?'魔法穿透':Lumnca.Param.mtkText;


(function(){

//=============================================================
//为角色添加穿透属性
//==============================================================

const Game_BattlerBase_initMembers = Game_BattlerBase.prototype.initMembers;
Game_BattlerBase.prototype.initMembers = function () {
    Game_BattlerBase_initMembers.call(this);
    this._ack = 0;
    this._mck = 0;
};


//=============================================================
//状态窗口显示
//==============================================================
const Window_Status_drawParameters = Window_Status.prototype.drawParameters;
Window_Status.prototype.drawParameters = function (x, y) {
    Window_Status_drawParameters.call(this, x, y);
    
};

//=============================================================
//装备切换数值比较窗口
//==============================================================
Window_EquipStatus.prototype.numVisibleRows = function () {
    return 9;
};
//不再显示装备
Window_Status.prototype.drawEquipments = function(x, y) {
    var lineHeight = this.lineHeight();
    this.changeTextColor(this.systemColor());
    this.drawText(Lumnca.Param.atkText, x, y, 160);
    this.resetTextColor();
    this.drawText(this._actor._ack, x + 160, y, 60, 'right');
    //魔法穿透
    this.changeTextColor(this.systemColor());
    this.drawText(Lumnca.Param.mtkText, x, y + lineHeight, 160);
    this.resetTextColor();
    this.drawText(this._actor._mck, x + 160, y + lineHeight, 60, 'right');
};

const Window_EquipStatus_refresh = Window_EquipStatus.prototype.refresh;
Window_EquipStatus.prototype.refresh = function () {
    Window_EquipStatus_refresh.call(this);
    let y = this.lineHeight() * 7;
    this.changeTextColor(this.systemColor());
    this.drawText(Lumnca.Param.atkText, 0, y, 180);
    if (this._actor) {
        this.resetTextColor();
        this.drawText(this._actor._ack, 140, y, 48, 'right');
    }
    this.drawRightArrow(188, y);
    this.changeTextColor(this.systemColor());
    if (this._tempActor) {
        this.drawNewValue(222, y, '_ack');
    }
    //魔穿
    this.changeTextColor(this.systemColor());
    let y2 = this.lineHeight() * 8;
    this.drawText(Lumnca.Param.mtkText, 0, y2, 180);
    if (this._actor) {
        this.resetTextColor();
        this.drawText(this._actor._mck, 140, y2, 48, 'right');
    }
    this.drawRightArrow(188, y2);
    this.changeTextColor(this.systemColor());
    if (this._tempActor) {
        this.drawNewValue(222, y2, '_mck');
    }
};

Window_EquipStatus.prototype.drawNewValue = function (x, y, param) {
    var newValue = this._tempActor[param];
    var diffvalue = newValue - this._actor[param];
    this.changeTextColor(this.paramchangeTextColor(diffvalue));
    this.drawText(newValue, x, y, 48, 'right');
};

//=============================================================
//装备切换重新计算穿透
//==============================================================
const Game_Actor_forceChangeEquip = Game_Actor.prototype.forceChangeEquip;
/**
 * 预览装备时的操作，item为预览的装备对象
 */
Game_Actor.prototype.forceChangeEquip = function (slotId, item) {

    this.penetratingDamage(slotId,item);
    Game_Actor_forceChangeEquip.call(this, slotId, item)
};
/**
 * 将装备装备上后的操作，item为已经装备对象
 */
const Game_Actor_changeEquip = Game_Actor.prototype.changeEquip;
Game_Actor.prototype.changeEquip = function (slotId, item) {
    this.penetratingDamage(slotId,item);
    Game_Actor_changeEquip.call(this, slotId, item);
};

Game_Actor.prototype.penetratingDamage = function (slotId,item) {
    let object;//当前装备
    if (this._equips[slotId]._dataClass === 'weapon') {
        object = $dataWeapons[this._equips[slotId]._itemId];
    }
    else if (this._equips[slotId]._dataClass === 'armor') {
        object = $dataArmors[this._equips[slotId]._itemId];
    }
    else {
        object = null;
    }
    if (!object && !item) {

    }
    else if (object && !item) {
        let vs = this.noteExtra(object);
        this._ack -= vs[0];
        this._mck -= vs[1];
    }
    else if (!object && item) {
        let vs = this.noteExtra(item);
        this._ack += vs[0];
        this._mck += vs[1];
    }
    else{
        let vs1 = this.noteExtra(object);
        let vs2 = this.noteExtra(item);
        this._ack += (vs2[0] - vs1[0])
        this._mck += (vs2[1] - vs1[2])
    }
}


Game_Actor.prototype.noteExtra = function (item) {
    let values = [0, 0]
    let meta = item.meta;
    values[0] = meta["ack"]? Number(meta["ack"]) : 0;
    values[1] = meta["mck"]? Number(meta["mck"]) : 0;
    return values;
}
}());