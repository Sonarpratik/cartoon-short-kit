import {createServer} from 'node:http';
import {readFile,writeFile,rename,mkdir,access} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
import {characterReferencePath} from './character-library/paths.mjs';
const root=new URL('./',import.meta.url),catalog=new URL('character-library/cast.json',root);
const routes={'/':['character-studio/index.html','text/html; charset=utf-8'],'/studio.js':['character-studio/studio.js','text/javascript'],'/character-rig.js':['templates/bridge/character-rig.ts','text/javascript'],'/toon.js':['templates/bridge/toon.ts','text/javascript'],'/style.js':['templates/bridge/style.ts','text/javascript'],'/face-style.js':['templates/bridge/face-style.ts','text/javascript'],'/director.js':['templates/bridge/director.ts','text/javascript']};
let saveQueue=Promise.resolve();
function validate(c){
 if(!c||typeof c!=='object')throw Error('Expected a character object');
 for(const key of ['id','name','project','identity','hairStyle'])if(typeof c[key]!=='string'||!c[key].trim()||c[key].length>120)throw Error('Invalid '+key);
 if(!/^[a-zA-Z0-9_-]+$/.test(c.id))throw Error('Invalid character ID');
 for(const key of ['jacket','pants','boots','hair','skin'])if(!/^#[0-9a-f]{6}$/i.test(c[key]))throw Error('Invalid '+key+' colour');
 if(!Number.isInteger(c.seed)||c.seed<0||c.seed>1000000||typeof c.coat!=='boolean')throw Error('Invalid seed or coat');
 if(!['sidepart','receding','spiky','bob'].includes(c.hairStyle))throw Error('Unknown hair style');
 if(c.accessory!==undefined&&!['researcher','archivist','official','investigator'].includes(c.accessory))throw Error('Unknown accessory');
 if(c.facing!==undefined&&![-1,0,1].includes(c.facing))throw Error('Invalid facing');
 if(c.light!==undefined&&(!Number.isFinite(c.light)||Math.abs(c.light)>7))throw Error('Invalid light');
 if(c.outfit!==undefined){if(!c.outfit||typeof c.outfit!=='object'||Array.isArray(c.outfit))throw Error('Invalid outfit');for(const [key,value] of Object.entries(c.outfit)){if(!['jacket','pants','boots','hat','belt','buttons','sash','moustache','beard','skin','cap','hair','dress','build','hairStyle','rifle','sword','head','labCoat'].includes(key)||!['string','boolean','number'].includes(typeof value)&&value!==null)throw Error('Invalid outfit field');if(typeof value==='string'&&value.length>60)throw Error('Outfit value too long');}}
 const keys=['id','name','project','identity','seed','jacket','pants','boots','hair','hairStyle','coat','skin','build','outfit','accessory','facing','light'];return Object.fromEntries(keys.filter(k=>c[k]!==undefined).map(k=>[k,c[k]]));
}
const server=createServer(async(req,res)=>{
 const pathname=new URL(req.url,'http://127.0.0.1').pathname;
 const reply=(code,data,type='application/json')=>{res.writeHead(code,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(type==='application/json'?JSON.stringify(data):data);};
 try{
  if(pathname==='/api/cast'&&req.method==='GET'){reply(200,JSON.parse(await readFile(catalog,'utf8')));return;}
  const sheet=pathname.match(/^\/turnarounds\/([a-zA-Z0-9_-]+)\.(png|json)$/);
  if(sheet&&req.method==='GET'){const data=JSON.parse(await readFile(catalog,'utf8')),character=data.characters.find(c=>c.id===sheet[1]);if(!character||!/^[a-zA-Z0-9_-]+$/.test(character.project)){reply(404,{error:'Unknown character'});return;}const bytes=await readFile(new URL(`${characterReferencePath(character.project)}/turnarounds/${character.id}.${sheet[2]}`,root));reply(200,sheet[2]==='json'?JSON.parse(bytes.toString('utf8')):bytes,sheet[2]==='json'?'application/json':'image/png');return;}
  if(pathname==='/approved-cast.png'&&req.method==='GET'){reply(200,await readFile(new URL('projects/bootstrap-paradox/character-references/original/approved-cast.png',root)),'image/png');return;}
  if(pathname==='/studio-cast.png'&&req.method==='GET'){reply(200,await readFile(new URL('character-library/shared/studio-cast.png',root)),'image/png');return;}
  const renderer=pathname.match(/^\/renderers\/([a-zA-Z0-9_-]+)\/(character-rig|toon|style|face-style|director|hair-3d|angle-designs)\.js$/);
  if(renderer&&req.method==='GET'){
   const folder=characterReferencePath(renderer[1])+'/engine/';let own=true;try{await access(new URL(folder+'character-rig.ts',root));}catch{own=false;}
   const file=new URL((own?folder:'templates/bridge/')+renderer[2]+'.ts',root);let source=stripTypeScriptTypes(await readFile(file,'utf8'));source=source.replace(/(from\s+['"])(\.\/[\w-]+)(['"])/g,'$1$2.js$3');reply(200,source,'text/javascript');return;
  }
  if(pathname==='/api/characters'&&req.method==='POST'){
   if(req.headers.origin&&req.headers.origin!==`http://${req.headers.host}`){reply(403,{error:'Cross-origin save rejected'});return;}
   let body='';for await(const chunk of req){body+=chunk;if(body.length>20000){reply(413,{error:'Character is too large'});return;}}
   const character=validate(JSON.parse(body));
   const operation=saveQueue.then(async()=>{const data=JSON.parse(await readFile(catalog,'utf8'));if(data.characters.some(c=>c.id===character.id))throw Error('ID already saved. Use a new ID to preserve the original.');const folder=new URL(characterReferencePath(character.project)+'/variants/',root);await mkdir(folder,{recursive:true});await writeFile(new URL(character.id+'.json',folder),JSON.stringify(character,null,2)+'\n');data.characters.push(character);const temp=new URL('character-library/cast.tmp.json',root);await writeFile(temp,JSON.stringify(data,null,2)+'\n');await rename(temp,catalog);return data;});saveQueue=operation.catch(()=>{});reply(201,await operation);return;
  }
  const route=pathname==='/hair-3d.js'?['templates/bridge/hair-3d.ts','text/javascript']:pathname==='/angle-designs.js'?['templates/bridge/angle-designs.ts','text/javascript']:routes[pathname];if(!route||req.method!=='GET'){reply(404,{error:'Not found'});return;}
  let source=await readFile(new URL(route[0],root),'utf8');if(route[0].endsWith('.ts'))source=stripTypeScriptTypes(source).replace(/(from\s+['"])(\.\/[\w-]+)(['"])/g,'$1$2.js$3');reply(200,source,route[1]);
 }catch(error){reply(400,{error:error.message});}
});
server.on('error',e=>{console.error(e.message);process.exitCode=1;});
const port=Number(process.env.PORT||8787);server.listen(port,'127.0.0.1',()=>console.log(`Character Studio: http://127.0.0.1:${port}`));
