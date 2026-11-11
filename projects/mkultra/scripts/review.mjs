// Capture review frames only, with source hashes and versioned sheets.
import {chromium} from 'playwright';
import {mkdir,readFile,readdir,writeFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const ids=process.argv[2]?.split(',');
const scale=Number(process.env.REVIEW_SCALE||1);
const version=process.env.REVIEW_VERSION||'v1';
const base=process.env.PREVIEW_URL||'http://127.0.0.1:8790';
const out=path.join(root,'review');await mkdir(out,{recursive:true});
const browser=await chromium.launch({...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{}),args:[`--use-angle=${process.env.RENDER_GL||'swiftshader'}`,'--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
let manifest;
try{
 const page=await browser.newPage({viewport:{width:1280,height:2200},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/Shader Error|VALIDATE_STATUS|GL_INVALID|THREE.WebGLProgram/.test(m.text()))errors.push(m.text());});
 await page.goto(`${base}/?scale=${scale}`);await page.waitForFunction(()=>window.ready||window.lastError,null,{timeout:180000});
 const issue=await page.evaluate(()=>window.lastError);if(issue)throw new Error(issue);
 const defs=await page.evaluate(()=>window.frameMeta);const selected=defs.filter(s=>!ids||ids.includes(s.id));
 if(ids&&ids.some(id=>!selected.some(s=>s.id===id)))throw new Error('Unknown scene ID');
 await page.addStyleTag({content:`#screen{width:${Math.round(1080*scale)}px;height:${Math.round(1920*scale)}px}`});
 const shared=[];async function collect(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory()){if(e.name!=='scenes')await collect(p);}else if(e.name.endsWith('.ts'))shared.push(p);}}await collect(path.join(root,'src'));
 manifest=[];
 for(const s of selected){
  const hash=createHash('sha256');for(const p of [...shared.sort(),path.join(root,'src/scenes',s.id+'.ts')]){hash.update(path.relative(root,p));hash.update(await readFile(p));}
  const folder=path.join(out,`${s.id}_${version}`);await mkdir(folder,{recursive:true});const paths=[];
  for(const f of s.review){
   const filename=path.join(folder,`f${String(f).padStart(4,'0')}.jpg`);
   try{await access(filename);throw new Error(`Review frame already exists: ${filename}; use another REVIEW_VERSION`);}catch(e){if(e.code!=='ENOENT')throw e;}
   await page.evaluate(f=>window.renderFrame(f),f);
   await page.locator('#screen').screenshot({path:filename,type:'jpeg',quality:95,animations:'disabled',timeout:180000});
   paths.push(path.relative(root,filename).replaceAll('\\','/'));console.log(`${s.id} ${f} (${manifest.length+1}/${selected.length})`);
  }
  manifest.push({...s,paths,version,sourceHash:hash.digest('hex'),scale,status:'to check'});
 }
 if(errors.length)throw new Error(errors.join('\n'));
 await writeFile(path.join(out,`manifest_${version}.json`),JSON.stringify(manifest,null,2));
 console.log(`Review capture complete: ${manifest.length} scenes, scale ${scale}. No full video rendered.`);
}finally{await browser.close();}
