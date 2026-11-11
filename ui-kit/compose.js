/** Free-form composition on top of the existing CardFlow runtime.
 * Domain content belongs in examples, not here. No original web/ app is loaded.
 */
import { CardFlow } from './flow.js';
import { rollDigits, springs, springIn } from './tripfit-motion.js';
import { fitNumbers } from './effects.js';
import { rafSchd } from './vendor/raf-schd.js';
import { openDetailSheet } from './tripfit-sheet.js';
import { declareConnection } from './connections.js';
import { installPressFeedback } from './press-feedback.js';

export function node(tag, attrs = {}, ...children) {
  const e = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || (value === false && !key.startsWith('aria-'))) continue;
    if (key === 'class') e.className = value;
    else if (key.startsWith('on') && typeof value === 'function') e.addEventListener(key.slice(2).toLowerCase(), value);
    else e.setAttribute(key, key.startsWith('aria-') ? String(value) : value === true ? '' : String(value));
  }
  for (const child of children.flat(Infinity)) if (child != null && child !== false) e.append(child instanceof Node ? child : document.createTextNode(String(child)));
  return e;
}
const PATHS = {
  arrow: 'M7 17 17 7M9 7h8v8', back: 'm15 6-6 6 6 6',
  check: 'm5 12 4 4L19 6', book: 'M12 6v15M3 4c4-1 6 0 9 2 3-2 5-3 9-2v14c-4-1-6 0-9 2-3-2-5-3-9-2Z',
  graph: 'M4 3v17h17M7 7q5 19 13-2', pen: 'm5 15 11-11 4 4L9 19l-6 2Zm9-9 4 4',
  spark: 'm12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z',
  clock: 'M12 8v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
  code: 'm8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18', close: 'm6 6 12 12M18 6 6 18'
};
export function icon(name = 'arrow', size = 20) {
  const ns = 'http://www.w3.org/2000/svg', e = document.createElementNS(ns, 'svg');
  Object.entries({viewBox:'0 0 24 24', width:size, height:size, fill:'none', stroke:'currentColor', 'stroke-width':2, 'stroke-linecap':'round', 'stroke-linejoin':'round', 'aria-hidden':'true'}).forEach(([k,v])=>e.setAttribute(k,v));
  const p = document.createElementNS(ns,'path'); p.setAttribute('d', PATHS[name] || PATHS.arrow); e.append(p); return e;
}
export function pill(text, opts = {}) { return node('span',{class:'tk-pill'+(opts.fill?' tk-filled':''), ...opts.attrs},text); }
export function button(text, action, {secondary=false, id}={}) {
  return node('button',{class:secondary?'tk-secondary':'tk-primary',type:'button',id,onClick:action}, node('span',{},text), node('span',{class:'tk-go'},icon()));
}
export function card({tone='cream',join='',side='',connect,badge,title,eyebrow,onClick,id,className='',hint}={},...children) {
  const e=node('article',{class:`tk-card tk-${tone}  ${className}`,id});
  declareConnection(e, connect ?? (join.split(' ').includes('tab') ? (side || 'center') : null));
  if (badge) e.append(node('span',{class:'tk-card-badge'},badge));
  if (eyebrow) e.append(node('div',{class:'tk-label'},eyebrow));
  if (title) e.append(node('h2',{class:'tk-title'},title));
  e.append(...children.flat().filter(x=>x instanceof Node));
  if(onClick){e.classList.add('tk-clickable');e.setAttribute('role','button');e.tabIndex=0;e.setAttribute('aria-label',hint||title||eyebrow||'상세 보기');e.addEventListener('click',onClick);e.addEventListener('keydown',ev=>{if(ev.target===e&&['Enter',' '].includes(ev.key)){ev.preventDefault();onClick(ev);}});}
  return e;
}
export function metric(value, unit='', {id, large=false}={}) {
  return node('span',{class:`tk-readout ${large?'tk-large':''}`,role:'img','aria-label':String(value)+unit},node('span',{class:'tk-value tk-odometer',id,'aria-hidden':'true'},value),node('em',{'aria-hidden':'true'},unit));
}
export function setMetric(el, value, unit='') {rollDigits(el,value);el.closest('.tk-readout')?.setAttribute('aria-label',String(value)+unit);}
export function progress(label, value, {tone='pink'}={}) {
  return node('div',{class:'tk-progress-row'},node('span',{},label),node('i',{role:'progressbar','aria-label':label,'aria-valuemin':0,'aria-valuemax':100,'aria-valuenow':value},node('b',{style:`width:${Math.max(0,Math.min(100,value))}%`})),node('em',{},value+'%'));
}
export function split(...children){return node('div',{class:'tk-split'},children);}
export function stats(items){return card({tone:'pink',connect:'left',className:'tk-stat-grid'},...items.map(x=>node('div',{},node('span',{class:'tk-lab'},x.label),metric(x.value,x.unit))));}
export function rowCard({title,subtitle,tone='cream',symbol='book',value,unit='',onClick,id}) {
  return card({tone,onClick,id,hint:title+' 열기',className:'tk-row-card'},node('span',{class:'tk-ico'},icon(symbol,21)),node('div',{class:'tk-row-copy'},node('h3',{},title),node('p',{},subtitle)),value!=null?metric(value,unit):icon());
}
export function slider({min=0,max=2,value=1,labels=[],onInput,id='balance'}) {
  const input=node('input',{type:'range',min,max,step:1,value,id,'aria-label':'학습 균형 선택'});
  input.addEventListener('input',()=>onInput?.(Number(input.value)));
  return node('div',{class:'tk-slider'},node('div',{class:'tk-slider-track'},...Array.from({length:max-min+1},(_,i)=>node('i',{style:`left:${i/(max-min)*100}%`})),input),node('div',{class:'tk-slider-labels'},labels.map(s=>node('span',{},s))));
}
export class ComposedFlow extends CardFlow {
  constructor(root, definition){
    super(root,definition);this.state={...(definition.state||{})};this.activeSheet=null;
    for(const step of definition.steps)for(const c of step.cards)if(c.render!==undefined&&typeof c.render!=='function')throw new TypeError('card.render must be a function');
    this._resize=rafSchd(()=>this.fit());this._pageCleanups=[];
  }
  renderCard(definition){
    if(!definition.render)return super.renderCard(definition);
    const result=definition.render(this);
    if(!(result instanceof HTMLElement))throw new TypeError('A custom card renderer must return an HTMLElement');
    return result;
  }
  mount(){
    super.mount();this.mountPoint.querySelector('.tk-stage').classList.add('tk-faithful');
    this.screen=this.mountPoint.querySelector('.tk-screen');
    this.mountPoint.querySelector('.tk-kicker').textContent='TRIPFIT UI KIT / COMPOSED EXAMPLE';
    document.documentElement.style.setProperty('--tk-spring',springs.pop.easing);
    document.documentElement.style.setProperty('--tk-spring-ms',springs.pop.duration+'ms');
    window.addEventListener('resize',this._resize);this._numberCleanup=fitNumbers(this.screen);this._pressCleanup=installPressFeedback(this.screen);this.fit();return this;
  }
  go(id, options={}){
    while(this.screen?._detailSheet)this.screen._detailSheet.close(true);this.activeSheet?.close(true);this.activeSheet=null;
    this._pageCleanups?.splice(0).reverse().forEach(fn=>fn());
    const result=super.go(id, options);
    for(const b of this.footer.querySelectorAll('button')){
      const label=b.textContent;b.replaceChildren(node('span',{},label),node('span',{class:'tk-go'},icon()));
    }
    this.viewport.querySelectorAll('.tk-page').forEach(e=>e.inert=e!==this.viewport.lastElementChild);
    this.flow.onStep?.(id,this);this._numberCleanup?.request?.();this.fit();return result;
  }
  sheet(options){this.activeSheet=openDetailSheet(this.screen||this.mountPoint.querySelector('.tk-screen'),options);return this.activeSheet;}
  notify(message){this.feedback.show(message);}
  fit(){
    const rig=this.mountPoint.querySelector('.tk-rig');if(!rig)return;
    const mobile=matchMedia('(max-width: 750px), (pointer: coarse) and (max-width: 900px)').matches;
    rig.style.transform=mobile?'':`scale(${Math.min(1,(innerHeight-32)/916,(innerWidth-48)/(innerWidth>=1100?791:417))})`;
  }
  onCleanup(fn){this._pageCleanups.push(fn);return fn;}
  destroy(){this._pageCleanups.splice(0).reverse().forEach(fn=>fn());window.removeEventListener('resize',this._resize);this._resize.cancel();this._numberCleanup?.();this._pressCleanup?.();this._connectionsCleanup?.();this.activeSheet?.close(true);this.feedback.destroy?.();this.feedback.hide();this.mountPoint.replaceChildren();}
}
