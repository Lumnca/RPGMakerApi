//==============================================================
//
//=============================================================
/*:
* @plugindesc 为每个角色添加身份信息。
* @author Lumnca
*
* @param CharacterIdenName
* @text 身份称呢
* @desc 用于显示身份的名称
* @default 身份
*
* @param CharacterPrestige
* @text 身份声望值
* @desc 用于显示角色声望值
* @default 声望
*
*
* @param CharacterManName
* @text 男角色性别名称
* @desc 用于显示男角色性别的名称
* @default 男
*
* @param CharacterWomanName
* @text 女角色性别名称
* @desc 用于显示女角色性别的名称
* @default 女
*
* 
*===================================================
* @help
*===================================================
* 
* 在游戏数据库中角色备注中添加标签数据即可
*
*
*
* 所有符号均为英文半角输入，可以粘贴上面格式保证符号正确!
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
//=============================================================================

var Lumnca = Lumnca || {};
Lumnca.Param = Lumnca.Param || {};
Object.assign(Lumnca.Param, PluginManager.parameters('角色身份添加'))
Lumnca.Param.CharacterIdenName = Lumnca.Param.CharacterIdenName===''? '身份':Lumnca.Param.CharacterIdenName;
Lumnca.Param.CharacterPrestige = Lumnca.Param.CharacterPrestige===''? '声望':Lumnca.Param.CharacterPrestige;
Lumnca.Param.CharacterWomanName =  Lumnca.Param.CharacterWomanName===''? '女':Lumnca.Param.CharacterWomanName;
Lumnca.Param.CharacterManName =  Lumnca.Param.CharacterManName===''? '男':Lumnca.Param.CharacterManName;
Lumnca.Param.CharacterSex = ["男","女","?"]
//==============================================================
//为状态窗口添加身份信息
//=============================================================

const Window_Status_drawBlock2 = Window_Status.prototype.drawBlock2;
Window_Status.prototype.drawBlock2 = function(y) {
    Window_Status_drawBlock2.call(this,y);

    let _x1 = 456;
    var lineHeight = this.lineHeight();
    this.changeTextColor(this.systemColor());
    this.drawText(Lumnca.Param.CharacterPrestige, _x1, y, 160);
    this.resetTextColor();
    this.drawText(this._actor._pres, _x1 + 64, y, 160,'right');
    this.changeTextColor(this.systemColor());
    this.drawText(Lumnca.Param.CharacterIdenName, _x1,  y+lineHeight, 160);
    this.resetTextColor();
    this.drawText(this._actor._iden, _x1 + 64, y+lineHeight, 160,'right');
    //绘制性别
    this.changeTextColor(this.systemColor());
    this.drawText("性别", _x1,  y+lineHeight*2, 160);
    this.resetTextColor();
    this.drawText(Lumnca.Param.CharacterSex[this._actor.sex()], _x1 + 64, y+lineHeight*2, 160,'right');
};


//==============================================================
//在角色备注中读取身份并记录值
//=============================================================
const Game_Actor_setup=  Game_Actor.prototype.setup;
Game_Actor.prototype.setup = function(actorId) {
    Game_Actor_setup.call(this,actorId);
    this.dataRead(actorId);
};


Game_Actor.prototype.dataRead = function(actorId){

   let meta = $dataActors[actorId].meta;
   this["_iden"] = meta["iden"]? meta["iden"] : "平民";
   this["_pres"] = meta["pres"]? meta["pres"] : 0;
   this["_sex"] =  meta["sex"]?  meta["sex"]  : 0;
}


Game_Actor.prototype.getIden = function(){
    return this._iden;
}

Game_Actor.prototype.getPres = function(){
    return this._pres;
}

Game_Actor.prototype.sex = function(){
   return Number(this._sex);
}

