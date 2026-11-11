import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
await mkdir('character-studio/review',{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage();await page.goto('http://127.0.0.1:8787');await page.waitForFunction(()=>window.studioReady,{},{timeout:15000});
 const result=await page.evaluate(async()=>{
  const {drawCharacter,walkCycle}=await import('/character-rig.js'),{characters}=await fetch('/api/cast').then(r=>r.json());
  const sheet=document.createElement('canvas');sheet.width=2400;sheet.height=2400;const g=sheet.getContext('2d');g.fillStyle='#ece8df';g.fillRect(0,0,sheet.width,sheet.height);
  for(let row=0;row<6;row++)for(let col=0;col<8;col++){const yaw=row===0?col*30:[0,30,30,60,90,270][row],time=row===0?0:col/8/1.4,character=characters[row===1?0:row===5?2:1];g.save();g.translate(col*300,row*400);g.scale(.38,.38);drawCharacter(g,character,{yaw,time,action:row?'walk':'idle',micro:false});g.restore();g.fillStyle='#292333';g.font='15px system-ui';g.fillText(row?`${character.id} · ${yaw}° · ${col}/8`:`${yaw}°`,col*300+8,row*400+395);}
  let maxBoneError=0,maxFootSlide=0,maxStepPop=0;
  for(const stride of [.45,.65])for(let i=0;i<300;i++){const phase=i/300,L=346,pose=walkCycle(phase,L,stride,stride===.65?65:40),next=walkCycle(phase+1e-5,L,stride,stride===.65?65:40);for(let j=0;j<2;j++){const leg=pose.legs[j],p=leg.points,q=next.legs[j];for(let k=0;k<2;k++)maxBoneError=Math.max(maxBoneError,Math.abs(Math.hypot(...p[k].map((v,n)=>v-p[k+1][n]))-L/2));maxStepPop=Math.max(maxStepPop,Math.hypot(...p[2].map((v,n)=>v-q.points[2][n])));if(leg.stance&&q.stance){const worldZ=p[2][2]+2*pose.stepLength*phase,nextWorld=q.points[2][2]+2*pose.stepLength*(phase+1e-5);maxFootSlide=Math.max(maxFootSlide,Math.abs(nextWorld-worldZ));}}}
  const c=document.createElement('canvas');c.width=120;c.height=200;const ctx=c.getContext('2d');function pixels(yaw){ctx.setTransform(.2,0,0,.2,0,0);ctx.clearRect(0,0,600,1000);drawCharacter(ctx,characters[1],{yaw,time:.22,action:'walk',micro:false});return ctx.getImageData(0,0,120,200).data;}
  const diffs=[];for(const yaw of [88,89,90,268,269,270]){const a=pixels(yaw),b=pixels(yaw+1);diffs.push({yaw,meanDifference:a.reduce((s,v,i)=>s+Math.abs(v-b[i]),0)/a.length});}
  return {png:sheet.toDataURL().split(',')[1],maxBoneError,maxFootSlide,maxStepPop,diffs};
 });
 await writeFile('character-studio/review/turn-and-walk.png',Buffer.from(result.png,'base64'));delete result.png;
 await writeFile('character-studio/review/turn-walk-report.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
 assert(result.maxBoneError<.01,JSON.stringify(result));assert(result.maxFootSlide<1e-6);assert(result.maxStepPop<.1);assert(result.diffs.every(d=>d.meanDifference<3));
}finally{await browser.close();}
