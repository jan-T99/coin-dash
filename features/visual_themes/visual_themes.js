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
      gridLine: 0xb026ff, gridAlpha: 0.7,
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

  // Cheap glow: pre-rendered soft textures drawn additively behind objects (no per-object postFX passes).
  function makeTexture(scene, key, w, h, draw) {
    if (scene.textures.exists(key)) return;
    const tex = scene.textures.createCanvas(key, w, h);
    draw(tex.getContext(), w, h);
    tex.refresh();
  }

  function haloTexture(scene) {
    makeTexture(scene, 'vt-halo', 64, 64, (ctx, w) => {
      const g = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.25, 'rgba(255,255,255,0.6)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, w);
    });
  }

  function gridGlowTexture(scene, grid) {
    makeTexture(scene, 'vt-gridglow', grid.width, grid.height, (ctx, w, h) => {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      for (let x = 0; x <= w; x += grid.cellWidth) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
      for (let y = 0; y <= h; y += grid.cellHeight) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
      ctx.stroke();
    });
  }

  // Created once per round (the first time neon is active), then only shown/hidden and re-tinted.
  function ensureGlow(scene, grid) {
    if (scene.themeGlow) return scene.themeGlow;
    haloTexture(scene);
    const halos = [scene.player, scene.coin, ...scene.drones.getChildren()].map(obj => {
      const img = scene.add.image(obj.x, obj.y, 'vt-halo').setBlendMode(Phaser.BlendModes.ADD);
      img.setDisplaySize(obj.width * 3.5, obj.height * 3.5);
      scene.children.moveBelow(img, obj);
      return { obj, img };
    });
    let gridGlow = null;
    if (grid) {
      gridGlowTexture(scene, grid);
      const tl = grid.getTopLeft();
      gridGlow = scene.add.image(tl.x, tl.y, 'vt-gridglow').setOrigin(0).setBlendMode(Phaser.BlendModes.ADD);
      scene.children.moveAbove(gridGlow, grid);
    }
    const glow = { halos, gridGlow, on: false };
    const sync = () => { if (glow.on) halos.forEach(h => h.img.setPosition(h.obj.x, h.obj.y)); };
    scene.events.on('prerender', sync);
    scene.events.once('shutdown', () => scene.events.off('prerender', sync));
    scene.themeGlow = glow;
    return glow;
  }

  function setGlow(scene, grid, t) {
    if (!t.glow && !scene.themeGlow) return;
    if (scene.sys.renderer.type !== Phaser.WEBGL) return; // tinting needs WebGL; Canvas keeps plain colours
    const glow = ensureGlow(scene, grid);
    glow.on = t.glow;
    glow.halos.forEach(({ obj, img }) => img.setTint(obj.fillColor).setAlpha(1).setPosition(obj.x, obj.y).setVisible(t.glow));
    if (glow.gridGlow) glow.gridGlow.setTint(t.gridLine).setAlpha(0.5).setVisible(t.glow);
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
    }
    scene.player.setFillStyle(c.player);
    scene.coin.setFillStyle(c.coin);
    if (t.coinStroke !== null) scene.coin.setStrokeStyle(2, t.coinStroke);
    else scene.coin.setStrokeStyle();
    scene.drones.getChildren().forEach(d => d.setFillStyle(c.drone));
    setGlow(scene, grid, t);
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
    this.themeGlow = null;
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
