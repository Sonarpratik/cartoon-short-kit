import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8790/?scale=0.25');await page.waitForFunction(()=>window.ready||window.lastError,null,{timeout:180000});
 assert.equal(await page.evaluate(()=>window.lastError),undefined);
 const meta=await page.evaluate(()=>window.frameMeta);assert.equal(meta.length,9);assert.equal(meta[0].f0,0);assert.equal(meta.at(-1).f1,1034);
 for(let i=1;i<meta.length;i++)assert.equal(meta[i].f0,meta[i-1].f1);
 for(const s of meta){await page.evaluate(f=>window.renderFrame(f),s.f0);await page.evaluate(f=>window.renderFrame(f),s.f1-1);}
 const deterministic=await page.evaluate(()=>{window.renderFrame(383);const a=document.querySelector('canvas').toDataURL();window.renderFrame(900);window.renderFrame(383);return a===document.querySelector('canvas').toDataURL();});assert.ok(deterministic,'Revisiting a frame must be deterministic');
 await page.locator('#scene').selectOption('S03');assert.equal(await page.evaluate(()=>window.currentFrame),141);
 await page.waitForFunction(()=>document.querySelector('audio').readyState>=2);await page.locator('#play').click();assert.equal(await page.locator('#play').innerText(),'Pause');await page.locator('#play').click();assert.equal(await page.locator('#play').innerText(),'Play narration');
 const d=await page.locator('audio').evaluate(a=>a.duration);assert.ok(Math.abs(d-34.4555)<.1);
 assert.deepEqual(errors,[]);console.log('PASS: nine contiguous scenes; start/end frames; deterministic re-render; scene selection; original narration playback.');
}finally{await browser.close();}
