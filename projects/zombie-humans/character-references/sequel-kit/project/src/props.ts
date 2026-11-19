// Story props for The Wish Machine. Metres; base origin unless noted.
import * as THREE from 'three';
import { twoTone } from './engine/shade';
import { beamHD, facadeHD, roofHD, rep as repTex } from './engine/paint';
import { NOINK } from './engine/ink';

export const C = { ink: '#292532', wood: '#9b6645', cream: '#ece1c4', teal: '#2f8f8a', navy: '#35485a', red: '#c8423b', paper: '#f3e8c9', brass: '#d2a94e', gold: '#e8b93c', green: '#5fae6a' };
const materials = new Map<string, THREE.Material>();
export function mat(color: string, wood = false) {
  const key = color + wood;
  if (!materials.has(key)) materials.set(key, twoTone(new THREE.MeshLambertMaterial({ color, ...(wood ? {map: beamHD()} : {}) })));
  return materials.get(key)!;
}
/** Unlit emissive colour; channel values above 1 feed the bloom pass. */
export function glow(r: number, g: number, b: number) { return new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), toneMapped: true }); }
export function box(root: THREE.Object3D, w: number, h: number, d: number, x: number, y: number, z: number, color = C.wood, wood = false) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, wood));
  m.position.set(x,y,z); m.castShadow = true; m.receiveShadow = true; root.add(m); return m;
}
export function cylinder(root: THREE.Object3D, r: number, h: number, x: number, y: number, z: number, color = C.cream, rBottom = r, seg = 32) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r,rBottom,h,seg),mat(color));
  m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;root.add(m);return m;
}
export function ball(root: THREE.Object3D, r: number, x: number, y: number, z: number, color: string, sx = 1, sy = 1, sz = 1) {
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 2), mat(color)); m.scale.set(sx, sy, sz);
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; root.add(m); return m;
}
export function place<T extends THREE.Object3D>(root:THREE.Object3D,obj:T,x:number,y:number,z:number,yaw=0):T{obj.position.set(x,y,z);obj.rotation.y=yaw;root.add(obj);return obj;}
function canvasTex(w:number,h:number,draw:(g:CanvasRenderingContext2D)=>void){const cv=document.createElement('canvas');cv.width=w;cv.height=h;draw(cv.getContext('2d')!);const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;}
export function label(root: THREE.Object3D, text: string, w: number, h: number, position: [number,number,number], options: {bg?:string;ink?:string;size?:number;font?:string}={}) {
  const tex=canvasTex(1024,Math.max(128,Math.round(1024*h/w)),(g)=>{
   const H=g.canvas.height;g.fillStyle=options.bg??C.paper;g.fillRect(0,0,1024,H);g.fillStyle=options.ink??C.ink;g.textAlign='center';g.textBaseline='middle';
   const lines=text.split('\n');const px=options.size??Math.min(160,H/(lines.length+1));g.font=`${options.font??'700'} ${px}px Georgia, serif`;
   lines.forEach((line,i)=>g.fillText(line,512,H*(i+1)/(lines.length+1),940));});
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));
  mesh.position.set(...position);mesh.layers.set(NOINK);root.add(mesh);return mesh;
}
/** Soft radial puff for steam, glow halos and camera flashes. */
const puffTex=canvasTex(128,128,(g)=>{const gr=g.createRadialGradient(64,64,4,64,64,63);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.45,'rgba(255,255,255,.45)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);});
export function puff(root:THREE.Object3D,color='#dfe8ec',opacity=.5,additive=false){
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:puffTex,color,transparent:true,opacity,depthWrite:false,blending:additive?THREE.AdditiveBlending:THREE.NormalBlending,fog:false}));
 s.layers.set(NOINK);root.add(s);return s;
}

// ---------------- the Wish Machine ----------------
export type Machine=THREE.Group&{setScreen:(text:string,tone?:'teal'|'red'|'gold')=>void;button:THREE.Mesh;buttonTop:THREE.Vector3;pressButton:(depth:number)=>void;light:THREE.PointLight;glowAmount:(k:number)=>void};
const DECK=.45;
export function wishMachine():Machine{
 const r=new THREE.Group() as Machine;
 const body='#2b8c86',trim=C.gold;
 // Painted side art: deep teal panel with gold stars and a swirl, so the cabinet reads in three-quarter views.
 const sideTex=canvasTex(512,1024,(g)=>{const gr=g.createLinearGradient(0,0,0,1024);gr.addColorStop(0,'#3aa59c');gr.addColorStop(1,'#1d5f5a');g.fillStyle=gr;g.fillRect(0,0,512,1024);
  g.strokeStyle='#e8b93c';g.lineWidth=18;g.beginPath();for(let a=0;a<12;a+=.05){const rr=18*a;g.lineTo(256+Math.cos(a)*rr,520+Math.sin(a)*rr);}g.stroke();
  const star=(x:number,y:number,s:number)=>{g.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,rr=i%2?s*.42:s;g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}g.closePath();g.fillStyle='#ffd76a';g.fill();g.lineWidth=5;g.strokeStyle='#7a5a1c';g.stroke();};
  [[110,140,46],[400,230,30],[120,860,34],[390,840,52],[260,300,22]].forEach(([x,y,s])=>star(x,y,s));
  g.strokeStyle='#14403c';g.lineWidth=14;g.strokeRect(14,14,484,996);});
 const sideMat=twoTone(new THREE.MeshLambertMaterial({map:sideTex})),bodyMat=mat(body);
 const cabinet=new THREE.Mesh(new THREE.BoxGeometry(1.35,1.2,1),[sideMat,sideMat,bodyMat,bodyMat,bodyMat,bodyMat]);cabinet.position.set(0,.72,0);cabinet.castShadow=cabinet.receiveShadow=true;r.add(cabinet);
 const panel=box(r,1.35,.5,.7,0,1.48,.1,'#257a75');panel.rotation.x=DECK; // control deck tilted towards the player
 const housing=new THREE.Mesh(new THREE.BoxGeometry(1.35,1.15,.62),[sideMat,sideMat,bodyMat,bodyMat,bodyMat,bodyMat]);housing.position.set(0,2.3,-.14);housing.castShadow=housing.receiveShadow=true;r.add(housing);
 // Rounded marquee crown.
 box(r,1.5,.42,.78,0,3.08,-.08,'#7a3e8f');
 box(r,1.22,.16,.06,0,1.8,.17,'#14262a');for(let i=0;i<12;i++)box(r,.06,.06,.02,-.44+i*.08,1.8,.205,'#2c4a4e');
 box(r,1.3,.12,.6,0,3.35,-.08,'#8c4aa3');
 const star=new THREE.Mesh(new THREE.CircleGeometry(.13,5),glow(1.6,1.25,.4));star.position.set(0,3.43,.25);star.rotation.z=Math.PI/2;star.layers.set(NOINK);r.add(star);
 for(const x of [-.7,.7])box(r,.08,3.2,1.04,x,1.7,0,trim);
 // Chrome plinth with feet, a recessed service door and a speaker grille.
 box(r,1.55,.1,1.1,0,.13,0,'#c9ccd2');for(const x of [-.62,.62])for(const z of [-.4,.4])cylinder(r,.07,.08,x,.04,z,'#7d8088',.09,12);
 box(r,1.0,.5,.04,0,.48,.5,'#227370');box(r,.92,.42,.02,0,.48,.522,'#1d6460');
 for(let i=0;i<4;i++)for(let j=0;j<7;j++){const h=cylinder(r,.018,.01,-.18+j*.06,.36+i*.05,.533,'#123a37',.018,8);h.rotation.x=Math.PI/2;}
 box(r,.18,.08,.04,.32,.33,.52,'#c9ccd2');
 // Neon edge tubes (animated by glowAmount).
 const tubes:THREE.Mesh[]=[];for(const x of [-.66,.66]){const tube=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,2.85,10),glow(.5,2,1.9));tube.position.set(x,1.7,.53);tube.layers.set(NOINK);r.add(tube);tubes.push(tube);}
 // Coin-style slot and a plaque.
 box(r,.4,.2,.03,0,1.08,.515,trim);box(r,.32,.1,.04,0,1.08,.53,'#1c2b2e');
 label(r,'INSERT 1 YEAR',.8,.11,[0,.86,.523],{bg:'#257a75',ink:'#f6e7b5',size:96});
 label(r,'WISH',1.2,.32,[0,3.1,.315],{bg:'#7a3e8f',ink:'#ffe9a8',size:230});
 // Bulbs around the marquee.
 const bulbs:THREE.Mesh[]=[];for(let i=0;i<9;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(.035,10,8),glow(2,1.6,.7));b.position.set(-.64+i*.16,3.28,.32);b.layers.set(NOINK);r.add(b);bulbs.push(b);}
 // Screen with a re-drawable canvas.
 const cv=document.createElement('canvas');cv.width=768;cv.height=640;const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;
 const screenMat=new THREE.MeshBasicMaterial({map:tex,color:new THREE.Color(1.35,1.35,1.35)});
 const screen=new THREE.Mesh(new THREE.PlaneGeometry(1.04,.86),screenMat);screen.position.set(0,2.32,.215);screen.layers.set(NOINK);r.add(screen);
 box(r,1.16,.98,.04,0,2.32,.185,'#18282b');
 let last='';
 r.setScreen=(text,tone='teal')=>{const key=text+tone;if(key===last)return;last=key;const g=cv.getContext('2d')!;
  const bg={teal:['#0f3c40','#1d6e6c'],red:['#3d0d12','#8c1f24'],gold:['#4a3510','#9c7420']}[tone];
  const gr=g.createRadialGradient(384,320,40,384,320,420);gr.addColorStop(0,bg[1]);gr.addColorStop(1,bg[0]);g.fillStyle=gr;g.fillRect(0,0,768,640);
  g.fillStyle='rgba(255,255,255,.05)';for(let y=0;y<640;y+=8)g.fillRect(0,y,768,3);
  g.fillStyle=tone==='red'?'#ffd0c8':'#eafff4';g.textAlign='center';g.textBaseline='middle';
  const lines=text.split('\n');let px=lines.length>2?96:118;g.font=`800 ${px}px Arial`;
  // Shrink the font until the widest line fits inside the visible screen with a margin.
  const widest=Math.max(1,...lines.map(l=>g.measureText(l).width));if(widest>640){px=Math.floor(px*640/widest);g.font=`800 ${px}px Arial`;}
  lines.forEach((l,i)=>g.fillText(l,384,320+(i-(lines.length-1)/2)*px*1.12));tex.needsUpdate=true;};
 r.setScreen('1 YEAR\n=\n1 WISH');
 // Big red button seated on the deck's top face (deck top centre + normal offsets).
 const nY=Math.cos(DECK),nZ=Math.sin(DECK),topY=1.48+.25*nY,topZ=.1+.25*nZ;
 const onDeck=(x:number,h:number):[number,number,number]=>[x,topY+nY*h,topZ+nZ*h];
 const ring=cylinder(r,.21,.03,...onDeck(0,.015),trim);ring.rotation.x=DECK;
 const button=new THREE.Mesh(new THREE.CylinderGeometry(.15,.16,.1,32),glow(1.05,.06,.05));button.layers.set(NOINK);
 button.position.set(...onDeck(0,.06));button.rotation.x=DECK;r.add(button);r.button=button;
 button.userData.rest=button.position.clone();button.userData.normal=new THREE.Vector3(0,nY,nZ);
 r.buttonTop=new THREE.Vector3(...onDeck(0,.12));
 r.pressButton=(depth)=>{button.position.copy(button.userData.rest).addScaledVector(button.userData.normal,-depth);};
 for(const [x,c] of [[-.45,'#f2c94c'],[.45,'#6fc3e8']] as const){const k=cylinder(r,.06,.05,...onDeck(x,.025),c);k.rotation.x=DECK;}
 const light=new THREE.PointLight('#6ff0dc',6,6,1.6);light.position.set(0,2,1.1);r.add(light);r.light=light;
 const glowHalo=halo(r,[0,2.32,.02],'#7ff5e2',2.9,.35);
 r.glowAmount=(k)=>{(glowHalo.material as THREE.SpriteMaterial).opacity=.5*Math.min(1.2,k);screenMat.color.setScalar(.6+.85*k);tubes.forEach(t=>(t.material as THREE.MeshBasicMaterial).color.setRGB(.5*k,2*k,1.9*k));bulbs.forEach((b,i)=>(b.material as THREE.MeshBasicMaterial).color.setRGB(2*k*(.6+.4*((i+Math.round(k*7))%2)),1.6*k,.7*k));};
 return r;
}

// ---------------- floating age counter ----------------
export type AgeTag=THREE.Sprite&{set:(age:number,hot?:boolean)=>void};
export function ageTag(root:THREE.Object3D):AgeTag{
 const cv=document.createElement('canvas');cv.width=512;cv.height=300;const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false,fog:false})) as unknown as AgeTag;
 s.renderOrder=20;s.scale.set(.95,.56,1);s.layers.set(NOINK);root.add(s);let last='';
 s.set=(age,hot=false)=>{const key=age+String(hot);if(key===last)return;last=key;const g=cv.getContext('2d')!;g.clearRect(0,0,512,300);
  const r=46;g.fillStyle=hot?'#c8423b':'#fff6dd';g.strokeStyle='#292532';g.lineWidth=14;g.beginPath();g.roundRect(14,14,484,236,r);g.fill();g.stroke();
  g.beginPath();g.moveTo(220,248);g.lineTo(256,292);g.lineTo(292,248);g.closePath();g.fill();g.stroke();g.fillStyle=hot?'#c8423b':'#fff6dd';g.fillRect(222,236,68,14);
  g.fillStyle=hot?'#fff3e6':'#292532';g.textAlign='center';g.textBaseline='middle';g.font='800 64px Arial';g.fillText('AGE',150,132);g.font='900 150px Arial';g.fillText(String(age),340,138);tex.needsUpdate=true;};
 s.set(25);return s;
}

// ---------------- money, car, mansion ----------------
const billTex=canvasTex(256,128,(g)=>{g.fillStyle='#7cc483';g.fillRect(0,0,256,128);g.strokeStyle='#2f6f45';g.lineWidth=10;g.strokeRect(8,8,240,112);g.fillStyle='#2f6f45';g.beginPath();g.ellipse(128,64,30,36,0,0,7);g.fill();g.fillStyle='#d9f2d5';g.font='900 52px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText('$',128,66);g.font='800 30px Arial';g.fillStyle='#2f6f45';g.fillText('100',44,34);g.fillText('100',212,98);});
export function bill(){const m=new THREE.Mesh(new THREE.PlaneGeometry(.34,.17),new THREE.MeshLambertMaterial({map:billTex,side:THREE.DoubleSide}));m.castShadow=true;m.layers.set(NOINK);return m;}
export function cashStack(){const r=new THREE.Group();for(let i=0;i<5;i++){const b=box(r,.36,.06,.18,0,.03+i*.06,0,i%2?'#7cc483':'#6db474');b.rotation.y=(i%3-1)*.08;}box(r,.37,.08,.05,0,.15,0,'#efe7cf');return r;}
export function coinPile(n=9){const r=new THREE.Group();for(let i=0;i<n;i++){const a=i*2.4,d=.12*Math.sqrt(i);for(let j=0;j<4-Math.floor(i/3);j++)cylinder(r,.09,.03,Math.cos(a)*d,.015+j*.032,Math.sin(a)*d,C.gold,.09,16);}return r;}
export type Car=THREE.Group&{wheels:THREE.Object3D[];body:THREE.Group;lights:THREE.Mesh[]};
/** Rounded convertible-coupe: extruded side profile, glass cabin, chrome trim, rims, glowing lamps. */
export function car(color='#d8433b'):Car{
 const r=new THREE.Group() as Car;const body=new THREE.Group();r.add(body);r.body=body;
 const profile=(pts:[number,number][])=>{const sh=new THREE.Shape();sh.moveTo(...pts[0]);for(let i=1;i<pts.length;i++){const [x,y]=pts[i],[px,py]=pts[i-1];sh.quadraticCurveTo(px,py,(px+x)/2,(py+y)/2);sh.lineTo(x,y);}sh.closePath();return sh;};
 const extrude=(sh:THREE.Shape,depth:number,material:THREE.Material,bevel=.06)=>{const g=new THREE.ExtrudeGeometry(sh,{depth,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:4,curveSegments:10});g.translate(0,0,-depth/2);const m=new THREE.Mesh(g,material);m.castShadow=m.receiveShadow=true;return m;};
 // Lower body with wheel arches cut as curves, then the cabin and glass.
 const lower=profile([[-1.95,.32],[-2.0,.72],[-1.6,.92],[-.6,.98],[1.2,.98],[1.85,.88],[2.0,.6],[1.95,.32],[1.65,.3],[1.45,.62],[.95,.62],[.75,.3],[-.75,.3],[-.95,.62],[-1.45,.62],[-1.65,.3]]);
 body.add(extrude(lower,1.5,mat(color)));
 // Glass cabin (windscreen, side and rear windows), a body-colour roof and pillars on top of it.
 const glassMat=new THREE.MeshLambertMaterial({color:'#8fc6e3',emissive:new THREE.Color('#203848'),emissiveIntensity:.35});
 const cabinShape=profile([[-1.15,.95],[-.85,1.46],[.33,1.48],[.95,.95]]);const glass=extrude(cabinShape,1.3,glassMat,.03);glass.castShadow=true;body.add(glass);
 const roof=box(body,1.28,.08,1.4,-.26,1.52,0,color);roof.castShadow=true;
 const strut=(a:[number,number],b:[number,number],z:number,w=.09)=>{const len=Math.hypot(b[0]-a[0],b[1]-a[1]),m=box(body,len,w,.06,(a[0]+b[0])/2,(a[1]+b[1])/2,z,color);m.rotation.z=Math.atan2(b[1]-a[1],b[0]-a[0]);return m;};
 for(const z of [-.67,.67]){strut([.97,.95],[.33,1.5],z);strut([-1.17,.95],[-.86,1.5],z);box(body,.08,.52,.06,-.22,1.22,z,color);}
 box(body,.06,.05,1.32,.94,.97,0,color);box(body,.06,.05,1.32,-1.14,.97,0,color);
 // Glints across the windscreen and side glass.
 const glint=new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.55,depthWrite:false});
 for(const [x,y,w] of [[.62,1.22,.07],[.5,1.3,.035]] as const){const g=new THREE.Mesh(new THREE.PlaneGeometry(w,.62),glint);g.position.set(x+.53*.04,y+.62*.04,0);g.lookAt(x+.53*3,y+.62*3,0);g.layers.set(NOINK);body.add(g);}
 for(const z of [-.68,.68])for(const [x,w] of [[-.55,.06],[.05,.04]] as const){const g=new THREE.Mesh(new THREE.PlaneGeometry(w,.42),glint);g.position.set(x,1.2,z*1.01);g.rotation.z=.5;if(z<0)g.rotation.y=Math.PI;g.layers.set(NOINK);body.add(g);}
 // Chrome: bumpers, side strip, door handles; grille.
 for(const x of [-2.05,2.05])box(body,.12,.14,1.62,x,.48,0,'#d9dbe0');
 for(const z of [-.81,.81]){box(body,3.2,.04,.02,0,.74,z,'#eef0f2');box(body,.16,.04,.03,.2,.86,z,'#d9dbe0');}
 box(body,.04,.2,.8,2.03,.66,0,'#2e2f36');for(let i=0;i<4;i++)box(body,.05,.02,.78,2.04,.58+i*.05,0,'#c9ccd2');
 // Lamps (emissive, animated by the scene).
 r.lights=[];for(const z of [-.55,.55]){const l=new THREE.Mesh(new THREE.SphereGeometry(.12,16,10),glow(1.6,1.5,1.1));l.scale.x=.5;l.position.set(1.98,.72,z);l.layers.set(NOINK);body.add(l);r.lights.push(l);
  const t=new THREE.Mesh(new THREE.BoxGeometry(.04,.12,.22),glow(1.4,.15,.12));t.position.set(-2.0,.72,z);t.layers.set(NOINK);body.add(t);}
 // Wheels with white-wall tyres and chrome hubcaps (spin about z).
 r.wheels=[];for(const x of [-1.2,1.2])for(const z of [-.74,.74]){const w=new THREE.Group();w.position.set(x,.36,z);r.add(w);
  const tyre=new THREE.Mesh(new THREE.TorusGeometry(.26,.11,12,28),mat('#26262c'));w.add(tyre);
  const wall=new THREE.Mesh(new THREE.RingGeometry(.16,.24,28),mat('#f1ede4'));wall.position.z=z>0?.1:-.1;if(z<0)wall.rotation.y=Math.PI;w.add(wall);
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.2,20),mat('#d9dbe0'));hub.rotation.x=Math.PI/2;w.add(hub);
  for(let k=0;k<5;k++){const sp=box(w,.03,.26,.02,0,0,z>0?.11:-.11,'#9aa0a8');sp.rotation.z=k*Math.PI/5;}
  r.wheels.push(w);}
 return r;
}
export function facade(w:number,h:number,wall:string,o:{rows:number;cols:number;door?:boolean;glowWin?:boolean;trim?:string}){
 const r=new THREE.Group();box(r,w,h,.5,0,h/2,0,wall);const trim=o.trim??'#f4ecd8';
 box(r,w+.4,.3,.8,0,h+.15,.1,trim);
 for(let row=0;row<o.rows;row++)for(let col=0;col<o.cols;col++){
  const x=-w/2+(col+.5)*w/o.cols,y=1.2+row*(h-1.4)/o.rows+.2;if(o.door&&row===0&&Math.abs(x)<w/o.cols*.6)continue;
  box(r,.95,1.35,.08,x,y+.5,.26,trim);const glass=new THREE.Mesh(new THREE.PlaneGeometry(.75,1.15),o.glowWin?glow(1.4,1.05,.6):new THREE.MeshLambertMaterial({color:'#7fb2c9'}));glass.position.set(x,y+.5,.305);glass.layers.set(NOINK);r.add(glass);
  box(r,.06,1.15,.02,x,y+.5,.31,trim);box(r,.75,.06,.02,x,y+.5,.31,trim);box(r,1.1,.1,.18,x,y-.18,.3,trim);
 }
 if(o.door){box(r,1.5,2.3,.1,0,1.15,.28,'#5a3a2a',true);box(r,1.8,.2,.2,0,2.42,.3,trim);for(const x of [-.35,.35])cylinder(r,.05,.05,x,1.15,.36,C.gold);}
 return r;
}
/** Mansion in parts so it can assemble on screen: userData.main, userData.wings[], userData.portico, userData.garden. */
export function mansion(){
 const r=new THREE.Group();
 const main=place(r,paintedBuilding(9,7.4,5,{key:'mansionMain',wall:'#f3e3c2',shutter:'#3d6f9e',door:true,roof:'#5b6e8c'}),0,0,-1.5);
 const wings=[-7,7].map(x=>place(r,paintedBuilding(5,5.6,4,{key:'mansionWing'+x,wall:'#ead7b2',shutter:'#3d6f9e',roof:'#5b6e8c'}),x,0,-.8));
 // Portico: columns with bases and capitals, entablature, pediment with a round window, steps, lanterns.
 const portico=new THREE.Group();r.add(portico);
 for(const x of [-1.8,-.6,.6,1.8]){cylinder(portico,.2,4.2,x,2.25,2.1,'#fbf6ea',.24);box(portico,.55,.15,.55,x,.22,2.1,'#efe6d3');box(portico,.55,.15,.55,x,4.38,2.1,'#efe6d3');}
 box(portico,4.6,.4,1.9,0,4.65,1.9,'#fbf6ea');const ped=new THREE.Mesh(new THREE.CylinderGeometry(2.6,2.6,1.9,3,1),mat('#f4ecd8'));ped.rotation.set(Math.PI/2,0,Math.PI/2);ped.scale.set(.42,1,1);ped.position.set(0,5.35,1.9);ped.castShadow=true;portico.add(ped);
 const oculus=new THREE.Mesh(new THREE.CircleGeometry(.3,24),new THREE.MeshLambertMaterial({color:'#7fb2c9'}));oculus.position.set(0,5.4,2.86);oculus.layers.set(NOINK);portico.add(oculus);
 for(let i=0;i<4;i++)box(portico,4.6+i*.5,.18,.5,0,.09+i*.18,3.4-i*.4,'#e6dcc6');
 for(const x of [-1.3,1.3]){box(portico,.16,.3,.16,x,2.9,1.03,'#2e2f36');const g=new THREE.Mesh(new THREE.SphereGeometry(.08,10,8),glow(1.8,1.4,.7));g.position.set(x,2.88,1.12);g.layers.set(NOINK);portico.add(g);}
 const garden=new THREE.Group();r.add(garden);
 for(const x of [-2.9,2.9]){cylinder(garden,.34,.42,x,.21,3.4,'#e8dcc4',.26);for(const [dx,dy,dz,rr] of [[0,.78,0,.36],[-.22,.66,.12,.26],[.22,.68,-.08,.27],[.05,1.02,.05,.22]] as const)ball(garden,rr,x+dx,dy,3.4+dz,dy>.9?'#5aa85b':'#4f9a52');}
 for(const x of [-6.5,-4.5,4.5,6.5])ball(garden,.55,x,.45,1.6,'#4f9a52',1.2,.8,1);
 r.userData={main,wings,portico,garden};
 return r;
}
export function hedge(w=2.2){const r=new THREE.Group();box(r,w,.9,.8,0,.45,0,'#4f9a52');for(let i=0;i<Math.round(w*3);i++)ball(r,.28,-w/2+.2+i*.33,.86,0,i%2?'#5aa85b':'#4f9a52',1,.7,1.3);return r;}
export function tree(h=3.4,leaf='#5aa85b'){const r=new THREE.Group();cylinder(r,.14,h*.55,0,h*.27,0,'#7b5332',.2,10);ball(r,h*.28,0,h*.68,0,leaf);ball(r,h*.2,-h*.18,h*.58,.1,leaf);ball(r,h*.2,h*.2,h*.62,-.05,'#6bb862');return r;}
/** Painted gradient sky on a large unlit plane (not fogged). */
export function skyBackdrop(root:THREE.Object3D,stops:[number,string][],w=60,h=34,z=-22,y=8,clouds=0){
 const tex=canvasTex(256,512,(g)=>{const gr=g.createLinearGradient(0,0,0,512);stops.forEach(([s,c])=>gr.addColorStop(s,c));g.fillStyle=gr;g.fillRect(0,0,256,512);
  for(let i=0;i<clouds;i++){const x=(i*97)%256,y=60+(i*53)%180;g.fillStyle='rgba(255,255,255,.75)';for(let k=0;k<5;k++){g.beginPath();g.ellipse(x+k*14-28,y-(k%2)*8,22,12,0,0,7);g.fill();}}});
 const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,fog:false,depthWrite:false}));m.position.set(0,y,z);m.layers.set(NOINK);m.renderOrder=-5;root.add(m);return m;
}

// ---------------- alley dressing ----------------
export function trashCan(){const r=new THREE.Group();cylinder(r,.33,.85,0,.425,0,'#7f8c8f',.29,18);cylinder(r,.36,.07,0,.88,0,'#95a2a5',.36,18);cylinder(r,.08,.06,0,.95,0,'#5d6769');for(let i=0;i<3;i++)cylinder(r,.335,.025,0,.2+i*.25,0,'#687477',.335,18);return r;}
export function dumpster(){const r=new THREE.Group();box(r,2.2,1.25,1.1,0,.68,0,'#3f7a5a');box(r,2.3,.1,1.2,0,1.33,0,'#356a4d');box(r,2.3,.08,.08,0,1.0,.58,'#2c5a40');for(const x of [-.9,.9]){const w=cylinder(r,.08,.08,x,.08,.45,'#26262c');w.rotation.z=Math.PI/2;}return r;}
export function crate(){const r=new THREE.Group();box(r,.85,.62,.65,0,.31,0,'#a77a50',true);for(const y of [.08,.54])box(r,.88,.07,.67,0,y,0,'#8b6240',true);return r;}
export function streetLamp(h=3.6){const r=new THREE.Group();cylinder(r,.07,h,0,h/2,0,'#2e3540',.09,12);box(r,.7,.06,.06,.3,h-.05,0,'#2e3540');
 const head=box(r,.34,.18,.34,.6,h-.17,0,'#2e3540');head.castShadow=false;const bulb=new THREE.Mesh(new THREE.SphereGeometry(.11,12,8),glow(2.2,1.7,.9));bulb.position.set(.6,h-.29,0);bulb.layers.set(NOINK);r.add(bulb);
 const light=new THREE.PointLight('#ffc977',7,9,1.5);light.position.set(.6,h-.45,0);r.add(light);r.userData.light=light;r.userData.bulb=bulb;return r;}
export function pipe(root:THREE.Object3D,x:number,z:number,h=4.5){cylinder(root,.07,h,x,h/2,z,'#6f7a80',.07,10);for(let y=.8;y<h;y+=1.3)cylinder(root,.1,.08,x,y,z,'#5d676d',.1,10);}
export function rentNote(){const r=new THREE.Group();const tex=canvasTex(512,384,(g)=>{g.fillStyle='#f7f1df';g.fillRect(0,0,512,384);g.fillStyle='#c8423b';g.font='900 74px Arial';g.textAlign='center';g.fillText('RENT',256,110);g.fillText('OVERDUE',256,200);g.fillStyle='#7d786a';for(let i=0;i<4;i++)g.fillRect(70,240+i*30,372-(i%2)*80,10);});
 const m=new THREE.Mesh(new THREE.PlaneGeometry(.5,.375),new THREE.MeshLambertMaterial({map:tex,side:THREE.DoubleSide}));m.layers.set(NOINK);r.add(m);return r;}

// ---------------- stage ----------------
export function curtain(w:number,h:number,color='#a8283a'){const r=new THREE.Group();const n=Math.round(w/.45);for(let i=0;i<n;i++){const c=cylinder(r,.26,h,-w/2+(i+.5)*w/n,h/2,(i%2)*.12,i%2?color:'#92203a',.26,12);c.castShadow=false;}box(r,w+.4,.6,.6,0,h-.2,.2,'#d2a94e');return r;}
export function spotCone(color='#fff3c9',r=1.3,h=7){const m=new THREE.Mesh(new THREE.ConeGeometry(r,h,40,1,true),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.09,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));m.layers.set(NOINK);return m;}
export function marqueeSign(text:string,w=4.8){const r=new THREE.Group();box(r,w+.3,1.1,.2,0,0,0,'#2b2333');label(r,text,w,.8,[0,0,.11],{bg:'#2b2333',ink:'#ffd76a',size:300,font:'900'});const bulbs:THREE.Mesh[]=[];for(let i=0;i<14;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(.05,10,8),glow(2,1.6,.7));const t=i/13;b.position.set(-w/2-.05+t*(w+.1),i%2?.5:-.5,.12);b.layers.set(NOINK);r.add(b);bulbs.push(b);}r.userData.bulbs=bulbs;return r;}

// ---------------- mansion hall ----------------
export function armchair(color='#8c2f3c'){const r=new THREE.Group();box(r,1.3,.45,1.05,0,.42,0,color);box(r,1.3,1.15,.25,0,1.05,-.42,color);for(const x of [-.6,.6])box(r,.22,.75,1.05,x,.65,0,color);box(r,1.02,.16,.82,0,.7,.05,'#a6404c');for(const x of [-.55,.55])for(const z of [-.4,.4])cylinder(r,.05,.2,x,.1,z,'#5a3a2a');return r;}
export function chandelier(){const r=new THREE.Group();cylinder(r,.02,1.4,0,.7,0,C.brass,.02,6);const ringM=new THREE.Mesh(new THREE.TorusGeometry(.55,.04,8,32),mat(C.brass));ringM.rotation.x=Math.PI/2;r.add(ringM);
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2;cylinder(r,.03,.14,Math.cos(a)*.55,.08,Math.sin(a)*.55,'#f3ead2',.03,8);const f=new THREE.Mesh(new THREE.SphereGeometry(.045,8,6),glow(2.2,1.6,.8));f.position.set(Math.cos(a)*.55,.2,Math.sin(a)*.55);f.layers.set(NOINK);r.add(f);}
 const light=new THREE.PointLight('#ffcf8a',4,10,1.5);light.position.y=-.2;r.add(light);r.userData.light=light;return r;}
export function fireplace(){const r=new THREE.Group();box(r,2.2,1.6,.6,0,.8,0,'#d8cdb8');box(r,2.5,.15,.75,0,1.65,.05,'#efe6d3');box(r,1.2,.95,.62,0,.48,.02,'#2b2226');
 const fire:THREE.Mesh[]=[];for(let i=0;i<3;i++){const f=new THREE.Mesh(new THREE.ConeGeometry(.16-.03*i,.5-.08*i,10),glow(2.2,1.0-.15*i,.25));f.position.set(-.25+i*.25,.3,.15);f.layers.set(NOINK);r.add(f);fire.push(f);}
 const light=new THREE.PointLight('#ff9a4a',3,6,1.6);light.position.set(0,.6,.8);r.add(light);r.userData.fire=fire;r.userData.light=light;return r;}
export function portrait(){const r=new THREE.Group();box(r,1.3,1.6,.08,0,0,0,C.gold);const tex=canvasTex(256,320,(g)=>{g.fillStyle='#35485a';g.fillRect(0,0,256,320);g.fillStyle='#2f3f63';g.beginPath();g.ellipse(128,300,90,90,0,Math.PI,0);g.fill();g.fillStyle='#faf9f5';g.beginPath();g.ellipse(128,150,55,66,0,0,7);g.fill();g.fillStyle='#5b3a26';g.beginPath();g.ellipse(128,108,58,34,0,Math.PI,0);g.fill();g.fillStyle='#292532';g.fillRect(105,148,8,8);g.fillRect(143,148,8,8);g.fillRect(112,185,32,5);});
 const m=new THREE.Mesh(new THREE.PlaneGeometry(1.08,1.38),new THREE.MeshLambertMaterial({map:tex}));m.position.z=.05;m.layers.set(NOINK);r.add(m);return r;}
export function grandClock(){const r=new THREE.Group();box(r,.7,2.5,.45,0,1.25,0,'#6b4630',true);const face=cylinder(r,.24,.04,0,2.05,.24,C.cream);face.rotation.x=Math.PI/2;const pend=new THREE.Group();pend.position.set(0,1.75,.24);r.add(pend);cylinder(pend,.015,.7,0,-.35,0,C.brass,.015,6);const bob=cylinder(pend,.09,.03,0,-.72,0,C.gold);bob.rotation.x=Math.PI/2;r.userData.pendulum=pend;
 const hand=box(r,.02,.18,.01,0,2.12,.27,C.ink);hand.rotation.z=.6;return r;}
export function trophy(){const r=new THREE.Group();box(r,.3,.12,.3,0,.06,0,'#3b2a20');cylinder(r,.04,.25,0,.24,0,C.gold,.04,10);cylinder(r,.2,.32,0,.52,0,C.gold,.08,16);return r;}
export function bench(){const r=new THREE.Group();box(r,1.8,.08,.5,0,.48,0,'#a7744a',true);box(r,1.8,.4,.06,0,.78,-.22,'#a7744a',true);for(const x of [-.75,.75])box(r,.08,.48,.45,x,.24,0,'#3d3a40');return r;}

// ---------------- painted buildings (shared facadeHD / roofHD painters) ----------------
export type BuildingStyle={wall:string;shutter:string;door?:boolean;brick?:boolean;roof?:string;key:string};
/** Box building whose street face is painted with windows, shutters, trims and an optional arched door. */
export function paintedBuilding(w:number,h:number,d:number,o:BuildingStyle){
 const r=new THREE.Group();
 const front=twoTone(new THREE.MeshLambertMaterial({map:facadeHD(o.key,w,h,{wall:o.wall,shutter:o.shutter,door:o.door,brick:o.brick})}));
 const side=mat(o.wall);
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),[side,side,side,side,front,side]);m.position.y=h/2;m.castShadow=m.receiveShadow=true;r.add(m);
 box(r,w+.3,.22,d+.3,0,h+.11,0,'#efe6d3');
 if(o.roof){const roofMat=twoTone(new THREE.MeshLambertMaterial({map:repTex(roofHD(o.roof),w/3,1)}));
  const rf=new THREE.Mesh(new THREE.CylinderGeometry(.01,d*.62,1.4,4,1),roofMat);rf.rotation.y=Math.PI/4;rf.scale.set(w/d,1,1);rf.position.y=h+.92;rf.castShadow=true;r.add(rf);
  const chimney=box(r,.5,1.2,.5,w*.3,h+1.1,-d*.15,'#b8674e');chimney.castShadow=true;}
 return r;
}

// ---------------- night-city dressing (user reference: night alley / neon street) ----------------
/** Vertical neon sign: stacked glowing letters, an arrow and a border; lights the wall under it. */
export function neonSign(text:string,color:[number,number,number],hex:string,h=2.4){
 const r=new THREE.Group(),w=.62;box(r,w+.1,h+.1,.12,0,0,0,'#1e1a2a');
 const cv=document.createElement('canvas');cv.width=128;cv.height=Math.round(128*h/w);const g=cv.getContext('2d')!;
 g.fillStyle='#000';g.fillRect(0,0,cv.width,cv.height);g.strokeStyle='#fff';g.lineWidth=6;g.strokeRect(8,8,cv.width-16,cv.height-16);
 g.fillStyle='#fff';g.font='900 70px Arial';g.textAlign='center';g.textBaseline='middle';const letters=[...text];const step=(cv.height-150)/letters.length;
 letters.forEach((c,i)=>g.fillText(c,64,40+step*(i+.5)));g.beginPath();g.moveTo(30,cv.height-95);g.lineTo(98,cv.height-95);g.lineTo(64,cv.height-30);g.closePath();g.fill();
 const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;
 const face=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,color:new THREE.Color(...color),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
 face.position.z=.065;face.layers.set(NOINK);r.add(face);
 const light=new THREE.PointLight(hex,4,5,1.5);light.position.set(0,0,.6);r.add(light);r.userData={face,light};return r;
}
/** Long coloured reflection streak on wet ground under a light (stretched towards the viewer). */
const STREAK=(()=>{const c=document.createElement('canvas');c.width=64;c.height=256;const g=c.getContext('2d')!;const v=g.createLinearGradient(0,0,0,256);v.addColorStop(0,'rgba(255,255,255,.9)');v.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=v;g.fillRect(0,0,64,256);g.globalCompositeOperation='destination-in';const h=g.createLinearGradient(0,0,64,0);h.addColorStop(0,'rgba(0,0,0,0)');h.addColorStop(.5,'rgba(0,0,0,1)');h.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=h;g.fillRect(0,0,64,256);return new THREE.CanvasTexture(c);})();
export function wetReflection(root:THREE.Object3D,x:number,z:number,color:string,w=.7,len=3.2,opacity=.45){
 const m=new THREE.Mesh(new THREE.PlaneGeometry(w,len),new THREE.MeshBasicMaterial({map:STREAK,color,transparent:true,opacity,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
 m.geometry.translate(0,-len/2,0);m.rotation.x=-Math.PI/2;m.position.set(x,.014,z);m.layers.set(NOINK);root.add(m);return m;
}
/** Soft additive halo (bloom-like glow around a hero source). */
export function halo(root:THREE.Object3D,pos:[number,number,number],color:string,size=2.2,opacity=.5){
 const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d')!;const gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,255,255,.8)');gr.addColorStop(.4,'rgba(255,255,255,.25)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),color,transparent:true,opacity,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));s.position.set(...pos);s.scale.setScalar(size);s.layers.set(NOINK);root.add(s);return s;
}
/** Wall-mounted air-conditioner unit on a steel bracket (front faces +z). */
export function acUnit(){const r=new THREE.Group();box(r,.9,.62,.38,0,0,.24,'#c9ccd6');const fan=cylinder(r,.22,.02,-.15,0,.44,'#8d92a0');fan.rotation.x=Math.PI/2;const hub=cylinder(r,.06,.03,-.15,0,.45,'#5d6270');hub.rotation.x=Math.PI/2;
 for(let i=0;i<5;i++)box(r,.3,.02,.01,.25,-.2+i*.1,.435,'#9aa0ad');for(const x of [-.35,.35]){box(r,.05,.05,.5,x,-.36,.2,'#2a2a33');const d=box(r,.04,.55,.04,x,-.2,.2,'#2a2a33');d.rotation.x=.75;}
 cylinder(r,.025,.8,.38,-.6,.3,'#8d92a0',.025,8);return r;}
/** Sagging overhead cable between two points. */
export function cable(root:THREE.Object3D,a:[number,number,number],b:[number,number,number],sag=.6,color='#14121c'){
 const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),M=A.clone().add(B).multiplyScalar(.5);M.y-=sag;
 const m=new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(A,M,B),24,.018,6),new THREE.MeshBasicMaterial({color}));root.add(m);return m;}
export function mailbox(){const r=new THREE.Group();box(r,.42,.5,.26,0,0,.13,'#c8323b');box(r,.3,.04,.02,0,.12,.265,'#2a1a1e');label(r,'MAIL',.28,.08,[0,-.05,.27],{bg:'#c8323b',ink:'#fff3e6',size:90});return r;}
export function bicycle(color='#2f8f8a'){const r=new THREE.Group();for(const x of [-.55,.55]){const t=new THREE.Mesh(new THREE.TorusGeometry(.32,.025,8,32),mat('#1f1c24'));t.position.set(x,.34,0);r.add(t);for(let k=0;k<6;k++){const s=box(r,.01,.62,.01,x,.34,0,'#9aa0ad');s.rotation.z=k*Math.PI/6;}}
 const bar=(a:[number,number],b:[number,number],c=color)=>{const len=Math.hypot(b[0]-a[0],b[1]-a[1]);const m=box(r,len,.04,.04,(a[0]+b[0])/2,(a[1]+b[1])/2,0,c);m.rotation.z=Math.atan2(b[1]-a[1],b[0]-a[0]);};
 bar([-.55,.34],[-.05,.36]);bar([-.05,.36],[.4,.8]);bar([-.55,.34],[-.15,.8]);bar([-.15,.8],[.4,.8]);bar([-.05,.36],[-.15,.8]);bar([.4,.8],[.55,.34]);bar([.4,.8],[.45,.98],'#1f1c24');box(r,.04,.04,.4,.45,.98,0,'#1f1c24');box(r,.26,.06,.12,-.15,.86,0,'#1f1c24');
 const basket=new THREE.Mesh(new THREE.BoxGeometry(.34,.22,.3),new THREE.MeshBasicMaterial({color:'#c9ccd6',wireframe:true}));basket.position.set(.62,.92,0);r.add(basket);return r;}
export function bottleCrate(color='#e8b93c'){const r=new THREE.Group();box(r,.62,.32,.42,0,.16,0,color);for(const x of [-.18,.18])box(r,.16,.08,.02,x,.2,.215,'#5a4a20');
 for(let i=0;i<4;i++)for(let j=0;j<3;j++){cylinder(r,.045,.28,-.22+i*.147,.42,-.12+j*.12,'#7a4a1e',.045,10);cylinder(r,.018,.1,-.22+i*.147,.6,-.12+j*.12,'#7a4a1e',.018,8);cylinder(r,.02,.02,-.22+i*.147,.66,-.12+j*.12,'#e8b93c',.02,8);}return r;}
export function pottedPlant(){const r=new THREE.Group();cylinder(r,.22,.4,0,.2,0,'#b8674e',.17,16);
 for(let i=0;i<9;i++){const leaf=new THREE.Mesh(new THREE.PlaneGeometry(.12,.9),new THREE.MeshLambertMaterial({color:i%2?'#4f9a52':'#3f8a48',side:THREE.DoubleSide}));leaf.geometry.translate(0,.45,0);leaf.position.y=.4;leaf.rotation.set((i%3-1)*.35,i*.7,(i%2?1:-1)*(.25+.1*(i%3)));r.add(leaf);}return r;}
/** Calico cat (sitting) with tail, ears and eyes; scenes animate tail, head and blink via userData. */
export function cat(){const r=new THREE.Group();const white='#f4f1ea',orange='#e08a3a',black='#2a2530';
 ball(r,.2,0,.2,0,white,1,1.15,.9);ball(r,.09,.08,.3,.12,orange,1,1,.6);ball(r,.08,-.1,.18,.13,black,1,1,.6);
 const head=new THREE.Group();head.position.set(0,.46,.04);r.add(head);ball(head,.15,0,0,0,white,1.1,.95,1);ball(head,.07,.07,.06,.06,orange,1,1,.6);
 for(const s of [-1,1]){const ear=new THREE.Mesh(new THREE.ConeGeometry(.05,.1,4),mat(s>0?orange:black));ear.position.set(s*.09,.13,0);ear.rotation.z=-s*.25;ear.castShadow=true;head.add(ear);}
 const eyes:THREE.Mesh[]=[];for(const s of [-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(.022,8,6),new THREE.MeshBasicMaterial({color:'#2a2530'}));e.position.set(s*.055,.01,.14);head.add(e);eyes.push(e);}
 const tail=new THREE.Group();tail.position.set(-.12,.08,-.12);r.add(tail);const t=new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(0,0,0),new THREE.Vector3(-.25,.05,0),new THREE.Vector3(-.2,.35,.05)),12,.03,6),mat(orange));t.castShadow=true;tail.add(t);
 r.userData={head,tail,eyes};return r;}
export function barredWindow(){const r=new THREE.Group();box(r,1.0,1.1,.08,0,0,0,'#2a2a38');const g=new THREE.Mesh(new THREE.PlaneGeometry(.86,.96),new THREE.MeshBasicMaterial({color:'#26304a'}));g.position.z=.045;r.add(g);for(let i=0;i<6;i++)box(r,.025,1.0,.03,-.38+i*.152,0,.07,'#3b3f4a');box(r,.92,.03,.03,0,.25,.07,'#3b3f4a');box(r,.92,.03,.03,0,-.25,.07,'#3b3f4a');return r;}
export function addressPlate(text:string){const r=new THREE.Group();label(r,text,.32,.18,[0,0,.01],{bg:'#2f4f9e',ink:'#ffffff',size:110});return r;}

// ---------------- alley rubbish and back door ----------------
/** Tied black bin bag: lumpy body, knot and a few creases. */
export function trashBag(color='#23222a',seed=1){const r=new THREE.Group();const j=(k:number)=>{const x=Math.sin(seed*91.7+k*13.1)*43758.5;return x-Math.floor(x);};
 ball(r,.3,0,.27,0,color,1.15,.95,1);ball(r,.2,.12+j(1)*.08,.42,.05,color,1,.9,1);ball(r,.18,-.14,.2,.1,color,1,.85,1);
 const knot=ball(r,.07,.04,.62,0,color,1,1.3,1);knot.rotation.z=.4;for(const s of [-1,1]){const e=new THREE.Mesh(new THREE.ConeGeometry(.04,.14,6),mat(color));e.position.set(.04+s*.05,.72,0);e.rotation.z=-s*.6;r.add(e);}
 const sheen=new THREE.Mesh(new THREE.PlaneGeometry(.05,.22),new THREE.MeshBasicMaterial({color:'#8a8fa8',transparent:true,opacity:.45}));sheen.position.set(-.12,.36,.3);sheen.rotation.z=.4;sheen.layers.set(NOINK);r.add(sheen);return r;}
/** Cardboard box, optionally open with flaps up, with tape and a printed arrow. */
export function cardboardBox(w=.6,h=.45,d=.5,open=false){const r=new THREE.Group();box(r,w,h,d,0,h/2,0,'#b88a55');box(r,w*.98,.05,.03,0,h*.6,d/2+.005,'#d9c9a0');
 label(r,'THIS SIDE UP',w*.5,.07,[0,h*.35,d/2+.01],{bg:'#b88a55',ink:'#5a3e22',size:80});
 if(open){for(const [x,z,ry,rz] of [[-w/2,0,0,.9],[w/2,0,0,-.9]] as const){const f=box(r,w*.5,.02,d,x*.95,h+.12,z,'#c99a63');f.rotation.z=rz;}const back=box(r,w,.02,d*.5,0,h+.15,-d/2,'#c99a63');back.rotation.x=-1.1;}
 else box(r,w*.98,.02,.08,0,h+.005,0,'#d9c9a0');return r;}
/** Scattered litter: newspapers, crushed cans, bottles, wrappers. Avoids the rectangles listed in `keepClear`. */
export function litter(root:THREE.Object3D,area:{x0:number;x1:number;z0:number;z1:number},count=26,keepClear:[number,number,number,number][]=[]){
 const paper=(()=>{const c=document.createElement('canvas');c.width=128;c.height=96;const g=c.getContext('2d')!;g.fillStyle='#e8e2d2';g.fillRect(0,0,128,96);g.fillStyle='#4a4a52';g.font='900 18px Arial';g.fillText('DAILY',8,22);for(let i=0;i<6;i++)g.fillRect(8,32+i*10,(i%2?70:110),4);g.fillStyle='#9aa0ad';g.fillRect(84,30,36,30);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;})();
 const H=(i:number,k:number)=>{const x=Math.sin(i*127.1+k*311.7)*43758.5453;return x-Math.floor(x);};let placed=0;
 for(let i=0;placed<count&&i<count*6;i++){const x=area.x0+H(i,1)*(area.x1-area.x0),z=area.z0+H(i,2)*(area.z1-area.z0);if(keepClear.some(([a,b,c,d])=>x>a&&x<b&&z>c&&z<d))continue;placed++;
  const kind=i%4;let m:THREE.Object3D;
  if(kind===0){m=new THREE.Mesh(new THREE.PlaneGeometry(.42,.3),new THREE.MeshLambertMaterial({map:paper,side:THREE.DoubleSide}));m.rotation.set(-Math.PI/2+(H(i,3)-.5)*.3,0,H(i,4)*6);m.position.set(x,.012,z);}
  else if(kind===1){m=cylinder(root,.04,.1,x,.04,z,['#c8323b','#3d7cc0','#e8b93c'][i%3],.045,10);m.rotation.set(Math.PI/2,H(i,5)*3,0);m.scale.y=.7;}
  else if(kind===2){m=new THREE.Group();cylinder(m,.05,.22,0,0,0,'#3f7a5a',.05,10);cylinder(m,.02,.08,0,.14,0,'#3f7a5a',.02,8);m.rotation.set(0,H(i,6)*6,Math.PI/2);m.position.set(x,.05,z);}
  else{m=new THREE.Mesh(new THREE.PlaneGeometry(.14,.1),new THREE.MeshLambertMaterial({color:['#e2564b','#f2c94c','#ffffff'][i%3],side:THREE.DoubleSide}));m.rotation.set(-Math.PI/2,0,H(i,7)*6);m.position.set(x,.013,z);}
  m.layers?.set?.(0);root.add(m);}
}
/** Steel back-alley door in a frame with a step, a caged wall lamp and a small sign. Front faces +z. */
export function backDoor(sign='STAFF ONLY'){const r=new THREE.Group();box(r,1.25,2.35,.12,0,1.17,0,'#3b3f4a');box(r,1.02,2.12,.06,0,1.08,.07,'#5a6474');
 for(const y of [.55,1.55])box(r,.9,.04,.02,0,y,.105,'#4a5262');box(r,.12,.05,.06,.36,1.05,.12,'#c9ccd2');box(r,.05,.18,.05,.42,1.0,.13,'#c9ccd2');
 box(r,1.5,.16,.5,0,.08,.2,'#8d939c');label(r,sign,.62,.16,[0,1.75,.11],{bg:'#e8b93c',ink:'#241e28',size:90});
 box(r,.26,.3,.2,0,2.6,.14,'#2a2a33');const bulb=new THREE.Mesh(new THREE.SphereGeometry(.08,12,8),glow(2.2,1.7,.9));bulb.position.set(0,2.58,.2);bulb.layers.set(NOINK);r.add(bulb);
 for(let i=0;i<3;i++)box(r,.02,.2,.02,-.08+i*.08,2.58,.27,'#1c1c22');const l=new THREE.PointLight('#ffc977',3.5,4,1.6);l.position.set(0,2.4,.6);r.add(l);return r;}
