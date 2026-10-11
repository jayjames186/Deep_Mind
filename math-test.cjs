const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements=new Map();
function $(id){if(!elements.has(id))elements.set(id,{value:'',hidden:true,textContent:'',innerHTML:'',className:'',addEventListener(){},focus(){},select(){},querySelector(){return {};}});return elements.get(id);}
const ctx=vm.createContext({$,show(){},renderCalculator(){return '<section class="inline-calculator">Calculator</section>';},bindCalculator(){},esc:s=>String(s),console});
vm.runInContext(fs.readFileSync(__dirname+'/math.js','utf8'),ctx);
vm.runInContext(fs.readFileSync(__dirname+'/algebra2.js','utf8'),ctx);
const run=s=>vm.runInContext(s,ctx);
for(const topic of ['foundations','linear','both','brackets'])for(const difficulty of ['beginner','challenge'])for(let i=0;i<300;i++){
  const p=run(`createAlgebraProblem('${topic}','${difficulty}')`);
  assert.equal(p.lhs(p.answer),p.rhs);
  assert.ok(p.steps.at(-1).includes(String(p.answer)));
  assert.equal(p.hints.length,2);
  if(difficulty==='beginner')assert.ok(p.answer>0);
}
for(const [input,answer] of [['x = −3',-3],['-6/2',-3],['.5',.5],['2.0',2],['0',0]]){ctx.input=input;assert.equal(run('parseMathAnswer(input)'),answer);}
for(const input of ['1/0','2+2','','Infinity','hello','2x']){ctx.input=input;assert.ok(Number.isNaN(run('parseMathAnswer(input)')));}
function start(){run("mathSession={topic:'linear',difficulty:'beginner',number:0,correct:0,assisted:0,previous:''};nextMathProblem()");}
start();run("$('#mathAnswer').value=String(mathSession.problem.answer+1);checkMathAnswer({preventDefault(){}})");assert.equal(run('mathSession.finished'),false);
run("$('#mathAnswer').value=String(mathSession.problem.answer);checkMathAnswer({preventDefault(){}});checkMathAnswer({preventDefault(){}})");assert.equal(run('mathSession.correct'),1);
start();run("revealMathHint();$('#mathAnswer').value=String(mathSession.problem.answer);checkMathAnswer({preventDefault(){}})");assert.equal(run('mathSession.assisted'),1);assert.equal(run('mathSession.correct'),0);
start();run('revealMathSolution();revealMathSolution()');assert.equal(run('mathSession.assisted'),1);
for(let i=1;i<10;i++)run('nextMathProblem();revealMathSolution()');run('nextMathProblem()');assert.equal(run('mathSession.number'),10);assert.ok($('#math').innerHTML.includes('SESSION COMPLETE'));
console.log('Passed: 2,400 generated equations, answer parsing, retry flow, hint scoring, solution scoring, duplicate-submit handling, 10-problem completion.');

for(const topic of ['quadratics','exponentials','logarithms','radicals'])for(const difficulty of ['beginner','challenge'])for(let i=0;i<300;i++){const p=run(`createAlgebra2Problem('${topic}','${difficulty}')`);for(const answer of [].concat(p.answer))assert.ok(Math.abs(p.lhs(answer)-p.rhs)<1e-8);}
assert.ok(run("mathAnswerMatches('3, 2',[2,3])"));
assert.ok(!run("mathAnswerMatches('2',[2,3])"));
assert.ok(!run("mathAnswerMatches('2, 2',[2,3])"));
assert.ok(!run("mathAnswerMatches('hello, 3',[2,3])"));
run("mathSubject='algebra2'; mathSession={topic:'quadratics',difficulty:'challenge',number:0,correct:0,assisted:0,previous:''};nextMathProblem();$('#mathAnswer').value=mathSession.problem.answer.join(',');checkMathAnswer({preventDefault(){}})");
assert.equal(run('mathSession.correct'),1);
console.log('Passed: 2,400 Algebra 2 equations, both-root validation, Algebra 2 rendering and scoring.');

run('renderMathProblem()');assert.ok($('#math').innerHTML.includes('math-notepad'));assert.ok($('#math').innerHTML.includes('inline-calculator'));assert.ok(!$('#math').innerHTML.includes('THINKING SPACE'));run("mathNotesDraft='My working';nextMathProblem()");assert.ok($('#math').innerHTML.includes('My working'));console.log('Passed: inline notepad/calculator placement and notes retained between problems.');


assert.equal(run("normalizeToolSize(null,'width')"),100);assert.equal(run("normalizeToolSize(500,'width')"),400);assert.equal(run("normalizeToolSize(500,'height')"),400);assert.equal(run("normalizeToolSize(0,'height')"),70);
const prefs=new Map();ctx.localStorage={getItem:key=>prefs.has(key)?prefs.get(key):null,setItem:(key,value)=>prefs.set(key,value)};$('#mathTools').style={setProperty(key,value){this[key]=value;}};$('#toolwidth').setAttribute=()=>{};$('#toolheight').setAttribute=()=>{};
run("updateToolSize('width',80);updateToolSize('height',130)");assert.equal($('#mathTools').style['--tool-width'],'0.8');assert.equal($('#mathTools').style['--tool-height'],'1.3');assert.equal(run("loadToolSize('width')"),80);assert.equal(run("loadToolSize('height')"),130);run("updateToolSize('width',90)");assert.equal(run('mathToolSizes.height'),130);run('renderMathProblem()');assert.ok($('#math').innerHTML.includes('value="130"'));assert.ok($('#math').innerHTML.includes('value="90"'));$('#toolSizeControl').open=true;$('#closeToolSize').onclick();assert.equal($('#toolSizeControl').open,false);prefs.clear();prefs.set('deep-mind:math-tool-size','85');assert.equal(run("loadToolSize('width')"),85);assert.equal(run("loadToolSize('height')"),85);console.log('Passed: independent width/height, persistence, legacy preference migration, and compact UI.');

ctx.localStorage={getItem:key=>prefs.has(key)?prefs.get(key):null,setItem:(key,value)=>prefs.set(key,value)};run("updateToolSize('width',400);updateToolSize('height',400)");assert.equal(run("loadToolSize('width')"),400);assert.equal(run("loadToolSize('height')"),400);assert.equal($('#mathTools').style['--tool-width'],'4');assert.equal($('#mathTools').style['--tool-height'],'4');run('renderMathProblem()');assert.equal(($('#math').innerHTML.match(/max="400"/g)||[]).length,2);console.log('Passed: both sliders reach and persist 400%.');
