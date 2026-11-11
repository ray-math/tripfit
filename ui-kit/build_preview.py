"""Deterministic bundler for this explicit named-import ES-module graph.
Not a general JS parser. Fonts stay external CSS links; no font bytes copied.
"""
from pathlib import Path
import hashlib,json,re
ROOT=Path(__file__).resolve().parent
STYLES=['theme.css','tripfit-details.css','presentation.css','gallery.css','demo-apps.css','interaction.css']
IMPORT=re.compile(r'^import\s*\{([^}]+)\}\s*from\s*[\'\"]([^\'\"]+)[\'\"];?\s*$',re.M)
def build(entry,template,output):
 modules=[];seen=set();visiting=set()
 def visit(name):
  if name in seen:return
  if name in visiting:raise ValueError('Circular module '+name)
  visiting.add(name);source=(ROOT/name).read_text()
  for m in IMPORT.finditer(source):
   target=((ROOT/name).parent/m.group(2)).resolve().relative_to(ROOT).as_posix();visit(target)
  visiting.remove(name);seen.add(name);modules.append(name)
 visit(entry);manifest={'entry':entry,'modules':{},'styles':{}}
 bundle=['/* Generated from the actual UI kit modules. */','(()=>{const modules={};']
 for name in modules:
  source=(ROOT/name).read_text();manifest['modules'][name]=hashlib.sha256(source.encode()).hexdigest()
  exported=re.findall(r'^export\s+(?:async\s+)?(?:function|class|const|let)\s+(\w+)',source,re.M);aliases=[]
  for m in re.finditer(r'^export\s*\{([^}]+)\};?',source,re.M):
   for item in m.group(1).split(','):
    bits=item.strip().split(' as ')
    if bits[0]:aliases.append((bits[-1],bits[0]))
  source=re.sub(r'^export\s*\{[^}]+\};?','',source,flags=re.M)
  def imp(m):
   key=((ROOT/name).parent/m.group(2)).resolve().relative_to(ROOT).as_posix()
   fields=', '.join(x.strip().replace(' as ',': ') for x in m.group(1).split(','))
   return 'const {'+fields+'}=modules['+json.dumps(key)+'];'
  source=IMPORT.sub(imp,source);source=re.sub(r'^export\s+','',source,flags=re.M)
  if re.search(r'^import\s',source,re.M):raise ValueError('Unsupported import in '+name)
  returns=','.join(exported+[a+':'+b for a,b in aliases])
  bundle+=['modules['+json.dumps(name)+']=(()=>{',source,'return {'+returns+'};})();']
 bundle+=['window.__kitModules=modules;})();'];html=(ROOT/template).read_text()
 for name in STYLES:
  if f'<link rel="stylesheet" href="../{name}">' not in html:continue
  css=(ROOT/name).read_text();manifest['styles'][name]=hashlib.sha256(css.encode()).hexdigest()
  html=html.replace(f'<link rel="stylesheet" href="../{name}">','<style data-kit-source="'+name+'">\n'+css+'\n</style>')
 script='<script type="module" src="./'+Path(entry).name+'"></script>'
 assert script in html
 html=html.replace(script,'<script>\n'+'\n'.join(bundle).replace('</script','<\\/script')+'\n</script>')
 assert '<iframe' not in html and 'location.replace(' not in html
 out=ROOT/'dist';out.mkdir(exist_ok=True);(out/output).write_text(html)
 manifest['output_sha256']=hashlib.sha256(html.encode()).hexdigest()
 (out/(Path(output).stem+'-manifest.json')).write_text(json.dumps(manifest,indent=2))
 if output=='lesson.html':(out/'manifest.json').write_text(json.dumps(manifest,indent=2))
 print(output,len(html.encode()),'bytes;',len(modules),'modules')
if __name__=='__main__':
 build('examples/lesson-demo.js','examples/regenerated.html','lesson.html')
 build('examples/gallery.js','examples/gallery.html','gallery.html')

 build('examples/cafe.js','examples/cafe.html','cafe.html')
 build('examples/event.js','examples/event.html','event.html')
 build('examples/apps.js','examples/apps.html','apps.html')
