/*:
 * @plugindesc 云雾系统添加
 * @author gentlawk
 * @website http://blueredzone.com
 * @url https://github.com/gentlawk/BMSP_MV
 * @license
 * Copyright(c) 2015 BlueRedZone, gentlawk
 * Released under the MIT license
 * https://github.com/gentlawk/BMSP_MV/blob/master/LICENSE
 *
 * @version 1.03
 *
 * @param Label
 * @desc 这是地图导航便笺的标签。
 * @default fog
 *
 * @help
 * 地图便笺：
 * <fog%n%:%name%，%sx%，%Sy%，opacity，%z%，%blend，%switchies%>在地图中添加雾霾。
 * %n%：是雾霾的编号。请指定一个或多个整数。
 * %name%:要使用的文件名。（初始值：“”）
 * %sx%:X方向的速度。（初始值：0）
 * %sy%:Y方向的速度。（初始值：0）
 * %opacity：不透明度。（初始值：255）
 * -%z%:Z坐标。0是远景正上方，1是图片正下方，2是图片正上方。（初始值：1）
 * %blend%:合成方法。0通常加1。（初始值：1）
 * %switchies%：显示条件开关ID列表。用“：”分隔符指定想要作为条件的开关的ID。（初始值：无指定※始终显示）
 * ※可通过参数更改备注的标签。
 * ※每个地图必须从1开始按顺序存在雾霾。
 * ※可省略%n%以外的各参数。省略时会使用初始值。
 * 此外，省略的参数以后的参数也必须全部省略。
 *
 *插件命令：
 *   MapFog %n% name %value% # 将雾霾中使用的文件修改为%value%。
 *   MapFog %n% sx %value% # 将雾霾中使用的sx件修改为%value%。
 *   MapFog %n% sy %value% # 将雾霾中使用的sy修改为%value%。
 *   MapFog %n% opacity %value% # 将雾霾中使用的 opacity修改为%value%。
 *   MapFog %n% blend %value% # 将雾霾中使用的 blend修改为%value%。
 *   MapFog %n% visible %value% # 将雾霾中使用的visible修改为%value%。
 *
 * 使用方法:
 *  在地图备注中描述雾霾设置，可以在地图上显示雾霾。
 *  一个地图上显示的雾霾数量是任意的，但雾霾编号必须从1开始按顺序移动。
 *  只在移动地图时判断雾霾的显示条件。
 *  在同一地图上切换雾霾显示时，请使用插件命令。
 *  请在以下目录中配置地图雾霾图像（请新建fogs目录）。
 *   img/fogs
 *
 * ●使用例
 *   fog表示
*<fog1:fogfile>
*
*显示两个雾霾
*<fog1:fogfile1，1,0,255>
*<fog2:fogfile2，0，0，255，0，0>
*
*开关10为ON时显示雾霾
*<fog1:fogfile，0，0,255，1,10>
*
*开关10为ON时显示雾霾，开关10和20为ON时显示雾霾2
*<fog1:fogfile1，0，0,255，1,10>
*<fog2:fogfile2，0，0，255，1，10:20>
 */
(function() {


    /*
     * 插件命令
     */
    var _Game_Interpreter_pluginCommand =
            Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'MapFog') {
            $gameMap.setFogParameter(args[1], Number(args[0]), args[2]);
        }
    };

    /*
     * MapFog
     */
    var MapFog = function() {
        throw new Error('This is a static class');
    };

    var parameters = PluginManager.parameters('BMSP_MapFog');
    MapFog._label  = parameters['Label'];

    MapFog._cache_settings = {};

    MapFog.getSettings = function(map) {
        var objectId =  new Date().getTime() + Math.floor(Math.random() * 1000);
        if(objectId in this._cache_settings){
            return this._cache_settings[objectId];
        }
        var index = 1;
        var settings = {};
        while((this._label + index) in map.meta){
            settings[index] = map.meta[this._label + index].split(',');
            index++;
        }
        
        this._cache_settings[objectId] = settings;
        return settings;
    };

    MapFog.getSprite = function(index) {
        if(!SceneManager._scene || SceneManager._scene.constructor !== Scene_Map) {
            return null;
        }
        var fogData = SceneManager._scene._spriteset._fogData;
        for(var i in fogData) {
            var data = fogData[i];
            if(data.index == index) return data.sprite;
        }
        return null;
    };

    /*
     * ImageManager
     */
    ImageManager.loadFog = function(filename, hue) {
        return this.loadBitmap('img/fogs/', filename, hue, true);
    };

    var _Game_Map_setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function(mapId) {
        _Game_Map_setup.call(this, mapId);
        this.setupFogs();
    };

    Game_Map.prototype.setupFogs = function() {
        this._fogs = {};
        var settings = MapFog.getSettings($dataMap);
        for(var index in settings) {
            var setting = settings[index];
            var cond = (setting[6] || '').split(':');
            var visible = true;
            if(cond[0] !== '') {

                visible = cond.every(function(id) {
                    return $gameSwitches.value(id);
                });
            }
            this._fogs[index] = {
                name:    setting[0] || '',
                sx:      Number(setting[1] || 0),
                sy:      Number(setting[2] || 0),
                opacity: Number(setting[3] || 255),
                z:       Number(setting[4] || 1),
                blend:   Number(setting[5] || 1),
                visible: visible,
                x:       0,
                y:       0,
                ox: 0,
                oy: 0
            }
        }
    };

    Game_Map.prototype.fogs = function() {
        return this._fogs;
    }

    var _Game_Map_update = Game_Map.prototype.update;
    Game_Map.prototype.update = function(sceneActive) {
        _Game_Map_update.call(this, sceneActive);
        this.updateFogs();
    };

    Game_Map.prototype.updateFogs = function() {
        for(var index in this._fogs) {
            // change by triacontane
            this._fogs[index].ox += this._fogs[index].sx;
            this._fogs[index].oy += this._fogs[index].sy;
            this._fogs[index].x = this._displayX * this.tileWidth() + this._fogs[index].ox;
            this._fogs[index].y = this._displayY * this.tileHeight() + this._fogs[index].oy;
        }
    };

    Game_Map.prototype.setFogParameter = function(name, index, value) {
        if(!(index in this._fogs)) return;
        if(value === undefined) return;
        var fog = this._fogs[index];
        switch(name) {
            case 'name':
                fog[name] = value;
                break;
            case 'sx':
            case 'sy':
            case 'opacity':
            case 'blend':
                fog[name] = Number(value);
                break;
            case 'visible':
                fog[name] = Boolean(Number(value));
                break;
        }
    };

    /*
     * Spriteset_Map
     */
    var _Spriteset_Map_initialize = Spriteset_Map.prototype.initialize;
    Spriteset_Map.prototype.initialize = function() {
        this._fogContainer = [];
        this._fogData = [];
        _Spriteset_Map_initialize.call(this);
    };

    var _Spriteset_Map_createParallax = Spriteset_Map.prototype.createParallax;
    Spriteset_Map.prototype.createParallax = function() {
        _Spriteset_Map_createParallax.call(this);
        this.createFogs(0);
    };

    var _Spriteset_Map_createPictures = Spriteset_Map.prototype.createPictures;
    Spriteset_Map.prototype.createPictures = function() {
        this.createFogs(1);
        _Spriteset_Map_createPictures.call(this);
        this.createFogs(2);
    };

    var _Spriteset_Map_update = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function() {
        _Spriteset_Map_update.call(this);
        this.updateFogs();
    };

    Spriteset_Map.prototype.createFogs = function(z) {
        this._fogContainer[z] = new Sprite();
        var fogs = $gameMap.fogs();
        for(var index in fogs) {
            if(fogs[index].z !== z) continue;

            var fogSprite = new TilingSprite();
            fogSprite.move(0, 0, Graphics.width, Graphics.height);
            this._fogContainer[z].addChild(fogSprite);
            this._fogData.push({
                index: index,
                sprite: fogSprite,
                name: null,
            });
        }
        if(z === 2) {
            this.addChild(this._fogContainer[z]);
        } else {

            this._baseSprite.addChild(this._fogContainer[z]);
        }
    };

    Spriteset_Map.prototype.updateFogs = function() {
        var fogs = $gameMap.fogs();
        $gameMap.updateFogs(); // add by triacontane
        this._fogData.forEach(function(data) {
            var fog = fogs[data.index];
            var sprite = data.sprite;
            if(data.name !== fog.name) {
                data.name = fog.name;
                sprite.bitmap = ImageManager.loadFog(data.name);
            }
            if(sprite.bitmap) {
                sprite.origin.x = fog.x;
                sprite.origin.y = fog.y;
                sprite.opacity = fog.opacity;
                sprite.visible = fog.visible;
                sprite.blendMode = fog.blend;
            }
        }, this);
    };

})();