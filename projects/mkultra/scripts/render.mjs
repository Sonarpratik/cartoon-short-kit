// Full-resolution, deterministic canvas capture with per-scene hash-based resume.
import {chromium} from 'playwright';
import {mkdir,readFile,readdir,writeFile,stat,link,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:8791';
const args=['--use-angle=d3d11','--ignore-gpu-blocklist'];
const settings={width:1080,height:1920,fps:30,jpegQuality:.95,angle:'d3d11'};
const framesRoot=path.join(root,'frames');await mkdir(framesRoot,{recursive:true});
const shared=[];async function collect(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory()){if(e.name!=='scenes')await collect(p);}else if(e.name.endsWith('.ts'))shared.push(p);}}
await collect(path.join(root,'src'));
const sourceHash=async(scene)=>{const h=createHash('sha256');h.update(JSON.stringify(settings));for(const p of [...shared.sort(),path.join(root,'src/scenes',scene+'.ts')]){h.update(path.relative(root,p));h.update(await readFile(p));}return h.digest('hex');};
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',args});
const start=Date.now();let count=0;
try{
 const page=await browser.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/Shader Error|VALIDATE_STATUS|GL_INVALID|THREE.WebGLProgram/.test(m.text()))errors.push(m.text());});
 await page.goto(base+'/?scale=1');await page.waitForFunction(()=>window.ready||window.lastError,null,{timeout:180000});
 const issue=await page.evaluate(()=>window.lastError);if(issue)throw new Error(issue);
 const defs=await page.evaluate(()=>window.frameMeta),total=await page.evaluate(()=>window.totalFrames);
 const renderer=await page.evaluate(()=>{const gl=document.querySelector('canvas').getContext('webgl2');const ext=gl.getExtension('WEBGL_debug_renderer_info');return ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):'unknown';});
 console.log('Renderer: '+renderer);const rendered=[];
 const progress=async(scene,frame)=>writeFile(path.join(root,'work/render-progress.json'),JSON.stringify({scene,frame,completeFrames:count,total,elapsedSeconds:(Date.now()-start)/1000,renderer},null,2));
 for(const s of defs){
  const hash=await sourceHash(s.id),folder=path.join(framesRoot,s.id,hash.slice(0,12));await mkdir(folder,{recursive:true});
  const manifest={id:s.id,f0:s.f0,f1:s.f1,hash,settings,renderer,complete:false};
  await writeFile(path.join(folder,'manifest.json'),JSON.stringify(manifest,null,2));
  let captured=0,reused=0;
  for(let f=s.f0;f<s.f1;f++){
   const filename=path.join(folder,`f${String(f).padStart(4,'0')}.jpg`);let exists=false;
   try{exists=(await stat(filename)).size>1024;}catch(e){if(e.code!=='ENOENT')throw e;}
   if(exists)reused++;else{
    const encoded=await page.evaluate(f=>{window.renderFrame(f);return document.querySelector('canvas').toDataURL('image/jpeg',.95).split(',')[1];},f);
    if(errors.length)throw new Error(errors.join('\n'));
    await writeFile(filename,Buffer.from(encoded,'base64'));captured++;
   }
   count++;
   if(count%30===0||f===s.f1-1){await progress(s.id,f);console.log(`${s.id} ${count}/${total} (${((Date.now()-start)/1000).toFixed(0)}s)`);}
  }
  manifest.complete=true;await writeFile(path.join(folder,'manifest.json'),JSON.stringify(manifest,null,2));
  rendered.push({...manifest,folder:path.relative(root,folder).replaceAll('\\','/'),captured,reused});
 }
 if(count!==total)throw new Error('Incomplete frame coverage');
 const combined=createHash('sha256').update(rendered.map(s=>s.hash).join('')).digest('hex').slice(0,12);
 const sequence=path.join(framesRoot,'all-'+combined);await mkdir(sequence,{recursive:true});
 for(const s of rendered)for(let f=s.f0;f<s.f1;f++){
  const name=`f${String(f).padStart(4,'0')}.jpg`,source=path.join(root,s.folder,name),target=path.join(sequence,name);
  try{await link(source,target);}catch(e){if(e.code==='EEXIST')continue;await copyFile(source,target);}
 }
 const report={settings,renderer,total,elapsedSeconds:(Date.now()-start)/1000,sequence:path.relative(root,sequence).replaceAll('\\','/'),scenes:rendered};
 await writeFile(path.join(root,'work/render-manifest.json'),JSON.stringify(report,null,2));
 await progress('complete',total-1);console.log('COMPLETE '+JSON.stringify({frames:count,seconds:report.elapsedSeconds,sequence:report.sequence}));
}finally{await browser.close();}
