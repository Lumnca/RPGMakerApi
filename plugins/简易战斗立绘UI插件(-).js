
//=============================================================================
// SimpleBattleUI
//=============================================================================

/*:
 * @plugindesc 自定义建议战斗立绘
 * @author Lumnca
 * 
 * @param ImgX
 * @desc 立绘图片显示的位置X坐标
 * @default 700
 * 
 * @param ImgY
 * @desc 立绘图片显示的位置Y坐标
 * @default 618
 * 
 * @param ImgWidth
 * @desc 立绘图片每帧的宽度
 * @default 200
 * 
 * @param ImgHeight
 * @desc 立绘图片每帧的高度
 * @default 260
 * 
 * @param ActorX
 * @desc 第一个人立绘位置的x坐标
 * @default 80
 *
 * @param ActorY
 * @desc 第一个人立绘位置的y坐标
 * @default 280
 *
 * @param ActorOffX
 * @desc 后面每个人相对前面一个人的x值差
 * @default 20
 *
 *  
 * @param ActorOffY
 * @desc  后面每个人相对前面一个人的y值差（建议为图片高度的1/3）
 * @default 90
 *
 * @param AllPosition
 * @desc  所有人位置按照逗号隔开比如(1,1,2,2,3,3,4,4)
 * @default 90
 *
 * @param ActorIndex
 * @desc 每个人物层级优先级，越大在越上面,比如1,2,3,4
 * @default 1,2,3,4
 * 
 * @param StateY
 * @desc 状态显示距离图片顶部的距离
 * @default 40
*/

var parameters_SimpleBattleUI = PluginManager.parameters('SimpleBattleUI');
var acx = Number(parameters_SimpleBattleUI["ActorX"]);
var acy = Number(parameters_SimpleBattleUI["ActorY"]);
var acofx = Number(parameters_SimpleBattleUI["ActorOffX"]);
var acofy = Number(parameters_SimpleBattleUI["ActorOffY"]);
var position = parameters_SimpleBattleUI["AllPosition"].split(",");
var actorSort = parameters_SimpleBattleUI["ActorIndex"].split(",");

ImageManager.loadBHud = function(filename) {
    return this.loadBitmap('img/Battle_UI/', filename, 0, true);
};	


Spriteset_Battle.prototype.createActors = function() {
    this._actorSprites = [];
    for (var i = 0; i < $gameParty.maxBattleMembers(); i++) {
        this._actorSprites[i] = new Sprite_ActorSUI();     
    }

    for (var i = 0; i < this._actorSprites.length; i++) {
        this._battleField.addChild(this._actorSprites[Number(actorSort[i])-1]);
    }
};

Spriteset_Battle.prototype.updateActors = function() {
    var members = $gameParty.battleMembers();
    for (var i = 0; i < this._actorSprites.length; i++) {
        this._actorSprites[i].setBattler(members[i]);
    }
};



function Sprite_ActorSUI() {
    this.initialize.apply(this, arguments);
}

Sprite_ActorSUI.prototype = Object.create(Sprite_Battler.prototype);
Sprite_ActorSUI.prototype.constructor = Sprite_ActorSUI;

Sprite_ActorSUI.MOTIONS = {
    walk:     { index: 0,  loop: false  },
    wait:     { index: 0,  loop: false  },
    chant:    { index: 2,  loop: true  },//释放技能
    guard:    { index: 1,  loop: false  },//警卫
    damage:   { index: 1,  loop: false },//被攻击
    evade:    { index: 0,  loop: false },//逃避
    thrust:   { index: 2,  loop: true },//攻击
    swing:    { index: 2,  loop: false },//
    missile:  { index: 1,  loop: false },//躲避
    skill:    { index: 2,  loop: true },//技能释放前
    spell:    { index: 2, loop: true },//咒语
    item:     { index: 0, loop: false },//使用物品
    escape:   { index: 0, loop: false  },//逃跑
    victory:  { index: 0, loop: false  },//游戏胜利
    dying:    { index: 3, loop: false  },//生命值低
    abnormal: { index: 3, loop: false  },//不正常的状态
    sleep:    { index: 3, loop: false  },//睡觉
    dead:     { index: 4, loop: false  }//死亡
};

Sprite_ActorSUI.prototype.initialize = function(battler) {
   
    this._imgW = Number(parameters_SimpleBattleUI["ImgWidth"]);
    this._imgH = Number(parameters_SimpleBattleUI["ImgHeight"]);
    this._stx = Number(parameters_SimpleBattleUI["StateY"]);
    Sprite_Battler.prototype.initialize.call(this, battler);
    this.x = Number(parameters_SimpleBattleUI["ImgX"]);
    this.y = Number(parameters_SimpleBattleUI["ImgY"]);
  
    this.moveToStartPosition();
};

Sprite_ActorSUI.prototype.initMembers = function() {
    Sprite_Battler.prototype.initMembers.call(this);
    this._battlerName = '';
    this._motion = null;
    this._motionCount = 0;
    this._pattern = 0;
    //this.createShadowSprite();
    //this.createWeaponSprite();
    this.createMainSprite();
    this.createStateSprite();
};

Sprite_ActorSUI.prototype.createMainSprite = function() {
    this._mainSprite = new Sprite_Base();
    this._mainSprite.anchor.x = 0.5;
    this._mainSprite.anchor.y = 1;
    this.addChild(this._mainSprite);
    this._effectTarget = this._mainSprite;
};

Sprite_ActorSUI.prototype.createShadowSprite = function() {
    this._shadowSprite = new Sprite();
    this._shadowSprite.bitmap = ImageManager.loadSystem('Shadow2');
    this._shadowSprite.anchor.x = 0.5;
    this._shadowSprite.anchor.y = 0.5;
    this._shadowSprite.scale.set(2);
    this._shadowSprite.y = -2;
    this.addChild(this._shadowSprite);
};

Sprite_ActorSUI.prototype.createWeaponSprite = function() {
    this._weaponSprite = new Sprite_Weapon();
    this.addChild(this._weaponSprite);
};

Sprite_ActorSUI.prototype.createStateSprite = function() {
    this._stateSprite = new Sprite_StateOverlay();
    this.addChild(this._stateSprite);
    this._stateSprite.y =  -(this._imgH/2-this._stx);

};

Sprite_ActorSUI.prototype.setBattler = function(battler) {
    Sprite_Battler.prototype.setBattler.call(this, battler);
    var changed = (battler !== this._actor);
    if (changed) {
        this._actor = battler;
        if (battler) {
            this.setActorHome(battler.index());
        }
        this.startEntryMotion();
        this._stateSprite.setup(battler);
    }
};

Sprite_ActorSUI.prototype.moveToStartPosition = function() {
    this.startMove(-300, 0, 0);
};

Sprite_ActorSUI.prototype.setActorHome = function(index) {
    if(position.length>7){
        
        this.setHome(Number(position[index*2]),Number(position[index*2+1]));
    }
    else{
        this.setHome(acx + index * acofx, acy + index * acofy);
    }
  
};

Sprite_ActorSUI.prototype.update = function() {
    Sprite_Battler.prototype.update.call(this);
    //this.updateShadow();
    if (this._actor) {
        this.updateMotion();
    }
};



Sprite_ActorSUI.prototype.updateShadow = function() {
    this._shadowSprite.visible = !!this._actor;
};

Sprite_ActorSUI.prototype.updateMain = function() {
    Sprite_Battler.prototype.updateMain.call(this);
    if (this._actor.isSpriteVisible() && !this.isMoving()) {
        this.updateTargetPosition();
    }
};

Sprite_ActorSUI.prototype.setupMotion = function() {
    if (this._actor.isMotionRequested()) {
        this.startMotion(this._actor.motionType());
        this._actor.clearMotion();
    }
};

Sprite_ActorSUI.prototype.setupWeaponAnimation = function() {
    if (this._actor.isWeaponAnimationRequested()) {
        this._weaponSprite.setup(this._actor.weaponImageId());
        this._actor.clearWeaponAnimation();
    }
};

Sprite_ActorSUI.prototype.startMotion = function(motionType) {
    var newMotion = Sprite_ActorSUI.MOTIONS[motionType];
    if (this._motion !== newMotion) {
        this._motion = newMotion;
        this._motionCount = 0;
        this._pattern = 0;
    }
};

Sprite_ActorSUI.prototype.updateTargetPosition = function() {
    if (this._actor.isInputting() || this._actor.isActing()) {
        this.stepForward();
    } else if (this._actor.canMove() && BattleManager.isEscaped()) {
        this.retreat();
    } else if (!this.inHomePosition()) {
        this.stepBack();
    }
};

Sprite_ActorSUI.prototype.updateBitmap = function() {
    Sprite_Battler.prototype.updateBitmap.call(this);
    var name = this._actor.battlerName();
    if (this._battlerName !== name) {
        this._battlerName = name;
        this._mainSprite.bitmap = ImageManager.loadBHud(this._actor._actorId);
    }
};

Sprite_ActorSUI.prototype.updateFrame = function() {
    Sprite_Battler.prototype.updateFrame.call(this);
    var bitmap = this._mainSprite.bitmap;
    if (bitmap) {
        var motionIndex = this._motion ? this._motion.index : 0;
        /*
        var pattern = this._pattern < 3 ? this._pattern : 1;
        var cw = bitmap.width / 9;
        var ch = bitmap.height / 6;
        var cx = Math.floor(motionIndex / 6) * 3 + pattern;
        var cy = motionIndex % 6;*/
        this._mainSprite.setFrame(motionIndex*this._imgW,0,this._imgW,this._imgH);
    }
};

Sprite_ActorSUI.prototype.updateMove = function() {
    var bitmap = this._mainSprite.bitmap;
    if (!bitmap || bitmap.isReady()) {
        Sprite_Battler.prototype.updateMove.call(this);
    }
};

Sprite_ActorSUI.prototype.updateMotion = function() {
    this.setupMotion();
    //this.setupWeaponAnimation();
    if (this._actor.isMotionRefreshRequested()) {
        this.refreshMotion();
        this._actor.clearMotion();
        if(this._damageing){
            this._damageing = false;
        }
    }
    this.updateMotionCount();
};

Sprite_ActorSUI.prototype.updateMotionCount = function() {
    if (this._motion && ++this._motionCount >= this.motionSpeed()) {
        if (this._motion.loop) {
            this._pattern = (this._pattern + 1) % 4;
        } else if (this._pattern < 2) {
            this._pattern++;
        } else {
            this.refreshMotion();
        }
        this._motionCount = 0;
    }
};

Sprite_ActorSUI.prototype.motionSpeed = function() {
    return 12;
};

Sprite_ActorSUI.prototype.refreshMotion = function() {
    var actor = this._actor;
    var motionGuard = Sprite_ActorSUI.MOTIONS['guard'];
    if (actor) {
        if (this._motion === motionGuard && !BattleManager.isInputting()) {
                return;
        }
        var stateMotion = actor.stateMotionIndex();
        if (actor.isInputting() || actor.isActing()) {
            this.startMotion('walk');
        } else if (stateMotion === 3) {
            this.startMotion('dead');
        } else if (stateMotion === 2) {
            this.startMotion('sleep');
        } else if (actor.isChanting()) {
            this.startMotion('chant');
        } else if (actor.isGuard() || actor.isGuardWaiting()) {
            this.startMotion('guard');
        } else if (stateMotion === 1) {
            this.startMotion('abnormal');
        } else if (actor.isDying()) {
            this.startMotion('dying');
        } else if (actor.isUndecided()) {
            this.startMotion('walk');
        } else {
            this.startMotion('wait');
        }
        
    }
};

Sprite_ActorSUI.prototype.startEntryMotion = function() {
    if (this._actor && this._actor.canMove()) {
        this.startMotion('walk');
        this.startMove(0, 0, 30);
    } else if (!this.isMoving()) {
        this.refreshMotion();
        this.startMove(0, 0, 0);
    }
};

Sprite_ActorSUI.prototype.stepForward = function() {
    this.startMove(48, 0, 12);
};

Sprite_ActorSUI.prototype.stepBack = function() {
    this.startMove(0, 0, 12);
};

Sprite_ActorSUI.prototype.retreat = function() {
    this.startMove(-500, 0, 30);
};

Sprite_ActorSUI.prototype.onMoveEnd = function() {
    Sprite_Battler.prototype.onMoveEnd.call(this);
    if (!BattleManager.isBattleEnd()) {
        this.refreshMotion();
    }
};

Sprite_ActorSUI.prototype.damageOffsetX = function() {
    return -32;
};

Sprite_ActorSUI.prototype.damageOffsetY = function() {
    return -this._imgH/2;
};
