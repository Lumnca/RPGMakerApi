//ショップ画面で装備アイテムの全情報を表示
/*:

@plugindesc
在商店购买设备时获取更多信息


@author
シトラス

@param manual1
@desc
説明文の1行目です
@default
ここをタップ、クリックするか

@param manual2
@desc
説明文の2行目です
@default
shiftキーを押すと装備キャラを

@param manual3
@desc
説明文の3行目です
@default
切り替えることができます。

@param manualColorNumber
@desc
説明文の色を表す数字です。 defaultまたは数字以外を
入力した:17(黄色)
@default
17

@help
Ver1.0.0
このプラグインはMITライセンスの下で公開しています。
このプラグインにはプラグインコマンドはありません。
*/
(function(){
	var parameters = PluginManager.parameters('EquipInfoAllView');
	Window_ShopStatus.prototype.pageSize = function() {
		return 1;
	};
	Window_ShopStatus.prototype.standardFontSize = function() {
		return 20;
	};
	Window_ShopStatus.prototype.drawParamName = function(x, y, paramId) {
		this.changeTextColor(this.systemColor());
		this.drawText(TextManager.param(paramId), x, y, 120);
	};
	Window_ShopStatus.prototype.drawActorEquipInfo = function(x, y, actor) {
		var enabled = actor.canEquip(this._item);
		this.changePaintOpacity(enabled);
		this.resetTextColor();
		
		//アクターの名前を表示
		this.drawText(actor.name(), x, y - 30, 168);
		
		//ステータスの名前を表示
		for(var i = 0;i < 8;i++){
			this.drawParamName(x,127 + i*25,i);
		}
		
		
		var item1 = this.currentEquippedItem(actor, this._item.etypeId);
		if (enabled) {
			this.drawActorParamChange(x, y, actor, item1);
		}
		
		//現在装備しているアイテムの名前を表示
		this.drawItemName(item1, x, y + this.lineHeight() - 25);
		this.changePaintOpacity(true);
		
		//ウィンドウの操作法を表示
		this.drawManual(x,330);
	};

	Window_ShopStatus.prototype.drawManual = function(x,y){
		var width1 = this.textWidth(parameters.manual1);
		var width2 = this.textWidth(parameters.manual2);
		var width3 = this.textWidth(parameters.manual3);
		var manualColorNumber;
		if(isNaN(parameters.manualColorNumber) ){
			manualColorNumber = 17;
		}else{
			manualColorNumber = Number(parameters.manualColorNumber);
		}
		
		this.changeTextColor(this.textColor(manualColorNumber) );
		this.drawText(parameters.manual1,x,y     ,width1,"left");
		this.drawText(parameters.manual2,x,y + 25,width2,"left");
		this.drawText(parameters.manual3,x,y + 50,width3,"left");
	}

	Window_ShopStatus.prototype.drawActorParamChange = function(x, y, actor, item1) {
		var width = this.contents.width - this.textPadding() - x;
		var changeParams = new Array(8);
		for(var i = 0;i < 8;i++){
			changeParams[i] = this._item.params[i] - (item1 ? item1.params[i] : 0);
			this.changeTextColor(this.paramchangeTextColor(changeParams[i] ) );
			this.drawText( (changeParams[i] > 0 ? '+' : '') + changeParams[i], x, 55 + y + i*25, width, 'right');
		}
	};
})();