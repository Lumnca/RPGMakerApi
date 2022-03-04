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
* 
*===================================================
* @help
*===================================================
* 
* 在游戏数据库中角色备注中添加如下JSON格式数据
*
* {"身份":"贵族"}  
* {"声望值":15}
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
    let that = this;
   let datas = $dataActors[actorId].note.getLineText();
   datas.forEach(txt => {
        if(txt.indexOf('身份')>-1){
           let obj =  txt.getJSONdata();
           if(obj["身份"]) that["_iden"] = obj["身份"];
        }
        if(txt.indexOf('声望值')>-1){
           let obj =  txt.getJSONdata();
           if(obj["声望值"]) that["_pres"] = obj["声望值"];
        }
   });
   if(!that["_iden"])  that["_iden"] = "平民"; 
   if(!that["_pres"])  that["_pres"] = 0;
}