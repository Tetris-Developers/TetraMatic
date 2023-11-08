import re
import random

from src.consts import *

class Board:
    _board = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0] for _ in range(20)]
    _hold = None
    _next = []
    _incoming = []
    _combo = 0
    _b2b = 0
    has_lost = False

    def __init__(self, board_array = None, hold = None, next = [],
                 incoming = 0, combo = 0, b2b = 0):
        if board_array is None:
            return
        
        self._board = board_array
        self._hold = hold
        self._next = next
        self._incoming = incoming
        self._combo = combo
        self._b2b = b2b

    @staticmethod
    def from_string(string: str):
        ranks = []
        current_rank = []
        for char in string:
            if len(current_rank) == 10:
                ranks.append(current_rank)
                current_rank = []

            if char == "/":
                continue

            if char == ".":
                ranks.append([0] * 10)
                continue

            if re.match(r"\d", char):
                current_rank += [0] * int(char)
                continue

            if char in PIECE_TYPE_TO_NUMBER:
                current_rank.append(PIECE_TYPE_TO_NUMBER[char])
                continue

            if char == " ":
                break

        split = string.split(" ")

        hold_piece = None
        next_pieces = []

        def get_unique_value(split, keyword, default = None):
            if keyword in split:
                index = split.index(keyword)

                return split[index + 1]
            return default

        def get_array(split, keyword, default = [], regex=r'^\d+$'):
            if keyword in split:
                index = split.index(keyword)
                i = 1
                arr = []
                while re.match(regex, split[index + i]):
                    try:
                        arr.append(int(split[index + i]))
                    except ValueError:
                        arr.append(split[index + i])
                    i += 1

                    if index + i >= len(split):
                        break
                return arr
            return default
        
        hold_piece = PIECE_TYPE_TO_NUMBER[get_unique_value(split, "hold")]
        next_pieces_str = get_array(split, "next", [], r'^[JLOSTZI]+')
        next_pieces = list(map(lambda x: PIECE_TYPE_TO_NUMBER[x], next_pieces_str))
        incoming = get_array(split, "incoming", [])
        b2b = int(get_unique_value(split, "b2b", 0))
        combo = int(get_unique_value(split, "combos", 0))


        return Board(ranks, hold_piece, next_pieces, incoming, combo, b2b)

    def __str__(self):
        result = ""  # Rename 'string' to 'result'
        empty_count = 0  # Move empty_count initialization outside the loop

        # Iterate over each rank in the board
        for rank in self._board:
            # Iterate over each block in the rank
            for block in rank:
                if block == 0:
                    empty_count += 1

                    # If 10 consecutive empty blocks, add a dot and reset empty_count
                    if empty_count == 10:
                        result += "."
                        empty_count = 0
                        break

                    continue

                # If non-empty block, add the count of empty blocks (if any)
                if empty_count > 0:
                    result += str(empty_count)
                    empty_count = 0

                result += NUMBER_TO_PIECE_TYPE[block]

            # Add the count of remaining empty blocks (if any)
            if empty_count > 0:
                result += str(empty_count)
                empty_count = 0

            result += "/"

        if self._hold is not None:
            result += f" hold {NUMBER_TO_PIECE_TYPE[self._hold]}"
        if self._next:
            result += f" next {' '.join(NUMBER_TO_PIECE_TYPE[block] for block in self._next)}"
        if self._incoming:
            result += f" incoming {' '.join(str(block) for block in self._incoming)}"
        if self._b2b:
            result += f" b2b {self._b2b}"
        if self._combo:
            result += f" combo {self._combo}"

        return result

    def generate_all_legal_moves(self):
        pass

    def fill_queue(self, num_pieces=6):
        while len(self._next) < num_pieces:
            # TODO: 7-bag
            self._next.append(random.randint(1, 7))

    def add_garbage(self):
        total_added = 0
        new_garbage_queue = []
        
        for i, num in enumerate(self._incoming):
            hole = random.randint(0, 9)
            
            if any(self._board[0][x] != 0 for x in range(10)):
                self.has_lost = True
                return
            
            total_added += num

            if total_added > 8:
                num -= total_added - 8
                new_garbage_queue = [total_added - 8] + self._incoming[i+1:]
                
            for _ in range(num):
                self._board.pop(0)
                self._board.append([(8 if x != hole else 0) for x in range(10)])

            if total_added > 8:
                break
            
        self._incoming = new_garbage_queue
                
    def change_next_from_move(self, move) -> bool:
        if move._type == self._next[0]:
            self._next.pop(0)
            self.fill_queue()
            return True

        elif move._type == self._hold:
            self._hold = self._next[0]
            self._next.pop(0)
            self.fill_queue()
            return True
    
        return False

    def clear_lines(self, dont_cancel_b2b = False) -> int:

        cleared = 0
        for y in range(20):
            if any(self._board[y][x] == 0 for x in range(10)):
                continue
            
            cleared += 1
            for i in range(y, 0, -1):
                self._board[i] = self._board[i-1]
            self._board[0] = [0] * 10

        if cleared == 0:
            self._combo = 0
        else:
            self._combo += 1

        if cleared == 4:
            self._b2b += 1
    
        elif not dont_cancel_b2b and cleared > 0:
            self._b2b = 0
        
        return cleared

    def push(self, move, ignore_next = False) -> bool:
        """
        Pushes a move onto the board. Returns False if the move cannot be played
        """
        matrix = SHAPES[move._type-1][move._rotation]
        X, Y = move._coords

        will_fall = True

        for mino in matrix:
            x, y = mino

            if X + x < 0 or X + x >= 10 or Y + y >= 20:
                return False

            if Y + y < 0:
                self.has_lost = True
                return True # The move is not illegal

            if self._board[Y + y][X + x] != 0:
                return False

            if Y + y >= 19 or self._board[Y + y + 1][X + x] != 0:
                will_fall = False

        if will_fall:
            return False

        for mino in matrix:
            x, y = mino
            self._board[Y + y][X + x] = move._type
        
        if not ignore_next:
            self.change_next_from_move(move)

        self.clear_lines()

        return True

class Move:
    _type = 0
    _coords = (0, 0)
    _rotation = 0
    _spin = 0

    def __init__(self, type, coords, rotation, spin):
        self._type = type
        self._coords = coords
        self._rotation = rotation
        self._spin = spin
    
    @staticmethod
    def from_string(string):
        REGEX = r'[JLOSTZI]\s+\d{1,2}/\d{1,2}\s+(north|east|south|west)\s+(none|mini|full)'
        if not re.match(REGEX, string):
            raise Exception("Invalid move: " + string)

        split = string.split(" ")
        move_type = PIECE_TYPE_TO_NUMBER[split[0]]
        coords = tuple(map(int, split[1].split("/")))
        rotation = ROTATION_STR_TO_INT[split[2]]
        spin = SPIN_STR_TO_INT[split[3]]

        return Move(move_type, coords, rotation, spin)

    def __str__(self) -> str:
        piece_type = NUMBER_TO_PIECE_TYPE[self._type]
        coords = f"{self._coords[0]}/{self._coords[1]}"
        rotation = ROTATION_INT_TO_STR[self._rotation]
        spin = SPIN_INT_TO_STR[self._spin]

        return f"{piece_type} {coords} {rotation} {spin}"
