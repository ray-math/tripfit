/** Application composition only: every shell, card, number, sheet and transition
 * is supplied by the reusable kit. No original TripFit page or solver is used.
 */
import { ComposedFlow, node, card, pill, button, metric, setMetric, progress, split, stats, rowCard, slider, icon } from '../compose.js';
import { lesson } from './lesson-data.js';

function graph(h=2,k=-1) {
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
  const attr=(el,a)=>{for(const [key,v]of Object.entries(a))el.setAttribute(key,v);return el;};
  attr(svg,{class:'tk-chart',viewBox:'0 0 385 190',role:'img','aria-label':`꼭짓점이 (${h}, ${k})인 이차함수 그래프`});
  const add=(type,a,text)=>{const e=attr(document.createElementNS(ns,type),a);if(text!=null)e.textContent=text;svg.append(e);return e;};
  const x=v=>35+(v+3)/8*320,y=v=>164-(v+2)/7*144;
  const clipId='chart-'+Math.random().toString(36).slice(2,9);
  const defs=add('defs',{}),clip=attr(document.createElementNS(ns,'clipPath'),{id:clipId});clip.append(attr(document.createElementNS(ns,'rect'),{x:24,y:10,width:340,height:160}));defs.append(clip);
  for(let v=-2;v<=5;v++)add('line',{x1:x(-3),x2:x(5),y1:y(v),y2:y(v),stroke:'#e6f8ef','stroke-width':1.2});
  for(let v=-3;v<=5;v++)add('line',{x1:x(v),x2:x(v),y1:y(-2),y2:y(5),stroke:'#e6f8ef','stroke-width':1.2});
  add('line',{x1:x(-3),x2:x(5),y1:y(0),y2:y(0),stroke:'#0e2a3a','stroke-width':1.2,opacity:.55});
  add('line',{x1:x(0),x2:x(0),y1:y(-2),y2:y(5),stroke:'#0e2a3a','stroke-width':1.2,opacity:.55});
  add('line',{x1:x(h),x2:x(h),y1:y(-2),y2:y(5),stroke:'#0e2a3a','stroke-dasharray':'3 4',opacity:.3});
  const points=Array.from({length:161},(_,i)=>{const v=-3+i/20;return `${i?'L':'M'}${x(v).toFixed(2)},${y((v-h)**2+k).toFixed(2)}`;}).join('');
  add('path',{d:points,fill:'none',stroke:'#0e2a3a','stroke-width':3.5,'stroke-linecap':'round','clip-path':`url(#${clipId})`});
  add('circle',{cx:x(h),cy:y(k),r:7,fill:'#d6f23b',stroke:'#0e2a3a','stroke-width':2});
  add('text',{x:x(h),y:y(k)+18,'text-anchor':'middle','font-size':12,'font-weight':600},`(${h}, ${k})`);
  add('text',{x:x(0)-12,y:y(0)+15,'font-size':10},'0');add('text',{x:362,y:y(0)+4,'font-size':12},'x');add('text',{x:x(0)+7,y:15,'font-size':12},'y');
  return svg;
}
function showConcept(app,d){
  const note=card({tone:'cream',title:'괄호 안은 반대로,\n괄호 밖은 그대로'},node('p',{class:'tk-formula'},'y = (x − p)² + q'),node('p',{class:'tk-body'},'꼭짓점은 (p, q)\n대칭축은 x = p\na가 양수이면 최솟값은 q'));
  const sample=card({tone:'pink',title:'지금 식에 적용하면'},node('p',{class:'tk-formula small'},d.formula),node('p',{class:'tk-body'},'p = 2, q = −1\n꼭짓점 (2, −1), 대칭축 x = 2'));
  let sh;const finish=button('이 개념 이해했어요',()=>{app.state.conceptRead=true;sh.close();app.notify('개념 확인 완료 · 이제 그래프를 움직여 보세요');},{secondary:true});
  const tail=card({tone:'lime'},finish);sh=app.sheet({title:'꼭짓점, 한 장으로',body:'개념 카드 · 설명형 상세 화면',tone:'pink',content:[note,sample,tail]});
}
function showGraph(app,d){
  const chartHost=node('div',{},graph(...d.vertex)),label=node('p',{class:'tk-formula small',id:'graph-formula'},d.formula);
  const input=node('input',{type:'range',min:-2,max:3,value:2,step:1,id:'vertex-slider','aria-label':'꼭짓점의 x 좌표',style:'width:100%;min-height:44px;accent-color:var(--tk-ink)'});
  input.addEventListener('input',()=>{const h=Number(input.value);chartHost.replaceChildren(graph(h,-1));label.textContent=h===0?'y = x² − 1':`y = (x ${h<0?'+':'−'} ${Math.abs(h)})² − 1`;app.state.graphX=h;});
  app.sheet({title:'손끝으로 평행이동',body:'탐구 카드 · 인터랙티브 그래프',tone:'mint',content:[card({tone:'mint',className:'tk-chart-card'},chartHost),card({tone:'cream'},label,node('label',{class:'tk-body',for:'vertex-slider'},'슬라이더를 움직여 꼭짓점의 x 좌표를 바꿔 보세요.'),input,node('p',{class:'tk-body'},'위아래 위치는 −1로 유지돼요.')),card({tone:'lilac',title:'변하지 않는 것은?'},node('p',{class:'tk-body'},'포물선의 모양과 최솟값은 그대로예요.\n가로 위치와 대칭축만 바뀝니다.'))]});
}
function showKit(app){
  app.sheet({title:'원본 페이지가 아니라,\n키트로 조립한 화면',body:'TripFit의 시각 부품 + 별도의 수학 수업 콘텐츠',tone:'lime',content:[
    card({tone:'cream',title:'공통 부품'},node('p',{class:'tk-body'},'맞물리는 카드 · 숫자 롤링 · 글자별 등장\n스프링 모션 · 상세 시트 · 모바일 전환')),
    card({tone:'pink',title:'내용마다 다른 상세 화면'},node('p',{class:'tk-body'},'개념 카드는 설명을, 그래프 카드는 조작 화면을, 문제 카드는 선택지를 보여줘요. 같은 시트 안에 다른 구성을 넣었습니다.')),
    card({tone:'sky',title:'교체하는 것은 콘텐츠'},node('p',{class:'tk-body'},'lesson-data.js에서 제목과 데이터를 바꾸고, lesson-demo.js에서 필요한 화면을 조립해요. 키트의 디자인·모션은 그대로 재사용합니다.')),
    node('p',{class:'tk-code-note'},'개념·문제 점수는 UI 동작을 보여 주기 위한 예시 값입니다. 학생 성적이나 실제 학습 진단이 아닙니다. 원본 여행 계산 엔진은 포함하지 않았습니다.')
  ]});
}
function balance(app,d){
  const p=d.profiles[app.state.balance];
  const head=node('div',{class:'tk-row tk-between'},node('span',{class:'tk-label'},'학습 균형'),node('button',{class:'tk-plain',type:'button',id:'kit-info',onClick:()=>showKit(app)},'키트로 만든 예시 ↗'));
  const labels=node('div',{class:'tk-pair-labels'},node('span',{},node('i',{class:'tk-dot-person',style:'--person:var(--tk-rose)'}),'개념 이해'),node('span',{},'문제 적용 ',node('i',{class:'tk-dot-person',style:'--person:var(--tk-blue)'})));
  return card({tone:'lime',join:'cut',side:'right',className:'tk-top',id:'balance-card'},head,node('h1',{class:'tk-title tk-balance-title'},d.title),node('div',{class:'tk-pair'},metric(p.concept,'%',{id:'concept-value',large:true}),node('span',{class:'tk-colon'},':'),metric(p.practice,'%',{id:'practice-value',large:true})),labels,node('div',{class:'tk-balance-note'},node('b',{id:'profile-label'},p.label),node('span',{},'슬라이더로 바꿔 보는 예시 점수')),slider({value:app.state.balance,labels:['개념 쪽','균형','문제 쪽'],onInput:i=>{
    app.state.balance=i;const profile=d.profiles[i];
    setMetric(document.getElementById('concept-value'),profile.concept,'%');setMetric(document.getElementById('practice-value'),profile.practice,'%');
    document.getElementById('profile-label').textContent=profile.label;
    const boxes=[document.getElementById('concept-list'),document.getElementById('practice-list')];
    [profile.left,profile.right].forEach((values,j)=>{boxes[j].querySelector('.tk-mini-score').textContent=(j?profile.practice:profile.concept)+'%';boxes[j].querySelectorAll('.tk-progress-row').forEach((row,k)=>{row.querySelector('b').style.width=values[k]+'%';row.querySelector('i').setAttribute('aria-valuenow',values[k]);row.querySelector('em').textContent=values[k]+'%';});});
    app.notify(profile.label+' · 카드와 숫자가 함께 바뀌어요');
  }}));
}
function checklists(app,d){const p=d.profiles[app.state.balance];return split(...[0,1].map(i=>card({tone:i?'sky':'pink',join:i?'tab':'',side:i?'right':'',onClick:()=>i?app.go('quiz'):showConcept(app,d),id:i?'practice-list':'concept-list',hint:i?'문제 적용 카드 열기':'개념 이해 카드 열기'},node('div',{class:'tk-mini-head'},node('span',{},i?'문제 적용':'개념 이해'),node('b',{class:'tk-mini-score'},(i?p.practice:p.concept)+'%')),...(i?d.practiceLabels:d.conceptLabels).map((label,k)=>progress(label,(i?p.right:p.left)[k])),node('span',{class:'tk-tap-note'},i?'눌러서 문제 풀기 ↗':'눌러서 개념 보기 ↗'))));}
function question(app,d){
  const options=node('div',{class:'tk-choice-list'}),feedback=node('p',{class:'tk-result',role:'status',id:'answer-feedback'});
  const choose=i=>{app.state.answer=i;options.querySelectorAll('button').forEach((b,j)=>{b.classList.toggle('is-correct',j===d.answer);b.classList.toggle('is-wrong',j===i&&i!==d.answer);b.setAttribute('aria-pressed',String(j===i));});feedback.textContent=i===d.answer?'맞았어요. 꼭짓점은 (2, −1)입니다.':'괄호 안의 부호를 다시 확인해 보세요. 정답은 (2, −1)이에요.';app.footer.querySelector('button').disabled=false;app.notify(i===d.answer?'정답 · 개념이 문제로 연결됐어요':'다시 확인 · x − 2 = 0을 생각해 보세요');};
  d.options.forEach((text,i)=>options.append(node('button',{class:'tk-choice',type:'button','data-option':i,'aria-pressed':'false',onClick:()=>choose(i)},node('i',{},String(i+1).padStart(2,'0')),text)));
  const block=card({tone:'cream',join:'tab',side:'left'},node('span',{class:'tk-label'},'한 번 선택해 보세요'),options,feedback);
  if(app.state.answer!=null){const i=app.state.answer;options.querySelectorAll('button').forEach((b,j)=>{b.classList.toggle('is-correct',j===d.answer);b.classList.toggle('is-wrong',j===i&&i!==d.answer);b.setAttribute('aria-pressed',String(j===i));});feedback.textContent=i===d.answer?'맞았어요. 꼭짓점은 (2, −1)입니다.':'정답은 (2, −1)이에요. 풀이에서 이유를 확인하세요.';}
  return block;
}
export function createLessonFlow(d=lesson){return {
  title:'같은 디자인,\n새로운 수업.',brand:d.brand,description:'원본 화면을 다시 여는 것이 아닙니다. 기존 UI 키트의 카드, 모션, 숫자, 상세 시트로 별도의 수업 화면을 조립했습니다.',state:{balance:1,answer:null},start:'learn',
  onStep:(id,app)=>{if(id==='quiz')app.footer.querySelector('button').disabled=app.state.answer==null;},
  steps:[
    {id:'learn',label:d.topic+' 학습 화면',cards:[
      {type:'text',render:app=>balance(app,d)},
      {type:'text',render:app=>checklists(app,d)},
      {type:'text',render:app=>card({tone:'mint',join:'cut',className:'tk-chart-card',id:'graph-card',onClick:()=>showGraph(app,d),hint:'그래프 탐구 열기'},node('div',{class:'tk-chart-top'},pill(d.topic+' · 그래프 탐구'),icon('arrow',18)),graph(...d.vertex))},
      {type:'text',render:app=>card({tone:'lilac',join:'tab cut',side:'left',className:'tk-row-card',onClick:()=>showConcept(app,d),id:'concept-card',hint:'핵심 개념 한 장 열기'},node('span',{class:'tk-ico'},icon('spark')),node('div',{class:'tk-row-copy'},node('h3',{},'핵심 개념 한 장'),node('p',{},'읽기 · 조작 · 문제, 각자 다른 상세 화면')),icon())},
      {type:'text',render:()=>stats([{label:'학습 카드',value:'03',unit:'개'},{label:'예상 시간',value:'12',unit:'min'},{label:'확인 문제',value:'01',unit:'개'}])},
      {type:'text',render:app=>node('div',{class:'tk-card-list'},node('div',{class:'tk-section-label'},'오늘의 순서 · '+d.topic),...d.steps.map((s,i)=>rowCard({...s,id:'lesson-row-'+i,onClick:()=>s.action==='concept'?showConcept(app,d):s.action==='graph'?showGraph(app,d):app.go('quiz')})))},
      {type:'text',render:()=>node('p',{class:'tk-code-note'},'Ray class · TripFit UI kit로 조립한 새 예시\n점수와 시간은 화면 동작을 위한 예시입니다.')}
    ],actions:[{label:'문제로 확인하기',next:'quiz'}]},
    {id:'quiz',label:'꼭짓점 확인 문제',cards:[
      {type:'text',render:app=>card({tone:'lime',join:'cut',side:'left',className:'tk-top'},node('div',{class:'tk-row tk-between'},node('span',{class:'tk-label'},'02 / 확인 문제'),node('button',{class:'tk-plain',type:'button',onClick:()=>app.go('learn')},'← 학습 화면')),node('h1',{class:'tk-title'},d.question),node('p',{class:'tk-formula'},d.formula))},
      {type:'text',render:app=>question(app,d)},
      {type:'text',render:app=>card({tone:'mint',className:'tk-chart-card',onClick:()=>showGraph(app,d),hint:'그래프 다시 보기'},node('div',{class:'tk-chart-top'},pill('그래프로 다시 확인'),icon()),graph(...d.vertex))},
      {type:'text',render:app=>rowCard({tone:'pink',title:'힌트가 필요하다면',subtitle:'괄호 안의 식을 0으로 만들어 보세요',symbol:'spark',onClick:()=>showConcept(app,d),id:'hint-card'})}
    ],actions:[{label:'풀이와 결과 보기',next:'result'}]},
    {id:'result',label:'문제 풀이와 결과',cards:[
      {type:'text',render:app=>card({tone:'lime',join:'cut',className:'tk-top'},node('span',{class:'tk-label'},'03 / 학습 확인'),node('h1',{class:'tk-title'},app.state.answer===d.answer?'개념이 문제로,\n연결됐어요.':'한 번 더 보면,\n분명해져요.'),node('div',{style:'margin-top:22px'},metric(app.state.answer===d.answer?'100':'0','%',{large:true,id:'result-score'})),node('p',{class:'tk-body',style:'margin-top:14px'},'이번 확인 문제 · 선택 결과'))},
      {type:'text',render:()=>card({tone:'cream',join:'tab cut',side:'left',title:'정답은 (2, −1)'},node('p',{class:'tk-formula'},'p = 2, q = −1'),node('p',{class:'tk-body'},d.explanation))},
      {type:'text',render:app=>card({tone:'sky',join:'tab',side:'left',title:'이제 직접 설명해 보세요.'},node('p',{class:'tk-body'},'왜 x 좌표는 −2가 아니라 2일까요?\n왜 y 좌표는 −1일까요?'),button('다시 풀어보기',()=>{app.state.answer=null;app.go('quiz');},{secondary:true,id:'retry-question'}))},
      {type:'text',render:app=>rowCard({tone:'lilac',title:'이 예시는 어떻게 만들었나요?',subtitle:'원본이 아닌 키트 기반 재생성',symbol:'code',onClick:()=>showKit(app),id:'kit-proof'})}
    ],actions:[{label:'학습 화면으로 돌아가기',next:'learn'}]}
  ]
};}
export function startLesson(mount=document.getElementById('app'),data=lesson){const app=new ComposedFlow(mount,createLessonFlow(data)).mount();window.__kitDemo=app;return app;}
if(typeof document!=='undefined'&&document.getElementById('app'))startLesson();
