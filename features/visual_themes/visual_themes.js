/* global Phaser, COIN_DASH, CoinDash */
// Visual themes: a neon "dark" mode and a "white" mode, each toggled by its own button.
// Clicking the active theme's button again returns to the classic look.
// Loaded after game.js; it recolours the scene without changing game.js.
(function () {
  const STORAGE_KEY = 'coinDash.theme';
  const original = Object.assign({}, COIN_DASH.colors);

  const THEMES = {
    classic: {
      colors: original,
      gridLine: 0x24334b, gridAlpha: 0.45,
      hud: '#ffffff', overlay: 0x0a1120, overlayText: '#ffffff',
      glow: false, coinStroke: null
    },
    neon: {
      colors: { background: 0x07021a, player: 0x00f5ff, coin: 0xfff200, drone: 0xff2e88 },
      gridLine: 0xb026ff, gridAlpha: 0.4,
      hud: '#00f5ff', overlay: 0x0b0326, overlayText: '#ff7be5',
      glow: true, coinStroke: null
    },
    white: {
      colors: { background: 0xf6f8fc, player: 0x0f9d84, coin: 0xf2b705, drone: 0xe0344d },
      gridLine: 0xc9d3e1, gridAlpha: 0.9,
      hud: '#1b2638', overlay: 0xffffff, overlayText: '#1b2638',
      glow: false, coinStroke: 0xa87a00
    }
  };

  let current = 'classic';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (THEMES[saved]) current = saved;
  } catch (e) { /* storage unavailable: keep classic */ }

  function glow(obj, color, strength) {
    if (!obj.postFX) return; // Canvas renderer has no FX
    obj.postFX.clear();
    if (color !== undefined) obj.postFX.addGlow(color, strength, 0, false, 0.1, 12);
  }

  function textGlow(text, color, on) {
    if (on) text.setShadow(0, 0, color, 10, false, true);
    else text.setShadow(0, 0, '#000000', 0, false, false);
  }

  function applyToScene(scene) {
    if (!scene || !scene.player) return;
    const t = THEMES[current];
    const c = t.colors;
    const grid = scene.children.list.find(o => o.type === 'Grid');
    if (grid) {
      grid.setFillStyle(c.background, 1);
      grid.setOutlineStyle(t.gridLine, t.gridAlpha);
      glow(grid, t.glow ? t.gridLine : undefined, 0.6);
    }
    scene.player.setFillStyle(c.player);
    glow(scene.player, t.glow ? c.player : undefined, 4);
    scene.coin.setFillStyle(c.coin);
    if (t.coinStroke !== null) scene.coin.setStrokeStyle(2, t.coinStroke);
    else scene.coin.setStrokeStyle();
    glow(scene.coin, t.glow ? c.coin : undefined, 4);
    scene.drones.getChildren().forEach(d => {
      d.setFillStyle(c.drone);
      glow(d, t.glow ? c.drone : undefined, 4);
    });
    scene.hud.setColor(t.hud);
    textGlow(scene.hud, t.hud, t.glow);
    if (scene.themeOverlay) {
      const [box, text] = scene.themeOverlay;
      box.setFillStyle(t.overlay, 0.95);
      if (t.glow) box.setStrokeStyle(2, 0xff2e88);
      else if (current === 'white') box.setStrokeStyle(1, 0xc9d3e1);
      else box.setStrokeStyle();
      text.setColor(t.overlayText);
      textGlow(text, t.overlayText, t.glow);
    }
  }

  // Hook into the scene so every (re)started round picks up the theme.
  const create = CoinDash.prototype.create;
  CoinDash.prototype.create = function () {
    this.themeOverlay = null;
    create.apply(this, arguments);
    applyToScene(this);
  };
  const finish = CoinDash.prototype.finish;
  CoinDash.prototype.finish = function () {
    const wasFinished = this.finished;
    finish.apply(this, arguments);
    if (!wasFinished && this.finished) {
      this.themeOverlay = this.children.list.slice(-2); // [box, text] added by finish()
      applyToScene(this);
    }
  };

  function setTheme(name) {
    current = THEMES[name] ? name : 'classic';
    Object.assign(COIN_DASH.colors, THEMES[current].colors);
    document.body.dataset.theme = current;
    try { localStorage.setItem(STORAGE_KEY, current); } catch (e) { /* ignore */ }
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.theme === current)));
    const game = window.coinDashGame;
    if (game && game.scene) applyToScene(game.scene.getScene('CoinDash'));
  }

  // Buttons are injected next to the game so index.html only needs the load lines.
  const bar = document.createElement('div');
  bar.className = 'theme-switcher';
  bar.setAttribute('role', 'group');
  bar.setAttribute('aria-label', 'Visual theme');
  const buttons = [['neon', 'Neon dark mode'], ['white', 'White mode']].map(([name, label]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.theme = name;
    b.textContent = label;
    // Don't let the focused button keep keyboard focus (Space/arrow keys belong to the game).
    b.addEventListener('click', () => { setTheme(current === name ? 'classic' : name); b.blur(); });
    bar.appendChild(b);
    return b;
  });
  const gameEl = document.getElementById('game');
  gameEl.parentNode.insertBefore(bar, gameEl);

  setTheme(current);
})();
