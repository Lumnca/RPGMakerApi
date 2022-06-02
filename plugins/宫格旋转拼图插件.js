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
 * @param  ptGrid
 * @text  显示拼图图块的宽度大小
 * @desc 场景中拼图图块的大小
 * @default  32
 * 
 * @param  pd
 * @text  显示拼图图块的数据
 * @desc 所有拼图图块的数据
 * @default [{"col":5,"row":5,"imgs":[[1,1,0,0,1],[1,2,0,1,0],[0,1,0,0,1],[1,1,1,0,1],[1,0,1,1,1]],"result":[[0,0,0,0,0],[1,1,1,1,1],[2,2,2,2,2],[1,1,1,1,1],[1,1,1,1,1]],"time":30},{"col":2,"row":2,"imgs":[[1,1],[1,2]],"result":[[0,0],[0,0]],"time":26}]
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
const ptGrid = Number(pingtuParam['ptGrid']);
const p = JSON.parse(pingtuParam['pd']);
var pingtuPage = 0;


//拼图数据
const pt_data = [
    {
        col : 2,//多少列
        row : 2,//多少行
        imgs : [  
            [42,42], //2*2列的图片数据对应数字就对应那个图片第几个图像块
            [64,65],
        ],
        result : [      //拼图最终答案0代表图片方向是向上的，1是方向向左的，2是方向向下的，3是方向向右的
            [-1,-1],
            [0,0],
        ],
        time : 30
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
        ],
        time : 26
    },
    {},{},{},{}
]
//===================================数据======================================
const game_System_initializeL = Game_System.prototype.initialize;
Game_System.prototype.initialize = function(){
    game_System_initializeL.call(this);
    this._ptData = pt_data;
    this._curPt = 0;
    this._ptStart = false;
    this._orginPt = [];
}

Game_System.prototype.getCurPtData = function(){
    return this._ptData[this._curPt];
}

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
    this.scale.set(ptGrid/pingtuGrid);
    this._grid = ptGrid;
}


Sprite_PT.prototype.setRotation = function(){
    this._flag = this._flag%4;
    this.rotation = (Math.PI/2) * this._flag;
    SoundManager.playCursor();
}


//========================================================================================================


function Window_PTHelp() {
    this.initialize(...arguments);
}

Window_PTHelp.prototype = Object.create(Window_Base.prototype);
Window_PTHelp.prototype.constructor = Window_PTHelp;

Window_PTHelp.prototype.initialize = function(rect) {
    Window_Base.prototype.initialize.call(this, rect);
    this._count = 60;
    this._time = 19;
    this.refresh();
};

Window_PTHelp.prototype.createTime = function(){
    this.contents.clear();
    this.drawText("Time - "+this.timeText(),0,0,this.width-this.padding*2,'center');
    this.drawText("当前拼图序号:"+($gameSystem._curPt+1),0, this.lineHeight()+4,this.width-this.padding*2,'center');
    if(this._time<=0){
        this.drawText("游戏结束",0,100,this.width-this.padding*2,'center');
        $gameSystem._ptStart = false;
    }
}

Window_PTHelp.prototype.setPTWindow = function(window){
    this._ptWindow = window;
}

Window_PTHelp.prototype.createButtons = function(){
    this._reButton =  new Sprite_Button('cancel');
    this._reButton.x = this.padding;
    this._reButton.y = this.height - 64;
    this.addChild(this._reButton);

    this._reButton.onClick = ()=>{
        if(this._ptWindow)this._ptWindow.refresh();
        this._time = $gameSystem.getCurPtData().time;
    }

    

    this._backButton = new Sprite_Button('pagedown');
    this._backButton.y = this._reButton.y;
    this._backButton.x = this._reButton.x + this._reButton.width + 48;
    this.addChild(this._backButton);

    this._backButton.onClick = ()=>{
        $gameSystem._ptStart = false;
        SceneManager.pop();
    }


}

Window_PTHelp.prototype.timeText = function(){
    let m = Math.floor(this._time / 60).padZero(2)
    let s = (this._time % 60).padZero(2);
    return m+":"+s;
}

Window_PTHelp.prototype.update = function(){
    Window_Base.prototype.update.call(this);
    if(this._time>0){
        this._count--;
        if(this._count<=0){
            this._time--;
            this._count = 60;
            this.createTime();
        }
    }
}

Window_PTHelp.prototype.refresh = function(){
  
    this.createTime();
    this.createButtons();
}


function Window_PT() {
    this.initialize(...arguments);
}

Window_PT.prototype = Object.create(Window_Base.prototype);
Window_PT.prototype.constructor = Window_PT;

Window_PT.prototype.initialize = function(rect) {
    Window_Base.prototype.initialize.call(this, rect);
    this._sprites = [];
    ImageManager.loadSystem('keyword');
    this.refresh();
};

Window_PT.prototype.refresh = function(){
    this.contents.clear();
    this.createPT();
}

Window_PT.prototype.createPT = function(){
    let data = $gameSystem.getCurPtData();
    $gameSystem._ptStart = true;
    this._data  = data;
    for (let i = 0; i < data.row; i++) {
        for (let j = 0; j < data.col; j++) {
            let sprite = new Sprite_PT(data.imgs[i][j]);
            let n = Math.floor(Math.random()*4);
            if($gameSystem._orginPt[i*data.col+j]>-1){
                sprite._flag =  $gameSystem._orginPt[i*data.col+j];
            }
            else{
                sprite._flag = n;
                $gameSystem._orginPt[i*data.col+j] = n;
            }     
            sprite._result = data.result[i][j];
          
            sprite.setRotation();

            sprite.x = this.padding/2 + (j+0.5) * sprite._grid;
            sprite.y = this.padding/2 + (i+0.5) * sprite._grid;

            sprite.onClick = ()=>{
                if($gameSystem._ptStart){
                    sprite._flag++;
                    sprite.setRotation();
                    this.checkSuccess();
                }
            };
            this.addChild(sprite);
            this._sprites.push(sprite);
        }
    }
}

Window_PT.prototype.checkSuccess = function(){
    for (let i = 0; i < this._sprites.length; i++) {
        const sprite = this._sprites[i];
        if(sprite._flag !== sprite._result){
            console.log(i)
            return false;
        }
    }
    $gameMessage.add('恭喜你完成拼图！')
    $gameSystem._ptStart = false;
    SceneManager.pop();
    return true;
}




//=======================================================================================================





function Scene_PT() {
    this.initialize.apply(this, arguments);
}

Scene_PT.prototype = Object.create(Scene_Base.prototype);
Scene_PT.prototype.constructor = Scene_PT;

Scene_PT.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
    this._rol = 0;//行
    this._cow = 0;//列
   
};

Scene_PT.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
   // this.createPT();
   this._ptWindow = new Window_PT({x:0,y:0,width:480+ $gameSystem.windowPadding()*2,height:480+ $gameSystem.windowPadding()*2});


   this._phWindow = new Window_PTHelp({x:0,y:0,width:(Graphics.width-this._ptWindow.width)/2,height:this._ptWindow.height});

   this._ptWindow.x += Graphics.width/2-(this._ptWindow.width+this._phWindow.width)/2;
   this._ptWindow.y += Graphics.height/2-this._ptWindow.height/2;

   this._phWindow.x = this._ptWindow.width + this._ptWindow.x;
   this._phWindow.y = this._ptWindow.y;

   this._phWindow.setPTWindow(this._ptWindow);
   this.addChild(this._phWindow);
   this.addChild(this._ptWindow);
};

Scene_PT.prototype.createPT = function(){
   
}

Scene_PT.prototype.checkSuccess = function(){

}