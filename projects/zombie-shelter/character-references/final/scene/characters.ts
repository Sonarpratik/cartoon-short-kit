import * as THREE from 'three';
import { drawCharacter,frontSafeYaw,type CharacterDesign } from '../characters/character-rig';
import { headBlob } from '../characters/toon';
import castFile from '../characters/cast.json';
import { cardShade } from './engine/cardshade';
import { NOINK } from './engine/ink';
import type {V3} from './types';

/** Story roles → Character Studio designs (character-library/cast.json, project "zombie-shelter"). */
export const ROLES={host:'zs-host-sheriff',bitten:'zs-bitten',bittenTurned:'zs-bitten-turned',neighbour:'zs-neighbour',neighbourTurned:'zs-neighbour-turned',stranger:'zs-stranger',
 mum:'zs-crowd-mum',teen:'zs-crowd-teen',granny:'zs-crowd-granny',clerk:'zs-crowd-clerk',cop:'zs-crowd-cop',
 zOffice:'zs-zombie-office',zWorker:'zs-zombie-worker',zHoodie:'zs-zombie-hoodie',zNurse:'zs-zombie-nurse',zTourist:'zs-zombie-tourist',zGranny:'zs-zombie-granny',zJogger:'zs-zombie-jogger',zChef:'zs-zombie-chef'} as const;
/** Horde order: neighbours in a crowd never repeat a design. */
export const HORDE:CharacterKind[]=['zOffice','zWorker','zHoodie','zNurse','zTourist','zGranny','zJogger','zChef'];
export const SURVIVORS:CharacterKind[]=['mum','teen','granny','clerk','cop'];
export type CharacterKind=keyof typeof ROLES;
const DESIGNS=new Map((castFile.characters as CharacterDesign[]).map(d=>[d.id,d]));
const EXPR_ALIASES:Record<string,string>={};

export type ActorState={action?:'idle'|'walk'|'run'|'sit'|'bend'|'reach'|'wave'|'talk';expr?:string;wave?:number;mode?:'stand'|'sit'|'stroll'|'run';phase?:number;headTilt?:number;hand?:[number,number];
 /** -1 / 0 / 1 → three-quarter left / front / three-quarter right. `turn` (degrees, camera-relative) overrides it. */
 facing?:-1|0|1;turn?:number;look?:number;tilt?:number;cane?:boolean;blinkShut?:boolean};
const UNIT=.0026,FPS=30;
export class Character {
 root=new THREE.Group(); mesh:THREE.Mesh; private cv:HTMLCanvasElement;private texture:THREE.CanvasTexture;
 private proxy:THREE.Mesh;design:CharacterDesign;
 private faceFrame={value:new THREE.Vector4(.5,.691,.197,.111)};private key={value:new THREE.Vector4(0,1,0,0)};private keyCol={value:new THREE.Color(1,1,1)};
 private head={y:500,a:60,b:60};private state:ActorState={};private frame=0;private expr='neutral';private fromExpr='neutral';private exprAt=-999;
 constructor(public kind:CharacterKind){
  const d=DESIGNS.get(ROLES[kind]);if(!d)throw new Error('Missing Studio design '+ROLES[kind]);this.design=d;
  this.root.userData.actor=this;
  this.cv=document.createElement('canvas');this.cv.width=900;this.cv.height=1500;
  this.texture=new THREE.CanvasTexture(this.cv);this.texture.colorSpace=THREE.SRGBColorSpace;this.texture.anisotropy=8;
  const geo=new THREE.PlaneGeometry(1.56,2.6);geo.translate(0,(975-500)*UNIT,0);
  const material=cardShade(new THREE.MeshLambertMaterial({map:this.texture,transparent:false,alphaTest:.5,side:THREE.DoubleSide}),this.faceFrame,this.key,this.keyCol);
  this.mesh=new THREE.Mesh(geo,material);this.mesh.receiveShadow=true;this.mesh.layers.set(NOINK);this.root.add(this.mesh);
  this.proxy=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:false}));
  this.proxy.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:this.texture,alphaTest:.5});
  this.proxy.castShadow=true;this.proxy.layers.set(NOINK);this.root.add(this.proxy);
  const blobCv=document.createElement('canvas');blobCv.width=blobCv.height=128;const g=blobCv.getContext('2d')!;
  const gr=g.createRadialGradient(64,64,8,64,64,63);gr.addColorStop(0,'rgba(20,16,32,.46)');gr.addColorStop(1,'rgba(20,16,32,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);
  const blob=new THREE.Mesh(new THREE.PlaneGeometry(.85,.6),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(blobCv),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
  blob.rotation.x=-Math.PI/2;blob.position.y=.009;blob.layers.set(NOINK);this.root.add(blob);
  const H=headBlob(d.seed,d.build==='kid'?112:118,1),hh=2*H.b,chin=975-(d.build==='kid'?1.85:2.5)*hh;
  this.faceFrame.value.set(.5,1-(chin-H.b)/1000,H.a/600,H.b/1000);this.head={y:chin-H.b,a:H.a,b:H.b};
 }
 get seed(){return this.design.seed;}
 /** Desync idle micro-motion between copies of the crowd. */
 timeOffset=0;
 /** Swap to another Studio design mid-scene (bitten → turned); same card, same mark. */
 become(kind:CharacterKind){const d=DESIGNS.get(ROLES[kind]);if(!d)throw new Error('Missing Studio design '+ROLES[kind]);this.design=d;}
 bob(_frame:number){return 0;}
 /** Store this frame's acting; the drawing happens in face(), once the camera is known. */
 pose(frame:number,state:ActorState={}){
  const expr=EXPR_ALIASES[state.expr??'neutral']??state.expr??'neutral';
  if(expr!==this.expr){this.fromExpr=this.expr;this.expr=expr;this.exprAt=frame;}
  this.frame=frame;this.state=state;
 }
 face(camera:THREE.Camera,sun:THREE.Vector3){
  const p=new THREE.Vector3();this.root.getWorldPosition(p);
  this.mesh.rotation.y=Math.atan2(camera.position.x-p.x,camera.position.z-p.z);this.proxy.rotation.y=Math.atan2(sun.x-p.x,sun.z-p.z);
  const s=this.state,t=this.frame/FPS;
  const turn=s.turn??(s.facing??0)*32;
  const action=s.action??(s.mode==='run'?'run':s.mode==='stroll'?'walk':s.mode==='sit'?'sit':s.wave!==undefined&&!s.hand?'wave':'idle');
  // Head frame for the card shader, matching drawCharacter's layout for this pose (sit draws at .8 about y 500).
  {const d=this.design,b=d.build==='kid'?'kid':d.build==='stout'?'stout':'adult',H=headBlob(d.seed,b==='kid'?112:118,d.facing??(d.hairStyle==='spiky'?-1:1)),HH=2*H.b,
    torso=b==='kid'?.85:b==='stout'?1.15:1.1,legs=b==='kid'?1:b==='stout'?1.32:1.4,sit=action==='sit',
    bottom=sit?975-.2*HH:975-legs*HH,k=sit?.8:1,hc=500+(bottom-torso*HH-H.b-500)*k;
   this.faceFrame.value.set(.5,1-hc/1000,H.a*k/600,H.b*k/1000);this.head={y:hc,a:H.a*k,b:H.b*k};}
  const g=this.cv.getContext('2d')!;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,900,1500);g.scale(1.5,1.5);
  drawCharacter(g,this.design,{yaw:frontSafeYaw(turn),pitch:0,time:t+this.timeOffset,action,expression:this.expr,fromExpression:this.fromExpr,expressionAge:(this.frame-this.exprAt)/FPS,hand:s.hand,light:-2.2});
  // Reference-style acting detail: a blue sweat drop beside the head when nervous / shocked / pained (standing poses).
  if(['nervous','shock','pained'].includes(this.expr)&&s.mode!=='sit'&&s.mode!=='stroll'&&s.mode!=='run'&&!/zombie|turned/.test(this.design.id)){
   const age=(this.frame-this.exprAt)/FPS,slide=Math.min(1,age*1.6),x=300+this.head.a*.9,y=this.head.y-this.head.b*.05+slide*10,r=this.head.a*.14;
   g.save();g.beginPath();g.moveTo(x,y-r*1.9);g.quadraticCurveTo(x+r*1.1,y-r*.2,x,y+r);g.quadraticCurveTo(x-r*1.1,y-r*.2,x,y-r*1.9);
   const gr=g.createLinearGradient(x,y-r*2,x,y+r);gr.addColorStop(0,'#bfe9ff');gr.addColorStop(1,'#59b6ec');g.fillStyle=gr;g.fill();g.lineWidth=4;g.strokeStyle='#241e28';g.stroke();
   g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.ellipse(x-r*.3,y-r*.2,r*.18,r*.35,-.3,0,7);g.fill();g.restore();
  }
  if(s.cane&&s.hand){
   // Walking cane in the right hand, planted at the sole line.
   const [x,y]=s.hand;g.lineCap='round';
   for(const [w,c] of [[10,'#2b1d18'],[6,'#8a5a36']] as const){g.lineWidth=w;g.strokeStyle=c;g.beginPath();g.moveTo(x-6,y-12);g.quadraticCurveTo(x+4,y-26,x+16,y-12);g.lineTo(x+20,972);g.stroke();}
  }
  this.relight(camera);
  this.texture.needsUpdate=true;
 }
 /** Paint the nearest practical lights (lamps, screens, neon, fire) onto the card from the side they shine from. */
 private relight(camera:THREE.Camera){
  let top:THREE.Object3D=this.root;while(top.parent)top=top.parent;
  const me=new THREE.Vector3();this.root.getWorldPosition(me);me.y+=1.45;
  const toCam=camera.position.clone().sub(me);toCam.y=0;toCam.normalize();const right=new THREE.Vector3(toCam.z,0,-toCam.x);
  const found:{side:number;up:number;front:number;s:number;c:THREE.Color;dir:THREE.Vector3}[]=[];
  top.traverse(o=>{const L=o as THREE.PointLight;if(!(L.isPointLight||(o as THREE.SpotLight).isSpotLight)||!L.visible||L.intensity<=0)return;
   const lp=new THREE.Vector3();L.getWorldPosition(lp);const d=lp.clone().sub(me),dist=d.length();
   const fall=L.distance>0?Math.pow(Math.max(0,1-dist/L.distance),Math.max(1,L.decay)):1/(1+dist*dist);
   const s=L.intensity*fall*.11;if(s<.03)return;d.normalize();
   found.push({side:d.dot(right),up:d.y,front:d.dot(toCam),s,c:L.color,dir:d.clone()});});
  if(!found.length){this.key.value.w=0;return;}
  found.sort((a,b)=>b.s-a.s);
  // Strongest practical becomes the face key light (view space, same convention as the sun in cardshade).
  const k=found[0],kv=k.dir.clone().transformDirection(camera.matrixWorldInverse);
  this.key.value.set(kv.x,kv.y,kv.z,Math.min(.85,k.s*1.6));this.keyCol.value.copy(k.c);
  const tmp=Character.tmp??=document.createElement('canvas');tmp.width=900;tmp.height=1500;const t=tmp.getContext('2d')!;
  const g=this.cv.getContext('2d')!;g.setTransform(1,0,0,1,0,0);
  for(const L of found.slice(0,2)){
   // Light map (black where unlit) × the character's own colours, then added: ink stays black, cloth and skin catch the glow.
   const cx=450+L.side*(L.front>0?380:600),cy=760-L.up*420,rad=L.front>0?760:520;
   const col=`${Math.round(L.c.r*255)},${Math.round(L.c.g*255)},${Math.round(L.c.b*255)}`,a=Math.min(.42,L.s*.7);
   t.globalCompositeOperation='source-over';t.fillStyle='#000';t.fillRect(0,0,900,1500);
   const gr=t.createRadialGradient(cx,cy,0,cx,cy,rad);gr.addColorStop(0,`rgba(${col},${a})`);gr.addColorStop(.6,`rgba(${col},${a*.3})`);gr.addColorStop(1,`rgba(${col},0)`);
   t.fillStyle=gr;t.fillRect(0,0,900,1500);
   t.globalCompositeOperation='multiply';t.drawImage(this.cv,0,0);
   t.globalCompositeOperation='destination-in';t.drawImage(this.cv,0,0);
   g.globalCompositeOperation='lighter';g.drawImage(tmp,0,0);g.globalCompositeOperation='source-over';
  }
 }
 private static tmp:HTMLCanvasElement|undefined;
 /** Card-space hand target that lands exactly on a world point as seen from `eye` (billboard plane projection). */
 handAt(world:THREE.Vector3,eye:V3,_frame:number):[number,number]{
  const e=new THREE.Vector3(...eye),origin=new THREE.Vector3();this.root.getWorldPosition(origin);
  const normal=e.clone().sub(origin);normal.y=0;normal.normalize();
  const ray=world.clone().sub(e),dist=origin.clone().sub(e).dot(normal)/ray.dot(normal);
  const contact=e.clone().addScaledVector(ray,dist).sub(origin),right=new THREE.Vector3(normal.z,0,-normal.x);
  const sc=this.root.scale.x;
  return [300+contact.dot(right)/UNIT/sc,975-(contact.y/sc)/UNIT];
 }
}
export function character(root:THREE.Object3D,kind:CharacterKind,x:number,y:number,z:number){const actor=new Character(kind);actor.root.position.set(x,y,z);root.add(actor.root);return actor;}
