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
 hat:['hair','cap','fedora','beanie','helmet','peaked','tricorn','bandana','tophat','headband','sheriff','beret'],
 top:['jacket','shirt','sweater','vest','hoodie','coat','overalls','apron'],
 pattern:['none','stripes','hstripes','plaid','knit','dots'],
 collar:['shirt','turtleneck','vneck','none'],
 build:['adult','stout','kid'],
 accessories:['glasses','sunglasses','eyepatch','freckles','blush','stubble','scar','burns','bandages','oldburns','blood'],
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

/** Camera grammar by story beat (frames at 30 fps), the reference approach (references/camera-guide.md): the camera
 * moves nearly all the time, every shot pushes in 30-100 %, rests are slow pushes that land on the narrated word,
 * scenes join with a move (transitions.ts). `rest` = what the camera does while "resting" (never frozen). */
export const CAMERA_PACE = {
 hook:        {ease:'burst', moveFrames:[6,10],   rest:'push', note:'open moving on the strange act (first face < 1.5 s); punch in and land on the hook word'},
 setting:     {ease:'inOut', moveFrames:[90,210], rest:'push', note:'one 3-7 s journey: start on a detail and rise or pull back until the place towers (or the reverse)'},
 escalation:  {ease:'inOut', moveFrames:[30,60],  rest:'push', note:'1-2 s hops between faces landing on each noun; low angle looking up for power; roll 4-6 deg only inside a travel'},
 mystery:     {ease:'creep', moveFrames:[45,90],  rest:'push', note:'slow push on one face'},
 explanation: {ease:'inOut', moveFrames:[90,210], rest:'push', note:'follow the force through the mechanism in one move (hand, lever, rod, signal)'},
 payoff:      {ease:'burst', moveFrames:[4,8],    rest:'push', note:'very close after a wide, or the object comes to the lens; land on the last word'},
} as const;
/** Peak screen speed limits at 1080 px width. Ordinary moves p90 about 37 px/f (25 at 720p); only whips go faster, <= 10 f. */
export const CAMERA_SPEED_PX_PER_FRAME = {rest:1.8,slow:6,medium:20,ordinaryP90:37,whip:90} as const;

/** Pose that makes the subject at the look target `grow` bigger on screen (0.45 = 45 %), counting a lens change:
 * the lens slides along its aim. Use for the end key of a shot (rule: 30-100 % per shot). */
export function pushIn(from:CameraPose,grow:number,toFov=from.fov??39):CameraPose{
 const d=from.position.map((v,i)=>v-from.target[i]) as V3,dist=Math.hypot(...d),t=(f:number)=>Math.tan(f*Math.PI/360);
 const want=dist*t(from.fov??39)/((1+grow)*t(toFov)),k=want/(dist||1);
 return {...from,fov:toFov,position:from.target.map((v,i)=>v+d[i]*k) as V3};
}
/** Lens at character height looking at a character standing at `subject` (feet): chest about 0.9 m, eyes about 1.45 m.
 * yaw = degrees around the character from straight in front (+z). Keeps the look-down to the chest under 10 deg. */
export function eyeLevelPose(subject:V3,{distance=5,yaw=0,height=1.3,aim=1.3,fov=39}:{distance?:number;yaw?:number;height?:number;aim?:number;fov?:number}={}):CameraPose{
 const r=yaw*Math.PI/180;
 return {position:[subject[0]+Math.sin(r)*distance,subject[1]+height,subject[2]+Math.cos(r)*distance],target:[subject[0],subject[1]+aim,subject[2]],fov};
}
/** Crane from a high view down to character height (u 0..1). Start it before the character enters the frame:
 * high and top-down views are only for places and objects with no character in frame. */
export const craneDown=(u:number,high:CameraPose,eye:CameraPose)=>glideCamera(u,high,eye,motionProgress);

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
