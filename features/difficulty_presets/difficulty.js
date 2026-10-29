/* global COIN_DASH */
// Difficulty presets: each preset only changes the drone speed. The player speed is never touched.
// Preset files in presets/ call COIN_DASH_DIFFICULTY.register(...) after this file loads.
(function () {
  const STORAGE_KEY = 'coinDash.difficulty';
  const DEFAULT = 'medium';
  const ORDER = ['easy', 'medium', 'hard'];

  function loadChoice() {
    try { return localStorage.getItem(STORAGE_KEY) || DEFAULT; } catch (e) { return DEFAULT; }
  }

  function saveChoice(name) {
    try { localStorage.setItem(STORAGE_KEY, name); } catch (e) { /* storage unavailable */ }
  }

  const api = {
    presets: {},
    current: loadChoice(),

    // preset: { label: string, droneSpeed: number }
    register(name, preset) {
      api.presets[name] = preset;
      if (name === api.current) api.apply(name);
      api.renderButtons();
    },

    apply(name) {
      const preset = api.presets[name];
      if (!preset) return;
      api.current = name;
      saveChoice(name);
      COIN_DASH.droneSpeed = preset.droneSpeed;
      // Drones read droneSpeed in create(), so restart a running round to use the new speed.
      const scene = window.coinDashGame && window.coinDashGame.scene.getScene('CoinDash');
      if (scene && scene.sys.isActive()) scene.scene.restart();
      api.renderButtons();
    },

    renderButtons() {
      const bar = document.getElementById('difficulty-presets');
      if (!bar) return;
      bar.replaceChildren();
      ORDER.filter((name) => api.presets[name]).forEach((name, i) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = `${i + 1} · ${api.presets[name].label}`;
        button.setAttribute('aria-pressed', String(name === api.current));
        button.addEventListener('click', () => { api.apply(name); button.blur(); });
        bar.appendChild(button);
      });
    }
  };

  window.COIN_DASH_DIFFICULTY = api;

  document.addEventListener('DOMContentLoaded', () => {
    const bar = document.createElement('div');
    bar.id = 'difficulty-presets';
    bar.setAttribute('aria-label', 'Difficulty');
    document.getElementById('game').insertAdjacentElement('afterend', bar);
    api.renderButtons();
  });

  // Keys 1 / 2 / 3 switch between easy / medium / hard.
  document.addEventListener('keydown', (event) => {
    const name = ORDER[Number(event.key) - 1];
    if (name && api.presets[name]) api.apply(name);
  });
})();
