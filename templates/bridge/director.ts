// Canonical defaults for new projects. Copy this file into the project's engine at creation.
// Story-specific casts, scene coordinates and timings belong in that project.
export const DIRECTOR = {
  character:{faceBase:'#faf9f5',faceShadow:'#dbd0da',faceLitGain:1.13,faceRimBoost:4.4,clothWrap:.035,headOutlineScale:.74,headOutlineTaper:.76,bodyRimInset:.053,bodyRimWidth:.026,bodyGlowWidth:.075,hairReflectionWidth:.023},
  camera:{endpointCreep:.08,endpointTangent:.35,defaultFov:39,preferredThreeQuarterDegrees:35,sideViewDegrees:60,windowClearance:.12},
} as const;
/** Legacy MKUltra office cast (1950s investigators). Kept for old projects; do NOT use as the default for new stories.
 * Design each new story's cast from WARDROBE instead and run castDistinctness() on it. */
export const CHARACTER_ARCHETYPES = {
 civilian:{jacket:'#c78150',pants:'#3d5360',boots:'#302936',hat:'cap',cap:'#425b72'},
 researcher:{jacket:'#e7dfc8',pants:'#537375',boots:'#34333c',hat:'hair',hair:'#a6a29b',hairStyle:'receding',moustache:'#756b60'},
 official:{jacket:'#344b61',pants:'#34404d',boots:'#292b35',hat:'hair',hair:'#b3b3ad',hairStyle:'sidepart',moustache:'#8d8b83'},
 investigator:{jacket:'#596a63',pants:'#39474b',boots:'#302e35',hat:'fedora',cap:'#655044',moustache:'#3e302c'},
 archivist:{jacket:'#ba6e64',pants:'#445d60',boots:'#3e3031',hat:'hair',hair:'#713f31',hairStyle:'bob'},
} as const;
/** Every option the shared rig can draw. Combine per story; see references/character-design.md. */
export const WARDROBE = {
 hairStyle:['sidepart','receding','bob','spiky','curly','afro','bun','ponytail','long','buzz','braid'],
 hat:['hair','cap','fedora','beanie','helmet','peaked','tricorn','bandana','tophat','headband','sheriff'],
 top:['jacket','shirt','sweater','vest','hoodie','coat','overalls','apron'],
 pattern:['none','stripes','hstripes','plaid','knit','dots'],
 collar:['shirt','turtleneck','vneck','none'],
 build:['adult','stout','kid'],
 accessories:['glasses','sunglasses','eyepatch','freckles','blush','stubble','scar'],
 extras:['tie','scarf','badge','pocket','apron','beard','moustache','labCoat','hatAccent','sleeves'],
} as const;
type CastMember={id:string;hairStyle:string;jacket:string;pants:string;build?:string;outfit?:{hat?:string|null;top?:string;pattern?:string;cap?:string}};
/** Flags cast pairs that would read as the same person at phone size.
 * Each character is reduced to a silhouette (head shape), a garment and a colour pair; two shared traits is a clash. */
export function castDistinctness(cast:readonly CastMember[]){
 const head=(c:CastMember)=>c.outfit?.hat&&c.outfit.hat!=='hair'?'hat:'+c.outfit.hat:'hair:'+c.hairStyle;
 const garment=(c:CastMember)=>(c.outfit?.top??'jacket')+'/'+(c.outfit?.pattern??'none')+'/'+(c.build??'adult');
 const hue=(hex:string)=>{const n=parseInt(hex.slice(1),16),r=(n>>16)/255,g=(n>>8&255)/255,b=(n&255)/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b);if(mx-mn<.08)return 'grey'+Math.round(mx*3);const h=mx===r?((g-b)/(mx-mn)+6)%6:mx===g?(b-r)/(mx-mn)+2:(r-g)/(mx-mn)+4;return 'h'+Math.round(h)%6;};
 const clashes:{a:string;b:string;shared:string[]}[]=[];
 for(let i=0;i<cast.length;i++)for(let j=i+1;j<cast.length;j++){const a=cast[i],b=cast[j],shared:string[]=[];
  if(head(a)===head(b))shared.push('head '+head(a));
  if(garment(a)===garment(b))shared.push('garment '+garment(a));
  if(hue(a.jacket)===hue(b.jacket))shared.push('main colour');
  if(shared.length>=2)clashes.push({a:a.id,b:b.id,shared});}
 return {ok:!clashes.length,clashes};
}

type V3=[number,number,number];
export type CameraPose={position:V3;target:V3;focus?:V3;fov?:number;blur?:number};
export type CameraKey=CameraPose & {at:number};
/** Symmetric ease-in-out with a slight creep at the ends. Use for slow glides (establishing, explanation drift). */
export function motionProgress(u:number){const t=Math.max(0,Math.min(1,u));return DIRECTOR.camera.endpointCreep*t+(1-DIRECTOR.camera.endpointCreep)*t*t*t*(t*(t*6-15)+10);}
/** Measured reference move: peak speed on the first frame, decaying over the move. Use for punch-ins, reframes, whips. */
export function easeOutBurst(u:number){const t=Math.max(0,Math.min(1,u));return 1-(1-t)**4;}
/** Constant-speed creep (slow push-ins under a held moment). */
export const linearProgress=(u:number)=>Math.max(0,Math.min(1,u));
export const EASE={inOut:motionProgress,burst:easeOutBurst,creep:linearProgress} as const;

/** Camera grammar by story beat (frames at 30 fps). See references/camera-guide.md for when to use each. */
export const CAMERA_PACE = {
 hook:        {ease:'burst', moveFrames:[6,10],   hold:true,  note:'fast punch-in or whip into the paradox, then hold on the face/prop'},
 setting:     {ease:'inOut', moveFrames:[60,120], hold:false, note:'slow establishing glide or aerial descent that shows geography'},
 escalation:  {ease:'burst', moveFrames:[8,14],   hold:true,  note:'short burst reframes between holds; low angles; dutch tilt on shocks'},
 mystery:     {ease:'creep', moveFrames:[45,90],  hold:false, note:'very slow push-in on one face'},
 explanation: {ease:'inOut', moveFrames:[60,150], hold:true,  note:'mostly holds and slow drift; insert close-ups of the mechanism'},
 payoff:      {ease:'burst', moveFrames:[4,8],    hold:true,  note:'snap zoom or impact kick, then a still hold to the last word'},
} as const;
/** Peak screen speed limits at 1080 px width, measured from the reference channel. */
export const CAMERA_SPEED_PX_PER_FRAME = {hold:.5,slow:3,medium:12,fast:35,whip:80} as const;

/** Deterministic C1 camera path: position, aim, focus and lens travel together; no hidden cuts.
 * `ease` picks the speed profile: EASE.inOut (default glide), EASE.burst (punch), EASE.creep (slow push). */
export function cameraJourney(u:number,keys:readonly CameraKey[],ease:(u:number)=>number=motionProgress):CameraPose{
  if(keys.length<2||keys[0].at!==0||keys[keys.length-1].at!==1||keys.some((k,i)=>i>0&&k.at<=keys[i-1].at))throw new Error('Camera path needs increasing keys spanning 0..1');
  const t=ease(u);let i=0;while(i<keys.length-2&&t>keys[i+1].at)i++;
  const a=keys[i],b=keys[i+1],p=keys[Math.max(0,i-1)],n=keys[Math.min(keys.length-1,i+2)],dt=b.at-a.at,s=(t-a.at)/dt;
  const h00=2*s*s*s-3*s*s+1,h10=s*s*s-2*s*s+s,h01=-2*s*s*s+3*s*s,h11=s*s*s-s*s;
  const scalar=(pv:number,av:number,bv:number,nv:number)=>{
    const m0=(bv-pv)/(b.at-p.at)*(i===0?DIRECTOR.camera.endpointTangent:1);
    const m1=(nv-av)/(n.at-a.at)*(i===keys.length-2?DIRECTOR.camera.endpointTangent:1);
    return h00*av+h10*dt*m0+h01*bv+h11*dt*m1;
  };
  const vector=(name:'position'|'target'|'focus'):V3=>[0,1,2].map(j=>scalar((p[name]??p.target)[j],(a[name]??a.target)[j],(b[name]??b.target)[j],(n[name]??n.target)[j])) as V3;
  return {position:vector('position'),target:vector('target'),focus:vector('focus'),fov:scalar(p.fov??39,a.fov??39,b.fov??39,n.fov??39),blur:scalar(p.blur??0,a.blur??0,b.blur??0,n.blur??0)};
}
export const glideCamera=(u:number,from:CameraPose,to:CameraPose,ease:(u:number)=>number=motionProgress)=>cameraJourney(u,[{...from,at:0},{...to,at:1}],ease);
/** Reference rhythm: a fast ease-out move of `moveFrames`, then a hold with an optional slow creep towards `creepTo`. */
export function burstThenHold(frame:number,start:number,moveFrames:number,from:CameraPose,to:CameraPose,creepTo?:CameraPose,holdFrames=60){
 if(frame<start+moveFrames)return glideCamera((frame-start)/moveFrames,from,to,easeOutBurst);
 return creepTo?glideCamera((frame-start-moveFrames)/holdFrames,to,creepTo,linearProgress):glideCamera(1,from,to);
}

export type CameraFrameKey=CameraPose & {frame:number};
/** Shared camera track across narrative beats. Keys land on exact frames, without global easing shifting cues. */
export function cameraSequence(frame:number,keys:readonly CameraFrameKey[]):CameraPose{
 if(keys.length<2||keys.some((k,i)=>i>0&&k.frame<=keys[i-1].frame))throw Error('Camera sequence requires increasing frame keys');
 const f=Math.max(keys[0].frame,Math.min(keys[keys.length-1].frame,frame));let i=0;while(i<keys.length-2&&f>keys[i+1].frame)i++;
 const a=keys[i],b=keys[i+1],p=keys[Math.max(0,i-1)],n=keys[Math.min(keys.length-1,i+2)],dt=b.frame-a.frame,t=(f-a.frame)/dt;
 const scalar=(pv:number,av:number,bv:number,nv:number)=>{const v0=i===0?0:(bv-pv)/(b.frame-p.frame),v1=i===keys.length-2?0:(nv-av)/(n.frame-a.frame);return(2*t*t*t-3*t*t+1)*av+(t*t*t-2*t*t+t)*dt*v0+(-2*t*t*t+3*t*t)*bv+(t*t*t-t*t)*dt*v1;};
 const vector=(name:'position'|'target'|'focus')=>[0,1,2].map(j=>scalar((p[name]??p.target)[j],(a[name]??a.target)[j],(b[name]??b.target)[j],(n[name]??n.target)[j])) as V3;
 return{position:vector('position'),target:vector('target'),focus:vector('focus'),fov:scalar(p.fov??39,a.fov??39,b.fov??39,n.fov??39),blur:scalar(p.blur??0,a.blur??0,b.blur??0,n.blur??0)};
}
/** Reports positional/aim/lens discontinuities at a proposed same-location edit. */
export function cameraBoundary(a:CameraPose,b:CameraPose){const distance=(x:V3,y:V3)=>Math.hypot(...x.map((v,i)=>v-y[i]));return{positionGap:distance(a.position,b.position),targetGap:distance(a.target,b.target),fovGap:Math.abs((a.fov??39)-(b.fov??39))};}
