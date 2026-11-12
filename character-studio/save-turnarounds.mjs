import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage();await page.goto('http://127.0.0.1:8787');await page.waitForFunction(()=>window.studioReady,{},{timeout:15000});
 const results=await page.evaluate(async()=>{
  const {drawCharacter,VIEWS}=await import('/character-rig.js'),{characterAngleDesigns,angleDesign}=await import('/angle-designs.js'),{characters}=await fetch('/api/cast').then(r=>r.json());
  return characters.map(d=>{const designs=characterAngleDesigns(d.hairStyle,d.outfit?.hat??'hair'),canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1560;const g=canvas.getContext('2d');g.fillStyle='#ece8df';g.fillRect(0,0,1200,1560);const hashes=[];
   for(let i=0;i<12;i++){const c=document.createElement('canvas');c.width=300;c.height=500;const ctx=c.getContext('2d');ctx.scale(.48,.48);drawCharacter(ctx,d,{yaw:VIEWS[i],time:0,expression:'neutral',micro:false});hashes.push(c.toDataURL());const x=i%4*300,y=Math.floor(i/4)*520;g.drawImage(c,x,y);g.fillStyle='#292333';g.font='16px system-ui';g.fillText(d.name+' / '+VIEWS[i]+'°',x+10,y+510);}
   const first=angleDesign(d.hairStyle,d.outfit?.hat??'hair',0),last=angleDesign(d.hairStyle,d.outfit?.hat??'hair',360),finite=[];for(let yaw=0;yaw<360;yaw++){const frame=angleDesign(d.hairStyle,d.outfit?.hat??'hair',yaw);for(const p of frame.hair)for(const xy of p.points)if(!xy.every(Number.isFinite))finite.push(yaw);}
   return {id:d.id,project:d.project,designs,distinctViews:new Set(hashes).size,wrapMatches:JSON.stringify(first.hair)===JSON.stringify(last.hair),finite:finite.length===0,png:canvas.toDataURL().split(',')[1]};
  });
 });
 for(const r of results){assert.equal(r.designs.length,12);assert.equal(r.distinctViews,12);assert(r.wrapMatches&&r.finite);const folder=`references/characters/${r.project}/turnarounds`;await mkdir(folder,{recursive:true});await writeFile(`${folder}/${r.id}.png`,Buffer.from(r.png,'base64'));await writeFile(`${folder}/${r.id}.json`,JSON.stringify({schemaVersion:1,character:r.id,coordinates:'head-radius-normalized, projected view space',views:r.designs},null,2)+'\n');delete r.png;delete r.designs;}
 await writeFile('character-studio/review/turnaround-report.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results));
}finally{await browser.close();}
