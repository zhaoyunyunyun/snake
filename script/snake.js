
/**
 * Created by Administrator on 2017/6/9.
 */
var gridQuantity = 29;//游戏区域中最大网格数
var speed = 150, //蛇的移动速度
    gWidth = 20, //网格的宽度
    gHeight = 20, //网格的高度
    currentKeyValue = 0, //记录当前的移动方向
    moveTimerID = null, //记录移动计时器的ID
    speedTimerID = null, //记录速度计时器的ID
    gamePause = false, //游戏暂停
    snakeBody = [], //存放蛇身的单元格坐标的X_Y数组
    food = [], //存放食物的单元格坐标x_y
    Obstacle = [], //存放所有障碍的单元格x_y坐标数组
    foodStation = null, //存放食物的单元格坐标x_y
    level = 1, //关卡数
    score = 0, //分数
    type = null, //游戏模式(1代表闯关模式，2代表挑战模式)
    currentKeyValue = null; //移动方向
/*************扩展方法*************/
function $(x) {
    return document.getElementById(x);
}
//移出数组指定元素
Array.prototype.removeByValue = function(val) {
    for(var i = 0; i < this.length; i++) {
        if(this[i] == val) {
            this.splice(i, 1);
            break;
        }
    }
}
//游戏初始化
function init() {
    btnBind();
    drawMap();
}
//绘制表格地图
function drawMap() {
    //绘制表格
    var gameTable = "<table frame='vsides'    border='0'  > ";
    for(var i = 0; i < gridQuantity; i++) {
        gameTable += "<tr align ='center'>";
        for(var j = 0; j < gridQuantity; j++) {
            gameTable += '<td id="' + i + '_' + j + '"';
            gameTable += 'width="' + gWidth + '"height="' + gHeight + '"><div id="' + i + '_' + j + '_div" style="width:' + gWidth + 'px;height:' + gHeight + 'px;"></div></td>';
        }
        gameTable += '</tr>';
    }
    gameTable += '</table>';
    $("play").innerHTML = gameTable;
}
/*生成食物
 *  @param  Number   食物的数量
 * */
function initFood(num) {
    var i = 1;
    if(num > 0) {
        var x = parseInt(Math.random() * gridQuantity);
        var y = parseInt(Math.random() * gridQuantity);
        foodStation = x + "_" + y + "_div";
        food.push(x + "_" + y + "_div");
        snakeStation = x + "_" + y;
        //获取该位置的背景色
        backgroundColor = $(foodStation).style.background;
        snakeBgcolor = $(snakeStation).style.background;
        if(backgroundColor == "" && snakeBgcolor == "") { //如果该位置为空，则为该单元格添加颜色
            $(foodStation).style.background = "rgb(" + Math.floor(Math.random() * 254) + "," + Math.floor(Math.random() * 254) + "," + Math.floor(Math.random() * 254) + ")"; //将食物单元格背景定义为绿色
            $(foodStation).className = "food";
            num--;
            initFood(num);
        } else {
            initFood(num);
        }
    } else {
        return;
    }
}
/*初始化蛇的坐标
 *  @param  Number   蛇身的长度
 * */
function initSnake(len) {
    if(len > 0) {
        var x = parseInt(Math.random() * gridQuantity);
        var y = parseInt(Math.random() * gridQuantity);
        nowHeadStation = 0 + "_" + len; //将蛇初始化在左上角
        snakeBody.push(nowHeadStation); //向数组的首位添加蛇头
        $(nowHeadStation).style.background = "rgb(" + Math.floor(Math.random() * 254) + "," + Math.floor(Math.random() * 254) + "," + Math.floor(Math.random() * 254) + ")"; //将该单元格涂色
        len--
        initSnake(len)
    } else {
        return;
    }
}
/*  生成障碍
 *  @param  Number  障碍的数量
 */
function initObstacle(len) {
    if(len > 0) {
        var x = parseInt(Math.random() * gridQuantity);
        var y = parseInt(Math.random() * gridQuantity);
        Obstacle.push(x + "_" + y);
        if($(x + "_" + y).style.background == "") {
            $(x + "_" + y).style.background = "rgb(0,0,0)";
            len--;
            initObstacle(len);
        } else {
            initObstacle(len)
        }
    } else {
        return;
    }
}
function btnBind() {
    var btns = document.querySelectorAll(".mode button");
    /*************自由模式***********/
    btns[0].addEventListener("click", function() {
        $("mode").style.display = "none"; //主菜单隐藏
        $("countdown").style.display = "block"; //显示倒计时
        initSnake(5); //生成蛇
        initFood(10); //生成食物
        runCount("time", 3, function() { //倒计时
            $("countdown").style.display = "none"; //倒计时结束，遮罩隐藏
            $("audio").play(); //背景音乐响起来
            $("scoreboard").style.display = "block"; //信息栏 显示
            $("speed").innerText = speed; //显示速度
            $("score").innerText = 0; //显示分数
            document.onkeydown = function(e) {
                KeyDown(e); //绑定事件监听
            };
            //每隔一段时间  增加速度
            speedTimerID = setInterval(function() {
                if(speed > 10) {
                    speed -= 10;
                    $("speed").innerText = speed;
                } else {
                    window.clearInterval(speedTimerID)
                }
            }, 10000);
        });
    });
    /***************关卡模式**********/
    btns[1].addEventListener("click", function() {
        type = 1;
        $("mode").style.display = "none";
        $("countdown").style.display = "block";
        initSnake(5);
        initFood(10);
        runCount("time", 3, function() {
            $("countdown").style.display = "none";
            $("audio").play();
            $("scoreboard").style.display = "block";
            $("speed").innerText = speed;
            $("score").innerText = 0;
            document.onkeydown = function(e) {
                KeyDown(e);
            };
            $("level").style.display = "block";
            $("levelNum").innerText = level;
        });
    });
    /***************挑战模式**********/
    btns[2].addEventListener("click", function() {
        type = 2;
        $("mode").style.display = "none";
        $("countdown").style.display = "block";
        initSnake(5);
        initObstacle(5 * level);
        initFood(10);
        runCount("time", 3, function() {
            $("countdown").style.display = "none";
            $("audio").play();
            $("scoreboard").style.display = "block";
            speed = 150;
            $("speed").innerText = speed;
            $("score").innerText = 0;
            document.onkeydown = function(e) {
                KeyDown(e);
            };
            speedTimerID = setInterval(function() {
                if(speed > 10) {
                    speed -= 5;
                    $("speed").innerText = speed;
                } else {
                    window.clearInterval(speedTimerID)
                }
            }, 5000);
            $("level").style.display = "block";
            $("levelNum").innerText = level;
        });
    });
    //返回主菜单
    $("returnMenu").addEventListener("click", function(e) {
        $("mode").style.display = "block";
        $("message").style.display = "none";
        $("scoreboard").style.display="none";
        type = 0;
        drawMap();
    });
    //重新开始游戏
    $("restart").addEventListener("click", function() {
        $("message").style.display = "none";
        drawMap();
        initSnake(5);
        initFood(10);
        score=0;
        if(type == 1) {
            speed=150-level*10;
        }else{
            initObstacle(5 * level);
        }
        $("countdown").style.display = "block";
        $("score").innerText = score;
        $("speed").innerText = speed;
        runCount("time",3, function() {
            $("countdown").style.display = "none";
            $("audio").play();
            document.onkeydown = function(e) {
                KeyDown(e);
            };
        });
    })
    //进入下一关
    $("next").addEventListener("click", function() {
        $("message").style.display = "none";
        drawMap();
        initSnake(5);
        level += 1;
        score = 0;
        $("audio").play();
        if(type == 1) {
            speed -=(level-1)*10;
            $("speed").innerText = speed;
        } else if(type == 2){
            speed =150;
            initObstacle(5 * level);
            $("speed").innerText = speed;
            speedTimerID = setInterval(function() {
                if(speed > 10) {
                    speed -= 10;
                    $("speed").innerText = speed;
                } else {
                    window.clearInterval(speedTimerID)
                }
            }, 4000);
        }
        initFood(10);
        $("level").style.display = "block";
        $("score").innerText = score;
        $("levelNum").innerText = level;
        document.onkeydown = function(e) {
            KeyDown(e);
        };
    });
}
/*  倒计时
 * 	@param   Number   设置倒计时的初始值
 * 	@param   Element   用于显示倒计时的元素
 * 	@callback  Function  倒计时结束时的回调函数
 */
function runCount(ele, t, fn) {
    if(t > 0) {
        document.getElementById(ele).innerText = t;
        t--;
        setTimeout(function() { runCount(ele, t, fn); }, 1000);
    } else {
        fn();
    }
}
function KeyDown(e) { //接受按键
    switch(e.keyCode) {
        case 37: //左
        case 38: //上
        case 39: //右
        case 40: //下
            if((e.keyCode != (currentKeyValue + 2)) && (e.keyCode != (currentKeyValue - 2))) {
                currentKeyValue = e.keyCode;
            }
            break;
        case 32:
            gamePause = !gamePause;
            break;
        default:
            return;
    }
    if(gamePause) { //如果暂停
        $("mask").style.display = "block";
        window.clearInterval(moveTimerID); //就关闭计时器
        moveTimerID = null;
    } else {
        $("mask").style.display = "none";
        window.clearInterval(moveTimerID) //否则打开计时器
        moveTimerID = window.setInterval("snakeMove()", speed);
    }
}
/*
 * 蛇移动处理
 */
function snakeMove() {
    var _x, _y;
    switch(currentKeyValue) {
        //根据用户按键，确定蛇移动的下一个坐标
        case 37: //左
            _x = coordinate("x");
            _y = coordinate("y") - 1;
            break;
        case 39: //右
            _x = coordinate("x");
            _y = coordinate("y") + 1;
            break;
        case 38: //上
            _x = coordinate("x") - 1;
            _y = coordinate("y");
            break;
        case 40: //下
            _x = coordinate("x") + 1;
            _y = coordinate("y");
            break;
    }
    collisionDetection(_x, _y);
}
/*
 * 碰撞检测
 *
 * @param  Number   用于检测的X轴坐标
 * @param  Number   用于检测的Y轴坐标
 *
 */
function collisionDetection(x, y) {
    //判断是否撞墙
    if((x < 0 || y < 0) || (x >= gridQuantity || y >= gridQuantity)) {
        EndState("GameOver<br/>You hit the wall!");
    } else if(rearEnd(x, y)) { //咬到自己
        EndState("GameOver<br/>You cannot eat yourself!");
    } else if(type == 2 && detectionObstacle(x, y)) {
        EndState("GameOver<br>You hit the obstacle!");
    } else if(eatFood(x, y)) { //咬到食物
        VictoryDetection(); //检测是否过关
        initFood(1); //重新产生一个食物
        food.removeByValue(x + "_" + y + "_div"); //移出食物数组中的该项
    } else {
        //如果什么都没撞到，则通过不断改变背景色的位置，产生移动效果
        snakeBody.unshift(x + "_" + y);
        for(var i = 0; i < snakeBody.length - 1; i++) { //交替更改背景色
            $(snakeBody[i]).style.background = $(snakeBody[i + 1]).style.background;
        }
        $(snakeBody.pop()).style.background = ""; //擦出末尾的元素
    }
}
/*
 * 获取蛇头的X坐标值或Y坐标值
 */
function coordinate(i) {
    switch(i) {
        case "x": //返回蛇头单元格的X坐标值
            return parseInt($(snakeBody[0]).id.split("_")[0]);
        case "y": //返回蛇头单元格的Y坐标值
            return parseInt($(snakeBody[0]).id.split("_")[1]);
    }
}
init();
/*
 *   检测是否吃到食物
 *  *  @param  Number  需要检测的X坐标
 *  @param  Number  需要检测的Y坐标
 */
function eatFood(x, y) {
    for(var i = 0; i < food.length; i++) { //遍历食物数组
        if(food[i].split("_")[0] == x && food[i].split("_")[1] == y) {
            snakeBody.unshift(food[i].split("_")[0] + "_" + food[i].split("_")[1]); //将食物插入到蛇身数组的首位
            $(food[i].split("_")[0] + "_" + food[i].split("_")[1] + "_div").style.display = "none"; //隐藏食物
            $(snakeBody[0]).style.background = $(food[i].split("_")[0] + "_" + food[i].split("_")[1] + "_div").style.background; //蛇头的颜色等于食物的颜色
            score += 100;
            $("score").innerText = score;
            return true;
        }
    }
}
/*
 *   检测是否撞到障碍物
 *  @param  Number  需要检测的X坐标
 *  @param  Number  需要检测的Y坐标
 *
 */
function detectionObstacle(x, y) {
    for(var i = 0; i < Obstacle.length; i++) { //遍历障碍数组
        if(Obstacle[i].split("_")[0] == x && Obstacle[i].split("_")[1] == y) {
            return true;
        }
    }
}
/*
 *   检测是否咬到蛇身
 *  *  @param  Number  需要检测的X坐标
 *  @param  Number  需要检测的Y坐标
 */
function rearEnd(x, y) {
    var t = x + "_" + y;
    for(var i = 0; i < snakeBody.length; i++) {
        if(t == snakeBody[i]) {
            return true;
        }
    }
    return false;
}
/*
 * 判断是否满足胜利
 */
function VictoryDetection() {
    if(snakeBody.length == gridQuantity * gridQuantity - 2) {
        EndState("Success");
    } else if((type == 1 || type == 2) && snakeBody.length == 15) {
        EndState("Congratulations!");
        $("next").style.display = "block";
    }
}
/*  显示游戏结果
 *   @param    string      需要显示的结果信息
 */
function EndState(str) {
    $("gameresult").innerHTML = str
    //重置内容
    $("next").style.display = "none";
    $("message").style.display = "block";
    window.clearInterval(moveTimerID); //停止计时
    window.clearInterval(speedTimerID);
    currentKeyValue = 0; //当前方向键设置为0；
    snakeBody = [];
    food = [];
    speed = 150;
    Obstacle = [];
    document.onkeydown = "";
    $("audio").pause();
}