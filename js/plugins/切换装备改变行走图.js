//==============================================================
//
//=============================================================
/*:
* @plugindesc 角色切换服装装备更改行走图
* @author Lumnca
*
* @param equipsIndex
* @text 装备索引号
* @desc 需要指定装备索引为执行切换行走图（装备索引号从装备栏从上往下数0开始）
* @default 1
*
*
* 
*===================================================
* @help
*===================================================
* 
* 需要准备人物各个样式的穿着的行走图并放在同一个图块中
* 然后再指定装备需要指向的图像名字，索引号
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
Object.assign(Lumnca.Param, PluginManager.parameters('切换装备改变行走图'))
Lumnca.Param.equipsIndex = Number(Lumnca.Param.equipsIndex || 0);
(function () {
	changeWalkCharacter = function (actor) {

		let canBare = false;
		
		// 使用对象
		if (!actor.actorId()) {
			return;
		}
		var equips = actor.equips();
		let e = equips[Lumnca.Param.equipsIndex];
		//没穿任何衣服
		if (e == null) {
			actor._battlerName = `Actor${actor.actorId()}_battle`;
			actor._characterIndex = 2;
		}
		else{
			canBare = true;
		}
		if(canBare) {
			if (e == null) {

			}
			//如果装备
			else {
				
				actor._characterName = (e.meta.changeImgName? e.meta.changeImgName :  actor._characterName)
				//actor._battlerName = `Actor${actor.actorId()}_battle${parseInt(equips[3].meta.change_bat) || 1}`;
				actor._characterIndex = parseInt(e.meta.changeImgIndex? e.meta.changeImgIndex : actor._characterIndex);
			}
		}
		$gamePlayer.refresh();
	};

	var Scene_Equip_terminate = Scene_Equip.prototype.terminate;
	Scene_Equip.prototype.terminate = function () {
		changeWalkCharacter(this.actor());
		Scene_Equip_terminate.call(this);
	};

	// Change Equipment
	Game_Interpreter.prototype.command319 = function () {
		var actor = $gameActors.actor(this._params[0]);
		if (actor) {
			actor.changeEquipById(this._params[1], this._params[2]);
			changeWalkCharacter(actor);
		}
		return true;
	};

})();
