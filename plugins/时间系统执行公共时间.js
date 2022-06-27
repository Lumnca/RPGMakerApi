//=============================================================================
// GameDate.js (游戏时间系统)
//=============================================================================

/*:
 * @plugindesc 游戏时间系统添加
 * @author Lumna
 *
 * @param visible
 * @desc 显示
 * @default true
 *
 * @param x
 * @desc 显示的x坐标
 * @default 4
 * 
 * @param y
 * @desc 显示的y坐标
 * @default 4
 * 
 * @param speed
 * @desc 游戏时间速度（现实1秒大概代表游戏x分钟） x=1
 * @default 1 
 *
 * 
 * 
 *  
 * @param light_color
 * @desc 光照颜色
 * @default '#000'
 * 
 * @param light_enabled
 * @desc 是否开启游戏光照
 * @default true
 *
 * @param light_auto
 * @desc 是否按照时间自动变化游戏光照
 * @default true
 *
 * 
 * @param light_opacity
 * @desc 游戏光照固定光照透明度（light_auto为fasle启用）
 * @default 150
 * @help
 * 
 * 指令GameDate hidden 隐藏时间
 * 指令GameDate display 显示时间
 *
*/
var $gameDate = $gameDate || {};

$gameDate.Parameters = PluginManager.parameters('GameDate');
$gameDate.Param = $gameDate.Param || {};
$gameDate.Parameters.time = 0;
(function () {

    var _Game_Interpreter_pluginCommand =
        Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'GameDate') {
            switch (args[0]) {
                case 'display':
                    $gameDate.Parameters.visible = true;
                    break;
                case 'hidden':
                $gameDate.Parameters.visible = false;
                    break;
            }
        }
        else if(command === 'Light'){
            switch (args[0]) {
                case 'disabled':
                    $gameDate.Parameters.light_enabled = false;
                    break;
                case 'enabled':
                $gameDate.Parameters.light_enabled = true;
                    break;
                case 'color':
                $gameDate.Parameters.light_color = args[1];
                break;
                case 'auto_enabled':
                $gameDate.Parameters.light_auto = true;
                break;
                case 'auto_disabled':
                $gameDate.Parameters.light_auto = 0;
                break;

                case 'opacity':
                $gameDate.Parameters.light_opacity = args[1];
                break;
            }
        }
        else if(command === 'Time'){
            switch (args[0]) {
                case 'addDay':   
                timeDayAdd(args[1]);
                    break;
                case 'addHour':
                timeHourAdd(args[1]);
                break;
                case 'addMinute':
                timeMinuteAdd(args[1]);
            }
        }
        else if(command === 'Actor'){
            switch (args[1]) {
                case 'spBy':   
               actorSpCalculate(args[0],args[2]);
                    break;
                case 'spTo':
               actorSetSp(args[0],args[2]);
                break;
            }
        }
    };


    function timeHourAdd(i){

        $gameSystem._timed += (parseFloat(i)*60);
    }
    function timeMinuteAdd(i){
        $gameSystem._timed += parseFloat(i);
    }
    function timeDayAdd(i){
        $gameSystem._timed += (  $gameSystem._timed * 60 * 24);
    }


    function DateSprite() {
        this.initialize.apply(this, arguments);
    }

    DateSprite.prototype = Object.create(Sprite.prototype);
    DateSprite.prototype.constructor = DateSprite;
    DateSprite.prototype.initialize = function () {
        Sprite.prototype.initialize.call(this);
        //this.createAll();
        this.createText();
        this.x = $gameDate.Parameters.x;
        this.y = $gameDate.Parameters.y;
        this.speed = $gameDate.Parameters.speed;
        this.visible = $gameDate.Parameters.visible;
    }
    DateSprite.prototype.createAll = function () {
        this._sprite = new Sprite(ImageManager.loadBitmap('img/pictures/', 'Actor_1', true));
        this._sprite.move(20, 20);
        this.addChild(this._sprite);
    }
    DateSprite.prototype.createText = function () {
        let dateText = new Bitmap(100, 48);
        dateText.drawText('12:47', 4, 4, 100, 32);
        this._dateText = new Sprite(dateText);
        this.addChild(this._dateText);
    }

    DateSprite.prototype.update = function (fd) {
        this.visible = $gameDate.Parameters.visible;
        this._dateText.bitmap.clear();
        let h = getGameTime(this.speed).hour;
        let m = getGameTime(this.speed).mintue;
        this._dateText.bitmap.drawText((h >= 10 ? h : ("0" + h)) + ":" + (m >= 10 ? m : "0" + m), 4, 4, 100, 20);
        $gameSystem._timed += this.speed/120;
    }




    var smap = Scene_Map.prototype.update;
    var setup = Scene_Map.prototype.start;

    Scene_Map.prototype.start = function () {
        setup.call(this);
        //setup
        //this.lightSystem();
        this._dateSprite = new DateSprite();
        this.addChild(this._dateSprite);
    }


    Scene_Map.prototype.update = function () {
        smap.call(this);
       /* this._dateSprite.update();
        if($gameDate.Parameters.light_enabled){           
            this._lightMask.bitmap.clear();
            this._lightMask.bitmap.fillRect(0, 0, 960, 640, $gameDate.Parameters.light_color || '#000');
            if($gameDate.Parameters.light_auto){
                let h = getGameTime(this._dateSprite.speed).hour;
                let m = getGameTime(this._dateSprite.speed).mintue / 60;
                this._lightMask.opacity = Math.abs(h + m - 12) * (224 / 12) //(h+m - 12)*(h +m- 12) * (255/144);
            }
           else{
             this._lightMask.opacity = parseInt($gameDate.Parameters.light_opacity) || 0;
           }
        }
        else{
            this._lightMask.bitmap.clear();
        }*/
       

    }


    Scene_Map.prototype.lightSystem = function () {
        console.log(this)
        let bitmap = new Bitmap(960, 640);
        bitmap.fillRect(0, 0, 960, 640, $gameDate.Parameters.light_color || '#000');
      
        this._lightMask = new Sprite(bitmap);
        this.addChild(this._lightMask);

    }

    function getGameTime(speed) {

        const time = Math.floor($gameSystem._timed);

        let date = {
            year: Math.floor(time / 60 / 24 / 30 / 12),
            month: Math.floor(time / 60 / 24 / 30) % 13,
            day: Math.floor(time / 60 / 24) % 31,
            hour: Math.floor(time / 60) % 24,
            mintue: time % 60
        };
        return date;
    }

    var init =  Game_System.prototype.initialize;



    

    Game_System.prototype.initialize = function(){
        init.call(this);
        this._timed = 0;
    }

    
    window.getGameDate = function (key) {
        return getGameTime($gameDate.Parameters.speed)[key];
    }

    //玩家体力修改
    function actorSetSp(id,value){
        value = parseInt(value);
        $gameActors.actor(id).setSp(value);
      
    }
    //体力加减
    function actorSpCalculate(id,value){
        value = parseInt(value);
        let a = $gameActors.actor(id);
        a.setSp(a._sp + value);
    }


})();