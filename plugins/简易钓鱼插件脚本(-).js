

//=============================================================================
// SimpfishSystem
//=============================================================================

/*:
 * @plugindesc 自定义简易钓鱼系统
 * @author Lumnca
 * 
 * @param ImgX
 * @desc 钓鱼视图显示的位置X坐标
 * @default 120
 * 
 * @param ImgY
 * @desc 钓鱼视图显示的位置Y坐标
 * @default 60
 * 
 * @param CommonID
 * @desc 钓鱼成功后执行的公共事件ID
 * @default 1
 * 
 * 
 * @param CommonEID
 * @desc 钓鱼结束后执行的公共事件ID
 * @default 2
 * 
*/
var parameters_SimpleFishSystem = PluginManager.parameters('SimpfishSystem');



function Sprite_Bar() {
    this.initialize.apply(this, arguments);
}

Sprite_Bar.prototype = Object.create(Sprite.prototype);
Sprite_Bar.prototype.constructor = Sprite_Bar;

Sprite_Bar.prototype.initialize = function(w,h) {
    Sprite.prototype.initialize.call(this);
    this._barSprite = new Sprite();
    this._borderSprite = new Sprite();
    this._moveSprite = new Sprite();
    this._w = w;
    this._h = h;
    this._rotate = 0;
    this._count = 0;
    this.addChild(this._barSprite);
    this.addChild(this._borderSprite);
    this.addChild(this._moveSprite);
    this._speed = 2;
    this._start = 0;
    this._end = 1;
    //$gameSystem._bar1 = this;
    this.cretaeFishBar();
};

Sprite_Bar.prototype.cretaeFishBar = function(){
    this._fishImg = new Sprite();
    this._fishImg.bitmap = ImageManager.loadPicture('fish2');
    this.addChild(this._fishImg);
    this._fishImg.x = this._w - 72;
    this._fishImg.y = 70;

    this._fishBarSprite = new Sprite();
    this._fishBarSprite.bitmap = ImageManager.loadPicture('progressBarFill');
    this.addChild(this._fishBarSprite);
    this._fishBarSprite.y = this._fishImg.y +18;
    this._fishBarSprite.x = 60;

    this._fishBorderSprite = new Sprite();
    this._fishBorderSprite.bitmap = ImageManager.loadPicture('progressBarFore');
    this.addChild(this._fishBorderSprite);
    this._fishBorderSprite.y = this._fishImg.y +18;
    this._fishBorderSprite.x = 60;
    


}

Sprite_Bar.prototype.randSE = function(){
    this._start = Math.random()*0.8 + 0.1;
    this._end = this._start+(1-this._start)*this._start;
}

Sprite_Bar.prototype.checkSuccess = function(){
    if(this._moveSprite.x> this._start*this._w && this._moveSprite.x<this._end*this._w){
        this._rotate+= 0.35;
        SoundManager.playOk();
        if($gameSystem._event){
            $gameSystem._event.requestBalloon(3);
            
        }
    }
    else{
        this._rotate-= 0.1;
        SoundManager.playBuzzer();
        if($gameSystem._event){
            $gameSystem._event.requestBalloon(5);
        }
    }
    if(this._rotate>=1){
        if($gameSystem._event){
            $gameSystem._event.requestBalloon(1);
            this._rotate = 0;
            $gameTemp.reserveCommonEvent(Number(parameters_SimpleFishSystem['CommonID']));
        }
    }
    else if(this._rotate-0.01<0){
        if($gameSystem._event){
            $gameSystem._event.requestBalloon(6);
            $gameMessage.add("什么都没有钓到。。。还要继续吗?");
            this.createChoice();
        }
        
    }
}

Sprite_Bar.prototype.createChoice = function(){
    $gameMessage.setChoices(['YES','NO']);
    $gameMessage.setChoiceCallback(function(n) {
        if(n==0){
            
        }
        else{
            $gameTemp.reserveCommonEvent(Number(parameters_SimpleFishSystem['CommonEID']));
            SceneManager._scene._spriteset.closeFinsh();
        }
    }.bind(this));
}

Sprite_Bar.prototype.loadBitmap = function(b1,b2,b3){
    this._borderSprite.bitmap = ImageManager.loadPicture(b1);
    this._barSprite.bitmap = ImageManager.loadPicture(b2);
    if(b3){
        this._moveSprite.bitmap = ImageManager.loadPicture(b3);
        this._haveM = true;
        this._moveSprite.x =  this._barSprite.x;
        this._moveSprite.y = 15; 
    }
    if(this._barSprite.bitmap && this._barSprite.bitmap){
        this._bitmapAbled = true;
    }
}

Sprite_Bar.prototype.update = function() {
    Sprite.prototype.update.call(this);
    this.updateFrame();
};

Sprite_Bar.prototype.updateFrame = function() {
    if(this._rotate>0){
        this._rotate-=0.0005;
    }
    else{
        this._rotate = 0.005;
    }
    if (this._bitmapAbled) {
        this._barSprite.x = this._w *this._start;
        this._barSprite.setFrame(this._w *this._start,0,this._w *( this._end-this._start),this._h);
        this._fishBarSprite.setFrame(0,0,328*(this._rotate),37);
    }
    if(this._haveM){
        this._moveSprite.x+=this._speed;
        if(this._moveSprite.x>this._w-26){
            this._speed = -1 * this._speed;
        }
        if(this._moveSprite.x<0){
            this._speed = -1 * this._speed;
        }
    }
};

const _lumnca_setDestination = Game_Temp.prototype.setDestination;
Game_Temp.prototype.setDestination = function(x, y) {
    if($gameSystem._fishStart){
        SceneManager._scene._spriteset._bar.checkSuccess();
        SceneManager._scene._spriteset._bar.randSE();
        return;
    }
    _lumnca_setDestination.call(this,x,y);
};


const _lumnca_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
Spriteset_Map.prototype.createLowerLayer = function(){
    _lumnca_createLowerLayer.call(this);
    this.createFishSprite();
    
}

Spriteset_Map.prototype.closeFinsh = function(){
    $gameSystem._fishStart = false;
    this._fishMainSprite.hide();
}

Spriteset_Map.prototype.showFinsh = function(){
    $gameSystem._fishStart = true;
    this._fishMainSprite.show();
}

Spriteset_Map.prototype.createFishSprite = function(){
    let sprite = new Sprite_Base();
    this.addChild(sprite);
    sprite.x = Number(parameters_SimpleFishSystem['ImgX']);
    sprite.y = Number(parameters_SimpleFishSystem['ImgY']);

    let iconBack1 = new Sprite();
    iconBack1.bitmap = ImageManager.loadPicture('rodBackground');
    sprite.addChild(iconBack1);

    let rodSprite = new Sprite();
    rodSprite.bitmap =  ImageManager.loadPicture('rod1');
    sprite.addChild(rodSprite);

    let bar = new Sprite_Bar(457,70);
    bar.loadBitmap('gameBarFore','gameBarBack','cursorSmall');
    sprite.addChild(bar);
    bar.x =  128;
   

    this._bar = bar;
    this._fishMainSprite = sprite;

    sprite.hide();
}