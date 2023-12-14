# Move notation

In TBP-2, when a bot suggests or plays a move, it will be written as follow:

```
TYPE X/Y ROTATION SPIN
```

| Attribute  | Description                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| `TYPE`     | The type of piece this is. Example: `"I"`                                                              |
| `ROTATION` | The rotation state of the piece. Spawn orientation is `north`, after a clockwise rotation `east`, etc. |
| `X`        | The x coordinate of the center of the piece, with 0 being the coordinate of the leftmost column.       |
| `Y`        | The y coordinate of the center of the piece, with 0 being the coordinate of the bottommost row.        |
| `SPIN`     | One of `none`, `mini`, or `full` indicating whether a spin should be performed.                        |

The center of the piece is defined according to
[SRS true rotation](https://harddrop.com/wiki/File:SRS-true-rotations.png).
The piece centers for the L, J, T, S, and Z pieces are the stationary points
of basic rotation in SRS. The center of the O piece in the north orientation is
the bottom-left mino; for east, top-left mino; for south, the top-right mino;
for west, the bottom-right mino. The center of the I piece in the north
orientation is the middle-left mino; for east, the middle-top mino; for south,
the middle-right mino; for west, the middle-bottom mino.

### Examples:

-   `I 5/10 north none`
-   `T 8/15 south full` <br>
    ...

# Position Notation

When the server gives a `position`, it will be written as follows:

```
position <BOARD> hold <HOLD> next <NEXT> incoming <GARBAGE> b2b <B2B> combo <COMBO> : (Same for the opponent)
```

The leftmost position will be the bot's, and the right one will be its opponent's.

## Board Notation

This is based on the [Forsyth-Edwards Notation](https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation).

Each rank is described, starting top to bottom, with a "/" between each one (without spacing); within each rank, the contents of the squares are described in order from the left to the right. Each square is identified by a single letter (G for garbage). A set of one or more consecutive empty squares within a rank is denoted by a digit from `1` to `.`, corresponding to the number of empty squares (`.` is 10, an empty rank).

## Garbage notation

The garbage will be written as a list of numbers, the size of the numbers giving the amount of aligned clean garbage per garbage pile.

### Examples:

-   `incoming 1,1,1,1`: 4 lines of cheese
-   `incoming 4,2,1,1`: 4 clean, 2 clean then 2 cheese

## Examples:

-   Empty board: `././././././././././././././././././././ next IJSTLZ`
-   Empty board receiving garbage: `././././././././././././././././././././ next IJSTLZ incoming 4,1,1,1,2`
-   Board after I drop:<br> `./././././././././././././././././././3IIII3/ next JSTLZO`
-   Board after holding J and placing S: <br>`./././././././././././././././././5SS3/4SS4/3IIII3/ hold J next STLZOS`
-   Empty board after tetris PC: `././././././././././././././././././././ next IJSTLZ b2b 1 combo 2`
