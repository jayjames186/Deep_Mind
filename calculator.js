'use strict';
function calculateExpression(source){
 const input=source.replace(/×/g,'*').replace(/[÷]/g,'/').replace(/−/g,'-').replace(/π/g,'pi').trim();
 if(!input)throw Error('Enter a calculation first.');
 if(input.length>250)throw Error('Keep calculations under 250 characters.');
 const tokens=[];let pos=0;
 while(pos<input.length){if(/\s/.test(input[pos])){pos++;continue;}const match=input.slice(pos).match(/^(?:\d*\.\d+|\d+\.?\d*)(?:e[+-]?\d+)?|^(?:sqrt|log|ln|pi|e)\b|^[()+\-*/^%]/i);if(!match)throw Error('Use numbers, operators, parentheses, sqrt, log, or ln.');tokens.push(match[0].toLowerCase());pos+=match[0].length;}
 let at=0;const peek=()=>tokens[at],take=()=>tokens[at++];
 function primary(){const t=take();let value;if(t==='('){value=sum();if(take()!==')')throw Error('Close each parenthesis.');}else if(['sqrt','log','ln'].includes(t)){if(take()!=='(')throw Error('Use parentheses after functions.');const arg=sum();if(take()!==')')throw Error('Close each parenthesis.');if(t==='sqrt'&&arg<0)throw Error('Square roots require a nonnegative number.');if(t!=='sqrt'&&arg<=0)throw Error('Logarithms require a positive number.');value=t==='sqrt'?Math.sqrt(arg):t==='ln'?Math.log(arg):Math.log10(arg);}else if(t==='pi')value=Math.PI;else if(t==='e')value=Math.E;else if(t&&/^(?:\d|\.)/.test(t))value=Number(t);else throw Error('Check the numbers and operators.');while(peek()==='%'){take();value/=100;}return value;}
 function power(){const base=primary();return peek()==='^'?(take(),base**unary()):base;}
 function unary(){if(peek()==='+'){take();return unary();}if(peek()==='-'){take();return -unary();}return power();}
 function product(){let value=unary();while(peek()==='*'||peek()==='/'){const op=take(),right=unary();if(op==='/'&&right===0)throw Error('Cannot divide by zero.');value=op==='*'?value*right:value/right;}return value;}
 function sum(){let value=product();while(peek()==='+'||peek()==='-'){const op=take(),right=product();value=op==='+'?value+right:value-right;}return value;}
 const result=sum();if(at!==tokens.length)throw Error('Use an operator between values, such as 2*(3+4).');if(!Number.isFinite(result))throw Error('This calculation has no finite real result.');return Object.is(result,-0)?0:result;
}
const calculatorInput=document.querySelector('#calculatorInput');
function insertCalculator(value){const start=calculatorInput.selectionStart??calculatorInput.value.length,end=calculatorInput.selectionEnd??start;calculatorInput.setRangeText(value,start,end,'end');calculatorInput.focus();}
document.querySelector('#calculatorKeys').addEventListener('click',e=>{const key=e.target.closest('[data-calc]');if(!key)return;const value=key.dataset.calc;if(value==='clear'){calculatorInput.value='';document.querySelector('#calculatorResult').textContent='Ready';}else if(value==='back'){const start=calculatorInput.selectionStart,end=calculatorInput.selectionEnd;calculatorInput.setRangeText('',start===end?Math.max(0,start-1):start,end,'end');}else insertCalculator(value);calculatorInput.focus();});
document.querySelector('#calculatorForm').addEventListener('submit',e=>{e.preventDefault();const output=document.querySelector('#calculatorResult');try{const result=calculateExpression(calculatorInput.value);output.textContent='= '+Number(result.toPrecision(12)).toString();output.classList.remove('calc-error');}catch(error){output.textContent=error.message;output.classList.add('calc-error');}});
