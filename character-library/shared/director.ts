// Canonical defaults for new projects. Copy this file into the project's engine at creation.
// Story-specific casts, scene coordinates and timings belong in that project.
export const DIRECTOR = {
  character:{faceBase:'#faf9f5',faceShadow:'#dbd0da',faceLitGain:1.13,faceRimBoost:4.4,clothWrap:.035,headOutlineScale:.74,headOutlineTaper:.76,bodyRimInset:.053,bodyRimWidth:.026,bodyGlowWidth:.075,hairReflectionWidth:.023},
  camera:{endpointCreep:.08,endpointTangent:.35,defaultFov:39,preferredThreeQuarterDegrees:35,sideViewDegrees:60,windowClearance:.12},
} as const;
export const CHARACTER_ARCHETYPES = {
 civilian:{jacket:'#c78150',pants:'#3d5360',boots:'#302936',hat:'cap',cap:'#425b72'},
 researcher:{jacket:'#e7dfc8',pants:'#537375',boots:'#34333c',hat:'hair',hair:'#a6a29b',hairStyle:'receding',moustache:'#756b60'},
 official:{jacket:'#344b61',pants:'#34404d',boots:'#292b35',hat:'hair',hair:'#b3b3ad',hairStyle:'sidepart',moustache:'#8d8b83'},
 investigator:{jacket:'#596a63',pants:'#39474b',boots:'#302e35',hat:'fedora',cap:'#655044',moustache:'#3e302c'},
 archivist:{jacket:'#ba6e64',pants:'#445d60',boots:'#3e3031',hat:'hair',hair:'#713f31',hairStyle:'bob'},
} as const;
type V3=[number,number,number];
export type CameraPose={position:V3;target:V3;focus?:V3;fov?:number;blur?:number};
export type CameraKey=CameraPose & {at:number};
export function motionProgress(u:number){const t=Math.max(0,Math.min(1,u));return DIRECTOR.camera.endpointCreep*t+(1-DIRECTOR.camera.endpointCreep)*t*t*t*(t*(t*6-15)+10);}
/** Deterministic C1 camera path: position, aim, focus and lens travel together; no hidden cuts. */
export function cameraJourney(u:number,keys:readonly CameraKey[]):CameraPose{
  if(keys.length<2||keys[0].at!==0||keys[keys.length-1].at!==1||keys.some((k,i)=>i>0&&k.at<=keys[i-1].at))throw new Error('Camera path needs increasing keys spanning 0..1');
  const t=motionProgress(u);let i=0;while(i<keys.length-2&&t>keys[i+1].at)i++;
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
export const glideCamera=(u:number,from:CameraPose,to:CameraPose)=>cameraJourney(u,[{...from,at:0},{...to,at:1}]);

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
