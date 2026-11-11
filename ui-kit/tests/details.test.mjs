import test from "node:test";
import assert from "node:assert/strict";
import { validateFlow } from "../flow.js";
import { makeSpring, springs } from "../tripfit-motion.js";
import { mathFlow } from "../examples/math-flow.js";

test("copied spring generator is deterministic and finite", () => {
  const a=makeSpring(420,34), b=makeSpring(420,34);
  assert.deepEqual(a,b);
  assert.ok(a.duration > 0 && a.duration < 4000);
  assert.ok(typeof a.easing === "string" && a.easing.length > 0);
  assert.equal(springs.snap.duration, a.duration);
});
test("different damping produces different spring timing", () => {
  assert.notEqual(makeSpring(320,15).duration, makeSpring(170,20).duration);
});
test("example exercises extracted details", () => {
  assert.equal(validateFlow(mathFlow),mathFlow);
  assert.ok(mathFlow.steps.some(step=>step.cards.some(c=>c.shape==="cut")));
  assert.ok(mathFlow.steps.some(step=>step.cards.some(c=>c.shape==="tab")));
  assert.ok(mathFlow.steps.some(step=>typeof step.feedback==="string"));
});
test("reject invalid shape names and alignment", () => {
  assert.throws(()=>validateFlow({steps:[{id:"a",cards:[{type:"hero",shape:"triangle"}]}]}),/unsupported card shape/);
  assert.throws(()=>validateFlow({steps:[{id:"a",cards:[{type:"hero",align:"bottom"}]}]}),/unsupported shape alignment/);
});
