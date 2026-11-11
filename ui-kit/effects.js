/** Reusable TripFit motion primitives. Adapted from web/index.html and web/pay/styles.css.
 * See SOURCE_AUDIT.md. FLIP API design also informed by AutoAnimate; no FormKit code. */
import { springs } from './tripfit-motion.js';
import { rafSchd } from './vendor/raf-schd.js';
const ease='cubic-bezier(.2,.8,.2,1)',out='cubic-bezier(.5,0,.75,0)';
export const PRESETS={
 rise:{frames:[{opacity:0,transform:'translateY(24px) scale(.98)'},{opacity:1,transform:'none'}],spring:'pop'},
 chat:{frames:[{opacity:0,transform:'translateY(40px) scale(.94)'},{opacity:1,transform:'none'}],spring:'pop'},
 enterRight:{frames:[{opacity:0,transform:'translateX(50px) scale(.92)'},{opacity:1,transform:'none'}],spring:'pop'},
 exitLeft:{frames:[{opacity:1,transform:'none'},{opacity:1,transform:'rotate(-2deg) scale(.98)',offset:.3},{opacity:0,transform:'translateX(-80px) rotate(-8deg) scale(.8)'}],duration:620,easing:out},
 glow:{frames:[{boxShadow:'inset 0 0 0 0 #D6F23B'},{boxShadow:'inset 0 0 0 5px #D6F23B'},{boxShadow:'inset 0 0 0 0 #D6F23B'}],duration:1400},
 shake:{frames:[{transform:'none'},{transform:'translateX(-7px) rotate(-1deg)'},{transform:'translateX(7px) rotate(1deg)'},{transform:'translateX(-4px)'},{transform:'none'}],duration:520},
 lockPulse:{frames:[{transform:'scale(1)'},{transform:'scale(1.03)'},{transform:'scale(1)'}],duration:1100},
 pop:{frames:[{opacity:0,transform:'scale(0)'},{opacity:1,transform:'scale(1)'}],spring:'pop'},
 flag:{frames:[{opacity:0,transform:'scale(.6)'},{opacity:1,transform:'none'}],spring:'pop'},
 press:{frames:[{transform:'scale(.9)'},{transform:'none'}],spring:'pop'},
 timeChange:{frames:[{transform:'scale(1.2)',opacity:.4},{transform:'none',opacity:1}],duration:700},
 countOut:{frames:[{filter:'blur(0)',transform:'none',opacity:1},{filter:'blur(10px)',transform:'scale(.6)',opacity:0}],duration:420,easing:out},
 countIn:{frames:[{transform:'scale(2.2)',opacity:0},{transform:'none',opacity:1}],spring:'pop'},
 textBlur:{frames:[{opacity:0,filter:'blur(6px)'},{opacity:1,filter:'none'}],duration:700},
 charIn:{frames:[{opacity:0,transform:'translateY(.45em)',filter:'blur(5px)'},{opacity:1,transform:'none',filter:'blur(0)'}],duration:520},
 subtitle:{frames:[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],duration:500},
 log:{frames:[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],duration:420},
 delta:{frames:[{opacity:0,transform:'translateY(20px) scale(.7)'},{opacity:1,transform:'none'}],spring:'pop'},
 badge:{frames:[{opacity:0,transform:'translateX(-30px) rotate(-6deg)'},{opacity:1,transform:'none'}],spring:'pop'},
 split:{frames:[{opacity:0,transform:'translateY(30px) scale(.85)'},{opacity:1,transform:'none'}],spring:'pop'},
 sheetIn:{frames:[{transform:'translateY(105%)'},{transform:'none'}],spring:'soft'},
 sheetOut:{frames:[{transform:'none'},{transform:'translateY(110%)'}],duration:340,easing:out},
 stamp:{frames:[{transform:'scale(1.8) rotate(-22deg)',opacity:0},{transform:'none',opacity:1}],spring:'pop'},
 stopStamp:{frames:[{transform:'scale(1.4) rotate(-8deg)',opacity:0},{transform:'scale(1) rotate(-8deg)',opacity:1}],duration:380},
 drop:{frames:[{transform:'translateY(-28px) scale(.94)'},{transform:'none'}],spring:'pop'},
 spin:{frames:[{transform:'rotate(0deg)'},{transform:'rotate(360deg)'}],duration:700,easing:'linear',iterations:Infinity},
 ripple:{frames:[{transform:'scale(.6)',opacity:.9},{transform:'scale(2.2)',opacity:0}],duration:1400,iterations:Infinity},
 typing:{frames:[{opacity:.3,transform:'none'},{opacity:1,transform:'translateY(-3px)',offset:.3},{opacity:.3,transform:'none'}],duration:1000,iterations:Infinity},
 decisionPulse:{frames:[{opacity:.3},{opacity:1}],duration:1000,direction:'alternate',iterations:Infinity}
};
export function motionReduced(){return typeof document!=='undefined'&&(document.documentElement.dataset.motion==='reduce'||globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches);}
export function setMotionPreference(reduce){document.documentElement.dataset.motion=reduce?'reduce':'auto';document.dispatchEvent(new CustomEvent('tk:motionchange'));}
const scopes=new Set();
export function motionStats(){return {scopes:scopes.size,animations:[...scopes].reduce((n,s)=>n+s.animations.size,0)};}
export class MotionScope{
 constructor(host){
  if(!host)throw new TypeError('MotionScope needs a host');
  this.host=host;this.animations=new Set();this.cleanups=[];this.closed=false;this.visible=true;this.paused=new Set();this.loops=new Set();this.controller=new AbortController();scopes.add(this);
  this.media=matchMedia('(prefers-reduced-motion: reduce)');const sync=()=>this.sync();
  this.listen(document,'visibilitychange',sync);this.listen(document,'tk:motionchange',sync);this.media.addEventListener('change',sync);this.cleanups.push(()=>this.media.removeEventListener('change',sync));
  if(typeof IntersectionObserver==='function'){this.observer=new IntersectionObserver(entries=>{this.visible=entries[0]?.isIntersecting??true;this.sync();});this.observer.observe(host);this.cleanups.push(()=>this.observer.disconnect());}
 }
 listen(target,type,fn,options={}){target.addEventListener(type,fn,options);this.cleanups.push(()=>target.removeEventListener(type,fn,options));return fn;}
 sync(){const reduce=motionReduced(),pause=document.hidden||!this.visible;for(const a of this.animations){if(reduce){if(a.effect?.getTiming().iterations===Infinity)a.cancel();else try{a.finish();}catch{a.cancel();}}else if(pause&&a.playState==='running'){a.pause();this.paused.add(a);}else if(!pause&&this.paused.delete(a))a.play();}for(const loop of this.loops)loop.sync();}
 play(el,name,options={}){
  if(this.closed||!el?.animate)return {finished:Promise.resolve(),cancel(){}};
  const preset=typeof name==='string'?PRESETS[name]:name;if(!preset)throw new Error('Unknown effect '+name);
  const timing={duration:380,easing:ease,fill:'backwards',...(preset.spring?springs[preset.spring]:{}),...preset,...options};delete timing.frames;delete timing.spring;
  const reduced=motionReduced();if(reduced&&timing.iterations===Infinity)return {finished:Promise.resolve(),cancel(){}};if(reduced){timing.duration=1;timing.delay=0;timing.iterations=1;}
  const animation=el.animate(preset.frames,timing);this.animations.add(animation);const cleanup=()=>{this.animations.delete(animation);this.paused.delete(animation);};animation.finished.then(cleanup,cleanup);this.sync();return {animation,finished:animation.finished.catch(()=>{}),cancel:()=>animation.cancel()};
 }
 async wait(ms){if(this.closed)return false;return new Promise(resolve=>{const finish=()=>{clearTimeout(timer);this.controller.signal.removeEventListener('abort',abort);resolve(!this.closed);};const abort=()=>finish();const timer=setTimeout(finish,motionReduced()?0:ms);this.controller.signal.addEventListener('abort',abort,{once:true});});}
 loop(tick){
  let frame=null,last=0,elapsed=0;const can=()=>!this.closed&&!document.hidden&&this.visible&&!motionReduced();
  const step=now=>{frame=null;if(!can())return;if(last)elapsed+=Math.min(64,now-last);last=now;tick(elapsed);frame=requestAnimationFrame(step);};
  const item={sync:()=>{if(can()&&frame===null){last=0;frame=requestAnimationFrame(step);}else if(!can()&&frame!==null){cancelAnimationFrame(frame);frame=null;last=0;}},dispose:()=>{if(frame!==null)cancelAnimationFrame(frame);frame=null;this.loops.delete(item);}};this.loops.add(item);this.cleanups.push(item.dispose);item.sync();return item.dispose;
 }
 dispose(){if(this.closed)return;this.closed=true;this.controller.abort();for(const a of this.animations)a.cancel();this.animations.clear();this.paused.clear();this.cleanups.splice(0).reverse().forEach(fn=>fn());this.loops.clear();scopes.delete(this);}
}
export function stagger(scope,elements,name='rise',{gap=90,...options}={}){return Promise.all([...elements].map((e,i)=>scope.play(e,name,{delay:i*gap,...options}).finished));}
export function drawPath(scope,path,{duration=950,delay=0}={}){const length=path.getTotalLength(),previous=path.style.strokeDasharray;path.style.strokeDasharray=String(length);scope.cleanups.push(()=>path.style.strokeDasharray=previous);return scope.play(path,{frames:[{strokeDashoffset:length},{strokeDashoffset:0}],duration},{delay});}
export function followPath(scope,path,marker,{duration=7000}={}){const length=path.getTotalLength();const position=elapsed=>{const pt=path.getPointAtLength((elapsed%duration)/duration*length);marker.setAttribute('transform',`translate(${pt.x},${pt.y})`);};position(0);return scope.loop(position);}
export async function flyChip(scope,source,target){
 if(scope.closed)return;const a=source.getBoundingClientRect(),b=target.getBoundingClientRect();if(!a.width||!b.width)return;
 const clone=target.cloneNode(true);clone.removeAttribute('id');clone.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));clone.setAttribute('aria-hidden','true');clone.inert=true;
 Object.assign(clone.style,{position:'fixed',left:b.left+'px',top:b.top+'px',width:b.width+'px',height:b.height+'px',zIndex:1000,pointerEvents:'none',margin:'0'});document.body.append(clone);const before=target.style.visibility;target.style.visibility='hidden';
 const cleanup=()=>{clone.remove();target.style.visibility=before;};scope.cleanups.push(cleanup);const dx=a.left+a.width/2-(b.left+b.width/2),dy=a.top-b.top;
 await scope.play(clone,{frames:[{transform:`translate(${dx}px,${dy}px) scale(.4)`,opacity:0},{transform:`translate(${dx*.5}px,${dy*.5-36}px) scale(1.12) rotate(-6deg)`,opacity:1,offset:.5},{transform:'none',opacity:1}],duration:560,easing:'cubic-bezier(.3,.7,.2,1)'}).finished;cleanup();if(!scope.closed)scope.play(target,'press');
}
/** Explicit, keyed FLIP lists. This is NOT the AutoAnimate library. */
export function createAnimatedList(host,{key=item=>item.id,render,update}={}){
 if(typeof render!=='function')throw new TypeError('render is required');const scope=new MotionScope(host),nodes=new Map(),ghosts=new Set();host.style.position='relative';
 function set(items){
  if(scope.closed)return;const ids=items.map(key);if(new Set(ids).size!==ids.length)throw new Error('Duplicate list keys');
  const first=new Map([...nodes].map(([id,e])=>[id,e.getBoundingClientRect()]));ghosts.forEach(e=>e.remove());ghosts.clear();const parent=host.getBoundingClientRect(),scale=host.offsetWidth?parent.width/host.offsetWidth:1;
  for(const [id,e]of nodes)if(!ids.includes(id)){const r=first.get(id);nodes.delete(id);e.inert=true;e.setAttribute('aria-hidden','true');ghosts.add(e);Object.assign(e.style,{position:'absolute',top:(r.top-parent.top)/scale+'px',left:'0',width:r.width/scale+'px'});scope.play(e,'exitLeft').finished.then(()=>{e.remove();ghosts.delete(e);});}
  items.forEach((item,i)=>{const id=ids[i];let e=nodes.get(id);const fresh=!e;if(fresh){e=render(item);if(!(e instanceof HTMLElement))throw new TypeError('render must return an element');nodes.set(id,e);e.dataset.listKey=String(id);}else update?.(e,item);host.append(e);if(fresh){scope.play(e,'enterRight',{delay:i*70});scope.play(e,'glow',{delay:160+i*70});}});
  const last=new Map([...nodes].map(([id,e])=>[id,e.getBoundingClientRect()]));for(const [id,e]of nodes){const before=first.get(id),after=last.get(id);if(before){const dx=(before.left-after.left)/scale,dy=(before.top-after.top)/scale;if(dx||dy)scope.play(e,{frames:[{transform:`translate(${dx}px,${dy}px)`},{transform:'none'}],spring:'soft'});}}
 }
 return {set,dispose(){scope.dispose();ghosts.forEach(e=>e.remove());ghosts.clear();nodes.clear();}};
}
export function fitNumbers(root){
 let closed=false,lastWidth=-1;
 const fit=rafSchd(()=>{
  if(closed)return;
  const rows=[...root.querySelectorAll('.tk-readout')].map(el=>({el,number:el.querySelector('.tk-value')})).filter(x=>x.number);
  for(const {number}of rows)number.style.fontSize='';
  // One read phase after one write phase, rather than a layout flush per number.
  const changes=rows.map(({el,number})=>({number,available:el.clientWidth,actual:el.scrollWidth,size:parseFloat(getComputedStyle(number).fontSize)}));
  for(const {number,available,actual,size}of changes)if(available>0&&actual>available+1)number.style.fontSize=Math.max(12,size*(available-3)/actual)+'px';
 });
 const observer=new ResizeObserver(entries=>{const width=entries[0]?.contentRect.width;if(width!==lastWidth){lastWidth=width;fit();}});observer.observe(root);
 document.fonts?.ready.then(()=>{if(!closed)fit();});fit();
 const cleanup=()=>{closed=true;observer.disconnect();fit.cancel();};cleanup.request=fit;return cleanup;
}
export function bindHold(button,{duration=1000,onConfirm=()=>{},scope=new MotionScope(button)}={}){
 let started=null,done=false,timer=null,held=null;const cancel=()=>{started=null;held=null;clearTimeout(timer);timer=null;button.style.setProperty('--hold','0%');button.classList.remove('is-holding');};
 const finish=()=>{if(started===null||done)return;done=true;cancel();button.setAttribute('aria-pressed','true');onConfirm();};const begin=()=>{if(done||started!==null||button.disabled)return;started=performance.now();button.classList.add('is-holding');timer=setTimeout(finish,duration);};
 scope.loop(()=>{if(started!==null)button.style.setProperty('--hold',Math.min(100,(performance.now()-started)/duration*100)+'%');});
 scope.listen(button,'pointerdown',e=>{if(e.button!==0||!e.isPrimary)return;held=e.pointerId;button.setPointerCapture(e.pointerId);begin();});scope.listen(button,'pointermove',e=>{if(e.pointerId!==held)return;const r=button.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)cancel();});
 ['pointerup','pointercancel','lostpointercapture','blur'].forEach(t=>scope.listen(button,t,cancel));scope.listen(button,'keydown',e=>{if([' ','Enter'].includes(e.key)){e.preventDefault();if(!e.repeat)begin();}});scope.listen(button,'keyup',e=>{if([' ','Enter'].includes(e.key))cancel();});scope.listen(document,'visibilitychange',()=>{if(document.hidden)cancel();});scope.cleanups.push(cancel);
 return {reset(){done=false;cancel();button.setAttribute('aria-pressed','false');},dispose:()=>scope.dispose()};
}
