import {drawCharacter as sharedDrawCharacter,VIEWS,ACTIONS,EXPRESSIONS} from '/character-rig.js';
import {WARDROBE,castDistinctness} from '/director.js';
let drawCharacter=sharedDrawCharacter,rendererRequest=0,rendererModule={};
// "Ricks look" (look:'ricks') draws one of OUR characters with the Ricks Clips puppet: the ricksclips renderer maps its fields.
const rendererProject=c=>c.look==='ricks'?'ricksclips':c.project;
// A chosen face style ('rick' or 'classic') draws with the CURRENT shared rig (templates/bridge), even for a character
// whose finished project keeps its own archived engine; without one, the project's own engine draws it (unchanged).
const rendererUrl=c=>c.look!=='ricks'&&c.faceStyle?'/character-rig.js':'/renderers/'+encodeURIComponent(rendererProject(c))+'/character-rig.js';
// A project renderer that fails to load must never fall back silently to the previous rig (that drew Ricks Clips
// characters as our bean recoloured with their coat): draw the error on the canvas and in the status line instead.
async function useRenderer(character){const request=++rendererRequest;let module;try{module=await import(rendererUrl(character));}catch(e){module={drawCharacter:(g)=>{g.fillStyle='#b3261e';g.font='28px sans-serif';g.textAlign='center';g.fillText('Renderer for "'+character.project+'" failed to load.',300,460);g.fillText('Restart the Character Studio server.',300,500);}};const s=document.getElementById('status');if(s)s.textContent='Renderer for '+character.project+' failed to load: '+e.message;}if(request===rendererRequest){drawCharacter=module.drawCharacter;rendererModule=module;fillMenus(module.ACTIONS??ACTIONS,module.EXPRESSIONS??EXPRESSIONS);labelExpressions();}}
// A project renderer may bring its own actions and expressions (the Ricks Clips motion library: sit/A, kneel/B ...).
function fillMenus(actions,expressions){for(const [id,values] of [['action',actions],['expression',expressions]]){const el=document.getElementById(id),keep=el.value;if(el.options.length===values.length&&[...el.options].every((o,i)=>o.value===values[i]))continue;el.replaceChildren(...values.map(v=>new Option(v,v)));el.value=values.includes(keep)?keep:values[0];}}
const $=id=>document.getElementById(id),params=new URLSearchParams(location.search);let cast=(await fetch('/api/cast').then(r=>r.json())).characters,selected=cast.find(c=>c.id===params.get('character'))||cast[0],time=0,paused=false,rotate=false,atlas=false,previous;
let draft=structuredClone(selected);
for(const [id,values] of [['action',ACTIONS],['expression',EXPRESSIONS]])for(const v of values)$(id).add(new Option(v,v));
for(const [id,values] of [['action',ACTIONS],['expression',EXPRESSIONS]])if(values.includes(params.get(id)))$(id).value=params.get(id);
for(const id of ['yaw','pitch'])if(params.has(id)&&Number.isFinite(Number(params.get(id))))$(id).value=params.get(id);
function cards(){ $('cast').replaceChildren();for(const c of cast){const b=document.createElement('button');b.className=c.id===selected.id?'active':'';const n=document.createElement('span');n.textContent=c.name;const s=document.createElement('small');s.textContent=c.project;b.append(n,s);b.onclick=async()=>{selected=c;draft=structuredClone(c);cards();await useRenderer(c);if(c.look==='ricks')buildFields();};$('cast').append(b);} $('name').value=draft.name;$('project').value=draft.project;$('color').value=draft.jacket;buildFields();$('turnaround').href='/turnarounds/'+encodeURIComponent(selected.id)+'.png';}
await useRenderer(selected);

// ---- Wardrobe designer: every WARDROBE option, live on the preview; saving always creates a new ID. ----
const PALETTE=['#c8423b','#e07a3a','#e8b93c','#5fae6a','#2f8f8a','#3d7cc0','#2f3f63','#7b5ac9','#e07a9a','#8a5f45','#3b3a44','#eeeadf'];
function clean(c){const o={...(c.outfit??{})};for(const k of Object.keys(o))if(o[k]===undefined||o[k]===null||o[k]==='')delete o[k];const out={...c,outfit:o};if(!Object.keys(o).length)delete out.outfit;if(!out.accessories?.length)delete out.accessories;if(out.build==='adult')delete out.build;return out;}
function control(label,el,wide=false){const l=document.createElement('label');if(wide)l.className='wide';l.append(label,el);return l;}
function select(values,value,on,names={}){const e=document.createElement('select');for(const v of values)e.add(new Option(names[v]??v,v));e.value=value;e.onchange=()=>on(e.value);return e;}
function color(value,on){const e=document.createElement('input');e.type='color';e.value=value;e.oninput=()=>on(e.value);return e;}
function optional(value,fallback,on){const w=document.createElement('span');w.className='opt';const c=document.createElement('input');c.type='checkbox';c.checked=!!value;const k=color(value||fallback,v=>{if(c.checked)on(v);});k.disabled=!value;c.onchange=()=>{k.disabled=!c.checked;on(c.checked?k.value:undefined);};w.append(c,k);return w;}
const setTop=(k,v)=>{draft[k]=v;refresh();},setOutfit=(k,v)=>{draft.outfit={...(draft.outfit??{}),[k]:v};if(v===undefined)delete draft.outfit[k];refresh();};
const THIS='(this design)';
function refresh(){draft.outfit={...(draft.outfit??{})};if(draft.rc){$('clash').textContent='';return;}/* the distinctness check compares our wardrobe fields only */const same=cast.filter(c=>c.project===draft.project&&c.id!==draft.id&&c.identity!==draft.identity);const r=castDistinctness([...same,{...draft,id:THIS}]);const mine=r.clashes.filter(c=>c.a===THIS||c.b===THIS);$('clash').textContent=mine.length?'Too similar to: '+mine.map(c=>(c.a===THIS?c.b:c.a)+' ('+c.shared.join(', ')+')').join('; '):'Distinct from the rest of this project cast.';}
const setRc=(k,v)=>{const l={...(draft.rcLook??{})};if(v==='auto'||v===undefined)delete l[k];else l[k]=v;draft.rcLook=l;if(!Object.keys(l).length)delete draft.rcLook;refresh();};
async function setLook(v){if(v==='ricks'){draft.look='ricks';delete draft.faceStyle;}else{delete draft.look;delete draft.rcLook;if(v==='project')delete draft.faceStyle;else draft.faceStyle=v==='classic'?'classic':'rick';}await useRenderer(draft);buildFields();}
// Ricks look panel: every part can stay 'auto' (mapped from our fields above) or take any Ricks Clips library item.
function ricksFields(f){const R=rendererModule.RC_OPTIONS;if(!R)return;const l=draft.rcLook??{},head=document.createElement('strong');head.className='wide';head.textContent='Ricks Clips look';head.style.marginTop='8px';f.append(head);
 const rsel=(label,key,values,extra=['auto','none'],names={})=>f.append(control(label,select([...extra,...values],l[key]??'auto',v=>setRc(key,v),{auto:'From the wardrobe',none:'None',...names})));
 rsel('RC hair','hair',R.hair);
 rsel('RC hat / helmet','hat',[...R.hat,...R.helmet]);rsel('Head piece','piece',R.piece);
 const names=Object.fromEntries(R.outfit.map(o=>[o.key,o.group+' · '+o.label]));rsel('Outfit','outfit',R.outfit.map(o=>o.key),['auto','none'],names);
 rsel('Beard','beard',R.beard);rsel('Moustache','stache',R.stache);rsel('Face extra','acc',R.acc);}
// The puppet engine's description of the selected character: its REAL figure values, face category, signature face and
// the props it wears (its own parts included). The panels show these values, never 'auto' / 'own'.
function describe(){try{return typeof draft==='undefined'?undefined:rendererModule.describeCharacter?.(draft);}catch(e){return undefined;}}
const setFig=(k,v)=>{draft.figure={...(draft.figure??{}),[k]:v};refresh();};
function figureFields(f){const F=rendererModule.FIGURE_OPTIONS,D=describe();if(!F||!D)return;const g={...D,...(draft.figure??{})},head=document.createElement('strong');head.className='wide';head.textContent='Figure';head.style.marginTop='8px';f.append(head);
 const fsel=(label,key,values)=>f.append(control(label,select(values.includes(g[key])?values:[g[key],...values],g[key],v=>setFig(key,v))));
 const C=rendererModule.FACE_CATS;if(C){const names=Object.fromEntries(Object.entries(C).map(([k,c])=>[k,c.group+' · '+c.label]));
  f.append(control('Face category',select(Object.keys(C),draft.faceCat??D.faceCat,v=>{draft.faceCat=v;refresh();fillExpressionBucket();},names)));}
 fsel('Body form','form',F.form);fsel('Head shape','headShape',F.headShape);fsel('Head size','headSize',F.size);fsel('Body size','bodySize',F.size);
 fsel('Leg length','legs',F.size);fsel('Limb thickness','limbs',F.size);fsel('Arm length','arms',F.size);}
// Expression menu: name the face 'own' really is (the signature face of a Ricks Clips character, Neutral for ours).
function labelExpressions(){if(fillExpressionBucket())return;const D=describe(),el=$('expression');for(const o of el.options){if(o.value==='own')o.textContent=D?(draft.rc?'Signature face: '+D.signature:'Neutral'):'neutral';if(o.value==='move')o.textContent="Move's acting face";}}
// Puppet characters: the Expression menu is the character's face-category bucket (its emotions + the category's special
// faces), grouped. Returns false when the renderer has no buckets (our 12-angle rig keeps its own list).
function fillExpressionBucket(){let list;try{list=typeof draft==='undefined'?undefined:rendererModule.expressionsFor?.(draft);}catch(e){list=undefined;}if(!list)return false;
 const el=$('expression'),keep=el.value,groups=new Map();for(const x of list){if(!groups.has(x.group))groups.set(x.group,[]);groups.get(x.group).push(x);}
 el.replaceChildren(...[...groups].map(([g,xs])=>{const og=document.createElement('optgroup');og.label=g;og.append(...xs.map(x=>new Option(x.label,x.value)));return og;}));
 el.value=list.some(x=>x.value===keep)?keep:'own';return true;}
// Our wardrobe fields behind a worn prop of ours: unticking clears the field.
function clearWardrobe(id){const o={...(draft.outfit??{})},[,kind,k]=id.split(':');
 if(kind==='hat')delete o.hat;else if(kind==='face'){if(k==='moustache'||k==='moustacheBold'){delete o.moustache;delete o.moustacheStyle;}else if(k==='beard')delete o.beard;else{draft.accessories=(draft.accessories??[]).filter(a=>a!==k);if(k==='glasses'&&['researcher','archivist'].includes(draft.accessory))delete draft.accessory;}}
 else delete o[k];draft.outfit=o;}
// Props (puppet engine): grouped multi-select. Ticked = what the character wears now: its own parts (a Ricks Clips
// character's tail, shield ...; our wardrobe hat, glasses, tie ...) plus added props. Unticking an own part removes it.
function propFields(f){const G=rendererModule.PROP_GROUPS,D=describe();if(!G||!D)return;const wrap=document.createElement('div');wrap.className='wide';const head=document.createElement('strong');head.textContent='Props';wrap.append(head);
 let own=new Set(D.ownParts);const sel=new Set([...own,...(draft.props??[])]),labelOf=Object.fromEntries(G.flatMap(g=>g.props.map(p=>[p.id,g.group+' · '+p.label])));
 const toggle=(id,on)=>{const isOwnPart=id.startsWith('rc:')&&draft.rc&&id.split(':')[1]===String(draft.rc.sheet)&&id.split(':')[2]===draft.rc.name;
  if(on){if(isOwnPart){draft.noParts=(draft.noParts??[]).filter(s=>s!==id.split(':')[3]);if(!draft.noParts.length)delete draft.noParts;}else draft.props=[...new Set([...(draft.props??[]),id])];}
  else{if(own.has(id)){if(isOwnPart)draft.noParts=[...new Set([...(draft.noParts??[]),id.split(':')[3]])];else clearWardrobe(id);}draft.props=(draft.props??[]).filter(p=>p!==id);if(!draft.props.length)delete draft.props;}
  on?sel.add(id):sel.delete(id);own=new Set(describe()?.ownParts??[]);refresh();drawChips();syncBoxes();};
 const chips=document.createElement('div');chips.className='checks';
 const drawChips=()=>{chips.replaceChildren(...[...sel].map(id=>{const b=document.createElement('button');b.type='button';b.textContent=(labelOf[id]??id)+(own.has(id)?' (built in)':'')+' ✕';b.style.padding='4px 8px';b.style.fontSize='12px';b.onclick=()=>toggle(id,false);return b;}));};
 const search=document.createElement('input');search.placeholder='Search props (tail, horns, hat, sword...)';search.style.width='100%';search.style.margin='6px 0';
 const boxes=[];const syncBoxes=()=>{for(const [c,id] of boxes)c.checked=sel.has(id);};
 const lists=G.map(g=>{const d=document.createElement('details');const s=document.createElement('summary');s.textContent=g.group+' props ('+g.props.length+')';d.append(s);const list=document.createElement('div');list.style.maxHeight='220px';list.style.overflow='auto';d.append(list);
  let built=false;const build=()=>{if(built)return;built=true;for(const p of g.props){const l=document.createElement('label');l.className='check';l.dataset.text=(g.group+' '+p.label).toLowerCase();const c=document.createElement('input');c.type='checkbox';c.checked=sel.has(p.id);c.onchange=()=>toggle(p.id,c.checked);boxes.push([c,p.id]);l.append(c,' '+p.label);list.append(l);}};
  d.addEventListener('toggle',()=>{if(d.open)build();});return {d,list,build};});
 search.oninput=()=>{const q=search.value.trim().toLowerCase();for(const L of lists){if(q){L.build();L.d.open=true;}for(const l of L.list.children)l.style.display=!q||l.dataset.text.includes(q)?'':'none';}};
 wrap.append(chips,search,...lists.map(L=>L.d));f.append(wrap);drawChips();}
function buildFields(){const f=$('fields');f.replaceChildren();const o=draft.outfit??{};
 labelExpressions();
 if(draft.rc){f.append(control('Garment colour',color(draft.jacket,v=>setTop('jacket',v))));figureFields(f);propFields(f);refresh();return;}
 if(!draft.rc)f.append(control('Look',select(['project','ours','classic','ricks'],draft.look==='ricks'?'ricks':draft.faceStyle==='classic'?'classic':draft.faceStyle==='rick'?'ours':'project',setLook,{project:'As saved (project engine)',ours:'Ours, Ricks-style face (12 angles)',classic:'Ours, classic face (12 angles)',ricks:'Ricks Clips puppet (moves)'}),true));
 const seed=document.createElement('input');seed.type='number';seed.min=0;seed.value=draft.seed;seed.oninput=()=>setTop('seed',Math.max(0,Math.round(Number(seed.value)||0)));
 f.append(control('Face seed',seed),control('Build',select(WARDROBE.build,draft.build??'adult',v=>setTop('build',v))),
  control('Hair style',select(WARDROBE.hairStyle,draft.hairStyle,v=>setTop('hairStyle',v))),control('Hair colour',color(draft.hair,v=>setTop('hair',v))),
  control('Headwear',select(WARDROBE.hat,o.hat??'hair',v=>setOutfit('hat',v==='hair'?undefined:v),{hair:'none (hair)'})),control('Hat colour',color(o.cap??'#3d4a5c',v=>setOutfit('cap',v))),
  control('Hat trim',optional(o.hatAccent,'#e8c45a',v=>setOutfit('hatAccent',v))),control('Garment',select(WARDROBE.top,o.top??'jacket',v=>setOutfit('top',v==='jacket'?undefined:v))),
  control('Garment colour',color(draft.jacket,v=>setTop('jacket',v))),control('Under-layer',optional(o.shirt,'#eeeadf',v=>setOutfit('shirt',v))),
  control('Pattern',select(WARDROBE.pattern,o.pattern??'none',v=>setOutfit('pattern',v==='none'?undefined:v))),control('Pattern colour',color(o.patternColor??'#eeeadf',v=>setOutfit('patternColor',v))),
  control('Collar',select(WARDROBE.collar,o.collar??'shirt',v=>setOutfit('collar',v==='shirt'?undefined:v))),control('Sleeves',optional(o.sleeves,'#3b3a44',v=>setOutfit('sleeves',v))),
  control('Tie',optional(o.tie,'#c8423b',v=>setOutfit('tie',v))),control('Scarf',optional(o.scarf,'#e8b93c',v=>setOutfit('scarf',v))),
  control('Badge',optional(o.badge,'#e8c45a',v=>setOutfit('badge',v))),control('Apron',optional(o.apron,'#f1ebdd',v=>setOutfit('apron',v))),
  control('Moustache',optional(o.moustache,'#5b3a26',v=>setOutfit('moustache',v))),control('Beard',optional(o.beard,'#5b3a26',v=>setOutfit('beard',v))),
  control('Trousers',color(draft.pants,v=>setTop('pants',v))),control('Shoes',color(draft.boots,v=>setTop('boots',v))));
 const checks=document.createElement('div');checks.className='checks';
 const tick=(text,checked,on)=>{const l=document.createElement('label');l.className='check';const c=document.createElement('input');c.type='checkbox';c.checked=checked;c.onchange=()=>on(c.checked);l.append(c,' '+text);checks.append(l);};
 tick('pocket',!!o.pocket,v=>setOutfit('pocket',v||undefined));tick('lab coat',!!draft.coat,v=>setTop('coat',v));
 for(const a of WARDROBE.accessories)tick(a,(draft.accessories??[]).includes(a),v=>{const s=new Set(draft.accessories??[]);v?s.add(a):s.delete(a);draft.accessories=[...s];refresh();});
 f.append(control('Details & face',checks,true));if(draft.look==='ricks'){figureFields(f);propFields(f);ricksFields(f);}refresh();}
$('revert').onclick=()=>{draft=structuredClone(selected);cards();};
$('randomize').onclick=()=>{const r=a=>a[Math.floor(Math.random()*a.length)];draft=clean({...draft,seed:Math.floor(Math.random()*500),hairStyle:r(WARDROBE.hairStyle),hair:r(['#2a211d','#5b3a26','#a5512f','#d9b45a','#8d8780','#d9d6d0']),jacket:r(PALETTE),pants:r(['#2b3448','#3d3f48','#566069','#4a4058']),
 outfit:{hat:r([undefined,undefined,...WARDROBE.hat.slice(1)]),cap:r(PALETTE),top:r(WARDROBE.top),pattern:r(['none','none',...WARDROBE.pattern.slice(1)]),patternColor:'#eeeadf',collar:r(WARDROBE.collar),tie:Math.random()<.3?r(PALETTE):undefined,scarf:Math.random()<.2?r(PALETTE):undefined}});draft.outfit??={};buildFields();};
const slug=v=>String(v).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40)||'character';
$('save').onclick=async()=>{try{const name=$('name').value.trim()||draft.name,project=slug($('project').value||draft.project);let id=slug(project+'-'+name),n=2;while(cast.some(c=>c.id===id))id=slug(project+'-'+name)+'-'+n++;
 await persist(clean({...draft,id,name,project,identity:draft.identity||id}));}catch(e){$('status').textContent=e.message;}};

cards();const views=VIEWS.map(yaw=>{const f=document.createElement('figure'),c=document.createElement('canvas'),cap=document.createElement('figcaption');c.width=300;c.height=500;cap.textContent=`${yaw}° · ${yaw===0?'front':yaw===90?'right':yaw===180?'back':yaw===270?'left':'three quarter'}`;f.append(c,cap);$('atlas').append(f);return {c,yaw};});
let previousExpression=$('expression').value,fromExpression=previousExpression,reactionStarted;
$('expression').addEventListener('change',()=>{fromExpression=previousExpression;previousExpression=$('expression').value;reactionStarted=time;});
function mode(value){atlas=value;$('hero').style.display=value?'none':'block';$('atlas').style.display=value?'grid':'none';$('single').classList.toggle('active',!value);$('sheet').classList.toggle('active',value);}
$('single').onclick=()=>mode(false);$('sheet').onclick=()=>mode(true);
$('play').onclick=()=>{paused=!paused;$('play').textContent=paused?'Play':'Pause';};$('turn').onclick=()=>{rotate=!rotate;$('turn').classList.toggle('active',rotate);};
$('top').onclick=()=>{$('pitch').value=90;mode(false);};$('bottom').onclick=()=>{$('pitch').value=-90;mode(false);};
$('time').oninput=()=>{time=Number($('time').value);paused=true;$('play').textContent='Play';};
function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);}
$('export').onclick=()=>download(new Blob([JSON.stringify({schemaVersion:1,characters:[selected]},null,2)],{type:'application/json'}),selected.id+'.json');
$('png').onclick=()=>{if(!atlas)$('hero').toBlob(b=>download(b,selected.id+'.png'));else{const c=document.createElement('canvas');c.width=1200;c.height=1500;const g=c.getContext('2d');views.forEach(({c:im},i)=>g.drawImage(im,i%4*300,Math.floor(i/4)*500));c.toBlob(b=>download(b,selected.id+'-12-views.png'));}};
async function persist(c){const r=await fetch('/api/characters',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(c)});const data=await r.json();if(!r.ok)throw Error(data.error);cast=data.characters;selected=cast.find(x=>x.id===c.id);draft=structuredClone(selected);await useRenderer(selected);cards();$('status').textContent='Saved to project character references.';}

$('library').onclick=()=>$('import').click();$('import').onchange=async()=>{try{const data=JSON.parse(await $('import').files[0].text());for(const c of data.characters)await persist(c);}catch(e){$('status').textContent=e.message;}};
function render(now){const dt=previous?Math.min(.05,(now-previous)/1000):0;previous=now;if(!paused)time+=dt;if(rotate&&!paused)$('yaw').value=(Number($('yaw').value)+dt*30)%360;
 const yaw=Number($('yaw').value),pitch=Number($('pitch').value),pose={time,yaw,pitch,action:$('action').value,expression:$('expression').value,micro:$('micro').checked,fromExpression,expressionAge:reactionStarted===undefined?undefined:paused?1:Math.max(0,time-reactionStarted),light:$('light').value===''?undefined:Number($('light').value)};
 $('yawLabel').textContent=yaw+'°';$('pitchLabel').textContent=pitch+'°';$('clock').textContent=time.toFixed(2)+' s';$('time').value=time%12;
 for(const {c,yaw:v} of atlas?views:[{c:$('hero'),yaw}]){const g=c.getContext('2d');g.setTransform(c.width/600,0,0,c.height/1000,0,0);g.clearRect(0,0,600,1000);drawCharacter(g,draft,{...pose,yaw:v});}
 window.studioState={selected:selected.id,time,pose,atlas};requestAnimationFrame(render);
}window.studioReady=true;requestAnimationFrame(render);
