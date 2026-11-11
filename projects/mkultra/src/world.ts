import * as THREE from 'three';
import { box,label,place,calendar,wallClock,C,mat } from './props';
import { ctex, planksHD } from './engine/paint';
import { twoTone,TONE,CHAR } from './engine/shade';
import {setInteriorLight} from './engine/lighting';
import type { Palette } from './types';

export const PALETTES={
 warm:{wall:'#587c7c',floor:'#b98e63',lit:[1.3,1.17,.94],shade:[.46,.5,.57],tint:[1,.95,.88],key:'#ffe0ac',sky:'#a9c1cb',fog:'#748f91'},
 lab:{wall:'#93b1a4',floor:'#d7d5b9',lit:[1.23,1.26,1.16],shade:[.49,.58,.58],tint:[.96,1,.97],key:'#f6efd7',sky:'#c5d9d0',fog:'#9cb6ab'},
 night:{wall:'#3f5964',floor:'#8b735e',lit:[1.26,1.1,.86],shade:[.29,.38,.48],tint:[.91,.96,1],key:'#ffe0aa',sky:'#8faec3',fog:'#3c5966'},
 archive:{wall:'#819385',floor:'#a18c6b',lit:[1.29,1.2,1.02],shade:[.48,.53,.54],tint:[1,.97,.9],key:'#ffe3b5',sky:'#b6c7bb',fog:'#93a18c'},
} as const;
export function setLight(palette:Palette){const p=PALETTES[palette];setInteriorLight(palette==='night',palette==='lab'?.58:.85);TONE.uLitCol.value.set(...p.lit);TONE.uShadeCol.value.set(...p.shade);TONE.uShadeLift.value.set(.035,.035,.045);TONE.uLambert.value=.22;TONE.uSideK.value=.9;TONE.uTerm.value=.25;TONE.uBounce.value.set(.02,.015,0);TONE.uSat.value=.99;
 CHAR.uCharTint.value.set(...p.tint);CHAR.uCharShade.value=.92;CHAR.uGrad.value=.045;CHAR.uBodyGrad.value=.13;CHAR.uSideTint.value.set(.94,.94,.98);
}
export type RoomOptions={palette:Palette;tile?:boolean;window?:boolean;year?:string;clock?:boolean;label?:string;shelfX?:number};
export function room(o:RoomOptions){
 const root=new THREE.Group();const p=PALETTES[o.palette];root.name='room';
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(24,24),twoTone(new THREE.MeshLambertMaterial({color:p.floor,map:o.tile?tiles():woodFloor()})));
 floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;root.add(floor);
 // Architectural shells must not block the virtual opening; props still cast real shadows.
 box(root,12,4.5,.17,0,2.25,-3.5,p.wall).castShadow=false;
 box(root,.15,4.5,9,-5.6,2.25,.95,p.wall).castShadow=false;
 box(root,11.5,.08,.08,0,1.02,-3.37,'#d5c5a1');box(root,11.5,.14,.12,0,.08,-3.35,'#5d706a',true);
 box(root,11.5,.16,.12,0,4.1,-3.35,'#c4bea4',true);
 if(o.window){
  box(root,2.1,2.05,.055,-2.75,2.5,-3.37,'#a8bfc2');
  for(const x of [-3.86,-1.65])box(root,.11,2.25,.12,x,2.5,-3.28,C.cream);
  for(const y of [1.38,3.62])box(root,2.3,.1,.12,-2.75,y,-3.28,C.cream);
  for(let i=0;i<9;i++)box(root,2.08,.075,.12,-2.75,1.55+i*.23,-3.24,'#b5b19a');

 }
 if(o.year)place(root,calendar(o.year),.55,2.0,-3.32);
 if(o.clock)place(root,wallClock(),0,3.1,-3.28);
 if(o.label){box(root,2.4,.57,.08,0,3.2,-3.3,'#334c54');label(root,o.label,2.25,.4,[0,3.2,-3.25],{bg:'#334c54',ink:C.cream,size:115});}
 // Side window matches the world-space projector: light travels right, down and towards the back wall.
 const glass=new THREE.MeshBasicMaterial({color:o.palette==='night'?'#96b6d2':'#fff0c8'});
 const pane=new THREE.Mesh(new THREE.BoxGeometry(.025,3,6),glass);pane.position.set(-5.49,2.7,.8);root.add(pane);
 for(const z of [-2.2,-.2,1.8,3.8])box(root,.13,3.14,.065,-5.42,2.7,z,C.cream);
 for(const y of [1.2,1.95,2.7,3.45,4.2])box(root,.13,.065,6.14,-5.42,y,.8,C.cream);
 // Structural wall panels and a small set-specific shelf retain clear space around the cast.
 for(let x=-5;x<5.5;x+=1.3){box(root,.045,.82,.04,x,.54,-3.38,'#687e76');}
 const dressing=new THREE.Group();root.add(dressing);dressing.position.x=o.shelfX??(o.label?-2.6:0);
 for(const y of [1.85,2.55]){
  box(dressing,1.4,.07,.38,-1.05,y,-3.14,'#7e634c',true);
  for(const x of [-1.58,-.52])box(dressing,.05,.22,.22,x,y-.13,-3.21,C.brass);
  for(let i=0;i<5;i++){
   const h=.22+(i%3)*.065;
   box(dressing,.16,h,.22,-1.57+i*.25,y+.04+h/2,-3.12,[C.navy,C.cream,'#708c85',C.red,'#aa986b'][i]);
   box(dressing,.13,.025,.008,-1.57+i*.25,y+.1,-3.003,C.paper);
  }
 }
 return root;
}
function woodFloor(){const t=planksHD().clone();t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(7,7);t.needsUpdate=true;return t;}
function tiles(){const t=ctex('mkultra-tiles',512,512,(g)=>{g.fillStyle='#d6dcc3';g.fillRect(0,0,512,512);g.fillStyle='#6c9692';g.fillRect(0,0,256,256);g.fillRect(256,256,256,256);g.strokeStyle='#c3c9b4';g.lineWidth=3;for(const v of [0,256,512]){g.beginPath();g.moveTo(v,0);g.lineTo(v,512);g.stroke();g.beginPath();g.moveTo(0,v);g.lineTo(512,v);g.stroke();}}).clone();t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(8,8);t.needsUpdate=true;return t;}
