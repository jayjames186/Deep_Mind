const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements=new Map();
function $(id){if(!elements.has(id))elements.set(id,{value:'',hidden:true,textContent:'',innerHTML:'',className:'',addEventListener(){},focus(){},select(){},querySelector(){return {};}});return elements.get(id);}
const ctx=vm.createContext({$,show(){},esc:s=>String(s),console});
vm.runInContext(fs.readFileSync(__dirname+'/math.js','utf8'),ctx);
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
