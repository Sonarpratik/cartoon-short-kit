// Short silent excerpts for reviewing camera travel; not a full video export.
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const frames=path.join(root,'review/motion-v14');await mkdir(frames,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
try{
 const page=await browser.newPage({viewport:{width:540,height:960}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/Shader Error|VALIDATE_STATUS|GL_INVALID|THREE.WebGLProgram/.test(m.text()))errors.push(m.text());});
 await page.goto('http://127.0.0.1:8790/?scale=.5');await page.waitForFunction(()=>window.ready,{timeout:120000});
 const audit=await page.evaluate(async()=>{
  const {SCENES}=await import('/src/story.ts');const results=[];
  for(const scene of SCENES){const instance=scene.build();let previous,maxStep=0,minStep=Infinity;
   for(let f=scene.f0;f<scene.f1;f++){
    const cam=instance.camera((f-scene.f0)/(scene.f1-scene.f0-1));
    if(![...cam.position,...cam.target,...(cam.focus??cam.target),cam.fov??39].every(Number.isFinite))throw new Error('Invalid camera '+scene.id);
    if(previous){const step=Math.hypot(...cam.position.map((v,i)=>v-previous[i]));maxStep=Math.max(maxStep,step);minStep=Math.min(minStep,step);}
    previous=cam.position;
   }
   if(maxStep>.12||minStep<1e-8)throw new Error('Camera jump or static span '+scene.id);
   results.push({id:scene.id,maxMetresPerFrame:maxStep,minMetresPerFrame:minStep});
  }
  const {cameraJourney}=await import('/src/engine/director.ts');
  const keys=[{at:0,position:[0,2,8],target:[0,1,0]},{at:.5,position:[1,2.5,6],target:[.5,1,0]},{at:1,position:[2,2,5],target:[1,1,0]}];
  const h=1e-5,a=cameraJourney(.5-h,keys).position,b=cameraJourney(.5,keys).position,c=cameraJourney(.5+h,keys).position;
  const seamError=Math.hypot(...a.map((v,i)=>(b[i]-v)/h-(c[i]-b[i])/h));
  if(seamError>.01)throw new Error('Camera tangent discontinuity');
  if(JSON.stringify(cameraJourney(0,keys).position)!==JSON.stringify(keys[0].position)||JSON.stringify(cameraJourney(1,keys).position)!==JSON.stringify(keys[2].position))throw new Error('Camera endpoints differ');
  return {scenes:results,internalTangentError:seamError,endpoints:'pass'};
 });
 await writeFile(path.join(root,'work/camera-check-v14.json'),JSON.stringify(audit,null,2));
 // Capture the built snapshot, not the development page used for inspecting camera functions.
 await page.goto('http://127.0.0.1:8791/?scale=.5');await page.waitForFunction(()=>window.ready,{timeout:120000});
 let index=0;const clips=[];
 for(const [id,a,b] of [['S01',0,75],['S03',141,351],['S07',702,858]]){
  const first=index;
  for(let f=a;f<b;f+=2){
   const encoded=await page.evaluate(f=>{window.renderFrame(f);return document.querySelector('canvas').toDataURL('image/jpeg',.92).split(',')[1];},f);
   await writeFile(path.join(frames,`f${String(index++).padStart(4,'0')}.jpg`),Buffer.from(encoded,'base64'));
  }
  clips.push({id,sourceFrames:[a,b-1],previewFrames:[first,index-1]});console.log('Motion excerpt '+id);
 }
 if(errors.length)throw new Error(errors.join('\n'));
 await writeFile(path.join(root,'work/motion-review-v14.json'),JSON.stringify({fps:15,width:540,height:960,frames:index,clips,errors},null,2));
 console.log(JSON.stringify({cameraAudit:'pass',frames:index,errors}));
}finally{await browser.close();}
