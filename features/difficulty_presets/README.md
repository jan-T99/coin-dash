# difficulty_presets

Adds three difficulty presets that change only the speed of the red drones.
The player speed (`COIN_DASH.playerSpeed`) stays the same in every preset.

| Preset | Drone speed (px/s) |
|--------|--------------------|
| Easy   | 40                 |
| Medium | 105 (original game, default) |
| Hard   | 210                |

## Usage

- Click the buttons under the game, or press **1** / **2** / **3**.
- Changing difficulty restarts the current round.
- The last choice is remembered in `localStorage` (`coinDash.difficulty`).

## Files

- `difficulty.js`: registry (`COIN_DASH_DIFFICULTY`), button bar, keyboard shortcuts
- `difficulty.css`: button bar styles
- `presets/easy.js`, `presets/medium.js`, `presets/hard.js`: one preset each

## Hook into shared files

`index.html` only: one stylesheet link and four `<script>` lines after `game.js`.
No changes to `game.js` or `settings.js`. The preset overrides `COIN_DASH.droneSpeed` before the scene's `create()` runs.
