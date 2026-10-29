# visual_themes

Two extra visual styles for Coin Dash, each with its own button above the game:

- **Neon dark mode**: dark purple background, glowing cyan player, yellow coin, pink drones,
  glowing grid and HUD (glow uses Phaser `postFX`, so it needs the WebGL renderer; on Canvas the colours still apply).
- **White mode**: light background with darker, high-contrast game colours.

Clicking the active button again returns to the classic look. The choice is saved in `localStorage`
(`coinDash.theme`) and switching applies live, without restarting the round.

## Hook-in

`index.html` loads `visual_themes.css` and, after `game.js`, `visual_themes.js`.
The script wraps `CoinDash.prototype.create` and `finish` to recolour the scene; `game.js` is unchanged.
