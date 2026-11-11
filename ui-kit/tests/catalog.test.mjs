import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CATALOG } from '../catalog.js';
import { PRESETS } from '../effects.js';
import { ORIGINAL_ASSETS } from '../original-assets.js';
import { makeSpring } from '../tripfit-motion.js';
import { rafSchd } from '../vendor/raf-schd.js';
test('catalog has unique entries and explicit provenance',()=>{
 assert.equal(CATALOG.length,35);assert.equal(new Set(CATALOG.map(x=>x.id)).size,CATALOG.length);
 for(const item of CATALOG){assert.ok(item.source.startsWith('web/'));assert.ok(item.api);assert.ok(['asset','motion','component'].includes(item.group));}
});
test('all original icon families are preserved',()=>{
 assert.equal(Object.keys(ORIGINAL_ASSETS.icons).length,15);assert.equal(Object.keys(ORIGINAL_ASSETS.paymentIcons).length,8);assert.equal(Object.keys(ORIGINAL_ASSETS.statusIcons).length,3);
 assert.ok(ORIGINAL_ASSETS.logoMark.includes('logo-check'));assert.ok(ORIGINAL_ASSETS.favicon.startsWith('<svg'));
});
test('effect presets include unshown original motions',()=>{
 for(const name of ['exitLeft','countOut','countIn','shake','lockPulse','stamp','stopStamp','typing','spin','glow'])assert.ok(PRESETS[name]);
 for(const def of Object.values(PRESETS)){assert.ok(def.frames.length>=2);if(def.duration)assert.ok(Number.isFinite(def.duration)&&def.duration>0);}
});
test('invalid spring input cannot generate NaN/Infinity curves',()=>{
 for(const values of [[0,1],[-1,1],[1,0],[NaN,1],[1,Infinity]])assert.throws(()=>makeSpring(...values),RangeError);
});
test('raf-schd collapses calls and cancel prevents work',()=>{
 const old=global.requestAnimationFrame,cancel=global.cancelAnimationFrame;let queue=new Map(),id=0,values=[];
 global.requestAnimationFrame=fn=>{queue.set(++id,fn);return id;};global.cancelAnimationFrame=i=>queue.delete(i);
 try{const scheduled=rafSchd(x=>values.push(x));scheduled(1);scheduled(2);scheduled(3);assert.equal(queue.size,1);const fn=[...queue.values()][0];queue.clear();fn();assert.deepEqual(values,[3]);scheduled(4);scheduled.cancel();assert.equal(queue.size,0);}finally{global.requestAnimationFrame=old;global.cancelAnimationFrame=cancel;}
});
test('new entry does not embed the original page or solver',()=>{
 const content=fs.readFileSync(new URL('../examples/gallery.js',import.meta.url),'utf8');
 assert.ok(!content.includes('web/index.html"'));assert.ok(!content.includes('demo_data.js'));assert.ok(!content.includes('createElement("iframe")'));
});
test('MIT dependency notices remain present',()=>{
 for(const name of ['raf-schd','tabbable','qrcode'])assert.match(fs.readFileSync(new URL('../vendor/'+name+'.LICENSE.txt',import.meta.url),'utf8'),/Permission is hereby granted/);
});
