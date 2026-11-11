import { node,card,icon } from '../compose.js';
import { stack,orbitArt,startDemo } from '../demo-ui.js';
function examples(){
 const root=stack(card({tone:'lime',className:'tk-top'},node('div',{class:'da-topline'},node('span',{class:'tk-label'},'TRIPFIT / EXAMPLE LIBRARY'),node('span',{class:'da-badge'},'03 APPS')),node('h1',{class:'tk-title da-title'},'같은 키트,\n서로 다른 하루.'),node('p',{class:'da-subtitle'},'디자인과 모션은 그대로.\n내용과 상호작용을 새롭게 조립했습니다.'),orbitArt()));
 for(const [index,tone,title,body,href]of [['01','pink','한 잔을 고르는\n작은 즐거움.','카페 주문·픽업 / 옵션 · 장바구니 · 데모 주문','cafe.html'],['02','sky','관심이 만나는\n나만의 이틀.','행사·개인 시간표 / 충돌 확인 · 캘린더 · 데모 패스','event.html'],['03','mint','개념과 문제,\n균형 있게.','수학 수업 / 그래프 조작 · 문제 풀이',location.pathname.includes('/examples/')?'regenerated.html':'lesson.html']])root.append(card({tone,className:'da-hub-card'},node('span',{class:'tk-label'},index+' / COMPOSED EXAMPLE'),node('h2',{style:'white-space:pre-line'},title),node('p',{class:'da-muted'},body),node('a',{href},'직접 사용해 보기',icon())));
 root.append(card({tone:'cream',title:'실제 서비스로 연결되지 않아요.'},node('p',{class:'da-note'},'모든 주문·행사·입장권은 시연용입니다.\n개인 선택은 이 브라우저에만 저장됩니다.')),node('p',{class:'da-caption'},'88×32 목업 아일랜드와 줄인 pop 스프링을 세 예시가 공유합니다.'));
 return root;
}
const app=startDemo(document.getElementById('app'),{title:'하나의 언어,\n세 가지 경험.',brand:'UI KIT',description:'새 화면마다 디자인을 다시 만드는 대신, 실제 공통 키트로 서비스 흐름을 조립했습니다.',steps:[{id:'examples',cards:[{type:'text',render:examples}]}]});
app.footer.append(node('a',{class:'tk-primary',href:'gallery.html',style:'text-decoration:none'},node('span',{},'35개 모션·부품 살펴보기'),node('span',{class:'tk-go'},icon())));
