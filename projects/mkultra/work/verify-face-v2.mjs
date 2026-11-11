import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8790/?scale=0.25');await page.waitForFunction(()=>window.ready||window.lastError,null,{timeout:180000});
 assert.equal(await page.evaluate(()=>window.lastError),undefined);
 const result=await page.evaluate(async()=>{
  const {Character}=await import('/src/characters.ts');
  const actor=new Character('civilian',3),drawing=()=>actor.mesh.material.map.image.toDataURL();
  actor.pose(107,{expr:'neutral'});actor.pose(108,{expr:'neutral'});const a=drawing();actor.pose(120,{expr:'neutral'});actor.pose(108,{expr:'neutral'});const b=drawing();
  actor.pose(108,{facing:-1});const left=drawing();actor.pose(108,{facing:1});const right=drawing();
  const cv=actor.mesh.material.map.image,pixels=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let offWhite=0;for(let i=0;i<pixels.length;i+=4)if(pixels[i]>245&&pixels[i+1]>244&&pixels[i+2]>240&&pixels[i+3]>250)offWhite++;
  window.renderFrame(383);const first=document.querySelector('canvas').toDataURL();window.renderFrame(382);window.renderFrame(383);const again=document.querySelector('canvas').toDataURL();
  window.renderFrame(509);window.renderFrame(902);
  return {deterministic:a===b,gaze:left!==right,offWhite,sceneDeterministic:first===again};
 });
 assert.ok(result.deterministic);assert.ok(result.gaze);assert.ok(result.offWhite>10000);assert.ok(result.sceneDeterministic);assert.deepEqual(errors,[]);
 console.log('PASS: off-white face pixels, left/right gaze, deterministic cached head pose, night/archive renders, no page errors.');
}finally{await browser.close();}
