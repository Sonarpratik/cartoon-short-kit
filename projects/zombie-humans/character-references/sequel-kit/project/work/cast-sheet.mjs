import {chromium} from 'playwright';
import {writeFile} from 'node:fs/promises';
const out=process.argv[2];
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage();await page.goto('http://127.0.0.1:8790');await page.waitForFunction(()=>window.studioReady,{},{timeout:15000});
const png=await page.evaluate(async()=>{
 const rows=[['zs-host','JACK','Leader · "you"'],['zh-milo','MILO','Best friend'],['zh-tina','TINA','Nurse'],['zh-brock','BROCK','Mechanic'],['zs-stranger','TROY','The stranger'],['zh-slade','SLADE','Raider boss'],['zh-raider-helmet','RAIDER','biker'],['zh-raider-beanie','RAIDER','beanie'],['zh-raider-cap','RAIDER','camo'],['zh-raider-mohawk','RAIDER','spikes']];
 const {characters}=await fetch('/api/cast').then(r=>r.json());
 const W=360,H=620,cols=5,cv=document.createElement('canvas');cv.width=W*cols;cv.height=H*2;const g=cv.getContext('2d');g.fillStyle='#ece8df';g.fillRect(0,0,cv.width,cv.height);
 for(let i=0;i<rows.length;i++){const [id,name,role]=rows[i],d=characters.find(c=>c.id===id);const {drawCharacter}=await import('/renderers/'+d.project+'/character-rig.js');
  const x=(i%cols)*W,y=Math.floor(i/cols)*H;
  for(const [k,yaw] of [[0,0],[1,30]]){const c=document.createElement('canvas');c.width=300;c.height=500;const ctx=c.getContext('2d');ctx.scale(.48,.48);drawCharacter(ctx,d,{yaw,time:0,expression:k?'happy':'neutral',micro:false});g.drawImage(c,x+(k?150:-40),y+20,k?220:300,k?366:500);}
  g.fillStyle=i<4?'#2f6b4f':i===4?'#5a1f24':'#3a3540';g.fillRect(x+20,y+535,W-40,62);g.fillStyle='#fff';g.font='900 30px Arial Black, Arial';g.fillText(name,x+34,y+568);g.font='600 18px Arial';g.fillText(role+'  ·  '+id,x+34,y+590);}
 return cv.toDataURL('image/jpeg',.9).split(',')[1];});
await writeFile(out,Buffer.from(png,'base64'));await browser.close();
