// Registers the 150 Ricks Clips vector puppets (newZip/RicksClips_Skill_V1.1, sheets 01-15) in
// character-library/cast.json under project "ricksclips". Only names, the sheet link and the main
// coat colour are stored here; the drawing code stays in newZip (personal-use licence, gitignored)
// and is rendered by projects/ricksclips/character-references/original/engine/character-rig.ts.
// Safe to re-run: existing IDs are kept. Usage: node character-library/import-ricksclips.mjs [codeDir]
import {readFile,writeFile,rename} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=new URL('../',import.meta.url);
const codeDir=resolve(fileURLToPath(root),process.argv[2]||process.env.RC_CHARACTERS||'newZip/RicksClips_Skill_V1.1/templates/vector2d_characters/code');
const {buildChar}=await import(pathToFileURL(codeDir+'/castkit.mjs').href);
const INK='#2a1a1f',hex=v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v);
const found=[];
for(let i=1;i<=15;i++){
 const k=String(i).padStart(2,'0'),{CAST}=await import(pathToFileURL(`${codeDir}/sheets/sheet${k}.mjs`).href);
 for(const spec of CAST){
  const coat=buildChar(spec,300).coat,id=`ricksclips-${k}-${spec.name}`.toLowerCase().replace(/[^a-z0-9_-]+/g,'-');
  found.push({id,name:`${spec.label||spec.name} · RC${k}`,project:'ricksclips',identity:id,seed:0,
   jacket:hex(coat)?coat.toLowerCase():'#808080',pants:INK,boots:INK,hair:INK,hairStyle:'sidepart',coat:false,skin:'#ffffff',
   rc:{sheet:i,name:spec.name,...(hex(coat)?{coat:coat.toLowerCase()}:{})}});
 }
}
const catalog=new URL('character-library/cast.json',root),data=JSON.parse(await readFile(catalog,'utf8'));
const added=found.filter(c=>!data.characters.some(old=>old.id===c.id));
data.characters.push(...added);
const temp=new URL('character-library/cast.tmp.json',root);
await writeFile(temp,JSON.stringify(data,null,2)+'\n');await rename(temp,catalog);
console.log(`Ricks Clips: ${found.length} characters found, ${added.length} added, ${found.length-added.length} already in cast.json.`);
