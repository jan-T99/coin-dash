/* global COIN_DASH */
// Achievements: small pop-ups when the player reaches a milestone.
// Read-only: this file looks at the scene's score, deadline and finished flag, and never changes them.
(function () {
  // Each check gets a snapshot of the round and returns true once the milestone is reached.
  const ACHIEVEMENTS = [
    { id: 'first_coin', text: 'First coin!', check: (s) => s.score >= 1 },
    { id: 'coins_10', text: '10 coins', check: (s) => s.score >= 10 },
    { id: 'coins_25', text: '25 coins!', check: (s) => s.score >= 25 },
    { id: 'halfway', text: 'Halfway through the round', check: (s) => !s.finished && s.elapsed >= s.total / 2 },
    { id: 'survived', text: 'Survived the whole round!', check: (s) => s.finished && s.timeUp }
  ];

  const TOAST = { x: COIN_DASH.width - 16, firstY: 54, gap: 38, showMs: 2200, fadeMs: 400 };

  function watchRound(scene) {
    const unlocked = new Set();
    const toasts = [];

    function snapshot() {
      const total = COIN_DASH.roundSeconds * 1000;
      const remaining = scene.deadline - scene.time.now;
      return {
        score: scene.score,
        finished: scene.finished,
        timeUp: remaining <= 0, // round ended by the clock, not by being caught
        total,
        elapsed: total - remaining
      };
    }

    function show(text) {
      const y = TOAST.firstY + toasts.length * TOAST.gap;
      const toast = scene.add.text(TOAST.x, y, `★ ${text}`, {
        font: '16px monospace', color: '#101c31', backgroundColor: '#ffd166',
        padding: { x: 10, y: 6 }
      }).setOrigin(1, 0).setDepth(1000).setAlpha(0);
      toasts.push(toast);
      // Tweens and timers belong to the scene's own clock; they keep running after physics pauses.
      scene.tweens.add({ targets: toast, alpha: 1, duration: 200 });
      scene.time.delayedCall(TOAST.showMs, () => {
        scene.tweens.add({
          targets: toast, alpha: 0, duration: TOAST.fadeMs,
          onComplete: () => {
            toasts.splice(toasts.indexOf(toast), 1);
            toast.destroy();
            toasts.forEach((t, i) => { t.y = TOAST.firstY + i * TOAST.gap; });
          }
        });
      });
    }

    const update = () => {
      if (typeof scene.score !== 'number') return;
      const state = snapshot();
      ACHIEVEMENTS.forEach((a) => {
        if (!unlocked.has(a.id) && a.check(state)) {
          unlocked.add(a.id);
          show(a.text);
        }
      });
    };

    // 'postupdate' runs after CoinDash.update(), so a round that just ended is seen in the same frame.
    scene.events.on('postupdate', update);
    scene.events.once('shutdown', () => scene.events.off('postupdate', update));
  }

  function attach() {
    const scene = window.coinDashGame.scene.getScene('CoinDash');
    // 'create' fires after every CoinDash.create(), including restarts, so each round starts fresh.
    scene.events.on('create', () => watchRound(scene));
    if (scene.sys.isActive() && scene.player) watchRound(scene);
  }

  if (window.coinDashGame.isBooted) attach();
  else window.coinDashGame.events.once('ready', attach);
})();
