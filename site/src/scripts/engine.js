/* Wheel geometry and unbiased winner selection. Browser-global and Node-testable. */
(function(root) {
  'use strict';
  const TAU = Math.PI * 2;
  function randomInt(max, cryptoSource = root.crypto) {
    if (!Number.isInteger(max) || max < 1 || max > 1000) throw new RangeError('Invalid participant count');
    if (cryptoSource && typeof cryptoSource.getRandomValues === 'function') {
      const sample = new Uint32Array(1);
      const cap = Math.floor(4294967296 / max) * max;
      do { cryptoSource.getRandomValues(sample); } while (sample[0] >= cap);
      return sample[0] % max;
    }
    return Math.floor(Math.random() * max);
  }
  function chooseIndex(names, selected = '', cryptoSource = root.crypto) {
    const forced = selected && names.indexOf(selected);
    return forced !== '' && forced !== -1 ? forced : randomInt(names.length, cryptoSource);
  }
  function landingRotation(currentRotation, index, count, revolutions, fraction) {
    if (!Number.isInteger(index) || index < 0 || index >= count) throw new RangeError('Invalid winner index');
    const safeFraction = Math.max(0.12, Math.min(0.88, fraction));
    const segment = TAU / count;
    const target = ((TAU - (index + safeFraction) * segment) % TAU + TAU) % TAU;
    const current = ((currentRotation % TAU) + TAU) % TAU;
    const delta = (target - current + TAU) % TAU;
    return currentRotation + TAU * revolutions + delta;
  }
  function entriesFromText(text) {
    return text.split(/\r\n|\n|\r/).map(s => s.trim()).filter(Boolean);
  }
  const api = { TAU, randomInt, chooseIndex, landingRotation, entriesFromText };
  root.WheelEngine = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
