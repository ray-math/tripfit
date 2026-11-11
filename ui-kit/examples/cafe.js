/** Cafe app: domain content + shared UI kit imports. No checkout/payment requests. */
import { node,card,pill,button,icon } from '../compose.js';
import { MENU,normalizeOptions,normalizeCart,linePrice,optionText,cartKey,addLine,totals } from '../demo-models.js';
import { store,money,smallButton,textButton,heading,stack,tabs,choice,stepper,notice,drinkArt,download,shareText,qrBlock,confirmSheet,appSettings,footer,refresh,startDemo,empty } from '../demo-ui.js';
const initial={cart:[],favorites:[],coupon:'',pickup:'soon',note:'',orders:[],active:null};
function sanitize(raw){
 raw=raw&&typeof raw==='object'?raw:{};
 const orders=(Array.isArray(raw.orders)?raw.orders:[]).filter(o=>typeof o?.id==='string'&&/^DEMO-C[0-9A-Z-]+$/.test(o.id)&&Array.isArray(o.lines)).slice(0,12).map(o=>({...o,lines:normalizeCart(o.lines),stage:Math.max(0,Math.min(3,Number(o.stage)||0)),cancelled:!!o.cancelled,note:String(o.note||'').slice(0,100),coupon:o.coupon==='WELCOME10'?'WELCOME10':'',pickup:['soon','later','takeaway'].includes(o.pickup)?o.pickup:'soon'}));
 return {cart:normalizeCart(raw.cart),favorites:[...new Set((Array.isArray(raw.favorites)?raw.favorites:[]).filter(id=>MENU.some(x=>x.id===id)))],coupon:raw.coupon==='WELCOME10'?'WELCOME10':'',pickup:['soon','later','takeaway'].includes(raw.pickup)?raw.pickup:'soon',note:String(raw.note||'').slice(0,100),orders,active:typeof raw.active==='string'?raw.active:null};
}
const saved=store('tripfit.demo.cafe.v1',initial,sanitize);let app,category='all',query='',favoriteOnly=false,removed=null;
const pickupLabels={soon:'가능한 빨리 · 약 8분',later:'여유롭게 · 약 20분',takeaway:'약 30분 뒤 픽업'};
const stages=['주문 접수','만드는 중','픽업 준비 완료','픽업 완료'];
const state=()=>saved.value,save=values=>saved.save({...state(),...values});
function tools(){return smallButton('···',()=>appSettings(app,saved,()=>app.go('menu')),{class:'da-small da-round','aria-label':'데모 설정'});}
function top(kicker,title,subtitle,tone='lime'){return card({tone,className:'tk-top',join:'cut',side:'left'},node('div',{class:'da-topline'},node('span',{class:'tk-label'},kicker),tools()),node('h1',{class:'tk-title da-title'},title),node('p',{class:'da-subtitle'},subtitle));}
function favoriteButton(item){
 const b=smallButton(state().favorites.includes(item.id)?'♥':'♡',()=>{const yes=state().favorites.includes(item.id);save({favorites:yes?state().favorites.filter(id=>id!==item.id):[...state().favorites,item.id]});b.textContent=yes?'♡':'♥';b.setAttribute('aria-pressed',String(!yes));if(favoriteOnly)refresh(app);},{class:'da-favorite','aria-label':item.name+' 즐겨찾기','aria-pressed':state().favorites.includes(item.id)});return b;
}
function productSheet(item,editing=null){
 if(!item.stock){app.notify('오늘은 품절인 예시 메뉴예요');return;}
 let options=normalizeOptions(item,editing?.options),qty=editing?.qty||1,sh;
 const error=node('p',{class:'da-error',role:'status'}),price=node('strong',{class:'da-price'}),totalLabel=node('span');
 const update=()=>{price.textContent=money(linePrice(item,options));totalLabel.textContent=`${money(linePrice(item,options)*qty)} · ${editing?'옵션 수정':'담기'}`;};
 const form=card({tone:'cream'},heading(item.en,'내 취향으로'),node('div',{class:'da-checkout-row'},node('span',{},'한 개 가격'),price));
 const set=(key,value)=>{options={...options,[key]:value};update();};
 if(item.category==='bakery')form.append(choice('포장 옵션',[['plain','그대로 포장'],['warm','따뜻하게']],options.warm?'warm':'plain',v=>set('warm',v==='warm')));
 else{
  form.append(choice('온도',[['ICE','ICE'],['HOT','HOT']],options.temp,v=>set('temp',v)),choice('사이즈',[['Regular','Regular'],['Large','Large +700']],options.size,v=>set('size',v)));
  if(item.id==='cloud')form.append(choice('우유',[['기본','기본 우유'],['오트','오트 +600']],options.milk,v=>set('milk',v)));
  if(item.category==='coffee')form.append(node('label',{class:'da-check'},node('input',{type:'checkbox',checked:options.decaf,onChange:e=>set('decaf',e.target.checked)}),'디카페인으로 변경 +500원'));
  if(item.id!=='black')form.append(choice('당도',[['기본','기본'],['덜 달게','덜 달게'],['시럽 없음','시럽 없음']],options.sweet,v=>set('sweet',v)));
 }
 form.append(node('div',{class:'da-line-actions'},node('b',{class:'da-note'},'수량'),stepper(qty,v=>{qty=v;update();},{label:'메뉴 수량'})),notice(item.allergens.length?'알레르기 예시 정보: '+item.allergens.join(', ')+'\n옵션을 바꿔도 알레르기 안전을 보장하지 않습니다.':'원재료 정보는 가상의 메뉴 데이터입니다.'),error);
 const commit=button('',()=>{
  try{let cart=state().cart;if(editing)cart=cart.filter(r=>r.key!==editing.key);cart=addLine(cart,item,options,qty);save({cart});removed=null;sh.close(true);refresh(app);app.notify(editing?'옵션을 수정했어요':`${item.name} ${qty}개를 담았어요`);}catch(e){error.textContent=e.message;}
 },{id:'add-to-cart'});commit.firstChild.replaceWith(totalLabel);update();
 sh=app.sheet({title:item.name,body:item.note,tone:item.tone,content:[card({tone:item.tone,className:'da-product-visual'},drinkArt(item.art,true)),form,card({tone:'lime'},commit)]});
}
function menuPage(){
 const hero=card({tone:'lime',className:'tk-top',join:'cut',side:'right'},node('div',{class:'da-topline'},node('span',{class:'tk-label'},'SLOW MORNING / CAFE'),tools()),node('div',{class:'da-hero-art'},node('div',{},node('h1',{class:'tk-title da-title'},'한 잔의 여유,\n내 취향대로.'),node('p',{class:'da-subtitle'},'내 취향대로 한 잔.\n실제 결제 없는 주문 데모.')),drinkArt('latte')),node('div',{class:'da-hero-foot'},node('span',{},node('b',{},'08'),' min · 예시 준비 시간'),node('span',{class:'da-badge'},'PICKUP DEMO')));
 const grid=node('div',{class:'da-product-grid',id:'menu-grid'}),count=node('p',{class:'da-menu-count',role:'status'});
 const render=()=>{
  const found=MENU.filter(x=>(category==='all'||x.category===category)&&(!favoriteOnly||state().favorites.includes(x.id))&&(x.name+' '+x.en).toLowerCase().includes(query.toLowerCase()));count.textContent=`${found.length}개의 메뉴 · 가격과 재고는 예시입니다`;
  grid.replaceChildren(...found.map(item=>card({tone:item.tone,className:'da-product'},node('div',{class:'da-product-top'},node('span',{class:'da-badge outline'},item.tag),favoriteButton(item)),drinkArt(item.art),node('h3',{},item.name),node('p',{},item.note),node('div',{class:'da-product-bottom'},node('span',{class:'da-price'},item.price.toLocaleString('ko-KR'),node('small',{},'원')),smallButton(item.stock?'+':'—',()=>productSheet(item),{class:'da-add','aria-label':item.name+' 옵션 선택','data-product':item.id,disabled:!item.stock})))));
  if(!found.length)grid.append(empty('아직 메뉴가 없어요','다른 분류나 검색어를 선택해 보세요.'));
 };
 const search=node('input',{class:'da-input da-search',type:'search',placeholder:'메뉴 이름 검색','aria-label':'메뉴 검색',value:query,onInput:e=>{query=e.target.value;render();}});
 const filters=card({tone:'pink',join:'tab',side:'right'},heading('MENU','오늘의 메뉴',node('span',{class:'da-badge'},'6 CHOICES')),tabs([['all','전체'],['coffee','커피'],['tea','티·라테'],['bakery','베이커리']],category,id=>{category=id;render();}),search,node('label',{class:'da-check'},node('input',{type:'checkbox',checked:favoriteOnly,onChange:e=>{favoriteOnly=e.target.checked;render();}}),'즐겨찾기만 보기'));
 render();return stack(hero,filters,count,grid,card({tone:'mint',title:'처음 만나는 한 잔'},node('p',{class:'da-note'},'8,000원 이상 담으면 WELCOME10.\n10% 할인, 최대 1,500원 — 데모 쿠폰.'),smallButton('쿠폰 코드 복사',()=>shareText(app,'데모 쿠폰','WELCOME10'))),node('p',{class:'da-caption'},'가상의 카페입니다. 주문·재고·픽업 시간은 시연 데이터이며 실제 매장으로 전송되지 않습니다.'));
}
function cartPage(){
 const s=state(),t=totals(s.cart,s.coupon),root=stack(top('YOUR ORDER','취향을 모은\n작은 장바구니.',`${t.count}개 · 옵션은 언제든 바꿀 수 있어요.`));
 if(!s.cart.length){root.append(empty('아직 담은 메뉴가 없어요','마음에 드는 메뉴를 한 가지 골라 보세요.',smallButton('메뉴 보러 가기',()=>app.go('menu'))));if(removed)root.append(undoCard());return root;}
 for(const r of s.cart){const item=MENU.find(x=>x.id===r.id);root.append(card({tone:item.tone,'className':'da-cart-line'},node('div',{class:'da-line'},drinkArt(item.art),node('div',{},node('h3',{},item.name),node('p',{class:'da-options'},optionText(item,r.options)),node('b',{class:'da-price'},money(linePrice(item,r.options)*r.qty)))),node('div',{class:'da-line-actions'},stepper(r.qty,qty=>{save({cart:s.cart.map(x=>x.key===r.key?{...x,qty}:x)});refresh(app);},{label:item.name+' 수량'}),node('div',{},textButton('옵션',()=>productSheet(item,r),{'aria-label':item.name+' 옵션 수정'}),textButton('삭제',()=>{removed=r;save({cart:state().cart.filter(x=>x.key!==r.key)});refresh(app);},{'aria-label':item.name+' 삭제'})))));}
 if(removed)root.append(undoCard());
 const couponInput=node('input',{class:'da-input',placeholder:'WELCOME10',value:s.coupon,'aria-label':'쿠폰 코드',maxLength:20}),msg=node('p',{class:'da-error',role:'status'});
 root.append(card({tone:'cream',title:'쿠폰 한 장'},node('div',{class:'da-inline'},couponInput,smallButton(s.coupon?'해제':'적용',()=>{if(s.coupon){save({coupon:''});refresh(app);return;}if(couponInput.value.trim().toUpperCase()!=='WELCOME10'){msg.textContent='데모 쿠폰 WELCOME10을 입력하세요.';return;}if(t.subtotal<8000){msg.textContent='상품 금액 8,000원 이상에서 적용됩니다.';return;}save({coupon:'WELCOME10'});refresh(app);app.notify('데모 쿠폰을 적용했어요');},{id:'coupon-apply'})),msg,notice('10% 할인 · 8,000원 이상 · 최대 1,500원')));
 root.append(summaryCard(t,s.coupon));return root;
}
function undoCard(){return card({tone:'sky'},node('div',{class:'da-line-actions'},node('span',{class:'da-note'},'메뉴를 삭제했어요.'),smallButton('실행 취소',()=>{try{const item=MENU.find(x=>x.id===removed.id);save({cart:addLine(state().cart,item,removed.options,removed.qty)});removed=null;refresh(app);}catch(e){app.notify(e.message);}},{id:'undo-remove'})));}
function summaryCard(t,coupon){return card({tone:'cream'},node('div',{class:'da-checkout-row'},node('span',{},'상품 금액'),node('b',{},money(t.subtotal))),node('div',{class:'da-checkout-row'},node('span',{},coupon?'데모 쿠폰 할인':'할인'),node('b',{},'−'+money(t.discount))),node('div',{class:'da-checkout-row total'},node('span',{},'예시 합계'),node('strong',{},money(t.total))),coupon&&!t.discount?notice('현재 금액은 쿠폰 최소 주문액 미만이므로 할인이 적용되지 않아요.','warn'):node('p',{class:'da-muted'},'표시된 금액은 시연용입니다. 실제 청구는 없습니다.'));}
function checkoutPage(){
 const s=state(),t=totals(s.cart,s.coupon);if(!t.count)return empty('메뉴를 먼저 담아 주세요.','주문 정보는 장바구니에서 가져옵니다.',smallButton('메뉴로',()=>app.go('menu')));
 return stack(top('PICKUP DETAILS','어느 때의\n여유가 좋을까요?', '가상 매장 · SLOW MORNING 01'),card({tone:'mint',join:'tab',side:'left',title:'픽업 시간 선택'},tabs([['soon','약 8분'],['later','약 20분'],['takeaway','약 30분']],s.pickup,pickup=>save({pickup}),{label:'픽업 시간'}),notice('실제 예약 시간이 아닌 데모 선택입니다.')),card({tone:'pink',title:'한 줄 요청'},node('label',{class:'da-note',for:'order-note'},'개인정보 없이 옵션 메모만 입력하세요.'),node('textarea',{class:'da-input',id:'order-note',maxLength:100,rows:2,placeholder:'예: 빨대는 빼 주세요.',onInput:e=>save({note:e.target.value})},s.note),node('p',{class:'da-muted'},'최대 100자 · 이 브라우저에만 저장')),summaryCard(t,s.coupon),card({tone:'sky',title:'결제는 하지 않습니다.'},node('p',{class:'da-note'},'아래 버튼은 데모 주문만 만듭니다.\n카드 정보·주소·전화번호는 필요하지 않아요.')));
}
function confirmOrder(){
 if(!state().cart.length)return;
 const order={id:'DEMO-C'+Date.now().toString(36).toUpperCase(),number:String(100+Math.floor(Math.random()*900)),lines:structuredClone(state().cart),coupon:state().coupon,note:state().note,pickup:state().pickup,created:new Date().toISOString(),stage:0,cancelled:false};
 save({orders:[order,...state().orders].slice(0,12),active:order.id,cart:[],coupon:'',note:''});removed=null;app.go('status');app.notify({title:'데모 주문을 만들었어요',sub:'실제 결제·주문 전송 없음',right:'#'+order.number});
}
function activeOrder(){return state().orders.find(x=>x.id===state().active)||state().orders[0];}
function updateOrder(order,values){save({orders:state().orders.map(x=>x.id===order.id?{...x,...values}:x)});refresh(app);}
function receipt(order){const t=totals(order.lines,order.coupon);return ['SLOW MORNING — DEMO RECEIPT','실제 결제/수령에 사용할 수 없는 예시입니다.','주문 번호: '+order.id,'픽업: '+pickupLabels[order.pickup],'',...order.lines.flatMap(r=>{const m=MENU.find(x=>x.id===r.id);return [m.name+' × '+r.qty+' / '+money(linePrice(m,r.options)*r.qty),optionText(m,r.options)];}),'','상품: '+money(t.subtotal),'할인: '+money(t.discount),'예시 합계: '+money(t.total),order.note?'메모: '+order.note:''].join('\n');}
function repeat(order){const run=()=>{save({cart:order.lines,coupon:'',pickup:order.pickup,note:''});app.go('cart');app.notify('이전 메뉴를 장바구니에 넣었어요');};if(state().cart.length)confirmSheet(app,{title:'장바구니를 바꿀까요?',body:'현재 담은 메뉴를 이 주문의 메뉴로 교체합니다.',confirm:'이전 주문으로 교체',onConfirm:run});else run();}
function statusPage(){
 const o=activeOrder();if(!o)return stack(top('PICKUP STATUS','아직은\n빈 픽업 선반.', '첫 번째 주문을 만들어 보세요.'),empty('진행 중인 데모가 없어요','메뉴부터 골라 볼까요?',smallButton('메뉴 보기',()=>app.go('menu'))));
 const t=totals(o.lines,o.coupon),title=o.cancelled?'취소된 데모 주문':stages[o.stage];
 const hero=card({tone:o.stage>=2?'mint':'lime',className:'tk-top',join:'cut'},node('div',{class:'da-topline'},node('span',{class:'tk-label'},'PICKUP / DEMO ONLY'),tools()),node('h1',{class:'tk-title'},title),node('div',{class:'da-order-number'},'#'+o.number),node('p',{class:'da-subtitle'},o.cancelled?'실제 결제는 발생하지 않았습니다.':pickupLabels[o.pickup]+' · 아래 버튼으로 상태를 시연하세요.'));
 const list=node('ol',{class:'da-stage-list'},...stages.map((text,i)=>node('li',{class:o.cancelled?'':i<o.stage?'is-done':i===o.stage?'is-active':''},node('i',{},i<o.stage?'✓':String(i+1).padStart(2,'0')),node('span',{},text),node('small',{},i===o.stage&&!o.cancelled?'NOW':''))));
 const summary=card({tone:'pink'},heading('ORDER SUMMARY',`${t.count}개 메뉴`));
 for(const r of o.lines){const m=MENU.find(x=>x.id===r.id);summary.append(node('div',{class:'da-checkout-row'},node('span',{},m.name+' × '+r.qty),node('b',{},money(linePrice(m,r.options)*r.qty))));}
 const code=card({tone:'sky',className:'da-ticket'},
   node('span',{class:'da-badge'},'DEMO PICKUP CODE'),
   qrBlock('TRIPFIT-DEMO-ORDER|'+o.id),
   node('p',{class:'da-note'},'픽업 코드 예시 · 실제 수령 불가'),
   node('div',{class:'da-actions'},
     smallButton('영수증 저장',()=>download('demo-cafe-receipt.txt',receipt(o)),{id:'receipt-export'}),
     smallButton('내용 공유',()=>shareText(app,'데모 주문',receipt(o)))
   )
 );
 const actions=card({tone:'cream'},smallButton('같은 메뉴 다시 담기',()=>repeat(o)));
 if(!o.cancelled&&o.stage<2)actions.append(textButton('데모 주문 취소',()=>confirmSheet(app,{title:'데모 주문을 취소할까요?',body:'이 브라우저의 주문 상태만 취소로 바뀝니다.',confirm:'주문 취소',onConfirm:()=>updateOrder(o,{cancelled:true})})));
 return stack(hero,card({tone:'cream',join:'tab'},list,notice('상태는 버튼으로 변경하는 시연입니다. 실제 매장 상황과 연결되지 않습니다.')),summary,code,actions);
}
function historyPage(){
 const orders=state().orders,done=orders.filter(x=>x.stage===3&&!x.cancelled).length;
 const stamps=card({tone:'pink',join:'tab',side:'left'},heading('DEMO STAMPS','나의 커피 기록',pill(done+' / 6')));
 stamps.append(node('div',{class:'da-inline'},...Array.from({length:6},(_,i)=>node('span',{class:'da-avatar',style:i<done?'background:var(--tk-ink);color:var(--tk-lemon)':'background:transparent;border:1px dashed var(--tk-ink);color:var(--tk-ink)'},i<done?'✓':'·'))),node('p',{class:'da-muted'},'픽업 완료 시 한 칸. 실제 적립 혜택은 없습니다.'));
 const root=stack(top('LOCAL HISTORY','작은 취향이\n기록이 됩니다.',`${orders.length}개의 데모 주문 · 이 브라우저에만 저장`),stamps);
 if(!orders.length)root.append(empty('기록은 첫 주문부터','픽업 완료까지 눌러 보고 변화를 확인해 보세요.'));
 for(const o of orders){
   root.append(card({tone:'cream'},
     node('div',{class:'da-topline'},node('b',{},'#'+o.number),node('span',{class:'da-badge outline'},o.cancelled?'취소':stages[o.stage])),
     node('p',{class:'da-note'},o.lines.map(r=>MENU.find(x=>x.id===r.id).name+' × '+r.qty).join(', ')),
     node('div',{class:'da-line-actions'},smallButton('주문 보기',()=>{save({active:o.id});app.go('status');}),textButton('다시 담기',()=>repeat(o)))
   ));
 }
 root.append(node('p',{class:'da-caption'},'최근 12개의 데모 주문만 저장합니다. 기기나 브라우저 사이에서는 동기화되지 않습니다.'));return root;
}

const nav=[{id:'menu',label:'메뉴'},{id:'cart',label:'장바구니'},{id:'status',label:'픽업'},{id:'history',label:'기록'}];
const definition={title:'한 잔을 고르는\n작은 즐거움.',brand:'SLOW MORNING',description:'카드 → 옵션 시트 → 장바구니 → 픽업. 같은 키트로 다른 흐름을 조립했습니다. 실제 주문과 결제는 없습니다.',steps:[['menu',menuPage],['cart',cartPage],['checkout',checkoutPage],['status',statusPage],['history',historyPage]].map(([id,render])=>({id,label:id,cards:[{type:'text',render}]})),onStep(id,a){const t=totals(state().cart,state().coupon);let primary;if(id==='menu'&&t.count)primary={label:`${t.count}개 · ${money(t.total)} · 장바구니`,run:()=>a.go('cart')};if(id==='cart')primary={label:`${money(t.total)} · 픽업 정보 선택`,run:()=>a.go('checkout'),disabled:!t.count};if(id==='checkout')primary={label:'데모 주문 확정 · 결제 없음',run:confirmOrder,disabled:!t.count,id:'confirm-order'};if(id==='status'){const o=activeOrder();primary=o&&!o.cancelled&&o.stage<3?{label:['만들기 시작 · 시연','픽업 준비 완료 · 시연','픽업 완료 처리 · 시연'][o.stage],run:()=>updateOrder(o,{stage:o.stage+1}),id:'advance-order'}:{label:'새 메뉴 고르기',run:()=>a.go('menu')};}footer(a,{primary,nav:nav.map(n=>n.id==='cart'?{...n,label:`장바구니${t.count?' '+t.count:''}`}:n)});}};
app=startDemo(document.getElementById('app'),definition);
window.__cafe={app,storage:saved,menu:MENU};
