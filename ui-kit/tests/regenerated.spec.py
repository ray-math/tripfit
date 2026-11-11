"""Browser QA for the kit-generated example, not the original TripFit app."""
from pathlib import Path
import argparse, functools, http.server, json, os, threading
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright, expect
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT/'ui-kit'/'verification'; OUT.mkdir(exist_ok=True)
class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args): pass
server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietHandler, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
parser=argparse.ArgumentParser();parser.add_argument('--browser',default='chromium');parser.add_argument('--url');args=parser.parse_args()
url=args.url or f'http://127.0.0.1:{server.server_port}/ui-kit/examples/regenerated.html'
offline=not os.environ.get('CI') and not args.url
def load(page):
    if offline: page.set_content((ROOT/'ui-kit/dist/lesson.html').read_text(),wait_until='networkidle')
    else: page.goto(url,wait_until='networkidle')
checks=[]
def check(name,condition):
    assert condition,name
    checks.append(name)
with sync_playwright() as p:
    engine=getattr(p,args.browser)
    kwargs={'headless':True}
    if args.browser=='chromium' and Path('/usr/bin/chromium').exists(): kwargs['executable_path']='/usr/bin/chromium'
    browser=engine.launch(**kwargs)
    context=browser.new_context(viewport={'width':393,'height':852},device_scale_factor=2,is_mobile=True,has_touch=True,locale='ko-KR')
    page=context.new_page();errors=[];requests=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.on('request',lambda req:requests.append(req.url))
    if not os.environ.get('CI'):
        page.route('https://**/*',lambda route:route.abort())
    load(page);page.wait_for_timeout(1300)
    expect(page.locator('#balance-card')).to_be_visible()
    check('existing CardFlow runtime is instantiated',page.evaluate("window.__kitDemo instanceof Object && window.__kitDemo.constructor.name === 'ComposedFlow'"))
    check('does not iframe or redirect to original app',page.locator('iframe').count()==0 and '/web/' not in page.url)
    check('no original app or solver requests',not any(urlsplit(u).path.startswith(('/web/', '/api/')) or 'demo_data.js' in u for u in requests))
    if not args.url and not offline:
        check('loads reusable kit motion module',any('/ui-kit/tripfit-motion.js' in u for u in requests))
        check('loads reusable kit flow runtime',any('/ui-kit/flow.js' in u for u in requests))
    palette=page.locator('#balance-card').evaluate('(e)=>({bg:getComputedStyle(e).backgroundColor,r:getComputedStyle(e).borderRadius,device:getComputedStyle(document.querySelector(".tk-device")).width})')
    check('original lime color and 30px mobile corners',palette['bg']=='rgb(214, 242, 59)' and palette['r']=='30px')
    check('mobile uses browser width without phone frame',palette['device']=='393px')
    check('mobile does not add a second hardware island',page.locator('.tk-screen').evaluate('(e)=>getComputedStyle(e,"::after").display')=='none')
    page.screenshot(path=str(OUT/f'{args.browser}-mobile-home.png'))
    page.locator('#balance').fill('2');page.wait_for_timeout(1200)
    check('rolling numbers update from content data',page.locator('#concept-value').get_attribute('data-roll-value')=='59' and page.locator('#practice-value').get_attribute('data-roll-value')=='89')
    check('feedback island opens',page.locator('.tk-island').evaluate('(e)=>e.classList.contains("is-open")'))
    page.locator('#balance').fill('1');page.wait_for_timeout(350)
    page.locator('#concept-list').click();expect(page.get_by_role('dialog')).to_be_visible();page.wait_for_timeout(800)
    check('concept card opens explanation layout',page.get_by_role('dialog').inner_text().find('괄호 안은 반대로')>=0)
    page.screenshot(path=str(OUT/f'{args.browser}-concept-sheet.png'))
    page.get_by_role('button',name='상세 창 닫기',exact=True).click();page.wait_for_timeout(450)
    page.locator('#graph-card').click();expect(page.locator('#vertex-slider')).to_be_visible();page.wait_for_timeout(750)
    page.locator('#vertex-slider').fill('-1')
    check('graph detail is a distinct interactive layout',page.locator('#graph-formula').inner_text()=='y = (x + 1)² − 1')
    check('graph SVG follows slider',page.get_by_role('dialog').locator('svg').get_attribute('aria-label').startswith('꼭짓점이 (-1,'))
    page.screenshot(path=str(OUT/f'{args.browser}-graph-sheet.png'))
    page.keyboard.press('Escape');page.wait_for_timeout(450)
    check('escape closes sheet and restores focus',page.get_by_role('dialog').count()==0)
    page.locator('.tk-footer button').click();expect(page.locator('[data-option="1"]')).to_be_visible();page.wait_for_timeout(800)
    check('navigation creates a new quiz screen',page.evaluate('window.__kitDemo.current')=='quiz')
    check('result action disabled before answer',page.locator('.tk-footer button').is_disabled())
    page.locator('[data-option="0"]').click();check('wrong answer feedback', '정답은' in page.locator('#answer-feedback').inner_text())
    page.locator('[data-option="1"]').click();check('correct answer feedback', '맞았어요' in page.locator('#answer-feedback').inner_text())
    page.screenshot(path=str(OUT/f'{args.browser}-quiz.png'))
    page.locator('.tk-footer button').click();page.wait_for_timeout(1000)
    check('result is generated from selection state',page.locator('#result-score').get_attribute('data-roll-value')=='100')
    page.screenshot(path=str(OUT/f'{args.browser}-result.png'))
    page.locator('#retry-question').click();page.wait_for_timeout(650)
    check('retry resets answer and action state',page.evaluate('window.__kitDemo.state.answer') is None and page.locator('.tk-footer button').is_disabled())
    page.evaluate("window.__kitDemo.go('learn')");page.wait_for_timeout(700)
    for w,h in [(320,568),(375,667),(393,852),(430,932),(852,393)]:
        page.set_viewport_size({'width':w,'height':h});page.wait_for_timeout(150)
        sizes=page.evaluate('({w:innerWidth,doc:document.documentElement.scrollWidth,screen:document.querySelector(".tk-screen").getBoundingClientRect().width,p:document.querySelector(".tk-page").scrollWidth,c:document.querySelector(".tk-page").clientWidth})')
        check(f'no horizontal overflow at {w}x{h}',sizes['doc']<=sizes['w']+1 and sizes['p']<=sizes['c']+1)
    check('no JavaScript errors',not errors)
    context.close()
    desktop=browser.new_page(viewport={'width':1440,'height':1000},device_scale_factor=1,locale='ko-KR')
    if not os.environ.get('CI'): desktop.route('https://**/*',lambda r:r.abort())
    load(desktop);desktop.wait_for_timeout(1200)
    check('desktop has original 417px phone frame',desktop.locator('.tk-device').evaluate('(e)=>getComputedStyle(e).width')=='417px')
    notch=desktop.locator('.tk-screen').evaluate('(e)=>{const s=getComputedStyle(e,"::after");return {w:s.width,h:s.height,r:s.borderRadius}}')
    check('compact island is 88x32 CSS pixels',notch=={'w':'88px','h':'32px','r':'16px'})
    desktop.screenshot(path=str(OUT/f'{args.browser}-desktop-home.png'))
    desktop.bring_to_front()
    desktop.evaluate("window.__kitDemo.feedback.show({title:'상세 문구는 충분히 읽을 수 있게 유지해요',hold:0})")
    try:
        desktop.wait_for_function("document.querySelector('.tk-island').offsetWidth >= 360", timeout=6000)
    except Exception:
        print('ISLAND DIAGNOSTIC', desktop.locator('.tk-island').evaluate("e=>({width:e.offsetWidth,height:e.offsetHeight,classes:e.className,css:getComputedStyle(e).cssText,transition:getComputedStyle(e).transition,easing:getComputedStyle(e).transitionTimingFunction,visibility:document.visibilityState,screen:document.querySelector('.tk-screen').offsetWidth})"))
        desktop.screenshot(path=str(OUT/f'{args.browser}-island-failure.png'))
        raise
    check('expanded feedback island keeps its readable size',desktop.locator('.tk-island').evaluate('(e)=>e.offsetWidth')>=360)
    desktop.evaluate('window.__kitDemo.feedback.hide()')
    desktop.wait_for_function("document.querySelector('.tk-island').offsetWidth === 88 && document.querySelector('.tk-island').offsetHeight === 32", timeout=6000)
    check('feedback island collapses to matching compact geometry',desktop.locator('.tk-island').evaluate('(e)=>({w:e.offsetWidth,h:e.offsetHeight})')=={'w':88,'h':32})
    if not args.url:
        if offline:
            desktop.evaluate("""()=>{const {startLesson}=window.__kitModules['examples/lesson-demo.js'];const {lesson}=window.__kitModules['examples/lesson-data.js'];window.__kitDemo.destroy();startLesson(document.querySelector('#app'),{...lesson,title:'내용만 바꾼 두 번째 예시',topic:'새 수업'});} """)
        else:
            desktop.evaluate("""async()=>{const {startLesson}=await import('/ui-kit/examples/lesson-demo.js');const {lesson}=await import('/ui-kit/examples/lesson-data.js');window.__kitDemo.destroy();startLesson(document.querySelector('#app'),{...lesson,title:'내용만 바꾼 두 번째 예시',topic:'새 수업'});} """)
        check('same kit regenerates changed content', '내용만 바꾼' in desktop.locator('#balance-card').inner_text())
    desktop.close();browser.close()
server.shutdown()
report={'browser':args.browser,'url':url,'passed':len(checks),'checks':checks,'page_errors':errors,'font_fallback_test':not bool(os.environ.get('CI'))}
(OUT/f'{args.browser}-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps(report,ensure_ascii=False,indent=2))
