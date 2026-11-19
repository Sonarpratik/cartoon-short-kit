import { storeroom } from '../world3';
import { character } from '../characters';
import { byFrame,exprAt,turnAt,portrait } from './common';
import { tally,list } from './kit';
import type { SceneDefinition } from '../types';
const F0=1157,F1=1231;
// "He looks around, counts your supplies." Mystery creep on Troy in the storeroom doorway light; his eyes slide shelf to shelf, numbers tick up.
const camera=byFrame(F0,F1,[
 {f:1157,position:[.1,1.62,2.6],target:[.1,1.5,-.6],fov:36,blur:1.5},
 {f:1230,position:[.1,1.6,1.5],target:[.1,1.52,-.6],fov:34,blur:1.7,ease:'lin'},
]);
export default {
 id:'S11',f0:F0,f1:F1,title:'Counts your supplies',words:'He looks around, counts your supplies.',review:[1157,1175,1190,1200,1230],
 build(){const s=storeroom();const troy=character(s.root,'troy',.1,0,-.6);
  return {root:s.root,palette:'lamp',pose(f){s.lamps[0].light.intensity=7;
   troy.pose(f,{expr:exprAt(f,[[1157,'neutral'],[1184,'stern'],[1200,'smile_closed']]),turn:turnAt(f,[[1157,0],[1162,-45],[1176,40],[1192,-20],[1206,5]],8)});},
   camera,portrait:portrait([{a:1157,b:1230,focus:[.1,1.5,-.6],strength:10,ease:6}]),
   overlays:f=>list(tally(f,1164,1231,1,120,620),tally(f,1184,1231,2,960,620),tally(f,1192,1231,3,120,1100),tally(f,1198,1231,4,960,1100))};
 }
} satisfies SceneDefinition;
