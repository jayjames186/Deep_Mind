'use strict';
const algebra2Topics={
 quadratics:{title:'Quadratic equations',description:'Factor a quadratic and find both real solutions.',example:'x² − 5x + 6 = 0'},
 exponentials:{title:'Exponential equations',description:'Rewrite both sides with the same base and compare exponents.',example:'2^(x + 1) = 16'},
 logarithms:{title:'Logarithmic equations',description:'Connect logarithms to exponents and check the domain.',example:'log₂(x − 1) = 3'},
 radicals:{title:'Radical equations',description:'Isolate a square root, square both sides, and verify.',example:'√(x + 5) = 4'}
};
function createAlgebra2Problem(topic,difficulty='beginner'){
 const hard=difficulty==='challenge';let answer,equation,hints,steps,check,lhs,rhs;
 if(topic==='quadratics'){
  const r=randomInt(hard?-9:1,hard?9:6);let t=randomInt(hard?-9:1,hard?9:6);if(t===r)t=r+1;
  const a=hard?randomInt(2,4):1,b=-a*(r+t),c=a*r*t;
  answer=[r,t].sort((x,y)=>x-y);equation=`${a===1?'':a}x² ${signedTerm(b)}x ${signedTerm(c)} = 0`;
  hints=['Look for two numbers whose sum and product match the quadratic after removing any common factor.',`After dividing by ${a}, find two numbers with sum ${-(r+t)} and product ${r*t}.`];
  steps=[`Divide the equation by ${a}: x² ${signedTerm(-(r+t))}x ${signedTerm(r*t)} = 0.`,`Factor: (x ${signedTerm(-r)})(x ${signedTerm(-t)}) = 0.`,`A product is zero when at least one factor is zero.`,`x ${signedTerm(-r)} = 0 or x ${signedTerm(-t)} = 0.`,`x = ${answer.join(' or ')}`];
  lhs=x=>a*x*x+b*x+c;rhs=0;check=`Substitute each root into the original quadratic. Both give 0.`;
 }else if(topic==='exponentials'){
  const base=randomInt(2,hard?5:3),power=randomInt(1,hard?6:4),shift=randomInt(hard?-6:1,6);answer=power-shift;rhs=base**power;equation=`${base}^(x ${signedTerm(shift)}) = ${rhs}`;
  hints=[`Express ${rhs} as a power of ${base}.`,'Equal powers of the same positive base (other than 1) have equal exponents.'];
  steps=[`${rhs} = ${base}^${power}.`,`Match exponents: x ${signedTerm(shift)} = ${power}.`,`Undo the constant: x = ${power} ${signedTerm(-shift)}.`,`x = ${answer}`];lhs=x=>base**(x+shift);check=`With x = ${answer}, the exponent is ${power} and both sides equal ${rhs}.`;
 }else if(topic==='logarithms'){
  const base=randomInt(2,hard?5:3),power=randomInt(1,hard?4:3),shift=randomInt(hard?-8:1,8);answer=base**power-shift;rhs=power;equation=`log base ${base} (x ${signedTerm(shift)}) = ${power}`;
  hints=['A logarithm asks which exponent produces its argument.',`Rewrite as x ${signedTerm(shift)} = ${base}^${power}.`];
  steps=[`Domain: x ${signedTerm(shift)} must be greater than 0.`,`Rewrite in exponential form: x ${signedTerm(shift)} = ${base}^${power} = ${base**power}.`,`Undo the constant: x = ${base**power} ${signedTerm(-shift)}.`,`x = ${answer}. The argument is ${base**power}, which is positive.`];lhs=x=>Math.log(x+shift)/Math.log(base);check=`The argument becomes ${base**power}; its base-${base} logarithm is ${power}.`;
 }else if(topic==='radicals'){
  const shift=randomInt(hard?-12:1,12),offset=hard?randomInt(1,7):0,root=randomInt(1,hard?12:7);answer=root*root-shift;rhs=root+offset;equation=`√(x ${signedTerm(shift)})${offset?' + '+offset:''} = ${rhs}`;
  hints=['Isolate the square root before squaring both sides.',`The isolated root is ${root}. Square both sides, then undo the constant inside the root.`];
  steps=[`Isolate the root: √(x ${signedTerm(shift)}) = ${root}.`,`Square both sides: x ${signedTerm(shift)} = ${root*root}.`,`Solve: x = ${answer}.`,`Check the original equation: √(${root*root})${offset?' + '+offset:''} = ${rhs}.`];lhs=x=>Math.sqrt(x+shift)+offset;check=`Substitution gives ${rhs} on both sides, so the solution is valid.`;
 }else throw Error('Unknown Algebra 2 topic');
 return {topic,answer,equation,hints,steps,check,lhs,rhs};
}
function mathAnswerMatches(input,expected){
 const parts=input.split(/[,;]|\bor\b/i).map(s=>parseMathAnswer(s));
 const values=Array.isArray(expected)?expected:[expected];
 return parts.length===values.length&&parts.every(Number.isFinite)&&[...parts].sort((a,b)=>a-b).every((v,i)=>Math.abs(v-[...values].sort((a,b)=>a-b)[i])<1e-9);
}
