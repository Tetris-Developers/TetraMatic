# Spectating

Spectating has a way lighter protocol than playing. It will forward every bot response with the side playing and from the server:

## Example:
```
left readyok
right readyok

server start position ...
right suggest ...

server play
left bestmove ...
right bestmove ...
```