import numpy as np


class Board():
    def __init__(self) -> None:
        self.board = np.zeros((3,3))
        self.markers = [[2,2,2],[2,2,2]]
        self.moves = []
    
    def check_winner(self):
        if np.any(np.all(self.board > 0, axis=0)):
            return 1
        if np.any(np.all(self.board > 0, axis=1)):
            return 1
        if np.any(np.all(self.board < 0, axis=0)):
            return -1
        if np.any(np.all(self.board < 0, axis=1)):
            return -1

        if (self.board[0,0] > 0) and (self.board[1,1] > 0) and (self.board[2,2] > 0):
            return 1
        if (self.board[0,2] > 0) and (self.board[1,1] > 0) and (self.board[2,0] > 0):
            return 1
        if (self.board[0,0] < 0) and (self.board[1,1] < 0) and (self.board[2,2] < 0):
            return -1
        if (self.board[0,2] < 0) and (self.board[1,1] < 0) and (self.board[2,0] < 0):
            return -1
        return 0
    
    def get_legal_moves(self, player):
        legal_moves = []
        for i,row in enumerate(self.board):
            for j,square in enumerate(row):
                for size, n_marker in enumerate(self.markers[0 if player==1 else 1]):
                    if n_marker <= 0:
                        continue
                    if np.abs(square) < (size+1):
                        legal_moves += [(i, j, size+1, player)]
        if len(legal_moves) == 0:
            return [None]
        return legal_moves
    
    def do_move(self, move):
        self.moves += [move]
        self._do_move(move)

    def _do_move(self, move):
        i, j, size, player = move
        self.board[i,j] = size*player
        self.markers[0 if player==1 else 1][size-1] -= 1

    def undo_move(self):
        self.board = np.zeros((3,3))
        self.markers = [[2,2,2],[2,2,2]]
        self.moves = self.moves[:-1]
        for move in self.moves:
            self._do_move(move)
    
    def minimax(self, depth, maximizingPlayer, alpha, beta, none_counter=0):
  
        if self.check_winner() != 0:
            return self.check_winner()

        if none_counter > 1:
            return maximizingPlayer*20
    
        if maximizingPlayer:
            best = -10
            # Recur for left and right children
            for move in self.get_legal_moves(1):
                if move is not None:
                    self.do_move(move)
                    none_counter = 0
                else:
                    none_counter += 1

                val = self.minimax(depth + 1, False, alpha, beta, none_counter)
                if move is not None:
                    self.undo_move()
                best = max(best, val)
                alpha = max(alpha, best)
    
                # Alpha Beta Pruning
                if beta <= alpha:
                    break
            return best
        
        else:
            best = 10
            # Recur for left and
            # right children
            for move in self.get_legal_moves(-1):
                if move is not None:
                    self.do_move(move)
                    none_counter = 0
                else:
                    none_counter += 1
                val = self.minimax(depth + 1, True, alpha, beta, none_counter)
                if move is not None:
                    self.undo_move()
                best = min(best, val)
                beta = min(beta, best)
    
                # Alpha Beta Pruning
                if beta <= alpha:
                    break
            
            return best
        

board = Board()
# print(board.get_legal_moves(1))
try:
    print(board.minimax(0, True, -10, 10))
except:
    print("error")


