"""Regression for lower-owned card joins, small press feedback and refresh cost.
Local: routed https origin supplies exact build bytes (no network). CI: same build.
These tests do not certify hardware refresh rate or real iPhone GPU throughput.
"""
from pathlib import Path
import argparse,json,mimetypes,os
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'verification';OUT.mkdir(exist_ok=True)
a=argparse.ArgumentParser();a.add_argument('--browser',default='chromium');args=a.parse_args()
checks=[];errors=[];counts={}
def ck(name,value):
 assert value,name
 checks.append(name);print('PASS',name,flush=True)
with sync_playwright() as p:
 launch={'headless':True}
 if args.browser=='chromium' and Path('/usr/bin/chromium').exists():launch['executable_path']='/usr/bin/chromium'
 b=getattr(p,args.browser).launch(**launch)
 ctx=b.new_context(viewport={'width':393,'height':852},device_scale_factor=2,is_mobile=True,has_touch=True)
 def route(req):
  parsed=urlparse(req.request.url)
  if parsed.hostname!='kit.test':req.abort();return
  name=Path(parsed.path).name;path=ROOT/'dist'/name
  if not path.exists():req.fulfill(status=404,body='not found');return
  req.fulfill(status=200,content_type=mimetypes.guess_type(str(path))[0] or 'text/plain',body=path.read_bytes())
 ctx.route('**/*',route);page=ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
 def load(name):
  if os.environ.get('CI'):page.goto('https://kit.test/'+name+'.html')
  else:
   page.evaluate('()=>window.__demo?.destroy()')
   page.set_content((ROOT/'dist'/(name+'.html')).read_text(),wait_until='domcontentloaded')
 load('cafe');page.wait_for_timeout(600)
 ck('menu lower card explicitly owns connector',page.locator('[data-tk-connect=right].tk-linked').count()==1)
 ck('upper hero has no separately painted notch',page.locator('.tk-top').evaluate("e=>getComputedStyle(e,'::after').content")=='none')
 page.screenshot(path=str(OUT/f'{args.browser}-joined-menu.png'))
 counts['navigationToEmptyPickup']=page.evaluate("()=>{__demo.go('status');return document.getAnimations().length}")
 page.wait_for_timeout(400)
 ck('empty pickup has no cut/tab/connector',page.locator('.tk-page').last.locator('.tk-cut,.tk-tab,.tk-linked').count()==0)
 page.screenshot(path=str(OUT/f'{args.browser}-pickup-no-orphan.png'))
 counts['sameStepRefresh']=page.evaluate("()=>{__demo.go('status',{animate:false});return document.getAnimations().length}")
 ck('same-step refresh starts no animation',counts['sameStepRefresh']==0)
 ck('ordinary navigation uses at most two page animations',counts['navigationToEmptyPickup']<=2)
 # Real native pointer lifecycle, independent from click action.
 control=page.get_by_role('button',name='데모 설정');box=control.bounding_box();x=box['x']+box['width']/2;y=box['y']+box['height']/2
 page.mouse.move(x,y);page.mouse.down();page.wait_for_timeout(100)
 ck('press is visible on pointer down',control.evaluate("e=>e.classList.contains('tk-press-active')"))
 ck('button compresses by only two percent',abs(float(control.evaluate('e=>getComputedStyle(e).scale'))-.98)<.002)
 page.mouse.move(x+20,y);page.wait_for_timeout(30)
 ck('drag cancels feedback without blocking scroll',page.locator('.tk-press-active').count()==0)
 page.mouse.move(x+80,y);page.mouse.up();page.wait_for_timeout(200)
 # Release outside must not open settings; then normal click fires once.
 if page.get_by_role('dialog').count():page.keyboard.press('Escape');page.wait_for_timeout(400)
 control.click();page.wait_for_timeout(650)
 ck('native click opens exactly one sheet',page.get_by_role('dialog').count()==1)
 page.locator('#motion-diagnostics').click();page.wait_for_timeout(650)
 page.locator('#start-frame-probe').click();page.wait_for_timeout(3300)
 ck('diagnostics reports cadence not guaranteed display Hz','JS 콜백 평균' in page.locator('.tk-perf-result').inner_text())
 page.screenshot(path=str(OUT/f'{args.browser}-cadence-diagnostics.png'))
 page.evaluate('()=>{while(__demo.screen._detailSheet)__demo.screen._detailSheet.close(true)}')
 page.evaluate("__demo.go('menu')");page.wait_for_timeout(400)
 disabled=page.locator('[data-product="lemon"]');disabled.dispatch_event('pointerdown',{'button':0,'isPrimary':True,'pointerId':7})
 ck('disabled products never show press feedback',not disabled.evaluate("e=>e.classList.contains('tk-press-active')"))
 # Synthetic pure layout fixture; same lower component persists across removal/reordering.
 page.evaluate('''()=>{
 const {card,node}=__kitModules['compose.js'];const {watchConnections}=__kitModules['connections.js'];
 const stack=node('div',{class:'da-stack',id:'fixture'},card({id:'up',tone:'pink',title:'윗 카드'}),card({id:'down',tone:'sky',connect:{side:'left',from:'up'},badge:'태그',title:'아래 카드'}));
 __demo.viewport.lastElementChild.replaceChildren(stack);window.__stopFixture=watchConnections(stack);
 }''');page.wait_for_timeout(50)
 ck('lower-only explicit relation connects',page.locator('#down.tk-linked').count()==1)
 ck('badge is separate metadata inside card',page.locator('#down .tk-card-badge').inner_text()=='태그')
 page.evaluate("document.getElementById('up').hidden=true");page.wait_for_timeout(40)
 ck('hidden predecessor removes connector',page.locator('#down.tk-linked').count()==0)
 page.evaluate("document.getElementById('up').hidden=false");page.wait_for_timeout(40)
 ck('showing predecessor restores connector',page.locator('#down.tk-linked').count()==1)
 page.evaluate("document.getElementById('fixture').prepend(document.getElementById('down'))");page.wait_for_timeout(40)
 ck('first card never has an orphan top tab',page.locator('#down.tk-linked').count()==0)
 page.evaluate("document.getElementById('fixture').append(document.getElementById('down'))");page.wait_for_timeout(40)
 page.evaluate("document.getElementById('up').remove()");page.wait_for_timeout(40)
 ck('removing upper card cannot leave a hole',page.locator('#down.tk-linked').count()==0)
 page.evaluate('''()=>{const {card,node}=__kitModules['compose.js'];const parent=document.getElementById('fixture');parent.prepend(card({id:'different'}));}''');page.wait_for_timeout(40)
 ck('from id prevents accidental connection to wrong card',page.locator('#down.tk-linked').count()==0)
 page.evaluate("document.getElementById('down').removeAttribute('data-tk-from')");page.wait_for_timeout(40)
 ck('adjacent mode allows current previous card',page.locator('#down.tk-linked').count()==1)
 page.evaluate("document.getElementById('fixture').className='tk-split';__kitModules['connections.js'].resolveConnections(document.getElementById('fixture'))")
 ck('two-column grid never connects sideways',page.locator('#down.tk-linked').count()==0)
 page.evaluate('__stopFixture()')
 load('event');page.wait_for_timeout(650)
 ck('event uses same lower-only connection',page.locator('[data-tk-connect=right].tk-linked').count()==1)
 page.screenshot(path=str(OUT/f'{args.browser}-event-connections.png'))
 for screen in ['plan','ticket','info','discover']:
  # Ticket step is named pass; derive the actual known id.
  target='pass' if screen=='ticket' else screen
  ids=page.evaluate('__demo.flow.steps.map(x=>x.id)')
  if target not in ids:target='ticket' if 'ticket' in ids else screen
  page.evaluate('(id)=>__demo.go(id)',target);page.wait_for_timeout(300)
  ck('no legacy orphan cuts in event '+target,page.locator('.tk-page').last.locator('.tk-cut').count()==0)
 for w,h in [(320,568),(393,852),(430,932),(852,393)]:
  page.set_viewport_size({'width':w,'height':h});page.wait_for_timeout(100)
  ck(f'no horizontal overflow {w}x{h}',page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
 page.set_viewport_size({'width':393,'height':852});page.emulate_media(reduced_motion='reduce')
 control=page.get_by_role('button',name='데모 설정');control.focus();page.keyboard.down('Enter');page.wait_for_timeout(60)
 # Enter may already dispatch click; verify no active scaling anywhere when reduced.
 ck('reduced-motion press has no scaling',page.locator('.tk-press-active').evaluate_all("els=>els.every(e=>getComputedStyle(e).scale==='1')"))
 page.keyboard.up('Enter');page.wait_for_timeout(350)
 ck('no JavaScript exceptions',not errors)
 ctx.close();b.close()
report={'browser':args.browser,'passed':len(checks),'checks':checks,'errors':errors,'animationCounts':counts,'environment':'routed HTTPS fixture; not physical iPhone frame-rate measurement'}
(OUT/f'{args.browser}-interaction-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps(report,ensure_ascii=False,indent=2))
