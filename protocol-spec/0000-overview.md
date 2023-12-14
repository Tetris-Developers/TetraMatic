# Overview

This document specifies the minimum viable product of the TBP-2, as well as the
minimum subset a conforming bot must implement. This version of the TBP-2 is quite
limited, but extensions will allow extra functionality and information to be
added in the future.

**TBP-2** is an implementation of the [Tetris Bot Protocol]("https://github.com/tetris-bot-protocol/tbp-spec") based on the [Universal Chess Interface]("https://en.wikipedia.org/wiki/Universal_Chess_Interface") made for the [Tetris Developers Bot Competition](#). Instead of using JSON as the original TBP, TBP-2 uses plain text, making it more compatible with some programming language and with the standard output. **TBP-2** aims to make TBP as easy as possible to implement and to read. Furthermore, TBP-2 is made for versus battles and will send both players' positions to each player.

A TBP-2 compliant bot is generally a separate process that sends and receives text messages
to communicate with a server. On most platforms, a bot is a separate
executable program that a frontend executes and communicates with over standard
input and output. On the web, a bot is a script that communicates with a server via a `WebSocket`

The typical lifecycle of a TBP bot is this.

```
[SETUP PROCESS]

    [BOT]:    info               # Bot asks for the game infos
    [SERVER]: rules ...          # Server responds with game rules

    [SERVER]: isready            # Server asks clients if read to pla
    [BOT]:    readyok            # Bot is ready

    [SERVER]: start position ... # Server tells the bots to start analzing

[GAME LOOP]

    [BOT]: suggestion ...        # (Not required) provide a continuous suggestion for infinite analysis.

    [SERVER]: play               # Allows the bot to play a move.
    [BOT]: bestmove ...          # Bot plays a move

    [SERVER]: newpiece ... position ... # Gives new info to the player

[ROUND ENDS]

    [SERVER]: stop
    [SERVER]: start position ...

[GAME ENDS]

    [SERVER]: quit
```

**NOTE**: The text in brackets should be ignored when implementing.

More specs and documentation about each command and notation will be provided.
