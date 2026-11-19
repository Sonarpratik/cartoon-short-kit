import { storeroom } from '../world3';
import { character } from '../characters';
import { place } from '../props';
import { medKit,canStack } from '../world3';
import { byFrame,exprAt } from './common';
import { day,list,hold,title } from './kit';
import type { SceneDefinition } from '../types';
const F0=518,F1=655;
// "Day 10. You've got rice, canned food, water, medicine…" DAY 10, then a glide along the stocked shelves, one hold per word.
const at=(x:number,f:number,ease:'out'|'lin'='out')=>({f,position:[x,1.45,.9] as [number,number,number],target:[x,1.05,-2.7] as [number,number,number],fov:40,blur:1.4,ease});
const camera=byFrame(F0,F1,[
 {f:518,position:[0,1.9,3.2],target:[0,1.3,-2.7],fov:46,blur:.8},
 {f:564,position:[-.4,1.85,2.8],target:[-.4,1.3,-2.7],fov:45,blur:.8,ease:'lin'},
 at(-3.4,574),at(-3.2,592,'lin'),at(-1.1,600),at(-.9,615,'lin'),at(1.2,622),at(1.4,633,'lin'),at(3.4,640),at(3.55,654,'lin'),
]);
export default {
 id:'S05',f0:F0,f1:F1,title:'Day 10 · supplies',words:"Day 10. You've got rice, canned food, water, medicine,",review:[518,545,578,604,626,645,654],
 build(){const s=storeroom();
  const milo=character(s.root,'milo',-.6,0,-1.4),tina=character(s.root,'tina',2.7,0,-1.3);
  const can=place(s.root,canStack(1,'#e8b93c'),0,0,0),kit=place(s.root,medKit(),0,0,0);kit.scale.setScalar(.6);
  return {root:s.root,palette:'lamp',pose(f,local){const eye=camera(local).position;
   milo.pose(f,{expr:exprAt(f,[[518,'grin'],[596,'laugh'],[620,'grin']]),turn:25,hand:hold(milo,can,eye,f,[.4,1.05+.08*Math.sin(f*.2),.1])});
   tina.pose(f,{expr:exprAt(f,[[518,'smile'],[636,'smile_closed']]),turn:-20,hand:hold(tina,kit,eye,f,[.4,.85,.1])});},
   camera,overlays:f=>list(day(f,518,568,'DAY 10'),title(f,572,595,'RICE ✓','#ffffff',1650),title(f,595,618,'CANNED FOOD ✓','#ffffff',1650),title(f,618,636,'WATER ✓','#ffffff',1650),title(f,636,655,'MEDICINE ✓','#ffffff',1650))};
 }
} satisfies SceneDefinition;
