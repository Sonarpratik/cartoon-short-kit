import {chromium} from 'playwright';
import {mkdir,writeFile,access} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {characterReferencePath} from '../character-library/paths.mjs';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--disable-accelerated-2d-canvas']});
try{
 const page=await browser.newPage();await page.goto(process.env.STUDIO_URL||'http://127.0.0.1:8787');await page.waitForFunction(()=>window.studioReady,{},{timeout:15000});
 const results=await page.evaluate(async()=>{
  const {characters}=await fetch('/api/cast').then(r=>r.json()),results=[];
  for(const d of characters){
   const base='/renderers/'+encodeURIComponent(d.project)+'/',{drawCharacter}=await import(base+'character-rig.js'),{characterAngleDesigns,angleDesign}=await import(base+'angle-designs.js');
   const designs=characterAngleDesigns(d.hairStyle,d.outfit?.hat??'hair'),canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1560;const g=canvas.getContext('2d');g.fillStyle='#ece8df';g.fillRect(0,0,1200,1560);const hashes=[];
   for(let i=0;i<12;i++){const c=document.createElement('canvas');c.width=300;c.height=500;const ctx=c.getContext('2d');ctx.scale(.48,.48);drawCharacter(ctx,d,{yaw:i*30,time:0,expression:'neutral',micro:false});hashes.push(c.toDataURL());const x=i%4*300,y=Math.floor(i/4)*520;g.drawImage(c,x,y);g.fillStyle='#292333';g.font='16px system-ui';g.fillText(d.name+' / '+i*30+'°',x+10,y+510);}
   const first=angleDesign(d.hairStyle,d.outfit?.hat??'hair',0),last=angleDesign(d.hairStyle,d.outfit?.hat??'hair',360);let finite=true;for(let yaw=0;yaw<360;yaw++)for(const p of angleDesign(d.hairStyle,d.outfit?.hat??'hair',yaw).hair)for(const xy of p.points)finite&&=xy.every(Number.isFinite);
   results.push({id:d.id,project:d.project,designs,distinctViews:new Set(hashes).size,wrapMatches:JSON.stringify(first.hair)===JSON.stringify(last.hair),finite,png:canvas.toDataURL().split(',')[1]});
  }return results;
 });
 for(const r of results){assert.equal(r.designs.length,12);assert.equal(r.distinctViews,12);assert(r.wrapMatches&&r.finite);const folder=characterReferencePath(r.project)+'/turnarounds';await mkdir(folder,{recursive:true});let existing=false;try{await access(`${folder}/${r.id}.png`);await access(`${folder}/${r.id}.json`);existing=true;}catch{}if(!existing||process.argv.includes('--refresh')){await writeFile(`${folder}/${r.id}.png`,Buffer.from(r.png,'base64'));await writeFile(`${folder}/${r.id}.json`,JSON.stringify({schemaVersion:1,character:r.id,coordinates:'head-radius-normalized, projected view space',views:r.designs},null,2)+'\n');}r.existingPreserved=existing;delete r.png;delete r.designs;}
 await mkdir('character-studio/review',{recursive:true});await writeFile('character-studio/review/turnaround-report.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results));
}finally{await browser.close();}
