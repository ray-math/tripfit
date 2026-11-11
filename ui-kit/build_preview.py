"""Deterministically bundle the actual kit modules into a single shareable HTML.
No original web/index.html, solver data, dependency download or font bytes are used.
"""
from pathlib import Path
import hashlib, json, re
ROOT=Path(__file__).resolve().parent
MODULES=['tripfit-motion.js','tripfit-sheet.js','flow.js','compose.js','examples/lesson-data.js','examples/lesson-demo.js']
STYLES=['theme.css','tripfit-details.css','presentation.css']
manifest={'entry':'examples/lesson-demo.js','modules':{},'styles':{}}
bundle=['/* Generated from reusable kit source. Do not edit the generated output. */','(()=>{const modules={};']
for name in MODULES:
    source=(ROOT/name).read_text();manifest['modules'][name]=hashlib.sha256(source.encode()).hexdigest()
    exports=re.findall(r'^export\s+(?:async\s+)?(?:function|class|const|let)\s+(\w+)',source,re.M)
    def replace_import(m):
        imported=m.group(2);key=(ROOT/name).parent/imported;key=key.resolve().relative_to(ROOT.resolve()).as_posix()
        if key not in MODULES[:MODULES.index(name)]:raise ValueError('Module dependency is not ordered: '+key)
        return 'const {'+m.group(1)+'}=modules['+json.dumps(key)+'];'
    source=re.sub(r'^import\s*\{([^}]+)\}\s*from\s*[\'\"]([^\'\"]+)[\'\"];?\s*$',replace_import,source,flags=re.M)
    source=re.sub(r'^export\s+', '', source,flags=re.M)
    if re.search(r'^import\s',source,re.M):raise ValueError('Unsupported import in '+name)
    bundle+=['modules['+json.dumps(name)+']=(()=>{',source,'return {'+','.join(exports)+'};})();']
bundle+=['window.__kitModules=modules;})();']
html=(ROOT/'examples/regenerated.html').read_text()
for name in STYLES:
    css=(ROOT/name).read_text();manifest['styles'][name]=hashlib.sha256(css.encode()).hexdigest()
    html=html.replace(f'<link rel="stylesheet" href="../{name}">','<style data-kit-source="'+name+'">\n'+css+'\n</style>')
html=html.replace('<script type="module" src="./lesson-demo.js"></script>','<script>\n'+'\n'.join(bundle).replace('</script','<\\/script')+'\n</script>')
assert '<iframe' not in html and 'location.replace(' not in html
out=ROOT/'dist';out.mkdir(exist_ok=True)
(out/'lesson.html').write_text(html)
manifest['output_sha256']=hashlib.sha256(html.encode()).hexdigest()
(out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print('Built:',out/'lesson.html','from',len(MODULES),'modules and',len(STYLES),'stylesheets')
