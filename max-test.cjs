const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements=new Map();const $=id=>{if(!elements.has(id))elements.set(id,{innerHTML:'',textContent:'',onclick:null,addEventListener(){},querySelectorAll(){return []}});return elements.get(id);};
let exported,view;
const context=vm.createContext({$,esc:String,show:name=>view=name,exportSets:sets=>exported=sets});
vm.runInContext(fs.readFileSync(__dirname+'/max.js','utf8'),context);
const run=s=>vm.runInContext(s,context);
assert.equal(run('maxLessons.length'),6);
for(let i=0;i<6;i++){
  run(`openMaxLesson(${i})`);assert.equal(view,'max');assert.ok($('#max').innerHTML.includes('Autodesk reference'));
  run(`answerMax((maxLessons[${i}].correct+1)%3,{classList:{add(){}},disabled:false})`);assert.ok($('#maxFeedback').textContent.includes('Not quite'));
  run(`answerMax(maxLessons[${i}].correct,{classList:{add(){}},disabled:false})`);assert.ok($('#maxFeedback').textContent.includes('Correct.'));
}
assert.equal(run('maxCompleted.size'),6);
run('renderMax()');$('#maxExport').onclick();assert.equal(exported[0].cards.length,6);assert.ok(exported[0].cards.every(c=>c.front&&c.back.includes('Reference: https://')));
assert.ok($('#max').innerHTML.includes('6 / 6'));
console.log('Passed: six lesson views, incorrect/correct answers, completion tracking, CSV card export content.');
