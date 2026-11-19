import { compound,floodPower } from '../world';
import { character } from '../characters';
import { place,crate } from '../props';
import { lantern } from '../world3';
import { byFrame,exprAt } from './common';
import { rule,list } from './kit';
import type { SceneDefinition } from '../types';
const F0=2101,F1=2228;
// "Rule 3. Someone stays awake every single night." Night watch by the gate: Milo on a crate with the lantern,
// the watchtower searchlight sweeping behind him, tents dark. He nods off, then snaps awake.
const camera=byFrame(F0,F1,[
 {f:2101,position:[3.2,2.6,-6.4],target:[1.4,1.4,-1.6],fov:50,blur:.8},
 {f:2150,position:[2.7,1.75,-4.9],target:[1.4,.85,-1.6],fov:46,blur:1.2,ease:'io'},
 {f:2227,position:[2.55,1.7,-4.5],target:[1.4,.85,-1.6],fov:44,blur:1.4,ease:'lin'},
]);
export default {
 id:'S19',f0:F0,f1:F1,title:'Rule 3',words:'Rule 3. Someone stays awake every single night.',review:[2101,2130,2150,2170,2195,2227],
 build(){const s=compound({sky:'night'});s.gate.leaf.position.x=0;
  place(s.root,crate(),1.4,0,-1.75,.2);const lamp=place(s.root,lantern(),.65,0,-1.9);void lamp;
  const milo=character(s.root,'milo',1.4,0,-1.6);
  return {root:s.root,palette:'moon',pose(f){floodPower([...s.floods,...s.floodsIn],.12);
   const nod=f>=2160&&f<2186;
   milo.pose(f,{expr:exprAt(f,[[2101,'neutral'],[2160,'dazed'],[2188,'shock'],[2200,'stern']]),turn:-25,mode:'sit',headTilt:nod?.25*Math.min(1,(f-2160)/14):0,blinkShut:f>=2168&&f<2186});},
   camera,overlays:f=>list(rule(f,2103,2228,3,'SOMEONE STAYS AWAKE EVERY SINGLE NIGHT'))};
 }
} satisfies SceneDefinition;
