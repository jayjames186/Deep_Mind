const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const nodes=new Map(),saved=new Map();
const getNode=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:'',value:'',style:{},classList:{toggle(){},add(){}},listeners:{},addEventListener(event,fn){this.listeners[event]=fn},setAttribute(){},querySelectorAll(){return []},focus(){}});return nodes.get(id);};
const ctx=vm.createContext({document:{querySelector:getNode,querySelectorAll(){return []},addEventListener(){}},window:{scrollTo(){}},localStorage:{getItem:key=>saved.get(key)??null,setItem:(key,value)=>saved.set(key,value)},crypto:require('node:crypto').webcrypto,setTimeout(){},clearTimeout(){},renderMath(){},renderMax(){},console});
const run=code=>vm.runInContext(code,ctx);
run(fs.readFileSync(__dirname+'/app.js','utf8').replace(/init\(\);\s*$/,''));
for(const file of ['overclock.js','psychology.js'])run(fs.readFileSync(__dirname+'/'+file,'utf8'));
assert.equal(run('psychologyLessons.length'),7);
for(let i=0;i<7;i++){
 run(`openPsychologyLesson(${i})`);assert.ok(getNode('#psychology').innerHTML.includes('TRY THE SCENARIO'));assert.ok(getNode('#psychology').innerHTML.includes('rel="noopener noreferrer"'));
 run(`answerPsychology((psychologyLessons[${i}].correct+1)%3,{classList:{add(){}}})`);assert.equal(run('psychologyAnswered'),false);
 run(`answerPsychology(psychologyLessons[${i}].correct,{classList:{add(){}}})`);assert.equal(run('psychologyAnswered'),true);
 run(`answerPsychology(psychologyLessons[${i}].correct,{classList:{add(){}}})`);
}
assert.equal(run('ocStats().tracks.psychology'),175);assert.equal(run('ocStats().tracks.mind'),0);
run('openPsychologyLesson(0);answerPsychology(psychologyLessons[0].correct,{classList:{add(){}}})');assert.equal(run('ocStats().tracks.psychology'),175);assert.ok(getNode('#psychFeedback').textContent.includes('already been recorded today'));
getNode('#psychReflection').listeners.input({target:{value:'PRIVATE REFLECTION'}});assert.equal(run('psychologyNotes.happiness'),'PRIVATE REFLECTION');
assert.ok(!saved.get('deep-mind:overclock-v1').includes('PRIVATE REFLECTION'));
run('renderPsychology()');assert.ok(getNode('#psychology').innerHTML.includes('7 / 7'));
let exported;ctx.capture=value=>exported=value;run('exportSets=capture');getNode('#psychExport').onclick();assert.equal(exported[0].cards.length,7);assert.ok(!JSON.stringify(exported).includes('PRIVATE REFLECTION'));assert.ok(exported[0].cards.every(c=>c.back.includes('https://')));
run('openPsychologyLesson(0)');assert.ok(getNode('#psychology').innerHTML.includes('PRIVATE REFLECTION'));getNode('#psychClear').onclick();assert.equal(run('psychologyNotes.happiness'),'');
assert.ok(run("psychologyLessons.find(l=>l.id==='expressions').intro.includes('context')")||run("psychologyLessons.find(l=>l.id==='expressions').intro.includes('Context')"));
console.log('Passed: seven sourced lessons, wrong/correct answers, Psychology-only XP, daily deduplication, saved completion, session-only notes, clear notes, and CSV export.');
