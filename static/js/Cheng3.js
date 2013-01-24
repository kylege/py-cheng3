
/**
 * [Cheng3 description]
 * @param {int} row start from 0
 * @param {int} col 
 */
var Cheng3 = function (row, col, color) {

	this.row = row;
	this.col = col;
	this.color = color;

	this.key = 'piece-'+this.color+'-'+this.row.toString()+this.col;
	/**
	 * 获取棋子的背景图片地址
	 * @return {string} 
	 */
	this.getImageUrl = function(){
		return piece_imgs[this.color-1];
	}
	
	/**
	 * 是否能在此位置下棋
	 * @return {bool} 
	 */
	this.canPut = function(){

		return true;
	}

	/**
	 * 放大
	 * @return {bool} 
	 */
	this.zoomIn = function(){
		this._drawZoomCross(this.row, this.col);
	}
	/**
	 * 缩小，恢复正常
	 * @return {bool} 
	 */
	this.zoomOut = function(){
		d3.select('#'+this.key)
		.transition()
		.attr('width',piece_width)
		.attr('height',piece_width);
	}
	/**
	 * 移除此棋子
	 * @return {bool} 
	 */
	this.remove = function(){
		d3.select('#'+this.key).remove();
		delete ChessPiece.PiecesMap[this.row+'-'+this.col];
	}

	/**
	 * 将棋子移动到指定位置
	 * @param  {int} row 
	 * @param  {int} col 
	 * @return {bool}     成功移动返回true
	 */
	this.moveTo = function(row, col){

		return true;
	}
	/**
	 * 是否能够合法移动到指定位置
	 * @param  {int} row 
	 * @param  {int} col 
	 * @return {bool}     
	 */
	this._canMoveTo = function(row, col){

	}
	/**
	 * 画选中状态的标志
	 * @param  {int} row 
	 * @param  {int} col 
	 * @return {bool}     
	 */
	this._drawZoomCross = function(row, col){

	}
	/**
	 * 清除所有 选中状态的标志
	 * @return 
	 */
	this._clearZoomCross = function(){
		d3.select('.zoomnode').remove();
	}
	/**
     * 画直线
     * @param  {array} lines 直线坐标数组
     * @return {bool}       
     */
    this._draw_lines = function(lines, line_width, line_color, father_obj, zoom_class){
    	if(!line_width) line_width = 1;
    	if(!line_color) line_color = linecolor;
    	if(!father_obj) father_obj = chess_svg;

    	for (j=0; j<lines.length; j++){
   			crossi = lines[j]
   			var myLine = father_obj.append("svg:line")
			    .attr("x1", crossi[0][0])
			    .attr("y1", crossi[0][1])
			    .attr("x2", crossi[1][0])
			    .attr("y2", crossi[1][1])
			    .style("stroke", line_color)
			    .style("stroke-width", line_width)
			    .attr('class', 'shape-render')
			    .attr('class', zoom_class);
   		}
    }
}

/**
 * 根据行x列（从0开始）得到棋子位置的id号
 * @param {int} row 
 * @param {int} col 
 */
Cheng3.prototype.GetIdByPos = function(row, col) {
	var key = row+'-'+col;
	if (Cheng3.Pos2IdMap[key]){
		return Cheng3.Pos2IdMap[key];
	}else{
		return -1;
	}
};

/**
 * 格子坐标（行x列，从0开始）与棋子id号对应关系
 * @type {object}
 */
Cheng3.Pos2IdMap = {
	'0-0':1, '0-3':2, '0-6':3,
	'1-1':4, '1-3':5, '1-5':6,
	'2-2':7, '2-3':8, '2-4':9,
	'3-0':10,'3-1':11,'3-2':12,'3-4':13,'3-5':14,'3-6':15,
	'4-2':16,'4-3':17,'4-4':18,
	'5-1':19,'5-3':20,'5-5':21,
	'6-0':22,'6-3':23,'6-6':24
};

/**
 * 所有连成直线的，成三可能性组合
 * @type {Array}
 */
Cheng3.AllCheng3Ids = [
	[1,2,3], [4,5,6], [7,8,9], [10,11,12], [13,14,15], 
	[16,17,18], [19,20,21], [22,23,24], [1,10,22], [4,11,19],
	[7,12,16], [2,5,8], [17,20,23], [9,13,18], [6,14,21], 
	[3,15,24], [1,4,7], [3,6,9], [16,19,22], [18,21,24]
];

/**
 * 24个棋子数组，值为1表示黑棋，2表示白棋, 0表示没有棋子，-1表示被抓的棋子
 * @type array
 */
Cheng3.Pieces = Array();