"""Extract vetted static SVG assets without loading the original application.
Exact paths are kept; sample geometry is explicitly separate from reusable UI.
"""
from pathlib import Path
import re,json,hashlib
ROOT=Path(__file__).resolve().parents[2];KIT=ROOT/'ui-kit';WEB=ROOT/'web'
text=(WEB/'index.html').read_text();pay=(WEB/'pay/app.js').read_text()
block=re.search(r'const IC = \{(.*?)\n\};',text,re.S).group(1)
icons=dict(re.findall(r"(\w+):\s*'([^']+)'",block))
payblock=pay.split('const icon = name =>',1)[1].split('})[name]',1)[0]
payicons=dict(re.findall(r"(\w+):\s*'([^']+)'",payblock))
status=re.findall(r'<svg.*?</svg>',text.split('<div class="sb"',1)[1].split('</span></div>',1)[0],re.S)
logo=re.search(r'const LOGO_MARK = `(.*?)`;',text,re.S).group(1)
roads=re.search(r'const ROADS = (\[.*?\n\]);',text,re.S).group(1)
park=re.search(r'const PARK = (\[.*?\]);',text,re.S).group(1)
assets={'icons':icons,'paymentIcons':payicons,'statusIcons':dict(zip(['signal','wifi','battery'],status)),'logoMark':logo,'logo':(WEB/'logo.svg').read_text(),'favicon':(WEB/'favicon.svg').read_text()}
(KIT/'original-assets.js').write_text('/** Generated from original TripFit SVG assets. Original author attribution required.\n * No new license is granted; see SOURCE_AUDIT.md. */\nexport const ORIGINAL_ASSETS = '+json.dumps(assets,ensure_ascii=False,indent=2)+';\nexport const SAMPLE_ROADS = '+roads+';\nexport const SAMPLE_PARK = '+park+';\n')
files=['index.html','details.css','pay/app.js','pay/styles.css','logo.svg','favicon.svg','og.png']
inventory={'sourceRef':'cb7c7bdb9808f19e463290d566c4a1551cf62b97','sources':{},'counts':{'icons':len(icons),'paymentIcons':len(payicons),'statusIcons':len(status)},'keyframes':[],'animationSites':[]}
for rel in files:
 data=(WEB/rel).read_bytes();inventory['sources']['web/'+rel]={'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data)}
 if rel.endswith(('.html','.css','.js')):
  for n,line in enumerate(data.decode().splitlines(),1):
   for match in re.finditer(r'@keyframes\s+([\w-]+)',line):inventory['keyframes'].append({'file':'web/'+rel,'line':n,'name':match.group(1)})
   if '.animate(' in line:inventory['animationSites'].append({'file':'web/'+rel,'line':n,'code':line.strip()[:240]})
(KIT/'source-inventory.json').write_text(json.dumps(inventory,ensure_ascii=False,indent=2))
assert (len(icons),len(payicons),len(status))==(15,8,3),'Original asset shape changed; review extraction'
print('Extracted',inventory['counts'])
