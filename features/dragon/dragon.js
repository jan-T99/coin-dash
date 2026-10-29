/* global COIN_DASH */
// Dragon: one big, slow attacker that chases the player.
// Its speed is a fraction of COIN_DASH.droneSpeed, so the difficulty presets scale it too.
(function () {
  const SIZE = 64;
  const SPEED_RATIO = 0.6;
  const COLOR = 0xff8c42;
  const EYE_COLOR = 0x101c31;

  function spawnDragon(scene) {
    if (scene.dragon && scene.dragon.active) return;
    const c = COIN_DASH;
    // Start in the bottom-right corner, away from the player in the centre.
    const dragon = scene.add.rectangle(c.width - SIZE, c.height - SIZE, SIZE, SIZE, COLOR);
    scene.physics.add.existing(dragon);
    dragon.body.setCollideWorldBounds(true);
    const eyes = [-14, 14].map((dx) => ({ dx, eye: scene.add.circle(0, 0, 6, EYE_COLOR) }));
    scene.dragon = dragon;

    scene.physics.add.overlap(scene.player, dragon, () => scene.finish('The dragon caught you!'));

    const update = () => {
      if (scene.finished) return;
      scene.physics.moveToObject(dragon, scene.player, c.droneSpeed * SPEED_RATIO);
      eyes.forEach(({ dx, eye }) => eye.setPosition(dragon.x + dx, dragon.y - 10));
    };
    update();
    scene.events.on('update', update);
    scene.events.once('shutdown', () => scene.events.off('update', update));
  }

  function attach() {
    const scene = window.coinDashGame.scene.getScene('CoinDash');
    // The 'create' event fires after every CoinDash.create(), including restarts.
    scene.events.on('create', () => spawnDragon(scene));
    if (scene.sys.isActive() && scene.player) spawnDragon(scene);
  }

  if (window.coinDashGame.isBooted) attach();
  else window.coinDashGame.events.once('ready', attach);
})();
