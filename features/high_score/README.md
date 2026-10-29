# High score

Keeps the best score in `localStorage` under the key `coinDash.highScore`.

- During play: `Best: N` at the top right; it turns gold with `NEW!` once the stored best is beaten.
- Game over: `High score: N` below the result panel, plus `New high score!` above it when beaten.
- The score is saved only when a round finishes (timer or drone), not when R restarts mid-round.
- A missing, non-integer or otherwise corrupt stored value counts as 0. If `localStorage` is blocked
  or full, the best score is kept in memory for the current page load instead.

Hooks in shared files: one `<script>` line in `index.html`, and one line each in `create()` and
`finish()` in `game.js`.

Reset for testing (browser console): `HighScore.reset()` or `localStorage.removeItem('coinDash.highScore')`.
