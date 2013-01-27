#encoding=utf-8

class BasicReturn():

    def __init__(self, result=True, code=0, msg='', data=None):
        self.result = result
        self.code = code
        self.msg = msg
        self.data = data

class Cheng3():

    AllCheng3Ids = [
        [1,2,3], [4,5,6], [7,8,9], [10,11,12], [13,14,15], 
        [16,17,18], [19,20,21], [22,23,24], [1,10,22], [4,11,19],
        [7,12,16], [2,5,8], [17,20,23], [9,13,18], [6,14,21], 
        [3,15,24], [1,4,7], [3,6,9], [16,19,22], [18,21,24],
    ]

    Pos2IdMap = {
        '0-0':1, '0-3':2, '0-6':3,
        '1-1':4, '1-3':5, '1-5':6,
        '2-2':7, '2-3':8, '2-4':9,
        '3-0':10,'3-1':11,'3-2':12,'3-4':13,'3-5':14,'3-6':15,
        '4-2':16,'4-3':17,'4-4':18,
        '5-1':19,'5-3':20,'5-5':21,
        '6-0':22,'6-3':23,'6-6':24
    }

    def __init__(self):
        self.Pieces          = [0]*24
        self.Stage           = 1
        self.last_move_color = None
        self.isGameOver      = False
        self.cheng3_color    = None #谁成三了

    '''
        根据行x列（从0开始）得到棋子位置的id号 
    '''
    @classmethod 
    def GetIdByPos(self, row, col):
        key = '%d-%d' % (row,col)
        if Cheng3.Pos2IdMap[key]:
            return Cheng3.Pos2IdMap[key]
        else:
            return -1

    ''' 
        移动到指定位置
    '''
    def moveTo(self, user_color, row1, col1, row2, col2):
        if self.Stage == 1:
            return BasicReturn(False, -1, '当前不是走棋阶段')
        if not self.cheng3_color == None or user_color == self.last_move_color:
            return BasicReturn(False, -1, '对方还没走棋')
        id1 = Cheng3.GetIdByPos(row1, col1)
        id2 = Cheng3.GetIdByPos(row2, col2)
        if not id1-1 in range(len(self.Pieces)) or not id2-1 in range(len(self.Pieces)) or self.Pieces[id2-1] != 0:
            return BasicReturn(False, -1, '位置坐标不正确')
        isline = False
        for ids in Cheng3.AllCheng3Ids:
                if id1 in ids and id2 in ids:
                    isline = True
                    indexdiff = ids.index(id1)-ids.index(id2)
                    break
        if not isline:
            return BasicReturn(False, -1, '不在一条直线上')
        if abs(indexdiff) > 1:
            return BasicReturn(False, -1, '相差超过一个间隔')
        self.Pieces[id1-1] = 0
        self.Pieces[id2-1] = user_color
        if self.isCheng3(user_color, row2, col2):
            self.cheng3_color = user_color
        else:
            self.last_move_color = user_color
        return BasicReturn()


    '''在此位置放置棋子'''
    def putPiece(self, user_color, row, col):
        if not self.cheng3_color == None or user_color == self.last_move_color:
            return BasicReturn(False, -1, '对方还没走棋')
        if self.Stage == 2: return False
        pid = Cheng3.GetIdByPos(row, col)
        if not pid-1 in range(len(self.Pieces)):
            return BasicReturn(False, -1, '位置坐标不正确')
        if self.Pieces[pid-1] != 0:
            return BasicReturn(False, -1, '该位置已经被占用，不能下子')
        self.Pieces[pid-1] = user_color
        if self.isCheng3(user_color, row, col):
            self.cheng3_color = user_color
        else:
            self.last_move_color = user_color
        return BasicReturn()

    '''成三后吃掉对方棋子'''
    def eatPiece(self, user_color, row, col):
        if not self.cheng3_color or self.cheng3_color != user_color:
            return BasicReturn(False, -1, '没有成三，不能吃子')
        pid = Cheng3.GetIdByPos(row, col)
        if not pid-1 in range(len(self.Pieces)) or self.Pieces[pid-1] <= 0 or self.Pieces[pid-1] == user_color:
            return BasicReturn(False, -1, '没有棋子，或不能吃自己')
        isallc3 = self.isAllCheng3(user_color)
        isc3 = self.isCheng3(user_color, row, col)
        if not isallc3 and isc3:
            return BasicReturn(False, -1, '不能吃对方已经成三的棋子')
        if self.Stage == 1:
            self.Pieces[pid-1] = -1
        else:
            self.Pieces[pid-1] = 0
        self.cheng3_color = None
        self.last_move_color = user_color
        return BasicReturn()


    '''计算是放棋阶段还是走棋阶段'''
    def isStageChange(self):
        if self.Stage == 2:
            return False
        if self.cheng3_color:  #还有人未抓子
            return False
        for v in self.Pieces:
            if v == 0: return False
        self.Stage = 2
        for i in range(len(self.Pieces)):
            if self.Pieces[i] == -1:
                self.Pieces[i] = 0
        return True

    '''判断该位置能否成三'''
    def isCheng3(self, user_color, row, col):
        pid = Cheng3.GetIdByPos(row, col)
        if pid < 0:
            return False
        for ids in Cheng3.AllCheng3Ids:
                if pid in ids:
                    if self.Pieces[ids[0]-1] == user_color and self.Pieces[ids[1]-1] == user_color and self.Pieces[ids[2]-1] == user_color:
                        return True
        return False

    '''判断是否所有棋子都处于成三状态'''
    def isAllCheng3(self, user_color):
        for i in range(len(self.Pieces)):
            if self.Pieces[i] != user_color: continue
            pid = i+1
            isc3 = False
            for ids in Cheng3.AllCheng3Ids:
                    if pid in ids:
                        if self.Pieces[ids[0]-1] == user_color and self.Pieces[ids[1]-1] == user_color and self.Pieces[ids[2]-1] == user_color:
                            isc3 = True
                            break
            if not isc3:
                return False
        return True

    def checkGameOver(self, user_color):
        if self.Stage == 1:
            return False
        count1,count2 = (0,0)
        for piece in self.Pieces:
            if piece == 1: count1 = count1+1
            if piece == 2: count2 = count2+1
        if count1<3 or count2<3:
            return True
        #下面检查是否能够移动
        canmove = False
        for i in range(len(self.Pieces)):
            pid = i+1
            if self.Pieces[i] != user_color: continue
            for ids in Cheng3.AllCheng3Ids:
                if pid in ids:
                    index1 = ids.index(pid)
                    for k in range(len(ids)):
                        if ids[k] != pid:
                            if abs(index1 - k) <= 1 and self.Pieces[ids[k]-1] == 0:
                                canmove = True
                                break
        if canmove:
            return False
        return True





class GameRoom():
    STATUS_WAITING = 0;
    STATUS_GOING   = 1
    STATUS_END     = 2

    def __init__(self, room_name, piece_id):
        self.chess_game = Cheng3()
        self.status = self.STATUS_WAITING
        self.room_name = room_name
        self.user_piece_ids = set([piece_id])        