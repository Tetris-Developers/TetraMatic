# The `rules` message
Will give all necessary information about the game.

```rules <rulename1> <value1> <rulename2> <value2>```

## Rules
- `randomizer`: either `uniform`, `7bag`, `genbag`, `unknown`
- `startingpos`: `empty`, `uniform`, `cheese` etc.
- `rotations`: `srs`, `srs+`, `srsx`, `ars` etc.
- `illegal-penalty`: float
- `max-illegal-count`: int
- `illegal-delay`: float
- `oncrash`: either `forfeit-game`, `forfeit-round`, `bugfix`
- `combos`: list of numbers making the combos tables (wip)
- `b2b`: list of numbers making the b2b tables (wip)

Although the rules for the planned competition will be given before the start, TBP-2 informs the bots of the rules for further flexibility. For the planned competition, the rules will always be the same and the implementation doesn't have to take note of what rules are given.
