from yaml import safe_load
from os.path import join, dirname

CONFIG = safe_load(open(join(dirname(__file__), "../config.yaml")))

PIECE_TYPE_TO_NUMBER = {
    None: None,
    "J": 1,
    "L": 2,
    "O": 3,
    "S": 4,
    "T": 5,
    "Z": 6,
    "I": 7,
    "G": 8
}

NUMBER_TO_PIECE_TYPE = {
    1: "J",
    2: "L",
    3: "O",
    4: "S",
    5: "T",
    6: "Z",
    7: "I",
    8: "G"
}

ROTATION_STR_TO_INT = {
        "north": 0,
        "east": 1,
        "south": 2,
        "west": 3
    }

SPIN_STR_TO_INT = {
    "none": 0,
    "mini": 1,
    "full": 2
}

ROTATION_INT_TO_STR = {
    0: "north",
    1: "east",
    2: "south",
    3: "west"
}

SPIN_INT_TO_STR = {
    0: "none",
    1: "mini",
    2: "full"
}

J = [
    {(-1, -1), (-1, 0), (0, 0), (1, 0)},
    {(1, -1), (0, -1), (0, 0), (0, 1)},
    {(1, 1), (1, 0), (0, 0), (-1, 0)},  
    {(-1, 1), (0, 1), (0, 0), (0, -1)}
]

L = [
    {(-1, 0), (0, 0), (0, 1), (1, 1)},
    {(0, 1), (0, 0), (1, 0), (1, -1)},
    {(1, 0), (0, 0), (0, -1), (-1, -1)},
    {(0, -1), (0, 0), (-1, 0), (-1, 1)}
]

O = [
    {(0, 0), (0, -1), (1, 0), (1, -1)},
    {(0, 0), (0, 1), (1, 0), (1, 1)},
    {(0, 0), (0, 1), (-1, 0), (-1, 1)},
    {(0, 0), (0, -1), (-1, 0), (-1, -1)}
]

S = [
    {(-1, 0), (0, 0), (0, -1), (1, -1)},
    {(0, -1), (0, 0), (1, 0), (1, -1)},
    {(1, 0), (0, 0), (0, 1), (-1, 1)},
    {(-1, -1), (-1, 0), (0, 0), (0, 1)}
]

T = [
    {(1, 0), (0, 0), (0, -1), (-1, 0)},
    {(0, 1), (0, 0), (1, 0), (0, -1)},
    {(-1, 0), (0, 0), (0, 1), (1, 0)},
    {(0, -1), (0, 0), (-1, 0), (0, 1)}
]

Z = [
    {(-1, -1), (0, -1), (0, 0), (1, 0)},
    {(1, -1), (1, 0), (0, 0), (0, 1)},
    {(1, 1), (0, 1), (0, 0), (-1, 0)},
    {(-1, 1), (-1, 0), (0, 0), (0, -1)}
]

I = [
    {(-1, 0), (0, 0), (1, 0), (2, 0)},
    {(0, -1), (0, 0), (0, 1), (0, 2)},
    {(1, 0), (0, 0), (-1, 0), (-2, 0)},
    {(0, 1), (0, 0), (0, -1), (0, -2)}
]

SHAPES = [J, L, O, S, T, Z, I]

"""
This is for testing purposes only

def display_rotations(piece):
    for rotation in range(4):
        for col in range(-2, 3):
            for row in range(-2, 3):
                if (row, col) in piece[rotation]:
                    print(0, end="")
                else:
                    print(" ", end="")
            print()
        print()

for shape in SHAPES:
    display_rotations(shape)
"""