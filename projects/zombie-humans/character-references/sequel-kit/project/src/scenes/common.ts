import * as THREE from 'three';
import type {V3} from '../types';
import {clamp,lerp} from '../types';
import {character,HORDE,type Character,type CharacterKind,type ActorState} from '../characters';

export type Shot={f:number;position:V3;target:V3;fov?:number;blur?:number;focus?:V3;ease?:'in'|'out'|'io'|'snap'|'lin'};
const curves={io:(t:number)=>t*t*(3-2*t),in:(t:number)=>t*t*t,out:(t:number)=>1-(1-t)**3,snap:(t:number)=>1-(1-t)**5,lin:(t:number)=>t};
/** Camera keyed by global frame. Repeat a pose to hold; each segment uses the destination key's easing. */
export function track(f:number,keys:Shot[]){
 let i=0;while(i<keys.length-2&&f>keys[i+1].f)i++;
 const a=keys[i],b=keys[Math.min(i+1,keys.length-1)];
 const t=b===a?0:clamp((f-a.f)/Math.max(1,b.f-a.f)),s=curves[b.ease??'io'](t);
 const v=(p:V3,q:V3):V3=>[lerp(p[0],q[0],s),lerp(p[1],q[1],s),lerp(p[2],q[2],s)];
 return {position:v(a.position,b.position),target:v(a.target,b.target),focus:v(a.focus??a.target,b.focus??b.target),fov:lerp(a.fov??39,b.fov??39,s),blur:lerp(a.blur??1.5,b.blur??1.5,s)};
}
/** Scene camera adapter: local u → global frame. */
export const byFrame=(f0:number,f1:number,keys:Shot[])=>(u:number)=>track(f0+u*(f1-1-f0),keys);
/** Small handheld shake (deterministic) added to a shot near frame `at`. */
export function shake(cam:ReturnType<typeof track>,f:number,at:number,len=10,amp=.06){const t=(f-at)/len;if(t<0||t>1)return cam;const k=amp*(1-t);
 return {...cam,position:[cam.position[0]+k*Math.sin(f*2.7),cam.position[1]+k*Math.cos(f*3.1),cam.position[2]] as V3};}

export type PortraitBeat={a:number;b:number;focus:V3|((f:number)=>V3);strength?:number;ease?:number};
export function portrait(beats:PortraitBeat[]){
 return (f:number)=>{for(const p of beats){if(f<p.a-.5||f>p.b+.5)continue;const e=p.ease??8,k=clamp(Math.min((f-p.a)/e,(p.b-f)/e,1));
  return {k,focus:typeof p.focus==='function'?p.focus(f):p.focus,strength:p.strength};}return undefined;};
}
export const rack=(A:V3,B:V3,at:number,len=14)=>(f:number):V3=>{const t=clamp((f-at)/len),s=t*t*(3-2*t);return [lerp(A[0],B[0],s),lerp(A[1],B[1],s),lerp(A[2],B[2],s)];};
export const v3=(x:number,y:number,z:number)=>new THREE.Vector3(x,y,z);

/** Expression timeline: [[frame,expr],...] → expression at f (cue 2 frames early). */
export const exprAt=(f:number,cues:[number,string][])=>{let e=cues[0][1];for(const [at,x] of cues)if(f>=at-2)e=x;return e;};
/** Turn timeline in camera-relative degrees, eased between keys. */
export const turnAt=(f:number,keys:[number,number][],len=8)=>{let v=keys[0][1];for(let i=1;i<keys.length;i++){const [at,x]=keys[i];if(f>=at){const t=clamp((f-at)/len);v=lerp(keys[i-1][1],x,t*t*(3-2*t));}}return v;};

export type Walker={actor:Character;from:V3;to:V3;a:number;b:number;turn:number;mode:'stroll'|'run';expr:string;lean?:number};
/** Crowd member that walks/runs from → to between frames a..b, idles (with sway) outside that span. */
export function walker(root:THREE.Object3D,kind:CharacterKind,o:Omit<Walker,'actor'>,offset=0):Walker{const actor=character(root,kind,...o.from);actor.timeOffset=offset;return {...o,actor};}
export function poseWalker(w:Walker,f:number,extra:ActorState={}){
 const t=clamp((f-w.a)/Math.max(1,w.b-w.a)),moving=f>=w.a&&f<w.b;
 w.actor.root.position.set(lerp(w.from[0],w.to[0],t),lerp(w.from[1],w.to[1],t),lerp(w.from[2],w.to[2],t));
 w.actor.pose(f,{expr:w.expr,turn:w.turn,mode:moving?w.mode:'stand',tilt:w.lean,...extra});
}
/** Survivors in the compound camp: granny warming by the fire, mum at the washing line, teen walking the yard, clerk on the bench. */
export function campLife(root:THREE.Object3D){
 const granny=character(root,'granny',1.4,0,-6.8),mum=character(root,'mum',-4.8,0,-7.6),teen=character(root,'teen',-2,0,-11),clerk=character(root,'clerk',2.6,0,-11.6);
 return (f:number)=>{granny.pose(f,{expr:'smile_closed',turn:-30,headTilt:.05*Math.sin(f*.03)});
  mum.pose(f,{expr:'smile',turn:25,action:'reach'});
  const t=(f%240)/240,dir=t<.5?1:-1,x=-2+(t<.5?t*2:2-t*2)*6;teen.root.position.set(x,0,-11.2);teen.pose(f,{expr:'neutral',turn:dir*55,mode:'stroll'});
  clerk.pose(f,{expr:'grin',turn:-20,wave:Math.sin(f*.05)>.6?1:undefined});};
}
/** A shambling horde: seeded positions in a box, slow advance toward +z (camera), all different designs. */
export function horde(root:THREE.Object3D,n:number,o:{x0:number;x1:number;z0:number;z1:number;y?:number;advance?:number;seed?:number;kinds?:CharacterKind[];turnBias?:number}){
 const kinds=o.kinds??HORDE;let s=(o.seed??3)*7919;const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647;};
 const list=Array.from({length:n},(_,i)=>{const x=lerp(o.x0,o.x1,(i+.5)/n+(rnd()-.5)*.6/n),z=lerp(o.z0,o.z1,rnd());const a=character(root,kinds[i%kinds.length],x,o.y??0,z);a.timeOffset=rnd()*20;
  return {actor:a,x,z,phase:rnd()*6,speed:.7+rnd()*.6,turn:(rnd()-.5)*50+(o.turnBias??0)};});
 return (f:number,opt:{walking?:boolean;advanceTo?:number;expr?:string}={})=>{for(const z of list){const adv=(opt.walking??true)?(o.advance??0)*z.speed*f/30:0;
  z.actor.root.position.set(z.x+.15*Math.sin(f*.03+z.phase),o.y??0,z.z+Math.min(adv,opt.advanceTo??99));
  z.actor.pose(f,{expr:opt.expr??(Math.sin(f*.02+z.phase)>.6?'pained':'dazed'),turn:z.turn+8*Math.sin(f*.04+z.phase),mode:(opt.walking??true)?'stroll':'stand',tilt:.08*Math.sin(f*.05+z.phase),headTilt:.12*Math.sin(f*.045+z.phase)});}};
}
