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
    def GetIdByPos(row, col):
        key = '%d-%d' % (row,col)
        if Cheng3.Pos2IdMap[key]:
            return Cheng3.Pos2IdMap[key]
        else:
            return -1

    ''' 
        移动到指定位置
    '''
    def moveTo(self, user_color, row1, col1, row2, col2):
        if self.Stage == 1: return False
        id1 = Cheng3.GetIdByPos(row1, col1)
        id2 = Cheng3.GetIdByPos(row2, col2)
        if not self.Pieces[id1-1] or not self.Pieces[id2-1] or self.Pieces[id2-1] != 0:
            return False
        self.Pieces[id1-1] = 0
        self.Pieces[id2-1] = user_color
        if self.isCheng3(user_color, row2, col2):
            self.cheng3_color = user_color
        else:
            self.last_move_color = user_color
        return True

    '''在此位置放置棋子'''
    def putPiece(self, user_color, row, col):
        if self.Stage == 2: return False
        pid = Cheng3.GetIdByPos(row, col)
        if not Cheng3.Pieces[pid-1]:
            return False
        if Cheng3.Pieces[pid-1] != 0:
            return False
        Cheng3.Pieces[pid-1] = color
        if self.isCheng3(user_color, row, col):
            self.cheng3_color = user_color
        else:
            self.last_move_color = 2 if user_color == 1 else 1
        return True

    '''成三后吃掉对方棋子'''
    def eatPiece(self, user_color, row, col):
        if not self.cheng3_color or self.cheng3_color != user_color:
            return False
        pid = Cheng3.GetIdByPos(row, col)
        if not self.Pieces[pid-1] or self.Pieces[pid-1] <= 0 or self.Pieces[pid-1] == user_color:
            return False
        if self.Stage == 1:
            self.Pieces[pid-1] = -1
        else:
            self.Pieces[pid-1] = 0


    '''计算是放棋阶段还是走棋阶段'''
    def isStageChange():
        if self.Stage == 2:
            return False
        for v in self.Pieces:
            if v == 0: return False
        self.Stage = 2
        for i in range(len(self.Pieces)):
            if self.Pieces[i] == -1:
                self.Pieces[i] = 0
        return True

    '''是否能在此位置下棋'''
    def canPut(self, row, col):
        pid = Cheng3.GetIdByPos(row, col)
        if pid < 0:
            return False
        if self.Pieces[pid-1] != 0:
            return False
        return True

    '''判断该位置能否成三'''
    def isCheng3(self, user_color, row, col):
        pid = Cheng3.GetIdByPos(row, col)
        if pid < 0:
            return False
        for ids in Cheng3.AllCheng3Ids:
                if pid in ids:
                    if self.Pieces[ids[0]-1] == user_color and self.Pieces[ids[1]-1] == color and
                            self.Pieces[ids[2]-1] == color:
                        return True
        return False

class GameRoom():
    STATUS_WAITING = 0;
    STATUS_GOING   = 1
    STATUS_END     = 2

    def __init__(self, room_name, piece_id):
        self.chess_game = Cheng3()
        self.status = self.STATUS_WAITING
        self.room_name = room_name
        self.user_piece_ids = set([piece_id])        