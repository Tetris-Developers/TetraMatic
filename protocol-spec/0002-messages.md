# Messages (Server -> Bot)

### `rules`

Will be specified in 0003

### `isready`

Is meant for the server to wait for the bots. Bots should respond with `readok` when ready. The game will not start unless both bots are ready

### `start`

The `start` message tells the bot to begin calculating from the specified
position. This message must be sent before asking the bot for a move. See [Position Notation](0001-notation.md)

```
start position POSITION
```

### `stop`

The `stop` message tells the bot to stop calculating.

### `suggest`

The `suggest` message tells the bot to suggest some next moves in order of
preference. It is only valid to send this message if the bot is calculating. The
bot should reply as quickly as possible with a `suggestion` message containing
suggested moves.

See [Move Notation](0001-notation.md). The bot can also provide additionnal information:

| Attribute | Description                                              |
| --------- | -------------------------------------------------------- |
| `nodes`   | Total number of nodes of current game tree.              |
| `nps`     | Number of nodes created per second.                      |
| `depth`   | The depth of current game tree.                          |
| `extra`   | Additional informational string about the provided move. |

Since bots may have different implementations of a game tree, it is not enforced for bots to provide all the values.
Also, it is up to bot developers how to count these values.

### `play`

The `play` message tells the bot to give its best move
send this message if the bot is calculating. The bot CANNOT play a move until this message is sent. `bestmove` before this command WILL BE IGNORED.

### `newpiece`

The `newpiece` message informs the bot that a new piece has been added to the **end of the queue**.

```
newpiece PIECE position POSITION
```

| Attribute  | Description                               |
| ---------- | ----------------------------------------- |
| `PIECE`    | A piece. Example: `"T"`                   |
| `POSITION` | See [Position Notation](0001-notation.md) |

### `illegal`

Is sent when the `bestmove` command gives an illegal move. Depending on the rules, the bot can be allowed a delay to play another move, a time penalty or a round forfeit.

```
illegal delay <seconds> remaining <number> penalty <seconds>
```

### `quit`

The `quit` message tells the bot to exit.

# Messages (Bot -> Frontend)

### `crash`

The `crash` message informs the server of an error that prevents the bot from playing. Depending on the rules, this message will either forfeit the game or give some time for hot bugfixing.

### `readyok`

The `readyok` message tells the frontend that the bot understands the specified
game rules and is ready to receive a position to calculate from.

### `info`

The `info` message must be sent by the bot immediately after it it launched to
advertise to the frontend what TBP features it supports. Once the frontend
receives this message, it can inform the bot of the game rules using the `rules`
message.

| Attribute  | Description                                                           |
| ---------- | --------------------------------------------------------------------- |
| `name`     | A string, the human-friendly name of the bot. Example: `"Cold Clear"` |
| `version`  | A string version identifier. Example: `"Gen 14 proto 8"`              |
| `author`   | A string identifying the author of the bot. Example: `"SoRA_X7"`      |
| `features` | A list of supported features.                                         |

### `suggestion`

The `suggestion` message is sent in response to a `suggest` message. It informs
the frontend of what moves the bot wishes to make in order of preference. The
frontend should play the most preferred valid move. Whether
a hold should be performed is inferred from the type of piece to be placed. This message is essentially made for analysis and does not have to be legal.

| Attribute | Description                             |
| --------- | --------------------------------------- |
| `moves`   | A list of moves in order of preference. |

A move is an object with the following attributes:

### `bestmove`

The `bestmove` command gives the server the move that the bot wants to play.
