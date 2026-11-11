import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
await mkdir('character-studio/review',{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage();await page.goto('http://127.0.0.1:8787');await page.waitForFunction(()=>window.studioReady,{},{timeout:15000});
 const result=await page.evaluate(async()=>{
  const {hairMesh,drawHair3D,projectHairPoint,skullDepth}=await import('/hair-3d.js'),{drawCharacter}=await import('/character-rig.js'),{headBlob}=await import('/toon.js'),{characters}=await fetch('/api/cast').then(r=>r.json());
  const models=[],checks=[];
  const sheet=document.createElement('canvas');sheet.width=2400;sheet.height=1200;const g=sheet.getContext('2d');g.fillStyle='#ece8df';g.fillRect(0,0,2400,1200);
  for(let j=0;j<characters.length;j++){
   const d=characters[j],head=headBlob(d.seed,118,d.hairStyle==='spiky'?-1:1),mesh=hairMesh(d,head.a,head.b),vertices=mesh.flatMap(f=>f.p),zMin=Math.min(...vertices.map(v=>v[2])),zMax=Math.max(...vertices.map(v=>v[2]));
   let wrapError=0;for(const v of vertices){const a=projectHairPoint(v,0,.3),b=projectHairPoint(v,Math.PI*2,.3);wrapError=Math.max(wrapError,...a.map((n,i)=>Math.abs(n-b[i])));}
   const c=document.createElement('canvas');c.width=c.height=500;const ctx=c.getContext('2d');drawHair3D(ctx,d,250,250,head.a,head.b,0,0);const front=ctx.getImageData(0,0,500,500).data,facePoints=[[0,0],[-40,0],[40,0],[0,40]],occluded=facePoints.every(([x,y])=>front[((250+y)*500+250+x)*4+3]===0);
   ctx.clearRect(0,0,500,500);drawHair3D(ctx,d,250,250,head.a,head.b,0,Math.PI/2);const top=ctx.getImageData(250,250,1,1).data[3];checks.push({id:d.id,triangles:mesh.length,zMin,zMax,wrapError,faceClear:occluded,topCenterAlpha:top});models.push({id:d.id,headRadii:[head.a,head.b,head.a*.85],triangles:mesh});
   const poses=[{yaw:0,pitch:0},{yaw:30,pitch:0},{yaw:60,pitch:0},{yaw:90,pitch:0},{yaw:180,pitch:0},{yaw:270,pitch:0},{yaw:0,pitch:90},{yaw:90,pitch:90}];
   for(let i=0;i<poses.length;i++){g.save();g.translate(i*300,j*400);g.scale(.36,.36);drawCharacter(g,d,{...poses[i],micro:false});g.restore();g.fillStyle='#292333';g.font='15px system-ui';g.fillText(`${d.id}: ${poses[i].yaw}° / ${poses[i].pitch}°`,i*300+6,j*400+390);}
  }
  return {checks,models,png:sheet.toDataURL().split(',')[1],skullFront:skullDepth(0,0,118,110,100,0,0),skullTop:skullDepth(0,0,118,110,100,0,Math.PI/2),skullMiss:skullDepth(500,500,118,110,100,0,0)===-Infinity};
 });
 await writeFile('character-studio/review/hair-3d.png',Buffer.from(result.png,'base64'));delete result.png;
 await writeFile('references/characters/shared/hair-models-3d.json',JSON.stringify({schemaVersion:1,coordinateSystem:'head-local, y down, z forward',models:result.models}));delete result.models;
 console.log(JSON.stringify(result));await writeFile('character-studio/review/hair-3d-report.json',JSON.stringify(result,null,2));
 assert(Math.abs(result.skullFront-100)<1e-9);assert(Math.abs(result.skullTop-110)<1e-9);assert(result.skullMiss);
 for(const c of result.checks){assert(c.triangles>50);assert(c.zMax-c.zMin>100);assert(c.wrapError<1e-8);assert(c.faceClear);assert(c.id==='bootstrap-middle'?c.topCenterAlpha===0:c.topCenterAlpha>0);}
}finally{await browser.close();}
