import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage();await page.goto('http://127.0.0.1:8787');
 const result=await page.evaluate(async()=>{
  const {drawCharacter}=await import('/character-rig.js'),{CharacterPen}=await import('/face-style.js'),{headBlob}=await import('/toon.js'),{angleDesign}=await import('/angle-designs.js'),{characters}=await fetch('/api/cast').then(r=>r.json());
  const c=document.createElement('canvas');c.width=600;c.height=1000;const g=c.getContext('2d'),original=CharacterPen.prototype.shadedFill,ell=CharacterPen.prototype.ell;
  let current,frame,hairs,glasses,headRotation,maxHairError=0,maxGlassesError=0,tested=0;
  CharacterPen.prototype.shadedFill=function(...args){
   if(this.surface==='head'&&args[1]===current.skin){const h=headBlob(current.seed,118,current.facing??(current.hairStyle==='spiky'?-1:1));
    headRotation=JSON.stringify(this.rot);
    frame={pen:this,rot:this.rot? [...this.rot]:null,h};
   }else if(args[1]===current.hair||args[1]===current.outfit?.cap||args[1]==='#342d34')hairs.push(args[0]);
   return original.apply(this,args);
  };
  CharacterPen.prototype.ell=function(...args){if(this.surface==='feature'&&args[2]===26&&args[3]===23)glasses.push(JSON.stringify(this.rot));return ell.apply(this,args);};
  for(const d of characters)for(const action of ['walk','run'])for(let yaw=0;yaw<360;yaw+=30)for(let i=0;i<8;i++){
   current=d;frame=null;hairs=[];glasses=[];g.clearRect(0,0,600,1000);const time=i/8/(action==='run'?2.3:1.4);drawCharacter(g,d,{yaw,action,time,micro:true});
   if(!frame)throw Error('Missing head');
   const {pen,rot,h}=frame,previous=pen.rot;pen.rot=rot;pen.surface='hair-front';const center=pen.P(300,pen.hc),right=pen.P(300+h.a,pen.hc),down=pen.P(300,pen.hc+h.b);pen.rot=previous;
   const patches=angleDesign(d.hairStyle,d.outfit?.hat??'hair',yaw).hair.filter(p=>p.alpha>=.001).sort((a,b)=>(a.layer==='back'?0:1)-(b.layer==='back'?0:1));
   if(hairs.length!==patches.length)throw Error(`${d.id}: missing hair components ${hairs.length}/${patches.length}`);
   patches.forEach((patch,j)=>patch.points.forEach(([x,y],k)=>{const expected=[center[0]+x*(right[0]-center[0])+y*(down[0]-center[0]),center[1]+x*(right[1]-center[1])+y*(down[1]-center[1])];maxHairError=Math.max(maxHairError,Math.hypot(expected[0]-hairs[j][k][0],expected[1]-hairs[j][k][1]));}));
   for(const rotation of glasses)if(rotation!==headRotation)maxGlassesError++;
   tested++;
  }
  CharacterPen.prototype.shadedFill=original;CharacterPen.prototype.ell=ell;return {tested,maxHairError,maxGlassesError};
 });
 console.log(JSON.stringify(result));assert(result.maxHairError<1e-6);assert.equal(result.maxGlassesError,0);
}finally{await browser.close();}
