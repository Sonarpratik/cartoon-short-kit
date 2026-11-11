import {chromium} from 'playwright';
import {readFile,writeFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
const source=stripTypeScriptTypes(await readFile('references/characters/bootstrap-paradox/engine/toon.ts','utf8')).replace("'./style.js'","'http://127.0.0.1:8787/style.js'");
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage();await page.goto('http://127.0.0.1:8787');await page.waitForFunction(()=>window.studioReady,{},{timeout:15000});
 const result=await page.evaluate(async source=>{
  const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'})),original=await import(url),{CharacterPen}=await import('/face-style.js'),{drawCharacter}=await import('/character-rig.js'),{characters}=await fetch('/api/cast').then(r=>r.json());
  const gallery=document.createElement('canvas');gallery.width=1800;gallery.height=1080;const gg=gallery.getContext('2d');gg.fillStyle='#ece8df';gg.fillRect(0,0,1800,1080);const comparisons=[];
  for(let i=0;i<characters.length;i++){
   const d=characters[i],a=document.createElement('canvas'),b=document.createElement('canvas');a.width=b.width=600;a.height=b.height=1000;const ag=a.getContext('2d'),bg=b.getContext('2d'),facing=d.hairStyle==='spiky'?-1:1;
   drawCharacter(ag,d,{micro:false});original.bodyFront(new CharacterPen(bg),{jacket:d.jacket,pants:d.pants,boots:d.boots,hat:'hair',hair:d.hair,hairStyle:d.hairStyle,labCoat:d.coat,buttons:'#d4b57d'},{mode:'stand',seed:d.seed,expr:'neutral',look:facing,facing,light:-2.2});
   const ap=ag.getImageData(0,0,600,1000).data,bp=bg.getImageData(0,0,600,1000).data;let sum=0,count=0,bodyDifference=0;for(let j=0;j<ap.length;j++){const delta=Math.abs(ap[j]-bp[j]);sum+=delta;if(delta)count++;if(j>=600*500*4)bodyDifference+=delta;}comparisons.push({id:d.id,meanChannelDifference:sum/ap.length,changedChannels:count,bodyDifference});gg.drawImage(a,i*600,40);gg.fillStyle='#292333';gg.font='24px system-ui';gg.textAlign='center';gg.fillText(d.name,i*600+300,1060);
  }
  URL.revokeObjectURL(url);return {comparisons,png:gallery.toDataURL().split(',')[1]};
 },source);
 await writeFile('references/characters/shared/studio-cast.png',Buffer.from(result.png,'base64'));
 await writeFile('references/characters/shared/renderer-check.json',JSON.stringify(result.comparisons,null,2)+'\n');
 console.log(JSON.stringify(result.comparisons));if(result.comparisons.some(c=>c.bodyDifference!==0))throw Error('Hair/face correction changed the original body or clothing');
}finally{await browser.close();}
