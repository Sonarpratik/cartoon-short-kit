import { classroom } from '../world3';
import { character } from '../characters';
import { byFrame,exprAt,turnAt } from './common';
import { list,title } from './kit';
import { clamp,lerp,type SceneDefinition } from '../types';
const F0=1231,F1=1295;
// "And the next morning, he's gone." Dawn light; Jack walks in smiling, stops; snap to the empty cot, blanket thrown on the floor.
const camera=byFrame(F0,F1,[
 {f:1231,position:[.2,2.3,4.6],target:[-.2,.9,-.6],fov:56,blur:.8},
 {f:1262,position:[.2,2.25,4.4],target:[-.2,.9,-.6],fov:56,blur:.8,ease:'lin'},
 {f:1269,position:[-.2,2.6,2.6],target:[.1,.5,-.3],fov:50,blur:1.2,ease:'snap'},
 {f:1294,position:[-.2,2.55,2.45],target:[.1,.5,-.3],fov:49,blur:1.3,ease:'lin'},
]);
export default {
 id:'S12',f0:F0,f1:F1,title:"Next morning, he's gone",words:"And the next morning, he's gone.",review:[1231,1250,1265,1272,1294],
 build(){const s=classroom({night:false,tally:'IIII IIII IIII IIII I'});
  const jack=character(s.root,'jack',-1.2,0,1.3);
  const bl=s.cots[2].userData.blanket;bl.position.set(.9,-.42,.75);bl.rotation.z=.5;
  return {root:s.root,palette:'dawn',pose(f){const t=clamp((f-1236)/22);jack.root.position.x=lerp(-1.5,-.55,t);
   jack.pose(f,{expr:exprAt(f,[[1231,'smile'],[1262,'neutral'],[1268,'shock']]),turn:turnAt(f,[[1231,50],[1262,20],[1268,-10]],5),mode:t>0&&t<1?'stroll':'stand'});},
   camera,overlays:f=>list(title(f,1270,1295,'GONE.','#ffffff',360))};
 }
} satisfies SceneDefinition;
