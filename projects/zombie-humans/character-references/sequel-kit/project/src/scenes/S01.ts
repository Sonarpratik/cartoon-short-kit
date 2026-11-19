import { compound,floodPower } from '../world';
import { character } from '../characters';
import { place } from '../props';
import { birds } from '../atmosphere';
import { byFrame,exprAt,turnAt } from './common';
import { name,list,bat,crowbar,COLORS } from './kit';
import type { SceneDefinition } from '../types';
const F0=0,F1=126;
// "You've got your weapon… your camp… but you can't survive alone."
// Macro on the bat → snap to the compound aerial → Jack small and alone in the big empty yard.
const camera=byFrame(F0,F1,[
 {f:0,position:[-3.5,1.15,-1.3],target:[-4.95,.6,-3.6],fov:44,blur:1.8},
 {f:8,position:[-3.8,1.05,-1.9],target:[-4.95,.6,-3.6],fov:41,blur:2,ease:'snap'},
 {f:42,position:[-3.85,1.02,-2.0],target:[-4.95,.6,-3.6],fov:40,blur:2,ease:'lin'},
 {f:50,position:[6,10,16],target:[0,1.5,-7],fov:46,blur:.4,ease:'snap'},
 {f:76,position:[5,9.4,15],target:[0,1.5,-7],fov:46,blur:.4,ease:'lin'},
 {f:84,position:[0,1.6,-1.6],target:[0,1.35,-5],fov:42,blur:1.2,ease:'snap'},
 {f:125,position:[0,4.6,-.9],target:[0,1.0,-5.4],fov:50,blur:.8,ease:'out'},
]);
export default {
 id:'S01',f0:F0,f1:F1,title:'Weapon, camp, alone',words:"You've got your weapon. You've got your camp. But you can't survive alone.",review:[0,30,60,90,110,125],
 build(){const s=compound({sky:'day'});s.gate.leaf.position.x=0;
  const b=place(s.root,bat(),-4.6,.55,-3.3);b.rotation.z=.32;const cb=place(s.root,crowbar(),-4.95,0,-3.45);cb.rotation.z=-.28;
  const jack=character(s.root,'jack',0,0,-5);birds(s.root,{y:9,z:-18,from:-22,to:22,count:5});
  return {root:s.root,palette:'day',pose(f){floodPower([...s.floods,...s.floodsIn],0);s.blueL.intensity=.4;
   jack.pose(f,{expr:exprAt(f,[[0,'grin'],[97,'nervous'],[112,'dazed']]),turn:turnAt(f,[[0,0],[92,-45],[104,40],[116,0]],8),headTilt:f>100?.08:0});},
   camera,overlays:f=>list(name(f,88,126,'JACK','The leader · you',COLORS.jack))};
 }
} satisfies SceneDefinition;
