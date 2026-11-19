import { compound,floodPower } from '../world';
import { character } from '../characters';
import { byFrame,exprAt } from './common';
import { clamp,lerp,type SceneDefinition } from '../types';
const F0=1051,F1=1089;
// "You let him in." The gate slides open a body's width; Troy limps through, Jack waves him in.
const camera=byFrame(F0,F1,[
 {f:1051,position:[1.4,1.75,-6.4],target:[-.9,1.35,.2],fov:44,blur:1},
 {f:1088,position:[1.1,1.72,-5.8],target:[-1.0,1.35,-.6],fov:43,blur:1,ease:'lin'},
]);
export default {
 id:'S09',f0:F0,f1:F1,title:'Let him in',words:'You let him in.',review:[1051,1065,1078,1088],
 build(){const s=compound({sky:'night'});
  const troy=character(s.root,'troy',-1.3,0,.95),jack=character(s.root,'jack',-2.9,0,-2.7),tina=character(s.root,'tina',1.9,0,-2.8);
  return {root:s.root,palette:'flood',pose(f){floodPower([...s.floods,...s.floodsIn],.7);
   s.gate.leaf.position.x=1.6*clamp((f-1053)/12);const t=clamp((f-1064)/24);troy.root.position.set(lerp(-1.3,-1.15,t),0,lerp(.95,-1.7,t));
   troy.pose(f,{expr:exprAt(f,[[1051,'nervous'],[1068,'relief']]),turn:-5,mode:t>0&&t<1?'stroll':'stand',tilt:.06});
   jack.pose(f,{expr:exprAt(f,[[1051,'stern'],[1060,'smile']]),turn:40,wave:f>=1058&&f<1080?.5+.5*Math.sin(f*.5):undefined});
   tina.pose(f,{expr:exprAt(f,[[1051,'nervous'],[1070,'smile']]),turn:-40});},
   camera};
 }
} satisfies SceneDefinition;
