import pytest
import re

from src.board import Board, Move

@pytest.fixture
def empty_board():
    return Board()

@pytest.fixture
def board_with_next():
    return Board.from_string("././././././././././././././././././././ next I J S T L Z")

@pytest.fixture
def board_with_next_and_hold():
    return Board.from_string("./././././././././././././././././5SS3/4SS4/3IIII3/ hold J next S T L Z O S")

@pytest.fixture
def board_with_next_and_hold_and_incoming():
    return Board.from_string("./././././././././././././././././5SS3/4SS4/3IIII3/ hold J next S T L Z O S incoming 3 1 1")

@pytest.fixture
def board_with_next_and_hold_and_b2b():
    return Board.from_string("././././././././././././././././5SS3/4SS4/3IIII3/ hold J next S T L Z O S b2b 2")

@pytest.fixture
def board_with_next_and_hold_and_combo():
    return Board.from_string("././././././././././././././././5SS3/4SS4/3IIII3/ hold J next S T L Z O S combos 3")

@pytest.fixture
def board_with_everything():
    return Board.from_string("././././././././././././././././5SS3/4SS4/3IIII3/ hold J next S T L Z O S incoming 3 1 1 b2b 2 combos 3")

def test_empty_board_values(empty_board):
    assert str(empty_board) == "././././././././././././././././././././"

def test_board_with_next_values(board_with_next):
    assert str(board_with_next) == "././././././././././././././././././././ next I J S T L Z"
    assert board_with_next._next == [7, 1, 4, 5, 2, 6]

def test_board_with_next_and_hold_values(board_with_next_and_hold):
    assert str(board_with_next_and_hold) == "./././././././././././././././././5SS3/4SS4/3IIII3/ hold J next S T L Z O S"
    assert board_with_next_and_hold._hold == 1
    assert board_with_next_and_hold._next == [4, 5, 2, 6, 3, 4]

def test_board_with_next_and_hold_and_incoming_values(board_with_next_and_hold_and_incoming):
    assert str(board_with_next_and_hold_and_incoming) == "./././././././././././././././././5SS3/4SS4/3IIII3/ hold J next S T L Z O S incoming 3 1 1"
    assert board_with_next_and_hold_and_incoming._incoming == [3, 1, 1]
    assert board_with_next_and_hold_and_incoming._next == [4, 5, 2, 6, 3, 4]
    assert board_with_next_and_hold_and_incoming._hold == 1

def test_board_with_next_and_hold_and_b2b_values(board_with_next_and_hold_and_b2b):
    assert str(board_with_next_and_hold_and_b2b) == "././././././././././././././././5SS3/4SS4/3IIII3/ hold J next S T L Z O S b2b 2"
    assert board_with_next_and_hold_and_b2b._b2b == 2
    assert board_with_next_and_hold_and_b2b._next == [4, 5, 2, 6, 3, 4]
    assert board_with_next_and_hold_and_b2b._hold == 1

def test_board_with_next_and_hold_and_combo_values(board_with_next_and_hold_and_combo):
    assert str(board_with_next_and_hold_and_combo) == "././././././././././././././././5SS3/4SS4/3IIII3/ hold J next S T L Z O S combo 3"
    assert board_with_next_and_hold_and_combo._combo == 3
    assert board_with_next_and_hold_and_combo._next == [4, 5, 2, 6, 3, 4]
    assert board_with_next_and_hold_and_combo._hold == 1

def test_board_with_everything_values(board_with_everything):
    assert str(board_with_everything) == "././././././././././././././././5SS3/4SS4/3IIII3/ hold J next S T L Z O S incoming 3 1 1 b2b 2 combo 3"
    assert board_with_everything._incoming == [3, 1, 1]
    assert board_with_everything._b2b == 2
    assert board_with_everything._combo == 3
    assert board_with_everything._next == [4, 5, 2, 6, 3, 4]
    assert board_with_everything._hold == 1

@pytest.fixture
def move():
    return Move(1, (3, 4), 0, 0)

def test_from_string_valid_move():
    move_str = "J 3/4 east mini"
    move = Move.from_string(move_str)
    assert move._type == 1
    assert move._coords == (3, 4)  # Replace with the expected value
    assert move._rotation == 1
    assert move._spin == 1

def test_from_string_invalid_move():
    move_str = "Invalid move"
    with pytest.raises(Exception):
        Move.from_string(move_str)

def test_to_string(move):
    move_str = str(move)
    expected_str = "J 3/4 north none"  # Replace with the expected string
    assert move_str == expected_str


# Tests for Board.push
def test_push_valid_move_1():
    board = Board()
    move = Move(1, (3, 19), 0, 0)
    assert board.push(move, ignore_next=True) == True
    assert board._board == ([[0, 0, 0, 0, 0, 0, 0, 0, 0, 0] for _ in range(18)]
                            + [[0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 1, 1, 1, 0, 0, 0, 0, 0]])
    assert board._hold == None
    assert board._next == []
    assert board._incoming == []
    assert board._combo == 0
    assert board._b2b == 0
    assert board.has_lost == False

def test_push_valid_move_2():
    move = Move(7, (3, 18), 0, 0)
    board = Board.from_string("./././././././././././././././././././3IIII3/ hold J next I T L Z O S")

    assert board.push(move) == True
    assert board._board == ([[0, 0, 0, 0, 0, 0, 0, 0, 0, 0] for _ in range(17)]
                            + [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 7, 7, 7, 7, 0, 0, 0, 0],
                                [0, 0, 0, 7, 7, 7, 7, 0, 0, 0]])
    assert board._hold == 1
    assert len(board._next) == 6
    assert board._next[0] == 5

def test_push_from_hold():
    move = Move(1, (6, 18), 2, 0)
    board = Board.from_string("./././././././././././././././././././3IIII3/ hold J next I T L Z O S")

    assert board.push(move) == True
    assert board._hold == 7
    assert len(board._next) == 6

def test_push_invalid_move_falling():
    move = Move(7, (3, 3), 0, 0)
    board = Board.from_string("././././././././././././././././././3IIII3/ hold J next I T L Z O S")

    assert board.push(move) == False
    assert str(board) == "././././././././././././././././././3IIII3/ hold J next I T L Z O S"

def test_push_invalid_move_oob():
    move = Move(7, (3, 20), 0, 0)
    board = Board.from_string("./././././././././././././././././././3IIII3/ hold J next I T L Z O S")

    assert board.push(move) == False
    assert str(board) == "./././././././././././././././././././3IIII3/ hold J next I T L Z O S"

def test_push_invalid_move_colliding():
    move = Move(7, (3, 19), 0, 0)
    board = Board.from_string("./././././././././././././././././././3IIII3/ hold J next I T L Z O S")

    assert board.push(move) == False
    assert str(board) == "./././././././././././././././././././3IIII3/ hold J next I T L Z O S"

def test_clear_lines_empty_board():
    board = Board.from_string("./././././././././././././././././././3IIII3/ hold J next I T L Z O S")
    assert board.clear_lines() == 0
    assert str(board) == "./././././././././././././././././././3IIII3/ hold J next I T L Z O S"

def test_clear_lines_single_line():
    board = Board.from_string("./././././././././././././././././././IIIIIIIIIII/ hold J next I T L Z O S")
    assert board.clear_lines() == 1
    assert str(board) == "././././././././././././././././././././ hold J next I T L Z O S combo 1"

def test_clear_lines_multiple_lines():
    board = Board.from_string("./././././IIIIIIIIII/././././././././././././JJJJJJJJJJ/3IIII3/ hold J next I T L Z O S")
    assert board.clear_lines() == 2
    assert str(board) == "./././././././././././././././././././3IIII3/ hold J next I T L Z O S combo 1"

def test_add_garbage_no_loss():
    # Test case where no loss occurs
    board = Board()
    board._incoming = [1, 2, 1]
    board.add_garbage()

    for i in range(16, 20):
        assert sum(board._board[i]) == 8 * 9
        
def test_add_garbage_loss():
    # Test case where loss occurs
    board = Board()
    board._incoming = [3, 2, 1]
    board._board = [[8] * 10 for _ in range(18)] + [[0] * 10] * 2
    board.add_garbage()

    assert board.has_lost
    
def test_add_garbage_capped():
    # Test case where added garbage is more than 8
    board = Board()
    board._incoming = [6, 8, 3, 2]
    board._board = [[0] * 10 for _ in range(20)]
    board.add_garbage()

    for i in range(12):
        assert sum(board._board[i]) == 0
    
    for i in range(12, 20):
        assert sum(board._board[i]) == 8 * 9

    assert board._incoming == [6, 3, 2]