import {readFile,mkdir,writeFile,copyFile,realpath,access} from 'node:fs/promises';
import {resolve,relative,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const [target,...ids]=process.argv.slice(2);if(!target||!ids.length)throw Error('Usage: node character-library/snapshot.mjs projects/story character-id ...');
const actual=await realpath(resolve(root,target)),rel=relative(root,actual);if(rel.startsWith('..')||!rel)throw Error('Project must be a subdirectory of this repository');
const library=JSON.parse(await readFile(new URL('../character-library/cast.json',import.meta.url),'utf8'));
const characters=ids.map(id=>{const c=library.characters.find(c=>c.id===id);if(!c)throw Error('Unknown character: '+id);return c;});
try{await access(join(actual,'character-references','original'));throw Error('Project reference already exists; use a new version folder to preserve it.');}catch(e){if(e.code!=='ENOENT')throw e;}
const folder=join(actual,'characters');await mkdir(folder);
await writeFile(join(folder,'cast.json'),JSON.stringify({schemaVersion:1,characters},null,2)+'\n');
await copyFile(new URL('../templates/bridge/character-rig.ts',import.meta.url),join(folder,'character-rig.ts'));
for(const file of ['toon.ts','style.ts','face-style.ts','director.ts','hair-3d.ts','angle-designs.ts'])await copyFile(new URL('../templates/bridge/'+file,import.meta.url),join(folder,file));
await mkdir(join(actual,'character-references','original'),{recursive:true});
await writeFile(join(actual,'character-references','original','cast-design.json'),JSON.stringify({schemaVersion:1,characters},null,2)+'\n');
const referenceEngine=join(actual,'character-references','original','engine');await mkdir(referenceEngine,{recursive:true});
for(const file of ['character-rig.ts','toon.ts','style.ts','face-style.ts','director.ts','hair-3d.ts','angle-designs.ts'])await copyFile(join(folder,file),join(referenceEngine,file));
console.log('Preserved cast and rig in '+folder);
