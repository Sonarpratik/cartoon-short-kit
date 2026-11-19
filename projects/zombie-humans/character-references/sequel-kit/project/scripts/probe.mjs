// Quick debug capture: node scripts/probe.mjs <outDir> f1,f2,...  (half scale, prints page errors)
import {chromium} from 'playwright';import {mkdir} from 'node:fs/promises';import path from 'node:path';
const [out,list]=process.argv.slice(2);await mkdir(out,{recursive:true});const scale=Number(process.env.SCALE||.5);
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
try{const page=await browser.newPage({viewport:{width:1280,height:2200}});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto(`http://127.0.0.1:8793/?scale=${scale}`);await page.waitForFunction(()=>window.ready||window.lastError,null,{timeout:180000});
 const issue=await page.evaluate(()=>window.lastError);if(issue)console.log('LASTERROR',issue);
 await page.addStyleTag({content:`#screen{width:${Math.round(1080*scale)}px;height:${Math.round(1920*scale)}px}`});
 for(const f of list.split(',').map(Number)){try{await page.evaluate(f=>window.renderFrame(f),f);}catch(e){console.log('ERR',f,e.message.split('\n')[0]);continue;}
  await page.locator('#screen').screenshot({path:path.join(out,`f${String(f).padStart(4,'0')}.jpg`),type:'jpeg',quality:88});console.log('ok',f);}
 if(errors.length)console.log('ERRORS',[...new Set(errors)].slice(0,8).join('\n'));}finally{await browser.close();}
