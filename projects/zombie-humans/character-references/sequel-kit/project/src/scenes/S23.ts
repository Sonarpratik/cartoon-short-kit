import { compound,floodPower } from '../world';
import { character } from '../characters';
import { cardAt } from '../hud';
import { byFrame,exprAt,turnAt,portrait } from './common';
import type { SceneDefinition } from '../types';
const F0=2617,F1=2711;
// "Find out in Part 4. Subscribe so you don't miss it." Slow push on Jack by the fire, eyes moving between his friends; PART 4 then SUBSCRIBE.
const camera=byFrame(F0,F1,[
 {f:2617,position:[-1.3,1.6,-3.6],target:[-1.6,1.45,-6.4],fov:40,blur:1.6},
 {f:2710,position:[-1.4,1.56,-4.6],target:[-1.6,1.45,-6.4],fov:36,blur:1.9,ease:'lin'},
]);
export default {
 id:'S23',f0:F0,f1:F1,title:'Part 4 · subscribe',words:"Find out in Part 4. Subscribe so you don't miss it.",review:[2617,2635,2655,2680,2710],
 build(){const s=compound({sky:'night'});s.gate.leaf.position.x=0;const jack=character(s.root,'jack',-1.6,0,-6.4);
  return {root:s.root,palette:'lampnight',pose(f){floodPower([...s.floods,...s.floodsIn],.06);
   jack.pose(f,{expr:exprAt(f,[[2617,'nervous'],[2660,'stern']]),turn:turnAt(f,[[2617,35],[2640,-30],[2665,10]],8)});},
   camera,portrait:portrait([{a:2617,b:2710,focus:[-1.6,1.45,-6.4],strength:14,ease:10}]),
   card:f=>f<2648?cardAt(f,{a:2619,b:2648,stamp:2632,rank:'4',title:'PART 4',icon:'question',color:'#c8423b',y:1560}):cardAt(f,{a:2648,b:2730,rank:'4',title:'SUBSCRIBE',icon:'question',color:'#c8423b',y:1560})};
 }
} satisfies SceneDefinition;
