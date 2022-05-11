//=============================================================================
// NetWork.js
//=============================================================================

/*:
 * @plugindesc 这个插件让你的游戏可以让其他人也显示进来
 * @author Lumnca
 *
 * @param serverUrl
 * @desc 你的webSocket服务器地址
 * @default 0
 *
 * @param maxPlayer
 * @desc 可显示的最大玩家数量
 * @default 5
 * 
 * 
 * @param eventTemplate
 * @desc 事件JSON字符串（可通过data文件下的Mapxx.json文件中的events中属性参考）
 * @default {"id":15,"name":"EV015","note":"","pages":[{"conditions":{"actorId":1,"actorValid":false,"itemId":1,"itemValid":false,"selfSwitchCh":"A","selfSwitchValid":false,"switch1Id":1,"switch1Valid":false,"switch2Id":1,"switch2Valid":false,"variableId":1,"variableValid":false,"variableValue":0},"directionFix":false,"image":{"characterIndex":0,"characterName":"","direction":2,"pattern":0,"tileId":0},"list":[{"code":0,"indent":0,"parameters":[]}],"moveFrequency":3,"moveRoute":{"list":[{"code":0,"parameters":[]}],"repeat":true,"skippable":false,"wait":false},"moveSpeed":4,"moveType":0,"priorityType":0,"stepAnime":false,"through":true,"trigger":2,"walkAnime":true}],"x":8,"y":16,"meta":{}}
 * 
 *
 * @help 这个插件可以使你的游戏具有联网功能
 *
 * 
 * Version 1.0:实现了可以在游戏场景中显示其他玩家。在同一个地图下才会显示！移动延时和速度具有差异
 * 
 * Version 1.1:添加显示系统通知和聊天显示信息窗口，玩家对话联机开启
 *
 */

var parameters = PluginManager.parameters('NetWork');
var url = parameters['serverUrl'];
var maxPlayer = Number(parameters['maxPlayer']) || 5;
var emety = parameters['eventTemplate'];



var data = {
    name: '王海山',
    id: 1,
    pos : false
}
//======================================================网络请求=================================================================
var socket = null;
var stompClient = null;

if (SockJS && Stomp) {
    console.log("网络组件加载成功！");

}
else {
    console.error("没有找到sockjs和stomp脚本文件!")
}

function initNetWork(data) {
    try {
        socket = new SockJS(url);
        stompClient = Stomp.over(socket);
        stompClient.connect({}, function (info) {
            console.log("连接到服务器成功！");
            subscribe();
            getPlayerData();
            send("/app/connect", data);
            setInterval(() => {
                getPlayerData();
                send('/app/keep', data);
            }, 5000);
        });
    }
    catch (e) {
        console.error("连接失败！请检查路径url或者服务器是否正常运行！")
    }
}

function send(url, data) {
    if (stompClient) {
        if (data instanceof String) {
            stompClient.send(url, {}, data);
        }
        else {
            stompClient.send(url, {}, JSON.stringify(data));
        }
    }
}



function subscribe() {
    stompClient.subscribe("/topic/new_add", function (res) {
        const player = JSON.parse(res.body);
        showLog(player.name + "加入游戏！")
        if (data.id !== player.id && player.mapId === $gameMap._mapId) {
            addNewEvent(player);
        }

    });
    stompClient.subscribe("/topic/move", function (res) {
        const player = JSON.parse(res.body);
        if (data.id !== player.id && player.mapId === $gameMap._mapId) {
            updatePlayer(player);
        }
        else if(data.id !== player.id && player.mapId !== $gameMap._mapId && thisMapIsHavePlayer(player.id)){
           getSavePlayerObjects(player.id).event.hide();
        }
    });
    stompClient.subscribe("/topic/off", function (res) {
        const players = JSON.parse(res.body);
        if (players.length > 0) {
            players.forEach((p) => {
                offPlayer(p);
                showLog(p.name + "离开了游戏！");
            })
        }
    });
    stompClient.subscribe("/topic/chat/"+data.id,function(res){
        const msg = JSON.parse(res.body);
        $gameMessage.add(`[${msg.name}]:${msg.content}`);
    })
}

function showLog(text) {
    if (SceneManager._scene.logWindow) {
        SceneManager._scene.logWindow.addText(text)
    }
    else {
        let logw = new Window_MessageLog();
        SceneManager._scene.addChild(logw);
        SceneManager._scene.logWindow = logw;
        logw.addText(text);
    }
}
function showtalk(msg){
    if (SceneManager._scene.logWindow) {
        SceneManager._scene.logWindow.showTalk(msg);
    }
    else {
        let logw = new Window_MessageLog();
        SceneManager._scene.addChild(logw);
        SceneManager._scene.logWindow = logw;
        SceneManager._scene.logWindow.showTalk(msg);
    }
}


function showSys(msg){
    if (SceneManager._scene.logWindow) {
        SceneManager._scene.logWindow.addSysMessage(msg);
    }
    else {
        let logw = new Window_MessageLog();
        SceneManager._scene.addChild(logw);
        SceneManager._scene.logWindow = logw;
        SceneManager._scene.logWindow.addSysMessage(msg);
    }
}

let msg = {
    id : data.id,
    content : '测试消息',
    to : 2,
    name : data.name
}
function talk(msg){
    send('/app/user',msg);
}
//=======================================================================================================================================================

const playerObjects = []; //已经添加的玩家对象
/**
 * 寻找已经添加的玩家池是否含有该对象
 * @param {*} id 
 * @returns 
 */
function getSavePlayerObjects(id) {
    let res = null;
    for (let i = 0; i < playerObjects.length; i++) {
        let element = playerObjects[i];
        if (element.id === id) {
            res = playerObjects[i];
        }
    }
    return res;
}
/**
 * 当前地图是否已经含有玩家图像
 * @param {*} id 
 * @returns 
 */
function thisMapIsHavePlayer(id){
    let player = getSavePlayerObjects(id);
    if(player){
        return SceneManager._scene.children[0]._tilemap.children.indexOf(player.sprite)!==-1;
    }
    else{
        return false; 
    }
   
}

/**
 * 代码生成事件并保存到事件数组中
 */
function createEvent(data){
    let event = JSON.parse(emety);
    event.id = $dataMap.events.length;
    event.x = data.x;
    event.y = data.y;
    event.name = data.name;
    $dataMap.events.push(event);
    let newEvent = new Game_Event($gameMap._mapId, event.id);
    newEvent.setPlayerData(data);
    $gameMap._events.push(newEvent);
    newEvent.dx = data.x;
    newEvent.dy = data.y;
    return [newEvent,event];
}

/**
 * 获取当前玩家数据
 */
function getPlayerData() {
    data.x = $gamePlayer.x;
    data.y = $gamePlayer.y;
    data.characterName = $gamePlayer._characterName;
    data.characterIndex = $gamePlayer._characterIndex;
    data.mapId = $gameMap._mapId;
    data.time = new Date().getTime();
}

/**
 * 添加一个新事件（一个新加入的玩家）
 */
function addNewEvent(data) {
    let player = getSavePlayerObjects(data.id);
    if (player) {

        player.event.dx = data.x;
        player.event.dy = data.y;
        player.event.setPosition(data.x,data.y);
        player.event._eventId = $dataMap.events.length;
        $dataMap.events.push(player.e);
        $gameMap._events.push( player.event);
        SceneManager._scene.children[0]._tilemap.addChild(player.sprite);
    }
    else {
        let newEvent = createEvent(data);
        //生成地图精灵显示
        let sprite = new Sprite_Character(newEvent[0]);
        playerObjects.push({id: data.id, sprite: sprite ,mapId:data.mapId,event:newEvent[0],e:newEvent[1]});
        SceneManager._scene.children[0]._tilemap.addChild(sprite);
    }

}


function getPlayerByUid(uid) {
    return $gameMap._events.filter((e) => { return e._uid === uid })[0];
}

/**
 * 更新玩家数据
 */
function updatePlayer(data) {
    if(thisMapIsHavePlayer(data.id)){
        let player = getPlayerByUid(data.id);
        if (player) {
            player.dx = data.x;
            player.dy = data.y;
            if(player._hide){
                player._hide = false;  
            }
            if(data.pos){
                player.setPosition(data.x,data.y);
                data.pos = false;
            }
            player.setPlayerData(data);
        }
    }
    else{
        addNewEvent(data);
    }
}


/**
 * 离线玩家
 */
function offPlayer(data) {
    let player = getPlayerByUid(data.id);
    if (player) {
        player.hide();
    }
}
//网络请求
function request(method, url) {
    return new Promise((res, rej) => {
        var xmlhttp;
        if (window.XMLHttpRequest) {
            //  IE7+, Firefox, Chrome, Opera, Safari 浏览器执行代码
            xmlhttp = new XMLHttpRequest();
        }
        else {
            // IE6, IE5 浏览器执行代码
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                res(xmlhttp.responseText)
            }
        }
        xmlhttp.open(method, url, true);
        xmlhttp.send();
    })
}


//=====================================================事件修改==============================================
const Game_Temp_setDestination = Game_Temp.prototype.setDestination;
Game_Temp.prototype.setDestination = function (x, y) {
    Game_Temp_setDestination.call(this, x, y);
    getPlayerData();
    data.x = x;
    data.y = y;
    send('/app/move', data);
}

const initMembers = Game_Event.prototype.initMembers;
Game_Event.prototype.initMembers = function () {
    initMembers.call(this);
    this._timeCount = 0;
}

const update = Game_Event.prototype.update;
Game_Event.prototype.update = function () {
    if (this._isPlayer) {
        this._timeCount++;
        if ((this.dx !== this.x || this.dy !== this.y) && this._timeCount > 15) {
            this._timeCount = 0;
            this.moveToPoint(this.dx, this.dy);
        }
    }
    update.call(this);
}

Game_Event.prototype.setPlayerData = function (data) {
    this._uid = data.id;
    this._isPlayer = true;
    this._characterName = data.characterName;
    this._characterIndex = data.characterIndex;
}


Game_Event.prototype.hide = function(){
    this.setPosition(-1,-1);
    this._hide = true;
}


const scene_terminate = Scene_Map.prototype.terminate;
Scene_Map.prototype.terminate = function() {
    scene_terminate.call(this);
    data.mapId = $gamePlayer.newMapId();
    data.x = $gamePlayer._newX;
    data.y = $gamePlayer._newY;
    data.newMap = true;
    send('/app/move', data);
};

const scene_mapload = Scene_Map.prototype.onMapLoaded;
Scene_Map.prototype.onMapLoaded = function(){
    scene_mapload.call(this);
    request("GET", "http://127.0.0.1:8868/all").then(res => {
        let ps = JSON.parse(res);
        if (ps.length > 0) {
            ps.forEach(p => {
                if (p.id !== data.id && p.mapId===$gameMap._mapId) {
                    addNewEvent(p);
                }
            })
        }
    });
}


//=======================================信息窗口===============================================================
function Window_MessageLog() {
    this.initialize.apply(this, arguments);
}

Window_MessageLog.prototype = Object.create(Window_Selectable.prototype);
Window_MessageLog.prototype.constructor = Window_MessageLog;

Window_MessageLog.prototype.initialize = function () {
    var width = this.windowWidth();
    var height = this.windowHeight();
    Window_Selectable.prototype.initialize.call(this, 0, 0, width, height);
    this.opacity = 0;
    this._lines = [];
    this._talks = [];
    this._sys = [];
    this._methods = [];
    this._waitCount = 0;
    this._waitMode = '';
    this._baseLineStack = [];
    this._spriteset = null;
    this._speed = 0;
    this._sysTextWidth = 0;
    this.createBackBitmap();
    this.createBackSprite();
    this.refresh();
};

Window_MessageLog.prototype.setSpriteset = function (spriteset) {
    this._spriteset = spriteset;
};

Window_MessageLog.prototype.windowWidth = function () {
    return Graphics.boxWidth;
};

Window_MessageLog.prototype.windowHeight = function () {
    return this.fittingHeight(this.maxLines());
};

Window_MessageLog.prototype.maxLines = function () {
    return 18;
};

Window_MessageLog.prototype.createBackBitmap = function () {
    this._backBitmap = new Bitmap(this.width, this.height);
    this._backBitmap2 = new Bitmap(this.width, this.height);
    this._talkBitmap = new Bitmap(this.width, this.height);
    this._sysBitmap =  new Bitmap(this.width, this.height);
};

Window_MessageLog.prototype.createSysMessage = function(msg){
    let width = this._sysBitmap.measureTextWidth(msg);
    this._sysBitmap =  new Bitmap(width, this.height);
    this._sysBitmap.drawText(msg,0,0,width,this.lineHeight())
    this._sysSprite.bitmap =  this._sysBitmap;
    this._sysSprite.x = this.windowWidth();
    this._sysTextWidth = width;
    this._sysBackSprite.visible = true;
}

Window_MessageLog.prototype.createBackSprite = function () {
    this._backSprite = new Sprite();
    this._backSprite.bitmap = this._backBitmap;
    this._backSprite.y = this.y;
    this.addChildToBack(this._backSprite);
    this._talkSprite = new Sprite();
    this._talkSprite.bitmap = this._talkBitmap;
    this._talkSprite.y = Graphics.boxHeight;
    this.addChildToBack(this._talkSprite);
    this.drawTalkBackground();

    this._sysSprite = new Sprite();
    this._sysSprite.bitmap = this._sysBitmap;
    this._sysSprite.y = 100;
    this.addChildToBack(this._sysSprite);

    this._sysBackSprite = new Sprite();
    this._sysBackSprite.bitmap = this._backBitmap2;
    this._sysBackSprite.y = 100;
    this.addChildToBack(this._sysBackSprite);
    this.drawBackground2();
};

Window_MessageLog.prototype.numLines = function () {
    return this._lines.length;
};

Window_MessageLog.prototype.refresh = function () {
    this.drawBackground();
    this.contents.clear();
    for (var i = 0; i < this._lines.length; i++) {
        this.drawLineText(i);
    }
};

Window_MessageLog.prototype.showTalk = function(msg){
    this._talks.push(msg);
    this.drawTalkBackground(msg);
}



Window_MessageLog.prototype.drawBackground = function () {
    var rect = this.backRect();
    var color = this.backColor();
    this._backBitmap.clear();
    this._backBitmap.paintOpacity = this.backPaintOpacity();
    this._backBitmap.fillRect(rect.x, rect.y, rect.width, rect.height, color);
    this._backBitmap.paintOpacity = 255;
};

Window_MessageLog.prototype.drawBackground2 = function(){
    var color = this.backColor();
    this._backBitmap2.clear();
    this._backBitmap2.paintOpacity = this.backPaintOpacity();
    this._backBitmap2.fillRect(0,0,this.windowWidth(),this.lineHeight(), color);
    this._backBitmap2.paintOpacity = 255;
}

Window_MessageLog.prototype.drawTalkBackground = function (txt) {
    var color = this.backColor();
    this._talkBitmap.clear();
    this._talkBitmap.paintOpacity = this.backPaintOpacity();
    this._talkBitmap.fillRect(0,0,this.windowWidth(),this.lineHeight(), color);
    this._talkBitmap.paintOpacity = 255;
    this._talkBitmap.drawText(txt,0,0,this.windowWidth(),this.lineHeight())
};

Window_MessageLog.prototype.talkWindowShow = function(){
    
}

Window_MessageLog.prototype.backRect = function () {
    return {
        x: 0,
        y: this.padding,
        width: this.width,
        height: this.numLines() * this.lineHeight()
    };
};

Window_MessageLog.prototype.backColor = function () {
    return '#000000';
};
Window_MessageLog.prototype.backPaintOpacity = function () {
    return 64;
};
Window_MessageLog.prototype.addText = function (text) {
    this._lines.push(text);
    this.refresh();
};
Window_MessageLog.prototype.drawLineText = function (index) {
    var rect = this.itemRectForText(index);
    this.contents.clearRect(rect.x, rect.y, rect.width, rect.height);
    this.drawTextEx(this._lines[index], rect.x, rect.y, rect.width);
};

Window_MessageLog.prototype.update = function () {
    if (this._lines.length > 0) {
        this._waitCount++;
        if (this._waitCount > 120) {
            this._lines.shift();
            this.refresh();
            this._waitCount = 0;
        }
    }
    this.talkWindowUpate();
    this.sysWindowUpdate();

}

Window_MessageLog.prototype.addSysMessage = function(msg){
    this._sys.push(msg);
    if(!this._showing){
        this.createSysMessage(msg);
    }
}

Window_MessageLog.prototype.sysWindowUpdate = function(){
    if(this._sysSprite.x>0-this._sysTextWidth){
        this._sysSprite.x -= 1;
        this._showing = true;
    }
    else{
        this._sysBackSprite.visible = false;
        this._sys.shift();
        this._showing = false;
        if(this._sys.length>0){
            this.createSysMessage(this._sys[0]);
        }
    }
}

Window_MessageLog.prototype.talkWindowUpate = function(){
    this._talkSprite.y += this._speed;
    if(this._talks.length>0){
        if(this._talkSprite.y>Graphics.boxHeight-this.lineHeight()){
            this._speed = -0.2;
        }
        else{
            this._speed = 0;
            this._waitCount++;
            if (this._waitCount > 120) {
                this._talks.shift();
                this._waitCount = 0;
            }
            
        }
    }
    else{
        if(this._talkSprite.y<Graphics.boxHeight+1){
            this._speed = 0.2;
        }
        else{
            this._speed = 0;
        }
        
    }
}