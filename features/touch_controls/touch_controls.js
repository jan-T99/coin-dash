// Touch controls for Coin Dash: a floating virtual joystick over the game area.
// game.js reads window.coinDashTouch.{x,y} (a unit vector, or 0,0 when idle) in update(),
// alongside the arrow keys / WASD.
(function () {
  const touch = window.coinDashTouch = { x: 0, y: 0 };
  const RADIUS = 50;     // how far (CSS px) the knob can travel from the base centre
  const DEAD_ZONE = 10;  // ignore tiny finger movements around the centre

  const game = document.getElementById('game');
  if (!game) return;

  let enabled = false;
  let activePointer = null;
  let originX = 0;
  let originY = 0;
  let zone, base, knob;

  function isTouchDevice() {
    return navigator.maxTouchPoints > 0 || 'ontouchstart' in window
      || window.matchMedia('(pointer: coarse)').matches;
  }

  function enable() {
    if (enabled) return;
    enabled = true;
    document.documentElement.classList.add('touch-controls');

    // Stop pinch/double-tap zoom of the page (browsers that honour it; touch-action covers the rest).
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) viewport.content = 'width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no';

    zone = document.createElement('div');
    zone.className = 'touch-controls-zone';
    base = document.createElement('div');
    base.className = 'touch-controls-base';
    knob = document.createElement('div');
    knob.className = 'touch-controls-knob';
    base.appendChild(knob);
    zone.appendChild(base);
    game.appendChild(zone);

    const bar = document.createElement('div');
    bar.className = 'touch-controls-bar';
    bar.innerHTML = '<span>Touch: drag anywhere on the game to move</span>';
    const restart = document.createElement('button');
    restart.type = 'button';
    restart.textContent = 'Restart';
    restart.addEventListener('click', () => {
      const scene = window.coinDashGame && window.coinDashGame.scene.getScene('CoinDash');
      if (scene) scene.scene.restart();
      release();
    });
    bar.appendChild(restart);
    game.insertAdjacentElement('afterend', bar);

    zone.addEventListener('pointerdown', onDown);
    zone.addEventListener('pointermove', onMove);
    zone.addEventListener('pointerup', onUp);
    zone.addEventListener('pointercancel', onUp);
    zone.addEventListener('lostpointercapture', onUp);
    // Belt and braces for browsers that still scroll/zoom despite touch-action: none.
    const block = (e) => e.preventDefault();
    zone.addEventListener('touchstart', block, { passive: false });
    zone.addEventListener('touchmove', block, { passive: false });
    zone.addEventListener('contextmenu', block);
    document.addEventListener('gesturestart', block); // iOS Safari pinch
    window.addEventListener('blur', release);
  }

  function setKnob(dx, dy) {
    knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  }

  function onDown(e) {
    if (activePointer !== null) return;
    activePointer = e.pointerId;
    zone.setPointerCapture(e.pointerId);
    const rect = zone.getBoundingClientRect();
    originX = e.clientX;
    originY = e.clientY;
    base.style.left = `${e.clientX - rect.left}px`;
    base.style.top = `${e.clientY - rect.top}px`;
    base.classList.add('active');
    setKnob(0, 0);
    e.preventDefault();
  }

  function onMove(e) {
    if (e.pointerId !== activePointer) return;
    const dx = e.clientX - originX;
    const dy = e.clientY - originY;
    const length = Math.hypot(dx, dy);
    if (length < DEAD_ZONE) {
      touch.x = 0;
      touch.y = 0;
    } else {
      touch.x = dx / length;
      touch.y = dy / length;
    }
    const clamp = Math.min(length, RADIUS) / (length || 1);
    setKnob(dx * clamp, dy * clamp);
    e.preventDefault();
  }

  function onUp(e) {
    if (e.pointerId !== activePointer) return;
    release();
  }

  function release() {
    activePointer = null;
    touch.x = 0;
    touch.y = 0;
    if (!base) return;
    base.classList.remove('active');
    base.style.left = '';
    base.style.top = '';
    setKnob(0, 0);
  }

  if (isTouchDevice()) enable();
  // Also switch on the first time a real touch happens (e.g. touch laptops that report no touch support).
  window.addEventListener('touchstart', enable, { once: true, passive: true });
})();
