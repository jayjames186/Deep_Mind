const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const nodes=new Map(),saved=new Map();
const absent=new Set(['#mathTools','#mathToolsScroll','#toolwidth','#toolheight','#toolwidthValue','#toolheightValue','#toolPosition','#toolPositionValue','#toolSizeStatus']);
function $(id){if(absent.has(id))return null;if(!nodes.has(id))nodes.set(id,{style:{},value:'',textContent:'',innerHTML:'',scrollWidth:900,clientWidth:300,setAttribute(){},addEventListener(){}});return nodes.get(id);}
let page;const ctx=vm.createContext({$,show:id=>page=id,renderMath(){},localStorage:{getItem:k=>saved.get(k)??null,setItem:(k,v)=>saved.set(k,v)}});
for(const file of ['math.js','settings.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+file,'utf8'),ctx);
const run=s=>vm.runInContext(s,ctx);
run('renderSettings()');assert.equal(page,'settings');assert.ok($('#settings').innerHTML.includes('Panel size & position'));
run("updateToolSize('width',-200);updateToolSize('height',200);updateToolPosition(40);syncSettingsPreview()");
assert.equal($('#settingsPreviewPanels').style.width,'50%');assert.equal($('#settingsPreviewPanels').style.height,'280px');assert.equal($('#setting-width').value,-200);assert.equal(run("loadToolSize('width')"),-200);
$('#resetPanelSettings').onclick();assert.equal(run('mathToolSizes.width'),0);assert.equal(run('mathToolSizes.height'),0);assert.equal(run('mathToolPosition'),0);assert.equal($('#settingsPreviewPanels').style.width,'100%');
console.log('Passed: Settings before opening practice, live size preview, persistence, and reset.');
