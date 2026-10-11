'use strict';
const $ = s => document.querySelector(s);
const uid = () => crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeImage = s => typeof s === 'string' && /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(s) ? s : '';
const face = (c, side) => `<div>${esc(c[side])}</div>${safeImage(c[side+'Image']) ? `<img src="${c[side+'Image']}" alt="${side === 'front' ? 'Question' : 'Answer'} image">` : ''}`;
let db, sets = [], selected, editing, draft = [], session, toastTimer;
function toast(message){$('#toast').textContent=message;$('#toast').style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').style.display='none',4500);}
function request(req){return new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
async function persist(next){const tx=db.transaction('library','readwrite');const done=new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});tx.objectStore('library').put(next,'sets');await done;sets=next;}
function show(name){$('#mathCalculator').hidden=name!=='math';for(const id of ['library','detail','study','math','max'])$('#'+id).hidden=id!==name;const active=name==='math'?'math':name==='max'?'max':'library';for(const id of ['library','math','max']){const nav=$('#'+id+'Nav');nav.classList.toggle('active',id===active);nav.setAttribute('aria-current',id===active?'page':'false');}window.scrollTo(0,0);}
function renderLibrary(){show('library');$('#setCount').textContent=sets.length;const query=$('#search').value.toLowerCase();const filtered=sets.filter(s=>(s.title+' '+s.description).toLowerCase().includes(query));$('#sets').innerHTML=filtered.map(s=>`<button class="set-card" data-set="${esc(s.id)}"><span class="set-icon">${s.cards.some(c=>c.frontImage||c.backImage)?'▧':'▤'}</span><h3>${esc(s.title)}</h3><p>${esc(s.description || 'A new opportunity to learn something.')}</p><span class="set-meta"><span>${s.cards.length} cards</span><span>Study set ↗</span></span></button>`).join('')||'<div class="empty">No sets here yet. Create a set or import your cards to get started.</div>';}
function renderDetail(){const s=sets.find(s=>s.id===selected);if(!s)return renderLibrary();show('detail');$('#detail').innerHTML=`<button class="back-button" data-action="home">← Your library</button><div class="detail-heading"><div><p class="eyebrow">${s.cards.length} CARDS · YOUR STUDY SET</p><h1>${esc(s.title)}</h1><p>${esc(s.description)}</p></div><div class="actions"><button class="secondary" data-action="edit">Edit set</button><button class="secondary" data-action="export">Export CSV</button><button class="secondary danger" data-action="delete">Delete</button></div></div><div class="actions"><button class="primary" data-action="flash">Study flashcards →</button><button class="secondary" data-action="quiz">Take a quiz</button><label style="margin:0;font-weight:400"><input type="checkbox" id="shuffle"> Shuffle cards</label></div><div class="card-list">${s.cards.map(c=>`<div class="card-row"><div>${face(c,'front')}</div><div>${face(c,'back')}</div></div>`).join('')}</div>`;}
function blank(){return {front:'',back:'',frontImage:'',backImage:''};}
function openEditor(id){editing=id||null;const s=sets.find(s=>s.id===id);draft=s?structuredClone(s.cards):[blank(),blank()];$('#setTitle').value=s?.title||'';$('#setDescription').value=s?.description||'';$('#editorTitle').textContent=s?'Edit study set':'Create a study set';renderEditors();$('#editor').showModal();}
function renderEditors(){$('#cardEditors').innerHTML=draft.map((c,i)=>`<div class="card-editor"><div class="card-top"><span>CARD ${i+1}</span><button type="button" class="text-button danger" data-remove="${i}" aria-label="Remove card ${i+1}">Remove</button></div><div class="card-sides">${['front','back'].map(side=>`<div><label>${side==='front'?'Term / question':'Definition / answer'}<textarea data-index="${i}" data-side="${side}" placeholder="${side==='front'?'What do you want to remember?':'Add the answer…'}">${esc(c[side])}</textarea></label>${safeImage(c[side+'Image'])?`<img src="${c[side+'Image']}" alt="${side} preview"><button class="remove-image" type="button" data-clear="${i}" data-side="${side}">Remove image</button>`:''}<label>Add an image<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" data-image="${i}" data-side="${side}"></label></div>`).join('')}</div></div>`).join('');}
$('#cardEditors').addEventListener('input',e=>{if(e.target.matches('textarea'))draft[+e.target.dataset.index][e.target.dataset.side]=e.target.value;});
$('#cardEditors').addEventListener('click',e=>{const t=e.target;if(t.dataset.remove!==undefined){draft.splice(+t.dataset.remove,1);renderEditors();}if(t.dataset.clear!==undefined){draft[+t.dataset.clear][t.dataset.side+'Image']='';renderEditors();}});
$('#cardEditors').addEventListener('change',async e=>{const t=e.target;if(t.dataset.image===undefined||!t.files[0])return;const file=t.files[0],card=draft[+t.dataset.image],side=t.dataset.side;if(!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type)||file.size>10*1024*1024){t.value='';return toast('Choose a PNG, JPEG, WebP, or GIF under 10 MB.');}try{const result=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});if(!safeImage(result))throw Error();card[side+'Image']=result;renderEditors();}catch{toast('This image could not be loaded.');}});
$('#editForm').addEventListener('submit',async e=>{e.preventDefault();const title=$('#setTitle').value.trim();if(!title)return toast('Give your set a title.');if(!draft.length||draft.some(c=>(!c.front.trim()&&!c.frontImage)||(!c.back.trim()&&!c.backImage)))return toast('Each card needs text or an image on both sides.');const s={id:editing||uid(),title,description:$('#setDescription').value.trim(),cards:structuredClone(draft),updatedAt:Date.now()};try{await persist(editing?sets.map(x=>x.id===editing?s:x):[...sets,s]);$('#editor').close();selected=s.id;renderDetail();toast('Study set saved.');}catch{toast('Could not save. Your browser storage may be full; export a backup.');}});
function download(data,name,type='application/json'){const url=URL.createObjectURL(new Blob([data],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
const csvColumns=['set_id','set_title','set_description','term','definition','term_image','definition_image'];
function setsToCsv(items){const rows=[csvColumns];for(const s of items)for(const c of s.cards)rows.push([s.id,s.title,s.description||'',c.front,c.back,c.frontImage||'',c.backImage||'']);return '\uFEFF'+rows.map(row=>row.map(value=>'"'+String(value??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');}
function exportSets(items){download(setsToCsv(items),`deep-mind-${new Date().toISOString().slice(0,10)}.csv`,'text/csv;charset=utf-8');toast('CSV exported, including your sets and images.');}
function importDelimited(text,name){const rows=parseDelimited(text.replace(/^\uFEFF/,''),/\.tsv$/i.test(name)?'\t':',');if(!rows.length)throw Error('This CSV file has no cards.');const headers=rows[0].map(v=>v.trim().toLowerCase());let imported;
if(headers.includes('set_id')){if(csvColumns.some(c=>!headers.includes(c))||new Set(headers).size!==headers.length)throw Error('The CSV backup is missing required columns or has duplicate headers.');rows.shift();const groups=new Map();const get=(row,key)=>row[headers.indexOf(key)];for(const row of rows){if(row.length!==headers.length)throw Error('A CSV row has a different number of columns from its header.');const id=get(row,'set_id'),title=get(row,'set_title'),description=get(row,'set_description');if(!id.trim())throw Error('Each CSV card needs a set_id.');if(!groups.has(id))groups.set(id,{title,description,cards:[]});const s=groups.get(id);if(s.title!==title||s.description!==description)throw Error('Cards with the same set_id must have matching set details.');s.cards.push({front:get(row,'term'),back:get(row,'definition'),frontImage:get(row,'term_image'),backImage:get(row,'definition_image')});}imported=[...groups.values()];
}else{if(/^(term|front|question)$/i.test(headers[0])&&/^(definition|back|answer)$/i.test(headers[1]||''))rows.shift();if(rows.some(r=>r.length!==2))throw Error('Use two columns (term, definition), or a complete Deep Mind CSV export.');imported=[{title:name.replace(/\.[^.]+$/,''),cards:rows.map(r=>({front:r[0],back:r[1]}))}];}
return {format:'deep-mind',version:1,sets:imported};}
function parseDelimited(text,delimiter){const rows=[];let row=[],field='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else if(!field||quoted)quoted=!quoted;else field+=c;}else if(c===delimiter&&!quoted){row.push(field);field='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field);if(row.some(x=>x.trim()))rows.push(row);row=[];field='';}else field+=c;}if(quoted)throw Error('An imported quoted field is not closed.');row.push(field);if(row.some(x=>x.trim()))rows.push(row);return rows;}
function validateImported(data){if(!data||!['deep-mind','brian-study'].includes(data.format)||data.version!==1||!Array.isArray(data.sets)||!data.sets.length)throw Error('Choose a Deep Mind CSV export or a CSV with term and definition columns.');return data.sets.map(s=>{if(typeof s.title!=='string'||!s.title.trim()||!Array.isArray(s.cards)||!s.cards.length)throw Error('Every imported set must have a title and cards.');return {id:uid(),title:s.title.slice(0,120),description:typeof s.description==='string'?s.description.slice(0,300):'',updatedAt:Date.now(),cards:s.cards.map(c=>{if(!c||typeof c.front!=='string'||typeof c.back!=='string')throw Error('Invalid card format.');for(const side of ['front','back']){if(c[side+'Image']&&!safeImage(c[side+'Image']))throw Error('An imported image is invalid.');if(!c[side].trim()&&!c[side+'Image'])throw Error('Every card needs content on both sides.');}return {front:c.front,back:c.back,frontImage:c.frontImage||'',backImage:c.backImage||''};})};});}
$('#importFile').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>100*1024*1024)throw Error('Please use a backup smaller than 100 MB.');const text=(await file.text()).replace(/^\uFEFF/,'');let data;if(/\.json$/i.test(file.name)){data=JSON.parse(text);}else{data=importDelimited(text,file.name);}const imported=validateImported(data);await persist([...sets,...imported]);renderLibrary();toast(`Imported ${imported.length} study set${imported.length===1?'':'s'}.`);}catch(err){toast(err instanceof SyntaxError?'That JSON file could not be read.':err.message||'Import failed.');}finally{e.target.value='';}});
function shuffled(items){const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
function startStudy(mode){const s=sets.find(s=>s.id===selected);if(!s?.cards.length)return;if(mode==='quiz'&&s.cards.length<2)return toast('Add at least two cards to take a quiz.');session={mode,cards:$('#shuffle')?.checked?shuffled(s.cards):[...s.cards],index:0,flipped:false,score:0,answered:false};show('study');renderStudy();}
function renderStudy(){const q=session,c=q.cards[q.index];if(!c){$('#study').innerHTML=`<button class="back-button" data-action="detail">← Back to set</button><div class="result"><p class="eyebrow">SESSION COMPLETE</p><h1>${q.mode==='quiz'?`${q.score} / ${q.cards.length}`:'Nicely done.'}</h1><p>${q.mode==='quiz'?'Every attempt makes it stick a little more.':`You reviewed all ${q.cards.length} cards. Keep that curiosity going.`}</p><button class="primary" data-action="restart">Study again ↗</button></div>`;return;}q.answered=false;const side=q.flipped?'back':'front';$('#study').innerHTML=`<button class="back-button" data-action="detail">← Back to set</button><div class="study-top"><h2>${q.mode==='quiz'?'Test your knowledge':'One card at a time.'}</h2><span>${q.index+1} / ${q.cards.length}</span></div><div class="progress"><div style="width:${q.index/q.cards.length*100}%"></div></div><${q.mode==='quiz'?'div':'button'} class="flashcard" ${q.mode==='quiz'?'':'data-action="flip" aria-label="Flip flashcard"'}><span class="face-label">${q.mode==='quiz'?'QUESTION':side==='front'?'TERM / QUESTION':'DEFINITION / ANSWER'}</span><div class="flash-face">${face(c,q.mode==='quiz'?'front':side)}</div>${q.mode==='quiz'?'':'<span class="flip-hint">Click to flip · or press Space</span>'}</${q.mode==='quiz'?'div':'button'}>${q.mode==='quiz'?'<div id="options" class="quiz-options"></div><p id="feedback" role="status" style="margin-top:18px"></p><div class="study-controls"><button class="primary" id="nextQuestion" data-action="next" hidden>Continue →</button></div>':`<div class="study-controls"><button class="secondary" data-action="previous" ${q.index===0?'disabled':''}>← Previous</button><button class="secondary" data-action="flip">Flip card</button><button class="primary" data-action="next">${q.index===q.cards.length-1?'Finish':'Next →'}</button></div>`}`;if(q.mode==='quiz'){const key=x=>x.back+'\0'+x.backImage;const unique=[...new Map(q.cards.filter(x=>key(x)!==key(c)).map(x=>[key(x),x])).values()];q.options=shuffled([c,...shuffled(unique).slice(0,3)]);$('#options').innerHTML=q.options.map((x,i)=>`<button class="quiz-option" data-option="${i}">${face(x,'back')}</button>`).join('');}}
document.addEventListener('click',async e=>{const set=e.target.closest('[data-set]');if(set){selected=set.dataset.set;renderDetail();return;}const option=e.target.closest('[data-option]');if(option&&session&&!session.answered){session.answered=true;const correct=session.options[+option.dataset.option]===session.cards[session.index];if(correct)session.score++;document.querySelectorAll('.quiz-option').forEach((b,i)=>{b.disabled=true;if(session.options[i]===session.cards[session.index])b.classList.add('correct');});if(!correct)option.classList.add('wrong');$('#feedback').textContent=correct?'That’s right!':'Keep going — the correct answer is highlighted.';$('#nextQuestion').hidden=false;return;}const action=e.target.closest('[data-action]')?.dataset.action;if(!action)return;if(action==='home')renderLibrary();if(action==='detail')renderDetail();if(action==='edit')openEditor(selected);if(action==='export')exportSets(sets.filter(s=>s.id===selected));if(action==='delete'&&confirm('Delete this study set? Export it first if you want to keep a backup.')){try{await persist(sets.filter(s=>s.id!==selected));renderLibrary();toast('Study set deleted.');}catch{toast('Could not delete this set.');}}if(action==='flash'||action==='quiz')startStudy(action);if(action==='restart')startStudy(session.mode);if(action==='flip'){session.flipped=!session.flipped;renderStudy();}if(action==='next'){session.index++;session.flipped=false;renderStudy();}if(action==='previous'&&session.index>0){session.index--;session.flipped=false;renderStudy();}});
document.addEventListener('keydown',e=>{if($('#study').hidden||$('#editor').open||session?.mode!=='flash'||!session.cards[session.index]||/INPUT|TEXTAREA|BUTTON/.test(e.target.tagName))return;if(e.code==='Space'){e.preventDefault();session.flipped=!session.flipped;renderStudy();}if(e.code==='ArrowRight'){session.index++;session.flipped=false;renderStudy();}if(e.code==='ArrowLeft'&&session.index>0){session.index--;session.flipped=false;renderStudy();}});
$('#newSet').onclick=()=>openEditor();$('#closeEditor').onclick=()=>$('#editor').close();$('#addCard').onclick=()=>{draft.push(blank());renderEditors();$('#cardEditors').lastElementChild.scrollIntoView({behavior:'smooth',block:'center'});};$('#libraryNav').onclick=renderLibrary;$('#search').oninput=renderLibrary;$('#importBtn').onclick=()=>$('#importFile').click();$('#exportBtn').onclick=()=>sets.length?exportSets(sets):toast('Create a study set first.');$('#quickStudy').onclick=()=>{if(!sets.length)return openEditor();selected=sets[0].id;renderDetail();startStudy('flash');};
const spanishPhraseSet = {
  "id": "deep-mind-spanish-phrases-v1",
  "title": "Spanish Phrases — Everyday Conversations",
  "description": "36 common phrases for greetings, polite conversation, getting help, dining, and travel. Spanish on the front; English and usage notes on the back.",
  "cards": [
    {
      "front": "Hola, ¿qué tal?",
      "back": "Hi, how’s it going?",
      "frontImage": "",
      "backImage": ""
    },
    {
      "front": "Buenos días.",
      "back": "Good morning.",
      "frontImage": "",
      "backImage": ""
    },
    {
      "front": "Buenas tardes.",
      "back": "Good afternoon.",
      "frontImage": "",
      "backImage": ""
    },
    {
      "front": "Buenas noches.",
      "back": "Good evening / Good night.",
      "frontImage": "",
      "backImage": ""
    },
    {
      "front": "¿Cómo estás?",
      "back": "How are you? (informal, one person)",
      "frontImage": "",
      "backImage": ""
    },
    {
      "front": "Muy bien, gracias. ¿Y tú?",
      "back": "Very well, thank you. And you? (informal)",
      "frontImage": "",
      "backImage": ""
    },
    {
      "front": "Mucho gusto.",
      "back": "Nice to meet you.",
      "frontImage": "",
      "backImage": ""
    },
    {
      "front": "Me llamo…",
      "back": "My name is…",
      "frontImage": "",
      "backImage": ""
    },
    {
      "front": "¿Cómo te llamas?",
      "back": "What’s your name? (informal)",
      "frontImage": "",
      "backImage": ""
    },
    {
      "front": "Hasta luego.",
      "back": "See you later.",
      "frontImage": "",
      "backImage": ""
    },
    {
      "front": "Nos vemos mañana.",
      "back": "See you tomorrow.",
      "frontImage": "",
      "backImage": ""
    },
    {
      "front": "Por favor.",
      "back": "Please.",
      "frontImage": "",
      "backImage": ""
    },
    {
      "front": "Muchas gracias.",
      "back": "Thank you very much.",
      "frontImage": "",
      "backImage": ""
    },
    {
      "front": "De nada.",
      "back": "You’re welcome.",
      "frontImage": "",
      "backImage": ""
    },
    {
      "front": "Con permiso.",
      "back": "Excuse me. (when passing by or asking to get through)",
      "frontImage": "",
      "backImage": ""
    },
    {
      "front": "Lo siento.",
      "back": "I’m sorry.",
      "frontImage": "",
      "backImage": ""
    },
    {
      "front": "No pasa nada.",
      "back": "It’s okay / No problem.",
      "frontImage": "",
      "backImage": ""
    },
    {
      "front": "No entiendo.",
      "back": "I don’t understand.",
      "frontImage": "",
      "backImage": ""
    },
    {
      "front": "¿Puedes repetirlo, por favor?",
      "back": "Can you repeat that, please? (informal)",
      "frontImage": "",
      "backImage": ""
    },
    {
      "front": "Más despacio, por favor.",
      "back": "More slowly, please.",
      "frontImage": "",
      "backImage": ""
    },
    {
      "front": "¿Habla inglés?",
      "back": "Do you speak English? (formal, one person)",
      "frontImage": "",
      "backImage": ""
    },
    {
      "front": "Estoy aprendiendo español.",
      "back": "I’m learning Spanish.",
      "frontImage": "",
      "backImage": ""
    },
    {
      "front": "¿Qué significa esta palabra?",
      "back": "What does this word mean?",
      "frontImage": "",
      "backImage": ""
    },
    {
      "front": "¿Dónde está el baño?",
      "back": "Where is the bathroom?",
      "frontImage": "",
      "backImage": ""
    },
    {
      "front": "¿Cuánto cuesta?",
      "back": "How much does it cost?",
      "frontImage": "",
      "backImage": ""
    },
    {
      "front": "Quisiera un café, por favor.",
      "back": "I would like a coffee, please.",
      "frontImage": "",
      "backImage": ""
    },
    {
      "front": "La cuenta, por favor.",
      "back": "The bill, please.",
      "frontImage": "",
      "backImage": ""
    },
    {
      "front": "¿Puedo pagar con tarjeta?",
      "back": "Can I pay by card?",
      "frontImage": "",
      "backImage": ""
    },
    {
      "front": "¿Me puede ayudar, por favor?",
      "back": "Can you help me, please? (formal)",
      "frontImage": "",
      "backImage": ""
    },
    {
      "front": "Estoy buscando esta dirección.",
      "back": "I’m looking for this address.",
      "frontImage": "",
      "backImage": ""
    },
    {
      "front": "Tengo hambre.",
      "back": "I’m hungry.",
      "frontImage": "",
      "backImage": ""
    },
    {
      "front": "Tengo sed.",
      "back": "I’m thirsty.",
      "frontImage": "",
      "backImage": ""
    },
    {
      "front": "¿Qué hora es?",
      "back": "What time is it?",
      "frontImage": "",
      "backImage": ""
    },
    {
      "front": "Estoy de acuerdo.",
      "back": "I agree.",
      "frontImage": "",
      "backImage": ""
    },
    {
      "front": "No estoy seguro / segura.",
      "back": "I’m not sure. (seguro: masculine speaker; segura: feminine speaker)",
      "frontImage": "",
      "backImage": ""
    },
    {
      "front": "Que tengas un buen día.",
      "back": "Have a good day. (informal, one person)",
      "frontImage": "",
      "backImage": ""
    }
  ]
};
async function addSpanishPhraseSet(){
  // Save the migration marker and library together. User edits and deletions survive reloads.
  const tx=db.transaction('library','readwrite'), store=tx.objectStore('library');
  const done=new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});
  let next=sets;
  const marker=store.get('seed:spanish-phrases-v1');
  marker.onsuccess=()=>{if(!marker.result){const saved=store.get('sets');saved.onsuccess=()=>{const current=saved.result||[];next=current.some(s=>s.id===spanishPhraseSet.id)?current:[...current,{...spanishPhraseSet,updatedAt:Date.now()}];store.put(next,'sets');store.put(true,'seed:spanish-phrases-v1');};}};
  await done;sets=next;
}
async function init(){try{const req=indexedDB.open('brian-study',1);req.onupgradeneeded=()=>req.result.createObjectStore('library');db=await request(req);const stored=await request(db.transaction('library').objectStore('library').get('sets'));if(stored){sets=stored;}else{const samples=[{title:'The art of learning',description:'Build better habits, one idea at a time.',cards:[['Active recall','Practice retrieving an answer from memory before looking at it.'],['Spaced repetition','Review material over increasing intervals of time.'],['Interleaving','Mix related topics during practice to learn when to apply each idea.'],['Elaboration','Explain an idea in your own words and connect it to what you already know.']]},{title:'A little everyday Spanish',description:'A few words to open up a whole new world.',cards:[['Hola','Hello'],['Gracias','Thank you'],['Por favor','Please'],['Hasta luego','See you later'],['Buenos días','Good morning']]},{title:'Our natural world',description:'A starting point for your next discovery.',cards:[['Photosynthesis','The process by which plants use light energy to make sugars from carbon dioxide and water.'],['Ecosystem','A community of organisms and the physical environment they interact with.'],['Biodiversity','The variety of life in a particular habitat or across Earth.']]}].map(s=>({...s,id:uid(),updatedAt:Date.now(),cards:s.cards.map(([front,back])=>({front,back,frontImage:'',backImage:''}))}));await persist(samples);}await addSpanishPhraseSet();renderLibrary();}catch{$('#sets').innerHTML='<div class="empty">Browser storage is unavailable. Please enable site storage and reload to use your study library.</div>';for(const id of ['newSet','importBtn','exportBtn','quickStudy'])$('#'+id).disabled=true;}}
init();
