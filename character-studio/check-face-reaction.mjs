import {chromium} from 'playwright';
import {writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
await mkdir('character-studio/review',{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage();await page.goto('http://127.0.0.1:8787');await page.waitForFunction(()=>window.studioReady,{},{timeout:15000});
 const result=await page.evaluate(async()=>{
  const {CharacterPen,FACE_COLOR,FACE_SHADOW}=await import('/face-style.js'),{drawCharacter,reactionJaw}=await import('/character-rig.js'),{headBlob}=await import('/toon.js'),{characters}=await fetch('/api/cast').then(r=>r.json());
  const c=document.createElement('canvas');c.width=600;c.height=1000;const g=c.getContext('2d');const circle=(cx,cy,rx,ry)=>Array.from({length:96},(_,i)=>[cx+rx*Math.cos(i/96*Math.PI*2),cy+ry*Math.sin(i/96*Math.PI*2)]),luma=(x,y)=>{const a=g.getImageData(x,y,1,1).data;return (.2126*a[0]+.7152*a[1]+.0722*a[2])/255;};
  const lighting=[];for(const light of [Math.PI,0]){g.clearRect(0,0,600,1000);const p=new CharacterPen(g);p.shadedFill(circle(300,250,100,100),FACE_COLOR,FACE_SHADOW,light,100);p.gradFill(circle(300,650,100,160),'#397d7e','#254f56',light);lighting.push({light,faceLeft:luma(220,250),faceRight:luma(380,250),faceFarLeft:luma(207,250),faceFarRight:luma(393,250),bodyLeft:luma(220,650),bodyRight:luma(380,650)});}
  const d=characters.find(c=>c.id==='bootstrap-young'),h=headBlob(d.seed,118,1),hc=975-3*h.b*2,ages=[0,.08,.16,.3,.6,1],frames=[],jawStates=[];
  const sheet=document.createElement('canvas');sheet.width=1800;sheet.height=360;const s=sheet.getContext('2d');s.fillStyle='#ece8df';s.fillRect(0,0,1800,360);
  for(let i=0;i<ages.length;i++){g.clearRect(0,0,600,1000);drawCharacter(g,d,{time:1,expression:'shock',fromExpression:'neutral',expressionAge:ages[i],micro:true});frames.push(g.getImageData(0,0,600,1000).data);jawStates.push(reactionJaw('shock',true,ages[i],'neutral'));s.drawImage(c,120,hc-180,360,360,i*300+10,30,280,280);s.fillStyle='#292333';s.font='18px system-ui';s.fillText(ages[i].toFixed(2)+' s',i*300+12,335);}
  let topAlphaDiff=0,chinAlphaDiff=0,bodyAlphaDiff=0;const a=frames[0],b=frames[2];for(let i=3;i<a.length;i+=4){const y=Math.floor((i-3)/4/600),diff=Math.abs(a[i]-b[i]);if(y<hc)topAlphaDiff+=diff;else if(y<hc+h.b+12)chinAlphaDiff+=diff;else if(y>500)bodyAlphaDiff+=diff;}
  return {lighting,jawStates,topAlphaDiff,chinAlphaDiff,bodyAlphaDiff,neutralJaw:reactionJaw('neutral',true),settled:reactionJaw('shock',true,1,'neutral'),png:sheet.toDataURL().split(',')[1]};
 });
 await writeFile('character-studio/review/chin-reaction.png',Buffer.from(result.png,'base64'));delete result.png;await writeFile('character-studio/review/face-reaction-report.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
 assert(result.lighting[0].faceLeft>result.lighting[0].faceRight+.03);assert(result.lighting[1].faceRight>result.lighting[1].faceLeft+.03);assert(result.lighting[0].bodyLeft>result.lighting[0].bodyRight+.03);assert(result.lighting[1].bodyRight>result.lighting[1].bodyLeft+.03);
 assert(result.lighting[0].faceFarRight<result.lighting[0].faceLeft);assert.equal(result.topAlphaDiff,0);assert(result.chinAlphaDiff>0);assert.equal(result.bodyAlphaDiff,0);assert.deepEqual(result.neutralJaw,[0,0,0]);assert.deepEqual(result.settled,[-4,6,0]);
}finally{await browser.close();}
