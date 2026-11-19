import { compound,floodPower } from '../world';
import { byFrame,exprAt } from './common';
import { four,list,title } from './kit';
import type { SceneDefinition } from '../types';
const F0=326,F1=418;
// "Four people. One goal. Survive." Low hero angle, slow rise; snap in on "Survive".
const camera=byFrame(F0,F1,[
 {f:326,position:[0,.7,-.8],target:[0,1.55,-6],fov:52,blur:1},
 {f:383,position:[0,.75,-1.2],target:[0,1.55,-6],fov:51,blur:1,ease:'lin'},
 {f:391,position:[0,1.0,-2.2],target:[0,1.5,-6],fov:50,blur:1.2,ease:'snap'},
 {f:417,position:[0,1.02,-2.35],target:[0,1.5,-6],fov:50,blur:1.2,ease:'lin'},
]);
export default {
 id:'S03',f0:F0,f1:F1,title:'Four people, one goal',words:'Four people. One goal. Survive.',review:[326,352,380,392,417],
 build(){const s=compound({sky:'day'});s.gate.leaf.position.x=0;
  const g=four(s.root,{milo:[-1.15,0,-6.0],jack:[-.35,0,-5.5],tina:[.5,0,-5.8],brock:[1.25,0,-6.2]});
  return {root:s.root,palette:'day',pose(f){floodPower([...s.floods,...s.floodsIn],0);
   const on=f>=386;
   g.jack.pose(f,{expr:exprAt(f,[[326,'smile'],[386,'stern']]),turn:-8});
   g.milo.pose(f,{expr:exprAt(f,[[326,'grin'],[386,'stern']]),turn:25});
   g.tina.pose(f,{expr:exprAt(f,[[326,'smile'],[386,'stern']]),turn:-15});
   g.brock.pose(f,{expr:exprAt(f,[[326,'grin'],[386,'stern']]),turn:-28,headTilt:on?-.05:0});},
   camera,overlays:f=>list(title(f,330,382,'4 PEOPLE · 1 GOAL','#ffffff',300),title(f,386,418,'SURVIVE.','#e8b93c',330))};
 }
} satisfies SceneDefinition;
