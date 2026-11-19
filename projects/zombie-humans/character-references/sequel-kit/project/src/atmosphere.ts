// Atmosphere and small-life layer: dust in light, light shafts, weather, birds, leaves, embers, confetti.
// Everything is deterministic from the global frame number (review stills match the final render).
import * as THREE from 'three';
import { NOINK } from './engine/ink';

type V3=[number,number,number];
type Tick=(f:number)=>void;
/** Register a per-frame updater on a scene root; the player runs them after the scene's pose(). */
export function addTick(root:THREE.Object3D,fn:Tick){(root.userData.ticks??=[] as Tick[]).push(fn);}
export function runTicks(root:THREE.Object3D,f:number){root.traverse(o=>{(o.userData.ticks as Tick[]|undefined)?.forEach(t=>t(f));});}

const hash=(i:number,k:number)=>{const x=Math.sin(i*127.1+k*311.7)*43758.5453;return x-Math.floor(x);};
function tex(w:number,h:number,draw:(g:CanvasRenderingContext2D)=>void){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d')!);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
const DOT=tex(64,64,g=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.35,'rgba(255,255,255,.55)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64);});
const SOFT=tex(128,128,g=>{const r=g.createRadialGradient(64,64,4,64,64,64);r.addColorStop(0,'rgba(255,255,255,.9)');r.addColorStop(.5,'rgba(255,255,255,.35)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,128,128);});
/** Vertical falloff for light shafts: bright at the source, fading out, soft at the edges. */
const SHAFT=tex(64,256,g=>{const v=g.createLinearGradient(0,0,0,256);v.addColorStop(0,'rgba(255,255,255,.95)');v.addColorStop(.6,'rgba(255,255,255,.35)');v.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=v;g.fillRect(0,0,64,256);
 g.globalCompositeOperation='destination-in';const h=g.createLinearGradient(0,0,64,0);h.addColorStop(0,'rgba(0,0,0,0)');h.addColorStop(.3,'rgba(0,0,0,1)');h.addColorStop(.7,'rgba(0,0,0,1)');h.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=h;g.fillRect(0,0,64,256);});
const sprite=(map:THREE.Texture,color:string,opacity:number,additive=true)=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map,color,transparent:true,opacity,depthWrite:false,blending:additive?THREE.AdditiveBlending:THREE.NormalBlending,fog:false}));s.layers.set(NOINK);return s;};

/** Floating dust motes drifting slowly inside a box; they twinkle as they cross the light. */
export function dust(root:THREE.Object3D,o:{center:V3;size:V3;count?:number;color?:string;scale?:number;opacity?:number;seed?:number}){
 const n=o.count??60,group=new THREE.Group();root.add(group);
 const motes=Array.from({length:n},(_,i)=>{const s=sprite(DOT,o.color??'#fff1cf',0);group.add(s);return s;});
 addTick(root,f=>motes.forEach((s,i)=>{const k=i+(o.seed??0)*97,t=f/30;
  const x=o.center[0]+(hash(k,1)-.5)*o.size[0]+.25*Math.sin(t*.35+k)+.08*Math.sin(t*1.3+k*2);
  const y=o.center[1]+(((hash(k,2)+t*.018*(.5+hash(k,6)))%1)-.5)*o.size[1];
  const z=o.center[2]+(hash(k,3)-.5)*o.size[2]+.2*Math.cos(t*.3+k);
  s.position.set(x,y,z);const sz=(o.scale??.045)*(.6+hash(k,4)*.9);s.scale.setScalar(sz);
  (s.material as THREE.SpriteMaterial).opacity=(o.opacity??.85)*(.35+.65*Math.max(0,Math.sin(t*(.6+hash(k,5))+k*3)));}));
 return group;
}
/** Visible beam of light (window shaft, street lamp cone, spotlight, sun ray) between two points. */
export function shaft(root:THREE.Object3D,o:{from:V3;to:V3;r0:number;r1:number;color:string;opacity?:number}){
 const a=new THREE.Vector3(...o.from),b=new THREE.Vector3(...o.to),len=a.distanceTo(b);
 const geo=new THREE.CylinderGeometry(o.r0,o.r1,len,32,1,true);geo.translate(0,-len/2,0);
 const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:SHAFT,color:o.color,transparent:true,opacity:o.opacity??.22,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
 m.position.copy(a);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,-1,0),b.clone().sub(a).normalize());m.layers.set(NOINK);m.renderOrder=5;root.add(m);
 m.userData.base=o.opacity??.22;return m;
}
/** Thin rain streaks; brighter where they pass through a light. */
export function rain(root:THREE.Object3D,o:{center:V3;size:V3;count?:number;color?:string;opacity?:number}){
 const n=o.count??160,geo=new THREE.PlaneGeometry(.012,.32),mat=new THREE.MeshBasicMaterial({color:o.color??'#bcd3ef',transparent:true,opacity:o.opacity??.35,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,side:THREE.DoubleSide});
 const drops=Array.from({length:n},()=>{const m=new THREE.Mesh(geo,mat);m.rotation.z=.12;m.layers.set(NOINK);root.add(m);return m;});
 addTick(root,f=>drops.forEach((m,i)=>{const t=((f*.06+hash(i,2))%1);m.position.set(o.center[0]+(hash(i,1)-.5)*o.size[0]-t*.35,o.center[1]+o.size[1]/2-t*o.size[1],o.center[2]+(hash(i,3)-.5)*o.size[2]);}));
}
/** Moths circling a lamp bulb. */
export function moths(root:THREE.Object3D,center:V3,n=5){
 const ms=Array.from({length:n},()=>{const s=sprite(DOT,'#3b3036',.9,false);s.scale.set(.06,.035,1);root.add(s);return s;});
 addTick(root,f=>ms.forEach((s,i)=>{const t=f/30*(1.6+hash(i,1))+i*2,rr=.25+.2*hash(i,2);s.position.set(center[0]+rr*Math.cos(t),center[1]+.15*Math.sin(t*2.3+i),center[2]+rr*Math.sin(t));s.scale.y=.035*(.4+.6*Math.abs(Math.sin(f*.9+i)));}));
}
/** Birds crossing the sky in a loose flock, wings flapping. */
export function birds(root:THREE.Object3D,o:{y:number;z:number;from:number;to:number;count?:number;color?:string;speed?:number;offset?:number}){
 const n=o.count??5,mat=new THREE.MeshBasicMaterial({color:o.color??'#2c2a35',side:THREE.DoubleSide,fog:false});
 const flock=Array.from({length:n},()=>{const b=new THREE.Group();for(const s of [-1,1]){const w=new THREE.Mesh(new THREE.PlaneGeometry(.38,.06),mat);w.geometry.translate(s*.19,0,0);w.layers.set(NOINK);b.add(w);}root.add(b);return b;});
 addTick(root,f=>flock.forEach((b,i)=>{const span=o.to-o.from,t=(((f+(o.offset??0))*(o.speed??.045)+hash(i,1)*.25)%1);b.position.set(o.from+span*t+(i%3)*.6,o.y+(i%2)*.5+.2*Math.sin(f*.05+i),o.z-(i%3)*.8);
  const flap=.55*Math.sin(f*.55+i*1.7);b.children[0].rotation.z=flap;b.children[1].rotation.z=-flap;}));
}
/** Leaves (or petals) drifting down and spinning. */
export function leaves(root:THREE.Object3D,o:{center:V3;size:V3;count?:number;colors?:string[]}){
 const cols=o.colors??['#e8a23c','#d9622f','#8fbf4f'],n=o.count??14;
 const ls=Array.from({length:n},(_,i)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(.14,.09),new THREE.MeshLambertMaterial({color:cols[i%cols.length],side:THREE.DoubleSide}));m.layers.set(NOINK);root.add(m);return m;});
 addTick(root,f=>ls.forEach((m,i)=>{const t=((f/30)*.09+hash(i,1))%1;m.position.set(o.center[0]+(hash(i,2)-.5)*o.size[0]+.6*Math.sin(f*.04+i),o.center[1]+o.size[1]/2-t*o.size[1],o.center[2]+(hash(i,3)-.5)*o.size[2]);m.rotation.set(f*.07+i,f*.05,f*.09+i*2);}));
}
/** Sparks rising from a fire. */
export function embers(root:THREE.Object3D,center:V3,n=14){
 const es=Array.from({length:n},()=>{const s=sprite(DOT,'#ffae4a',0);root.add(s);return s;});
 addTick(root,f=>es.forEach((s,i)=>{const t=((f/30)*.45+hash(i,1))%1;s.position.set(center[0]+(hash(i,2)-.5)*.6+.15*Math.sin(f*.1+i),center[1]+t*1.4,center[2]+(hash(i,3)-.5)*.3);s.scale.setScalar(.05*(1-t)+.01);(s.material as THREE.SpriteMaterial).opacity=(1-t)*.9;}));
}
/** Confetti burst falling from above. */
export function confetti(root:THREE.Object3D,o:{center:V3;size:V3;count?:number;start?:number}){
 const cols=['#ffd76a','#ff6fa8','#6fd3ff','#8be07a','#ffffff'],n=o.count??70;
 const cs=Array.from({length:n},(_,i)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(.08,.05),new THREE.MeshBasicMaterial({color:cols[i%cols.length],side:THREE.DoubleSide,fog:false}));m.layers.set(NOINK);root.add(m);return m;});
 addTick(root,f=>cs.forEach((m,i)=>{const t=((f-(o.start??0))/30*.22+hash(i,1))%1;m.position.set(o.center[0]+(hash(i,2)-.5)*o.size[0]+.3*Math.sin(f*.08+i),o.center[1]+o.size[1]/2-t*o.size[1],o.center[2]+(hash(i,3)-.5)*o.size[2]);m.rotation.set(f*.2+i,f*.13+i,f*.17);}));
}
/** Low drifting mist / haze bank (soft sprites). */
export function mist(root:THREE.Object3D,o:{center:V3;size:V3;count?:number;color?:string;opacity?:number;scale?:number}){
 const n=o.count??10,ps=Array.from({length:n},()=>{const s=sprite(SOFT,o.color??'#9fb6cc',o.opacity??.12,false);root.add(s);return s;});
 addTick(root,f=>ps.forEach((s,i)=>{const t=f/30;s.position.set(o.center[0]+(hash(i,1)-.5)*o.size[0]+.4*Math.sin(t*.12+i),o.center[1]+(hash(i,2)-.5)*o.size[1],o.center[2]+(hash(i,3)-.5)*o.size[2]);s.scale.setScalar((o.scale??3)*(.7+.6*hash(i,4)));}));
}
/** A burst of dust clouds (car arrival, building rising); visible between start and start+len frames. */
export function dustBurst(root:THREE.Object3D,o:{center:V3;spread:number;start:number;len?:number;count?:number;color?:string;size?:number}){
 const n=o.count??10,len=o.len??30,ps=Array.from({length:n},()=>{const s=sprite(SOFT,o.color??'#e9dcc4',0,false);root.add(s);return s;});
 addTick(root,f=>ps.forEach((s,i)=>{const t=(f-o.start-(i%4)*2)/len;s.visible=t>0&&t<1;if(!s.visible)return;const a=hash(i,1)*Math.PI*2,d=o.spread*(.3+.7*hash(i,2))*Math.sqrt(t);
  s.position.set(o.center[0]+Math.cos(a)*d,o.center[1]+t*.9*(.5+hash(i,3)),o.center[2]+Math.sin(a)*d*.5);s.scale.setScalar((o.size??1.2)*(.4+t));(s.material as THREE.SpriteMaterial).opacity=.75*(1-t);}));
}
/** Twinkling sparkle stars (magic). */
export function sparkles(root:THREE.Object3D,o:{center:V3;size:V3;count?:number;color?:string;start?:number;end?:number}){
 const n=o.count??16,ps=Array.from({length:n},()=>{const s=sprite(DOT,o.color??'#fff3b0',0);root.add(s);return s;});
 addTick(root,f=>ps.forEach((s,i)=>{const on=f>=(o.start??-1e9)&&f<(o.end??1e9);const ph=Math.sin(f*.35+i*2.3);s.visible=on&&ph>0;if(!s.visible)return;
  s.position.set(o.center[0]+(hash(i,1)-.5)*o.size[0],o.center[1]+(hash(i,2)-.5)*o.size[1],o.center[2]+(hash(i,3)-.5)*o.size[2]);s.scale.setScalar(.18*ph);(s.material as THREE.SpriteMaterial).opacity=ph;}));
}
