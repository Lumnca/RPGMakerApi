//=============================================================================
// AutoBattle.js
// ----------------------------------------------------------------------------
// Version
// 1.0.0  初始版本
//=============================================================================

/*:
 * @plugindesc 自动战斗插件，在战斗界面有一个选项可以使你的人物自动战斗，而不必自己每次选择战斗方式！
 * @author Lumnca
 *
 * @param PartyCommandName
 * @desc 队伍战斗窗口命令的自动作战命令名称。空白为不添加该选项
 * @default Auto
 *
 * @param PartyCommandIndex
 * @desc  队伍战斗窗口命令的自动作战命令的位置，-1为添加到末尾。
 * @default -1
 *
 * @param ActorCommandName
 * @desc 角色战斗窗口命令的自动作战命令名称。空白为不添加该选项
 * @default Auto
 *
 * @param ActorCommandIndex
 * @desc 角色战斗窗口命令的自动作战命令的位置，-1为添加到末尾。
 * @default -1
 * 
 * @param AffectedStrongBindState
 * @desc 影响正常战斗的状态id组合用逗号隔开如（1,2,3）
 * @default 
 * 
 * @help
 * 
 * 自动战斗插件使用方式：添加本插件即可
 *
 * This plugin is released under the MIT License.
 */


(function() {
    'use strict';
    var pluginName = '自动战斗插件';

    var getParamOther = function(paramNames) {
        if (!Array.isArray(paramNames)) paramNames = [paramNames];
        for (var i = 0; i < paramNames.length; i++) {
            var name = PluginManager.parameters(pluginName)[paramNames[i]];
            if (name) return name;
        }
        return null;
    };

    var getParamString = function(paramNames) {
        var value = getParamOther(paramNames);
        return value === null ? '' : value;
    };

    var getParamNumber = function(paramNames, min, max) {
        var value = getParamOther(paramNames);
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        return (parseInt(value, 10) || 0).clamp(min, max);
    };
    //以逗号分隔开
    var getParamArray= function(paramName){
        var array = PluginManager.parameters(pluginName)[paramName].split(",");
        for (let index = 0; index < array.length; index++) {
             array[index] = parseInt(array[index]);
            
        }
        return array;
    }

    //=============================================================================
    // 参数的取整
    //=============================================================================
    var paramPartyCommandName  = getParamString(['PartyCommandName', '']);
    var paramPartyCommandIndex = getParamNumber(['PartyCommandIndex', '']);
    var paramActorCommandName  = getParamString(['ActorCommandName', '']);
    var paramActorCommandIndex = getParamNumber(['ActorCommandIndex', '']);
    var BindStateArr           = getParamArray('AffectedStrongBindState');
   
    //=============================================================================
    // BattleManager
    // 添加角色自动战斗选项
    //=============================================================================
    BattleManager.processActorAuto = function() {
        this.actor().makeAutoBattleActions();
    };

    BattleManager.processPartyAuto = function() {
        $gameParty.members().forEach(function(member) {
            member.makeAutoBattleActions();
        });
        this.startTurn();
    };

    //=============================================================================
    // Scene_Battle
    //  创建自动攻击命令选项
    //=============================================================================
    var _Scene_Battle_createPartyCommandWindow      = Scene_Battle.prototype.createPartyCommandWindow;
    Scene_Battle.prototype.createPartyCommandWindow = function() {
        _Scene_Battle_createPartyCommandWindow.apply(this, arguments);
        //添加队伍自动攻击选项
        if (paramPartyCommandName) {
            this._partyCommandWindow.setHandler('auto', this.commandPartyAutoBattle.bind(this));
        }
        //添加测试选项
        //this._partyCommandWindow.setHandler('test', this.commandPartyTest.bind(this));
    };

    var _Scene_Battle_createActorCommandWindow      = Scene_Battle.prototype.createActorCommandWindow;
    Scene_Battle.prototype.createActorCommandWindow = function() {
        _Scene_Battle_createActorCommandWindow.apply(this, arguments);
        //添加个人自动攻击选项
        if (paramActorCommandName) {
            this._actorCommandWindow.setHandler('auto', this.commandActorAutoBattle.bind(this));
        }
    };

    Scene_Battle.prototype.commandPartyAutoBattle = function() {
        BattleManager.processPartyAuto();
        this.changeInputWindow();
    };

    Scene_Battle.prototype.commandActorAutoBattle = function() {
        BattleManager.processActorAuto();
        this.selectNextCommand();
    };
    //测试互动
    /*Scene_Battle.prototype.commandPartyTest = function() {
        console.log("test");
    };*/
    //===============================角色约束不能战斗判断=========================
    Game_Actor.prototype.isAffectedStrongBindState = function() {
		let isAffected = false;
		for(let i = 0, n = BindStateArr.length; i < n; i++){
			if(this.isStateAffected( BindStateArr[i] )){
				isAffected = true;
				break;
			};
		}
		return isAffected;
	};

    //=============================================================================
    // Window_PartyCommand
    // 队伍战斗窗口自动命令添加
    //=============================================================================
    var _Window_PartyCommand_makeCommandList      = Window_PartyCommand.prototype.makeCommandList;
    Window_PartyCommand.prototype.makeCommandList = function() {
        _Window_PartyCommand_makeCommandList.apply(this, arguments);
        if (paramPartyCommandName) this.addAutoCommand();
    };
    

    Window_PartyCommand.prototype.addAutoCommand = function() {
        let anyStrongBindMember = false;
        //每个成员可行动则显示自动攻击
		$gameParty.battleMembers().forEach(function(actor){
            if(actor.isAffectedStrongBindState()){anyStrongBindMember = true};
        });
        this.addCommand(paramPartyCommandName, 'auto', !anyStrongBindMember);
        //this.addCommand('测试', 'test');
        if (this._list[paramPartyCommandIndex]) {
            var command = this._list.pop();
            this._list.splice(1, paramPartyCommandIndex, command);
        }
    };

    //=============================================================================
    // Window_ActorCommand
    // 角色战斗窗口自动命令添加
    //=============================================================================
    var _Window_ActorCommand_makeCommandList      = Window_ActorCommand.prototype.makeCommandList;
    Window_ActorCommand.prototype.makeCommandList = function() {
        _Window_ActorCommand_makeCommandList.apply(this, arguments);
        if (this._actor && paramActorCommandName) {
            this.addAutoCommand();
        }
    };

    Window_ActorCommand.prototype.addAutoCommand = function() {
        this.addCommand(paramActorCommandName, 'auto');
        if (this._list[paramActorCommandIndex]) {
            var command = this._list.pop();
            this._list.splice(1, paramActorCommandIndex, command);
        }
    };
})();
