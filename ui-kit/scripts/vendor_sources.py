"""Reproducible, hash-checked third-party snapshots. Run during development/CI,
not in the browser. Existing committed files need no network to execute.
"""
from pathlib import Path
import hashlib,json,urllib.request
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'vendor';OUT.mkdir(exist_ok=True)
SOURCES=[
 ('tabbable','focus-trap/tabbable','52b066375035abc647d76a30b83baced42119bb4','src/index.js','7916bab03547fc5e511deeb436ee19ab2889e48c01802d4f7592f6ddabdf9397','8e714750725e75c8b31172ef84c0805f94873f86e3b5cfca8a948553f0778fa1'),
 ('qrcode','davidshimjs/qrcodejs','04f46c6a0708418cb7b96fc563eacae0fbf77674','qrcode.js','3ee72de9f69c668f9567363a9358df955960bae9000d9ebd66414670f88e8735','aaa1f349028a59432eb00222b8ddfe4d2ccebdce04cf8348dcb8d41b7068107b'),
 ('raf-schd','alexreardon/raf-schd','v4.0.3','src/index.js','0f71f85074744af0abcca5d2d6cbaa6662d6daddf9cfc261945cbccb1ef22453','38ff7cd93bdf484156099500e01fa2d2b463477e189dc516250af4c9652e744f')
]
def fetch(repo,ref,path,expected):
 url=f'https://raw.githubusercontent.com/{repo}/{ref}/{path}'
 with urllib.request.urlopen(url,timeout=30) as response:data=response.read()
 actual=hashlib.sha256(data).hexdigest()
 if actual!=expected:raise RuntimeError('Unexpected upstream bytes: '+url+' '+actual)
 return data.decode('utf-8'),url
manifest=[]
for name,repo,ref,path,expected,license_hash in SOURCES:
 source,url=fetch(repo,ref,path,expected);license_text,license_url=fetch(repo,ref,'LICENSE',license_hash)
 (OUT/(name+'.LICENSE.txt')).write_text(license_text)
 if name!='raf-schd':
  bundled='/*\n'+license_text.replace('*/','* /')+'\nPinned upstream: '+url+'\n*/\n'+source
  if name=='qrcode':bundled+='\nexport { QRCode };\n'
  (OUT/(name+'.js')).write_text(bundled)
 # raf-schd.js is a separately reviewed JS adaptation; keep the authored file.
 manifest.append({'name':name,'repository':repo,'ref':ref,'source':url,'source_sha256':expected,'license':license_url,'license_sha256':license_hash,'local_sha256':hashlib.sha256((OUT/(name+'.js')).read_bytes()).hexdigest(),'changes':'Flow types removed; named export; explicit null check' if name=='raf-schd' else 'Full license prepended'+('; ES module export added' if name=='qrcode' else '')})
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2))
print('Verified and stored',len(SOURCES),'upstream sources')
