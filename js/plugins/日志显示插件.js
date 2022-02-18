//=============================================================================
// Version
// 1.0.0  初始版本
//=============================================================================

/*:
 * @plugindesc 自动战斗插件，在战斗界面有一个选项可以使你的人物自动战斗，而不必自己每次选择战斗方式！
 * @author Lumnca
 *
 * @param PartyCommandName
 * @desc 队伍战斗窗口命令的自动作战命令名称。空白为不添加该选项
 * @default Auto
 *
 * 
 * @help
 * 
 * 游戏上方显示输出
 *
 */

 
Scene_Map.prototype.start = function() {
    Scene_Base.prototype.start.call(this);
    this._logWindow = new Window_BattleLog();
    this.addWindow(this._logWindow);
    $gameMap.log =  this._logWindow;
};

var data = {
    id :0,
    x:0,
    y:0
};



function connect(name,id,x,y) {
    data.id = id;
    data.x = x;
    data.y = y;
    var  socket = new SockJS("http://localhost:8868/online");
    stompClient = Stomp.over(socket);
    stompClient.connect({},function (frame) {
        stompClient.subscribe("/topic/new_add",function (greeting) {
            $gameMap.log.addText("新玩家加入！");
            let res =JSON.parse( greeting.body);
            let e = $gameMap.event(1);
            e.locate(res.x,res.y);
        });
        stompClient.subscribe("/topic/move",function (greeting) {
            let res =JSON.parse( greeting.body);
            let e = $gameMap.event(1);
            e.moveTo(res.x,res.y);
        });

        stompClient.send("/app/into",{},JSON.stringify({
            'x' :x || 15,
            'y' :y || 10,
            'name':name,
            id:id
        }));
        $gamePlayer.locate(x,y);
    });
    setInterval(()=>{
        $gameMap.log.clear();
        stompClient.send("/app/connect",{},JSON.stringify({id:id}));
    },5000);
}

function npc(){

    
}