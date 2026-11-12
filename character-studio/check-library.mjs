import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,unlink} from 'node:fs/promises';
import {characterReferencePath} from '../character-library/paths.mjs';
import {execFileSync} from 'node:child_process';
const base='http://127.0.0.1:8787',file=new URL('../character-library/cast.json',import.meta.url);
const original=await fetch(base+'/api/cast').then(r=>r.json()),id='qa-'+Date.now();
const fixture={...(original.characters.find(c=>c.id==='mkultra-researcher')??original.characters[0]),id,name:'QA temporary variant'};
try{
 const invalid=await fetch(base+'/api/characters',{method:'POST',body:JSON.stringify({...fixture,hair:'bad'})});assert.equal(invalid.status,400);
 const cross=await fetch(base+'/api/characters',{method:'POST',headers:{Origin:'https://example.com'},body:JSON.stringify(fixture)});assert.equal(cross.status,403);
 const save=await fetch(base+'/api/characters',{method:'POST',body:JSON.stringify(fixture)});assert.equal(save.status,201);
 const loaded=await fetch(base+'/api/cast').then(r=>r.json());assert.deepEqual(loaded.characters.find(c=>c.id===id),fixture);
 const duplicate=await fetch(base+'/api/characters',{method:'POST',body:JSON.stringify(fixture)});assert.equal(duplicate.status,400);
 for(const old of original.characters)assert.deepEqual(loaded.characters.find(c=>c.id===old.id),old);
 const target='character-studio/review/snapshot-'+Date.now();await mkdir(target,{recursive:true});
 execFileSync(process.execPath,['character-library/snapshot.mjs',target,'bootstrap-young','bootstrap-future']);
 const snapshot=JSON.parse(await readFile(target+'/characters/cast.json','utf8'));assert.equal(snapshot.characters.length,2);
 assert.equal(await readFile(target+'/characters/character-rig.ts','utf8'),await readFile('templates/bridge/character-rig.ts','utf8'));
 let blocked=false;try{execFileSync(process.execPath,['character-library/snapshot.mjs',target,'bootstrap-young'],{stdio:'pipe'});}catch{blocked=true;}assert(blocked,'Snapshot overwrite must be rejected');
 console.log('PASS: validation, origin check, save/reload, original preservation, duplicate protection, isolated cast/rig snapshot, snapshot overwrite protection.');
}finally{const current=JSON.parse(await readFile(file,'utf8'));current.characters=current.characters.filter(c=>c.id!==id);await writeFile(file,JSON.stringify(current,null,2)+'\n');await unlink(characterReferencePath(fixture.project)+'/variants/'+id+'.json').catch(e=>{if(e.code!=='ENOENT')throw e;});}
