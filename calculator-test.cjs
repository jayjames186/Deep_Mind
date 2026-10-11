const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context=vm.createContext({document:{querySelector(){return {addEventListener(){}}}}});
vm.runInContext(fs.readFileSync(__dirname+'/calculator.js','utf8'),context);
const calc=source=>{context.source=source;return vm.runInContext('calculateExpression(source)',context);};
for(const [s,expected] of [['6+2*3',12],['(6+2)*3',24],['6×8+3',51],['2^3^2',512],['-2^2',-4],['2^-2',.25],['sqrt(81)',9],['log(100)',2],['ln(e)',1],['50%',.5],['200*10%',20],['.5+.25',.75],['1e3/2',500],['(-3)^2',9]])assert.ok(Math.abs(calc(s)-expected)<1e-10,s);
for(const s of ['', '1/0','sqrt(-1)','log(0)','2(3)','alert(1)','2+','(2+3','2**3','1..2','10^1000'])assert.throws(()=>calc(s),s);
console.log('Passed: calculator precedence, parentheses, negative exponents, functions, percentages, invalid expressions, and division by zero.');
