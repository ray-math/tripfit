import test from "node:test";
import assert from "node:assert/strict";
import { validateFlow } from "../flow.js";
import { mathFlow } from "../examples/math-flow.js";

test("math sample has valid, linked steps", () => {
  assert.equal(validateFlow(mathFlow), mathFlow);
  assert.equal(mathFlow.steps.length, 4);
});

test("rejects duplicate step IDs", () => {
  assert.throws(() => validateFlow({
    steps: [{id:"a",cards:[]},{id:"a",cards:[]}]
  }), /Duplicate step/);
});

test("rejects missing choice targets", () => {
  assert.throws(() => validateFlow({
    steps:[{id:"start",cards:[{type:"choices",options:[{label:"Next",next:"missing"}]}]}]
  }), /unknown target/);
});

test("rejects unknown card types", () => {
  assert.throws(() => validateFlow({
    steps:[{id:"start",cards:[{type:"chart"}]}]
  }), /unsupported card type/);
});

test("rejects empty and missing steps", () => {
  assert.throws(() => validateFlow({steps:[]}), /non-empty/);
  assert.throws(() => validateFlow(null), /non-empty/);
});

test("rejects broken start links", () => {
  assert.throws(() => validateFlow({start:"missing",steps:[{id:"a",cards:[]}]}), /Unknown start/);
});

test("rejects unknown colors", () => {
  assert.throws(() => validateFlow({steps:[{id:"a",cards:[{type:"hero",color:"glitter"}]}]}), /unsupported card color/);
});

test("accepts optional clickable cards and actions", () => {
  const f={start:"a",steps:[
    {id:"a",cards:[{type:"text",title:"Continue",next:"b"}]},
    {id:"b",cards:[],actions:[{label:"Back",next:"a"}]}
  ]};
  assert.equal(validateFlow(f), f);
});
