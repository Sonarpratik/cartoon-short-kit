import {cameraJourney} from '../engine/director';
import * as THREE from 'three';
import {NOINK} from '../engine/ink';
import { room } from '../world';
import { shredder,folder,paper,place,box,C } from '../props';
import { ease,lerp,type SceneDefinition } from '../types';
export default {
 id:'S09',f0:948,f1:1034,title:'What is missing?',words:'So… what else do you think got shredded?',review:[948,996,1033],
 build(){const root=room({palette:'night'});place(root,shredder(),0,0,.5);for(let i=0;i<3;i++)place(root,folder('',i%2?'#96785a':'#747e70'),1.25,0.03+i*.06,-.15,i*.17);
  // Original fictional prop copy, printed on the side facing the camera.
  const input=new THREE.Group();box(input,.72,.014,1,0,.008,0,C.paper);
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=1400;
  const g=canvas.getContext('2d')!;g.fillStyle=C.paper;g.fillRect(0,0,1024,1400);
  g.strokeStyle='#777665';g.lineWidth=3;g.strokeRect(42,38,940,1320);
  g.textAlign='center';g.fillStyle='#33363a';g.font='bold 42px Arial';g.fillText('ARCHIVE COPY',512,114);
  g.font='bold 166px Arial';g.fillText('AREA 51',512,312);
  g.font='bold 53px Arial';g.fillText('SITE OPERATIONS',512,411);
  g.fillStyle='#86816c';g.fillRect(86,460,852,5);g.textAlign='left';g.fillStyle='#414440';
  g.font='bold 42px Arial';g.fillText('FACILITY REVIEW',90,568);g.font='38px Arial';
  ['Routine equipment inspections','Ground-test scheduling','Maintenance and logistics','Site access coordination','Filed for internal review'].forEach((line,i)=>g.fillText(line,90,662+i*105));
  g.font='bold 36px Arial';g.fillText('INTERNAL WORKING COPY',90,1288);
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=8;
  const print=new THREE.Mesh(new THREE.PlaneGeometry(.69,.96),new THREE.MeshBasicMaterial({map,side:THREE.FrontSide}));
  print.rotation.x=-Math.PI/2;print.position.y=.017;print.layers.set(NOINK);input.add(print);
  place(root,input,0,1.65,.5);input.rotation.x=1.36;
  const strips=Array.from({length:15},(_,i)=>{const p=box(root,.025,.33+(i%4)*.07,.008,0,0,0,C.paper);p.rotation.z=(i%5-2)*.13;return p;});
  return {root,palette:'night',pose(f,u){input.position.y=1.65-.54*ease(u);input.visible=u<.97;strips.forEach((p,i)=>{const t=((f-948)/75+i*.079)%1;p.position.set((i%7-3)*.095,.78-t*.47,.94+.01*Math.sin(i+f*.04));p.rotation.x=.14*Math.sin(f*.035+i);});},camera(u){return cameraJourney(u,[{"at":0,"position":[1.1,2.35,5.3],"target":[0,1,0.5],"focus":[0,1.1,0.65],"fov":37,"blur":3.2},{"at":1,"position":[0.25,1.85,3.9],"target":[0,1,0.55],"focus":[0,1.1,0.65],"fov":37,"blur":3.2}]);}};
 }
} satisfies SceneDefinition;
