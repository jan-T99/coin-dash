# Achievements

Small pop-ups in the top-right corner when the player reaches a milestone:

| Pop-up | When |
| --- | --- |
| First coin! | 1 coin collected |
| 10 coins | 10 coins collected |
| 25 coins! | 25 coins collected |
| Halfway through the round | Half of `COIN_DASH.roundSeconds` has passed |
| Survived the whole round! | The timer ran out without a drone or the dragon catching you |

Achievements reset every round (each restart with R, or a difficulty change).

## How it hooks in

- One `<script src="features/achievements/achievements.js">` line in `index.html`, after `game.js`.
- It does not edit `game.js`. It listens to the `CoinDash` scene's `create` and `postupdate` events and only
  **reads** `scene.score`, `scene.finished`, `scene.deadline` and `scene.time.now`. It never changes game state.
- To add a milestone, add an entry to the `ACHIEVEMENTS` list in `achievements.js`.
