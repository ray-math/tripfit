/** Fictional conference: separate session data, shared cards/sheets/navigation. */
import { node,card,pill,button,icon } from '../compose.js';
import { EVENT,SESSIONS,minutes,overlaps,planSessions,conflicts,normalizePlan,recommendPlan,planMinutes,scheduleICS } from '../demo-models.js';
import { store,smallButton,textButton,heading,stack,tabs,notice,orbitArt,svgEl,download,shareText,qrBlock,confirmSheet,appSettings,footer,refresh,startDemo,empty } from '../demo-ui.js';
const initial={plan:[],favorites:[],waitlist:[],notes:{},reminders:true,ticket:null};
function sanitize(raw){
 raw=raw&&typeof raw==='object'?raw:{};
 const ids=v=>[...new Set((Array.isArray(v)?v:[]).filter(id=>SESSIONS.some(s=>s.id===id)))];
 const notes={};for(const s of SESSIONS)if(typeof raw.notes?.[s.id]==='string')notes[s.id]=raw.notes[s.id].slice(0,200);
 const ticket=raw.ticket&&typeof raw.ticket.id==='string'&&/^DEMO-F[0-9A-Z]+$/.test(raw.ticket.id)?{id:raw.ticket.id,name:String(raw.ticket.name||'GUEST').slice(0,20),checked:!!raw.ticket.checked}:null;
 return {plan:normalizePlan(raw.plan),favorites:ids(raw.favorites),waitlist:ids(raw.waitlist).filter(id=>!SESSIONS.find(s=>s.id===id).seats),notes,reminders:raw.reminders!==false,ticket};
}
const saved=store('tripfit.demo.event.v1',initial,sanitize);let app,day=0,track='all',query='',favoritesOnly=false,lastRemoved=null;
const state=()=>saved.value,save=values=>saved.save({...state(),...values});
const trackNames={design:'DESIGN',tech:'TECH',make:'MAKE'};
function tools(){return smallButton('···',()=>appSettings(app,saved,()=>app.go('discover')),{class:'da-small da-round','aria-label':'데모 설정'});}
function top(kicker,title,body,tone='lime'){
 return card({tone,className:'tk-top'},node('div',{class:'da-topline'},node('span',{class:'tk-label'},kicker),tools()),node('h1',{class:'tk-title da-title'},title),node('p',{class:'da-subtitle'},body));
}
function timeLabel(s){return `DAY ${s.day+1} · ${s.start}—${s.end}`;}
function closeAll(){while(app.screen?._detailSheet)app.screen._detailSheet.close(true);}
function toggleFavorite(s,b){const yes=state().favorites.includes(s.id);save({favorites:yes?state().favorites.filter(id=>id!==s.id):[...state().favorites,s.id]});b.textContent=yes?'♡':'♥';b.setAttribute('aria-pressed',String(!yes));if(favoritesOnly)refresh(app);}
function select(s){
 if(!s.seats){const queued=state().waitlist.includes(s.id);save({waitlist:queued?state().waitlist.filter(id=>id!==s.id):[...state().waitlist,s.id]});closeAll();refresh(app);app.notify(queued?'데모 대기 목록에서 뺐어요':'이 브라우저에 데모 대기만 표시했어요');return;}
 if(state().plan.includes(s.id)){lastRemoved=s.id;save({plan:state().plan.filter(id=>id!==s.id)});closeAll();refresh(app);app.notify('시간표에서 제외했어요');return;}
 const clashes=conflicts(state().plan,s);
 const commit=()=>{save({plan:[...state().plan.filter(id=>!clashes.some(x=>x.id===id)),s.id]});lastRemoved=null;closeAll();refresh(app);app.notify('내 시간표에 추가했어요');};
 if(clashes.length){confirmSheet(app,{title:'겹치는 시간이 있어요.',body:clashes.map(x=>x.start+'—'+x.end+' / '+x.title.replace(/\n/g,' ')).join('\n')+'\n\n이 세션들을 빼고 새 세션을 추가할까요?',confirm:'겹치는 세션 교체',onConfirm:commit,tone:'peach'});return;}
 commit();
}
function detail(s){
 const picked=state().plan.includes(s.id),queued=state().waitlist.includes(s.id);
 const about=card({tone:'cream'},node('div',{class:'da-tags'},...s.tags.map(t=>node('span',{},t))),node('p',{class:'da-note'},s.desc),heading('TAKEAWAYS','가져갈 세 가지'),node('ul',{class:'da-note'},...s.takeaways.map(t=>node('li',{},t))));
 const speaker=card({tone:s.tone},heading('SPEAKER',s.speaker.split(' · ')[0]),node('p',{class:'da-note'},s.bio));
 const notes=node('textarea',{class:'da-input',rows:3,maxLength:200,'aria-label':'세션 개인 메모',placeholder:'기억하고 싶은 질문을 적어 보세요.',onInput:e=>save({notes:{...state().notes,[s.id]:e.target.value}})},state().notes[s.id]||'');
 const location=card({tone:'mint'},heading('VENUE',s.room,smallButton('위치 보기',()=>venue(s.room))),node('p',{class:'da-note'},'가상의 행사장입니다. 이 지도는 이동 경로 안내가 아닌 UI 시연용 배치도예요.'));
 const action=button(!s.seats?(queued?'데모 대기 해제':'만석 · 데모 대기 표시'):picked?'시간표에서 제외':'내 시간표에 추가',()=>select(s),{id:'session-select'});
 app.sheet({title:s.title,body:timeLabel(s)+' · '+s.room,tone:s.tone,content:[about,speaker,location,card({tone:'cream',title:'나만의 한 줄 메모'},notes,node('p',{class:'da-muted'},'최대 200자 · 이 브라우저에만 저장')),card({tone:'lime'},action,notice(!s.seats?'대기 등록은 로컬 시연입니다. 실제 좌석을 확보하지 않습니다.':'예시 잔여 좌석 '+s.seats+'석 · 실제 예약 아님'))]});
}
function sessionCard(s){
 const selected=state().plan.includes(s.id),full=!s.seats;
 const star=smallButton(state().favorites.includes(s.id)?'♥':'♡',()=>toggleFavorite(s,star),{class:'da-favorite','aria-pressed':state().favorites.includes(s.id),'aria-label':s.title.replace(/\n/g,' ')+' 북마크'});
 return card({tone:s.tone,className:'da-session'},
  node('div',{class:'da-session-head'},node('span',{class:'da-badge outline'},s.start+'—'+s.end),node('span',{},trackNames[s.track]+' / '+s.room),star),
  node('h3',{},s.title),node('div',{class:'da-speaker'},node('span',{class:'da-avatar'},s.speaker[0]),s.speaker),
  node('div',{class:'da-session-foot'},textButton('세션 자세히 ↗',()=>detail(s),{'data-session-detail':s.id}),smallButton(full?(state().waitlist.includes(s.id)?'대기 표시됨':'만석 · 대기'):selected?'✓ 선택됨':'+ 시간표',()=>select(s),{class:'da-small'+(selected?' is-selected':''),'aria-pressed':selected,'data-session-add':s.id})),
  node('p',{class:'da-muted'},full?'가상의 만석 상태 · 대기 표시는 이 브라우저에만 저장':`예시 잔여 ${s.seats}석 · 실제 예약 아님`)
 );
}
function discoverPage(){
 const hero=card({tone:'lime',className:'tk-top'},
   node('div',{class:'da-topline'},node('span',{class:'tk-label'},'FIELD NOTES / 2026'),tools()),
   node('div',{class:'da-event-hero'},node('h1',{class:'tk-title da-title'},'작은 생각,\n큰 연결.'),orbitArt()),
   node('p',{class:'da-subtitle'},'12.12—13 · 서울 시간 · 가상의 디자인 컨퍼런스'),
   node('div',{class:'da-hero-foot'},node('span',{},'02 DAYS / 10 SESSIONS'),node('span',{class:'da-badge'},'EVENT DEMO'))
 );
 const list=stack(),count=node('p',{class:'da-menu-count',role:'status'});
 const render=()=>{const found=SESSIONS.filter(s=>s.day===day&&(track==='all'||s.track===track)&&(!favoritesOnly||state().favorites.includes(s.id))&&(s.title+s.speaker+s.tags.join(' ')).toLowerCase().includes(query.toLowerCase()));count.textContent=`DAY ${day+1} · ${found.length}개 세션`;list.replaceChildren(...found.map(sessionCard));if(!found.length)list.append(empty('맞는 세션이 없어요','필터를 바꾸거나 다른 날짜를 살펴보세요.'));};
 const extra=node('details',{class:'da-filter-details',open:!!query||favoritesOnly},
   node('summary',{},'검색·북마크 필터'),
   node('input',{class:'da-input da-search',type:'search',placeholder:'세션·연사·키워드 검색','aria-label':'세션 검색',value:query,onInput:e=>{query=e.target.value;render();}}),
   node('label',{class:'da-check'},node('input',{type:'checkbox',checked:favoritesOnly,onChange:e=>{favoritesOnly=e.target.checked;render();}}),'북마크만 보기')
 );
 const filters=card({tone:'pink',connect:'right'},heading('PROGRAM','나의 관심을 따라'),
   tabs([['0','12.12 SAT'],['1','12.13 SUN']],String(day),v=>{day=Number(v);render();},{label:'행사 날짜'}),
   node('div',{style:'height:8px'}),
   tabs([['all','전체'],['design','디자인'],['tech','기술'],['make','만들기']],track,v=>{track=v;render();},{label:'세션 분야'}),extra
 );
 render();return stack(hero,filters,count,list,card({tone:'mint',title:'고르기 어렵다면?'},node('p',{class:'da-note'},'시간이 겹치지 않게 추천 시간표를 채워보세요. 선택한 분야의 가능한 세션을 끝나는 시간 순으로 묶습니다.'),smallButton('시간표 자동 구성',()=>recommend())),node('p',{class:'da-caption'},'모든 행사·연사·좌석·일정은 가상의 데이터입니다. 실제 발권이나 좌석 예약은 이루어지지 않습니다.'));
}
function recommend(){
 let pref='all',sh;const body=card({tone:'cream'},tabs([['all','모든 분야'],['design','디자인'],['tech','기술'],['make','만들기']],pref,v=>pref=v,{label:'추천 분야'}),notice('기존 시간표를 추천 결과로 교체합니다. 북마크와 메모는 유지됩니다.'),button('겹치지 않는 시간표 만들기',()=>{save({plan:recommendPlan(pref)});lastRemoved=null;sh.close(true);app.go('plan');app.notify('시간 충돌 없는 시간표를 만들었어요');},{id:'recommend-confirm'}));
 sh=app.sheet({title:'나에게 맞는 이틀',body:'취향을 선택하면 겹치지 않는 예시 세션을 조합합니다.',tone:'mint',content:body});
}
function planText(){return ['FIELD NOTES — 데모 개인 시간표','가상의 행사입니다. 실제 일정으로 사용하기 전에 데모 여부를 확인하세요.','시간대: Asia/Seoul',...planSessions(state().plan).map(s=>`${EVENT.days[s.day]} ${s.start}—${s.end} / ${s.title.replace(/\n/g,' ')} / ${s.room}`)].join('\n');}
function exportCalendar(){download('field-notes-DEMO.ics',scheduleICS(state().plan,{reminders:state().reminders}),'text/calendar;charset=utf-8');app.notify('데모 캘린더 파일을 저장했어요');}
function planPage(){
 const sessions=planSessions(state().plan),total=planMinutes(state().plan);
 const hero=top('MY FIELD NOTES','내가 고른\n이틀의 장면.',`${sessions.length}개 세션 · 총 ${total}분 · 시간 충돌 없음`);
 const root=stack(hero);
 if(!sessions.length)root.append(empty('아직 비어 있는 시간표','세션을 직접 담거나 추천 조합으로 시작해 보세요.',smallButton('자동 구성',recommend)));
 for(const d of [0,1]){
  const selected=sessions.filter(s=>s.day===d);if(!selected.length)continue;
  root.append(node('div',{class:'da-day-label'},node('b',{},'DAY '+(d+1)),node('span',{},EVENT.days[d]+' / KST')));
  selected.forEach((s,i)=>{
   if(i){const gap=minutes(s.start)-minutes(selected[i-1].end);if(gap>0)root.append(node('div',{class:'da-gap'},`${gap}분의 여백 · 쉬거나 다른 공간을 둘러보세요.`));}
   root.append(card({tone:s.tone,className:'da-plan-item'},node('div',{class:'da-timeline'},node('div',{class:'da-time'},s.start,node('small',{},s.end)),node('div',{},node('h3',{},s.title),node('p',{class:'da-muted'},s.room+' · '+s.speaker),node('div',{class:'da-actions'},textButton('상세 보기',()=>detail(s)),textButton('빼기',()=>select(s),{'aria-label':s.id+' 시간표에서 제외'}))))));
  });
 }
 if(lastRemoved){const s=SESSIONS.find(x=>x.id===lastRemoved);root.append(card({tone:'sky'},node('div',{class:'da-line-actions'},node('span',{class:'da-note'},'세션을 제외했어요.'),smallButton('실행 취소',()=>{const id=lastRemoved;lastRemoved=null;select(SESSIONS.find(x=>x.id===id));},{id:'undo-session'}))));}
 root.append(card({tone:'cream',title:'이틀을 챙기는 방법'},node('label',{class:'da-check'},node('input',{type:'checkbox',checked:state().reminders,onChange:e=>save({reminders:e.target.checked})}),'캘린더 파일에 10분 전 알림 포함'),node('p',{class:'da-muted'},'브라우저 푸시 알림이 아닙니다. 캘린더 앱으로 파일을 가져온 뒤 확인하세요.'),node('div',{class:'da-actions'},smallButton('캘린더 파일 저장',exportCalendar,{id:'calendar-export',disabled:!sessions.length}),smallButton('시간표 공유',()=>shareText(app,'FIELD NOTES 데모 시간표',planText()),{disabled:!sessions.length}),smallButton('다시 추천',recommend))));
 if(state().waitlist.length)root.append(card({tone:'peach',title:'데모 대기 표시'},...state().waitlist.map(id=>node('div',{class:'da-line-actions'},node('span',{class:'da-note'},SESSIONS.find(s=>s.id===id).title.replace(/\n/g,' ')),textButton('해제',()=>select(SESSIONS.find(s=>s.id===id))))),notice('실제 대기열 등록이나 좌석 보장은 없습니다.')));
 if(sessions.length)root.append(card({tone:'cream'},textButton('선택한 시간표 모두 비우기',()=>confirmSheet(app,{title:'시간표를 비울까요?',body:'북마크와 메모, 데모 패스는 유지됩니다.',confirm:'시간표 비우기',onConfirm:()=>{save({plan:[]});lastRemoved=null;refresh(app);}}))));
 return root;
}
function venue(active='HALL A'){
 const map=svgEl('svg',{viewBox:'0 0 340 270',class:'da-map',role:'img','aria-label':'가상의 행사장 배치도'});
 for(const [label,x,y,w,h]of [['HALL A',20,20,145,85],['HALL B',175,20,145,85],['LAB C',175,165,145,85],['LOUNGE',20,165,145,85]]){
  map.append(svgEl('rect',{x,y,width:w,height:h,rx:20,fill:label===active?'#d6f23b':'#f3f1ea',stroke:'#0e2a3a','stroke-width':2}),svgEl('text',{x:x+w/2,y:y+h/2+5,'text-anchor':'middle','font-size':16,fill:'#0e2a3a','font-family':'sans-serif'},label));
 }
 map.append(svgEl('path',{d:'M30 135H310',stroke:'#0e2a3a','stroke-width':2,'stroke-dasharray':'5 6'}),svgEl('text',{x:170,y:140,'text-anchor':'middle','font-size':13,fill:'#0e2a3a','font-family':'sans-serif'},'ENTRANCE / DESK'));
 app.sheet({title:'공간을 미리 살펴보기',body:'가상의 배치도 · 실제 길 안내가 아닙니다.',tone:'mint',stack:!!app.screen?._detailSheet,content:[card({tone:'mint'},map),card({tone:'cream',title:active},node('p',{class:'da-note'},'모든 공간은 같은 층에 있는 예시입니다.\n라운지·안내 데스크·세션룸을 카드와 SVG로 구성했습니다.'))]});
}
function makeTicket(){
 const name=node('input',{class:'da-input',maxLength:20,placeholder:'GUEST','aria-label':'데모 패스 표시 이름'}),error=node('p',{class:'da-error',role:'status'});let sh;
 const create=()=>{const value=name.value.trim()||'GUEST';if(value.length>20){error.textContent='20자 이내로 입력하세요.';return;}save({ticket:{id:'DEMO-F'+Date.now().toString(36).toUpperCase(),name:value,checked:false}});sh.close(true);refresh(app);app.notify('데모 패스를 만들었어요 · 실제 입장 불가');};
 sh=app.sheet({title:'나만의 데모 패스',body:'실명을 입력하지 않아도 됩니다. 이름은 이 브라우저에만 저장됩니다.',tone:'pink',content:card({tone:'cream'},node('label',{class:'da-note'},'표시 이름 (최대 20자)',name),error,notice('실제 티켓이 아닙니다. 결제·계정·이메일은 필요하지 않아요.'),button('데모 패스 만들기',create,{id:'issue-pass'}))});
}
function exportTicket(){
 const t=state().ticket;if(!t)return;
 const svg=svgEl('svg',{xmlns:'http://www.w3.org/2000/svg',viewBox:'0 0 600 800',width:600,height:800});
 svg.append(svgEl('rect',{width:600,height:800,rx:42,fill:'#0e2a3a'}),svgEl('rect',{x:12,y:12,width:576,height:430,rx:34,fill:'#d6f23b'}),svgEl('rect',{x:12,y:450,width:576,height:338,rx:34,fill:'#ffcce5'}));
 for(const [text,x,y,size]of [['FIELD',44,112,76],['NOTES 26',44,195,76],['DEMO PASS',44,260,28],[t.name,44,338,42],['12.12 — 12.13 / 2026 / KST',44,396,20],['DEMO',44,516,40],['LOCAL PASS ONLY',44,556,20],[t.id,44,662,19],['Fictional event / UI demonstration only',44,706,18],['NOT VALID FOR ENTRY',44,750,26]])svg.append(svgEl('text',{x,y,'font-size':text===t.name?Math.min(size,500/[...text].reduce((n,c)=>n+(c.charCodeAt(0)>255?1:.6),0)):size,'font-family':'sans-serif',fill:'#0e2a3a'},text));
 const canvas=app.viewport.lastElementChild.querySelector('.da-qr canvas');
 if(canvas)svg.append(svgEl('rect',{x:378,y:473,width:180,height:180,rx:12,fill:'white'}),svgEl('image',{x:392,y:487,width:152,height:152,href:canvas.toDataURL('image/png')}));
 download('FIELD-NOTES-DEMO-PASS.svg',new XMLSerializer().serializeToString(svg),'image/svg+xml;charset=utf-8');
}
function passPage(){
 const t=state().ticket;
 if(!t)return stack(top('YOUR DEMO PASS','이틀을 여는\n작은 패스.', '디자인을 체험하는 가상의 입장권'),card({tone:'pink',connect:'left',className:'da-ticket'},node('span',{class:'da-badge'},'FIELD NOTES 2026'),orbitArt(),node('h2',{class:'da-pass-name'},'YOUR NAME'),node('p',{class:'da-note'},'12.12—13 · 2 DAYS\n가상 행사 · 실제 입장 불가'),node('span',{class:'da-ticket-warning'},'NOT VALID FOR ENTRY')),card({tone:'cream',title:'이 패스로 할 수 있는 것'},node('p',{class:'da-note'},'QR 표시, 입장 처리 시연, 패스 이미지 저장.\n실제 결제나 인증 서버는 사용하지 않습니다.')));
 const pass=card({tone:'pink',connect:'left',className:'da-ticket'},node('span',{class:'da-badge'},t.checked?'DEMO CHECKED IN':'DEMO PASS'),node('h2',{class:'da-pass-name'},t.name),node('p',{class:'da-note'},'FIELD NOTES 2026\n12.12—13 · 2 DAYS · KST'),qrBlock('TRIPFIT-DEMO-NOT-VALID-FOR-ENTRY|'+t.id,'데모 입장권 QR · 실제 입장 불가'),node('div',{class:'da-pass-id'},t.id),node('span',{class:'da-ticket-warning'},'NOT VALID FOR ENTRY'));
 return stack(top('FIELD NOTES / PASS',t.checked?'반가워요,\n다음 장면으로.':'나만의 패스,\n준비됐어요.',t.checked?'이 브라우저에서 체크인을 시연한 상태입니다.':'입장 처리 버튼도 로컬 데모입니다.'),pass,card({tone:'cream'},heading('MY SCHEDULE',state().plan.length+'개 세션 선택'),node('p',{class:'da-note'},'패스는 실제 좌석을 예약하지 않습니다. 시간표는 별도로 자유롭게 편집할 수 있어요.'),node('div',{class:'da-actions'},smallButton('패스 이미지 저장',exportTicket,{id:'pass-export'}),smallButton('공간 보기',()=>venue()),smallButton('시간표 보기',()=>app.go('plan')))),card({tone:'mint'},textButton('새 데모 패스로 교체',()=>confirmSheet(app,{title:'패스를 다시 만들까요?',body:'기존 데모 패스의 체크인 상태만 초기화합니다.',confirm:'다시 만들기',onConfirm:()=>{save({ticket:null});refresh(app);}}))));
}
function infoPage(){return stack(top('BEFORE YOU GO','잘 고르고,\n편하게 둘러보기.', '실제 행사가 아닌, 재사용 UI 키트 예시입니다.'),card({tone:'mint',connect:'left',title:'행사장 배치도'},node('p',{class:'da-note'},'세션 상세창 위에 중첩해서 열어도 돌아올 위치를 유지합니다.'),smallButton('가상 배치도 열기',()=>venue())),card({tone:'pink',title:'시간이 겹치면?'},node('p',{class:'da-note'},'다른 날짜의 세션은 함께 선택할 수 있어요. 같은 날짜에서 시간이 겹치면 교체할지 먼저 묻습니다. 한 세션의 끝과 다른 세션의 시작이 같으면 선택 가능합니다.')),card({tone:'sky',title:'일정 저장과 알림'},node('p',{class:'da-note'},'개인 시간표는 ICS 파일로 저장합니다. 모든 제목에 [데모]가 표시됩니다. 10분 전 알림은 가져온 캘린더 앱이 처리하며, 이 사이트는 푸시 알림을 보내지 않아요.')),card({tone:'cream',title:'기록이 남는 곳'},node('p',{class:'da-note'},'선택·북마크·메모·데모 패스는 이 브라우저에만 저장됩니다. 설정에서 지울 수 있으며 다른 기기와 동기화되지 않습니다.'),smallButton('설정과 초기화',()=>appSettings(app,saved,()=>app.go('discover')))),card({tone:'lilac',title:'같은 키트의 다른 장면'},node('div',{class:'da-links'},node('a',{href:'cafe.html'},'카페 주문·픽업 ↗'),node('a',{href:'gallery.html'},'35개 모션·부품 갤러리 ↗'))));}
const nav=[{id:'discover',label:'세션'},{id:'plan',label:'내 시간표'},{id:'pass',label:'내 패스'},{id:'info',label:'안내'}];
const definition={title:'당신의 관심이\n만나는 이틀.',brand:'FIELD NOTES',description:'서로 다른 세션과 상세창, 충돌 없는 개인 시간표, 데모 패스. 같은 TripFit 키트를 조립한 두 번째 서비스 예시입니다.',steps:[['discover',discoverPage],['plan',planPage],['pass',passPage],['info',infoPage]].map(([id,render])=>({id,label:id,cards:[{type:'text',render}]})),onStep(id,a){let primary;if(id==='discover')primary={label:state().plan.length?`${state().plan.length}개 세션 · 내 시간표 보기`:'나에게 맞는 시간표 추천',run:()=>state().plan.length?a.go('plan'):recommend()};if(id==='plan')primary={label:state().plan.length?'캘린더 파일로 저장 · 데모':'겹치지 않는 시간표 만들기',run:()=>state().plan.length?exportCalendar():recommend()};if(id==='pass')primary=state().ticket?{label:state().ticket.checked?'내 시간표 둘러보기':'체크인 시연 · 실제 입장 불가',run:()=>{if(state().ticket.checked)a.go('plan');else{save({ticket:{...state().ticket,checked:true}});refresh(a);a.notify('체크인 시연 완료 · 실제 입장권이 아닙니다');}},id:'check-in'}:{label:'데모 패스 만들기 · 결제 없음',run:makeTicket};footer(a,{primary,nav:nav.map(n=>n.id==='plan'?{...n,label:`내 시간표${state().plan.length?' '+state().plan.length:''}`}:n)});}};
app=startDemo(document.getElementById('app'),definition);
window.__event={app,storage:saved,sessions:SESSIONS};
