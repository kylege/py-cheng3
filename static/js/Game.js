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
	// if(is_waiting){
 //        return false;
 //    }
	var pos = getCurPosition(e);
	var rowcol = getGridRowCol(pos);
    var row = rowcol[0];
    var col = rowcol[1];
    var c3 = new Cheng3(row, col, my_piece_color);
    if(c3.canPut()){
    	c3.putPiece();

    	if(c3.isCheng3()){
    		alert('cheng3.');
    	}
    }
    	
};
/**
 * 吃别人棋子，包括放棋与走棋
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function eatClickHandler(e){
	var pos = getCurPosition(e);
	var rowcol = getGridRowCol(pos);
    var row = rowcol[0];
    var col = rowcol[1];
    var pid = Cheng3.GetIdByPos(row, col);
    if(!Cheng3.Pieces[pid-1] || Cheng3.Pieces[pid-1] != his_piece_color){
    	return;
    }
    var c3 = new Cheng3(row, col, his_piece_color);
    c3.remove();
}

/**
 * 移动棋子
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function moveClickHandler(e){
	var pos = getCurPosition(e);
	var rowcol = getGridRowCol(pos);
    var row = rowcol[0];
    var col = rowcol[1];
    var pid = Cheng3.GetIdByPos(row, col);
    // 如果之前有选中的，且和现在不同位置，则视为走棋
    if(Cheng3.ChoosenPieceKey 
    	&& ( Cheng3.ChoosenPieceKey.row != row || Cheng3.ChoosenPieceKey.col != col )){
    	var piece = ChessPiece.ChoosenPieceKey;
        org_row = piece.row;
        org_col = piece.col;
        if(piece._canMoveTo(row, col)){
            piece.moveTo(row, col);
            piece.zoomOut();
        	ChessPiece.ChoosenPieceKey = null;
            // 发送数据
            // gamemove(org_row, org_col, row, col);
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
 * 棋子成三了
 * @param  {int} color 成三方的棋子颜色，是我还是对方
 * @return {[type]}       
 */
function on_cheng3(msg){
	if(msg.color == my_piece_color){
		is_waiting = false;
	}else{
		is_waiting = true;
	}
}
/**
 * 对方放棋
 * @param  {[type]} msg 
 * @return {[type]}     
 */
function on_gameput(msg){

}
/**
 * 对方吃我的棋
 * @param  {[type]} msg [description]
 * @return {[type]}     [description]
 */
function on_gameeat(msg){

}
/**
 * 对方走棋
 * @param  {[type]} msg [description]
 * @return {[type]}     [description]
 */
function on_gamemove(msg){

}

$(function() {

	drawChessGrid();

	chess_svg[0][0].addEventListener("click", putClickHandler, false);

});