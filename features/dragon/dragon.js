/* global COIN_DASH */
// Dragon: one big, slow attacker that chases the player.
// Its speed is a fraction of COIN_DASH.droneSpeed, so the difficulty presets scale it too.
(function () {
  const TEXTURE = 'dragon';
  const WIDTH = 96;
  const HEIGHT = 72;
  const HITBOX = { width: 64, height: 44 };
  const SPEED_RATIO = 0.6;
  const COLORS = {
    body: 0xff8c42, wing: 0xc2410c, belly: 0xffd29a, horn: 0xfff1d6,
    eye: 0xffffff, pupil: 0x101c31
  };

  // Draws a right-facing dragon once and stores it as a texture.
  function makeTexture(scene) {
    if (scene.textures.exists(TEXTURE)) return;
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    // Wings (behind the body)
    g.fillStyle(COLORS.wing);
    g.fillPoints([{ x: 28, y: 34 }, { x: 38, y: 4 }, { x: 47, y: 18 }, { x: 56, y: 6 }, { x: 66, y: 32 }], true);
    // Tail with a spiked tip
    g.fillStyle(COLORS.body);
    g.fillTriangle(6, 40, 32, 34, 32, 50);
    g.fillStyle(COLORS.wing);
    g.fillTriangle(0, 30, 12, 38, 4, 46);
    // Legs
    g.fillRect(36, 54, 8, 12);
    g.fillRect(56, 54, 8, 12);
    // Body and belly
    g.fillStyle(COLORS.body);
    g.fillEllipse(48, 46, 46, 28);
    g.fillStyle(COLORS.belly);
    g.fillEllipse(50, 52, 30, 12);
    // Back spikes
    g.fillStyle(COLORS.wing);
    g.fillTriangle(32, 36, 36, 26, 40, 34);
    g.fillTriangle(56, 33, 60, 25, 64, 35);
    // Neck, head and snout
    g.fillStyle(COLORS.body);
    g.fillTriangle(60, 40, 72, 28, 74, 46);
    g.fillEllipse(76, 34, 26, 20);
    g.fillEllipse(88, 38, 16, 11);
    // Horns
    g.fillStyle(COLORS.horn);
    g.fillTriangle(68, 28, 64, 12, 75, 25);
    g.fillTriangle(77, 25, 80, 11, 84, 27);
    // Eye and nostril
    g.fillStyle(COLORS.eye);
    g.fillCircle(78, 31, 4);
    g.fillStyle(COLORS.pupil);
    g.fillCircle(79, 31, 2);
    g.fillCircle(93, 36, 1.5);
    g.generateTexture(TEXTURE, WIDTH, HEIGHT);
    g.destroy();
  }

  function spawnDragon(scene) {
    if (scene.dragon && scene.dragon.active) return;
    const c = COIN_DASH;
    makeTexture(scene);
    // Start in the bottom-right corner, away from the player in the centre.
    const dragon = scene.physics.add.image(c.width - WIDTH, c.height - HEIGHT, TEXTURE);
    dragon.body.setSize(HITBOX.width, HITBOX.height).setCollideWorldBounds(true);
    // A gentle bob so it looks like it is flying.
    scene.tweens.add({ targets: dragon, angle: { from: -4, to: 4 }, duration: 450, yoyo: true, repeat: -1 });
    scene.dragon = dragon;

    scene.physics.add.overlap(scene.player, dragon, () => scene.finish('The dragon caught you!'));

    const update = () => {
      if (scene.finished) return;
      scene.physics.moveToObject(dragon, scene.player, c.droneSpeed * SPEED_RATIO);
      dragon.setFlipX(dragon.body.velocity.x < 0);
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
