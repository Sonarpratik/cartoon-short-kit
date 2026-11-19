import { compound,floodPower } from '../world';
import { character } from '../characters';
import { byFrame,exprAt,portrait } from './common';
import { day,name,list,COLORS } from './kit';
import { clamp,type SceneDefinition,type SceneInstance } from '../types';
const F0=814,F1=1008;
// "Day 20. A man knocks on the gate. He's hurt. He's hungry. He's begging for help."
// Night. Slow creep on the closed gate; three knocks rattle it; push to Troy behind the bars, clutching his arm.
const camera=byFrame(F0,F1,[
 {f:814,position:[1.6,1.7,-7.4],target:[0,1.4,.6],fov:42,blur:1},
 {f:910,position:[1.0,1.65,-5.6],target:[0,1.45,.6],fov:40,blur:1.1,ease:'lin'},
 {f:920,position:[.175,2.15,-2.4],target:[.175,1.75,.85],fov:38,blur:1.6,ease:'snap'},
 {f:1007,position:[.175,2.12,-1.9],target:[.175,1.75,.85],fov:36,blur:1.8,ease:'lin'},
]);
const KNOCKS=[868,877,887];
export function knockScene(freezeAt?:number):SceneInstance{
 const s=compound({sky:'night'});s.gate.leaf.position.x=0;
 const troy=character(s.root,'troy',.175,0,.85),jack=character(s.root,'jack',-1.9,0,-3.4);
 return {root:s.root,palette:'flood',pose(F){const f=freezeAt??F;floodPower([...s.floods,...s.floodsIn],.7);s.blueL.intensity=2;
  const knock=KNOCKS.find(k=>f>=k&&f<k+6);s.gate.leaf.position.z=knock!==undefined?.03*Math.sin((f-knock)*2.4)*(1-(f-knock)/6):0;
  troy.pose(f,{expr:exprAt(f,[[814,'pained'],[917,'pained'],[946,'nervous'],[966,'pained'],[985,'nervous']]),turn:-8,action:f>=862&&f<895?'reach':undefined,tilt:.05*Math.sin(f*.07),headTilt:f>=946?.1:0});
  jack.pose(f,{expr:exprAt(f,[[814,'neutral'],[870,'shock'],[920,'nervous']]),turn:jack.root.position.x<0?45:-45,headTilt:.06});},
  camera:u=>freezeAt!==undefined?camera((freezeAt-F0)/(F1-1-F0)):camera(u),
  portrait:portrait([{a:925,b:1007,focus:[.175,1.5,.85],strength:12,ease:10}]),
  overlays:f=>freezeAt!==undefined?[]:list(day(f,814,862,'DAY 20'),name(f,926,1004,'TROY','Stranger · ???',COLORS.unknown,'right',1450)),
  flash:f=>KNOCKS.some(k=>f>=k&&f<k+2)?.12:0};
}
export default {
 id:'S07',f0:F0,f1:F1,title:'Day 20 · the knock',words:"Day 20. A man knocks on the gate. He's hurt. He's hungry. He's begging for help.",review:[814,845,870,900,925,955,985,1007],
 build:()=>knockScene()
} satisfies SceneDefinition;
void clamp;
