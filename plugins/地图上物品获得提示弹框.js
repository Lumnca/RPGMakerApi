//=============================================================================
// MOG_TreasurePopup.js
//=============================================================================
/*:
 * @plugindesc 在地图上获取物品时弹出获得所得东西
 * @author Moghunter
 *
 * @param Duration
 * @desc 弹框持续时间
 * @default 15 
 *
 * @param Fade Speed
 * @desc 弹出速度
 * @default 5
 * 
 * @param X - Axis
 * @desc 相对人物x坐标位置
 * @default 0
 *
 * @param Y - Axis
 * @desc 相对人物y坐标位置
 * @default -32
 *
 * @param Random Movement
 * @desc Movimento aleatório.
 * @default false
 *
 * @param X Speed
 * @desc Velocidade de movimento X-Axis.
 * @default 0
 *
 * @param Y Speed
 * @desc Velocidade de movimento Y-Axis.
 * @default 1
 *
 * @param Font Size
 * @desc 显示字体大小
 * @default 16 
 *
 * @param Icon Scale
 * @desc 显示图标大小
 * @default 0.60
 *
 * @param Treasure Space Y-Axis
 * @desc Espaço entre um tesouro e outro.
 * @default 20
 *
 * @param Zoom Effect
 * @desc Ativar efeito de zoom.
 * @default false
 *
 * @param Gold Popup
 * @desc 金币是否弹出
 * @default true
 * 
 * @param Gold Icon Index
 * @desc 金币的图标
 * @default 163
 * 
 * @help  
 * =============================================================================
 * =============================================================================
 * 插件命令
 * =============================================================================
 * 使用以下命令来启用或者禁用弹框
 *
 * 隐藏
 * hide_treasure_popup 
 *
 * 启用
 * show_treasure_popup 
 *
 * ============================================================================
 * 版本
 * ============================================================================
 * (v1.1) - 借鉴初始版本
 *        
 */


//=============================================================================
// ** PLUGIN PARAMETERS
//=============================================================================
var Lumnca = Lumnca || {};
Lumnca.Param = Lumnca.Param || {};
Object.assign(Lumnca.Param, PluginManager.parameters('地图上物品获得提示弹框'))

    Lumnca.Param.trpopup_X = Number(Lumnca.Param['X - Axis'] || 0);
	Lumnca.Param.trpopup_Y = Number(Lumnca.Param['Y - Axis'] || 0);
	Lumnca.Param.trpopup_GoldVisible = String(Lumnca.Param['Gold Popup'] || "true");
	Lumnca.Param.trpopup_Random = String(Lumnca.Param['Random Movement'] || "false");
    Lumnca.Param.trpopup_SX = Number(Lumnca.Param['X Speed'] || 0);
	Lumnca.Param.trpopup_SY = Number(Lumnca.Param['Y Speed'] || 1);
	Lumnca.Param.trpopup_IconScale = Number(Lumnca.Param['Icon Scale'] || 0.60);
	Lumnca.Param.trpopup_ItemSpace = Number(Lumnca.Param['Treasure Space Y-Axis'] || 20);
	Lumnca.Param.trpopup_waitD = Number(Lumnca.Param['Duration'] || 15);
	Lumnca.Param.trpopup_Zoom = String(Lumnca.Param['Zoom Effect'] || "false");
	Lumnca.Param.trpopup_fadeSpeed = Number(Lumnca.Param['Fade Speed'] || 5);
    Lumnca.Param.trpopup_goldIconIndex = Number(Lumnca.Param['Gold Icon Index'] || 163);
    Lumnca.Param.trpopup_fontSize = Number(Lumnca.Param['Font Size'] || 16);	
	
//=============================================================================
// ** Game System
//=============================================================================

//==============================
// * Initialize
//==============================
var _mog_treapopup_Gsys_initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
    _mog_treapopup_Gsys_initialize.call(this);
	this._trspupData = []; //弹框数据
	this._trspupSprData = null;
	this._trspupVisible = true;
	this._trspupMapID = 0;
};	

//=============================================================================
// ** Scene Map
//=============================================================================

//==============================
// * Terminate
//==============================
var _mog_treapopup_scMap_terminate = Scene_Map.prototype.terminate;
Scene_Map.prototype.terminate = function() {
    _mog_treapopup_scMap_terminate.call(this);
	if (this._spriteset) {this._spriteset.recordTreasureData()};
};

//=============================================================================
// ** Game Interpreter
//=============================================================================

//==============================
// * Command 125 金币变化执行命令
//==============================
var _mog_treaPopUP_gint_command125 = Game_Interpreter.prototype.command125;
Game_Interpreter.prototype.command125 = function() {
	_mog_treaPopUP_gint_command125.call(this);
	if ((Lumnca.Param.trpopup_GoldVisible) === "true") { 
         this.checkTreasurePopup(3);
	};
	return true;	
};

//==============================
// * Command 126 
//==============================
var _mog_treaPopUP_gint_command126 = Game_Interpreter.prototype.command126;
Game_Interpreter.prototype.command126 = function() {
    _mog_treaPopUP_gint_command126.call(this);
    this.checkTreasurePopup(0);
	return true;	
};

//==============================
// * command 127
//==============================
var _mog_treaPopUP_gint_command127 = Game_Interpreter.prototype.command127;
Game_Interpreter.prototype.command127 = function() {
	_mog_treaPopUP_gint_command127.call(this);
    this.checkTreasurePopup(1);
	return true;
};

//==============================
// * command 128
//==============================
var _mog_treaPopUP_gint_command128 = Game_Interpreter.prototype.command128;
Game_Interpreter.prototype.command128 = function() {
	_mog_treaPopUP_gint_command128.call(this);
    this.checkTreasurePopup(2);
	return true;
};

//==============================
// * command 128
//==============================
Game_Interpreter.prototype.checkTreasurePopup = function(type) {
	if ($gameSystem._trspupVisible) {
		if (type > 2) {
		   var amount = this.operateValue(this._params[0], this._params[1], this._params[2]);
		} else {
		   var amount = this.operateValue(this._params[1], this._params[2], this._params[3]);
		};
   	    if (amount > 0 && SceneManager._scene.constructor.name === "Scene_Map") {
			for (i = 0; i < $gameMap.events().length; i++){
				var eve = $gameMap.events()[i];
				if (eve && (this._eventId === eve._eventId)) {
					var x = eve.screenX();
					var y = eve.screenY();
					$gameSystem._trspupData.push([this.trPopupType(type),amount,x,y]);
				};
			};
	   };
	};
};

//==============================
// * Tr popup Type
//==============================
Game_Interpreter.prototype.trPopupType = function(type) {
	if (type === 0) {return $dataItems[this._params[0]]};
	if (type === 1) {return $dataWeapons[this._params[0]]};
	if (type === 2) {return $dataArmors[this._params[0]]};
	return null;
};

//==============================
// * PluginCommand
//==============================
var _alias_mog_theaPopUP_pluginCommand = Game_Interpreter.prototype.pluginCommand
Game_Interpreter.prototype.pluginCommand = function(command, args) {
	_alias_mog_theaPopUP_pluginCommand.call(this,command, args);
	if (command === "show_treasure_popup")  {$gameSystem._trspupVisible = true};
	if (command === "hide_treasure_popup")  {$gameSystem._trspupVisible = false};
	return true;
};

//=============================================================================
// ** SpriteSet Base
//=============================================================================

//==============================
// ** create Hud Field
//==============================
Spriteset_Base.prototype.createHudField = function() {
	this._hudField = new Sprite();
	this._hudField.z = 10;
	this.addChild(this._hudField);
};

//==============================
// ** sort MZ
//==============================
Spriteset_Base.prototype.sortMz = function() {
   if(!this._hudField){
	   this.createHudField();
   }
   this._hudField.children.sort(function(a, b){return a.mz-b.mz});
};

//=============================================================================
// ** Spriteset Map 地图层添加弹出对象
//=============================================================================

//==============================
// ** create Lower Layer 在低图层创建窗口
//==============================
var _mog_TrePopup_sprMap_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
Spriteset_Map.prototype.createLowerLayer = function() {
    _mog_TrePopup_sprMap_createLowerLayer.call(this);
	if (!this._hudField) {this.createHudField()};
};

//==============================
// * create Upper Layer 在高图层添加
//==============================
var _mog_treapopup_sprmap_createUpperLayer = Spriteset_Map.prototype.createUpperLayer;
Spriteset_Map.prototype.createUpperLayer = function() {
    _mog_treapopup_sprmap_createUpperLayer.call(this);
	this.createTreasureField();
	if ($gameSystem._trspupSprData && $gameSystem._trspupMapID === $gameMap._mapId) {
		this.loadTreasureIcons()
	} else {
		$gameSystem._trspupData = [];
		$gameSystem._trspupSprData = null;		
	};
	$gameSystem._trspupMapID = $gameMap._mapId;
};

//==============================
// * record Treasure Data 记录数据
//==============================
Spriteset_Map.prototype.recordTreasureData = function() {
     if (!this._treasureIcons || this._treasureIcons.length === 0) {return};
	 $gameSystem._trspupSprData = [];
	 for (i = 0; i < this._treasureIcons.length; i++){
		 $gameSystem._trspupSprData[i] = {};
		 $gameSystem._trspupSprData[i]._item = this._treasureIcons[i]._item;
		 $gameSystem._trspupSprData[i]._amount = this._treasureIcons[i]._amount;
		 $gameSystem._trspupSprData[i].x = this._treasureIcons[i].x;
		 $gameSystem._trspupSprData[i].y = this._treasureIcons[i].y;
		 $gameSystem._trspupSprData[i].opacity = this._treasureIcons[i].opacity;
		 $gameSystem._trspupSprData[i].scale = this._treasureIcons[i].scale.x;
		 $gameSystem._trspupSprData[i]._sx = this._treasureIcons[i]._sx;
		 $gameSystem._trspupSprData[i]._sy = this._treasureIcons[i]._sy;
		 $gameSystem._trspupSprData[i]._cx = this._treasureIcons[i]._cx;
		 $gameSystem._trspupSprData[i]._cy = this._treasureIcons[i]._cy;
		 $gameSystem._trspupSprData[i]._wait = this._treasureIcons[i]._wait;		 
	 };
};

//==============================
// * create Treasure Field 初始化弹出数据
//==============================
Spriteset_Map.prototype.createTreasureField = function() {
	this._treasureIcons = [];
    this._treasureField = new Sprite();
	this._treasureField.mz = 110;
	this.addChild(this._treasureField);
	this.sortMz();
};

//==============================
// * create Upper Layer 更新帧
//==============================
var _mog_treapopup_sprmap_update = Spriteset_Map.prototype.update;
Spriteset_Map.prototype.update = function() {
    _mog_treapopup_sprmap_update.call(this);
	if (this._treasureField) {this.updateTreasureIcons()};
};

//==============================
// * load Treasure Icons 根据$gameSystem数据加载需要显示物品的数据
//==============================
Spriteset_Map.prototype.loadTreasureIcons = function() {
	for (i = 0; i < $gameSystem._trspupSprData.length; i++){
         this._treasureIcons.push(new TreasureIcons(null,$gameSystem._trspupSprData[i],i,$gameSystem._trspupSprData.length));
	     this._treasureField.addChild(this._treasureIcons[i]);
	};
	$gameSystem._trspupSprData = null;
};

//==============================
// * refresh Treasure Icons 对弹出信息框添加子元素
//==============================
Spriteset_Map.prototype.refreshTreasureIcons = function() {
	for (i = 0; i < $gameSystem._trspupData.length; i++){
        this._treasureIcons.push(new TreasureIcons($gameSystem._trspupData[i],null,i,$gameSystem._trspupData.length));
		this._treasureField.addChild(this._treasureIcons[this._treasureIcons.length - 1])
	};
	$gameSystem._trspupData = [];
};

//==============================
// * need Refresh Treasure Icons
//==============================
Spriteset_Map.prototype.needRefreshTreasureIcons = function() {
	if ($gameSystem._trspupData.length > 0) {return true};
    return false;
};

//==============================
// * create Treasure Icons 透明度到消失并移除对象
//==============================
Spriteset_Map.prototype.updateTreasureIcons = function() {
     if (this.needRefreshTreasureIcons()) {this.refreshTreasureIcons()};
	 for (i = 0; i < this._treasureIcons.length; i++){
		  if (this._treasureIcons[i].opacity === 0 && this._treasureIcons[i]._wait[1] <= 0) {
			  this._treasureField.removeChild(this._treasureField[i]);
			  this._treasureIcons.splice(i, 1);
		  };
	 };
};

//=============================================================================
// * 弹出对象框精灵
//=============================================================================
function TreasureIcons() {
    this.initialize.apply(this, arguments);
};

TreasureIcons.prototype = Object.create(Sprite.prototype);
TreasureIcons.prototype.constructor = TreasureIcons;

//==============================
// * Initialize
//==============================
TreasureIcons.prototype.initialize = function(data,dataOld,fx,fmax) {
    Sprite.prototype.initialize.call(this);	
    this._fadeSpeed = Math.min(Math.max(Lumnca.Param.trpopup_fadeSpeed,1),100);
	this._waitR = Math.min(Math.max(Lumnca.Param.trpopup_waitD,1),999);
	this._zoomAn = String(Lumnca.Param.trpopup_Zoom) === "true" ? true : false;
	this._fx = fx;
	this._fmax = fmax * this.waitD();
    this.createName();
	this.createIcon();
    if (dataOld) {
	   this.setupOld(dataOld);
	} else {
	   this.setupNew(data);
    }
	this.refreshIcon();
	this.refreshName();
	this.x = -this.screenX() + this._cx;
	this.y = -this.screenY() + this._cy;	
};

//==============================
// * SetupOld
//==============================
TreasureIcons.prototype.setupOld = function(data) {
	this._item = data._item;
	this._amount = data._amount;
	this.x = data.x;
	this.y = data.y;
	this.scale.x = data.scale;
	this.scale.y = data.scale;
	this.opacity = data.opacity;
	this._sx = data._sx;
	this._sy = data._sy;
	this._cx = data._cx;
	this._cy = data._cy;	
	this._wait = data._wait;
};	


//==============================
// * wait D
//==============================
TreasureIcons.prototype.waitD = function() {
	return this._waitR;
};

//==============================
// * SetupNew
//==============================
TreasureIcons.prototype.setupNew = function(data) {
	this._item = data[0];
	this._amount = data[1];
	var name = this._item ? this._item.name + " x " + this._amount : this._amount;
	var wd = this._name.bitmap.measureTextWidth(name);
	this._cx = data[2] - ((Window_Base._iconWidth + 12 + wd) / 2) + Lumnca.Param.trpopup_X + this.screenX() ;
	this._cy = data[3] - Window_Base._iconHeight + Lumnca.Param.trpopup_Y + this.screenY();
	this._cy -= (this._fx * Lumnca.Param.trpopup_ItemSpace);
	var iw = this._fx * this.waitD();
	var iw2 = this.waitD() + (this._fmax - iw);
	this._wait = [15,iw2];
	this.opacity = 0;
	if (String(Lumnca.Param.trpopup_Random) === "true") {
		var d = Math.randomInt(2);
		var sx = (Math.random() * this.sxi() + this.sxi());
		this._sx = d === 0 ? sx : -sx
		this._sy = -(Math.random() + this.syi());
	} else {
		this._sx = this.sxi()
		this._sy = -this.syi();		
	};
};	

//==============================
// * sxi
//==============================
TreasureIcons.prototype.sxi = function() {
	return Lumnca.Param.trpopup_SX;
};

//==============================
// * syi
//==============================
TreasureIcons.prototype.syi = function() {
	return Lumnca.Param.trpopup_SY;
};

//==============================
// * createIcon 创建图标对象集合
//==============================
TreasureIcons.prototype.createIcon = function() {
	this._iconImg = ImageManager.loadSystem("IconSet");
    this._icon = new Sprite(this._iconImg);
	this._icon.scale.x = Math.min(Math.max(Lumnca.Param.trpopup_IconScale,0.10),3.00);;
	this._icon.scale.y = this._icon.scale.x;
	this._icon.anchor.x = 0.5;
	this._icon.anchor.y = 0.5;
	this._icon.x = Window_Base._iconWidth / 2;
	this._icon.y = Window_Base._iconHeight / 2;
	this.addChild(this._icon);
};

//==============================
// * refresh Icon 绘制对象图标
//==============================
TreasureIcons.prototype.refreshIcon = function() {
	var w = Window_Base._iconWidth;
	var h = Window_Base._iconHeight;
	//绘制图标索引，为null代表金币
	var iconindex = this._item ? this._item.iconIndex : Lumnca.Param.trpopup_goldIconIndex;
	var sx = iconindex % 16 * w;
	var sy = Math.floor(iconindex / 16) * h;
    this._icon.setFrame(sx,sy,w,h);	
};

//==============================
// * create Name 绘制名称精灵图像
//==============================
TreasureIcons.prototype.createName = function() {
	this._name = new Sprite(new Bitmap(150,32));
	this._name.x = Window_Base._iconWidth + 4;
	this._name.bitmap.fontSize = Lumnca.Param.trpopup_fontSize;
	this.addChild(this._name);
};

//==============================
// * refresh Name
//==============================
TreasureIcons.prototype.refreshName = function() {
	this._name.bitmap.clear();
	//显示物品类获得格式 物品名称 x 物品数量，为null代表是金币
	var name = this._item ? this._item.name + " x " + this._amount : "+"+this._amount+"G";
	this._name.bitmap.drawText(name,0,0,145,32);
};

//==============================
// * screen Y
//==============================
TreasureIcons.prototype.screenX = function() {
	return $gameMap.displayX() * $gameMap.tileWidth();
};

//==============================
// * screen Y
//==============================
TreasureIcons.prototype.screenY = function() {
	return $gameMap.displayY() * $gameMap.tileHeight();
};

//==============================
// * Update Position
//==============================
TreasureIcons.prototype.updatePosition = function() {
	this.x = -this.screenX() + this._cx;
	this.y = -this.screenY() + this._cy;
};

//==============================
// * Update Movement
//==============================
TreasureIcons.prototype.updateMovement = function() {
	this._cx += this._sx;
	this._cy += this._sy;
};

//==============================
// * Update Other
//==============================
TreasureIcons.prototype.updateOther = function() {
    this.opacity -= this._fadeSpeed; 
	if (this._zoomAn) {
	    this.scale.x += 0.01;
	    this.scale.y = this.scale.x
	};
};

//==============================
// * Update
//==============================
TreasureIcons.prototype.update = function() {
    Sprite.prototype.update.call(this);	 
	if (this._wait[0] > 0) {this._wait[0]--;
		this.opacity += 17; 
		this.updatePosition();
		if (this._wait[1] <= 0) {this.opacity += 255;this._wait[0] = 0};
	    return
	};
	if (this._wait[1] > 0) {
		this._wait[1]--;
		this.updatePosition();
	    return
	};
	this.updateMovement();
    this.updateOther();
	this.updatePosition();
};