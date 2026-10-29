# touch_controls

Floating virtual joystick for phones and tablets.

- Turns on only on touch devices (`navigator.maxTouchPoints`, `ontouchstart`, `pointer: coarse`),
  or on the first real `touchstart`. Desktop pages are unchanged.
- Touch and drag anywhere on the game: the joystick base jumps under your finger and the player moves
  in the drag direction at normal speed, like the arrow keys / WASD (which keep working).
- Adds a **Restart** button below the game, since touch devices have no R key.
- Blocks page scroll/zoom from the game area with `touch-action: none`, non-passive
  `touchstart`/`touchmove` handlers, iOS `gesturestart`, and a `user-scalable=no` viewport.

Hook-in: `game.js` adds `window.coinDashTouch.{x,y}` to the keyboard direction in `update()`;
`index.html` loads `touch_controls.css` and `touch_controls.js`.
