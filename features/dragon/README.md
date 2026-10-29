# dragon

Adds one big orange dragon (64×64, drones are 26×26) that slowly chases the player.
Touching it ends the round ("The dragon caught you!").

## Speed and difficulty

The dragon moves at `COIN_DASH.droneSpeed × 0.6`, so the difficulty presets
(`features/difficulty_presets`) scale it as well:

| Preset | Drone speed | Dragon speed |
|--------|-------------|--------------|
| Easy   | 40          | 24           |
| Medium | 105         | 63           |
| Hard   | 210         | 126          |

Without the presets feature, it uses the default drone speed from `settings.js`.

## Hook into shared files

`index.html` only: one `<script>` line after `game.js` (and after the difficulty preset scripts).
`game.js` is unchanged. The dragon hooks into the scene's `create` and `update` events.
