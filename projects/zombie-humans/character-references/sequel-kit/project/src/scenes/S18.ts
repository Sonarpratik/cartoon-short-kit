import * as THREE from 'three';
import { classroom,canStack,waterBottle,riceSack } from '../world3';
import { character } from '../characters';
import { box,place } from '../props';
import { byFrame,exprAt } from './common';
import { rule,tally,list } from './kit';
import { clamp,type SceneDefinition } from '../types';
const F0=1998,F1=2101;
// "Rule 2. Hide your stash in more than one place." Three quick stashes in the dorm: under the floorboards (Brock),
// in the wall locker (Milo), inside the cot frame (Tina); end wide with all three pinned.
const camera=byFrame(F0,F1,[
 {f:1998,position:[0,2.6,4.6],target:[0,.9,-.8],fov:50,blur:.8},
 {f:2024,position:[0,2.55,4.4],target:[0,.9,-.8],fov:50,blur:.8,ease:'lin'},
 {f:2030,position:[-1.5,2.0,3.0],target:[-2.4,.75,.4],fov:44,blur:1.3,ease:'snap'},
 {f:2049,position:[-1.5,2.0,2.95],target:[-2.4,.75,.4],fov:44,blur:1.3,ease:'lin'},
 {f:2054,position:[1.9,1.8,2.4],target:[4.0,1.1,-1.2],fov:44,blur:1.3,ease:'snap'},
 {f:2068,position:[1.9,1.8,2.35],target:[4.0,1.1,-1.2],fov:44,blur:1.3,ease:'lin'},
 {f:2073,position:[.3,1.8,3.0],target:[.7,.75,-.1],fov:44,blur:1.3,ease:'snap'},
 {f:2084,position:[.3,1.8,2.95],target:[.7,.75,-.1],fov:44,blur:1.3,ease:'lin'},
 {f:2100,position:[.6,3.2,5.4],target:[.6,.8,-.6],fov:52,blur:.6,ease:'out'},
]);
export default {
 id:'S18',f0:F0,f1:F1,title:'Rule 2',words:'Rule 2. Hide your stash in more than one place.',review:[1998,2020,2038,2060,2078,2100],
 build(){const s=classroom({night:false,tally:'IIII IIII IIII IIII II'});
  // 1 · floor hatch with cans under it
  const hatch=new THREE.Group();hatch.position.set(-1.9,0,.6);s.root.add(hatch);box(hatch,.9,.02,.7,0,.005,0,'#2a1e18');const cans=place(hatch,canStack(6,'#c8423b'),0,-.05,0);cans.scale.setScalar(.9);
  const lid=new THREE.Group();lid.position.set(-.45,.02,0);hatch.add(lid);box(lid,.9,.05,.7,.45,0,0,'#b98a5a');
  // 2 · wall locker with water bottles
  const locker=new THREE.Group();locker.position.set(4.6,0,-1.6);locker.rotation.y=-.5;s.root.add(locker);box(locker,.8,2,.5,0,1,0,'#3f6e8f');box(locker,.7,1.8,.02,0,1,.26,'#1d1824');
  for(const y of [.4,1.1])for(const x of [-.18,.18])place(locker,waterBottle(),x,y,.05).scale.setScalar(.6);
  const ldoor=new THREE.Group();ldoor.position.set(.4,0,.26);locker.add(ldoor);box(ldoor,.78,1.9,.04,-.39,1,0,'#4f80a0');
  // 3 · rice sack tucked inside the cot frame
  const sack=place(s.root,riceSack(),.1,-.08,-.3);sack.scale.setScalar(.55);
  const brock=character(s.root,'brock',-2.9,0,.4),milo=character(s.root,'milo',3.6,0,-.9),tina=character(s.root,'tina',1.3,0,.2);
  return {root:s.root,palette:'dawn',pose(f){
   lid.rotation.z=1.4*clamp((f-2028)/8)*(1-clamp((f-2046)/5));ldoor.rotation.y=-1.6*clamp((f-2052)/8)*(1-clamp((f-2066)/5));
   sack.position.y=-.08-.1*clamp((f-2076)/8);
   brock.pose(f,{expr:exprAt(f,[[1998,'stern'],[2035,'grin']]),turn:35,action:f>=2026&&f<2048?'bend':undefined});
   milo.pose(f,{expr:exprAt(f,[[1998,'smile'],[2058,'whistle']]),turn:-40,action:f>=2052&&f<2066?'reach':undefined});
   tina.pose(f,{expr:exprAt(f,[[1998,'smile'],[2078,'smile_closed']]),turn:-30,action:f>=2072&&f<2086?'bend':undefined});},
   camera,overlays:f=>list(rule(f,2000,2101,2,'HIDE YOUR STASH IN MORE THAN ONE PLACE'),tally(f,2090,2101,1,250,1250),tally(f,2092,2101,2,860,1050),tally(f,2094,2101,3,560,1330))};
 }
} satisfies SceneDefinition;
