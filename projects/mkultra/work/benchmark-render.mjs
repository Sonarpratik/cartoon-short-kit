import {chromium} from 'playwright';
import {performance} from 'node:perf_hooks';
for(const [name,args] of [['hardware',['--use-angle=d3d11','--ignore-gpu-blocklist']],['software',['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']]]){
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args});
 try{
  const page=await browser.newPage();await page.goto('http://127.0.0.1:8790/?scale=1');await page.waitForFunction(()=>window.ready||window.lastError,null,{timeout:180000});
  const error=await page.evaluate(()=>window.lastError);if(error){console.log(name,error);continue;}
  const renderer=await page.evaluate(()=>{const gl=document.querySelector('canvas').getContext('webgl2');const ex=gl.getExtension('WEBGL_debug_renderer_info');return ex?gl.getParameter(ex.UNMASKED_RENDERER_WEBGL):'unknown';});
  const start=performance.now();for(const f of [0,24,74])await page.evaluate(f=>{window.renderFrame(f);return document.querySelector('canvas').toDataURL('image/jpeg',.95).length;},f);
  console.log(JSON.stringify({name,renderer,secondsPerFrame:(performance.now()-start)/3000}));
 }catch(e){console.log(name,e.message);}finally{await browser.close();}
}
