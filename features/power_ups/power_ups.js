/* global Phaser, CoinDash */
// Power-ups: speed boost, shield and coin magnet.
// The feature wraps CoinDash's create/update/finish, so game.js needs no changes.
// Load it after game.js. All state lives on `scene.powerUps` and is rebuilt on every restart.
(function () {
  if (typeof CoinDash === 'undefined') return;

  const CONFIG = {
    firstSpawnMs: 4000,
    spawnMinMs: 6000,
    spawnMaxMs: 10000,
    pickupLifetimeMs: 7000,
    invulnerableMs: 1200,
    // Open index.html?powerups-debug to spawn power-ups next to the player with keys 1, 2 and 3.
    debug: new URLSearchParams(window.location.search).has('powerups-debug')
  };

  const TYPES = {
    speed: { label: 'SPEED', color: 0x4cc9f0, durationMs: 6000, multiplier: 1.6 },
    shield: { label: 'SHIELD', color: 0xb388ff, durationMs: 12000 },
    magnet: { label: 'MAGNET', color: 0xff8fd8, durationMs: 8000, radius: 170, pullSpeed: 320 }
  };
  const ORDER = ['speed', 'shield', 'magnet'];
  const TEX = 32;

  // ---- Textures (drawn with code once per game) ----

  const DRAW = {
    speed(g, color) {
      g.fillStyle(color).fillCircle(16, 16, 15);
      g.lineStyle(2, 0xffffff).strokeCircle(16, 16, 14);
      g.fillStyle(0xffffff).fillPoints([
        { x: 19, y: 4 }, { x: 9, y: 18 }, { x: 15, y: 18 },
        { x: 13, y: 28 }, { x: 23, y: 13 }, { x: 17, y: 13 }, { x: 21, y: 4 }
      ], true);
    },
    shield(g, color) {
      const outline = [
        { x: 16, y: 2 }, { x: 29, y: 7 }, { x: 28, y: 18 },
        { x: 16, y: 30 }, { x: 4, y: 18 }, { x: 3, y: 7 }
      ];
      g.fillStyle(color).fillPoints(outline, true);
      g.lineStyle(2, 0xffffff).strokePoints(outline, true);
      g.fillStyle(0xffffff, 0.55).fillPoints([
        { x: 16, y: 7 }, { x: 23, y: 10 }, { x: 22, y: 17 }, { x: 16, y: 24 }
      ], true);
    },
    magnet(g, color) {
      g.lineStyle(7, color);
      g.beginPath().arc(16, 15, 9, 0, Math.PI, false).strokePath();
      g.lineBetween(7, 15, 7, 7).lineBetween(25, 15, 25, 7);
      g.fillStyle(0xffffff).fillRect(3, 2, 8, 6).fillRect(21, 2, 8, 6);
    }
  };

  function ensureTextures(scene) {
    ORDER.forEach(type => {
      const key = `powerup-${type}`;
      if (scene.textures.exists(key)) return;
      const g = scene.add.graphics();
      DRAW[type](g, TYPES[type].color);
      g.generateTexture(key, TEX, TEX);
      g.destroy();
    });
  }

  // ---- Setup ----

  function setup(scene) {
    ensureTextures(scene);
    const pu = scene.powerUps = {
      active: {},
      pickup: null,
      invulnerableUntil: 0,
      group: scene.physics.add.group(),
      aura: scene.add.graphics().setDepth(5),
      slots: {}
    };
    scene.physics.add.overlap(scene.player, pu.group, (player, pickup) => collect(scene, pickup));
    ORDER.forEach(type => { pu.slots[type] = createSlot(scene, type); });
    scheduleSpawn(scene, CONFIG.firstSpawnMs);

    if (CONFIG.debug) {
      ['ONE', 'TWO', 'THREE'].forEach((key, i) => {
        scene.input.keyboard.on(`keydown-${key}`, () => {
          const bounds = scene.physics.world.bounds;
          const x = Phaser.Math.Clamp(scene.player.x + 70, bounds.x + 20, bounds.right - 20);
          spawnPickup(scene, ORDER[i], x, scene.player.y);
        });
      });
    }
  }

  // ---- Spawning and collecting ----

  function scheduleSpawn(scene, delay) {
    scene.time.delayedCall(delay, () => {
      if (scene.finished) return;
      if (!scene.powerUps.pickup) spawnRandom(scene);
      scheduleSpawn(scene, Phaser.Math.Between(CONFIG.spawnMinMs, CONFIG.spawnMaxMs));
    });
  }

  function spawnRandom(scene) {
    const { width, height } = scene.scale;
    // Same area as coins, kept away from the player and the current coin.
    let x, y;
    do {
      x = Phaser.Math.Between(25, width - 25);
      y = Phaser.Math.Between(70, height - 25);
    } while (Phaser.Math.Distance.Between(x, y, scene.player.x, scene.player.y) < 120
      || Phaser.Math.Distance.Between(x, y, scene.coin.x, scene.coin.y) < 40);
    spawnPickup(scene, Phaser.Utils.Array.GetRandom(ORDER), x, y);
  }

  function spawnPickup(scene, type, x, y) {
    const pu = scene.powerUps;
    if (pu.pickup) pu.pickup.destroy();
    const pickup = pu.group.create(x, y, `powerup-${type}`);
    pickup.body.setCircle(13, 3, 3);
    pickup.setData('type', type).setData('expiresAt', scene.time.now + CONFIG.pickupLifetimeMs);
    scene.tweens.add({ targets: pickup, scale: 1.15, duration: 450, yoyo: true, repeat: -1 });
    pu.pickup = pickup;
  }

  function collect(scene, pickup) {
    if (scene.finished || !pickup.active) return;
    const type = pickup.getData('type');
    pickup.destroy();
    scene.powerUps.pickup = null;
    // Collecting an effect that is already running restarts its timer.
    scene.powerUps.active[type] = { until: scene.time.now + TYPES[type].durationMs };
    floatText(scene, scene.player.x, scene.player.y - 24, `+${TYPES[type].label}`, TYPES[type].color);
  }

  function expire(scene, type) {
    delete scene.powerUps.active[type];
    if (type === 'magnet') scene.coin.body.setVelocity(0, 0);
  }

  function floatText(scene, x, y, message, color) {
    const text = scene.add.text(x, y, message, {
      font: 'bold 14px monospace', color: `#${color.toString(16).padStart(6, '0')}`
    }).setOrigin(0.5).setDepth(11);
    scene.tweens.add({ targets: text, y: y - 30, alpha: 0, duration: 900, onComplete: () => text.destroy() });
  }

  // ---- Shield ----

  function absorbHit(scene) {
    const pu = scene.powerUps;
    expire(scene, 'shield');
    pu.invulnerableUntil = scene.time.now + CONFIG.invulnerableMs;
    // Bounce every touching drone straight away from the player at its current speed.
    scene.drones.getChildren().forEach(drone => {
      if (!scene.physics.overlap(scene.player, drone)) return;
      const speed = drone.body.velocity.length();
      const away = new Phaser.Math.Vector2(drone.x - scene.player.x, drone.y - scene.player.y);
      if (away.lengthSq() === 0) away.set(1, 0);
      away.normalize().scale(speed);
      drone.body.setVelocity(away.x, away.y);
    });
    const burst = scene.add.circle(scene.player.x, scene.player.y, 22)
      .setStrokeStyle(3, TYPES.shield.color).setDepth(6);
    scene.tweens.add({ targets: burst, scale: 2.5, alpha: 0, duration: 400, onComplete: () => burst.destroy() });
    scene.cameras.main.shake(150, 0.006);
    floatText(scene, scene.player.x, scene.player.y - 24, 'BLOCKED!', TYPES.shield.color);
  }

  // ---- Per-frame update ----

  function update(scene) {
    const pu = scene.powerUps;
    const now = scene.time.now;
    ORDER.forEach(type => { if (pu.active[type] && now >= pu.active[type].until) expire(scene, type); });

    if (pu.active.speed) scene.player.body.velocity.scale(TYPES.speed.multiplier);

    if (pu.active.magnet) {
      const { radius, pullSpeed } = TYPES.magnet;
      const pull = new Phaser.Math.Vector2(scene.player.x - scene.coin.x, scene.player.y - scene.coin.y);
      if (pull.length() < radius) pull.normalize().scale(pullSpeed);
      else pull.set(0, 0);
      scene.coin.body.setVelocity(pull.x, pull.y);
    }

    const blinking = now < pu.invulnerableUntil && Math.floor(now / 80) % 2 === 0;
    scene.player.setAlpha(blinking ? 0.3 : 1);

    if (pu.pickup) {
      const left = pu.pickup.getData('expiresAt') - now;
      if (left <= 0) {
        pu.pickup.destroy();
        pu.pickup = null;
      } else {
        pu.pickup.setAlpha(left < 2000 && Math.floor(now / 120) % 2 === 0 ? 0.3 : 1);
      }
    }

    drawAura(scene);
    drawSlots(scene);
  }

  function drawAura(scene) {
    const { active, aura } = scene.powerUps;
    const { x, y } = scene.player;
    aura.clear();
    if (active.magnet) {
      aura.lineStyle(1, TYPES.magnet.color, 0.35).strokeCircle(x, y, TYPES.magnet.radius);
    }
    if (active.shield) {
      aura.fillStyle(TYPES.shield.color, 0.15).fillCircle(x, y, 22);
      aura.lineStyle(3, TYPES.shield.color, 0.9).strokeCircle(x, y, 22);
    }
    const velocity = scene.player.body.velocity;
    if (active.speed && velocity.lengthSq() > 0) {
      // Speed streaks trail behind the player, opposite to its movement.
      const back = velocity.clone().normalize();
      const side = new Phaser.Math.Vector2(-back.y, back.x);
      aura.lineStyle(2, TYPES.speed.color, 0.8);
      [-8, 0, 8].forEach(offset => {
        const sx = x - back.x * 16 + side.x * offset;
        const sy = y - back.y * 16 + side.y * offset;
        aura.lineBetween(sx, sy, sx - back.x * 18, sy - back.y * 18);
      });
    }
  }

  // ---- HUD indicators (right side of the top bar) ----

  const SLOT = { x: 492, y: 22, width: 100, barWidth: 44 };

  function createSlot(scene, type) {
    const { color } = TYPES[type];
    const icon = scene.add.image(0, 0, `powerup-${type}`).setScale(0.6);
    const barBg = scene.add.rectangle(13, 0, SLOT.barWidth, 8, 0x24334b).setOrigin(0, 0.5);
    const barFill = scene.add.rectangle(13, 0, SLOT.barWidth, 8, color).setOrigin(0, 0.5);
    const label = scene.add.text(13 + SLOT.barWidth + 5, 0, '', {
      font: '14px monospace', color: '#ffffff'
    }).setOrigin(0, 0.5);
    const container = scene.add.container(0, SLOT.y, [icon, barBg, barFill, label])
      .setDepth(10).setVisible(false);
    return { container, barFill, label };
  }

  function drawSlots(scene) {
    const { active, slots } = scene.powerUps;
    const now = scene.time.now;
    let index = 0;
    ORDER.forEach(type => {
      const slot = slots[type];
      const effect = active[type];
      slot.container.setVisible(Boolean(effect));
      if (!effect) return;
      const left = effect.until - now;
      slot.container.setX(SLOT.x + index * SLOT.width);
      slot.barFill.setScale(Phaser.Math.Clamp(left / TYPES[type].durationMs, 0, 1), 1);
      slot.label.setText(`${Math.ceil(left / 1000)}s`);
      slot.container.setAlpha(left < 2000 && Math.floor(now / 150) % 2 === 0 ? 0.4 : 1);
      index++;
    });
  }

  // ---- Hooks into CoinDash ----

  const originalCreate = CoinDash.prototype.create;
  const originalUpdate = CoinDash.prototype.update;
  const originalFinish = CoinDash.prototype.finish;

  CoinDash.prototype.create = function (...args) {
    originalCreate.apply(this, args);
    setup(this);
  };

  CoinDash.prototype.update = function (...args) {
    originalUpdate.apply(this, args);
    if (this.powerUps && !this.finished) update(this);
  };

  CoinDash.prototype.finish = function (...args) {
    const pu = this.powerUps;
    const droneHit = pu && !this.finished && this.time.now < this.deadline
      && this.physics.overlap(this.player, this.drones);
    if (droneHit) {
      if (this.time.now < pu.invulnerableUntil) return;
      if (pu.active.shield) {
        absorbHit(this);
        return;
      }
    }
    originalFinish.apply(this, args);
  };
}());
