// Character Studio renderer for the Ricks Clips vector puppets (150 characters, sheets 01-15).
// The puppet code itself is NOT in this repo: it is served by preview-characters.mjs from
// newZip/RicksClips_Skill_V1.1/templates/vector2d_characters/code (personal-use licence, gitignored;
// override with the RC_CHARACTERS env var). This file only adapts it to the Studio's
// drawCharacter(context, design, pose) contract: 600x1000 design space, feet near y=975.
// Their rig has four views (front, 3/4, side, back) and fixed per-character faces, so yaw is
// snapped to the nearest view and action / expression / pitch are ignored.
import {buildChar} from '/vendor/ricksclips/castkit.mjs';
import {drawCharacter as drawSvg} from '/vendor/ricksclips/char2d.mjs';

const SHEETS=await Promise.all(Array.from({length:15},(_,i)=>import(`/vendor/ricksclips/sheets/sheet${String(i+1).padStart(2,'0')}.mjs`)));
export const VIEWS=Array.from({length:12},(_,i)=>i*30);
export const ACTIONS=['idle'];
export const EXPRESSIONS=['neutral'];

// yaw 0 = front, 90 = facing screen-right, 180 = back, 270 = facing screen-left.
export function rcView(yaw){
 const d=((Number(yaw)||0)%360+360)%360;
 if(d<=15||d>=345)return ['front',1];
 if(d<75)return ['34',1];
 if(d<=120)return ['side',1];
 if(d<240)return ['back',1];
 if(d<=285)return ['side',-1];
 return ['34',-1];
}

export function rcSpec(design){
 const sheet=SHEETS[(design.rc?.sheet??0)-1];
 const spec=sheet?.CAST.find(s=>s.name===design.rc?.name);
 if(!spec)throw Error('Unknown Ricks Clips character: '+JSON.stringify(design.rc));
 return spec;
}

// Their frame: character centred at x=300, ground at y=1010. Shown through this viewBox, the feet
// land at y~973 of the Studio's 1000-unit canvas and tall hats keep ~70 units of headroom.
const VB='-30 -70 660 1110';
export function rcSvg(design,yaw=0){
 const [view,dir]=rcView(yaw),S=buildChar(rcSpec(design),300);
 if(design.jacket&&design.rc?.coat&&design.jacket.toLowerCase()!==design.rc.coat.toLowerCase())S.coat=design.jacket;
 S.view=view;S.dir=dir;
 const r=drawSvg(S);
 return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="1000" viewBox="${VB}"><defs>${r.defs}</defs>${r.body}</svg>`;
}

const cache=new Map();
export function drawCharacter(context,design,pose={}){
 if(!design?.rc)return;
 const [view,dir]=rcView(pose.yaw),key=[design.rc.sheet,design.rc.name,view,dir,design.jacket].join('|');
 let image=cache.get(key);
 if(!image){
  if(cache.size>400)cache.delete(cache.keys().next().value);
  image=new Image();image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(rcSvg(design,pose.yaw));cache.set(key,image);
 }
 // The SVG decodes asynchronously; the Studio redraws every frame, so the first frame may be empty.
 if(image.complete&&image.naturalWidth)context.drawImage(image,0,0,600,1000);
}
