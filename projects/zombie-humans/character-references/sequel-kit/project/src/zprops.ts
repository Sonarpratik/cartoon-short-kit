// Zombie-shelter props: mall glass front, signpost, house interior pieces, supermarket roof, boat + pier, the #1 compound.
// Metres; origin at the base centre unless noted. Animated parts are exposed on the returned group.
import * as THREE from 'three';
import { box, cylinder, ball, place, label, mat, glow, C, puff, car, type Car } from './props';
import { NOINK } from './engine/ink';
import { twoTone } from './engine/shade';
import { ctex, rep, stoneHD, waterNear } from './engine/paint';

const lambert=(o:THREE.MeshLambertMaterialParameters)=>twoTone(new THREE.MeshLambertMaterial(o));
function canvasTex(w:number,h:number,draw:(g:CanvasRenderingContext2D)=>void){const cv=document.createElement('canvas');cv.width=w;cv.height=h;draw(cv.getContext('2d')!);const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;}
/** Sign board with bold sans lettering (in-world signs must read correctly from the front). */
export function signBoard(root:THREE.Object3D,text:string,w:number,h:number,pos:[number,number,number],o:{bg?:string;ink?:string;border?:string;glowK?:number}={}){
 const tex=canvasTex(1024,Math.round(1024*h/w),g=>{const H=g.canvas.height;g.fillStyle=o.bg??'#f4efe0';g.fillRect(0,0,1024,H);if(o.border){g.lineWidth=H*.08;g.strokeStyle=o.border;g.strokeRect(H*.06,H*.06,1024-H*.12,H*.88);}
  g.fillStyle=o.ink??C.ink;g.font=`900 ${Math.round(H*.62)}px Arial Black, Arial`;g.textAlign='center';g.textBaseline='middle';g.fillText(text,512,H*.54,960);});
 const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),o.glowK?new THREE.MeshBasicMaterial({map:tex,color:new THREE.Color(o.glowK,o.glowK,o.glowK),toneMapped:true}):new THREE.MeshLambertMaterial({map:tex}));
 m.position.set(...pos);m.layers.set(NOINK);root.add(m);return m;
}

// ---------------- city street ----------------
export type PoliceCar=Car&{red:THREE.Mesh;blue:THREE.Mesh;redL:THREE.PointLight;blueL:THREE.PointLight};
/** Abandoned police car with a light bar; scenes alternate red/blue. */
export function policeCar():PoliceCar{
 const r=car('#f1ede4') as PoliceCar;box(r.body,.9,.05,1.42,-.26,1.24,0,'#1d2a4a');
 for(const z of [-.81,.81]){box(r.body,1.4,.24,.02,-.1,.62,z,'#1d2a4a');}
 const bar=new THREE.Group();bar.position.set(-.26,1.6,0);r.body.add(bar);box(bar,.3,.06,1.1,0,0,0,'#2a2a30');
 r.red=new THREE.Mesh(new THREE.BoxGeometry(.24,.12,.42),glow(2.4,.2,.15));r.red.position.set(0,.08,-.26);r.blue=new THREE.Mesh(new THREE.BoxGeometry(.24,.12,.42),glow(.2,.5,2.6));r.blue.position.set(0,.08,.26);
 r.red.layers.set(NOINK);r.blue.layers.set(NOINK);bar.add(r.red,r.blue);
 r.redL=new THREE.PointLight('#ff3b30',0,11,1.4);r.redL.position.set(-.26,2,-.5);r.blueL=new THREE.PointLight('#3d7bff',0,11,1.4);r.blueL.position.set(-.26,2,.5);r.add(r.redL,r.blueL);
 return r;
}
/** Siren rhythm: red and blue alternate in double pulses. */
export function siren(p:PoliceCar,f:number,k=1){const ph=f%16,red=ph<3||(ph>=5&&ph<7),blue=ph>=8&&ph<11||ph>=13&&ph<15;
 (p.red.material as THREE.MeshBasicMaterial).color.setRGB(red?2.6*k:.35,.12,.1);(p.blue.material as THREE.MeshBasicMaterial).color.setRGB(.08,.2,blue?2.8*k:.35);
 p.redL.intensity=red?9*k:0;p.blueL.intensity=blue?9*k:0;}
/** Five-arrow signpost (labels top to bottom), arrows alternate left/right. */
export function signpost(labels:string[],colors:string[]){
 const r=new THREE.Group();cylinder(r,.07,3.6,0,1.8,0,'#5a4636',.09,10);const boards:THREE.Group[]=[];
 labels.forEach((t,i)=>{const b=new THREE.Group();const dir=i%2?-1:1;b.position.set(0,3.2-i*.52,0);r.add(b);
  const sh=new THREE.Shape();sh.moveTo(0,-.19);sh.lineTo(1.25,-.19);sh.lineTo(1.5,0);sh.lineTo(1.25,.19);sh.lineTo(0,.19);sh.closePath();
  const m=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:.06,bevelEnabled:false}),mat(colors[i]));m.castShadow=true;m.position.z=.04;m.scale.x=dir;b.add(m);
  signBoard(b,t,1.12,.3,[dir*.64,0,.105],{bg:colors[i],ink:'#ffffff'});boards.push(b);});
 r.userData.boards=boards;return r;
}

// ---------------- the mall ----------------
const crackTex=canvasTex(512,512,g=>{g.clearRect(0,0,512,512);g.strokeStyle='rgba(255,255,255,.95)';g.lineCap='round';let s=7;const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647;};
 const cx=256,cy=230;for(let i=0;i<11;i++){let x=cx,y=cy,a=i/11*Math.PI*2+rnd()*.3;g.lineWidth=5;g.beginPath();g.moveTo(x,y);for(let k=0;k<6;k++){a+=(rnd()-.5)*.7;const l=30+rnd()*40;x+=Math.cos(a)*l;y+=Math.sin(a)*l;g.lineTo(x,y);}g.stroke();}
 for(const rr of [40,95,150]){g.lineWidth=3;g.beginPath();for(let i=0;i<=24;i++){const a=i/24*Math.PI*2,q=rr*(.85+rnd()*.3);i?g.lineTo(cx+Math.cos(a)*q,cy+Math.sin(a)*q):g.moveTo(cx+Math.cos(a)*q,cy+Math.sin(a)*q);}g.stroke();}});
/** Spiderweb crack overlay; scale 0→1 to grow it. */
export function crack(){const m=new THREE.Mesh(new THREE.PlaneGeometry(1.6,1.6),new THREE.MeshBasicMaterial({map:crackTex,transparent:true,depthWrite:false,fog:false}));m.layers.set(NOINK);m.renderOrder=7;return m;}
const shopTex=(kind:'food'|'clothes'|'tv')=>canvasTex(512,384,g=>{
 g.fillStyle=kind==='food'?'#ffe7b8':kind==='clothes'?'#f3d6e4':'#22283a';g.fillRect(0,0,512,384);
 if(kind==='food'){for(let row=0;row<3;row++){g.fillStyle='#9a6a44';g.fillRect(0,110+row*110,512,12);for(let i=0;i<9;i++){g.fillStyle=['#e2564b','#e8b93c','#5fae6a','#3d7cc0','#f08a3c'][(i+row)%5];g.fillRect(14+i*56,60+row*110,40,50);g.fillStyle='rgba(255,255,255,.5)';g.fillRect(18+i*56,66+row*110,8,38);}}g.fillStyle='#c8423b';g.font='900 54px Arial Black';g.textAlign='center';g.fillText('FOOD',256,46);}
 else if(kind==='clothes'){g.fillStyle='#c8423b';g.font='900 54px Arial Black';g.textAlign='center';g.fillText('SALE',256,52);g.fillStyle='#6b5a4a';g.fillRect(40,90,432,8);
  for(let i=0;i<6;i++){const x=70+i*74;g.fillStyle=['#3d7cc0','#e2564b','#e8b93c','#7b5ac9','#2f8f8a','#f08a3c'][i];g.beginPath();g.moveTo(x-28,110);g.lineTo(x+28,110);g.lineTo(x+34,230);g.lineTo(x-34,230);g.closePath();g.fill();g.strokeStyle='#5a4a3a';g.lineWidth=3;g.beginPath();g.moveTo(x,96);g.lineTo(x,110);g.stroke();}
  for(const x of [120,390]){g.fillStyle='#e8d8c8';g.beginPath();g.ellipse(x,270,26,30,0,0,7);g.fill();g.fillStyle=x<200?'#c8423b':'#3d7cc0';g.fillRect(x-40,300,80,84);}}
 else{for(let i=0;i<3;i++){const x=20+i*165;g.fillStyle='#111';g.fillRect(x,80,150,110);g.fillStyle=['#5fb4ff','#ffcf5a','#ff7a9a'][i];g.fillRect(x+8,88,134,94);g.fillStyle='#333';g.fillRect(x+60,190,30,20);}
  for(let i=0;i<2;i++){const x=100+i*170;g.fillStyle='#111';g.fillRect(x,230,150,110);g.fillStyle=['#8af0c8','#c9a3ff'][i];g.fillRect(x+8,238,134,94);}g.fillStyle='#ffe68a';g.font='900 50px Arial Black';g.textAlign='center';g.fillText('TV',256,54);}});
export type Mall=THREE.Group&{doors:THREE.Mesh[];tv:THREE.Mesh;bulbs:THREE.Mesh[];sign:THREE.Mesh;doorX:number[];open:(k:number,keep?:number[])=>void};
/** Long low mall: a curtain wall of glass doors on the street face (z = 0 plane), shop windows, rooftop sign. */
export function mall(doorCount=14):Mall{
 const r=new THREE.Group() as Mall,W=doorCount*1.5+6,H=7.5;
 box(r,W,H,10,0,H/2,-6.1,'#e4d6c2').castShadow=false;
 // Street face: upper facade over the door line and solid ends, so the atrium can sit behind the doors.
 box(r,W,H-2.95,.3,0,2.95+(H-2.95)/2,-.2,'#e4d6c2').castShadow=false;for(const sx of [-1,1])box(r,(W-doorCount*1.5)/2,2.95,.3,sx*(W/2-(W-doorCount*1.5)/4),1.475,-.2,'#e4d6c2').castShadow=false;
 // Atrium floor inside the doors.
 box(r,doorCount*1.5,.02,1.1,0,.01,-.5,'#e8d6b0').castShadow=false;
 box(r,W+.4,.6,10.6,0,H+.3,-5.05,'#c8423b');box(r,W,.18,.6,0,3.15,.15,'#3b3f4a');
 // Canopy over the doors.
 box(r,doorCount*1.5+.6,.16,1.6,0,3.3,.75,'#f4efe0');for(let i=0;i<=doorCount/2;i++)cylinder(r,.05,3.3,-doorCount*.75+i*3,1.65,1.45,'#3b3f4a',.05,8);
 // Doors: sliding glass pairs in steel frames; r.open(k) slides each pair apart (except doors listed in `keep`).
 r.doors=[];r.doorX=[];const glassMat=new THREE.MeshLambertMaterial({color:'#bfe4f2',emissive:new THREE.Color('#2a4a60'),emissiveIntensity:.5,transparent:true,opacity:.42,depthWrite:false});
 const leaves:{m:THREE.Mesh;x:number;side:number;i:number}[]=[];
 for(let i=0;i<doorCount;i++){const x=-doorCount*.75+.75+i*1.5;r.doorX.push(x);box(r,.1,2.9,.18,x-.72,1.45,.05,'#3b3f4a');
  for(const side of [-1,1]){const g=new THREE.Group();g.position.set(x+side*.33,1.4,.06);r.add(g);const m=new THREE.Mesh(new THREE.PlaneGeometry(.64,2.75),glassMat);m.renderOrder=5;g.add(m);
   box(g,.04,2.75,.05,-side*.31,0,.01,'#5d6270');box(g,.05,.36,.06,-side*.24,-.15,.05,'#d9dbe0');leaves.push({m:g as unknown as THREE.Mesh,x:x+side*.33,side,i});if(side<0)r.doors.push(m);}}
 box(r,.1,2.9,.18,doorCount*.75,1.45,.05,'#3b3f4a');box(r,doorCount*1.5,.12,.2,0,2.88,.05,'#3b3f4a');
 r.open=(k:number,keep:number[]=[])=>leaves.forEach(l=>{const kk=keep.includes(l.i)?0:k;l.m.position.x=l.x+l.side*.6*kk;});
 // Lit atrium seen through the doors: floor, escalators, shop fronts, hanging banners.
 const atriumTex=canvasTex(2048,400,g=>{const gr=g.createLinearGradient(0,0,0,400);gr.addColorStop(0,'#fff1cf');gr.addColorStop(.7,'#f6dcae');gr.addColorStop(1,'#d9b98c');g.fillStyle=gr;g.fillRect(0,0,2048,400);
  for(let i=0;i<12;i++){const x=i*175+20;g.fillStyle=['#e2564b','#3d7cc0','#e8b93c','#5fae6a','#7b5ac9','#f08a3c'][i%6];g.fillRect(x,60,150,26);g.fillStyle='#fff8e6';g.fillRect(x+6,92,138,150);g.fillStyle='rgba(60,50,40,.35)';for(let k=0;k<4;k++)g.fillRect(x+14+k*32,110,22,120);}
  g.strokeStyle='#9aa0a8';g.lineWidth=10;for(const x0 of [500,1400]){g.beginPath();g.moveTo(x0,380);g.lineTo(x0+260,120);g.stroke();g.beginPath();g.moveTo(x0+80,380);g.lineTo(x0+340,120);g.stroke();g.fillStyle='rgba(120,128,140,.5)';g.beginPath();g.moveTo(x0,380);g.lineTo(x0+260,120);g.lineTo(x0+340,120);g.lineTo(x0+80,380);g.fill();}
  g.fillStyle='#c9a77c';g.fillRect(0,330,2048,70);g.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<20;i++)g.fillRect(i*110,345,60,6);});
 const atrium=new THREE.Mesh(new THREE.PlaneGeometry(doorCount*1.5,2.8),new THREE.MeshBasicMaterial({map:atriumTex,color:new THREE.Color(1.15,1.08,.95)}));atrium.position.set(0,1.4,-.9);atrium.layers.set(NOINK);r.add(atrium);
 const inLight=new THREE.PointLight('#ffe2b0',4,8,1.4);inLight.position.set(0,2,1.2);r.add(inLight);
 // Shop windows on the upper floor: food, clothes, TVs.
 const kinds=['food','clothes','tv','food','clothes','tv'] as const;
 kinds.forEach((k,i)=>{const x=-W/2+3+i*(W-6)/5;const m=new THREE.Mesh(new THREE.PlaneGeometry(3,2.25),new THREE.MeshBasicMaterial({map:shopTex(k),color:new THREE.Color(1.05,1.05,1.05)}));m.position.set(x,5.2,.02);m.layers.set(NOINK);r.add(m);if(k==='tv')r.tv=m;box(r,3.2,.14,.3,x,4.02,.12,'#3b3f4a');});
 // Sign with marquee bulbs.
 r.sign=signBoard(r,'MEGA MALL',8,1.4,[0,H+1.5,.1],{bg:'#2b2333',ink:'#ffd76a',glowK:1.25});box(r,8.4,1.7,.18,0,H+1.5,0,'#3b3240');
 r.bulbs=[];for(let i=0;i<22;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(.07,10,8),glow(2,1.6,.7));const t=i/21;b.position.set(-4.1+t*8.2,H+1.5+(i%2?.78:-.78),.14);b.layers.set(NOINK);r.add(b);r.bulbs.push(b);}
 const sl=new THREE.PointLight('#ffd78a',6,14,1.4);sl.position.set(0,H+.5,2.5);r.add(sl);
 return r;
}

// ---------------- the house ----------------
export function sofa(color='#c46a3a'){const r=new THREE.Group();box(r,2.3,.45,.95,0,.35,0,color);box(r,2.3,.8,.28,0,.85,-.38,color);for(const x of [-1.08,1.08])box(r,.24,.62,.95,x,.52,0,color);
 for(const x of [-.55,.55])box(r,1.02,.16,.78,x,.64,.05,'#d98a5a');ball(r,.2,-.75,.86,-.15,'#e8b93c',1,.8,.5);return r;}
export function tvSet(){const r=new THREE.Group();box(r,1.6,.55,.5,0,.28,0,'#6b4630',true);box(r,1.5,.9,.08,0,1.05,0,'#16151a');
 const screen=new THREE.Mesh(new THREE.PlaneGeometry(1.38,.78),new THREE.MeshBasicMaterial({color:new THREE.Color(.5,.8,1.2)}));screen.position.set(0,1.05,.045);screen.layers.set(NOINK);r.add(screen);
 const light=new THREE.PointLight('#8fc8ff',2,4,1.6);light.position.set(0,1.1,.6);r.add(light);r.userData={screen,light};return r;}
export function floorLamp(){const r=new THREE.Group();cylinder(r,.22,.04,0,.02,0,'#2e2a30');cylinder(r,.025,1.55,0,.8,0,'#c1a269',.025,8);
 const shade=new THREE.Mesh(new THREE.CylinderGeometry(.2,.32,.38,24,1,true),new THREE.MeshBasicMaterial({color:new THREE.Color(1.6,1.25,.75),side:THREE.DoubleSide}));shade.position.y=1.7;shade.layers.set(NOINK);r.add(shade);
 const light=new THREE.PointLight('#ffc477',7,7,1.5);light.position.y=1.55;r.add(light);r.userData={light,shade};return r;}
export type Calendar=THREE.Group&{set:(day:string,color?:string)=>void};
export function calendarPad():Calendar{const r=new THREE.Group() as Calendar;box(r,.62,.78,.04,0,0,0,'#f7f1df');box(r,.64,.18,.06,0,.33,.01,'#c8423b');
 const cv=document.createElement('canvas');cv.width=256;cv.height=256;const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;
 const face=new THREE.Mesh(new THREE.PlaneGeometry(.56,.56),new THREE.MeshBasicMaterial({map:tex}));face.position.set(0,-.07,.025);face.layers.set(NOINK);r.add(face);let last='';
 r.set=(day,color='#292532')=>{if(day+color===last)return;last=day+color;const g=cv.getContext('2d')!;g.fillStyle='#f7f1df';g.fillRect(0,0,256,256);g.fillStyle=color;g.font='900 150px Arial Black';g.textAlign='center';g.textBaseline='middle';g.fillText(day,128,120);g.font='700 40px Arial';g.fillText('DAY',128,220);tex.needsUpdate=true;};
 r.set('1');return r;}
export function wallClockZ(){const r=new THREE.Group();const face=cylinder(r,.3,.05,0,0,0,'#f4efe0');face.rotation.x=Math.PI/2;const rim=new THREE.Mesh(new THREE.TorusGeometry(.31,.03,8,40),mat('#2e2a30'));r.add(rim);
 const hour=new THREE.Group(),minute=new THREE.Group();hour.position.z=minute.position.z=.04;r.add(hour,minute);box(hour,.03,.15,.01,0,.07,0,'#292532');box(minute,.02,.24,.01,0,.11,0,'#c8423b');r.userData={hour,minute};return r;}

// ---------------- supermarket rooftop ----------------
export type Ladder=THREE.Group&{rungs:THREE.Mesh[]};
/** Aluminium ladder; origin at its foot, leans along -z when rotated. */
export function ladder(len=4.6):Ladder{const r=new THREE.Group() as Ladder;r.rungs=[];for(const x of [-.24,.24])box(r,.07,len,.09,x,len/2,0,'#c9ccd2');for(let y=.3;y<len-.1;y+=.36)r.rungs.push(box(r,.48,.05,.06,0,y,0,'#aab0b8'));return r;}
export function skylight(){const r=new THREE.Group();box(r,2.6,.35,1.8,0,.18,0,'#9aa0a8');
 const tex=canvasTex(512,360,g=>{g.fillStyle='#f6f0dd';g.fillRect(0,0,512,360);for(let row=0;row<4;row++){g.fillStyle='#8a6a4a';g.fillRect(0,60+row*85,512,16);for(let i=0;i<14;i++){g.fillStyle=['#e2564b','#e8b93c','#5fae6a','#3d7cc0','#f08a3c','#f4efe0'][(i*3+row)%6];g.fillRect(6+i*36,20+row*85,26,40);}}});
 const gl=new THREE.Mesh(new THREE.PlaneGeometry(2.3,1.5),new THREE.MeshBasicMaterial({map:tex,color:new THREE.Color(1.1,1.1,1.05)}));gl.rotation.x=-Math.PI/2;gl.position.y=.36;gl.layers.set(NOINK);r.add(gl);
 for(const x of [-.4,.4])box(r,.05,.06,1.5,x,.38,0,'#6b7078');return r;}
export function hvac(){const r=new THREE.Group();box(r,1.6,1.1,1.1,0,.55,0,'#c9ccd2');const fan=new THREE.Group();fan.position.set(0,1.13,0);r.add(fan);cylinder(r,.42,.06,0,1.11,0,'#5d6270');
 for(let k=0;k<4;k++){const b=box(fan,.7,.02,.14,0,.02,0,'#8d92a0');b.rotation.y=k*Math.PI/4;}for(let i=0;i<5;i++)box(r,1.4,.03,.02,0,.25+i*.15,.56,'#8d92a0');r.userData.fan=fan;return r;}
export function supermarket(w=16,d=12,h=5){const r=new THREE.Group();box(r,w,h,d,0,h/2,0,'#f1e3c8').castShadow=false;
 const roof=new THREE.Mesh(new THREE.PlaneGeometry(w-.4,d-.4),lambert({color:'#a9a49a',map:rep(stoneHD('roofGravel',['#a8a399','#9d988e','#b1aca2','#958f86'],'#8a857c'),6,5)}));roof.rotation.x=-Math.PI/2;roof.position.y=h+.01;roof.receiveShadow=true;r.add(roof);
 for(const [x,z,ww,dd] of [[0,d/2,w,.3],[0,-d/2,w,.3],[w/2,0,.3,d],[-w/2,0,.3,d]] as const)box(r,ww,.55,dd,x,h+.27,z,'#e2d2b4');
 signBoard(r,'SUPERMARKET',9,1.3,[0,h-1.1,d/2+.02],{bg:'#2f6b4f',ink:'#ffffff'});
 // Shop front: glass + green awning.
 const glassMat=new THREE.MeshLambertMaterial({color:'#9fd0e8',emissive:new THREE.Color('#2a4a60'),emissiveIntensity:.5});const front=new THREE.Mesh(new THREE.PlaneGeometry(w*.7,2.6),glassMat);front.position.set(0,1.4,d/2+.02);r.add(front);
 for(let i=0;i<8;i++)box(r,w*.7/8,.12,1.2,-w*.35+(i+.5)*w*.7/8,3.0,d/2+.6,i%2?'#f4efe0':'#2f8f5a');
 return r;}

// ---------------- harbour ----------------
export function waterPlane(size=120,color='#3a6a8a'){const t=waterNear();const m=new THREE.Mesh(new THREE.PlaneGeometry(size,size,1,1),new THREE.MeshLambertMaterial({color,map:rep(t,size/6,size/6),transparent:true,opacity:.96}));m.rotation.x=-Math.PI/2;m.receiveShadow=true;m.userData.tex=m.material.map;return m;}
export function pier(len=12,w=3){const r=new THREE.Group();for(let i=0;i<len/.35;i++){const p=box(r,w,.08,.3,0,1.1,-i*.35,i%3?'#a7744a':'#9b6a42',true);p.castShadow=false;}
 for(let i=0;i<=len/3;i++)for(const x of [-w/2+.1,w/2-.1])cylinder(r,.13,2.4,x,.2,-i*3,'#6b4630',.13,10);for(const x of [-w/2+.1,w/2-.1])box(r,.1,.1,len,x,1.75,-len/2+.15,'#7b5332',true);
 for(let i=0;i<=len/3;i++)for(const x of [-w/2+.1,w/2-.1])cylinder(r,.06,.6,x,1.45,-i*3,'#6b4630',.06,8);return r;}
export type Boat=THREE.Group&{hull:THREE.Group};
export function boat(color='#f4efe0',stripe='#c8423b'):Boat{
 const r=new THREE.Group() as Boat;const hull=new THREE.Group();r.add(hull);r.hull=hull;
 const sh=new THREE.Shape();sh.moveTo(-2.6,.9);sh.lineTo(2.2,.9);sh.quadraticCurveTo(3.2,.95,3.4,1.25);sh.lineTo(2.6,.15);sh.quadraticCurveTo(0,-.05,-2.4,.2);sh.lineTo(-2.6,.9);
 const g=new THREE.ExtrudeGeometry(sh,{depth:2.2,bevelEnabled:true,bevelSize:.12,bevelThickness:.12,bevelSegments:3});g.translate(0,0,-1.1);const m=new THREE.Mesh(g,mat(color));m.castShadow=m.receiveShadow=true;hull.add(m);
 for(const z of [-1.23,1.23])box(hull,5.4,.16,.02,.2,.62,z,stripe);box(hull,5,.08,2.1,0,.9,0,'#c99a6a',true);
 box(hull,1.8,1.1,1.6,-.6,1.5,0,'#f4efe0');box(hull,2,.1,1.8,-.6,2.08,0,'#3d7cc0');for(const z of [-.81,.81])box(hull,1.2,.45,.02,-.6,1.6,z,'#8fc6e3');
 cylinder(hull,.04,2.6,-.6,3.3,0,'#d9dbe0',.04,8);const flag=new THREE.Mesh(new THREE.PlaneGeometry(.6,.36),new THREE.MeshLambertMaterial({color:'#e8b93c',side:THREE.DoubleSide}));flag.position.set(-.3,4.4,0);hull.add(flag);r.userData.flag=flag;
 for(const z of [-1.1,1.1])box(hull,4.4,.06,.04,.3,1.25,z,'#d9dbe0');
 // Rail posts, portholes with warm light, life ring, nav lights, searchlight, fenders, coiled rope, antenna.
 for(const z of [-1.1,1.1])for(let i=0;i<9;i++)cylinder(hull,.025,.36,-1.8+i*.5,1.08,z,'#d9dbe0',.025,6);
 const warm=new THREE.MeshBasicMaterial({color:new THREE.Color(1.7,1.25,.65)});
 for(const z of [-1.24,1.24])for(const x of [-1.6,-.9,1.3,1.9]){const ph=new THREE.Mesh(new THREE.CircleGeometry(.09,16),warm);ph.position.set(x,.55,z);if(z<0)ph.rotation.y=Math.PI;ph.layers.set(NOINK);hull.add(ph);const rim=new THREE.Mesh(new THREE.TorusGeometry(.1,.018,6,20),mat('#d9dbe0'));rim.position.copy(ph.position);if(z<0)rim.rotation.y=Math.PI;hull.add(rim);}
 for(const z of [-.815,.815]){const w=new THREE.Mesh(new THREE.PlaneGeometry(1.1,.38),warm);w.position.set(-.6,1.6,z*1.003);if(z<0)w.rotation.y=Math.PI;w.layers.set(NOINK);hull.add(w);}
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.26,.08,10,28),mat('#f08a3c'));ring.position.set(.02,1.45,.83);hull.add(ring);for(let k=0;k<4;k++){const s=box(hull,.06,.17,.17,0,0,0,'#f4efe0');s.position.set(.02+Math.cos(k*Math.PI/2)*.26,1.45+Math.sin(k*Math.PI/2)*.26,.84);s.rotation.z=k*Math.PI/2;}
 const red=new THREE.Mesh(new THREE.SphereGeometry(.07,10,8),glow(2.6,.2,.15));red.position.set(.2,2.18,-.92);const green=new THREE.Mesh(new THREE.SphereGeometry(.07,10,8),glow(.2,2.4,.6));green.position.set(.2,2.18,.92);red.layers.set(NOINK);green.layers.set(NOINK);hull.add(red,green);
 const mast=new THREE.Mesh(new THREE.SphereGeometry(.06,10,8),glow(2.6,2.6,2.3));mast.position.set(-.6,4.62,0);mast.layers.set(NOINK);hull.add(mast);
 const sl=new THREE.Group();sl.position.set(-.1,2.25,0);hull.add(sl);cylinder(sl,.12,.24,0,.12,0,'#2e2a30',.12,12).rotation.z=Math.PI/2;const lens=new THREE.Mesh(new THREE.CircleGeometry(.1,16),glow(2.4,2.3,2));lens.position.set(.13,.12,0);lens.rotation.y=Math.PI/2;lens.layers.set(NOINK);sl.add(lens);
 for(const x of [-1.6,0,1.6])for(const z of [-1.28,1.28]){const fd=cylinder(hull,.1,.4,x,.5,z,'#f4efe0',.1,10);fd.rotation.x=.15*Math.sign(z);}
 for(let k=0;k<3;k++){const c=new THREE.Mesh(new THREE.TorusGeometry(.22-k*.05,.03,6,24),mat('#c9a77c'));c.rotation.x=Math.PI/2;c.position.set(1.9,.97+k*.04,.3);hull.add(c);}
 cylinder(hull,.015,1.2,-1.2,2.7,.5,'#d9dbe0',.015,6);
 const cabinLight=new THREE.PointLight('#ffc98a',1.6,3.5,1.8);cabinLight.position.set(-.6,1.6,1.4);hull.add(cabinLight);
 return r;}
export function buoy(color='#e2564b'){const r=new THREE.Group();ball(r,.32,0,.15,0,color,1,.8,1);cylinder(r,.05,.8,0,.6,0,'#f4efe0',.08,8);const l=new THREE.Mesh(new THREE.SphereGeometry(.07,10,8),glow(2.4,2,.9));l.position.y=1.05;l.layers.set(NOINK);r.add(l);r.userData.lamp=l;return r;}
export function jerrycan(){const r=new THREE.Group();box(r,.42,.55,.22,0,.28,0,'#c8423b');box(r,.3,.06,.06,0,.6,0,'#9a2f2a');cylinder(r,.05,.08,.14,.6,0,'#2e2a30');return r;}
export type Gauge=THREE.Group&{needle:THREE.Group};
export function fuelGauge():Gauge{const r=new THREE.Group() as Gauge;const tex=canvasTex(256,256,g=>{g.fillStyle='#1d1824';g.beginPath();g.arc(128,128,124,0,7);g.fill();g.fillStyle='#f4efe0';g.beginPath();g.arc(128,128,108,0,7);g.fill();
 g.lineWidth=14;g.strokeStyle='#e2564b';g.beginPath();g.arc(128,150,86,Math.PI*1.05,Math.PI*1.3);g.stroke();g.strokeStyle='#5fae6a';g.beginPath();g.arc(128,150,86,Math.PI*1.7,Math.PI*1.95);g.stroke();
 g.fillStyle='#1d1824';g.font='900 44px Arial Black';g.textAlign='center';g.fillText('E',44,150);g.fillText('F',212,150);g.font='900 30px Arial';g.fillText('FUEL',128,210);});
 const face=new THREE.Mesh(new THREE.CircleGeometry(.3,40),new THREE.MeshBasicMaterial({map:tex}));face.layers.set(NOINK);r.add(face);
 const needle=new THREE.Group();needle.position.set(0,-.05,.01);r.add(needle);const n=new THREE.Mesh(new THREE.PlaneGeometry(.025,.24),new THREE.MeshBasicMaterial({color:'#c8423b'}));n.position.y=.11;n.layers.set(NOINK);needle.add(n);r.needle=needle;
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.31,.025,8,40),mat('#2e2a30'));r.add(ring);return r;}
export function waterJug(){const r=new THREE.Group();const body=new THREE.Mesh(new THREE.CylinderGeometry(.2,.22,.6,20),new THREE.MeshLambertMaterial({color:'#bfe3f2',transparent:true,opacity:.55}));body.position.y=.3;r.add(body);
 const water=cylinder(r,.18,.04,0,.05,0,'#5fb4e6',.2,20);cylinder(r,.08,.1,0,.65,0,'#3d7cc0',.08,12);r.userData.water=water;return r;}

// ---------------- #1 compound ----------------
const chainTex=canvasTex(128,128,g=>{g.clearRect(0,0,128,128);g.strokeStyle='#c9ccd2';g.lineWidth=5;g.beginPath();g.moveTo(0,64);g.lineTo(64,0);g.lineTo(128,64);g.lineTo(64,128);g.closePath();g.stroke();g.strokeStyle='#8d92a0';g.lineWidth=2;g.stroke();});
export function chainFence(len:number,h=2.6){const r=new THREE.Group();const t=chainTex.clone();t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(len/.35,h/.35);t.needsUpdate=true;
 const m=new THREE.Mesh(new THREE.PlaneGeometry(len,h),new THREE.MeshLambertMaterial({map:t,transparent:true,alphaTest:.3,side:THREE.DoubleSide}));m.position.y=h/2;m.layers.set(NOINK);r.add(m);
 for(let x=-len/2;x<=len/2+.01;x+=2.5)cylinder(r,.05,h+.2,x,(h+.2)/2,0,'#8d92a0',.05,8);box(r,len,.06,.06,0,h,0,'#8d92a0');
 // Razor wire coil along the top.
 for(let x=-len/2;x<len/2;x+=.5){const c=new THREE.Mesh(new THREE.TorusGeometry(.18,.012,4,16),mat('#b9bec6'));c.position.set(x+.25,h+.2,0);c.rotation.y=Math.PI/2+.3;r.add(c);}
 return r;}
export type Gate=THREE.Group&{leaf:THREE.Group};
/** Heavy sliding steel gate; slide leaf.position.x from open (+w) to closed (0). */
export function steelGate(w=4.2,h=2.8):Gate{const r=new THREE.Group() as Gate;for(const x of [-w/2-.2,w/2+.2])box(r,.4,h+.6,.4,x,(h+.6)/2,0,'#7d8088');
 const leaf=new THREE.Group();r.add(leaf);r.leaf=leaf;box(leaf,w,.14,.1,0,.2,0,'#3f4a5a');box(leaf,w,.14,.1,0,h-.1,0,'#3f4a5a');box(leaf,w,.12,.1,0,h/2,0,'#3f4a5a');
 for(let i=0;i<=12;i++)box(leaf,.07,h-.2,.07,-w/2+i*w/12,h/2,0,'#56637a');const diag=box(leaf,w*1.08,.1,.08,0,h*.3,0,'#3f4a5a');diag.rotation.z=.35;
 signBoard(leaf,'KEEP OUT',1.6,.42,[0,h*.72,.07],{bg:'#e8b93c',ink:'#1d1824'});return r;}
export function concreteBuilding(w:number,h:number,d:number,o:{wall:string;trim:string;sign:string;signBg:string;signInk:string;windows:number;rows:number;bars?:boolean;door?:string}){
 const r=new THREE.Group();const wallMat=lambert({color:o.wall,map:rep(stoneHD('concrete'+o.wall,['#d8d4cc','#cfcbc2','#dedad2','#c8c3ba'],'#bdb8ae'),w/4,h/4)});
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),wallMat);m.position.y=h/2;m.castShadow=m.receiveShadow=true;r.add(m);box(r,w+.4,.4,d+.4,0,h+.2,0,o.trim);
 const lit:THREE.Mesh[]=[];for(let row=0;row<o.rows;row++)for(let i=0;i<o.windows;i++){const x=-w/2+(i+.5)*w/o.windows,y=1.5+row*(h-1.6)/o.rows;if(row===0&&Math.abs(x)<w/o.windows*.6)continue;
  box(r,1.2,1.1,.12,x,y,d/2+.02,'#3b3f4a');const g=new THREE.Mesh(new THREE.PlaneGeometry(1,.9),new THREE.MeshBasicMaterial({color:new THREE.Color(1.3,1.1,.7)}));g.position.set(x,y,d/2+.09);g.layers.set(NOINK);r.add(g);lit.push(g);
  if(o.bars)for(let k=0;k<5;k++)box(r,.04,1,.04,x-.4+k*.2,y,d/2+.14,'#2e2a30');}
 box(r,1.8,2.5,.2,0,1.25,d/2+.05,o.door??'#3f4a5a');signBoard(r,o.sign,Math.min(w*.7,6),1,[0,h-.75,d/2+.06],{bg:o.signBg,ink:o.signInk});r.userData.lit=lit;return r;}
export function generator(){const r=new THREE.Group();box(r,2,1.2,1.1,0,.6,0,'#e8b93c');box(r,2.1,.12,1.2,0,1.26,0,'#c99a2a');for(let i=0;i<6;i++)box(r,.03,.6,.02,-.6+i*.14,.7,.56,'#3b3f4a');
 cylinder(r,.08,.7,.7,1.6,-.2,'#5d6270',.08,10);box(r,.5,.3,.05,.5,.75,.56,'#2e2a30');const lamp=new THREE.Mesh(new THREE.SphereGeometry(.06,10,8),glow(.3,2.4,.5));lamp.position.set(.5,.95,.57);lamp.layers.set(NOINK);r.add(lamp);
 label(r,'POWER',.42,.14,[.5,.75,.585],{bg:'#2e2a30',ink:'#e8b93c',size:120});const steam=[0,1,2].map(()=>puff(r,'#9aa0a8',.35));r.userData={steam,lamp};return r;}
export type Flood=THREE.Group&{head:THREE.Mesh;light:THREE.SpotLight};
export function floodlight(h=6):Flood{const r=new THREE.Group() as Flood;cylinder(r,.09,h,0,h/2,0,'#5d6270',.11,10);box(r,.9,.5,.3,0,h+.1,.1,'#2e2a30');
 r.head=new THREE.Mesh(new THREE.PlaneGeometry(.8,.4),glow(2.6,2.5,2.2));r.head.position.set(0,h+.1,.26);r.head.layers.set(NOINK);r.add(r.head);
 r.light=new THREE.SpotLight('#f4f6ff',0,30,.7,.6,1.1);r.light.position.set(0,h,.4);r.light.target.position.set(0,0,6);r.add(r.light,r.light.target);return r;}
export function sandbags(n=6){const r=new THREE.Group();for(let i=0;i<n;i++){const row=i<n*.6?0:1;ball(r,.32,-n*.18+i*(row?.62:.52)+(row?.3:0),.18+row*.3,0,i%2?'#b8a27a':'#c9b28a',1.3,.55,.8);}return r;}
export function gearCrate(){const r=new THREE.Group();box(r,1.1,.6,.7,0,.3,0,'#3f4a5a');label(r,'GEAR',.6,.2,[0,.36,.36],{bg:'#3f4a5a',ink:'#ffffff',size:150});
 const helmet=ball(r,.2,-.25,.72,0,'#26304a',1,.75,1);helmet.scale.y=.7;const shield=box(r,.5,.7,.05,.3,.9,-.1,'#8fc6e3');shield.rotation.x=-.2;label(r,'POLICE',.36,.1,[.3,.95,-.06],{bg:'#8fc6e3',ink:'#1d2a4a',size:120}).rotation.x=-.2;return r;}
// ---------------- compound dressing ----------------
export function schoolBus(){const r=new THREE.Group();box(r,7.6,2.3,2.3,0,1.55,0,'#f2b628');box(r,1.4,1.3,2.25,4.3,1,0,'#f2b628');box(r,7.62,.12,2.32,0,1.2,0,'#1d1824');box(r,7.62,.08,2.32,0,.75,0,'#1d1824');
 const glassM=new THREE.MeshLambertMaterial({color:'#8fc6e3',emissive:new THREE.Color('#203848'),emissiveIntensity:.4});
 for(const z of [-1.16,1.16])for(let i=0;i<7;i++){const w=new THREE.Mesh(new THREE.PlaneGeometry(.8,.7),glassM);w.position.set(-3.2+i*1,2.05,z);if(z<0)w.rotation.y=Math.PI;r.add(w);}
 const ws=new THREE.Mesh(new THREE.PlaneGeometry(2,.9),glassM);ws.position.set(3.81,2.05,0);ws.rotation.y=Math.PI/2;r.add(ws);
 signBoard(r,'SCHOOL BUS',2.6,.4,[0,2.55,1.17],{bg:'#f2b628',ink:'#1d1824'});
 for(const x of [-2.6,2.9])for(const z of [-1.15,1.15]){const t=new THREE.Mesh(new THREE.TorusGeometry(.32,.16,10,24),mat('#26262c'));t.position.set(x,.48,z);r.add(t);cylinder(r,.2,.25,x,.48,z,'#c9ccd2',.2,16).rotation.x=Math.PI/2;}
 for(const z of [-.7,.7]){const l=new THREE.Mesh(new THREE.SphereGeometry(.12,10,8),glow(1.8,1.6,1.1));l.position.set(5.02,.9,z);l.layers.set(NOINK);r.add(l);}
 const stop=box(r,.05,.5,.5,0,1.4,1.3,'#c8423b');stop.rotation.z=0;return r;}
export function tent(color='#3d7cc0'){const r=new THREE.Group();const g=new THREE.ConeGeometry(1.4,1.7,4,1);g.rotateY(Math.PI/4);const m=new THREE.Mesh(g,mat(color));m.scale.set(1,1,1.4);m.position.y=.85;m.castShadow=true;r.add(m);
 const door=new THREE.Mesh(new THREE.PlaneGeometry(.7,1),new THREE.MeshBasicMaterial({color:'#1d1824'}));door.position.set(0,.5,1.0);door.rotation.x=-.42;r.add(door);return r;}
export function campfire(){const r=new THREE.Group();for(let i=0;i<8;i++){const a=i/8*Math.PI*2;ball(r,.12,Math.cos(a)*.42,.08,Math.sin(a)*.42,'#7d7a80',1,.7,1);}
 for(let i=0;i<4;i++){const l=cylinder(r,.05,.7,0,.1,0,'#6b4630',.05,8);l.rotation.z=Math.PI/2;l.rotation.y=i*Math.PI/4;}
 const flames=[0,1,2,3,4].map(i=>puff(r,i%2?'#ffb347':'#ff6a2a',.85,true));const light=new THREE.PointLight('#ff9a4a',6,7,1.5);light.position.y=.6;r.add(light);r.userData={flames,light};return r;}
export function swingSet(){const r=new THREE.Group();for(const x of [-1.5,1.5])for(const z of [-.6,.6]){const p=cylinder(r,.06,2.6,x,1.3,z*.5,'#c8423b',.06,8);p.rotation.x=z>0?-.22:.22;}cylinder(r,.06,3.2,0,2.5,0,'#c8423b',.06,8).rotation.z=Math.PI/2;
 const seats:THREE.Group[]=[];for(const x of [-.7,.7]){const s=new THREE.Group();s.position.set(x,2.5,0);r.add(s);for(const dx of [-.2,.2])cylinder(s,.012,1.8,dx,-.9,0,'#c9ccd2',.012,4);box(s,.5,.05,.25,0,-1.8,0,'#3d7cc0');seats.push(s);}r.userData.seats=seats;return r;}
export function slide(){const r=new THREE.Group();box(r,1,1.8,1,0,.9,0,'#e8b93c');const s=box(r,.8,.06,3,0,.95,1.9,'#3d9be0');s.rotation.x=.55;for(let i=0;i<5;i++)box(r,.8,.05,.2,0,.3+i*.32,-.6,'#c8423b');return r;}
export function watchtower(){const r=new THREE.Group();for(const x of [-1,1])for(const z of [-1,1]){const l=cylinder(r,.1,5.6,x*.9,2.8,z*.9,'#7b5332',.12,8);l.rotation.z=-x*.05;l.rotation.x=z*.05;}
 box(r,2.6,.15,2.6,0,5.6,0,'#9b6645',true);for(const [x,z,w,d] of [[0,1.25,2.6,.1],[0,-1.25,2.6,.1],[1.25,0,.1,2.6],[-1.25,0,.1,2.6]] as const)box(r,w,.9,d,x,6.1,z,'#9b6645',true);
 const roof=new THREE.Mesh(new THREE.ConeGeometry(2.2,1.2,4),mat('#5a4a5a'));roof.rotation.y=Math.PI/4;roof.position.y=7.9;roof.castShadow=true;r.add(roof);for(const x of [-1.1,1.1])for(const z of [-1.1,1.1])cylinder(r,.05,1.6,x,7,z,'#7b5332',.05,6);
 for(let i=0;i<6;i++)box(r,.06,.06,1.9,0,.8+i*.8,.95,'#7b5332').rotation.x=0;
 const head=new THREE.Group();head.position.set(0,6.9,0);r.add(head);cylinder(head,.25,.5,0,0,0,'#2e2a30',.25,14).rotation.x=Math.PI/2;const lens=new THREE.Mesh(new THREE.CircleGeometry(.22,16),glow(2.6,2.6,2.3));lens.position.z=.26;lens.layers.set(NOINK);head.add(lens);
 const beam=new THREE.Mesh(new THREE.ConeGeometry(2.4,22,24,1,true),new THREE.MeshBasicMaterial({color:'#f4f6ff',transparent:true,opacity:.1,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));beam.geometry.translate(0,-11,0);beam.rotation.x=-Math.PI/2;beam.layers.set(NOINK);head.add(beam);
 const sl=new THREE.SpotLight('#f4f6ff',40,30,.18,.5,1.2);sl.position.set(0,0,0);const tg=new THREE.Object3D();tg.position.set(0,0,10);head.add(sl,tg);sl.target=tg;r.userData={head};return r;}
export function washingLine(len=4){const r=new THREE.Group();for(const x of [-len/2,len/2])cylinder(r,.04,2,x,1,0,'#7b5332',.04,6);cylinder(r,.01,len,0,1.9,0,'#d9dbe0',.01,4).rotation.z=Math.PI/2;
 const cloths:THREE.Mesh[]=[];['#e2564b','#f4efe0','#3d7cc0','#e8b93c','#5fae6a'].forEach((c,i)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(.5,.6),new THREE.MeshLambertMaterial({color:c,side:THREE.DoubleSide}));m.geometry.translate(0,-.3,0);m.position.set(-len/2+.5+i*(len-1)/4,1.88,0);r.add(m);cloths.push(m);});r.userData.cloths=cloths;return r;}
export function bikeRack(n=4){const r=new THREE.Group();box(r,n*.6,.06,.06,0,.5,0,'#8d92a0');for(let i=0;i<n;i++){const x=-n*.3+.3+i*.6;for(const z of [-.45,.45]){const t=new THREE.Mesh(new THREE.TorusGeometry(.3,.025,6,20),mat('#26262c'));t.rotation.y=Math.PI/2;t.position.set(x,.32,z);r.add(t);}box(r,.03,.03,.9,x,.6,0,['#c8423b','#3d7cc0','#5fae6a','#e8b93c'][i%4]);}return r;}
export { place };
