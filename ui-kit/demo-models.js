/** Pure, tested state rules for the two fictional demos. No network or payment API. */
export const MENU = [
  {id:'cloud',name:'클라우드 라테',en:'CLOUD LATTE',category:'coffee',price:5800,tone:'pink',art:'latte',note:'부드러운 크림, 가벼운 하루.',allergens:['우유'],tag:'SIGNATURE',stock:true},
  {id:'black',name:'데일리 아메리카노',en:'DAILY BLACK',category:'coffee',price:4300,tone:'sky',art:'black',note:'고소한 여운이 남는 한 잔.',allergens:[],tag:'CLASSIC',stock:true},
  {id:'matcha',name:'말차 오트 라테',en:'MATCHA OAT',category:'tea',price:6200,tone:'mint',art:'matcha',note:'쌉싸름한 말차와 오트의 균형.',allergens:['귀리'],tag:'OAT',stock:true},
  {id:'berry',name:'베리 히비스커스',en:'BERRY TEA',category:'tea',price:5500,tone:'lilac',art:'berry',note:'붉은 과일 향, 산뜻한 마무리.',allergens:[],tag:'CAFFEINE FREE',stock:true},
  {id:'salt',name:'솔티 버터 브레드',en:'SALTED BREAD',category:'bakery',price:3800,tone:'cream',art:'bread',note:'바삭한 겉, 촉촉한 속.',allergens:['밀','우유'],tag:'BAKERY',stock:true},
  {id:'lemon',name:'레몬 파운드',en:'LEMON CAKE',category:'bakery',price:4500,tone:'peach',art:'cake',note:'레몬 글레이즈를 입힌 작은 휴식.',allergens:['밀','우유','달걀'],tag:'SOLD OUT',stock:false}
];
export const DEFAULT_OPTIONS = {temp:'ICE',size:'Regular',milk:'기본',decaf:false,sweet:'기본',warm:false};
export function normalizeOptions(item, options={}) {
  if(!item) throw new TypeError('Unknown product');
  if(item.category==='bakery')return {warm:!!options.warm};
  return {temp:['ICE','HOT'].includes(options.temp)?options.temp:'ICE',size:options.size==='Large'?'Large':'Regular',milk:item.id==='cloud'&&options.milk==='오트'?'오트':'기본',decaf:item.category==='coffee'&&!!options.decaf,sweet:['기본','덜 달게','시럽 없음'].includes(options.sweet)?options.sweet:'기본'};
}
export function linePrice(item, options={}) {
  const o=normalizeOptions(item,options);
  return item.price+(o.size==='Large'?700:0)+(o.milk==='오트'?600:0)+(o.decaf?500:0);
}
export function optionText(item,options={}) {
  const o=normalizeOptions(item,options);
  if(item.category==='bakery')return o.warm?'따뜻하게 데우기':'그대로 포장';
  return [o.temp,o.size,item.id==='cloud'?(o.milk==='오트'?'오트 +600':'우유'):item.id==='matcha'?'오트':null,o.decaf?'디카페인 +500':null,item.id!=='black'?o.sweet:null].filter(Boolean).join(' · ');
}
export function cartKey(item,options){return item.id+':'+JSON.stringify(normalizeOptions(item,options));}
export function addLine(cart,item,options={},qty=1){
  if(!item?.stock)throw new Error('품절된 메뉴입니다.');
  if(!Number.isInteger(qty)||qty<1||qty>9)throw new RangeError('수량은 1~9개입니다.');
  const normalized=normalizeOptions(item,options),key=cartKey(item,normalized);
  const next=cart.map(x=>({...x})),existing=next.find(x=>x.key===key);
  if(existing){if(existing.qty+qty>9)throw new RangeError('같은 옵션은 최대 9개까지 담을 수 있어요.');existing.qty+=qty;}
  else {if(next.length>=30)throw new RangeError('최대 30종류의 옵션까지 담을 수 있어요.');next.push({key,id:item.id,options:normalized,qty});}
  return next;
}
export function normalizeCart(cart){
  if(!Array.isArray(cart))return [];
  let result=[];
  for(const row of cart.slice(0,30)){
    const item=MENU.find(x=>x.id===row?.id);
    if(!item?.stock||!Number.isInteger(row.qty)||row.qty<1)continue;
    try{result=addLine(result,item,row.options,Math.min(9,row.qty));}catch{}
  }
  return result;
}
export function totals(cart,coupon=''){
  const rows=normalizeCart(cart),subtotal=rows.reduce((n,r)=>n+linePrice(MENU.find(x=>x.id===r.id),r.options)*r.qty,0);
  const discount=coupon==='WELCOME10'&&subtotal>=8000?Math.min(1500,Math.floor(subtotal*.1)):0;
  return {count:rows.reduce((n,r)=>n+r.qty,0),subtotal,discount,total:subtotal-discount};
}
export const EVENT = {name:'FIELD NOTES',edition:'2026',days:['2026-12-12','2026-12-13'],venue:'필드 스튜디오 · 가상 행사',zone:'Asia/Seoul'};
export const SESSIONS = [
  {id:'opening',day:0,start:'10:00',end:'10:45',track:'design',room:'HALL A',title:'작은 관찰이\n큰 아이디어가 될 때',speaker:'민서 · 디자인 리서처',bio:'일상의 장면을 제품의 언어로 옮기는 가상의 연사입니다.',desc:'관찰 노트를 출발점으로, 아이디어를 구체적인 화면과 경험으로 연결합니다.',seats:24,tone:'pink',tags:['키노트','관찰'],takeaways:['관찰을 기록하는 세 가지 질문','아이디어를 화면으로 옮기는 과정','실험을 작은 단위로 나누기']},
  {id:'prototype',day:0,start:'10:30',end:'11:30',track:'make',room:'LAB C',title:'손으로 만드는\n첫 번째 프로토타입',speaker:'준 · 프로토타이퍼',bio:'도구보다 빠른 실험을 좋아하는 가상의 메이커입니다.',desc:'종이와 간단한 인터랙션으로 아이디어를 테스트하는 실습 세션입니다.',seats:8,tone:'mint',tags:['워크숍','실습'],takeaways:['상태와 화면을 나누기','빠르게 연결하는 인터랙션','사용자 피드백 받기']},
  {id:'motion',day:0,start:'11:00',end:'11:50',track:'tech',room:'HALL B',title:'움직임에도\n이유가 필요해',speaker:'지우 · 인터랙션 엔지니어',bio:'디자인과 코드를 함께 다루는 가상의 엔지니어입니다.',desc:'과한 효과 대신, 정보의 연결을 설명하는 모션을 설계해 봅니다.',seats:18,tone:'sky',tags:['모션','접근성'],takeaways:['스프링과 이징의 차이','움직임 줄이기 대응','상태 변화 전달하기']},
  {id:'systems',day:0,start:'13:00',end:'13:50',track:'design',room:'HALL A',title:'하나의 키트,\n여러 개의 이야기',speaker:'서윤 · 프로덕트 디자이너',bio:'재사용 가능한 디자인 시스템을 연구하는 가상의 연사입니다.',desc:'같은 디자인 언어로 서로 다른 서비스의 화면을 만드는 방법을 살펴봅니다.',seats:32,tone:'lilac',tags:['디자인 시스템','컴포넌트'],takeaways:['고정할 것과 바꿀 것','카드별 상세 화면 구성','공통 부품의 경계']},
  {id:'data',day:0,start:'13:20',end:'14:10',track:'tech',room:'HALL B',title:'데이터가\n화면이 되는 순간',speaker:'도현 · 프런트엔드 개발자',bio:'복잡한 데이터를 읽기 쉬운 UI로 만드는 가상의 개발자입니다.',desc:'숫자와 목록, 선택 상태를 연결하는 프런트엔드 구성 실습입니다.',seats:16,tone:'peach',tags:['데이터','프런트엔드'],takeaways:['단일 데이터 원천','목록의 안정적인 키','비어 있는 상태의 설계']},
  {id:'studio',day:0,start:'14:30',end:'15:30',track:'make',room:'LAB C',title:'나만의 화면\n만들어 보기',speaker:'예린 · 크리에이티브 코더',bio:'작은 웹 실험을 만드는 가상의 진행자입니다.',desc:'세 가지 부품으로 자신만의 화면을 조립하는 소규모 워크숍입니다.',seats:0,tone:'cream',tags:['워크숍','만석'],takeaways:['화면 스케치','컴포넌트 조립','작은 사용자 테스트']},
  {id:'accessible',day:1,start:'10:00',end:'10:50',track:'design',room:'HALL A',title:'모두에게\n열린 인터페이스',speaker:'하린 · UX 디자이너',bio:'다양한 사용자를 고려하는 가상의 디자이너입니다.',desc:'명확한 구조, 키보드 조작, 읽기 순서가 좋은 경험을 만드는 과정을 다룹니다.',seats:27,tone:'mint',tags:['접근성','UX'],takeaways:['눈에 보이는 포커스','모달의 열기와 닫기','읽기 순서 확인']},
  {id:'local',day:1,start:'10:20',end:'11:10',track:'tech',room:'HALL B',title:'서버 없이도\n꽤 쓸 만하게',speaker:'태오 · 웹 엔지니어',bio:'브라우저의 기본 기능을 탐구하는 가상의 개발자입니다.',desc:'로컬 저장, 파일 내보내기, 복구 가능한 상태를 이용해 시연을 완성합니다.',seats:19,tone:'sky',tags:['로컬 상태','웹 API'],takeaways:['저장 실패 대응','내보내기와 가져오기','네트워크와 분리된 모델']},
  {id:'paper',day:1,start:'11:30',end:'12:20',track:'make',room:'LAB C',title:'티켓 한 장에\n담는 경험',speaker:'수아 · 비주얼 디자이너',bio:'작은 인쇄물과 디지털 화면을 연결하는 가상의 디자이너입니다.',desc:'레이아웃과 정보 위계로 행사 패스의 경험을 설계하는 시간입니다.',seats:12,tone:'pink',tags:['티켓','레이아웃'],takeaways:['정보의 우선순위','작은 화면의 여백','상태와 안내 문구']},
  {id:'closing',day:1,start:'13:00',end:'13:45',track:'tech',room:'HALL A',title:'다음 실험을\n시작하는 방법',speaker:'FIELD NOTES · 패널',bio:'가상의 연사들이 함께하는 마무리 세션입니다.',desc:'이틀의 아이디어를 정리하고 실행할 수 있는 다음 실험을 고릅니다.',seats:40,tone:'lilac',tags:['패널','마무리'],takeaways:['작은 목표 고르기','한 주의 실험 계획','서로에게 피드백하기']}
];
export function minutes(time){const [h,m]=time.split(':').map(Number);return h*60+m;}
export function overlaps(a,b){return a.day===b.day&&minutes(a.start)<minutes(b.end)&&minutes(b.start)<minutes(a.end);}
export function planSessions(ids){return SESSIONS.filter(s=>ids.includes(s.id)).sort((a,b)=>a.day-b.day||minutes(a.start)-minutes(b.start));}
export function conflicts(ids,candidate){return planSessions(ids).filter(s=>s.id!==candidate.id&&overlaps(s,candidate));}
export function normalizePlan(ids){
  const good=[];for(const id of Array.isArray(ids)?ids:[]){const s=SESSIONS.find(x=>x.id===id);if(s?.seats>0&&!good.includes(id)&&!conflicts(good,s).length)good.push(id);}return good;
}
/** Greedy earliest-finish selection: maximum number of non-overlapping sessions per day. */
export function recommendPlan(track='all'){
  const selected=[];for(const day of [0,1]){let end=-1;for(const s of SESSIONS.filter(x=>x.day===day&&x.seats>0&&(track==='all'||x.track===track)).sort((a,b)=>minutes(a.end)-minutes(b.end)||a.id.localeCompare(b.id))){if(minutes(s.start)>=end){selected.push(s.id);end=minutes(s.end);}}}return selected;
}
export function planMinutes(ids){return planSessions(ids).reduce((sum,s)=>sum+minutes(s.end)-minutes(s.start),0);}
export function icsEscape(text){return String(text).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');}
export function foldICS(line){
  const encoder=new TextEncoder();let out='',chunk='',bytes=0;
  for(const c of line){const n=encoder.encode(c).length;if(bytes+n>75){out+=chunk+'\r\n';chunk=' ';bytes=1;}chunk+=c;bytes+=n;}return out+chunk;
}
export function scheduleICS(ids,{reminders=true,now=new Date()}={}){
  const stamp=now.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
  const utc=(s,time)=>new Date(EVENT.days[s.day]+'T'+time+':00+09:00').toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//TripFit UI Kit//FIELD NOTES DEMO//KO','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:FIELD NOTES — 데모 시간표'];
  for(const s of planSessions(normalizePlan(ids))){lines.push('BEGIN:VEVENT','UID:field-notes-demo-'+s.id+'@tripfit.example','DTSTAMP:'+stamp,'DTSTART:'+utc(s,s.start),'DTEND:'+utc(s,s.end),'SUMMARY:'+icsEscape('[데모] '+s.title.replace(/\n/g,' ')),'LOCATION:'+icsEscape(EVENT.venue+' / '+s.room),'DESCRIPTION:'+icsEscape('실제 행사가 아닌 UI 시연용 일정입니다.\n'+s.desc),'STATUS:TENTATIVE');if(reminders)lines.push('BEGIN:VALARM','TRIGGER:-PT10M','ACTION:DISPLAY','DESCRIPTION:데모 세션 10분 전','END:VALARM');lines.push('END:VEVENT');}
  lines.push('END:VCALENDAR');return lines.map(foldICS).join('\r\n')+'\r\n';
}
