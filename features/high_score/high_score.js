/* global COIN_DASH */
// Persistent high score for Coin Dash. game.js calls HighScore.attach(scene) in create()
// and HighScore.submit(scene) in finish(); everything else lives here.
window.HighScore = (() => {
  const KEY = 'coinDash.highScore';
  // Fallback when localStorage is blocked or full: the best score still lasts for this page load.
  let memoryBest = 0;

  function storage() {
    // Merely reading window.localStorage can throw (e.g. SecurityError when site data is blocked).
    try { return window.localStorage; } catch (e) { return null; }
  }

  function parse(raw) {
    // Only accept a plain non-negative integer; anything else counts as no high score.
    if (typeof raw !== 'string' || !/^\d{1,15}$/.test(raw)) return 0;
    return Number(raw);
  }

  function load() {
    let stored = 0;
    try {
      const s = storage();
      if (s) stored = parse(s.getItem(KEY));
    } catch (e) { /* unreadable storage: fall back to memory */ }
    return Math.max(stored, memoryBest);
  }

  function save(value) {
    memoryBest = Math.max(memoryBest, value);
    try {
      const s = storage();
      if (s) s.setItem(KEY, String(value));
    } catch (e) { /* quota exceeded or blocked: keep the in-memory value */ }
  }

  function reset() {
    memoryBest = 0;
    try {
      const s = storage();
      if (s) s.removeItem(KEY);
    } catch (e) { /* nothing to reset */ }
  }

  function attach(scene) {
    const startBest = load();
    scene.highScore = { startBest };
    const text = scene.add.text(COIN_DASH.width - 18, 12, '', { font: '18px monospace', color: '#ffffff' })
      .setOrigin(1, 0);
    const refresh = () => {
      const beaten = scene.score > startBest;
      text.setText(`Best: ${Math.max(startBest, scene.score)}${beaten ? ' NEW!' : ''}`);
      text.setColor(beaten ? '#ffd166' : '#ffffff');
    };
    refresh();
    scene.events.on('update', refresh);
    scene.events.once('shutdown', () => scene.events.off('update', refresh));
  }

  function submit(scene) {
    if (!scene.highScore) return;
    const { startBest } = scene.highScore;
    const isNew = scene.score > startBest;
    if (isNew) save(scene.score);
    const cx = COIN_DASH.width / 2;
    const cy = COIN_DASH.height / 2;
    const style = { font: '20px monospace', color: '#ffffff', backgroundColor: '#0a1120', padding: { x: 10, y: 6 } };
    scene.add.text(cx, cy + 100, `High score: ${Math.max(startBest, scene.score)}`, style).setOrigin(0.5);
    if (isNew) {
      scene.add.text(cx, cy - 100, 'New high score!', { ...style, font: 'bold 24px monospace', color: '#ffd166' })
        .setOrigin(0.5);
    }
  }

  return { attach, submit, reset, load };
})();
