import { compound,floodPower } from '../world';
import { character } from '../characters';
import { byFrame,exprAt,portrait } from './common';
import { list,title } from './kit';
import type { SceneDefinition } from '../types';
const F0=1821,F1=1896;
// "And so remember three rules." Back to reality: the yard at dusk, Jack steps up to camera, dead serious.
const camera=byFrame(F0,F1,[
 {f:1821,position:[0,1.6,-1.2],target:[0,1.45,-5],fov:40,blur:1.4},
 {f:1895,position:[0,1.55,-2.5],target:[0,1.48,-5],fov:36,blur:1.8,ease:'out'},
]);
export default {
 id:'S16',f0:F0,f1:F1,title:'Three rules',words:'And so remember three rules.',review:[1821,1840,1855,1875,1895],
 build(){const s=compound({sky:'dusk'});s.gate.leaf.position.x=0;
  const jack=character(s.root,'jack',0,0,-5),milo=character(s.root,'milo',-2.2,0,-8.4),brock=character(s.root,'brock',2.4,0,-8.8);
  return {root:s.root,palette:'dusk',pose(f){floodPower([...s.floods,...s.floodsIn],.3);
   jack.pose(f,{expr:exprAt(f,[[1821,'stern'],[1849,'grin'],[1870,'stern']]),turn:-6,wave:f>=1838&&f<1860?1:undefined});
   milo.pose(f,{expr:'smile',turn:30});brock.pose(f,{expr:'neutral',turn:-30});},
   camera,portrait:portrait([{a:1830,b:1895,focus:[0,1.5,-5],strength:12,ease:12}]),
   overlays:f=>list(title(f,1837,1896,'3 RULES','#e8b93c',1600))};
 }
} satisfies SceneDefinition;
