import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url),project=new URL('projects/mkultra/src/',root),destination=new URL('projects/mkultra/character-references/original/',root);
const moduleURL=source=>'data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64');
const director=await readFile(new URL('engine/director.ts',project),'utf8');
const designsSource=stripTypeScriptTypes(await readFile(new URL('cast-design.ts',project),'utf8')).replace("'./engine/director'",JSON.stringify(moduleURL(director)));
const {CAST_DESIGNS}=await import(moduleURL(designsSource));
const characters=Object.entries(CAST_DESIGNS).map(([kind,design])=>({id:'mkultra-'+kind,name:'MKUltra - '+design.name,project:'mkultra',identity:'mkultra-'+kind,seed:design.seed,jacket:design.outfit.jacket,pants:design.outfit.pants,boots:design.outfit.boots,hair:design.outfit.hair??'#634331',hairStyle:design.outfit.hairStyle??'sidepart',coat:false,skin:'#faf9f5',facing:0,light:-Math.PI*2/3,outfit:{...design.outfit,skin:'#faf9f5'},...(kind==='civilian'?{}:{accessory:kind})}));
await mkdir(new URL('engine/',destination),{recursive:true});const hashes={};
for(const file of ['cast-design.ts','characters.ts','character-preview.ts','face-style.ts','engine/toon.ts','engine/style.ts','engine/director.ts']){
 const bytes=await readFile(new URL(file,project)),to=new URL(file,destination);let existing;try{existing=await readFile(to);}catch(e){if(e.code!=='ENOENT')throw e;}
 if(existing&&!existing.equals(bytes))throw Error('Existing MKUltra reference differs: '+file);
 if(!existing)await writeFile(to,bytes);hashes[file]=createHash('sha256').update(bytes).digest('hex');
}
await writeFile(new URL('designs.json',destination),JSON.stringify({schemaVersion:1,characters},null,2)+'\n');
await writeFile(new URL('source-hashes.json',destination),JSON.stringify(hashes,null,2)+'\n');
const catalog=new URL('character-library/cast.json',root),data=JSON.parse(await readFile(catalog,'utf8'));
for(const c of characters)if(!data.characters.some(old=>old.id===c.id))data.characters.push(c);
await writeFile(catalog,JSON.stringify(data,null,2)+'\n');console.log('Preserved MKUltra source and registered: '+characters.map(c=>c.name).join(', '));
