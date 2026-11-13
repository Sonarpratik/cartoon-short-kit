// Archive each project's FINAL character code into projects/<p>/character-references/final/ so it is kept
// (and git-tracked) even though the rest of projects/ is ignored. Stored characters are opt-in only:
// new shorts never use them unless the user explicitly names them (see character-library/README.md).
//
//   node character-library/archive-project-code.mjs            # archive every project, keep existing archives
//   node character-library/archive-project-code.mjs zombie-humans --refresh   # re-archive one project
import {readdir,readFile,mkdir,copyFile,writeFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join,dirname,posix} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const args=process.argv.slice(2),refresh=args.includes('--refresh'),only=args.filter(a=>!a.startsWith('--'));
const exists=p=>access(p).then(()=>true,()=>false);
// Scene-side character code: how each story builds/attaches its cast (zombie skins, card shading, etc.).
const SCENE_FILES=['characters.ts','cast-design.ts','face-style.ts','character-preview.ts','actor.ts'];

async function archive(project){
 const dir=join(root,'projects',project),out=join(dir,'character-references','final');
 if(await exists(out)&&!refresh)return {project,status:'kept (exists; pass --refresh to replace)'};
 const files=[];const add=async(from,to)=>{if(!await exists(from))return;await mkdir(dirname(join(out,to)),{recursive:true});await copyFile(from,join(out,to));files.push(to);};
 const rig=join(dir,'characters');
 if(await exists(rig))for(const f of (await readdir(rig)).sort()){if(f==='cast.json')await add(join(rig,f),'cast.json');else if(f.endsWith('.ts'))await add(join(rig,f),'engine/'+f);}
 for(const f of SCENE_FILES){
  const src=join(dir,'src',f);if(!await exists(src))continue;await add(src,'scene/'+f);
  // pull in the src/engine helpers the scene file imports (cardshade, ink, toon...)
  for(const m of (await readFile(src,'utf8')).matchAll(/from\s+['"]\.\/engine\/([\w-]+)(?:\.js)?['"]/g))await add(join(dir,'src','engine',m[1]+'.ts'),'scene/engine/'+m[1]+'.ts');
 }
 if(!files.length)return {project,status:'nothing to archive'};
 const hashes={};for(const f of files)hashes[f]=createHash('sha256').update(await readFile(join(out,f))).digest('hex').slice(0,16);
 let ids=[];try{ids=JSON.parse(await readFile(join(out,'cast.json'),'utf8')).characters.map(c=>c.id);}catch{}
 await writeFile(join(out,'manifest.json'),JSON.stringify({schemaVersion:1,project,archivedAt:new Date().toISOString(),
  reuse:'explicit-only',note:'Archived final character code for this story. Do NOT use in a new project unless the user explicitly asks for these characters.',
  sources:{engine:posix.join('projects',project,'characters'),scene:posix.join('projects',project,'src')},characters:ids,files:hashes},null,2)+'\n');
 return {project,status:'archived',files:files.length,characters:ids.length};
}
const projects=only.length?only:(await readdir(join(root,'projects'),{withFileTypes:true})).filter(d=>d.isDirectory()).map(d=>d.name).sort();
for(const p of projects){if(!/^[a-zA-Z0-9_-]+$/.test(p))throw Error('Invalid project name: '+p);console.log(JSON.stringify(await archive(p)));}
