// Preserve the checked shared motion renderer alongside the saved character references.
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const source=new URL('../templates/bridge/',import.meta.url),destination=new URL('../references/characters/shared/',import.meta.url);
await mkdir(destination,{recursive:true});const files={};
for(const file of ['character-rig.ts','toon.ts','style.ts','face-style.ts','director.ts','hair-3d.ts','angle-designs.ts']){const from=new URL(file,source),data=await readFile(from);await copyFile(from,new URL(file,destination));files[file]=createHash('sha256').update(data).digest('hex');}
await writeFile(new URL('manifest.json',destination),JSON.stringify({description:'Checked shared character motion renderer. Original project design references are preserved separately.',files},null,2)+'\n');
console.log('Preserved shared renderer in references/characters/shared/');
