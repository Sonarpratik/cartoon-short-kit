// Host face close-up strip to check stubble + scar at several angles/expressions.
import {chromium} from 'playwright';import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{const page=await browser.newPage();await page.goto('http://127.0.0.1:8789');await page.waitForFunction(()=>window.studioReady,{},{timeout:15000});
 const png=await page.evaluate(async()=>{const {characters}=await fetch('/api/cast').then(r=>r.json()),d=characters.find(c=>c.id==='zs-host');
  const {drawCharacter}=await import('/renderers/zombie-shelter/character-rig.js');const shots=Array.from({length:12},(_,i)=>[i*30,'neutral']);
  const c=document.createElement('canvas');c.width=shots.length*360;c.height=760;const g=c.getContext('2d');g.fillStyle='#ece8df';g.fillRect(0,0,c.width,c.height);
  shots.forEach(([yaw,e],i)=>{const t=document.createElement('canvas');t.width=600;t.height=1000;drawCharacter(t.getContext('2d'),d,{yaw,time:1,expression:e,micro:false});
   g.drawImage(t,60,40,480,960,i*360,0,360,720);g.fillStyle='#292333';g.font='18px system-ui';g.fillText(yaw+'° · '+e,i*360+16,745);});
  return c.toDataURL('image/png').split(',')[1];});
 await writeFile('projects/zombie-shelter/review/cast/host_12views_v3.png',Buffer.from(png,'base64'));}finally{await browser.close();}
