# visual_themes

Two extra visual styles for Coin Dash, each with its own button above the game:

- **Neon dark mode**: dark purple background, glowing cyan player, yellow coin, pink drones,
  glowing grid and HUD. The glow is cheap on purpose: soft halo images (one pre-rendered radial-gradient texture,
  tinted and drawn with additive blending) follow the player, coin and drones, and a pre-blurred grid texture sits
  over the grid. No per-object `postFX` glow, which made neon mode lag (a full-canvas glow shader pass every frame).
  Halos need the WebGL renderer for tinting; on Canvas the colours still apply. HUD glow is a text shadow.
- **White mode**: light background with darker, high-contrast game colours.

Clicking the active button again returns to the classic look. The choice is saved in `localStorage`
(`coinDash.theme`) and switching applies live, without restarting the round.

## Hook-in

`index.html` loads `visual_themes.css` and, after `game.js`, `visual_themes.js`.
The script wraps `CoinDash.prototype.create` and `finish` to recolour the scene; `game.js` is unchanged.
