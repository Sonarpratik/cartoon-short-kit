import * as THREE from 'three';
import { drawCharacter,frontSafeYaw,type CharacterDesign } from '../characters/character-rig';
import { headBlob } from '../characters/toon';
/** Eye positions are only used for the glowing-eye effect (unused in this story). */
const FACE_EYES:[number,number][]=[];const FACE_EYES_U={value:1,scale:1};
import castFile from '../characters/cast.json';
import { cardShade } from './engine/cardshade';
import { NOINK } from './engine/ink';
import type {V3} from './types';

/** Story roles → Character Studio designs (character-library/cast.json, project "atomic-survivor"). */
export const ROLES={young:'ty-young',bloody:'ty-bloody',burned:'ty-burned-d',burnedBlood:'ty-burned-blood',old:'ty-old-b',boss:'ty-boss-b',colleague:'ty-colleague',
 student:'ty-aud-student',woman:'ty-aud-woman',man:'ty-aud-man',elder:'ty-aud-elder'} as const;
export const AUDIENCE:CharacterKind[]=['woman','student','man','elder'];
export type CharacterKind=keyof typeof ROLES;
const DESIGNS=new Map((castFile.characters as CharacterDesign[]).map(d=>[d.id,d]));
const EXPR_ALIASES:Record<string,string>={};

export type ActorState={action?:'idle'|'walk'|'run'|'sit'|'bend'|'reach'|'wave'|'talk';expr?:string;wave?:number;mode?:'stand'|'sit'|'stroll'|'run';phase?:number;headTilt?:number;hand?:[number,number];
 /** -1 / 0 / 1 → three-quarter left / front / three-quarter right. `turn` (degrees, camera-relative) overrides it. */
 facing?:-1|0|1;turn?:number;look?:number;tilt?:number;cane?:boolean;blinkShut?:boolean;
 /** Backlit-outlaw look: 0..1 dark band across the upper face (hat-brim shadow) with glowing eyes. */
 eyeGlow?:number;eyeColor?:string;
 /** 0..1 turns the whole card into a dark shadow silhouette (eyes still glow when eyeGlow > 0). */
 silhouette?:number;
 /** Hand weapon drawn on the card. 'shotgun-shoulder' rests the gun on the right shoulder; the others are held low at the hip. */
 weapon?:'shotgun-shoulder'|'shotgun'|'rifle'|'bat'|'pipe'|'machete'|'crowbar';
 /** 0..1 reference-style metal glints: white barrel streak + crackling sparkles. */
 weaponGlint?:number;
 /** Camera elevation for the drawing (negative = seen from below, e.g. looking up at the sky). */
 pitch?:number};
const WEAPON_SHAPES={shotgun:{len:300,w:15,metal:'#3a3d46',wood:'#7a4a2a',stock:110},rifle:{len:330,w:12,metal:'#33363e',wood:'#6a4024',stock:120},
 bat:{len:250,w:20,metal:'#b5824f',wood:'',stock:0},pipe:{len:240,w:13,metal:'#8d929c',wood:'',stock:0},machete:{len:230,w:24,metal:'#c9ccd2',wood:'#2b2228',stock:0},crowbar:{len:250,w:11,metal:'#c8423b',wood:'',stock:0}} as const;
const UNIT=.0026,FPS=30;
/** Reference-style lens star: warm bloom, long horizontal + vertical rays, short diagonals (additive sprite). */
const FLARE_TEX=(()=>{const N=512,cv=document.createElement('canvas');cv.width=cv.height=N;const g=cv.getContext('2d')!,C=N/2;
 const b=g.createRadialGradient(C,C,0,C,C,C*.42);b.addColorStop(0,'rgba(255,250,235,1)');b.addColorStop(.18,'rgba(255,224,170,.75)');b.addColorStop(.55,'rgba(255,190,120,.22)');b.addColorStop(1,'rgba(255,170,100,0)');g.fillStyle=b;g.fillRect(0,0,N,N);
 const ray=(dx:number,dy:number,len:number,w:number,a:number)=>{g.save();g.translate(C,C);g.rotate(Math.atan2(dy,dx));const gr=g.createLinearGradient(-len,0,len,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.5,`rgba(255,255,255,${a})`);gr.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=gr;g.beginPath();g.moveTo(-len,0);g.lineTo(0,-w);g.lineTo(len,0);g.lineTo(0,w);g.closePath();g.fill();g.restore();};
 ray(1,0,C*.98,7,1);ray(0,1,C*.72,6,.95);ray(1,1,C*.3,4,.7);ray(1,-1,C*.3,4,.7);
 g.fillStyle='#ffffff';g.beginPath();g.arc(C,C,9,0,7);g.fill();const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;return t;})();
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
  this.flare=new THREE.Sprite(new THREE.SpriteMaterial({map:FLARE_TEX,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,toneMapped:false}));this.flare.visible=false;this.flare.layers.set(NOINK);this.flare.renderOrder=20;this.mesh.add(this.flare);
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
  // Weapon grip: shoulder carry puts the right hand under the chin on the shoulder; low carry at the hip.
  const Hd=this.head,grip:[number,number]|undefined=s.weapon?(s.weapon==='shotgun-shoulder'?[300+Hd.a*.98,Hd.y+Hd.b*1.75]:[300+Hd.a*1.15,Hd.y+Hd.b*4.6]):undefined;
  drawCharacter(g,this.design,{yaw:frontSafeYaw(turn),pitch:s.pitch??0,time:t+this.timeOffset,action:s.weapon&&action==='idle'?'idle':action,expression:this.expr,fromExpression:this.fromExpr,expressionAge:(this.frame-this.exprAt)/FPS,hand:s.hand??grip,light:-2.2});
  this.eyes=FACE_EYES.map(([x,y])=>[x,y] as [number,number]);
  // The eyepatch covers the left (smaller-x) eye: only the open eye glows.
  if((this.design.accessories as string[]|undefined)?.includes('eyepatch')&&this.eyes.length===2)this.eyes=[this.eyes[0][0]>this.eyes[1][0]?this.eyes[0]:this.eyes[1]];this.eyeU=FACE_EYES_U.value*FACE_EYES_U.scale;
  this.weaponTip=undefined;if(s.weapon&&grip)this.drawWeapon(g,s.weapon,grip);
  // Reference-style acting detail: a blue sweat drop beside the head when nervous / shocked / pained (standing poses).
  if(['nervous','shock','pained'].includes(this.expr)&&s.mode!=='sit'&&s.mode!=='stroll'&&s.mode!=='run'&&!s.silhouette){
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
  this.flarePt=undefined;
  this.outlaw(turn);
  // Place the star flare sprite on the card at the weapon's hot spot (card-local: x=(dx-300)·UNIT, y=(975-dy)·UNIT).
  if(this.flarePt){const [fx,fy,k]=this.flarePt,sil=this.state.silhouette??0;this.flare.visible=true;this.flare.position.set((fx-300)*UNIT,(975-fy)*UNIT,.03);this.flare.scale.setScalar(.95*k*(sil>.5?.7:1));(this.flare.material as THREE.SpriteMaterial).opacity=Math.min(1,k);}else this.flare.visible=false;
  this.texture.needsUpdate=true;
 }
 /** Shadow silhouette + brim shadow + glowing eyes (drawn last, after practical relighting). Card alpha is preserved. */
 private outlaw(turn:number){
  const s=this.state,sil=Math.max(0,Math.min(1,s.silhouette??0)),glow=Math.max(0,Math.min(1,s.eyeGlow??0));if(sil<=0&&glow<=0){this.drawGlints();return;}
  const g=this.cv.getContext('2d')!;g.setTransform(1.5,0,0,1.5,0,0);g.save();g.globalCompositeOperation='source-atop';
  if(sil>0){g.globalAlpha=.92*sil;g.fillStyle='#120e1a';g.fillRect(0,0,600,1000);g.globalAlpha=1;}
  const H=this.head;void turn;
  if(glow>0&&sil<.5){// hat-brim shadow band over the upper face
   const gr=g.createLinearGradient(0,H.y-H.b*1.05,0,H.y+H.b*.45);gr.addColorStop(0,'rgba(28,18,48,.88)');gr.addColorStop(.72,'rgba(40,26,66,.78)');gr.addColorStop(1,'rgba(40,26,66,0)');
   g.globalAlpha=glow;g.fillStyle=gr;g.fillRect(300-H.a*1.4,H.y-H.b*1.3,H.a*2.8,H.b*1.8);g.globalAlpha=1;}
  g.restore();
  this.drawGlints();
  if(glow<=0||!this.eyes.length)return;
  // Eyes at the exact points the face drew them (canvas pixels): hot white core, coloured bloom,
  // a long horizontal lens streak through both (reference), and a four-point glint on the lead eye.
  g.setTransform(1,0,0,1,0,0);g.save();g.globalCompositeOperation='lighter';const col=s.eyeColor??'#ffe9a8',r=this.eyeU*4.2;
  for(const [x,y] of this.eyes){
   const b=g.createRadialGradient(x,y,0,x,y,r*3.4);b.addColorStop(0,col);b.addColorStop(.35,col+'aa');b.addColorStop(1,col+'00');g.globalAlpha=glow;g.fillStyle=b;g.beginPath();g.arc(x,y,r*3.4,0,7);g.fill();
   g.globalAlpha=glow;g.fillStyle='#ffffff';g.beginPath();g.ellipse(x,y,r*1.05,r*.7,0,0,7);g.fill();}
  const a=this.eyes[0],b=this.eyes[this.eyes.length-1],my=(a[1]+b[1])/2,span=Math.max(Math.abs(b[0]-a[0]),this.eyeU*26)*(1.3+.5*glow);
  const st=g.createLinearGradient(a[0]-span,0,b[0]+span,0);st.addColorStop(0,col+'00');st.addColorStop(.5,'#ffffffcc');st.addColorStop(1,col+'00');g.globalAlpha=glow*.85;g.fillStyle=st;g.fillRect(a[0]-span,my-r*.22,b[0]-a[0]+span*2,r*.44);
  const [gx,gy]=b[0]>a[0]?b:a,L=r*(2.4+1.2*glow);g.globalAlpha=glow;g.strokeStyle='#ffffff';g.lineCap='round';g.lineWidth=4;
  g.beginPath();g.moveTo(gx,gy-L);g.lineTo(gx,gy+L);g.stroke();g.lineWidth=3;g.beginPath();g.moveTo(gx-L*.45,gy-L*.45);g.lineTo(gx+L*.45,gy+L*.45);g.moveTo(gx+L*.45,gy-L*.45);g.lineTo(gx-L*.45,gy+L*.45);g.stroke();
  g.restore();
 }
 private flare!:THREE.Sprite;private flarePt:[number,number,number]|undefined;
 private eyes:[number,number][]=[];private eyeU=1;private weaponTip:{a:[number,number];b:[number,number]}|undefined;
 /** Draw the weapon in design space from the grip point. Dark body, ink outline, wood furniture; glints are added later. */
 private drawWeapon(g:CanvasRenderingContext2D,kind:NonNullable<ActorState['weapon']>,[hx,hy]:[number,number]){
  const key=kind==='shotgun-shoulder'?'shotgun':kind,W=WEAPON_SHAPES[key];
  // Shoulder carry: barrel rises past the shoulder, stock drops in front of the chest. Low carry: angled down-out from the hip (guns angled up).
  const ang=kind==='shotgun-shoulder'?-1.38:kind==='shotgun'||kind==='rifle'?-.5:1.15;
  const dx=Math.cos(ang),dy=Math.sin(ang),nx=-dy,ny=dx,L=W.len,stock=W.stock;
  const A:[number,number]=[hx-dx*stock,hy-dy*stock],B:[number,number]=[hx+dx*L,hy+dy*L];
  g.save();g.lineCap='round';g.lineJoin='round';
  const bar=(p:[number,number],q:[number,number],w:number,c:string)=>{g.lineWidth=w+9;g.strokeStyle='#1d1824';g.beginPath();g.moveTo(...p);g.lineTo(...q);g.stroke();g.lineWidth=w;g.strokeStyle=c;g.beginPath();g.moveTo(...p);g.lineTo(...q);g.stroke();};
  if(stock>0){bar(A,[hx+dx*20,hy+dy*20],W.w+8,W.wood);bar([hx+dx*60,hy+dy*60],[hx+dx*150,hy+dy*150],W.w+5,W.wood);bar([hx+dx*20,hy+dy*20],B,W.w,W.metal);
   bar([hx+dx*70+nx*12,hy+dy*70+ny*12],[hx+dx*(L-20)+nx*12,hy+dy*(L-20)+ny*12],W.w*.6,W.metal);}
  else if(kind==='machete'){bar([hx-dx*10,hy-dy*10],[hx+dx*45,hy+dy*45],16,W.wood);
   const p1:[number,number]=[hx+dx*45-nx*10,hy+dy*45-ny*10],p2:[number,number]=[hx+dx*L,hy+dy*L];g.beginPath();g.moveTo(...p1);g.lineTo(p2[0]-nx*4,p2[1]-ny*4);g.quadraticCurveTo(p2[0]+nx*26,p2[1]+ny*26,hx+dx*(L-40)+nx*24,hy+dy*(L-40)+ny*24);g.lineTo(hx+dx*45+nx*12,hy+dy*45+ny*12);g.closePath();g.fillStyle=W.metal;g.fill();g.lineWidth=7;g.strokeStyle='#1d1824';g.stroke();}
  else if(kind==='bat'){g.beginPath();g.moveTo(hx-dx*12-nx*6,hy-dy*12-ny*6);g.lineTo(hx+dx*L-nx*14,hy+dy*L-ny*14);g.quadraticCurveTo(hx+dx*(L+16),hy+dy*(L+16),hx+dx*L+nx*14,hy+dy*L+ny*14);g.lineTo(hx-dx*12+nx*6,hy-dy*12+ny*6);g.closePath();g.fillStyle=W.metal;g.fill();g.lineWidth=7;g.strokeStyle='#1d1824';g.stroke();bar([hx-dx*12,hy-dy*12],[hx+dx*30,hy+dy*30],14,'#2b2228');}
  else {bar([hx-dx*14,hy-dy*14],B,W.w,W.metal);if(kind==='crowbar'){g.lineWidth=W.w+9;g.strokeStyle='#1d1824';g.beginPath();g.moveTo(...B);g.quadraticCurveTo(B[0]+dx*20+nx*10,B[1]+dy*20+ny*10,B[0]+nx*34,B[1]+ny*34);g.stroke();g.lineWidth=W.w;g.strokeStyle=W.metal;g.stroke();}}
  g.restore();
  this.weaponTip={a:[hx+dx*(stock?30:20),hy+dy*(stock?30:20)],b:[hx+dx*(L-12),hy+dy*(L-12)]};
 }
 /** Reference metal lighting (user still): a hot star flare on the metal with long thin rays, a white streak along the barrel,
  *  branching electric crackle around the weapon and hand, and twinkling sparkles. All seeded by frame (deterministic). */
 private drawGlints(){
  const s=this.state,k=Math.max(0,Math.min(1,s.weaponGlint??0)),w=this.weaponTip;if(!w||k<=0)return;
  const g=this.cv.getContext('2d')!;g.setTransform(1.5,0,0,1.5,0,0);g.save();g.globalCompositeOperation='lighter';g.lineCap='round';
  const [ax,ay]=w.a,[bx,by]=w.b,t=this.frame,rnd=(i:number)=>{const x=Math.sin(i*127.1+this.design.seed*31.7)*43758.5;return x-Math.floor(x);};
  // Specular streak along the metal.
  const st=g.createLinearGradient(ax,ay,bx,by);st.addColorStop(0,'rgba(255,255,255,0)');st.addColorStop(.6,`rgba(255,250,235,${.95*k})`);st.addColorStop(1,'rgba(255,255,255,0)');
  g.strokeStyle=st;g.lineWidth=4.5;g.beginPath();g.moveTo(ax,ay);g.lineTo(bx,by);g.stroke();
  // Star flare: warm bloom + long horizontal/vertical rays + short diagonals; slides slowly along the metal and pulses.
  const u=.55+.25*Math.sin(t*.05+this.design.seed),fx=ax+(bx-ax)*u,fy=ay+(by-ay)*u,pulse=.75+.25*Math.sin(t*.35+this.design.seed);
  this.flarePt=[fx,fy,k*pulse];
  // Electric crackle: 2-3 branching blue-white bolts hugging the grip and barrel, re-rolled every 2 frames.
  const roll=Math.floor(t/2);g.strokeStyle='rgba(225,240,255,.95)';g.shadowColor='rgba(170,210,255,.9)';g.shadowBlur=6;
  for(let i=0;i<3;i++){if(rnd(roll*7+i)>.75)continue;const v=rnd(roll*13+i*3),x0=ax+(bx-ax)*v,y0=ay+(by-ay)*v;let px=x0,py=y0;g.lineWidth=1.8;g.globalAlpha=k;g.beginPath();g.moveTo(px,py);
   const dir=rnd(roll*5+i)*Math.PI*2;for(let j=0;j<6;j++){px+=Math.cos(dir+(rnd(roll*31+i*7+j)-.5)*2.2)*9;py+=Math.sin(dir+(rnd(roll*17+i*5+j)-.5)*2.2)*9;g.lineTo(px,py);
    if(j===2){g.moveTo(px,py);g.lineTo(px+(rnd(j+roll)-.5)*16,py+(rnd(j*3+roll)-.5)*16);g.moveTo(px,py);}}g.stroke();}
  g.shadowBlur=0;
  // Twinkling sparkles around the weapon.
  for(let i=0;i<5;i++){const v=rnd(i*11+3),x=ax+(bx-ax)*v+(rnd(i*7)-.5)*60,y=ay+(by-ay)*v+(rnd(i*5)-.5)*60,tw=Math.max(0,Math.sin((t+i*9)*.4));if(tw<.2)continue;
   const L=(5+9*tw)*k;g.globalAlpha=tw;g.strokeStyle='#ffffff';g.lineWidth=1.6;g.beginPath();g.moveTo(x-L,y);g.lineTo(x+L,y);g.moveTo(x,y-L);g.lineTo(x,y+L);g.stroke();}
  g.restore();
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
