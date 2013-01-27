var chess_svg = d3.select('#chess-grid').append('svg:svg')
					.attr('width', 430).attr('height', 430);
//棋盘边界margin
var out_width = 20;
// 每个格子多宽
var cell_width = 65;
var row_count = 6;
var col_count = 6;
// 棋子大小
var piece_width = 36;

var chess_is_init = true;  //棋盘是不是没有走动过，如果没走动，他人上线就不用重画
//不同颜色棋子数量
var pieces_count_his = 0;
var pieces_count_my = 0;
var offline_timeout;
/**
 * 画6x6的棋盘
 * @return {bool} 
 */
function drawChessGrid(){
	var linecolor = 'rgb(0,0,0)';
	var bgcolor = '#DCEAF4';

	var horizontal_lines = [
		[[out_width, out_width], [out_width+row_count*cell_width, out_width]],
		[[out_width+cell_width, out_width+cell_width], [out_width+(row_count-1)*cell_width, out_width+cell_width]],
		[[out_width+2*cell_width, out_width+2*cell_width], [out_width+(row_count-2)*cell_width, out_width+2*cell_width]],

		[[out_width,out_width+3*cell_width], [out_width+2*cell_width,out_width+3*cell_width]],
		[[out_width+4*cell_width,out_width+3*cell_width], [out_width+6*cell_width,out_width+3*cell_width]],

		[[out_width+2*cell_width, out_width+4*cell_width], [out_width+(row_count-2)*cell_width, out_width+4*cell_width]],
		[[out_width+cell_width, out_width+5*cell_width], [out_width+(row_count-1)*cell_width, out_width+5*cell_width]],
		[[out_width, 6*cell_width+out_width], [out_width+row_count*cell_width, 6*cell_width+out_width]],
	];

	var vertical_lines = [
		[[out_width, out_width], [out_width, out_width+row_count*cell_width]],
		[[out_width+cell_width, out_width+cell_width], [out_width+cell_width, out_width+(row_count-1)*cell_width]],
		[[out_width+2*cell_width, out_width+2*cell_width], [out_width+2*cell_width, out_width+(row_count-2)*cell_width]],

		[[out_width+3*cell_width, out_width], [out_width+3*cell_width, out_width+2*cell_width]],
		[[out_width+3*cell_width, out_width+4*cell_width], [out_width+3*cell_width, out_width+6*cell_width]],

		[[out_width+4*cell_width, out_width+2*cell_width], [out_width+4*cell_width, out_width+(row_count-2)*cell_width]],
		[[out_width+5*cell_width, out_width+cell_width], [out_width+5*cell_width, out_width+(row_count-1)*cell_width]],
		[[out_width+6*cell_width, out_width], [out_width+6*cell_width, out_width+row_count*cell_width]],
	];

	var cross_lines = [
		[[out_width,out_width], [out_width+2*cell_width, out_width+2*cell_width]],
		[[out_width+6*cell_width,out_width], [out_width+4*cell_width, out_width+2*cell_width]],
		[[out_width,out_width+6*cell_width], [out_width+2*cell_width, out_width+4*cell_width]],
		[[out_width+6*cell_width,out_width+6*cell_width], [out_width+4*cell_width, out_width+4*cell_width]],
	];

	var lines = horizontal_lines.concat(vertical_lines).concat(cross_lines);

	for (j=0; j<lines.length; j++){
			var line = lines[j];
			var myLine = chess_svg.append("svg:line")
			    .attr("x1", line[0][0])
			    .attr("y1", line[0][1])
			    .attr("x2", line[1][0])
			    .attr("y2", line[1][1])
			    .style("stroke", linecolor)
			    .style("stroke-width", 1)
			    .attr('class', 'shape-render');
	}	

	// 初始棋子数据
	for(var i=0; i<24; i++){
	    Cheng3.Pieces[i] = 0;
	}
}
/**
 * 获取当前坐标属于棋盘中的第几行几列
 * @param  {} pos 
 * @return {}     
 */
function getGridRowCol(pos){
	var cursorx = pos[0];
    var cursory = pos[1];
    var start_col = Math.floor((cursorx-out_width) / cell_width);
    var start_row = Math.floor((cursory-out_width) / cell_width);
    if (((cursorx-out_width) % cell_width) > (cell_width/2)) {
        start_col++;
    }
    if (((cursory-out_width) % cell_width) > (cell_width/2)) {
        start_row++;
    }
    return [start_row, start_col]
}

/**
 * 获取鼠标当前在棋盘里面的相对坐标
 * @param  {} e 
 * @return {}   
 */
function getCurPosition(e) {  
    var x, y; 
    if (e.pageX != undefined && e.pageY != undefined) {  
      x = e.pageX;
      y = e.pageY; 
    } else {  
      x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }  
    x -= $(chess_svg[0][0]).offset().left;  //兼容firefox
    y -= $(chess_svg[0][0]).offset().top;
    return [x, y];
} 


/**
 * 放棋子
 * @param  {event} e 
 * @return {bool}   
 */
function putClickHandler(e){
	if(is_waiting){
        return false;
    }
	var pos = getCurPosition(e);
	var rowcol = getGridRowCol(pos);
    var row = rowcol[0];
    var col = rowcol[1];
    var c3 = new Cheng3(row, col, my_piece_color);
    if(c3.canPut()){
    	c3.putPiece();
        //发送数据
        gameput(row, col);
    	if(c3.isCheng3()){
    		chess_svg[0][0].removeEventListener("click");
            chess_svg[0][0].addEventListener("click", eatClickHandler, false);
            on_cheng3(my_piece_color);
    	}else{
            setColorActive(his_piece_color);
        }
    }
    	
};
/**
 * 吃别人棋子，包括放棋与走棋
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function eatClickHandler(e){
    if(is_waiting){
        return false;
    }
	var pos = getCurPosition(e);
	var rowcol = getGridRowCol(pos);
    var row = rowcol[0];
    var col = rowcol[1];
    var pid = Cheng3.GetIdByPos(row, col);
    if( Cheng3.Pieces[pid-1] != his_piece_color){
    	return;
    }
    var c3 = new Cheng3(row, col, his_piece_color);
    var allcheng3 = Cheng3.isAllCheng3(his_piece_color);
    //成三的一方可以吃掉另一方的一枚非成三的棋子（如果对方的棋子全部都是成三状态，那就可以吃掉对方任意一颗棋子）
    if(!allcheng3 && c3.isCheng3()){  
        return false;
    }
    c3.remove();
    //发送数据
    gameeat(row, col);
    chess_svg[0][0].removeEventListener("click", eatClickHandler, false);
    if(Cheng3.Stage == 1){
        chess_svg[0][0].addEventListener("click", putClickHandler, false);
    }else{
        chess_svg[0][0].addEventListener("click", moveClickHandler, false);
    }
    setColorActive(his_piece_color);
}

/**
 * 移动棋子
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function moveClickHandler(e){
    if(is_waiting){
        return false;
    }
	var pos = getCurPosition(e);
	var rowcol = getGridRowCol(pos);
    var row = rowcol[0];
    var col = rowcol[1];
    var pid = Cheng3.GetIdByPos(row, col);
    // 如果之前有选中的，且和现在不同位置，则视为走棋
    if(Cheng3.ChoosenPieceKey 
    	&& ( Cheng3.ChoosenPieceKey.row != row || Cheng3.ChoosenPieceKey.col != col )){
    	var piece = Cheng3.ChoosenPieceKey;
        org_row = piece.row;
        org_col = piece.col;
        if(piece._canMoveTo(row, col)){
            piece.moveTo(row, col);
            piece.zoomOut();
        	Cheng3.ChoosenPieceKey = null;
            // 发送数据
            gamemove(org_row, org_col, row, col);
            if(piece.isCheng3()){
                on_cheng3(my_piece_color);
            }else{
                setColorActive(his_piece_color);
            }
        }else{  // 违反规则，不能走
            // 如果选中了自己的棋子，当成是重新选择棋子
            if (Cheng3.Pieces[pid-1] && Cheng3.Pieces[pid-1] == my_piece_color) {
                piece._clearZoomCross();
                var curp = new Cheng3(row, col, my_piece_color);
                curp.zoomIn();
                Cheng3.ChoosenPieceKey = curp;
            }
        }

    }else
    // 如果之前有选中的，且和现在相同位置，则视为取消选择
    if(Cheng3.ChoosenPieceKey && Cheng3.ChoosenPieceKey.row == row 
    	&& Cheng3.ChoosenPieceKey.col == col ){ 
    	Cheng3.ChoosenPieceKey.zoomOut();
    	Cheng3.ChoosenPieceKey = null;
    }else
    // 之前没有选中的，如果现在选择有棋子且是自己的颜色，则选中它
    if(!Cheng3.ChoosenPieceKey){
    	if (Cheng3.Pieces[pid-1] ) {  // 有棋子
    		if(Cheng3.Pieces[pid-1] == my_piece_color){
    			var curp = new Cheng3(row, col, my_piece_color);
    			curp._clearZoomCross();
	    		curp.zoomIn();
	    		Cheng3.ChoosenPieceKey = curp;
    		}
    	}
    }
}

/**
 * 设定哪一方该走棋
 * @param {int} color 
 */
function setColorActive(color){
    $('#piece_sign_top').removeClass('gamemove-status');
    $('#piece_sign_bottom').removeClass('gamemove-status');
    var piece_signs = $('#piece_sign_top');
    if(color == my_piece_color){
        piece_signs = $('#piece_sign_bottom');   
    }
    piece_signs.addClass('gamemove-status');

    if(color == my_piece_color){
        is_waiting = false;
        $('#chess-grid svg').css('cursor', 'pointer'); 
    }else{
        is_waiting = true;
        $('#chess-grid svg').css('cursor', 'default'); 
    }
}

/**
 * 放棋动作
 * @param  {[type]} x1 [description]
 * @param  {[type]} y1 [description]
 * @return {[type]}    [description]
 */
function gameput(x1, y1){
    chess_is_init = false;
    var data = JSON.stringify({
        room: room_name,
        row: x1,
        col: y1,
        'type':'on_gameput',
    });
    gamesocket.send(data);
}
/**
 * 吃棋动作
 * @param  {[type]} x1 [description]
 * @param  {[type]} y1 [description]
 * @return {[type]}    [description]
 */
function gameeat(x1, y1){
    var data = JSON.stringify({
        room: room_name,
        row: x1,
        col: y1,
        'type':'on_gameeat',
    });
    gamesocket.send(data);
}

/**
 * 走棋动作
 * @param  {array} from 
 * @param  {array} to
 * @return {bool}     
 */
function gamemove(x1,y1,x2,y2){
    chess_is_init = false;
    var data = JSON.stringify({
        room: room_name,
        row1: x1,
        col1: y1,
        row2: x2,
        col2: y2,
        'type':'on_gamemove',
    });
    gamesocket.send(data);
    
}
/**
 * 发送聊天
 * @return {} 
 */
function sendchat(){
    var content = $('#chat-input').val();
    $('#chat-input').val('');            
    if (!content || room_status != 1) return;
    $('#chat-div ul').append('<li class="mychat-li"></li>');
    $('#chat-div ul li:last-child').text(content);
    $('#chat-div ul').scrollTop($('#chat-div ul')[0].scrollHeight);
    gamesocket.send(JSON.stringify({
        room: room_name,
        content: content,
        'type':'on_chat',
    }));
}
/**
 * 对方离线
 * @param  {string} msg 
 * @return {bool}     
 */
function on_offline(msg){
    is_waiting = true;
    room_status = 0;
    $('#status-span').text('对方离线');
    $('#game-canvas').css('cursor', 'default');
    $('#piece_sign_top').removeClass('gamemove-status');
    $('#piece_sign_bottom').removeClass('gamemove-status');
    $('#alert-title').text('对方离线');
    offline_timeout = setTimeout(function(){
       $('#alert-model-dom').data('id', 0).modal('show');
    }, 2000);
}
/**
 * 开始游戏
 * @param  {string} msg 
 * @return {bool}     
 */
function on_gamestart(msg){
    clearTimeout(offline_timeout);
    is_waiting = (my_piece_color==2) ? true : false;
    room_status = 1;
    $('#status-span').text('对方上线，游戏开始，放棋阶段');

    if(!chess_is_init){
        d3.selectAll('#chess-grid svg *').remove();
        drawChessGrid();  //重画棋盘
        d3.select('.zoomnode').remove();
    }
    $('#his_status_img').attr('src', status_imgs[his_piece_color-1]);
    $('#my_status_img').attr('src', status_imgs[my_piece_color-1]);

    setColorActive(1);
}
/**
 * 游戏结束
 * @param  {string} msg 
 * @return {bool}     
 */
function on_gameover(msg){
    is_waiting = true;
    room_status = 2;
    $('#status-span').text('游戏结束');
    $('#piece_sign_top').removeClass('gamemove-status');
    $('#piece_sign_bottom').removeClass('gamemove-status');
    $('#chess-grid svg').css('cursor', 'default'); 

    $('#alert-title').text('游戏结束');
    $('#alert-model-dom').data('id', 0).modal('show');
}
window.onbeforeunload = function () {
    gamesocket.close();
    // event.returnValue = "You will lose any unsaved content";
}

/**
 * 棋子成三了
 * @param  {int} color 成三方的棋子颜色，是我还是对方
 * @return {[type]}       
 */
function on_cheng3(color){
	if(color == my_piece_color){
        setColorActive(my_piece_color);
        chess_svg[0][0].removeEventListener("click", moveClickHandler, false);
        chess_svg[0][0].removeEventListener("click", putClickHandler, false);
        chess_svg[0][0].addEventListener("click", eatClickHandler, false);
        Cheng3.drawMsgAlert('请抓子')
	}else{
        setColorActive(his_piece_color);
        Cheng3.drawMsgAlert('对方抓子')
	}
}
/**
 * 对方放棋
 * @param  {[type]} msg 
 * @return {[type]}     
 */
function on_gameput(msg){
    chess_is_init = false;
    var row = parseInt(msg.row);
    var col = parseInt(msg.col);
    var pid = Cheng3.GetIdByPos(row, col);
    if(Cheng3.Pieces[pid-1] != 0){
        return false;
    }
    var c3 = new Cheng3(row, col, his_piece_color);
    c3.putPiece();
    if(!c3.isCheng3()){
        setColorActive(my_piece_color);
    }else{
        on_cheng3(his_piece_color);
    }
}
/**
 * 对方吃我的棋
 * @param  {[type]} msg [description]
 * @return {[type]}     [description]
 */
function on_gameeat(msg){
    var row = parseInt(msg.row);
    var col = parseInt(msg.col);
    var pid = Cheng3.GetIdByPos(row, col);
    if( Cheng3.Pieces[pid-1] != my_piece_color){
        return false;
    }
    var c3 = new Cheng3(row, col, my_piece_color);
    c3.remove();
    setColorActive(my_piece_color);
}
/**
 * 对方走棋
 * @param  {[type]} msg [description]
 * @return {[type]}     [description]
 */
function on_gamemove(msg){
    var row1 = parseInt(msg.row1);
    var col1 = parseInt(msg.col1);
    var row2 = parseInt(msg.row2);
    var col2 = parseInt(msg.col2);
    var pid1 = Cheng3.GetIdByPos(row1, col1);
    var pid2 = Cheng3.GetIdByPos(row2, col2);
    if( Cheng3.Pieces[pid1-1] != his_piece_color){
        return false;
    }
    if( Cheng3.Pieces[pid2-1] != 0){
        return false;
    }
    var c3 = new Cheng3(row1, col1, his_piece_color);
    c3._clearZoomCross();  // 清掉我这边的标志
    c3.zoomIn();
    c3.moveTo(row2, col2);
    if(!c3.isCheng3()){
        setColorActive(my_piece_color);
    }else{
         on_cheng3(his_piece_color);
    }
}
/**
 * 由放棋阶段转换到走棋阶段
 * @return {bool} 
 */
function on_stagechange(){
    Cheng3.Stage = 2;
    for (var i = Cheng3.Pieces.length - 1; i >= 0; i--) {
        if(Cheng3.Pieces[i] == -1){
            Cheng3.Pieces[i] = 0;
        }
    };
    setColorActive(1);
    chess_svg[0][0].removeEventListener("click", eatClickHandler, false);
    chess_svg[0][0].removeEventListener("click", putClickHandler, false);
    chess_svg[0][0].addEventListener("click", moveClickHandler, false);
    d3.select('.crossnode').remove();
    Cheng3.drawMsgAlert('走棋阶段');
    $('#status-span').text('走棋阶段');
}
/**
 * 聊天
 * @param  {string} msg 
 * @return {bool}     
 */
function on_chat(msg){
    $('#chat-div ul').append('<li class="hischat-li"></li>');
    $('#chat-div ul li:last-child').text(msg.content);
    $('#chat-div ul').scrollTop($('#chat-div ul')[0].scrollHeight);
}

$(function() {

	drawChessGrid();

	chess_svg[0][0].addEventListener("click", putClickHandler, false);
    if(room_status != 0){
        setColorActive(1);
    }
    if(is_waiting ){
        $('#chess-grid svg').css('cursor', 'default');
    }

    var WebSocket = window.WebSocket || window.MozWebSocket;
        if (WebSocket) {
            try {
                gamesocket = new WebSocket(wsurl);
            } catch (e) {
                alert(e)
            }
    }

    if (gamesocket) {
        gamesocket.onopen = function(){  
            //gamesocket.send(JSON.stringify({name:"yes"}));
        }  
        gamesocket.onmessage = function(event) {
            // console.log(event.data);
            var msg = JSON.parse(event.data)
            switch(msg.type){
                case 'online':
                    on_online(msg);
                    break;
                case 'offline':
                    on_offline(msg);
                    break;
                case 'on_gamestart':
                    on_gamestart(msg);
                    break;
                case 'on_gamemove':
                    on_gamemove(msg);
                    break;
                case 'on_gameput':
                    on_gameput(msg);
                    break;
                case 'on_gameeat':
                    on_gameeat(msg);
                    break;
                case 'on_gamestage':
                    on_stagechange(msg);
                    break;
                case 'on_gameover':
                    on_gameover(msg);
                    break;
                case 'on_chat':
                    on_chat(msg);
                    break;
                default:
                    break;
            }
        }
    }
});