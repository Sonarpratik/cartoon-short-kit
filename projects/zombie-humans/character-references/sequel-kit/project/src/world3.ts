// Part 3 locations and props: storeroom, classroom dorm, raider camp, trucks with headlights, padlock, lantern, map table.
// Every builder returns its root plus the parts scenes animate. Motion is frame-deterministic (addTick / scene pose).
import * as THREE from 'three';
import { box,place,cylinder,ball,mat,glow,label,crate,puff,cardboardBox,streetLamp,tree,trashCan } from './props';
import { jerrycan,chainFence,sandbags } from './zprops';
import { planksHD,stoneHD,ctex,rep } from './engine/paint';
import { twoTone } from './engine/shade';
import { NOINK } from './engine/ink';
import { realisticSky } from './sky';
import { addTick,dust,shaft,embers,mist,moths,rain } from './atmosphere';

const lambert=(o:THREE.MeshLambertMaterialParameters)=>twoTone(new THREE.MeshLambertMaterial(o));
function floor(root:THREE.Object3D,tex:THREE.Texture,w:number,d:number,color='#ffffff',repeat=4){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),lambert({color,map:rep(tex,repeat,repeat*d/w)}));m.rotation.x=-Math.PI/2;m.receiveShadow=true;root.add(m);return m;}
function wall(root:THREE.Object3D,w:number,h:number,x:number,y:number,z:number,color:string,ry=0){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,.2),lambert({color}));m.position.set(x,y,z);m.rotation.y=ry;m.receiveShadow=true;root.add(m);return m;}
/** Hanging bulb with a warm point light and a visible glowing bulb. */
function bulb(root:THREE.Object3D,x:number,y:number,z:number,color='#ffc98a',intensity=10,dist=9){cylinder(root,.01,.8,x,y+.45,z,'#2e2a30',.01,4);const shade=new THREE.Mesh(new THREE.ConeGeometry(.28,.22,18,1,true),mat('#3f4a5a'));shade.position.set(x,y+.08,z);root.add(shade);
 const b=new THREE.Mesh(new THREE.SphereGeometry(.08,12,8),glow(2.6,2.1,1.3));b.position.set(x,y-.02,z);b.layers.set(NOINK);root.add(b);
 const L=new THREE.PointLight(color,intensity,dist,1.5);L.position.set(x,y-.1,z);L.castShadow=true;L.shadow.mapSize.set(1024,1024);L.shadow.bias=-.002;root.add(L);return {bulb:b,light:L,shade};}

// ---------- props ----------
export function riceSack(){const r=new THREE.Group();ball(r,.3,0,.3,0,'#efe6d0',1,1.05,.75);ball(r,.16,0,.62,0,'#e2d6ba',1,.6,1);label(r,'RICE',.32,.14,[0,.32,.23],{bg:'#efe6d0',ink:'#c8423b',size:110,font:'900'});return r;}
export function canStack(n=6,color='#c8423b'){const r=new THREE.Group();let i=0;for(let row=0;row<3&&i<n;row++)for(let k=0;k<3-row&&i<n;k++,i++){const x=(k-(2-row)/2)*.17,y=.07+row*.15;cylinder(r,.075,.14,x,y,0,'#c9ccd2',.075,14);const lb=cylinder(r,.077,.08,x,y,0,color,.077,14);lb.castShadow=false;}return r;}
export function waterBottle(){const r=new THREE.Group();const body=new THREE.Mesh(new THREE.CylinderGeometry(.16,.17,.5,18),new THREE.MeshLambertMaterial({color:'#8fd0f0',transparent:true,opacity:.75}));body.position.y=.25;r.add(body);cylinder(r,.06,.08,0,.54,0,'#3d7cc0',.06,10);box(r,.33,.12,.01,0,.25,.165,'#3d7cc0');return r;}
export function medKit(){const r=new THREE.Group();box(r,.6,.36,.3,0,.18,0,'#f4efe0');box(r,.36,.04,.06,0,.38,0,'#9aa0a8');box(r,.24,.08,.02,0,.2,.16,'#d8363a');box(r,.08,.24,.02,0,.2,.16,'#d8363a');return r;}
/** Metal shelving unit with supplies on three decks. `kind` picks the stock. */
export function shelf(kind:'rice'|'cans'|'water'|'meds'|'mixed',w=2){const r=new THREE.Group();
 for(const x of [-w/2,w/2])for(const z of [-.25,.25])box(r,.05,2.2,.05,x,1.1,z,'#7d8088');
 const decks=[.15,.85,1.55];for(const y of decks)box(r,w,.05,.56,0,y,0,'#9aa0a8');
 const put=(o:THREE.Object3D,x:number,y:number,s=1)=>{o.position.set(x,y+.03,0);o.scale.setScalar(s);r.add(o);};
 decks.forEach((y,d)=>{for(let i=0;i<Math.floor(w/.55);i++){const x=-w/2+.32+i*.55;const k=kind==='mixed'?(['rice','cans','water','meds'] as const)[(i+d)%4]:kind;
  if(k==='rice')put(riceSack(),x,y,.8);else if(k==='cans')put(canStack(6,['#c8423b','#e8b93c','#5fae6a','#3d7cc0'][(i+d)%4]),x,y,1);else if(k==='water')put(waterBottle(),x,y,.9);else put(medKit(),x,y,.75);}});
 return r;}
export function cot(blanket='#5d6a7a'){const r=new THREE.Group();for(const x of [-.9,.9])for(const z of [-.32,.32])box(r,.05,.38,.05,x,.19,z,'#5d6270');box(r,1.95,.08,.72,0,.4,0,'#7b8a6a');
 const bl=new THREE.Group();r.add(bl);box(bl,1.4,.07,.74,.25,.47,0,blanket);ball(r,.2,-.72,.5,0,'#f4efe0',1,.45,1.4);r.userData.blanket=bl;return r;}
export function chalkboard(lines:string[]){const r=new THREE.Group();box(r,3.2,1.6,.08,0,0,0,'#7b5332');
 const t=ctex('chalk'+lines.join('|'),1024,512,g=>{g.fillStyle='#2f4a3a';g.fillRect(0,0,1024,512);g.fillStyle='rgba(255,255,255,.06)';for(let i=0;i<40;i++)g.fillRect(Math.random()*1024,Math.random()*512,140,6);
  g.fillStyle='#f4f1e6';g.font='700 70px "Comic Sans MS", Arial';g.textAlign='left';lines.forEach((l,i)=>g.fillText(l,60,110+i*95));});
 const m=new THREE.Mesh(new THREE.PlaneGeometry(3,1.42),new THREE.MeshBasicMaterial({map:t}));m.position.z=.05;m.layers.set(NOINK);r.add(m);box(r,3,.06,.12,0,-.78,.06,'#9b6645');return r;}
/** Padlock + chain looped on a gate post; `shut` 0..1 snaps the shackle closed. */
export type Padlock=THREE.Group&{shackle:THREE.Mesh};
export function padlock():Padlock{const r=new THREE.Group() as Padlock;for(let i=0;i<7;i++){const l=new THREE.Mesh(new THREE.TorusGeometry(.07,.018,6,14),mat('#9aa0a8'));l.position.set(0,.5-i*.11,0);l.rotation.y=i%2?Math.PI/2:0;r.add(l);}
 box(r,.26,.24,.1,0,-.35,0,'#e8b93c');const sh=new THREE.Mesh(new THREE.TorusGeometry(.09,.025,8,18,Math.PI),mat('#c9ccd2'));sh.position.set(0,-.2,0);r.add(sh);r.shackle=sh;cylinder(r,.025,.02,0,-.38,.055,'#2e2a30',.025,8).rotation.x=Math.PI/2;return r;}
export function lantern(){const r=new THREE.Group();cylinder(r,.14,.06,0,.03,0,'#2e2a30',.14,12);const glass=new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,.26,12),glow(2.4,1.7,.8));glass.position.y=.19;glass.layers.set(NOINK);r.add(glass);
 cylinder(r,.12,.05,0,.34,0,'#2e2a30',.06,12);const ring=new THREE.Mesh(new THREE.TorusGeometry(.07,.012,6,14),mat('#2e2a30'));ring.position.y=.42;r.add(ring);
 const L=new THREE.PointLight('#ffb35a',7,7,1.4);L.position.y=.25;r.add(L);r.userData={light:L,glass};return r;}
/** Pickup truck facing +z with working headlights (beam cones + spot lights) and a rumble. */
export type Truck=THREE.Group&{beams:THREE.Mesh[];spots:THREE.SpotLight[];lamps:THREE.Mesh[];body:THREE.Group;power:(k:number)=>void};
export function truck(color='#5a3b2a'):Truck{const r=new THREE.Group() as Truck;const b=new THREE.Group();r.add(b);r.body=b;
 box(b,2.1,.7,4.6,0,.85,0,color);box(b,2,.9,1.7,0,1.65,.55,color);const ws=box(b,1.85,.62,.05,0,1.7,1.42,'#3a4a5a');ws.rotation.x=-.25;box(b,1.9,.55,.05,0,1.68,-.32,'#3a4a5a');
 box(b,2.15,.2,.12,0,.62,2.33,'#9aa0a8');box(b,1.2,.35,.06,0,.95,2.31,'#2e2f36');for(const x of [-.98,.98])box(b,.1,.5,2,x,1.3,-1.3,color);box(b,2.06,.5,.1,0,1.3,-2.28,color);
 // Roll bar + bull bar + spare tyre: reads as a raider rig, not a family car.
 for(const x of [-.9,.9])cylinder(b,.04,.8,x,1.75,-.6,'#26262c',.04,6);cylinder(b,.04,1.8,0,2.15,-.6,'#26262c',.04,6).rotation.z=Math.PI/2;
 for(const x of [-.6,.6])cylinder(b,.04,.6,x,.95,2.45,'#26262c',.04,6);const sp=new THREE.Mesh(new THREE.TorusGeometry(.32,.13,10,22),mat('#26262c'));sp.position.set(0,1.4,-1.6);sp.rotation.x=Math.PI/2;b.add(sp);
 for(const x of [-1,1])for(const z of [-1.5,1.5]){const w=new THREE.Mesh(new THREE.TorusGeometry(.32,.16,12,24),mat('#1d1c22'));w.position.set(x*1.02,.45,z);w.rotation.y=Math.PI/2;r.add(w);cylinder(r,.18,.2,x*1.1,.45,z,'#7d8088',.18,14).rotation.z=Math.PI/2;}
 r.lamps=[];r.spots=[];r.beams=[];
 for(const x of [-.72,.72]){const l=new THREE.Mesh(new THREE.CircleGeometry(.16,18),glow(3,2.9,2.5));l.position.set(x,1.0,2.34);l.layers.set(NOINK);b.add(l);r.lamps.push(l);
  const s=new THREE.SpotLight('#fff6dc',0,40,.38,.5,1.1);s.position.set(x,1.0,2.4);const t=new THREE.Object3D();t.position.set(x*1.5,0,14);b.add(s,t);s.target=t;r.spots.push(s);
  const cone=new THREE.Mesh(new THREE.ConeGeometry(2.2,16,28,1,true),new THREE.MeshBasicMaterial({color:'#fff3d0',transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
  cone.geometry.translate(0,-8,0);cone.rotation.x=-Math.PI/2-.04;cone.position.set(x,1.0,2.4);cone.layers.set(NOINK);b.add(cone);r.beams.push(cone);}
 r.power=k=>{r.lamps.forEach(l=>(l.material as THREE.MeshBasicMaterial).color.setRGB(.2+2.8*k,.2+2.7*k,.2+2.3*k));r.spots.forEach(s=>s.intensity=70*k);r.beams.forEach(c=>(c.material as THREE.MeshBasicMaterial).opacity=.13*k);};
 r.power(0);return r;}
export function mapTable(){const r=new THREE.Group();box(r,2.2,.08,1.3,0,.95,0,'#7b5332',true);for(const x of [-1,1])for(const z of [-.55,.55])box(r,.08,.95,.08,x,.47,z,'#5a3b2a');
 const t=ctex('raidMap',1024,640,g=>{g.fillStyle='#e8dcb8';g.fillRect(0,0,1024,640);g.strokeStyle='#b8a888';g.lineWidth=3;for(let i=0;i<12;i++){g.beginPath();g.moveTo(0,i*55);g.bezierCurveTo(300,i*55+40,700,i*55-40,1024,i*55+10);g.stroke();}
  g.fillStyle='#8a8a8a';g.fillRect(0,420,1024,60);g.fillStyle='#d9cfbf';g.strokeStyle='#2e2a30';g.lineWidth=6;g.strokeRect(380,120,320,240);g.fillStyle='#c8423b';g.fillRect(440,160,90,70);g.fillStyle='#26304a';g.fillRect(560,160,90,70);
  g.fillStyle='#2e2a30';g.font='900 46px Arial';g.fillText('SCHOOL',420,320);g.setLineDash([16,12]);g.strokeStyle='#c8423b';g.lineWidth=8;g.beginPath();g.moveTo(80,450);g.quadraticCurveTo(300,380,520,370);g.stroke();g.setLineDash([]);
  g.lineWidth=18;g.strokeStyle='#c8423b';g.beginPath();g.moveTo(480,180);g.lineTo(640,330);g.moveTo(640,180);g.lineTo(480,330);g.stroke();
  g.font='900 40px Arial';g.fillStyle='#c8423b';g.fillText('FOOD',720,170);g.fillText('WATER',720,230);g.fillText('GUNS',720,290);});
 const m=new THREE.Mesh(new THREE.PlaneGeometry(1.9,1.15),new THREE.MeshBasicMaterial({map:t}));m.rotation.x=-Math.PI/2;m.position.y=1.0;m.layers.set(NOINK);r.add(m);
 for(const [x,z,c] of [[-.6,.3,'#e8b93c'],[.5,-.2,'#3d7cc0'],[.2,.35,'#5fae6a']] as const){const p=ball(r,.04,x,1.08,z,c);cylinder(r,.008,.08,x,1.03,z,'#2e2a30',.008,4);void p;}
 return r;}
export function drumFire(){const r=new THREE.Group();cylinder(r,.36,1,0,.5,0,'#6a4a3a',.36,18);for(const y of [.25,.75])cylinder(r,.37,.04,0,y,0,'#4a3a30',.37,18);
 const flames=[0,1,2,3,4,5].map(i=>puff(r,i%2?'#ffb347':'#ff6a2a',.9,true));const L=new THREE.PointLight('#ff8a3a',12,10,1.4);L.position.y=1.5;r.add(L);
 addTick(r,f=>{flames.forEach((p,i)=>{const t=((f/18)+i/6)%1;p.position.set(Math.sin(i*2.1+f*.23)*.14,1.05+t*1.1,Math.cos(i*1.7+f*.1)*.1);p.scale.setScalar(.9*(1.1-t*.7));(p.material as THREE.SpriteMaterial).opacity=.9*(1-t);});L.intensity=11+2.5*Math.sin(f*.8)+1.2*Math.sin(f*2.3);});
 embers(r,[0,1.3,0],12);return r;}
export function tireStack(n=3){const r=new THREE.Group();for(let i=0;i<n;i++){const t=new THREE.Mesh(new THREE.TorusGeometry(.38,.15,10,22),mat('#1d1c22'));t.rotation.x=Math.PI/2;t.position.y=.15+i*.3;r.add(t);}return r;}

// ---------- L2 · Storeroom (school gym store) ----------
export function storeroom(){
 const root=new THREE.Group();root.name='store';
 floor(root,stoneHD('storeFloor',['#bfc4c8','#b6bbc0','#c8cdd0','#adb2b8'],'#8d9298'),12,10,'#c9ccd2',3);
 wall(root,12,4.4,0,2.2,-3.2,'#cfd8d4');wall(root,10,4.4,-5.2,2.2,1.6,'#c4ccc8',Math.PI/2);
 // Right wall with a doorway z∈[.4,1.7] (Rule 1), and a dim corridor beyond it.
 wall(root,3.8,4.4,5.2,2.2,-1.5,'#c4ccc8',Math.PI/2);wall(root,4.9,4.4,5.2,2.2,4.15,'#c4ccc8',Math.PI/2);wall(root,1.3,2,5.2,3.4,1.05,'#c4ccc8',Math.PI/2);
 const corridor=new THREE.Group();root.add(corridor);floor(corridor,stoneHD('corr',['#9aa0a8','#8d92a0','#a3a8b0','#888d96'],'#6d7078'),4,4,'#9aa0a8',1).position.set(7,0.002,1);wall(corridor,4,4,9,2,1,'#7d8a8a',Math.PI/2);
 const corrL=new THREE.PointLight('#bcd0ff',4,6,1.5);corrL.position.set(7.2,2.6,1);corridor.add(corrL);
 box(root,12,.5,.25,0,.25,-3.05,'#3f6e5a');
 // High window strip (light shaft source) and a painted stencil.
 const win=new THREE.Mesh(new THREE.PlaneGeometry(3,.7),new THREE.MeshBasicMaterial({color:new THREE.Color(1.6,1.5,1.2)}));win.position.set(-1.6,3.7,-3.08);win.layers.set(NOINK);root.add(win);for(let i=0;i<6;i++)box(root,.05,.7,.06,-3+i*.56,3.7,-3.05,'#3b3f4a');
 label(root,'STORE · KEEP LOCKED',3.2,.42,[2.4,3.6,-3.08],{bg:'#e8b93c',ink:'#1d1824',size:150,font:'900'});
 const shelves=[place(root,shelf('rice',2.2),-3.4,0,-2.7),place(root,shelf('cans',2.2),-1.1,0,-2.7),place(root,shelf('water',2.2),1.2,0,-2.7),place(root,shelf('meds',2.2),3.5,0,-2.7)];
 for(const [x,z,s] of [[-4.4,-1.2,.5],[4.5,-1.4,-.4],[-4.1,-.2,.2]] as const)place(root,crate(),x,0,z,s);place(root,jerrycan(),4.3,0,-.6,.3);place(root,cardboardBox(.6,.45,.5),-4.5,.62,-1.2,.1);
 place(root,canStack(6,'#e8b93c'),-3.7,0,-.6);place(root,riceSack(),3.8,0,-.3,-.4);
 // Door on the right wall (Rule 1 shuts it); swing about its hinge.
 const doorPivot=new THREE.Group();doorPivot.position.set(5.08,0,.4);root.add(doorPivot);box(doorPivot,.08,2.4,1.3,0,1.2,.65,'#3f6e5a');box(doorPivot,.1,.1,.18,-.05,1.15,1.15,'#c9ccd2');label(doorPivot,'STAFF',.5,.18,[-.06,1.8,.65],{bg:'#f4efe0',ink:'#1d1824',size:110});doorPivot.children.forEach(c=>{c.rotation.y=0;});
 const lampA=bulb(root,-1.6,3.1,-1.2),lampB=bulb(root,2.2,3.1,-1.2,'#ffd9a0',8);
 shaft(root,{from:[-1.6,3.7,-3],to:[-.6,0,-.2],r0:.6,r1:1.6,color:'#ffe9b8',opacity:.14});dust(root,{center:[-1,1.8,-1.4],size:[3.4,3,2],count:70,color:'#ffe2ad',scale:.03});
 addTick(root,f=>{lampA.shade.rotation.z=.03*Math.sin(f*.06);lampA.light.intensity=10*(1+.03*Math.sin(f*.17));});
 return {root,shelves,door:doorPivot,lamps:[lampA,lampB]};
}

// ---------- L3 · Classroom dorm ----------
export function classroom(o:{tally?:string;night?:boolean}={}){
 const root=new THREE.Group();root.name='classroom';
 floor(root,planksHD(),12,10,'#d8b48a',3);
 wall(root,12,4.2,0,2.1,-3.2,'#e8d6b8');wall(root,10,4.2,-5.2,2.1,1.6,'#dcc9a8',Math.PI/2);wall(root,10,4.2,5.2,2.1,1.6,'#dcc9a8',Math.PI/2);box(root,12,1,.24,0,.5,-3.06,'#c8423b');
 const board=place(root,chalkboard(['SAFE DAYS:',o.tally??'IIII IIII IIII IIII','RULES: LOCK GATE','WATCH @ NIGHT']),-1.2,2.3,-3.06);void board;
 // Window on the right with sky beyond (rain at night, dawn glow in the morning).
 const winGlass=new THREE.Mesh(new THREE.PlaneGeometry(2,1.5),new THREE.MeshBasicMaterial({color:o.night?new THREE.Color(.12,.16,.32):new THREE.Color(1.5,1.25,1)}));winGlass.position.set(3.4,2.3,-3.08);winGlass.layers.set(NOINK);root.add(winGlass);
 for(const x of [2.4,3.4,4.4])box(root,.08,1.6,.1,x,2.3,-3.04,'#f4efe0');for(const y of [1.55,2.3,3.05])box(root,2.1,.08,.1,3.4,y,-3.04,'#f4efe0');
 // Desks stacked aside, alphabet strip, clock, backpacks: it was a classroom three weeks ago.
 for(const [x,z] of [[-4.4,-2.2],[-4.4,-1.2]] as const){box(root,1.1,.06,.7,x,.75,z,'#c99a5a');for(const dx of [-.45,.45])box(root,.05,.75,.05,x+dx,.37,z,'#5d6270');box(root,1.1,.06,.7,x,1.35,z,'#c99a5a');}
 label(root,'A  B  C  D  E  F  G',5,.3,[-.4,3.9,-3.08],{bg:'#e8d6b8',ink:'#3d7cc0',size:150,font:'900'});
 const cots=[place(root,cot('#3d7cc0'),-2.2,0,-1.6,0),place(root,cot('#5fae6a'),2.4,0,-1.8,0),place(root,cot('#7b2f4a'),.1,0,-.3,0)];
 const lamp=place(root,lantern(),3.6,0,-.8);place(root,crate(),3.6,0,-.8-.0).position.y=-.62;lamp.position.y=.62;
 place(root,medKit(),-3.3,0,-.4,.4);place(root,waterBottle(),-3.8,0,-.5);place(root,cardboardBox(.5,.35,.4),4.3,0,-2.4,.2);
 dust(root,{center:[0,1.8,-1.2],size:[6,3,2],count:50,color:o.night?'#ffd9a0':'#fff1cf',scale:.028});
 if(o.night)rain(root,{center:[3.4,2.3,-3.6],size:[2.2,1.6,.4],count:60,color:'#9ab8e8',opacity:.5});
 else shaft(root,{from:[3.4,2.4,-3],to:[1.6,0,.2],r0:.9,r1:1.8,color:'#ffe0b0',opacity:.16});
 const L=lamp.userData.light as THREE.PointLight;
 addTick(root,f=>{L.intensity=(o.night?8:2)*(1+.06*Math.sin(f*.5)+.03*Math.sin(f*1.7));});
 return {root,cots,lamp};
}

// ---------- L5 · Raider camp (abandoned garage forecourt) ----------
export function raiderCamp(){
 const root=new THREE.Group();root.name='raiders';
 floor(root,stoneHD('raidYard',['#5a5660','#524e58','#605c66','#4a4650'],'#3a3640'),40,30,'#8a8494',6);
 // Garage shell with a corrugated roller door, a skull-painted sign.
 const g=new THREE.Group();g.position.set(0,0,-7);root.add(g);box(g,12,5,4,0,2.5,0,'#6a5a4a');
 for(let i=0;i<18;i++)box(g,.32,3.4,.06,-2.8+i*.33,1.7,2.03,i%2?'#7d8088':'#6d7078');
 label(g,'GARAGE',3.4,.8,[0,4.3,2.04],{bg:'#2e2a30',ink:'#e8833a',size:200,font:'900'});
 const t1=place(root,truck('#5a3b2a'),-4.6,0,-2.8,.5),t2=place(root,truck('#3d4a3a'),4.8,0,-3.4,-.55);
 const table=place(root,mapTable(),0,0,-1.2);const fire=place(root,drumFire(),-2.2,0,.4);place(root,drumFire(),3.1,0,-.2);
 place(root,tireStack(4),-6.8,0,-5);place(root,tireStack(3),6.9,0,-5.4);place(root,jerrycan(),-1.4,0,-3.4,.4);place(root,jerrycan(),-1,0,-3.6,-.2);place(root,crate(),1.8,0,-3.6,.3);
 const sky=realisticSky(root,'night');for(const [x,z] of [[-10,-12],[10,-13],[-14,-6]] as const)place(root,tree(5,'#2e4a42'),x,0,z);
 mist(root,{center:[0,.4,0],size:[18,.6,10],count:10,color:'#6a5a6a',opacity:.12,scale:4});
 return {root,trucks:[t1,t2],table,fire,sky};
}

/** Outside the gate looking in: the road, a broken streetlamp, wrecked cars. Reused by the knock and the raid. */
export function gateRoadDressing(root:THREE.Object3D){
 place(root,streetLamp(5),-6,0,9,0);place(root,trashCan(),5.2,0,5);place(root,sandbags(5),-4.2,0,1.4);
 return {};
}
export { chainFence };
