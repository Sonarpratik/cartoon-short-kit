import {chromium} from 'playwright';
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:600,height:1000}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
for(let i=0;i<40;i++){try{await p.goto('http://127.0.0.1:8794/?scale=.25');break;}catch{await new Promise(r=>setTimeout(r,500));}}
await p.waitForFunction(()=>window.ready||window.lastError,null,{timeout:180000});
const issue=await p.evaluate(()=>window.lastError);if(issue)console.log('LOAD',issue);
const meta=await p.evaluate(()=>window.frameMeta);
for(const s of meta){for(const f of s.review){const e=await p.evaluate(f=>{try{window.renderFrame(f);return null;}catch(e){return String(e.stack||e).slice(0,400);}},f);if(e){console.log(s.id,f,e);break;}}}
console.log('errors',errs.slice(0,8));await b.close();
