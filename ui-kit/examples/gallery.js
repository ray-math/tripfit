import { ComposedFlow,node,card,pill,button,icon,metric } from '../compose.js';
import { rollDigits,revealHeadline } from '../tripfit-motion.js';
import { MotionScope,PRESETS,stagger,drawPath,followPath,flyChip,createAnimatedList,bindHold,setMotionPreference,motionStats } from '../effects.js';
import { originalAsset,renderQR } from '../assets.js';
import { ORIGINAL_ASSETS } from '../original-assets.js';
import { CATALOG } from '../catalog.js';
const groupNames={motion:'모션',component:'부품',asset:'에셋'},tones={motion:'cream',component:'mint',asset:'pink'};
const svg=(tag,attrs={},...children)=>{const e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);for(const c of children)e.append(c instanceof Node?c:document.createTextNode(c));return e;};
const demoButton=(label,fn,attrs={})=>node('button',{class:'kg-mini-button',type:'button',onClick:fn,...attrs},label);
const tile=(label='TripFit',className='')=>node('div',{class:'kg-demo-tile '+className},label);
function runDemo(id,host,scope,app){
 const add=(...nodes)=>{host.append(...nodes);return nodes[0];};const tip=text=>node('p',{class:'kg-demo-tip'},text);
 if(id==='cards'){
  add(card({tone:'pink',join:'cut',side:'left',title:'모양은 그대로'},node('p',{class:'tk-body'},'위 카드의 홈과 아래 카드의 탭')),card({tone:'sky',join:'tab',side:'left',title:'내용은 자유롭게'},pill('같은 스타일')),node('span',{class:'tk-floating-flag'},'경계 위의 라벨'));
 }else if(id==='springs'){
  for(const kind of ['snap','pop','soft']){const e=add(tile(kind));scope.play(e,{frames:[{transform:'translateX(-60px)',opacity:0},{transform:'none',opacity:1}],spring:kind},{delay:['snap','pop','soft'].indexOf(kind)*180});}
 }else if(id==='typing'){
  const dots=node('div',{class:'kg-demo-row'},...[0,1,2].map(i=>{const d=node('i',{class:'kg-demo-dot'});scope.play(d,'typing',{delay:i*150});return d;}));add(dots,tip('잠시 뒤 대화 카드가 나타납니다.'));scope.wait(1700).then(ok=>{if(!ok)return;dots.replaceChildren(tile('나는 전시를 보고 싶어.'));scope.play(dots.firstChild,'chat');});
 }else if(id==='spinner'){
  const e=add(node('div',{class:'kg-demo-row'},node('span',{class:'kg-spinner'}),node('b',{},'계산 중')));scope.play(e.firstChild,'spin');
 }else if(id==='island'){
  add(tile('상태를 짧게 전달'),tip('상단 알림이 대기 → 완료로 바뀝니다.'));app.feedback.show({title:'조건을 비교하고 있어요',sub:'아이콘 · 보조 문구 · 진행 상태',spin:true,hold:0});scope.cleanups.push(()=>app.feedback.hide());scope.wait(1600).then(ok=>{if(ok)app.feedback.show({title:'비교 완료',sub:'원본 아일랜드를 공통 API로',right:'124ms',hold:3500});});
 }else if(id==='odometer'){
  const e=add(metric('0','',{large:true}));let i=0;const values=['79.4','−12.8','2,428,805','03'];const roll=()=>{const v=e.querySelector('.tk-value');v.dataset.rollValue='';rollDigits(v,values[i++%values.length]);e.setAttribute('aria-label',v.dataset.rollValue);};add(demoButton('다음 숫자',roll));roll();
 }else if(id==='headline'){
  const e=add(node('h3',{class:'tk-title',style:'font-size:30px'},'말을 조건으로\n옮깁니다.'));revealHeadline(e,e.textContent);e.getAnimations({subtree:true}).forEach(a=>{scope.animations.add(a);a.finished.then(()=>scope.animations.delete(a),()=>scope.animations.delete(a));});
 }else if(id==='count'){
  const e=add(tile('2,428,805'));scope.wait(600).then(async ok=>{if(!ok)return;await scope.play(e,'countOut').finished;if(scope.closed)return;e.textContent='3개';scope.play(e,'countIn');});
 }else if(id==='chip'){
  const mark=node('span',{class:'kg-highlight'},'많이 못 걸어'),source=node('p',{class:'kg-quote'},'“나 오늘 ',mark,'.”'),target=pill('도보 3.5km 이하',{fill:true});target.classList.add('kg-chip-target');add(source,target,tip('문장과 결과의 연결을 눈으로 보여줍니다.'));scope.play(mark,{frames:[{backgroundColor:'transparent',color:'#0e2a3a'},{backgroundColor:'#0e2a3a',color:'#ffcce5'}],duration:450});scope.wait(500).then(ok=>{if(ok)flyChip(scope,mark,target);});
 }else if(id==='list'){
  const list=add(node('div',{class:'kg-list'}));let n=3,items=[{id:1,text:'개념 읽기'},{id:2,text:'그래프 탐구'},{id:3,text:'문제 풀기'}];const controller=createAnimatedList(list,{render:x=>node('div',{class:'kg-demo-tile',style:'font-size:16px;padding:14px'},x.text)});scope.cleanups.push(()=>controller.dispose());controller.set(items);
  add(node('div',{class:'kg-action-row'},demoButton('순서 변경',()=>{items=[...items].reverse();controller.set(items);},{id:'list-reorder'}),demoButton('추가',()=>{items=[...items,{id:++n,text:'새 카드 '+n}];controller.set(items);},{id:'list-add'}),demoButton('삭제',()=>{items=items.slice(0,-1);controller.set(items);},{id:'list-remove'})));
 }else if(id==='flicker'){
  const board=svg('svg',{viewBox:'0 0 320 180',class:'kg-path',role:'img','aria-label':'후보 연결선 탐색'}),points=[[30,130],[65,45],[135,85],[180,25],[235,150],[290,65]];points.forEach(([x,y])=>board.append(svg('circle',{cx:x,cy:y,r:6,fill:'#0e2a3a'})));add(board);
  (async()=>{for(let i=0;i<18&&!scope.closed;i++){const a=points[i%6],b=points[(i*3+1)%6],line=svg('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:'#0e2a3a','stroke-width':1.2});board.append(line);scope.play(line,{frames:[{opacity:0},{opacity:.55},{opacity:0}],duration:420}).finished.then(()=>line.remove());if(!await scope.wait(80))break;}})();
 }else if(id==='path'){
  const path=svg('path',{d:'M20 145 C75 145 55 35 125 45 S190 140 240 70 S290 25 315 40',fill:'none',stroke:'#0e2a3a','stroke-width':4,'stroke-linecap':'round'}),point=svg('g',{},svg('circle',{r:8,fill:'#d6f23b',stroke:'#0e2a3a','stroke-width':2}));add(svg('svg',{viewBox:'0 0 335 180',class:'kg-path',role:'img','aria-label':'SVG 경로와 이동점'},path,point));drawPath(scope,path);followPath(scope,path,point);add(tip('지도 API가 아니라, 임의의 SVG 경로에 적용하는 모션입니다.'));
 }else if(id==='pulse'){
  const ripple=node('div',{class:'kg-demo-dot',style:'width:32px;height:32px;background:var(--tk-lemon)'}),locked=tile('예약 고정','kg-hatch');add(node('div',{class:'kg-demo-row',style:'background:var(--tk-ink);border-radius:24px'},ripple),locked);scope.play(ripple,'ripple');scope.play(locked,'lockPulse',{iterations:3});
 }else if(id==='ring'){
  const uid='ring-'+Math.random().toString(36).slice(2),path=svg('path',{id:uid,d:'M100 100m-65 0a65 65 0 1 1 130 0a65 65 0 1 1-130 0'}),txt=svg('text',{'font-size':12,'letter-spacing':3,fill:'#0e2a3a'},svg('textPath',{href:'#'+uid},'TRIPFIT · REUSABLE MOTION · TRIPFIT · '));const ring=svg('svg',{viewBox:'0 0 200 200',width:190,height:190,role:'img','aria-label':'회전하는 원형 텍스트'},svg('defs',{},path),txt);add(node('div',{class:'kg-demo-row'},ring));scope.play(ring,'spin',{duration:18000});
 }else if(id==='venn'||id==='logo'){
  const e=originalAsset('logoMark',{family:'brand',size:250,label:'TripFit 원본 합의 심벌'});add(node('div',{class:'kg-demo-row'},e),tip('원본 로고 예시입니다. 새 서비스의 기본 로고로 강제하지 않습니다.'));const left=e.querySelector('.logo-left'),right=e.querySelector('.logo-right'),lens=e.querySelector('.logo-lens'),check=e.querySelector('.logo-check');scope.play(left,{frames:[{transform:'translateX(-10px)'},{transform:'none'}],spring:'pop'});scope.play(right,{frames:[{transform:'translateX(10px)'},{transform:'none'}],spring:'pop'});scope.play(lens,'pop',{delay:280});drawPath(scope,check,{duration:250,delay:480});
 }else if(id==='stamp'){
  const e=add(node('div',{class:'kg-stamp'},'STOP'),tip('중단 화면의 도장을 재사용합니다.'));scope.play(e,'stopStamp');
 }else if(id==='hold'){
  const label=node('span',{},'1초 동안 눌러 확인'),b=add(node('button',{class:'kg-hold',type:'button',id:'hold-demo','aria-pressed':'false','aria-label':'1초 동안 눌러 확인'},label));const hold=bindHold(b,{scope,onConfirm:()=>{label.textContent='확인 완료';app.notify('확인 완료 · 결제나 외부 작업은 실행하지 않았어요');}});add(demoButton('초기화',()=>{label.textContent='1초 동안 눌러 확인';hold.reset();}),tip('터치, 마우스, Enter·Space 키. 중간에 놓으면 취소됩니다.'));
 }else if(id==='fill'){
  const inner=node('i');add(node('div',{class:'kg-fill'},inner),tile('82%'),tip('실제 확률이 아닌 UI 시연용 수치입니다.'));scope.play(inner,{frames:[{width:'0%'},{width:'82%'}],duration:900});
 }else if(id==='sheet'||id==='keyboard'){
  add(tile(id==='sheet'?'겹쳐도 안전하게':'입력도 끊김 없이'));add(demoButton(id==='sheet'?'두 번째 시트 열기':'입력 시트 열기',()=>{const content=card({tone:'cream'},node('label',{},'메모',node('input',{class:'kg-search',placeholder:'직접 입력해 보세요',id:'nested-input'})),node('fieldset',{disabled:true},node('input',{placeholder:'비활성 필드'})),node('details',{},node('summary',{},'추가 옵션'),node('button',{type:'button'},'숨겨진 옵션')),demoButton('닫고 원래 시트로',()=>nested.close()));const nested=app.sheet({title:'두 번째 상세 화면',body:'Tab·Shift+Tab·Escape 및 배경 잠금',tone:'sky',stack:true,content});},{id:'nested-open'}),tip('닫으면 이전 시트의 포커스와 조작 가능 상태가 복원됩니다.'));
 }else if(id==='page'){
  const e=add(tile('첫 번째 화면'));let back=false;add(demoButton('다음 / 이전 전환',()=>{back=!back;e.textContent=back?'두 번째 화면':'첫 번째 화면';scope.play(e,{frames:[{transform:`translateX(${back?40:-40}%)`,opacity:0},{transform:'none',opacity:1}],duration:520});}));
 }else if(id==='logs'){
  const box=add(node('div',{class:'kg-list'}));let count=0;const log=()=>{const row=node('div',{class:'tk-card tk-lime',style:'padding:12px 16px;font-size:13px'},String(++count).padStart(2,'0')+' / 새 실행 기록 · '+(100+count*13)+'ms');box.append(row);while(box.children.length>4)box.firstChild.remove();scope.play(row,'log');};add(demoButton('로그 추가',log));log();
 }else if(id==='switch'){
  const sw=node('button',{class:'kg-switch',type:'button',role:'switch','aria-label':'숨은 한 곳','aria-checked':'false',onClick:()=>sw.setAttribute('aria-checked',sw.getAttribute('aria-checked')==='true'?'false':'true')});add(node('div',{class:'kg-demo-row'},node('b',{},'숨은 한 곳 +1'),sw),tip('스프링 움직임과 실제 ARIA 상태가 함께 바뀝니다.'));
 }else if(id==='avatars'){
  add(node('div',{class:'kg-demo-row'},...['지','서','윤'].map((v,i)=>node('span',{class:'kg-avatar',style:`--person:var(--tk-${['rose','blue','mint'][i]})`},v))));
 }else if(id==='icons'){
  const grid=add(node('div',{class:'kg-assets'}));for(const family of ['icons','paymentIcons'])for(const name of Object.keys(ORIGINAL_ASSETS[family]))grid.append(node('div',{class:'kg-asset'},originalAsset(name,{family}),node('small',{},(family==='paymentIcons'?'pay/':'')+name)));
 }else if(id==='status'){
  add(node('div',{class:'kg-demo-row'},node('b',{},'12:58'),...Object.keys(ORIGINAL_ASSETS.statusIcons).map(name=>originalAsset(name,{family:'statusIcons',size:32,label:name}))),tip('실제 아이폰 상태가 아닌 원본 목업용 SVG입니다.'));
 }else if(id==='qr'){
  const box=add(node('div',{class:'kg-qr'})),url=location.protocol.startsWith('http')?location.href:'https://github.com/ray-math/tripfit/tree/high/ui-kit';const qr=renderQR(box,url);scope.cleanups.push(()=>qr.clear());add(tip('로컬에 포함한 QRCode.js로 생성합니다. 외부 QR 서비스 호출 없음.'));
 }else if(id==='hatch'){
  add(tile('고정된 일정','kg-hatch'),card({tone:'red',title:'문제 상황'}),node('button',{class:'kg-mini-button',disabled:true},'비활성 상태'));
 }else if(id==='tokens'){
  const colors={navy:'#0E2A3A',lime:'#D6F23B',mint:'#BDEFDB',pink:'#FFCCE5',sky:'#8EC5EE',peach:'#F8D5BC',butter:'#F4E58E',leaf:'#A8E2C3',violet:'#7B5CFF',red:'#FF5B4A',lilac:'#CBBDFF',cream:'#F3F1EA'};add(node('div',{class:'kg-palette'},...Object.entries(colors).map(([key,v])=>node('div',{class:'kg-swatch',style:`background:${v};${key==='navy'?'color:#f3f1ea':''}`},key,node('small',{},v)))),tip('한글: Pretendard / 숫자: Inter Tight. 폰트 파일은 키트에 복제하지 않습니다.'));
 }else if(id==='rise'){
  const elements=['먼저 보여주고','차례로 연결하고','자연스럽게 멈춥니다.'].map(t=>tile(t));add(...elements);stagger(scope,elements,'rise');
 }else{
  const e=add(tile(id==='exit'?'이번에 빠지는 카드':id==='glow'?'새로 추가된 카드':id==='shake'?'조건을 다시 확인해 주세요':'이야기가 시작됩니다.'));scope.play(e,({exit:'exitLeft',glow:'glow',shake:'shake',blur:'textBlur'})[id]||'rise');if(id==='glow'){const t=add(node('b',{style:'text-align:center;font-size:32px'},'15:00 → 15:30'));scope.play(t,'timeChange');}
 }
}
export function showEntry(app,entry){
 let scope=null;const stage=card({tone:entry.id==='shake'?'red':'cream',className:'kg-stage',id:'demo-stage'}),code=node('pre',{class:'kg-code',hidden:true},`// ${entry.title}\n// ${entry.source}\n${entry.api}\n\n// 페이지/시트가 닫힐 때 scope.dispose() 호출`),replay=button('다시 재생',()=>start(),{id:'demo-replay'}),copy=demoButton('API 보기',()=>{code.hidden=!code.hidden;}),control=card({tone:'lime'},node('div',{class:'kg-toolbar'},replay),node('div',{class:'kg-action-row'},copy),code),meta=node('p',{class:'tk-code-note'},entry.source+'\n'+(entry.status==='extracted'?'원본 SVG 경로 추출':'원본 시각 동작을 데이터 독립 API로 이식'));
 const sh=app.sheet({title:entry.title,body:entry.description,tone:tones[entry.group],content:[stage,control,meta],onClose:()=>{scope?.dispose();app.feedback.hide();}});const start=()=>{scope?.dispose();stage.replaceChildren();scope=new MotionScope(stage);runDemo(entry.id,stage,scope,app);};window.__currentDemo={id:entry.id,close:()=>sh.close(),replay:start};start();return sh;
}
function galleryPage(app){
 const root=node('div',{class:'kg-list'}),hero=card({tone:'lime',join:'cut',side:'right',className:'tk-top'},node('div',{class:'tk-row tk-between'},node('span',{class:'tk-label'},'TRIPFIT / UI LIBRARY'),pill('HIGH · 02')),node('h1',{class:'kg-hero-title'},'같은 감각,\n더 많은 장면.'),node('p',{class:'tk-body'},'예시에 없던 움직임까지.\n눌러 보고, 다시 조립하세요.'),node('div',{class:'kg-hero-stats'},node('div',{},node('strong',{},String(CATALOG.length)),node('small',{},'개 시연')),node('div',{},node('strong',{},'26'),node('small',{},'개 원본 아이콘'))),node('p',{class:'kg-hero-note'},'디자인은 유지하고, 내용과 화면은 자유롭게.'));
 const featured=card({tone:'pink',join:'tab',side:'right',className:'tk-row-card',onClick:()=>showEntry(app,CATALOG.find(e=>e.id==='chip')),hint:'문장에서 칩으로 미리보기'},node('span',{class:'tk-ico'},icon('spark')),node('div',{class:'tk-row-copy'},node('h3',{},'말이 조건으로 날아갑니다.'),node('p',{},'원본의 칩 비행을 직접 재생')),icon());
 const list=node('div',{class:'kg-list',id:'gallery-list'}),count=node('p',{class:'kg-count',role:'status'});let active='all',query='';
 const filter=()=>{const found=CATALOG.filter(e=>(active==='all'||e.group===active)&&(e.title+' '+e.api+' '+e.description).toLowerCase().includes(query.toLowerCase()));count.textContent=`${found.length}개 표시 · 카드를 눌러 동작 확인`;list.replaceChildren(...found.map(e=>node('button',{type:'button',class:`tk-card tk-${tones[e.group]} kg-item`,'data-demo':e.id,onClick:()=>showEntry(app,e)},node('span',{class:'kg-number'},String(CATALOG.indexOf(e)+1).padStart(2,'0')),node('div',{},node('h3',{},e.title),node('p',{},e.description),node('small',{class:'kg-source'},groupNames[e.group]+' / '+e.api)),node('span',{class:'kg-open'},icon('arrow',15)))));};
 const tabs=node('div',{class:'kg-tabs','aria-label':'종류별 필터'});for(const [id,label]of Object.entries({all:'전체',...groupNames})){const b=node('button',{class:'kg-tab',type:'button','aria-pressed':id==='all','data-filter':id,onClick:()=>{active=id;[...tabs.children].forEach(x=>x.setAttribute('aria-pressed',String(x===b)));filter();}},label);tabs.append(b);}
 const search=node('input',{class:'kg-search',type:'search',placeholder:'모션·부품 검색','aria-label':'모션·부품 검색',onInput:e=>{query=e.target.value;filter();}}),reduce=node('input',{type:'checkbox',id:'motion-setting',onChange:e=>setMotionPreference(e.target.checked)});
 root.append(hero,featured,card({tone:'sky',className:'kg-controls'},tabs,search,node('label',{class:'kg-toggle',for:'motion-setting'},reduce,'움직임 줄이기')),count,list,card({tone:'lilac',title:'키트의 바깥까지 확인했습니다.'},node('p',{class:'tk-body'},'Tabbable의 탭 순서 판별, raf-schd의 프레임 단위 처리, 오프라인 QRCode.js를 연결했습니다.'),node('p',{class:'kg-demo-tip'},'AutoAnimate는 목록 재배치 설계 참고만 했으며 라이브러리는 포함하지 않았습니다.')),node('p',{class:'tk-code-note'},'범위: 메인 웹·결제 UI의 재사용 가능한 시각 요소.\n여행 계산·실결제·샘플 콘텐츠는 포함하지 않습니다.\n원본 TripFit 에셋의 출처와 권리는 유지됩니다.'));filter();return root;
}
const flow={title:'보는 데서,\n다시 쓰는 데로.',brand:'UI KIT',description:'사용하지 않던 모션도 확인하고 재사용할 수 있는 카탈로그. TripFit의 원래 디자인 언어를 유지합니다.',steps:[{id:'gallery',label:'컴포넌트와 모션 갤러리',cards:[{type:'text',render:galleryPage}]}]};
const app=new ComposedFlow(document.getElementById('app'),flow).mount();window.__kitDemo=app;window.__gallery={app,catalog:CATALOG,show:id=>showEntry(app,CATALOG.find(e=>e.id===id)),stats:motionStats};
const link=node('a',{class:'tk-primary',href:location.pathname.includes('/dist/')?'lesson.html':'regenerated.html',style:'text-decoration:none'},node('span',{},'이 키트로 만든 수업 보기'),node('span',{class:'tk-go'},icon()));app.footer.append(link);
