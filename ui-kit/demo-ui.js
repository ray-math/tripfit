/** Shared app building blocks. These extend the kit, not its original travel app. */
import { ComposedFlow,node,card,button,icon,pill } from './compose.js';
import { renderQR } from './assets.js';
export function money(value){return Number(value).toLocaleString('ko-KR')+'원';}
export function store(key,initial,normalize){
  let available=true,state=structuredClone(initial);
  try{const raw=localStorage.getItem(key);if(raw)state=normalize(JSON.parse(raw));}catch{available=false;}
  return {get value(){return state;},get available(){return available;},save(next){state=normalize(next);try{localStorage.setItem(key,JSON.stringify(state));}catch{available=false;}return state;},reset(){state=structuredClone(initial);try{localStorage.removeItem(key);}catch{available=false;}return state;}};
}
export function smallButton(label,onClick,attrs={}){return node('button',{class:'da-small',type:'button',onClick,...attrs},label);}
export function textButton(label,onClick,attrs={}){return node('button',{class:'da-text',type:'button',onClick,...attrs},label);}
export function heading(kicker,title,side){return node('div',{class:'da-heading'},node('div',{},node('p',{class:'tk-label'},kicker),node('h2',{},title)),side);}
export function stack(...children){return node('div',{class:'da-stack'},children);}
export function empty(title,body,action){return card({tone:'cream',className:'da-empty'},node('span',{class:'da-empty-mark'},icon('spark',36)),node('h2',{},title),node('p',{},body),action);}
export function tabs(items,value,onChange,{label='분류',className=''}={}){
  const root=node('div',{class:'da-tabs '+className,role:'group','aria-label':label});
  items.forEach(([id,text])=>root.append(smallButton(text,()=>{[...root.children].forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.value===id)));onChange(id);},{'aria-pressed':id===value,'data-value':id})));
  return root;
}
export function choice(label,values,value,onChange){
  return node('fieldset',{class:'da-field'},node('legend',{},label),tabs(values,value,onChange,{label}));
}
export function stepper(value,onChange,{min=1,max=9,label='수량'}={}){
  const output=node('output',{'aria-label':label},value),minus=smallButton('−',()=>change(value-1),{'aria-label':label+' 줄이기'}),plus=smallButton('+',()=>change(value+1),{'aria-label':label+' 늘리기'});
  const update=()=>{output.textContent=value;minus.disabled=value<=min;plus.disabled=value>=max;};
  const change=next=>{value=Math.max(min,Math.min(max,next));update();onChange(value);};update();
  return node('div',{class:'da-stepper'},minus,output,plus);
}
export function notice(message,kind='info'){return node('p',{class:'da-notice '+(kind==='warn'?'is-warn':''),role:kind==='warn'?'alert':'status'},message);}
export function svgEl(tag,attrs={},...children){const e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,String(v));for(const c of children)e.append(c instanceof Node?c:document.createTextNode(String(c)));return e;}
export function drinkArt(kind='latte',large=false){
  const s=svgEl('svg',{viewBox:'0 0 180 160',class:'da-art'+(large?' is-large':''),'aria-hidden':'true'});
  s.append(svgEl('ellipse',{cx:90,cy:140,rx:55,ry:9,fill:'#0e2a3a',opacity:.1}));
  if(kind==='bread'){
    s.append(svgEl('path',{d:'M30 107Q27 58 60 62Q85 26 112 57Q154 58 151 108Q123 136 30 107Z',fill:'#d8a66d',stroke:'#0e2a3a','stroke-width':3}));
    for(const [x,y]of [[66,69],[91,62],[118,75]])s.append(svgEl('path',{d:`M${x} ${y}q-7 16 7 25`,fill:'none',stroke:'#f3f1ea','stroke-width':8,'stroke-linecap':'round'}));
  }else if(kind==='cake'){
    s.append(svgEl('path',{d:'M40 76 128 48 146 111 56 135Z',fill:'#d6b56b',stroke:'#0e2a3a','stroke-width':3}),svgEl('path',{d:'M40 76 128 48 142 60 54 91Z',fill:'#f4e58e',stroke:'#0e2a3a','stroke-width':3}),svgEl('path',{d:'M54 91v44M54 91l88-31',fill:'none',stroke:'#0e2a3a','stroke-width':3}));
    s.append(svgEl('circle',{cx:94,cy:60,r:17,fill:'#d6f23b',stroke:'#0e2a3a','stroke-width':2}));
  }else{
    const color={latte:'#be9178',black:'#6e5545',matcha:'#a5c49a',berry:'#c57b92'}[kind]||'#be9178';
    s.append(svgEl('path',{d:'M49 44 58 130Q90 143 122 130L132 44Z',fill:'#f3f1ea',stroke:'#0e2a3a','stroke-width':3}));
    s.append(svgEl('path',{d:'M54 70 60 126Q90 138 120 126L127 70Z',fill:color}));
    s.append(svgEl('ellipse',{cx:90.5,cy:44,rx:41.5,ry:12,fill:kind==='latte'?'#f3f1ea':color,stroke:'#0e2a3a','stroke-width':3}));
    if(kind==='latte')s.append(svgEl('path',{d:'M72 43q4-12 18-2 15-10 18 2-3 10-18 13-15-3-18-13Z',fill:'#be9178'}));
    s.append(svgEl('path',{d:'M128 66q32-7 27 17-4 18-30 13',fill:'none',stroke:'#0e2a3a','stroke-width':5}));
    s.append(svgEl('rect',{x:71,y:86,width:39,height:28,rx:13,fill:'#d6f23b'}),svgEl('path',{d:'m82 100 6 5 12-13',fill:'none',stroke:'#0e2a3a','stroke-width':2.5}));
  }return s;
}
export function orbitArt(){return svgEl('svg',{viewBox:'0 0 330 100',class:'da-orbit','aria-hidden':'true'},svgEl('ellipse',{cx:165,cy:50,rx:140,ry:27,fill:'none',stroke:'#0e2a3a','stroke-width':1.5,transform:'rotate(-10 165 50)'}),svgEl('ellipse',{cx:165,cy:50,rx:100,ry:42,fill:'none',stroke:'#0e2a3a','stroke-width':1.5,transform:'rotate(12 165 50)'}),svgEl('circle',{cx:165,cy:50,r:26,fill:'#0e2a3a'}),svgEl('path',{d:'m154 50 8 8 16-18',fill:'none',stroke:'#d6f23b','stroke-width':3}),svgEl('circle',{cx:43,cy:68,r:9,fill:'#ffcce5',stroke:'#0e2a3a','stroke-width':2}),svgEl('circle',{cx:263,cy:61,r:8,fill:'#8ec5ee',stroke:'#0e2a3a','stroke-width':2}));}
export function download(name,data,type='text/plain;charset=utf-8'){
 const blob=new Blob([data],{type}),url=URL.createObjectURL(blob),link=node('a',{href:url,download:name});document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export async function shareText(app,title,text){
  try{if(navigator.share){await navigator.share({title,text});return;}if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);app.notify('내용을 복사했어요');return;}}catch(e){if(e.name==='AbortError')return;}
  const area=node('textarea',{class:'da-input',rows:8,readonly:true,'aria-label':'공유할 내용'},text);
  app.sheet({title:'내용 복사',body:'기기에서 공유를 지원하지 않으면 아래 내용을 복사하세요.',content:card({tone:'cream'},area)});area.focus();area.select();
}
export function qrBlock(text,label='데모 QR · 실제 주문/입장에 사용할 수 없음'){
  const box=node('div',{class:'da-qr'});renderQR(box,text,{size:144,label});return box;
}
export function confirmSheet(app,{title,body,confirm='확인',onConfirm,tone='pink'}){
  let sh;const controls=card({tone:'cream'},button(confirm,()=>{sh.close(true);onConfirm();}),textButton('돌아가기',()=>sh.close()));
  sh=app.sheet({title,body,tone,stack:!!app.screen?._detailSheet,content:controls});return sh;
}
export function appSettings(app,storage,resetAction){
  const reduce=node('input',{type:'checkbox',checked:document.documentElement.dataset.motion==='reduce',onChange:e=>{document.documentElement.dataset.motion=e.target.checked?'reduce':'auto';document.dispatchEvent(new Event('tk:motionchange'));try{localStorage.setItem('tripfit-demo-motion',document.documentElement.dataset.motion);}catch{}}});
  app.sheet({title:'데모 설정',body:'화면은 실제 키트로 구성했습니다. 외부 서비스에 주문·결제·발권을 요청하지 않아요.',tone:'lilac',content:[card({tone:'cream'},node('label',{class:'da-check'},reduce,'움직임 줄이기'),notice(storage.available?'선택 내용은 이 브라우저에만 저장됩니다.':'현재 브라우저에서 저장할 수 없어 이번 실행 동안만 유지됩니다.'),smallButton('이 예시의 저장 내용 초기화',()=>confirmSheet(app,{title:'이 예시를 초기화할까요?',body:'이 브라우저에 저장된 선택과 기록만 지워집니다. 다른 예시에는 영향을 주지 않아요.',confirm:'초기화',onConfirm:()=>{storage.reset();resetAction();app.notify('데모를 초기화했어요');}}))),card({tone:'mint',title:'다른 예시'},node('div',{class:'da-links'},node('a',{href:'cafe.html'},'카페 주문·픽업 ↗'),node('a',{href:'event.html'},'행사·시간표 ↗'),node('a',{href:'gallery.html'},'모션 갤러리 ↗'),node('a',{href:location.pathname.includes('/examples/')?'regenerated.html':'lesson.html'},'수학 수업 ↗')))]});
}
export function footer(app,{primary,nav=[]}={}){
  app.footer.replaceChildren();
  if(primary){const b=button(primary.label,primary.run,{id:primary.id||'main-action'});b.disabled=!!primary.disabled;app.footer.append(b);}
  const root=node('div',{class:'da-nav',role:'navigation','aria-label':'화면 이동'});
  for(const n of nav)root.append(smallButton(n.label,()=>app.go(n.id),{'aria-current':app.current===n.id?'page':null,'data-nav':n.id}));
  app.footer.append(root);
}
export function refresh(app,{preserveScroll=true,focus}={}){
  const y=app.viewport.lastElementChild?.scrollTop||0;
  app.go(app.current);
  if(preserveScroll)app.viewport.lastElementChild.scrollTop=y;
  if(focus)app.viewport.lastElementChild.querySelector(focus)?.focus({preventScroll:true});
}
export function startDemo(root,definition){
  try{if(localStorage.getItem('tripfit-demo-motion')==='reduce')document.documentElement.dataset.motion='reduce';}catch{}
  const app=new ComposedFlow(root,definition).mount();root.querySelector('.tk-stage').classList.add('da-app');
  root.querySelector('.tk-kicker').textContent='TRIPFIT UI KIT / INTERACTIVE DEMO';
  window.__demo=app;return app;
}
