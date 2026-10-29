# Power-ups

Random pickups that are collected like coins. Only one pickup is on the field at a time.
The first one appears after about 4 s and the next ones every 6–10 s. A pickup blinks and
disappears if it is not collected within 7 s.

| Pickup | Look | Effect | Duration |
| --- | --- | --- | --- |
| Speed | blue circle with lightning bolt | player moves 1.6× faster, with speed streaks | 6 s |
| Shield | purple shield | ring around player; absorbs one drone hit, bounces the drone away, 1.2 s blink invulnerability | 12 s or until hit |
| Magnet | pink horseshoe magnet | pulls the coin toward the player when it is inside the faint 170 px circle | 8 s |

The active effects are shown at the right of the top bar: icon, a shrinking bar and the seconds left.
They blink during the last 2 s. Picking up an effect that is already active restarts its timer.

## How it hooks in

`power_ups.js` is loaded after `game.js` (one `<script>` line in `index.html`) and wraps
`CoinDash.prototype.create`, `update` and `finish`. `game.js` itself is unchanged.
All state lives in `scene.powerUps` and is rebuilt on every restart (R).

## Debug mode

Open `index.html?powerups-debug`. Keys **1**, **2** and **3** then spawn a speed, shield or magnet
pickup right next to the player.
