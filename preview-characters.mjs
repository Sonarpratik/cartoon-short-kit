import {createServer} from 'node:http';
import {readFile,writeFile,rename,mkdir,access} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {characterReferencePath,characterRendererPath} from './character-library/paths.mjs';
const root=new URL('./',import.meta.url),catalog=new URL('character-library/cast.json',root);
// Ricks Clips puppet and motion code (gitignored newZip, personal-use licence), served read-only for the "ricksclips"
// renderer: /vendor/rc/vector2d_characters/code/** (characters) and /vendor/rc/motion_styles/** (moves). Only .mjs files.
const rcTemplates=resolve(fileURLToPath(root),process.env.RC_TEMPLATES||'newZip/RicksClips_Skill_V1.1/templates');
const routes={'/':['character-studio/index.html','text/html; charset=utf-8'],'/studio.js':['character-studio/studio.js','text/javascript'],'/character-rig.js':['templates/bridge/character-rig.ts','text/javascript'],'/toon.js':['templates/bridge/toon.ts','text/javascript'],'/style.js':['templates/bridge/style.ts','text/javascript'],'/face-style.js':['templates/bridge/face-style.ts','text/javascript'],'/director.js':['templates/bridge/director.ts','text/javascript'],'/puppet.js':['templates/bridge/puppet.ts','text/javascript']};
let saveQueue=Promise.resolve();
function validate(c){
 if(!c||typeof c!=='object')throw Error('Expected a character object');
 for(const key of ['id','name','project','identity','hairStyle'])if(typeof c[key]!=='string'||!c[key].trim()||c[key].length>120)throw Error('Invalid '+key);
 if(!/^[a-zA-Z0-9_-]+$/.test(c.id))throw Error('Invalid character ID');
 for(const key of ['jacket','pants','boots','hair','skin'])if(!/^#[0-9a-f]{6}$/i.test(c[key]))throw Error('Invalid '+key+' colour');
 if(!Number.isInteger(c.seed)||c.seed<0||c.seed>1000000||typeof c.coat!=='boolean')throw Error('Invalid seed or coat');
 if(!['sidepart','receding','spiky','bob','curly','afro','bun','ponytail','long','buzz','braid'].includes(c.hairStyle))throw Error('Unknown hair style');
 if(c.accessory!==undefined&&!['researcher','archivist','official','investigator'].includes(c.accessory))throw Error('Unknown accessory');
 if(c.accessories!==undefined&&(!Array.isArray(c.accessories)||c.accessories.length>5||c.accessories.some(a=>!['glasses','sunglasses','eyepatch','freckles','blush','stubble','scar','burns','bandages','oldburns','blood'].includes(a))))throw Error('Unknown accessories');
 if(c.facing!==undefined&&![-1,0,1].includes(c.facing))throw Error('Invalid facing');
 if(c.light!==undefined&&(!Number.isFinite(c.light)||Math.abs(c.light)>7))throw Error('Invalid light');
 if(c.outfit!==undefined){if(!c.outfit||typeof c.outfit!=='object'||Array.isArray(c.outfit))throw Error('Invalid outfit');for(const [key,value] of Object.entries(c.outfit)){if(!['jacket','pants','boots','hat','belt','buttons','sash','moustache','moustacheStyle','beard','skin','cap','hair','dress','build','hairStyle','rifle','sword','head','labCoat','top','shirt','sleeves','pattern','patternColor','collar','tie','scarf','apron','badge','pocket','buttonCount','hatAccent'].includes(key)||!['string','boolean','number'].includes(typeof value)&&value!==null)throw Error('Invalid outfit field');if(typeof value==='string'&&value.length>60)throw Error('Outfit value too long');}}
 if(c.rc!==undefined){if(!c.rc||typeof c.rc!=='object'||!Number.isInteger(c.rc.sheet)||c.rc.sheet<1||c.rc.sheet>15||typeof c.rc.name!=='string'||!/^[a-zA-Z0-9_-]{1,60}$/.test(c.rc.name)||c.rc.coat!==undefined&&!/^#[0-9a-f]{6}$/i.test(c.rc.coat))throw Error('Invalid Ricks Clips link');c.rc={sheet:c.rc.sheet,name:c.rc.name,...(c.rc.coat?{coat:c.rc.coat}:{})};}
 // Ricks look: one of our characters drawn with the Ricks Clips puppet; rcLook holds RC library keys (or 'none') per part.
 if(c.look!==undefined&&c.look!=='ricks')throw Error('Unknown look');
 if(c.faceStyle!==undefined&&!['rick','classic'].includes(c.faceStyle))throw Error('Unknown face style');
 if(c.props!==undefined&&(!Array.isArray(c.props)||c.props.length>20||c.props.some(p=>typeof p!=='string'||!/^[a-zA-Z0-9:_-]{1,80}$/.test(p))))throw Error('Invalid props');
 if(c.noParts!==undefined&&(!Array.isArray(c.noParts)||c.noParts.some(p=>!['hat','headBack','faceTop','behind','backOver','props','over','details'].includes(p))))throw Error('Invalid removed parts');
 if(c.faceCat!==undefined&&(typeof c.faceCat!=='string'||!/^[a-zA-Z0-9]{1,30}$/.test(c.faceCat)))throw Error('Invalid face category');
 // figure (puppet engine): body form / head shape keys, and S..XXXL size steps
 if(c.figure!==undefined){if(!c.figure||typeof c.figure!=='object'||Array.isArray(c.figure))throw Error('Invalid figure');for(const [key,value] of Object.entries(c.figure)){const sizes=['S','M','L','XL','XXL','XXXL'];
  if(['headSize','bodySize','legs','limbs','arms'].includes(key)){if(!sizes.includes(value))throw Error('Invalid figure size '+key);}
  else if(['form','headShape'].includes(key)){if(typeof value!=='string'||!/^[a-zA-Z0-9]{1,30}$/.test(value))throw Error('Invalid figure '+key);}else throw Error('Unknown figure field '+key);}}
 if(c.rcLook!==undefined){if(!c.rcLook||typeof c.rcLook!=='object'||Array.isArray(c.rcLook))throw Error('Invalid Ricks look');for(const [key,value] of Object.entries(c.rcLook))if(!['form','size','hair','hat','piece','outfit','beard','stache','acc'].includes(key)||typeof value!=='string'||!/^[a-zA-Z0-9]{1,40}$/.test(value))throw Error('Invalid Ricks look field '+key);}
 const keys=['id','name','project','identity','seed','jacket','pants','boots','hair','hairStyle','coat','skin','build','outfit','accessory','accessories','facing','light','rc','look','rcLook','faceStyle','figure','faceCat','props','noParts'];return Object.fromEntries(keys.filter(k=>c[k]!==undefined).map(k=>[k,c[k]]));
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
  const rc=pathname.match(/^\/vendor\/rc\/((?:vector2d_characters\/code(?:\/sheets)?|motion_styles(?:\/moves)?)\/[a-zA-Z0-9_-]+\.mjs)$/);
  if(rc&&req.method==='GET'){reply(200,await readFile(resolve(rcTemplates,rc[1]),'utf8'),'text/javascript');return;}
  const renderer=pathname.match(/^\/renderers\/([a-zA-Z0-9_-]+)\/(character-rig|toon|style|face-style|director|hair-3d|angle-designs)\.js$/);
  if(renderer&&req.method==='GET'){
   const folder=characterRendererPath(renderer[1],root)+'/engine/';let own=true;try{await access(new URL(folder+'character-rig.ts',root));}catch{own=false;}
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
