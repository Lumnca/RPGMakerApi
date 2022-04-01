//=============================================================================
 /*:
 * @plugindesc 装备可强化
 * @author Lumnca
 *
 * @param Default Show
 * @text 默认显示
 * @desc 
 * NO - false     YES - true
 * @default true
 *
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * 这个插件可以让你的装备可以强化
 *
 * ============================================================================
 * Plugin Commands
 * ============================================================================
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
Window_EquipCommand.prototype.maxCols = function() {
    return 4;
};

const Window_EquipCommand_makeCommandList = Window_EquipCommand.prototype.makeCommandList;
Window_EquipCommand.prototype.makeCommandList = function() {
    Window_EquipCommand_makeCommandList.call(this);
    this.addCommand("强化",'qh');
};

const Scene_Equip_createCommandWindow = Scene_Equip.prototype.createCommandWindow;
Scene_Equip.prototype.createCommandWindow = function() {
    Scene_Equip_createCommandWindow.call(this);
    this._commandWindow.setHandler('qh',   this.updateEquip.bind(this));
};
Scene_Equip.prototype.updateEquip = function(){
    this._slotWindow.activate();
    this._slotWindow.refresh();
    console.log("OKKKK");
}