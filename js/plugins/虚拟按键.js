//=============================================================================
 /*:
 * @plugindesc 虚拟按键
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
 * 这个插件可以让你使用虚拟按键
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
const spcomin = Game_System.prototype.initialize;
Game_System.prototype.initialize = function(){
    spcomin.call(this);
    this._keyWordButtons = [];
}


function createButtons(){

    let x = 80;//所有按键最左边的x坐标
    let y = Graphics.height-80;//所有按键最下边的y坐标
    let h = 72;//相邻的按钮间距
    let upKeyWord = getButton(7,1,()=>{
        $gamePlayer.moveStraight(8);
    })
    upKeyWord.x = x+h;
    upKeyWord.y = y-h*2;
    let leftKeyWord = getButton(7,2,()=>{
        $gamePlayer.moveStraight(4);
    })
    leftKeyWord.x = x;
    leftKeyWord.y = y -h;
    let rightKeyWord = getButton(7,3,()=>{
        $gamePlayer.moveStraight(6);
    })
    rightKeyWord.x = x+h*2;
    rightKeyWord.y = y-h;
    let bottomKeyWord = getButton(7,4,()=>{
        $gamePlayer.moveStraight(2);
    })
    bottomKeyWord.x = x+h;
    bottomKeyWord.y = y;
    $gameSystem._keyWordButtons.push(upKeyWord,bottomKeyWord,leftKeyWord,rightKeyWord);
    SceneManager._scene.addChild(upKeyWord);
    SceneManager._scene.addChild(bottomKeyWord);
    SceneManager._scene.addChild(leftKeyWord);
    SceneManager._scene.addChild(rightKeyWord);
}

const game_temp_set = Game_Temp.prototype.setDestination;
Game_Temp.prototype.setDestination = function(x, y) {
    if($gameSystem._keyWordButtons.length>0){
        let flag = false;
        $gameSystem._keyWordButtons.forEach(button => {
            if(button.isButtonArea())flag = true;
        });
    }
    else{
        game_temp_set.call(this,x,y);
    }
};

/**
 * 得到按钮精灵
 * @param {*} row keyword图片第几行的图像
 * @param {*} col keyword图片第几列的图像
 * @param {*} event 点事件
 * @param {*} width 图片中的按钮宽度
 * @param {*} height 图片中的按钮长度
 */
function getButton(row,col,event,width,height){
    let button = new Sprite_Button();
    width = width || 32;
    height = height || 32;
    button.bitmap = ImageManager.loadSystem('keyword');
    button.setColdFrame((col-1)*32,32*(row-1),width,height);
    button.setHotFrame((col-1)*32,32*(row),width,height);
    button.setClickHandler(event);
    button.w = width;
    button.h = height;
    button.isButtonArea = (x,y)=>{
        return x>button.x && x<button.x+button.w && y >button.y && y< button.y+button.h;
    }
    return button;
}
