import { compound,floodPower } from '../world';
import { character } from '../characters';
import { byFrame,exprAt,horde } from './common';
import { list,title } from './kit';
import type { SceneDefinition } from '../types';
const F0=1462,F1=1586;
// "Because here's the truth. Zombies only want your flesh." Jack, grim, by the fence; drift right onto the zombies groping at the wire.
const camera=byFrame(F0,F1,[
 {f:1462,position:[-6.6,1.6,-3.6],target:[-7.6,1.45,-.4],fov:40,blur:1.4},
 {f:1512,position:[-6.8,1.62,-3.8],target:[-7.6,1.45,-.4],fov:40,blur:1.4,ease:'lin'},
 {f:1526,position:[-9.6,1.7,-3.4],target:[-11,1.4,.6],fov:42,blur:1.1,ease:'out'},
 {f:1585,position:[-10.6,1.68,-3.2],target:[-11.8,1.4,.6],fov:41,blur:1.2,ease:'lin'},
]);
export default {
 id:'S14',f0:F0,f1:F1,title:'Zombies want flesh',words:"Because here's the truth. Zombies only want your flesh.",review:[1462,1490,1520,1540,1560,1585],
 build(){const s=compound({sky:'night'});s.gate.leaf.position.x=0;
  const jack=character(s.root,'jack',-7.6,0,-1.2);
  const z=horde(s.root,7,{x0:-15,x1:-8,z0:.7,z1:2.2,seed:53,advance:0});
  return {root:s.root,palette:'flood',pose(f){floodPower([...s.floods,...s.floodsIn],.6);
   jack.pose(f,{expr:exprAt(f,[[1462,'stern'],[1485,'neutral'],[1505,'stern']]),turn:-25,headTilt:.05});
   z(f,{walking:false,expr:Math.sin(f*.07)>.3?'lick':'dazed'});},
   camera,overlays:f=>list(title(f,1527,1586,'ZOMBIES → FLESH','#9bd07a',330))};
 }
} satisfies SceneDefinition;
