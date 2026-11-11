import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
// Force the native-linear branch so the real sampled easing can be inspected.
const before = globalThis.CSS;
globalThis.CSS = { supports: () => true };
const motion = await import('../tripfit-motion.js?linear-tuning-test');
if (before === undefined) delete globalThis.CSS; else globalThis.CSS = before;
const samples = curve => curve.easing.slice(7, -1).split(',').map(Number);

test('pop retains a small rebound instead of the original large overshoot', () => {
  const original = Math.max(...samples(motion.makeSpring(320,15))) - 1;
  const tuned = Math.max(...samples(motion.springs.pop)) - 1;
  assert.ok(original > .22 && original < .25);
  assert.ok(tuned > .04 && tuned < .065);
  assert.ok(tuned < original / 3);
  assert.ok(motion.springs.pop.duration < motion.makeSpring(320,15).duration);
});
test('snap and soft spring profiles are unchanged', () => {
  assert.deepEqual(motion.springs.snap, motion.makeSpring(420,34));
  assert.deepEqual(motion.springs.soft, motion.makeSpring(170,20));
});
test('gentler pop still finishes precisely at its target', () => {
  const curve=samples(motion.springs.pop);
  assert.equal(curve[0],0);assert.equal(curve.at(-1),1);
  assert.ok(curve.every(Number.isFinite));
});
test('explicit spring presets retain their shorter vertical travel', () => {
  for (const name of ['tripfit-motion.js','effects.js']) {
    const source=fs.readFileSync(new URL('../'+name,import.meta.url),'utf8');
    assert.ok(source.includes('translateY(24px) scale(.98)'));
  }
});
test('frame and collapsed feedback share the island dimension tokens', () => {
  const frame=fs.readFileSync(new URL('../presentation.css',import.meta.url),'utf8');
  const detail=fs.readFileSync(new URL('../tripfit-details.css',import.meta.url),'utf8');
  assert.ok(frame.includes('--tk-island-width:88px'));
  assert.ok(frame.includes('--tk-island-height:32px'));
  assert.ok(detail.includes('var(--tk-island-width, 88px)'));
});

test('page entry is short and same-step refresh skips navigation',()=>{
 const source=fs.readFileSync(new URL('../flow.js',import.meta.url),'utf8');
 assert.ok(source.includes('translateY(24px)'));
 assert.ok(source.includes('!sameStep && animate'));
});
