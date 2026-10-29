# touch_controls

Floating virtual joystick for phones and tablets.

- Turns on only on touch devices (`navigator.maxTouchPoints`, `ontouchstart`, `pointer: coarse`),
  or on the first real `touchstart`. Desktop pages are unchanged.
- Touch and drag anywhere on the game: the joystick base jumps under your finger and the player moves
  in the drag direction at normal speed, like the arrow keys / WASD (which keep working).
- Adds a **Restart** button below the game, since touch devices have no R key.
- Blocks page scroll/zoom from the game area with `touch-action: none`, non-passive
  `touchstart`/`touchmove` handlers, iOS `gesturestart`, and a `user-scalable=no` viewport.

Hook-in: the only shared-file change is one `<script src="features/touch_controls/touch_controls.js">`
line in `index.html`, after `game.js`. The script loads `touch_controls.css` itself and wraps
`CoinDash.prototype.update` to add the joystick direction (`window.coinDashTouch.{x,y}`) to the
keyboard direction, so `game.js` is unchanged.
