import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { connectionSpec } from '../connections.js';
import { summarizeIntervals } from '../performance-probe.js';
test('lower connection API normalizes explicit relation only',()=>{
 assert.equal(connectionSpec(),null);assert.equal(connectionSpec('none'),null);
 assert.deepEqual(connectionSpec('left'),{side:'left',from:''});
 assert.deepEqual(connectionSpec({from:'summary'}),{side:'center',from:'summary'});
 for(const invalid of ['auto','up',{side:'random'},{from:7}])assert.throws(()=>connectionSpec(invalid),TypeError);
});
test('cadence statistics distinguish 60 and 120 samples without a hardcoded rate',()=>{
 assert.equal(summarizeIntervals([]),null);
 for(const rate of [60,90,120,144])assert.ok(Math.abs(summarizeIntervals(Array(100).fill(1000/rate)).callbackRate-rate)<.0001);
 const result=summarizeIntervals([8,8,8,8,8,24,NaN,-1]);assert.equal(result.samples,6);assert.equal(result.overBudget,1);assert.equal(result.p95Ms,24);
});
test('upper notches are not drawn in isolation',()=>{
 const css=fs.readFileSync(new URL('../tripfit-details.css',import.meta.url),'utf8');assert.ok(!css.includes('.tk-card.tk-cut::after'));
 const next=fs.readFileSync(new URL('../interaction.css',import.meta.url),'utf8');assert.ok(next.includes('.tk-card.tk-linked::before'));assert.ok(next.includes('border-bottom:0'));
});
test('authored app views no longer configure cut/tab pairs',()=>{
 for(const file of ['cafe','event','apps','lesson-demo','gallery']){
  const src=fs.readFileSync(new URL('../examples/'+file+'.js',import.meta.url),'utf8');
  assert.ok(!/join:\s*['"](?:cut|tab)/.test(src),file);
 }
});
test('same-step updates do not animate page or split every heading',()=>{
 const flow=fs.readFileSync(new URL('../flow.js',import.meta.url),'utf8');assert.ok(flow.includes('!sameStep && animate'));
 assert.ok(flow.includes('this.flow.motion?.headlines === "characters"'));
 assert.ok(!flow.includes('getBoundingClientRect().top'));
});
