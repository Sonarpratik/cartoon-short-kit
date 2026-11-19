import { compound,floodPower } from '../world';
import { byFrame,exprAt,turnAt,portrait,rack } from './common';
import { four,list,title } from './kit';
import type { SceneDefinition } from '../types';
const F0=2474,F1=2617;
// "But here's the real question. What about the people inside your group? Can you really trust them?"
// Campfire night. Slow creep across Milo, Tina, Brock; on "trust" each one's eyes slide away. Jack watches them.
const camera=byFrame(F0,F1,[
 {f:2474,position:[.6,1.7,-3.4],target:[.6,1.15,-7.6],fov:44,blur:1.2},
 {f:2520,position:[.6,1.62,-4.2],target:[.6,1.2,-7.6],fov:42,blur:1.4,ease:'lin'},
 {f:2535,position:[-.5,1.5,-5.0],target:[-.6,1.35,-8.3],fov:38,blur:1.8,ease:'io'},
 {f:2556,position:[.4,1.5,-5.2],target:[.6,1.35,-8.5],fov:38,blur:1.8,ease:'io'},
 {f:2578,position:[1.6,1.5,-5.0],target:[1.8,1.35,-8.2],fov:38,blur:1.8,ease:'io'},
 {f:2616,position:[.6,1.58,-4.4],target:[.6,1.25,-7.8],fov:42,blur:1.5,ease:'io'},
]);
export default {
 id:'S22',f0:F0,f1:F1,title:'Can you trust them?',words:"But here's the real question. What about the people inside your group? Can you really trust them?",review:[2474,2500,2540,2560,2582,2598,2616],
 build(){const s=compound({sky:'night'});s.gate.leaf.position.x=0;
  const g=four(s.root,{milo:[-.6,0,-8.3],tina:[.6,0,-8.6],brock:[1.8,0,-8.2],jack:[-1.6,0,-6.4]});
  return {root:s.root,palette:'lampnight',pose(f){floodPower([...s.floods,...s.floodsIn],.08);
   const shifty=f>=2594;
   g.milo.pose(f,{expr:exprAt(f,[[2474,'laugh'],[2530,'smile'],[2594,'smile_closed']]),turn:turnAt(f,[[2474,20],[2594,-45]],6)});
   g.tina.pose(f,{expr:exprAt(f,[[2474,'smile'],[2555,'neutral'],[2594,'nervous']]),turn:turnAt(f,[[2474,-5],[2596,40]],6)});
   g.brock.pose(f,{expr:exprAt(f,[[2474,'grin'],[2575,'neutral'],[2594,'stern']]),turn:turnAt(f,[[2474,-20],[2598,-50]],6),headTilt:shifty?-.06:0});
   g.jack.pose(f,{expr:exprAt(f,[[2474,'smile'],[2523,'neutral'],[2582,'nervous']]),turn:50});},
   camera,portrait:portrait([{a:2530,b:2600,focus:rack([-.6,1.4,-8.3],[1.8,1.4,-8.2],2535,45),strength:12,ease:8}]),
   overlays:f=>list(title(f,2584,2617,'TRUST THEM?','#ffffff',330))};
 }
} satisfies SceneDefinition;
