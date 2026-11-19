// Six locations for "Where to hide": siren street, mall front, living room, supermarket roof, harbour, the compound.
// Each builder returns its root plus the animated parts its scenes drive. All motion is frame-deterministic.
import * as THREE from 'three';
import { box,place,cylinder,ball,mat,glow,trashCan,dumpster,streetLamp,paintedBuilding,cable,trashBag,cardboardBox,litter,tree,hedge,bench,acUnit,pottedPlant,mailbox,car,wetReflection,halo,puff,crate,barredWindow } from './props';
import { schoolBus,tent,campfire,swingSet,slide,watchtower,washingLine,bikeRack,mall,policeCar,siren as sirenFx,signpost,sofa,tvSet,floorLamp,calendarPad,wallClockZ,ladder,skylight,hvac,supermarket,waterPlane,pier,boat,buoy,jerrycan,fuelGauge,waterJug,chainFence,steelGate,concreteBuilding,generator,floodlight,sandbags,gearCrate,signBoard,crack } from './zprops';
import { brick,cobbleHD,grassHD,planksHD,ctex,rep,stoneHD,waterNear } from './engine/paint';
import { twoTone,TONE,CHAR } from './engine/shade';
import { setInteriorLight,WINDOW_LIGHT } from './engine/lighting';
import { NOINK } from './engine/ink';
import { realisticSky } from './sky';
import type { Palette } from './types';
import { addTick,dust,shaft,rain,moths,birds,leaves,embers,mist,sparkles } from './atmosphere';
import { tireStack,riceSack,canStack,lantern } from './world3';

type Pal={lit:number[];shade:number[];tint:number[];key:string;sky:string;fog:string;sun:[number,number,number];sunI:number;hemiI:number;window:number;night:boolean;fogNear:number;fogFar:number};
export const PALETTES:Record<Palette,Pal>={
 siren:{lit:[1.16,.92,.92],shade:[.3,.24,.42],tint:[1,.93,.95],key:'#ffb08a',sky:'#6a4a78',fog:'#3a2440',sun:[-12,4,6],sunI:1.7,hemiI:.5,window:0,night:false,fogNear:16,fogFar:46},
 lamp:{lit:[1.2,1.04,.86],shade:[.32,.28,.42],tint:[1.02,.96,.9],key:'#ffd0a0',sky:'#3a3a6a',fog:'#1a1830',sun:[-6,6,8],sunI:1.1,hemiI:.45,window:.55,night:true,fogNear:14,fogFar:40},
 overcast:{lit:[1.18,1.16,1.1],shade:[.52,.56,.68],tint:[.98,.98,.98],key:'#f1f0ea',sky:'#c9d2da',fog:'#c3ccd4',sun:[-8,14,6],sunI:1.9,hemiI:.9,window:0,night:false,fogNear:40,fogFar:150},
 rain:{lit:[.86,.9,1],shade:[.36,.4,.54],tint:[.9,.92,.98],key:'#c9d4e6',sky:'#7d8a9e',fog:'#6e7a8c',sun:[-8,14,6],sunI:1.1,hemiI:.8,window:0,night:false,fogNear:24,fogFar:100},
 sun:{lit:[1.42,1.26,1],shade:[.56,.52,.7],tint:[1.03,.98,.9],key:'#fff0c8',sky:'#bfe0f5',fog:'#d8ecf6',sun:[6,16,8],sunI:3.2,hemiI:.8,window:0,night:false,fogNear:50,fogFar:170},
 moon:{lit:[.82,.88,1.16],shade:[.2,.22,.46],tint:[.9,.93,1.06],key:'#c8d4ff',sky:'#1c2850',fog:'#0c1430',sun:[-3.6,3.9,-28.5],sunI:2.3,hemiI:.55,window:0,night:true,fogNear:40,fogFar:150},
 storm:{lit:[.7,.8,.8],shade:[.2,.26,.3],tint:[.86,.92,.9],key:'#a8c8c0',sky:'#3a4a48',fog:'#1e2826',sun:[-5,9,-30],sunI:1.1,hemiI:.5,window:0,night:true,fogNear:14,fogFar:60},
 flood:{lit:[1.12,1.12,1.16],shade:[.24,.24,.42],tint:[.98,.98,1.02],key:'#eef2ff',sky:'#2c3460',fog:'#141a33',sun:[3,14,10],sunI:2.2,hemiI:.42,window:0,night:true,fogNear:16,fogFar:52},
 lampnight:{lit:[1.1,.92,.78],shade:[.16,.14,.26],tint:[1.02,.94,.86],key:'#ffc98a',sky:'#20203a',fog:'#0c0b16',sun:[-6,4,-8],sunI:.32,hemiI:.16,window:0,night:true,fogNear:14,fogFar:40},
 day:{lit:[1.36,1.24,1.02],shade:[.54,.52,.68],tint:[1.02,.99,.93],key:'#fff0cc',sky:'#a8d0f0',fog:'#cfe4f2',sun:[8,14,10],sunI:2.9,hemiI:.85,window:0,night:false,fogNear:45,fogFar:160},
 golden:{lit:[1.36,1.1,.84],shade:[.46,.36,.5],tint:[1.05,.96,.86],key:'#ffc77e',sky:'#d9a07a',fog:'#e8b890',sun:[-12,5,8],sunI:2.6,hemiI:.6,window:0,night:false,fogNear:30,fogFar:120},
 dusk:{lit:[1.2,.96,.84],shade:[.3,.24,.42],tint:[1.02,.94,.9],key:'#ffb88a',sky:'#6a5a8a',fog:'#4a3a5a',sun:[-12,3,6],sunI:1.6,hemiI:.45,window:0,night:false,fogNear:20,fogFar:70},
 dawn:{lit:[1.18,1.06,1],shade:[.42,.42,.6],tint:[1,.97,.96],key:'#ffd8b8',sky:'#c8b8d0',fog:'#d8c8d0',sun:[10,5,6],sunI:1.6,hemiI:.7,window:.7,night:false,fogNear:20,fogFar:80},
 dark:{lit:[.5,.54,.8],shade:[.12,.12,.28],tint:[.8,.82,.98],key:'#7f8cd8',sky:'#1a1f40',fog:'#0a0c1c',sun:[-6,8,-6],sunI:.7,hemiI:.25,window:0,night:true,fogNear:8,fogFar:30},
};
export function setLight(palette:Palette){const p=PALETTES[palette];setInteriorLight(p.night,p.window);if(p.window===0)WINDOW_LIGHT.uWindowStrength.value=0;
 TONE.uLitCol.value.set(p.lit[0],p.lit[1],p.lit[2]);TONE.uShadeCol.value.set(p.shade[0],p.shade[1],p.shade[2]);TONE.uShadeLift.value.set(.035,.035,.045);TONE.uLambert.value=.22;TONE.uSideK.value=.9;TONE.uTerm.value=.25;TONE.uBounce.value.set(.02,.015,0);TONE.uSat.value=1.02;
 CHAR.uCharTint.value.set(p.tint[0],p.tint[1],p.tint[2]);CHAR.uCharShade.value=.9;CHAR.uGrad.value=.045;CHAR.uBodyGrad.value=.13;CHAR.uSideTint.value.set(.94,.94,.98);
}
function ground(root:THREE.Object3D,tex:THREE.Texture,size:number,repeat:number,color='#ffffff',y=0){const m=new THREE.Mesh(new THREE.PlaneGeometry(size,size),twoTone(new THREE.MeshLambertMaterial({color,map:rep(tex,repeat,repeat)})));m.rotation.x=-Math.PI/2;m.position.y=y;m.receiveShadow=true;root.add(m);return m;}
const asphalt=()=>ctex('asphalt',1024,1024,(g,r)=>{g.fillStyle='#5a5c66';g.fillRect(0,0,1024,1024);for(let i=0;i<9000;i++){const v=70+r()*50;g.fillStyle=`rgba(${v},${v},${v+8},.5)`;g.fillRect(r()*1024,r()*1024,2+r()*3,2+r()*3);}
 g.strokeStyle='rgba(30,30,36,.5)';g.lineWidth=3;for(let i=0;i<10;i++){g.beginPath();let x=r()*1024,y=r()*1024;g.moveTo(x,y);for(let k=0;k<5;k++){x+=(r()-.5)*120;y+=(r()-.5)*120;g.lineTo(x,y);}g.stroke();}});
function road(root:THREE.Object3D,len:number,w:number,x:number,z:number,yaw=0){const m=new THREE.Mesh(new THREE.PlaneGeometry(len,w),twoTone(new THREE.MeshLambertMaterial({map:rep(asphalt(),len/6,w/6),color:'#d8d6e0'})));m.rotation.x=-Math.PI/2;m.rotation.z=yaw;m.position.set(x,.006,z);m.receiveShadow=true;root.add(m);
 for(let i=-len/2+1;i<len/2;i+=3){const d=box(root,1.4,.01,.14,0,.012,0,'#f2e7b0');d.castShadow=false;const c=Math.cos(yaw),s=Math.sin(yaw);d.position.set(x+i*c,.012,z-i*s);d.rotation.y=yaw;}return m;}
/** Smoke column: puffs rising and spreading, looping. */
function smoke(root:THREE.Object3D,at:[number,number,number],n=8,color='#5a5060',height=7){const ps=Array.from({length:n},()=>puff(root,color,.4));
 addTick(root,f=>ps.forEach((p,i)=>{const t=((f/150)+i/n)%1;p.position.set(at[0]+Math.sin(t*4+i)*.5+t*1.6,at[1]+t*height,at[2]+Math.cos(t*3+i)*.3);p.scale.setScalar(1+t*4);(p.material as THREE.SpriteMaterial).opacity=.45*Math.sin(Math.PI*t);}));return ps;}
function fire(root:THREE.Object3D,at:[number,number,number],size=1){const flames=Array.from({length:6},(_,i)=>puff(root,i%2?'#ffb347':'#ff6a2a',.8,true));const light=new THREE.PointLight('#ff8a3a',8*size,10*size,1.4);light.position.set(at[0],at[1]+.8,at[2]);root.add(light);
 addTick(root,f=>{flames.forEach((p,i)=>{const t=((f/24)+i/6)%1;p.position.set(at[0]+Math.sin(i*2.1+f*.2)*.25*size,at[1]+t*1.4*size,at[2]+Math.cos(i*1.7)*.2*size);p.scale.setScalar(size*(1.1-t*.7));(p.material as THREE.SpriteMaterial).opacity=.85*(1-t);});light.intensity=size*(7+2*Math.sin(f*.7)+Math.sin(f*1.9));});
 embers(root,at,10);return light;}
/** Flying papers tumbling across a street. */
function papers(root:THREE.Object3D,n:number,area:{x0:number;x1:number;z:number}){const ps=Array.from({length:n},(_,i)=>{const m=box(root,.3,.01,.22,0,0,0,i%2?'#efe8d6':'#d9e2ea');m.castShadow=false;return m;});
 addTick(root,f=>ps.forEach((p,i)=>{const t=((f/(110+i*13))+i/n)%1;p.position.set(area.x0+(area.x1-area.x0)*t,.05+Math.abs(Math.sin(t*9+i))*.5,area.z+Math.sin(i*3.7)*1.5);p.rotation.set(t*9+i,t*5,t*7);}));}
/** Dense city: rings of painted buildings at several depths, roof clutter (water towers, antennas, billboards), skyline silhouettes with lit windows. */
function city(root:THREE.Object3D,o:{seed:number;rings:{z:number;x0:number;x1:number;hMin:number;hMax:number;d?:number;yaw?:number}[];skyline?:{z:number;w:number};night?:boolean}){
 let s=o.seed*7919+3;const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647;};
 const walls=['#c98f6e','#e6c9a0','#9fb3c9','#d8b0b8','#c9d6a8','#b8a6c9','#e8d6b8','#a9c4c0','#d9a58a','#b9c2cf'],shut=['#4d6b5a','#5c7d9e','#b8674e','#3d6f9e','#8a4a5a','#6a5a8a'];
 for(const r of o.rings){let x=r.x0;while(x<r.x1){const w=5+rnd()*5,h=r.hMin+rnd()*(r.hMax-r.hMin),d=r.d??6;
  const b=place(root,paintedBuilding(w,h,d,{key:`city${o.seed}_${Math.round(x)}_${r.z}`,wall:walls[Math.floor(rnd()*walls.length)],shutter:shut[Math.floor(rnd()*shut.length)],door:true,roof:rnd()>.6?'#5a4a5a':undefined}),x+w/2,0,r.z+(rnd()-.5)*2,r.yaw??0);
  const roofY=h+.22,k=rnd();
  if(k<.25){const t=new THREE.Group();t.position.set((rnd()-.5)*w*.5,roofY,0);b.add(t);for(const [lx,lz] of [[-.5,-.5],[.5,-.5],[-.5,.5],[.5,.5]])cylinder(t,.05,1.4,lx,.7,lz,'#5a4636',.05,6);cylinder(t,.75,1.5,0,2.1,0,'#9b6645',.75,16);const cap=new THREE.Mesh(new THREE.ConeGeometry(.8,.5,16),mat('#6b4630'));cap.position.y=3.1;t.add(cap);}
  else if(k<.45){cylinder(b,.04,3,(rnd()-.5)*w*.6,roofY+1.5,0,'#3b3f4a',.04,6);const dsh=new THREE.Mesh(new THREE.SphereGeometry(.45,12,8,0,Math.PI*2,0,Math.PI/2),mat('#d9dbe0'));dsh.rotation.x=-1;dsh.position.set(w*.2,roofY+.5,0);b.add(dsh);}
  else if(k<.6){const bb=new THREE.Group();bb.position.set(0,roofY,0);b.add(bb);for(const lx of [-1.2,1.2])box(bb,.08,1.2,.08,lx,.6,0,'#3b3f4a');signBoard(bb,['COLA','PIZZA','HOTEL','RADIO 9','CINEMA'][Math.floor(rnd()*5)],3,1,[0,1.7,.06],{bg:['#c8423b','#e8b93c','#3d7cc0','#2f8f5a'][Math.floor(rnd()*4)],ink:'#ffffff'});box(bb,3.1,1.1,.08,0,1.7,0,'#2e2a30');}
  else if(k<.8){box(b,1.2,.8,1,(rnd()-.5)*w*.4,roofY+.4,(rnd()-.5)*d*.4,'#c9ccd6');box(b,.6,.6,.6,(rnd()-.5)*w*.4,roofY+.3,(rnd()-.5)*d*.4,'#9aa0a8');}
  if(o.night)for(let i=0;i<4;i++){if(rnd()<.4)continue;const g=new THREE.Mesh(new THREE.PlaneGeometry(.8,1.1),new THREE.MeshBasicMaterial({color:new THREE.Color(1.6,1.2,.6)}));g.position.set((rnd()-.5)*w*.7,1.5+rnd()*(h-2.5),d/2+.03);g.layers.set(NOINK);b.add(g);}
  x+=w+.4+rnd()*1.6;}}
 if(o.skyline){const sk=o.skyline;let x=-sk.w/2;while(x<sk.w/2){const w=6+rnd()*10,h=18+rnd()*34;const m=box(root,w,h,6,x+w/2,h/2,sk.z+(rnd()-.5)*8,o.night?'#2a3050':'#aab6c8');m.castShadow=false;
   if(rnd()<.3){cylinder(root,.15,6,x+w/2,h+3,sk.z,'#5d6270',.15,6);}
   for(let i=0;i<8;i++){const g=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.8),new THREE.MeshBasicMaterial({color:o.night?new THREE.Color(1.5,1.2,.6):new THREE.Color('#d9e6f2')}));g.position.set(x+1+rnd()*(w-2),3+rnd()*(h-5),m.position.z+3.05);g.layers.set(NOINK);root.add(g);}
   x+=w+1+rnd()*3;}}
}
function storefronts(root:THREE.Object3D,z:number,x0:number,specs:[number,number,string,string,string][]){let x=x0;for(const [w,h,wall,sh,key] of specs){place(root,paintedBuilding(w,h,4,{key,wall,shutter:sh,door:true,roof:'#5a4a5a'}),x+w/2,0,z);x+=w+.2;}}

/** L1 · Siren street at dusk: abandoned police car, burning car down the road, papers, smoke, a signpost. Host's mark (0,0,0). */
export function street(){
 const root=new THREE.Group();root.name='street';
 ground(root,cobbleHD(),70,14,'#a99aa6');road(root,60,7,0,-4.2);
 storefronts(root,-11,-17,[[6,8,'#c98f6e','#4d6b5a','sA'],[5,9.5,'#e6c9a0','#5c7d9e','sB'],[6,7.5,'#9fb3c9','#b8674e','sC'],[5.5,10,'#d8b0b8','#3d6f9e','sD'],[6,8.2,'#c9d6a8','#8a4a5a','sE']]);
 // Near sidewalk dressing.
 const lampA=place(root,streetLamp(4.2),-4.2,0,.9);const lampB=place(root,streetLamp(4.2),5.5,0,.9,Math.PI);
 place(root,trashCan(),-2.9,0,1.4);const tipped=place(root,trashCan(),2.4,0,1.6);tipped.rotation.z=Math.PI/2;tipped.position.y=.33;
 for(const [x,z,s] of [[2.9,1.9,.8],[-3.3,2.2,.9],[3.6,1.2,.6]] as const)place(root,trashBag('#23222a',x*5),x,0,z).scale.setScalar(s);
 place(root,cardboardBox(.7,.5,.55,true),-5.4,0,1.8,.4);place(root,mailbox(),-5.2,1.1,-9.1);place(root,dumpster(),9,0,-8.5,.2);place(root,bench(),-7.8,0,1.2);
 const cop=place(root,policeCar(),4.4,0,-3.4,-.55);
 const wreck=place(root,car('#6a7a8a'),-6.5,0,-6.2,.35);wreck.rotation.z=.04;fire(root,[-6.6,1,-6.2],1);smoke(root,[-6.6,1.6,-6.2],9,'#3a3040',9);smoke(root,[11,6,-14],7,'#4a3a48',10);
 for(const [a,b,sag] of [[[-14,7,-9],[14,7.4,-9.4],1],[[-14,6.2,-9.5],[14,6.6,-9.2],.8]] as const)cable(root,a as any,b as any,sag);
 const post=place(root,signpost(['MALL','HOME','ROOF','BOAT','???'],['#c8423b','#e8a33c','#d4b42a','#3d7cc0','#5d5470']),-1.9,0,-1.2,.25);
 litter(root,{x0:-8,x1:8,z0:-8,z1:3},40,[[-1.5,1.5,-1,1.2]]);papers(root,4,{x0:-9,x1:9,z:-2});
 wetReflection(root,4.4,-1.2,'#ff4a3a',.8,3,.3);wetReflection(root,3.8,-1.2,'#4a7aff',.8,3,.3);
 const sky=realisticSky(root,'dusk');
 dust(root,{center:[0,1.6,-1],size:[8,3,6],count:50,color:'#ffcfa8',scale:.035});mist(root,{center:[0,.4,-8],size:[20,.6,8],count:10,color:'#8a6a7a',opacity:.12});
 birds(root,{y:14,z:-24,from:-20,to:20,count:5,speed:.025,color:'#2a2030'});
 addTick(root,f=>{for(const l of [lampA,lampB]){const k=(f%61<3||f%97<2)&&l===lampB?.25:1;(l.userData.light as THREE.PointLight).intensity=6*k;((l.userData.bulb as THREE.Mesh).material as THREE.MeshBasicMaterial).color.setRGB(2.2*k,1.7*k,.9*k);}});
 return {root,cop,post,sky,siren:(f:number,k=1)=>sirenFx(cop,f,k)};
}

/** L2 · Mall plaza: long glass front (doors along z=-6), plaza, planters, a crash barrier, police car. */
export function mallFront(){
 const root=new THREE.Group();root.name='mall';
 ground(root,stoneHD('plaza',['#d9cfc0','#cfc4b4','#e2d8c9','#c8bcab'],'#a89c8c'),80,20,'#d8ccd0');road(root,70,7,0,9,0);
 const m=place(root,mall(14),0,0,-6);
 for(const x of [-12,12]){place(root,tree(4),x,0,-2);box(root,2,.6,2,x,.3,-2,'#b8a998');}
 for(let i=0;i<5;i++)place(root,pottedPlant(),-8+i*4,0,-3.4);
 for(const x of [-9,-3,3,9])place(root,bench(),x,0,-.6,Math.PI);
 const cop=place(root,policeCar(),-9.5,0,5,.8);
 place(root,streetLamp(5),-14,0,2);place(root,streetLamp(5),14,0,2,Math.PI);
 // Sale banners hanging from the canopy.
 for(const x of [-7.5,0,7.5])signBoard(root,'BIG SALE',2.2,.6,[x,3.8,-4.6],{bg:'#e8b93c',ink:'#c8423b'});
 const crackA=crack();crackA.position.set(m.doorX[7],1.5,-5.92);crackA.scale.setScalar(.001);root.add(crackA);
 for(const [x,z,s] of [[5,1.6,.8],[-6,2.2,.7],[11,1,.9]] as const)place(root,trashBag('#23222a',x*3),x,0,z).scale.setScalar(s);
 litter(root,{x0:-14,x1:14,z0:-4,z1:6},50);
 const sky=realisticSky(root,'dusk');smoke(root,[18,6,-20],8,'#3a3040',12);
 dust(root,{center:[0,2,-3],size:[14,3,4],count:40,color:'#ffe2b0',scale:.03});
 birds(root,{y:16,z:-24,from:-25,to:25,count:6,speed:.02,color:'#2a2030'});
 const pulse=new THREE.PointLight('#ff2a2a',0,30,1.2);pulse.position.set(0,4,4);root.add(pulse);
 addTick(root,f=>{m.bulbs.forEach((b,i)=>{const on=((i+Math.floor(f/5))%3)!==0;(b.material as THREE.MeshBasicMaterial).color.setRGB(on?2.2:.5,on?1.7:.4,on?.8:.2);});
  const tv=m.tv.material as THREE.MeshBasicMaterial,k=.85+.25*Math.sin(f*.9)*Math.sin(f*.31);tv.color.setRGB(k,k,k*1.08);});
 return {root,mall:m,cop,crack:crackA,pulse,sky,siren:(f:number,k=1)=>sirenFx(cop,f,k)};
}

/** L3 · Living room at night: big front window (back wall z=-3), yard + neighbour's house outside, sofa, lamp, TV light from camera side. */
export function livingRoom(){
 const root=new THREE.Group();root.name='house';
 const floor=ground(root,planksHD(),16,5,'#e2b98c');
 const wallMat=twoTone(new THREE.MeshLambertMaterial({color:'#d9a58a'}));
 const W=(w:number,h:number,x:number,y:number,z:number,ry=0)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,.2),wallMat);m.position.set(x,y,z);m.rotation.y=ry;m.receiveShadow=true;root.add(m);return m;};
 // Back wall with window opening x∈[-1.4,1.4], y∈[.9,2.7].
 W(3.6,4,-3.2,2,-3);W(3.6,4,3.2,2,-3);W(2.8,.9,0,.45,-3);W(2.8,1.3,0,3.35,-3);W(8,4,-4.9,2,1,Math.PI/2);
 box(root,8,.15,.25,0,.07,-2.86,'#f4efe0');
 // Window frame, sill and glass with reflections.
 for(const x of [-1.42,0,1.42])box(root,.1,1.9,.16,x,1.8,-2.92,'#f4efe0');for(const y of [.86,1.8,2.74])box(root,2.94,.1,.16,0,y,-2.92,'#f4efe0');box(root,3.1,.08,.36,0,.84,-2.8,'#f4efe0');
 const glassTex=ctex('houseGlass',256,256,(g)=>{g.clearRect(0,0,256,256);g.fillStyle='rgba(200,225,255,.1)';g.fillRect(0,0,256,256);g.fillStyle='rgba(255,255,255,.18)';for(const [x,w] of [[40,26],[90,10],[170,30]]){g.save();g.translate(x,0);g.transform(1,0,-.5,1,0,0);g.fillRect(0,0,w,256);g.restore();}});
 const glass=new THREE.Mesh(new THREE.PlaneGeometry(2.8,1.8),new THREE.MeshBasicMaterial({map:glassTex,transparent:true,depthWrite:false,fog:false}));glass.position.set(0,1.8,-2.95);glass.layers.set(NOINK);glass.renderOrder=6;root.add(glass);
 // Curtains each side of the window (sway).
 const curtains=[-1.75,1.75].map(x=>{const c=new THREE.Group();c.position.set(x,2.9,-2.75);root.add(c);for(let i=0;i<4;i++)cylinder(c,.11,2.4,(i-1.5)*.17,-1.2,(i%2)*.06,i%2?'#4f7a9a':'#5d8aa8',.13,10);return c;});
 box(root,4.4,.05,.05,0,2.95,-2.75,'#c1a269');
 // Room dressing.
 const couch=place(root,sofa('#c46a3a'),0,0,-1.6);
 const lampL=place(root,floorLamp(),-2.3,0,-2.2);place(root,pottedPlant(),2.6,0,-2.3);
 const rugM=new THREE.Mesh(new THREE.PlaneGeometry(4,2.4),new THREE.MeshLambertMaterial({color:'#7b2f4a'}));rugM.rotation.x=-Math.PI/2;rugM.position.set(0,.01,-.2);rugM.receiveShadow=true;root.add(rugM);
 const rugIn=new THREE.Mesh(new THREE.PlaneGeometry(3.6,2),new THREE.MeshLambertMaterial({color:'#c99a3e'}));rugIn.rotation.x=-Math.PI/2;rugIn.position.set(0,.012,-.2);root.add(rugIn);
 box(root,1.2,.4,.6,0,.2,-.2,'#6b4630',true);const mug=cylinder(root,.07,.14,.25,.47,-.2,'#f4efe0',.06,12);mug.castShadow=true;
 const cal=place(root,calendarPad(),2.3,2.45,-2.88);const clock=place(root,wallClockZ(),-3.1,2.75,-2.88);
 for(const [x,y,c] of [[2.05,1.55,'#3d7cc0'],[2.75,1.6,'#e8b93c']] as const){box(root,.42,.52,.04,x,y,-2.88,'#2e2a30');box(root,.34,.44,.05,x,y,-2.87,c);}
 box(root,1.6,1.1,.4,-3.9,.55,-2.6,'#9b6645',true);place(root,cardboardBox(.5,.3,.4),-3.8,1.1,-2.6,.2);
 // Outside: lawn, picket fence, the neighbour's house, a streetlamp lighting the yard.
 const out=new THREE.Group();root.add(out);ground(out,grassHD(),40,8,'#4d6a5a',-.02).position.z=-20;
 for(let i=0;i<14;i++)box(out,.12,.9,.06,-6.5+i,.45,-7.5,'#e8e2d6');box(out,14,.08,.06,0,.75,-7.5,'#e8e2d6');
 place(out,paintedBuilding(7,5.5,5,{key:'nbHouse',wall:'#6a6a8c',shutter:'#3a3a5a',door:true,roof:'#3a3448'}),2,0,-14);
 const yardLamp=place(out,streetLamp(3.8),-2.6,0,-8.6);place(out,hedge(3),-5,0,-8.2);place(out,tree(4.2,'#3e6b5a'),6,0,-10);
 const moonSky=realisticSky(out,'night');
 // TV off-screen in front of the sofa: cool flickering light from the camera side.
 const tv=place(root,tvSet(),0,0,6.2,Math.PI);tv.visible=false;(tv.userData.light as THREE.PointLight).intensity=0;
 // Single source: the floor lamp. Warm pool on the floor, a soft cone under the shade, dust drifting through its light.
 const lampLight=lampL.userData.light as THREE.PointLight;lampLight.intensity=14;lampLight.distance=8;lampLight.decay=1.6;lampLight.castShadow=true;lampLight.shadow.mapSize.set(1024,1024);lampLight.shadow.bias=-.002;
 shaft(root,{from:[-2.3,1.55,-2.2],to:[-1.6,0,-1.3],r0:.3,r1:1.6,color:'#ffcf8a',opacity:.16});
 const pool=new THREE.Mesh(new THREE.CircleGeometry(1.8,40),new THREE.MeshBasicMaterial({color:'#ffcc88',transparent:true,opacity:.16,blending:THREE.AdditiveBlending,depthWrite:false}));pool.rotation.x=-Math.PI/2;pool.position.set(-1.7,.02,-1.5);pool.layers.set(NOINK);root.add(pool);
 dust(root,{center:[-1.9,1.5,-1.7],size:[1.8,2.2,1.6],count:70,color:'#ffe2ad',scale:.03});dust(root,{center:[-.6,1.4,-1.2],size:[2.4,1.8,1.6],count:30,color:'#ffd9a0',scale:.025,opacity:.5,seed:9});
 moths(out,[-2,3.4,-8.6],4);
 addTick(root,f=>{curtains.forEach((c,i)=>{c.rotation.z=.02*Math.sin(f*.05+i*2);});lampLight.intensity=14*(1+.02*Math.sin(f*.13));});
 return {root,couch,lamp:lampL,calendar:cal,clock,tv,glass,yard:out,yardLamp,sky:moonSky};
}

/** L4 · Supermarket roof (y=5): skylight, HVAC, parapet, ladder at the front edge; the horde gathers below on the car park. */
export function rooftop(){
 const root=new THREE.Group();root.name='rooftop';
 ground(root,asphalt(),120,20,'#c8c6d0');for(let i=-6;i<=6;i++){const l=box(root,.1,.01,4,i*2.6,.01,12,'#f2f0e6');l.castShadow=false;}
 const shop=place(root,supermarket(16,12,5),0,0,0);
 const sky1=place(root,skylight(),-2.5,5,-1.5);place(root,skylight(),2.5,5,-1.5);
 const fans=[place(root,hvac(),-5,5,-3.5),place(root,hvac(),5.2,5,-3.8)];
 place(root,crate(),4,5,2.6);place(root,crate(),4.4,5.62,2.7).scale.setScalar(.75);cylinder(root,.25,1.2,-6.2,5.6,3.4,'#5d6270',.25,14);
 box(root,1.2,.9,1.2,-6,5.45,-5,'#9aa0a8');signBoard(root,'EXIT',.6,.22,[-6,5.6,-4.38],{bg:'#2f8f5a',ink:'#ffffff'});
 // Ladder: foot on the car park in front, leaning onto the parapet; scenes lift it.
 const lad=ladder(5.6);const ladPivot=new THREE.Group();ladPivot.position.set(3.2,0,7.1);ladPivot.add(lad);lad.rotation.x=-.2;root.add(ladPivot);
 // Car park dressing: cars, trolleys, lamp posts; town beyond.
 for(const [x,z,c,yaw] of [[-8,11,'#3d7cc0',.2],[-3,13,'#e8b93c',-.1],[9,12,'#5fae6a',.3],[13,8,'#e2564b',1.4]] as const)place(root,car(c),x,0,z,yaw);
 for(const [x,z] of [[-12,9],[12,15]] as const)place(root,streetLamp(5),x,0,z);
 storefronts(root,-24,-26,[[7,9,'#c98f6e','#4d6b5a','rA'],[6,11,'#e6c9a0','#5c7d9e','rB'],[8,8,'#9fb3c9','#b8674e','rC'],[7,12,'#d8b0b8','#3d6f9e','rD'],[8,9,'#c9d6a8','#8a4a5a','rE'],[7,10,'#e6c9a0','#4d6b5a','rF']]);
 city(root,{seed:4,rings:[{z:-38,x0:-50,x1:50,hMin:12,hMax:24,d:8},{z:-56,x0:-70,x1:70,hMin:16,hMax:34,d:10},{z:26,x0:-40,x1:40,hMin:8,hMax:16,d:6,yaw:Math.PI},{z:0,x0:-60,x1:-24,hMin:8,hMax:18,d:8,yaw:Math.PI/2},{z:0,x0:24,x1:60,hMin:8,hMax:18,d:8,yaw:-Math.PI/2}],skyline:{z:-90,w:200}});
 road(root,90,7,0,-31);road(root,90,7,0,20);for(const [x,z,c,yaw] of [[-14,-31,'#c8423b',0],[6,-30,'#3d7cc0',Math.PI],[22,20,'#e8b93c',0],[-30,19.5,'#f4efe0',Math.PI]] as const)place(root,car(c),x,0,z,yaw);
 for(let i=0;i<10;i++){place(root,tree(4+(i%3)),-45+i*10,0,-34);place(root,streetLamp(5),-42+i*10,0,-34.5);}
 for(const x of [-20,20])place(root,tree(5),x,0,4);
 const daySky=realisticSky(root,'day');
 const rainFx=new THREE.Group();root.add(rainFx);rain(rainFx,{center:[0,7,4],size:[16,6,12],count:420,opacity:.55});
 const shimmer=new THREE.Group();root.add(shimmer);dust(shimmer,{center:[0,6.2,1],size:[12,2,8],count:60,color:'#fff4c8',scale:.05,opacity:.6});
 birds(root,{y:14,z:-20,from:-25,to:25,count:6,speed:.025});
 addTick(root,f=>fans.forEach((h,i)=>{(h.userData.fan as THREE.Object3D).rotation.y=f*(.35+i*.1);}));
 return {root,ladder:lad,ladPivot,rain:rainFx,shimmer,sky:daySky,skylight:sky1};
}

/** Procedural ripple normal map: layered small wavelets → many tiny facets that catch the moon as broken glints. */
const rippleNormal=(()=>{const N=512,c=document.createElement('canvas');c.width=c.height=N;const g=c.getContext('2d')!,img=g.createImageData(N,N),h=new Float32Array(N*N);
 let s=11;const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647;};const waves=Array.from({length:22},()=>{const a=rnd()*Math.PI*2,k=(2+Math.floor(rnd()*14))*Math.PI*2/N;return {kx:Math.round(Math.cos(a)*k*N/(Math.PI*2))*Math.PI*2/N,ky:Math.round(Math.sin(a)*k*N/(Math.PI*2))*Math.PI*2/N,ph:rnd()*7,amp:1/(1+k*40)};});
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){let v=0;for(const w of waves)v+=w.amp*Math.sin(w.kx*x+w.ky*y+w.ph);h[y*N+x]=v;}
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){const dx=h[y*N+(x+1)%N]-h[y*N+(x+N-1)%N],dy=h[((y+1)%N)*N+x]-h[((y+N-1)%N)*N+x],k=9,nx=-dx*k,ny=-dy*k,l=Math.hypot(nx,ny,1),i=(y*N+x)*4;
  img.data[i]=(nx/l*.5+.5)*255;img.data[i+1]=(ny/l*.5+.5)*255;img.data[i+2]=(1/l*.5+.5)*255;img.data[i+3]=255;}
 g.putImageData(img,0,0);const tex=new THREE.CanvasTexture(c);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;return tex;})();
/** Night sea: gentle swell on a subdivided mesh + rippled, highly specular surface; setAmp scales the swell (storm). */
function sea(root:THREE.Object3D,size=240,seg=160){
 const geo=new THREE.PlaneGeometry(size,size,seg,seg);geo.rotateX(-Math.PI/2);const pos=geo.attributes.position as THREE.BufferAttribute,base=Float32Array.from(pos.array as Float32Array);
 const n1=rippleNormal.clone(),n2=rippleNormal.clone();for(const n of [n1,n2]){n.wrapS=n.wrapT=THREE.RepeatWrapping;n.needsUpdate=true;}n1.repeat.set(size/7,size/7);n2.repeat.set(size/3.1,size/3.1);
 const mat1=new THREE.MeshPhongMaterial({color:'#0a1a2b',specular:new THREE.Color('#e6eeff'),shininess:420,normalMap:n1,normalScale:new THREE.Vector2(.2,.2)});
 const m=new THREE.Mesh(geo,mat1);m.receiveShadow=true;m.position.z=-70;root.add(m);
 // Second, finer ripple layer as a thin additive sheen so the glints shimmer instead of sliding.
 const sheen=new THREE.Mesh(geo,new THREE.MeshPhongMaterial({color:'#000000',specular:new THREE.Color('#9fb6e8'),shininess:520,normalMap:n2,normalScale:new THREE.Vector2(.26,.26),transparent:true,opacity:.22,blending:THREE.AdditiveBlending,depthWrite:false}));sheen.position.copy(m.position);sheen.position.y=.01;root.add(sheen);
 let amp=1;const set=(f:number)=>{for(let i=0;i<pos.count;i++){const x=base[i*3],z=base[i*3+2]-70,d=Math.min(1,Math.hypot(x,z+10)/18);
   pos.setY(i,(.12*Math.sin(x*.3+f*.06)+.09*Math.sin(z*.37-f*.08+x*.1)+.04*Math.sin((x+z)*.8+f*.13))*amp*(.35+.65*d));}
  pos.needsUpdate=true;geo.computeVertexNormals();n1.offset.set(f*.0011,f*.0007);n2.offset.set(-f*.0016,f*.0012);};
 addTick(root,set);return {mesh:m,setAmp:(k:number)=>{amp=k;}};
}
const moonTex=ctex('bigMoon2',1024,1024,(g,r)=>{const C=512,R=500;const gr=g.createRadialGradient(C-90,C-110,60,C,C,R);gr.addColorStop(0,'#f4f3ec');gr.addColorStop(.7,'#dedcd2');gr.addColorStop(1,'#aeb0a8');g.fillStyle=gr;g.beginPath();g.arc(C,C,R,0,7);g.fill();
 g.save();g.beginPath();g.arc(C,C,R,0,7);g.clip();
 for(const [x,y,w,hh,a] of [[380,360,190,130,.4],[640,560,160,120,-.3],[470,700,120,80,.2]])
  {g.fillStyle='rgba(150,152,146,.28)';g.beginPath();g.ellipse(x,y,w,hh,a,0,7);g.fill();}
 for(let i=0;i<110;i++){const ang=r()*Math.PI*2,dist=Math.sqrt(r())*R*.94,x=C+Math.cos(ang)*dist,y=C+Math.sin(ang)*dist,edge=dist/R,rad=(6+r()*r()*46)*(1-edge*.45),sq=1-edge*edge*.55;
  g.save();g.translate(x,y);g.rotate(ang);g.scale(sq,1);
  g.fillStyle='rgba(120,122,118,.55)';g.beginPath();g.arc(0,0,rad,0,7);g.fill();
  g.fillStyle='rgba(255,255,250,.45)';g.beginPath();g.arc(rad*.12,rad*.12,rad*.82,Math.PI*-.15,Math.PI*.85);g.arc(0,0,rad*.62,Math.PI*.85,Math.PI*-.15,true);g.fill();
  g.restore();}
 const limb=g.createRadialGradient(C-60,C-80,R*.55,C,C,R);limb.addColorStop(0,'rgba(0,0,0,0)');limb.addColorStop(1,'rgba(40,44,60,.45)');g.fillStyle=limb;g.fillRect(0,0,1024,1024);g.restore();});
/** Huge low moon with layered halos and a glittering reflection path on the water toward the camera. */
function bigMoon(root:THREE.Object3D,at:[number,number,number],radius=10){
 const g=new THREE.Group();root.add(g);
 const disc=new THREE.Mesh(new THREE.CircleGeometry(radius,96),new THREE.MeshBasicMaterial({map:moonTex,color:new THREE.Color(1.12,1.12,1.1),fog:false,transparent:true}));disc.position.set(...at);disc.layers.set(NOINK);g.add(disc);
 for(const [s,o] of [[2.6,.22],[5,.1],[9,.05]] as const)halo(g,at,'#cfdcff',radius*s,o);
 const pathTex=ctex('moonPath',128,512,(c)=>{const v=c.createLinearGradient(0,0,0,512);v.addColorStop(0,'rgba(255,255,255,.95)');v.addColorStop(.5,'rgba(255,255,255,.45)');v.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=v;c.fillRect(0,0,128,512);c.globalCompositeOperation='destination-in';const h=c.createLinearGradient(0,0,128,0);h.addColorStop(0,'rgba(0,0,0,0)');h.addColorStop(.5,'rgba(0,0,0,1)');h.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=h;c.fillRect(0,0,128,512);});
 const len=Math.abs(at[2])-4,path=new THREE.Mesh(new THREE.PlaneGeometry(radius*1.1,len),new THREE.MeshBasicMaterial({map:pathTex,color:'#dfe8ff',transparent:true,opacity:.42,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
 path.rotation.x=-Math.PI/2;path.position.set(at[0]*.55,.35,at[2]/2-2);path.rotation.z=Math.atan2(at[0]*.45,len);path.layers.set(NOINK);path.renderOrder=4;(path.material as THREE.MeshBasicMaterial).opacity=.12;g.add(path);
 // Glitter: twinkling sparks scattered along the path.
 const sparks:THREE.Sprite[]=[];for(let i=0;i<40;i++){const t=Math.abs(Math.sin(i*12.9898)*43758.5453%1),z=at[2]*t*.95-3,x=at[0]*(z/at[2])*.55+Math.sin(i*7.1)*.5*radius*(.25+.75*t);
  sparks.push(halo(g,[x,.45,z],'#ffffff',.25+t*.7,0));}
 addTick(g,f=>sparks.forEach((s,i)=>{const v=Math.max(0,Math.sin(f*.3+i*2.3)*Math.sin(f*.11+i));(s.material as THREE.SpriteMaterial).opacity=.75*v*v;}));
 return {group:g,disc,path};
}
/** Lighthouse on a rocky headland: striped tower, gallery with rails, glowing lantern room, red dome, keeper's cottage, rotating beam. */
function lighthouse(root:THREE.Object3D,x:number,z:number){
 const lh=new THREE.Group();lh.position.set(x,0,z);root.add(lh);
 for(let i=0;i<14;i++){const a=i/14*Math.PI*2,r=4+Math.sin(i*3.3)*1.2;ball(lh,1.4+Math.abs(Math.sin(i*1.7))*1.2,Math.cos(a)*r,.3,Math.sin(a)*r,i%2?'#4a4652':'#5a5560',1,.7,1);}
 box(lh,9,1.4,8,0,.7,0,'#57525e');
 cylinder(lh,1.25,10,0,6.4,0,'#f4efe0',1.6,24);for(const y of [3.2,5.6,8,10.4])cylinder(lh,1.28+(11-y)*.035,1,0,y,0,'#c8423b',1.32+(11-y)*.035,24);
 for(const y of [4.4,6.8,9.2])box(lh,.4,.6,.1,0,y,1.42-(y-4)*.03,'#2e2a30');box(lh,.7,1.3,.1,0,2.1,1.62,'#3b3f4a');
 cylinder(lh,1.9,.25,0,11.5,0,'#2e2a30',1.9,24);const rail=new THREE.Mesh(new THREE.TorusGeometry(1.85,.04,6,40),mat('#2e2a30'));rail.rotation.x=Math.PI/2;rail.position.y=12.3;lh.add(rail);
 for(let i=0;i<16;i++){const a=i/16*Math.PI*2;cylinder(lh,.03,.8,Math.cos(a)*1.85,11.95,Math.sin(a)*1.85,'#2e2a30',.03,6);}
 const lantern=new THREE.Mesh(new THREE.CylinderGeometry(1,1,1.6,16),new THREE.MeshBasicMaterial({color:new THREE.Color(3,2.7,1.6)}));lantern.position.y=12.5;lantern.layers.set(NOINK);lh.add(lantern);
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2;cylinder(lh,.04,1.6,Math.cos(a),12.5,Math.sin(a),'#2e2a30',.04,6);}
 const dome=new THREE.Mesh(new THREE.ConeGeometry(1.3,1.2,24),mat('#c8423b'));dome.position.y=13.9;dome.castShadow=true;lh.add(dome);ball(lh,.18,0,14.6,0,'#2e2a30');
 const cot=new THREE.Group();cot.position.set(3.4,1.4,1.5);lh.add(cot);box(cot,3.2,2,2.4,0,1,0,'#efe6d3');const rf=new THREE.Mesh(new THREE.ConeGeometry(2.4,1.3,4),mat('#5a4a5a'));rf.rotation.y=Math.PI/4;rf.scale.set(1,1,.8);rf.position.y=2.65;cot.add(rf);
 const win=new THREE.Mesh(new THREE.PlaneGeometry(.6,.6),new THREE.MeshBasicMaterial({color:new THREE.Color(1.6,1.2,.6)}));win.position.set(-.6,1.1,1.21);win.layers.set(NOINK);cot.add(win);
 const beamPivot=new THREE.Group();beamPivot.position.y=12.5;lh.add(beamPivot);
 for(const dir of [1,-1]){const beam=new THREE.Mesh(new THREE.ConeGeometry(3.2,34,32,1,true),new THREE.MeshBasicMaterial({color:'#fff3c4',transparent:true,opacity:.16,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));beam.geometry.translate(0,-17,0);beam.rotation.z=dir*Math.PI/2;beam.layers.set(NOINK);beamPivot.add(beam);}
 halo(lh,[0,12.5,0],'#fff2c0',8,.5);const l=new THREE.PointLight('#fff0c0',8,16,1.6);l.position.y=12.5;lh.add(l);
 addTick(lh,f=>{beamPivot.rotation.y=f*.035;});return lh;
}

/** L5 · Harbour at night: shore + pier (deck y=1.1) on the right, boat anchored out on the left; big moon low over the sea. */
export function harbour(){
 const root=new THREE.Group();root.name='harbour';
 const water=sea(root);
 const shore=new THREE.Mesh(new THREE.BoxGeometry(80,1,40),twoTone(new THREE.MeshLambertMaterial({map:rep(stoneHD('quay',['#9a9488','#8f897d','#a6a094','#88837a'],'#6f6a62'),16,8)})));shore.position.set(0,.5,22);shore.receiveShadow=true;root.add(shore);
 const p=place(root,pier(14,3),6,0,2);
 for(const [x,z,s] of [[4,4,.8],[9,5,.9]] as const)place(root,crate(),x,1,z).scale.setScalar(s);
 const b=place(root,boat(),-6,0,-12,.35);
 const buoys=[place(root,buoy(),2.2,0,-4.5),place(root,buoy('#e8b93c'),-10,0,-4),place(root,buoy(),3,0,-14)];
 storefronts(root,8,-30,[[7,7,'#7d6a8a','#3d4a6a','hA'],[6,9,'#5d6a8a','#6a3d4a','hB'],[8,6.5,'#8a7a6a','#3d5a6a','hC'],[6,8,'#6a7d8a','#4a3d5a','hD']]);
 lighthouse(root,-24,-46);
 const moon=bigMoon(root,[-12,13,-95],11);
 for(const lp of [place(root,streetLamp(4),11,1,3.5),place(root,streetLamp(4),8.4,1,-8,Math.PI)]){const l=lp.userData.light as THREE.PointLight;l.intensity=2.5;l.distance=5;}
 const night=realisticSky(root,'night');
 const stormFx=new THREE.Group();root.add(stormFx);rain(stormFx,{center:[-4,6,-8],size:[22,8,18],count:500,opacity:.6});stormFx.visible=false;
 const clouds=new THREE.Group();root.add(clouds);for(let i=0;i<14;i++){const c=puff(clouds,'#2a3436',0);c.position.set(-40+i*6,14+Math.sin(i)*3,-70+Math.cos(i*2)*10);c.scale.set(22,10,1);}
 const bolt=new THREE.PointLight('#dfe8ff',0,160,.5);bolt.position.set(-20,30,-30);root.add(bolt);
 birds(root,{y:9,z:-18,from:-18,to:14,count:4,speed:.03,color:'#e8e8f0'});
 mist(root,{center:[-6,.6,-20],size:[40,.8,30],count:12,color:'#6f88a6',opacity:.1,scale:5});
 addTick(root,f=>{buoys.forEach((q,i)=>{q.position.y=.1*Math.sin(f*.08+i*2);q.rotation.z=.1*Math.sin(f*.06+i);const on=((f+i*20)%60)<30;((q.userData.lamp as THREE.Mesh).material as THREE.MeshBasicMaterial).color.setRGB(on?2.6:.4,on?2.1:.3,on?.9:.2);});});
 /** Storm 0..1: bigger swell, rain, a cloud bank swallowing the moon. */
 const setStorm=(k:number)=>{water.setAmp(1+3*k);stormFx.visible=k>0;clouds.children.forEach(c=>((c as THREE.Sprite).material as THREE.SpriteMaterial).opacity=.95*k);(moon.disc.material as THREE.MeshBasicMaterial).opacity=1-.75*k;(moon.path.material as THREE.MeshBasicMaterial).opacity=.12*(1-k);};
 return {root,boat:b,water,storm:stormFx,setStorm,bolt,sky:night,pierRoot:p,moon};
}

/** L6 · The compound: fence + single steel gate along z=0 (gate at x=0); police station left, school right, yard inside (z<0). */
export function compound(o:{sky?:'day'|'night'|'dusk'|'dawn'}={}){
 const root=new THREE.Group();root.name='compound';
 ground(root,stoneHD('yard',['#c9c4ba','#bfbaaf','#d2cdc3','#b8b3a8'],'#9e998e'),90,22,'#b8b4c0');road(root,70,8,0,7);
 const police=place(root,concreteBuilding(8,6,6,{wall:'#d7d3cb',trim:'#26304a',sign:'POLICE',signBg:'#26304a',signInk:'#ffffff',windows:5,rows:2,bars:true}),-5,0,-12);
 const school=place(root,concreteBuilding(9,7,7,{wall:'#e8d6b8',trim:'#c8423b',sign:'SCHOOL',signBg:'#c8423b',signInk:'#ffffff',windows:6,rows:2,bars:true,door:'#2f6b4f'}),5.5,0,-13.5);
 // Blue police lamp over the door; school clock.
 const blue=new THREE.Mesh(new THREE.BoxGeometry(.32,.32,.32),glow(.4,.8,2.6));blue.position.set(1.4,2.9,3.12);box(police,.08,.08,.3,1.4,2.7,3.05,'#2e2a30');blue.layers.set(NOINK);police.add(blue);const blueL=new THREE.PointLight('#5a8aff',3,8,1.5);blueL.position.set(0,2.9,3.9);police.add(blueL);
 const clockFace=cylinder(school,.5,.1,2.8,5.6,3.56,'#f4efe0');clockFace.rotation.x=Math.PI/2;
 // Perimeter: concrete wall segments, then the chain-link fence with ONE gate at x=0.
 for(const [x,len] of [[-11,16],[11,16]] as const){place(root,chainFence(len,2.8),x,0,0);box(root,len,.5,.5,x,.25,0,'#a8a49a');}
 const gate=place(root,steelGate(4.2,2.8),0,0,0);
 for(const x of [-19.5,19.5]){const w=box(root,.6,3.2,26,x,1.6,-12,'#bdb8ae');w.castShadow=false;}
 box(root,40,3.2,.6,0,1.6,-25,'#bdb8ae');
 // Yard: generator, sandbags, gear crate, kitchen block with steaming vent, flag pole, basketball hoop.
 const gen=place(root,generator(),4.2,0,-4.5,-.3);
 place(root,sandbags(7),-3.4,0,-1.6);place(root,sandbags(6),3.4,0,-1.6);
 const gear=place(root,gearCrate(),-5.4,0,-4.2,.5);
 const kitchen=place(root,concreteBuilding(5,3.6,4,{wall:'#d9cfc0',trim:'#5d6270',sign:'KITCHEN',signBg:'#f4efe0',signInk:'#c8423b',windows:2,rows:1}),-12.5,0,-5,Math.PI/2);
 const steam=[0,1,2,3].map(()=>puff(root,'#e8eef2',.4));
 cylinder(root,.06,7,-1.8,3.5,-7.5,'#d9dbe0',.06,8);const flag=new THREE.Mesh(new THREE.PlaneGeometry(1.6,1,8,1),new THREE.MeshLambertMaterial({color:'#3d7cc0',side:THREE.DoubleSide}));flag.position.set(-1,6.4,-7.5);flag.layers.set(NOINK);root.add(flag);
 cylinder(root,.08,3.2,13,1.6,-4,'#5d6270',.08,8);box(root,1.2,.8,.08,13,3.2,-3.8,'#f4efe0');
 for(let i=0;i<4;i++)place(root,barredWindow(),-12+i*2.2,1.8,-24.68);
 // ---- Detail pass: vehicles, camp, playground, watchtower, roof kit, trees and lamps ----
 const bus=place(root,schoolBus(),10.5,0,-5.6,-.25);
 const pcs=[place(root,policeCar(),-10.5,0,-5.5,.5),place(root,policeCar(),-13.5,0,-8.8,.9)];
 const tents=[place(root,tent('#3d6a9a'),-3.4,0,-7.6,.3),place(root,tent('#a8483f'),3.3,0,-8.0,-.3),place(root,tent('#4f7a52'),6.2,0,-7.4,-.6)];void tents;
 const fireC=place(root,campfire(),.6,0,-7.4);
 const line=place(root,washingLine(4),-5.6,0,-8.2,.3);
 const swing=place(root,swingSet(),14.6,0,-15.5,-.4);place(root,slide(),12,0,-18.5,-.3);
 const tower=place(root,watchtower(),-17,0,-1.8,.6);
 for(const [x,z] of [[-16,-21],[-11,-22],[16,-21],[11,-22.5],[-17.5,-14],[17.5,-12]] as const)place(root,tree(4.8,'#3e6b5a'),x,0,z);
 for(const [x,z] of [[-8,-6.5],[8,-7.2],[0,-12.5]] as const)place(root,streetLamp(4.2),x,0,z,x<0?0:Math.PI);
 for(const [x,z,yaw] of [[-2.8,-5.6,.2],[1.4,-9.2,-.1]] as const)place(root,bench(),x,0,z,yaw);
 detailCompound(root);
 place(root,bikeRack(4),7.6,0,-9.4,-.2);place(root,sandbags(9),-15.5,0,1.2,.6);
 for(const x of [10,13,16])box(root,.08,.012,6,x,.012,-4,'#f4efe0').castShadow=false;box(root,6,.012,.08,13,.012,-1,'#f4efe0').castShadow=false;
 // Roof kit: water tank + antenna on the police station, solar panels + dish on the school.
 {const t=new THREE.Group();t.position.set(-6.5,6.4,-12.6);root.add(t);for(const [lx,lz] of [[-.5,-.5],[.5,-.5],[-.5,.5],[.5,.5]])cylinder(t,.05,1.2,lx,.6,lz,'#5a4636',.05,6);cylinder(t,.8,1.4,0,1.9,0,'#8d92a0',.8,16);cylinder(root,.05,4,-3,8.4,-12.5,'#3b3f4a',.05,6);}
 for(let i=0;i<4;i++){const sp=box(root,1.6,.06,1,3.2+i*1.8,7.5,-14,'#26304a');sp.rotation.x=-.4;}
 {const dsh=new THREE.Mesh(new THREE.SphereGeometry(.6,14,8,0,Math.PI*2,0,Math.PI/2),mat('#d9dbe0'));dsh.rotation.x=-1.1;dsh.position.set(8.5,7.6,-12);root.add(dsh);}
 const floods=[place(root,floodlight(6.5),-7,0,-2),place(root,floodlight(6.5),7,0,-2)];floods.forEach(fl=>{fl.light.target.position.set(0,0,5);});
 const floodsIn=[place(root,floodlight(6.5),-14,0,-8,Math.PI*.75),place(root,floodlight(6.5),14,0,-8,-Math.PI*.75)];
 // Outside the fence: abandoned cars, a bus stop, the street beyond.
 place(root,car('#5d6a7a'),-9,0,8,.15);place(root,car('#8a5a4a'),11,0,10,-.3);place(root,trashCan(),-4,0,3.6);place(root,streetLamp(5),-15,0,4);place(root,streetLamp(5),15,0,4,Math.PI);
 storefronts(root,22,-30,[[8,7,'#7d6a8a','#3d4a6a','cA'],[7,9,'#5d6a8a','#6a3d4a','cB'],[8,6.5,'#8a7a6a','#3d5a6a','cC'],[7,8,'#6a7d8a','#4a3d5a','cD']]);
 const nightSky=realisticSky(root,o.sky??'night');
 const fog=new THREE.Group();root.add(fog);mist(fog,{center:[0,.5,2],size:[30,.8,14],count:14,color:'#8a9ab8',opacity:.14,scale:4});
 moths(root,[-7,6.4,-1.6],5);moths(root,[7,6.4,-1.6],4);sparkles(root,{center:[0,4,-10],size:[20,4,4],count:8,color:'#ffffff'});
 const underLight=new THREE.PointLight('#ff9a5a',0,6,1.4);root.add(underLight);
 addTick(root,f=>{pcs.forEach((pc,i)=>sirenFx(pc,f+i*7,.8));(tower.userData.head as THREE.Object3D).rotation.y=.9*Math.sin(f*.025);
  (swing.userData.seats as THREE.Object3D[]).forEach((s,i)=>{s.rotation.x=.35*Math.sin(f*.09+i*1.7);});
  (line.userData.cloths as THREE.Mesh[]).forEach((c,i)=>{c.rotation.x=.25*Math.sin(f*.11+i)+.1;});
  const fl=fireC.userData as {flames:THREE.Sprite[];light:THREE.PointLight};fl.flames.forEach((p,i)=>{const t=((f/22)+i/5)%1;p.position.set(Math.sin(i*2.1+f*.2)*.12,.2+t*.9,Math.cos(i*1.7)*.1);p.scale.setScalar(.8*(1.1-t*.7));(p.material as THREE.SpriteMaterial).opacity=.85*(1-t);});fl.light.intensity=6+1.5*Math.sin(f*.7);
  flag.rotation.y=.25*Math.sin(f*.07);
  steam.forEach((s,i)=>{const t=((f/80)+i/4)%1;s.position.set(-12.2+.2*Math.cos(t*4),3.8+t*2.2,-4+.2*Math.sin(t*5+i));s.scale.setScalar(.5+t*1.6);(s.material as THREE.SpriteMaterial).opacity=.35*Math.sin(Math.PI*t);});
  (gen.userData.steam as THREE.Sprite[]).forEach((s,i)=>{const t=((f/40)+i/3)%1;s.position.set(.7+.1*Math.sin(t*6),2+t*1.4,-.2);s.scale.setScalar(.25+t*.8);(s.material as THREE.SpriteMaterial).opacity=.3*Math.sin(Math.PI*t);});
  gen.position.y=.012*Math.sin(f*2.1);((gen.userData.lamp as THREE.Mesh).material as THREE.MeshBasicMaterial).color.setRGB(.3,f%30<20?2.4:.6,.5);});
 return {root,gate,gen,gear,floods,floodsIn,police,school,kitchen,sky:nightSky,fog,underLight,blueL,bus,fire:fireC,tower,pcs,line,flag};
}
/** Set floodlight power 0..1 (heads + spot lights). */
export function floodPower(list:ReturnType<typeof floodlight>[],k:number){list.forEach(fl=>{(fl.head.material as THREE.MeshBasicMaterial).color.setRGB(.25+2.4*k,.25+2.3*k,.25+2*k);fl.light.intensity=60*k;});}
export {fuelGauge,waterJug,jerrycan};

/** Lived-in survival camp: razor wire, drums, crates, tyres, cones, string lights, painted warnings. */
function detailCompound(root:THREE.Object3D){
 const wire=(x0:number,x1:number,y:number,z:number,alongZ=false)=>{const n=Math.round(Math.abs(x1-x0)/.32);for(let i=0;i<n;i++){const t=new THREE.Mesh(new THREE.TorusGeometry(.17,.012,4,14),mat('#9aa0a8'));const p=x0+(x1-x0)*(i+.5)/n;
  if(alongZ){t.position.set(z,y,p);t.rotation.y=Math.PI/2;}else t.position.set(p,y,z);t.rotation.z=i*.6;root.add(t);}};
 wire(-19,-2.3,2.95,0);wire(2.3,19,2.95,0);wire(-25,1,3.35,-19.5,true);wire(-25,1,3.35,19.5,true);
 const drum=(x:number,z:number,c:string)=>{cylinder(root,.3,.9,x,.45,z,c,.3,16);for(const y of [.2,.7])cylinder(root,.31,.035,x,y,z,'#2e2a30',.31,16);};
 drum(-6.6,-3.2,'#3d6a5a');drum(-6.0,-3.0,'#7a3a2a');drum(5.6,-3.2,'#3d4a6a');drum(9.2,-7.2,'#6a5a2a');drum(-9.4,-2.4,'#5a3a3a');
 for(const [x,z,r] of [[5.5,-4.2,.2],[-7.4,-6.8,-.3],[8.6,-8.4,.5]] as const){place(root,crate(),x,0,z,r);place(root,crate(),x+.05,.62,z,r+.4);}
 place(root,riceSack(),-7.0,0,-6.0,.3);place(root,canStack(6,'#c8423b'),6.2,0,-3.6);
 place(root,tireStack(3),-11.6,0,-2.2);place(root,tireStack(2),11.8,0,-2.6);
 for(const [x,z] of [[-1.4,1.2],[1.5,1.4],[-2.6,2.2]] as const){const c=new THREE.Mesh(new THREE.ConeGeometry(.16,.5,12),mat('#e8833a'));c.position.set(x,.25,z);c.castShadow=true;root.add(c);box(root,.36,.04,.36,x,.02,z,'#2e2a30');}
 // String lights between the lamp posts over the camp (warm bulbs, gentle sag).
 const bulbs:THREE.Mesh[]=[];const string=(a:[number,number,number],b:[number,number,number],n=9)=>{for(let i=0;i<=n;i++){const t=i/n,x=a[0]+(b[0]-a[0])*t,z=a[2]+(b[2]-a[2])*t,y=a[1]+(b[1]-a[1])*t-.6*Math.sin(Math.PI*t);
  const m=new THREE.Mesh(new THREE.SphereGeometry(.06,8,6),glow(2.4,1.6,.7));m.position.set(x,y,z);m.layers.set(NOINK);root.add(m);bulbs.push(m);}
  cable(root,a,b,.6,'#1d1824');};
 string([-8,4,-6.5],[0,4,-12.5]);string([0,4,-12.5],[8,4,-7.2]);string([-8,4,-6.5],[8,4,-7.2],14);
 place(root,lantern(),-2.6,.5,-5.6);
 // Painted warnings on the walls.
 for(const [t,x,y,z,ry] of [['NO ENTRY',-19.15,2,-6,Math.PI/2],['SURVIVORS INSIDE',19.15,2,-9,-Math.PI/2],['DAY 1 2 3 ...',-6,2.2,-24.65,0]] as const){const s2=signBoard(root,t,3.6,.7,[x,y,z],{bg:'#bdb8ae',ink:'#8a2f2f'});s2.rotation.y=ry;}
 addTick(root,f=>bulbs.forEach((b,i)=>{const k=.75+.25*Math.sin(f*.21+i*1.7)*(i%5===0?1.6:1);(b.material as THREE.MeshBasicMaterial).color.setRGB(2.4*k,1.6*k,.7*k);}));
}
