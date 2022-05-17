//=============================================================================
 /*:
 * @plugindesc 宫格旋转拼图插件
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
 * 这个插件可以让你在游戏中实现拼图
 *
 * ============================================================================
 * Plugin Commands
 * ============================================================================
 *
 * 无
 *
 * ============================================================================
 * Changelog
 * ============================================================================
 *
 * Version 1.0:
 * 初始创建
 */
//=============================================================================
//拼图数据
const pt_data = [
    {
        col : 5,
        row : 5,
        imgs : [
            [1,1,0,0,1],
            [1,2,0,1,0],
            [0,1,0,0,1],
            [1,1,1,0,1],
            [1,0,1,1,1]
        ]
    }
]












//====================拼图精灵对象==============================================

function Sprite_PT() {
    this.initialize.apply(this, arguments);
}

Sprite_PT.prototype = Object.create(Sprite_Button.prototype);
Sprite_PT.prototype.constructor = Sprite_PT;

Sprite_PT.prototype.initialize = function(col,row) {
    Sprite_Button.prototype.initialize.call(this);
    this.anchor.set(0.5,0.5);
    this.pivot.set(0.5,0.5);
    this.rotation = 0;
    this._flag = 0;//标志
    this._grid = 32;

    this.bitmap = ImageManager.loadSystem('keyword');
    this.setFrame((col)*this._grid,this._grid*(row),this._grid,this._grid);
  
    this.setClickHandler(()=>{
        this._flag++;
        this.setRotation();
    })
};

Sprite_PT.prototype.isButtonTouched = function() {
    var x = TouchInput.x;
    var y = TouchInput.y;
    return x >= this.x-this.width/2  && y >= this.y-this.height/2 && x < this.x+this.width/2 && y < this.y+this.height/2;
};



Sprite_PT.prototype.update = function() {
    Sprite_Button.prototype.update.call(this);
};

Sprite_PT.prototype.setRotation = function(){
    this._flag = this._flag%4;
    this.rotation = (Math.PI/2) * this._flag;
}








function Scene_PT() {
    this.initialize.apply(this, arguments);
}

Scene_PT.prototype = Object.create(Scene_Base.prototype);
Scene_PT.prototype.constructor = Scene_PT;

Scene_PT.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
    this._rol = 0;//行
    this._cow = 0;//列
    ImageManager.loadSystem('keyword');
};

Scene_PT.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    this.createPT();
};

Scene_PT.prototype.createPT = function(){
    let data = pt_data[0];
    for (let i = 0; i < data.row; i++) {
        for (let j = 0; j < data.col; j++) {
            let sprite = new Sprite_PT(data.imgs[i][j],6);
            sprite._flag = Math.floor(Math.random()*4);
            sprite.setRotation();
            sprite.x = j * 32+16;
            sprite.y = i * 32+16;
            this.addChild(sprite);
        }
    }
}