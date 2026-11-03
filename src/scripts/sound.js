/* Local recorded applause, plus synthesized wheel ticks. No network requests. */
(function(root) {
  'use strict';
  let applause = null;
  let context = null;
  let enabled = true;
  const url = new URL('./assets/audio/applause.mp3', document.baseURI).href;
  function ensure() {
    if (applause) return applause;
    applause = new Audio(url);
    applause.preload = 'auto';
    applause.volume = 0.8;
    applause.addEventListener('error', () => console.warn('Applause file could not be loaded:', url));
    return applause;
  }
  function setEnabled(value) {
    enabled = Boolean(value);
    if (!enabled) stop();
  }
  function play() {
    if (!enabled) return;
    const player = ensure();
    player.pause();
    try { player.currentTime = 0; } catch (_) {}
    player.volume = 0.8;
    const promise = player.play();
    if (promise && promise.catch) promise.catch(err => console.warn('Audio playback unavailable:', err));
  }
  function stop() {
    if (!applause) return;
    applause.pause();
    try { applause.currentTime = 0; } catch (_) {}
  }
  let lastTick = 0;
  function tick() {
    if (!enabled || performance.now() - lastTick < 48) return;
    lastTick = performance.now();
    try {
      context ||= new (root.AudioContext || root.webkitAudioContext)();
      if (context.state === 'suspended') context.resume();
      const oscillator=context.createOscillator(), gain=context.createGain();
      oscillator.type='triangle'; oscillator.frequency.value=580;
      gain.gain.setValueAtTime(0.025,context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001,context.currentTime+0.04);
      oscillator.connect(gain);gain.connect(context.destination);
      oscillator.start();oscillator.stop(context.currentTime+0.045);
    } catch (_) {}
  }
  root.WheelSound = { play, stop, tick, setEnabled, preload: ensure };
})(globalThis);
