
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
		var key = this.row+'-'+this.col;
		if(!Cheng3.Pos2IdMap[key]){
			return false;
		}
		var pid = Cheng3.Pos2IdMap[key];
		if(Cheng3.Pieces[pid-1] != 0){
			return false;
		}
		return true;
	}
	/**
	 * 在此位置放置棋子
	 * @return {} 
	 */
	this.putPiece = function(){
		var key = this.row+'-'+this.col;
		var pid = Cheng3.Pos2IdMap[key];
		Cheng3.Pieces[pid-1] = this.color;
		this._drawPiece();
	}


	/**
	 * 判断该位置能否成三
	 * @return {bool} 
	 */
	this.isCheng3 = function(){
		var key = this.row+'-'+this.col;
		if(!Cheng3.Pos2IdMap[key]){
			return false;
		}
		var pid = Cheng3.Pos2IdMap[key];
		for (var i = Cheng3.AllCheng3Ids.length - 1; i >= 0; i--) {
				var ids = Cheng3.AllCheng3Ids[i];
				if($.inArray(pid, ids) > -1){
					if(Cheng3.Pieces[ids[0]-1] == this.color && Cheng3.Pieces[ids[1]-1] == this.color &&
							Cheng3.Pieces[ids[2]-1] == this.color){
						return true;
					}
				}
		};
		return false;	
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
	 * @param status 
	 * @return {bool} 
	 */
	this.remove = function(){
		var key = this.row+'-'+this.col;
		if(!Cheng3.Pos2IdMap[key]){
			return false;
		}
		var pid = Cheng3.Pos2IdMap[key];

		d3.select('#'+this.key).remove();
		if (Cheng3.Stage == 1){
			Cheng3.Pieces[pid-1] = -1;  //第一阶段，被吃
		}else{
			Cheng3.Pieces[pid-1] = 0;   //第二阶段，被吃
		}
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
	 * 获取第n行n列的具体坐标值
	 * @param  {int} row 
	 * @param  {int} col 
	 * @return {array}     [x,y]
	 */
	this.getCordinate = function(row, col){
		x = col*cell_width + out_width;
		y = row*cell_width + out_width;
		return [x, y];
	}	

	/**
	 * 在第几行几列的位置上画棋子
	 * @param  {int} row  从0开始
	 * @param  {int} col  从0开始
	 * @return {bool}     
	 */
	this._drawPiece = function(){
		var dx = out_width + this.col*cell_width - (cell_width-piece_width)/2;
		var dy = out_width + this.row*cell_width - (cell_width-piece_width)/2;
		var imgurl = piece_imgs[color-1];
		chess_svg.append('svg:image')
	    	.attr('width', piece_width)
	    	.attr('height', piece_width)
	    	.attr('xlink:href', imgurl)
	    	.attr('x', dx)
	    	.attr('y', dy)
	    	.attr('id', this.key);
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
		var cross_len = 10;
		var zoomclass = 'zoom-'+row+'-'+col;
		if((d3.select('#'+zoomclass)[0][0])){
			return;
		}
		var cord = this.getCordinate(row, col);
		var x = cord[0];
		var y = cord[1];
		var lines = [];

		dx = x-piece_width/2;
		dy = y-piece_width/2;
		lines.push([[dx,dy], [dx+cross_len, dy]]);
		lines.push([[dx, dy], [dx, dy+cross_len]]);

		dx = x+piece_width/2;
		dy = y-piece_width/2;
		lines.push([[dx,dy], [dx-cross_len, dy]]);
		lines.push([[dx, dy], [dx, dy+cross_len]]);		

		dx = x-piece_width/2;
		dy = y+piece_width/2;
		lines.push([[dx,dy], [dx, dy-cross_len]]);
		lines.push([[dx, dy], [dx+cross_len, dy]]);		

		dx = x+piece_width/2;
		dy = y+piece_width/2;
		lines.push([[dx,dy], [dx, dy-cross_len]]);
		lines.push([[dx, dy], [dx-cross_len, dy]]);

		if(d3.select('.zoomnode')[0][0]){
			var zoom_group = d3.select('.zoomnode');
		}else{
			var zoom_group = chess_svg.append('svg:g')
			.attr("class", "zoomnode");
		}

		this._draw_lines(lines, 2, '#4E8DE3', zoom_group, zoomclass);
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
    	if(!line_color) line_color = 'rgb(0,0,0)';
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

/**
 * 下棋阶段，1为放棋阶段，2为走棋阶段
 * @type {Number}
 */
Cheng3.Stage = 1;