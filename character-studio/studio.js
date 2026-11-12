import {drawCharacter,VIEWS,ACTIONS,EXPRESSIONS} from '/character-rig.js';
const $=id=>document.getElementById(id),params=new URLSearchParams(location.search);let cast=(await fetch('/api/cast').then(r=>r.json())).characters,selected=cast.find(c=>c.id===params.get('character'))||cast[0],time=0,paused=false,rotate=false,atlas=false,previous;
for(const [id,values] of [['action',ACTIONS],['expression',EXPRESSIONS]])for(const v of values)$(id).add(new Option(v,v));
for(const [id,values] of [['action',ACTIONS],['expression',EXPRESSIONS]])if(values.includes(params.get(id)))$(id).value=params.get(id);
for(const id of ['yaw','pitch'])if(params.has(id)&&Number.isFinite(Number(params.get(id))))$(id).value=params.get(id);
function cards(){ $('cast').replaceChildren();for(const c of cast){const b=document.createElement('button');b.className=c.id===selected.id?'active':'';const n=document.createElement('span');n.textContent=c.name;const s=document.createElement('small');s.textContent=c.project;b.append(n,s);b.onclick=()=>{selected=c;cards();};$('cast').append(b);} $('name').value=selected.name;$('color').value=selected.jacket;$('turnaround').href='/turnarounds/'+encodeURIComponent(selected.id)+'.png';}
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
async function persist(c){const r=await fetch('/api/characters',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(c)});const data=await r.json();if(!r.ok)throw Error(data.error);cast=data.characters;selected=cast.find(x=>x.id===c.id);cards();$('status').textContent='Saved to shared library.';}
$('save').onclick=async()=>{try{await persist({...selected,id:'custom-'+crypto.randomUUID(),name:$('name').value.trim()||selected.name,jacket:$('color').value});}catch(e){$('status').textContent=e.message;}};
$('library').onclick=()=>$('import').click();$('import').onchange=async()=>{try{const data=JSON.parse(await $('import').files[0].text());for(const c of data.characters)await persist(c);}catch(e){$('status').textContent=e.message;}};
function render(now){const dt=previous?Math.min(.05,(now-previous)/1000):0;previous=now;if(!paused)time+=dt;if(rotate&&!paused)$('yaw').value=(Number($('yaw').value)+dt*30)%360;
 const yaw=Number($('yaw').value),pitch=Number($('pitch').value),pose={time,yaw,pitch,action:$('action').value,expression:$('expression').value,micro:$('micro').checked,fromExpression,expressionAge:reactionStarted===undefined?undefined:paused?1:Math.max(0,time-reactionStarted),light:$('light').value===''?undefined:Number($('light').value)};
 $('yawLabel').textContent=yaw+'°';$('pitchLabel').textContent=pitch+'°';$('clock').textContent=time.toFixed(2)+' s';$('time').value=time%12;
 for(const {c,yaw:v} of atlas?views:[{c:$('hero'),yaw}]){const g=c.getContext('2d');g.setTransform(c.width/600,0,0,c.height/1000,0,0);g.clearRect(0,0,600,1000);drawCharacter(g,selected,{...pose,yaw:v});}
 window.studioState={selected:selected.id,time,pose,atlas};requestAnimationFrame(render);
}window.studioReady=true;requestAnimationFrame(render);
