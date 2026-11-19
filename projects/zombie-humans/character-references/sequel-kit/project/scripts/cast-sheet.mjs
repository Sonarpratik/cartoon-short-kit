// Cast sheet for approval: each character at 3 angles with a story expression, plus a phone-size lineup.
import {chromium} from 'playwright';
import {writeFile} from 'node:fs/promises';
const out=process.argv[2]||'projects/zombie-shelter/review/cast/cast_v1.png';
const IDS=(process.argv[3]||'').split(',').filter(Boolean),TITLE=process.argv[4]||'Zombie Shelter · cast';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage();await page.goto(process.env.STUDIO_URL||'http://127.0.0.1:8789');
 await page.waitForFunction(()=>window.studioReady,{},{timeout:15000});
 const png=await page.evaluate(async([IDS,TITLE])=>{
  const {characters}=await fetch('/api/cast').then(r=>r.json());
  const cast=IDS.length?IDS.map(id=>characters.find(c=>c.id===id)):characters.filter(c=>c.project==='zombie-shelter');
  const EXPR0={'zs-host':['grin','nervous','shock'],'zs-bitten':['nervous','pained','shock'],'zs-neighbour':['smile','dazed','stern'],
   'zs-zombie-office':['dazed','pained','dazed'],'zs-zombie-worker':['dazed','pained','dazed'],'zs-zombie-hoodie':['dazed','pained','dazed'],'zs-stranger':['stern','smile','stern']};
  const EXPR=new Proxy(EXPR0,{get:(o,k)=>o[k]||(String(k).includes('zombie')?['dazed','pained','dazed']:['nervous','shock','grin'])});
  const {drawCharacter}=await import('/renderers/zombie-shelter/character-rig.js');
  const cw=300,ch=500,cols=3,rowH=540,W=cols*cw+380,H=cast.length*rowH+80;
  const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  g.fillStyle='#ece8df';g.fillRect(0,0,W,H);g.fillStyle='#292333';g.font='bold 34px system-ui';g.fillText(TITLE,24,52);
  cast.forEach((d,i)=>{const y=80+i*rowH,yaws=[0,30,330];
   g.fillStyle=i%2?'#e4dfd4':'#efebe3';g.fillRect(0,y,W,rowH);
   yaws.forEach((yaw,k)=>{const t=document.createElement('canvas');t.width=cw;t.height=ch;const x=t.getContext('2d');x.scale(.48,.48);
    drawCharacter(x,d,{yaw,time:1.3+k,expression:EXPR[d.id][k],micro:false});g.drawImage(t,k*cw,y+10);
    g.fillStyle='#5a5466';g.font='15px system-ui';g.fillText(yaw+'° · '+EXPR[d.id][k],k*cw+12,y+rowH-14);});
   // phone-size thumbnail (about on-screen size in a 1080x1920 frame mid shot / wide shot)
   const s=document.createElement('canvas');s.width=120;s.height=200;const sx=s.getContext('2d');sx.scale(.19,.19);drawCharacter(sx,d,{yaw:20,time:2,expression:EXPR[d.id][0],micro:false});
   g.drawImage(s,cols*cw+20,y+60);
   g.fillStyle='#292333';g.font='bold 24px system-ui';g.fillText(d.name,cols*cw+150,y+90);
   g.font='15px system-ui';g.fillStyle='#5a5466';const o=d.outfit||{};
   const lines=[d.id,'hair: '+(o.hat&&o.hat!=='hair'?o.hat:d.hairStyle),'top: '+(o.top||'jacket')+(o.pattern?' / '+o.pattern:''),'skin: '+d.skin];
   lines.forEach((l,n)=>g.fillText(l,cols*cw+150,y+120+n*22));g.fillText('wide-shot size ←',cols*cw+150,y+250);
  });
  return c.toDataURL('image/png').split(',')[1];
 },[IDS,TITLE]);
 await writeFile(out,Buffer.from(png,'base64'));console.log('wrote',out);
}finally{await browser.close();}
