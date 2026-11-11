// Story-specific props. All dimensions are metres; base origin unless noted.
import * as THREE from 'three';
import { twoTone } from './engine/shade';
import { beamHD, planksHD, ctex } from './engine/paint';
import { NOINK } from './engine/ink';

export const C = { ink: '#292532', wood: '#9b6645', cream: '#ece1c4', teal: '#568f8e', navy: '#35485a', red: '#b55248', paper: '#f3e8c9', brass: '#c1a269' };
const materials = new Map<string, THREE.Material>();
export function mat(color: string, wood = false) {
  const key = color + wood;
  if (!materials.has(key)) materials.set(key, twoTone(new THREE.MeshLambertMaterial({ color, ...(wood ? {map: beamHD()} : {}) })));
  return materials.get(key)!;
}
export function box(root: THREE.Object3D, w: number, h: number, d: number, x: number, y: number, z: number, color = C.wood, wood = false) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, wood));
  m.position.set(x,y,z); m.castShadow = true; m.receiveShadow = true; root.add(m); return m;
}
export function cylinder(root: THREE.Object3D, r: number, h: number, x: number, y: number, z: number, color = C.cream, rBottom = r) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r,rBottom,h,32),mat(color));
  m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;root.add(m);return m;
}
export function label(root: THREE.Object3D, text: string, w: number, h: number, position: [number,number,number], options: {bg?:string;ink?:string;size?:number}={}) {
  const cv=document.createElement('canvas');cv.width=1024;cv.height=Math.max(128,Math.round(1024*h/w));
  const g=cv.getContext('2d')!;g.fillStyle=options.bg??C.paper;g.fillRect(0,0,cv.width,cv.height);
  g.fillStyle=options.ink??C.ink;g.textAlign='center';g.textBaseline='middle';
  const lines=text.split('\n');const px=options.size??Math.min(160,cv.height/(lines.length+1));
  g.font=`700 ${px}px Georgia, serif`;
  lines.forEach((line,i)=>g.fillText(line,512,cv.height*(i+1)/(lines.length+1),940));
  const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));
  mesh.position.set(...position);mesh.layers.set(NOINK);root.add(mesh);return mesh;
}
export function floorLabel(root: THREE.Object3D,text:string,w:number,h:number,x:number,y:number,z:number,bg=C.paper){
  const m=label(root,text,w,h,[x,y,z],{bg,size:100});m.rotation.x=-Math.PI/2;return m;
}
export function desk(w=3.3,d=1.25,h=.95){
  const r=new THREE.Group();box(r,w,.13,d,0,h,0,'#bb895e',true);
  box(r,w-.1,.34,.08,0,h-.21,d/2-.07,'#916044',true);
  for(const x of [-w/2+.22,w/2-.22])for(const z of [-d/2+.16,d/2-.16])box(r,.13,h-.06,.13,x,(h-.06)/2,z,'#6f4e3c',true);
  // Recessed drawers, brass pulls and low stretcher make this read as furniture.
  for(const x of [-w*.25,w*.25]){
   box(r,w*.44,.22,.035,x,h-.23,d/2-.015,'#ad7952',true);
   box(r,.23,.035,.055,x,h-.24,d/2+.02,C.brass);
  }
  box(r,w-.35,.07,.1,0,.23,-d/2+.16,C.wood,true);
  for(const x of [-w/2+.22,w/2-.22])box(r,.08,.07,d-.25,x,.23,0,C.wood,true);
  return r;
}
export function chair(){const r=new THREE.Group();box(r,.62,.11,.58,0,.61,0,'#ad7952',true);for(const x of [-.24,.24])for(const z of [-.22,.22])box(r,.07,.6,.07,x,.3,z,C.wood);for(const x of [-.24,.24])box(r,.07,.94,.07,x,1,-.25,C.wood);box(r,.58,.38,.075,0,1.28,-.25,'#779591');return r;}
export function folder(title='MKULTRA',color='#b99b6d'){
 const r=new THREE.Group();box(r,.9,.045,.67,0,.024,0,color);box(r,.23,.032,.1,-.23,.035,-.36,color);
 floorLabel(r,title,.67,.23,0,.049,.03,color);floorLabel(r,'RESTRICTED',.4,.08,0,.05,.22,color);
 for(let i=0;i<3;i++)box(r,.82,.006,.58,.015,.035+i*.006,-.01,C.paper);
 // Label is above the paper stack and remains readable from the camera.
 floorLabel(r,title,.67,.2,0,.061,-.03,color);
 return r;
}
export function paper(title='MEMORANDUM'){
 const r=new THREE.Group();box(r,.67,.012,.88,0,.007,0,C.paper);const p=floorLabel(r,title,.61,.12,0,.015,-.24);for(let i=0;i<7;i++)box(r,.48-(i%3)*.05,.002,.009,-.025,.016,-.08+i*.065,'#7b7b72');return r;
}
export function cup(){const r=new THREE.Group();cylinder(r,.16,.24,0,.14,0,'#eee6cb',.13);cylinder(r,.134,.008,0,.264,0,'#5b3d2d');cylinder(r,.25,.024,0,.014,0,'#d4d8c9');const handle=new THREE.Mesh(new THREE.TorusGeometry(.105,.027,8,24),mat('#eee6cb'));handle.position.set(.17,.15,0);r.add(handle);return r;}
export function bottle(text='LSD',color='#9c693b'){
 const r=new THREE.Group();cylinder(r,.12,.31,0,.17,0,color);cylinder(r,.073,.09,0,.37,0,color);cylinder(r,.079,.05,0,.43,0,C.navy);
 label(r,text,.2,.13,[0,.19,.123],{size:110});return r;
}
export function lamp(){const r=new THREE.Group();cylinder(r,.27,.055,0,.04,0,C.navy);const arm=cylinder(r,.025,.83,.08,.49,0,C.brass);arm.rotation.z=-.2;const head=new THREE.Mesh(new THREE.ConeGeometry(.32,.27,32,1,true),mat('#7d9b89'));head.rotation.z=.25;head.position.set(.13,1,0);r.add(head);const bulb=new THREE.Mesh(new THREE.SphereGeometry(.08,16,12),new THREE.MeshBasicMaterial({color:new THREE.Color(1.8,1.3,.7)}));bulb.position.set(.13,.91,0);bulb.layers.set(NOINK);r.add(bulb);return r;}
export function microphone(){const r=new THREE.Group();cylinder(r,.19,.045,0,.024,0,C.navy);const stem=cylinder(r,.023,.4,0,.24,0,C.brass);stem.rotation.z=-.14;const head=box(r,.15,.25,.1,.03,.52,0,C.navy);for(let i=0;i<5;i++)box(r,.11,.012,.01,.03,.445+i*.04,.058,'#a8b8b8');return r;}
export function recorder(){const r=new THREE.Group();box(r,.82,.18,.53,0,.1,0,C.navy);for(const x of [-.21,.21]){cylinder(r,.15,.025,x,.205,-.05,'#ced1b9');cylinder(r,.05,.028,x,.224,-.05,C.ink);for(let j=0;j<3;j++){const spoke=box(r,.21,.008,.018,x,.222,-.05,C.navy);spoke.rotation.y=j*Math.PI/3;}}for(let i=0;i<3;i++)box(r,.085,.035,.06,-.18+i*.12,.2,.16,i===0?C.red:C.cream);return r;}
export function calendar(year:string){const r=new THREE.Group();box(r,.85,1.05,.06,0,.53,0,C.cream);box(r,.88,.18,.08,0,.97,.02,C.red);label(r,year,.73,.35,[0,.69,.041],{size:170});label(r,'JANUARY',.72,.13,[0,.41,.041],{size:90});for(let row=0;row<3;row++)for(let col=0;col<5;col++)box(r,.035,.032,.008,-.23+col*.115,.28-row*.07,.037,'#687b7b');return r;}
export function cabinet(title='RECORDS'){
 const r=new THREE.Group();box(r,1.25,2.15,.76,0,1.075,0,'#64837d');for(let i=0;i<4;i++){const y=.3+i*.51;box(r,1.1,.45,.045,0,y,.4,'#91a59b');box(r,.32,.04,.055,0,y-.07,.45,C.brass);label(r,i===3?title:'ARCHIVE',.48,.12,[0,y+.065,.43],{size:92});}return r;
}
export function fileBox(title='FINANCE'){
 const r=new THREE.Group();box(r,1,.62,.85,0,.31,0,'#b8ac88');box(r,1.05,.06,.9,0,.62,0,'#d3c6a4');label(r,title,.73,.19,[0,.36,.432],{size:100});return r;
}
export function shelf(){const r=new THREE.Group();for(const x of [-1.85,1.85])box(r,.1,3.5,.85,x,1.75,0,'#536565');for(const y of [.1,1.12,2.14,3.16])box(r,3.85,.075,.92,0,y,0,'#8c745a',true);return r;}
export function shredder(){const r=new THREE.Group();box(r,1.08,1.08,.78,0,.54,0,C.navy);box(r,1.15,.16,.85,0,1.14,0,'#728789');box(r,.79,.015,.06,0,1.23,0,C.ink);for(let i=0;i<7;i++)box(r,.13,.015,.015,.38,.25+i*.065,.399,'#182b34');box(r,.07,.025,.045,.43,1.232,.2,'#8eba88');label(r,'RECORDS',.67,.16,[0,.86,.401],{bg:'#728789',size:100});box(r,.7,.58,.02,0,.39,.405,'#1d3440');for(let i=0;i<17;i++){const strip=box(r,.025,.24+((i*7)%9)*.02,.008,-.31+(i%9)*.074,.28+(i%3)*.09,.426,C.paper);strip.rotation.z=(i%5-2)*.17;}return r;}
export function wallClock(){const r=new THREE.Group();const face=cylinder(r,.32,.06,0,0,0,C.cream);face.rotation.x=Math.PI/2;const rim=new THREE.Mesh(new THREE.TorusGeometry(.33,.025,8,40),mat(C.wood));rim.position.z=.04;r.add(rim);box(r,.025,.23,.01,0,.09,.05,C.navy);const hand=box(r,.17,.025,.01,.075,0,.052,C.navy);hand.rotation.z=.25;return r;}
export function place<T extends THREE.Object3D>(root:THREE.Object3D,obj:T,x:number,y:number,z:number,yaw=0):T{obj.position.set(x,y,z);obj.rotation.y=yaw;root.add(obj);return obj;}
