//=============================================================================
 /*:
 * @target MZ
 * @plugindesc 宫格旋转拼图插件
 * @author Lumnca
 * 
 *
 * @param imgUrl
 * @text 拼图图集图片名称
 * @desc 
 * 需要做为拼图的图片来源，只需要一张图即可！（请把对应的图片放在img/system目录下）
 * @default 
 *
 * 
 * @param  grid
 * @text 拼图图块的长宽，图块必须为正方形
 * @desc 图块在图集中的长宽数值
 * @default  32
 * 
 * @param  tlength
 * @text  拼图图集图片每一行含有多少个图片
 * @desc 为了一个数字对应一个图片，请每一行图片占满一行
 * @default  10
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
 * 初始创建包含旋转图片，生成图片，自动判断是否完成
 */
//=============================================================================


const pingtuParam = PluginManager.parameters('宫格旋转拼图插件');
const pingtuGrid = Number(pingtuParam['grid']);
const pingtuLength = Number(pingtuParam['tlength']);
var pingtuPage = 0;


//拼图数据
const pt_data = [
    {
        col : 5,//多少列
        row : 5,//多少行
        imgs : [  
            [1,1,0,0,1], //5*5列的图片数据对应数字就对应那个图片第几个图像块
            [1,2,0,1,0],
            [0,1,0,0,1],
            [1,1,1,0,1],
            [1,0,1,1,1]
        ],
        result : [      //拼图最终答案0代表图片方向是向上的，1是方向向左的，2是方向向下的，3是方向向右的
            [0,0,0,0,0],
            [1,1,1,1,1],
            [2,2,2,2,2],
            [1,1,1,1,1],
            [1,1,1,1,1]
        ]
    },
    {
        col : 2,//多少列
        row : 2,//多少行
        imgs : [  
            [1,1], 
            [1,2],
        ],
        result : [      //拼图最终答案0代表图片方向是向上的，1是方向向左的，2是方向向下的，3是方向向右的
            [0,0],
            [0,0],
        ]
    }
]

//====================拼图精灵对象==============================================

function Sprite_PT() {
    this.initialize.apply(this, arguments);
}

Sprite_PT.prototype = Object.create(Sprite_Clickable.prototype);
Sprite_PT.prototype.constructor = Sprite_PT;

Sprite_PT.prototype.initialize = function(index) {
    Sprite_Clickable.prototype.initialize.call(this);
    this.anchor.set(0.5,0.5);
    this.pivot.set(0.5,0.5);
    this.rotation = 0;
    this._flag = 0;//标志
    this._result = -1;
    this._grid = pingtuGrid;
    this.createSprite(index);
};

Sprite_PT.prototype.createSprite = function(index){
    let col = index % pingtuLength;
    let row = Math.floor(index / pingtuLength);
    this.bitmap =  ImageManager.loadSystem(pingtuParam['imgUrl']);
    this.setFrame((col)*this._grid,this._grid*(row),this._grid,this._grid);
}


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
    this._sprites = [];
    ImageManager.loadSystem('keyword');
};

Scene_PT.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    this.createPT();
};

Scene_PT.prototype.createPT = function(){
    let data = pt_data[pingtuPage];
    this._data  = data;
    for (let i = 0; i < data.row; i++) {
        for (let j = 0; j < data.col; j++) {
            let sprite = new Sprite_PT(data.imgs[i][j]);
            sprite._flag = Math.floor(Math.random()*4);
            sprite._result = data.result[i][j];
          
            sprite.setRotation();
            sprite.x = (j+0.5) * sprite._grid;
            sprite.y = (i+0.5) * sprite._grid;
            sprite.onClick = ()=>{
                sprite._flag++;
                sprite.setRotation();
                this.checkSuccess();
            };
            this.addChild(sprite);
            this._sprites.push(sprite);
        }
    }
}

Scene_PT.prototype.checkSuccess = function(){
    for (let i = 0; i < this._sprites.length; i++) {
        const sprite = this._sprites[i];
        if(sprite._flag !== sprite._result){
            console.log(i)
            return false;
        }
    }
    $gameMessage.add('恭喜你完成拼图！')
    SceneManager.pop();
    return true;
}