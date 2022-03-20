//==============================================================
//
//=============================================================
/*:
* @plugindesc 可以在战斗场景中让敌方也使用和主角们一样的动作动画
* @author Lumnca
*
* @param actorImgSymbol
* @text 角色图片标志字符串
* @desc 在敌人列表备注上添加图片信息的前缀
* @default actor
*
*
* 
*===================================================
* @help
*===================================================
* 
* 需要准备人物各个动作的图画，也可以直接将 img\sv_actors 下的图片镜像反转（不会请百度PS如何让图片镜像反转）因为敌人在左侧。
* 请将图片放在img\sv_actors下
* 在敌人列表备注上添加图片信息:
* <actor:Enemy>  actor为前缀标志符可在参数处修改， Enemy为图片名称
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
* 初始创建，包含攻击动作，受到伤害动作，技能释放动作。
* 
*/
var Lumnca = Lumnca || {};
Lumnca.Param = Lumnca.Param || {};

Object.assign(Lumnca.Param, PluginManager.parameters('角色敌人'))
Lumnca.Param.actorImgSymbol = Lumnca.Param.actorImgSymbol ? Lumnca.Param.actorImgSymbol.trim() : 'actor'

console.log("ok")
Sprite_Enemy.Action = {
    attack: { index: 1, loop: false, timed: 36 },
    wait: { index: 2, loop: true, timed: 36 },
    hurted: { index: 14, loop: false, timed: 36 },
    dead : {index: 15, loop: true, timed: 36},
    skill : {index:8 ,loop: false, timed: 36}
}
Sprite_Enemy.prototype.setupAnim = function (type) {
    this.anim = Sprite_Enemy.Action[type];
    this.count = this.anim.timed;
}
//加载角色图片
const s1 = Sprite_Enemy.prototype.loadBitmap;
Sprite_Enemy.prototype.loadBitmap = function (name, hue) {
    s1.call(this, name, hue);
    //改用SvActor文件下图片，所以请将图片放在img\sv_actors下
    if (this._battler.enemy().meta[Lumnca.Param.actorImgSymbol]) {
        this.bitmap = ImageManager.loadSvActor(this._battler.enemy().meta[Lumnca.Param.actorImgSymbol], hue);
        this.setupAnim('wait');
    }
};
const s2 = Sprite_Enemy.prototype.updateFrame;
Sprite_Enemy.prototype.updateFrame = function () {
    s2.call(this);
    if (this._battler.enemy().meta[Lumnca.Param.actorImgSymbol]) {
        if (this.count > 0 && this.anim) {
            this.count--;
            let sf = Math.floor(this.count / 12);
            this.setFrame((sf % 3) * 64 + ((this.anim.index % 3) * 3 * 64), (Math.floor(this.anim.index / 3) * 64), 64, 64)
            if (this.anim.loop && this.count <= 0) {
                this.count = this.anim.timed;
            }
            else if (!this.anim.loop && this.count <= 0) {
                this.setupAnim('wait');
            }
        }
        else {
            this.setFrame(0, 0, 64, 64)
        }
    }
};
//敌人攻击动作
const s3 = Sprite_Enemy.prototype.startWhiten;
Sprite_Enemy.prototype.startWhiten = function() {
    s3.call(this);
    this.setupAnim('attack');
};
//敌人被攻击动作
const s4 = Sprite_Enemy.prototype.startBlink;
Sprite_Enemy.prototype.startBlink = function() {
   s4.call(this);
   this.setupAnim('hurted');
};

//敌人死亡动作
const s5 =Sprite_Enemy.prototype.startCollapse;
Sprite_Enemy.prototype.startCollapse = function() {
    s5.call(this);
    this.setupAnim('dead');
};
//添加动作
const s6 = Game_Enemy.prototype.performActionStart;
Game_Enemy.prototype.performActionStart = function(action) {
    s6.call(this,action);
    if(action.isMagicSkill()){
        this.requestEffect('bskill');
    }
  
};
//其余动作添加
const s7 = Sprite_Enemy.prototype.startEffect;
Sprite_Enemy.prototype.startEffect = function(effectType) {
    s7.call(this,effectType);
    if(effectType === 'bskill'){
        this.setupAnim('skill');
    }
    
};

