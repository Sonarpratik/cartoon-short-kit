import { compound,floodPower } from '../world';
import { character } from '../characters';
import { place,streetLamp } from '../props';
import { sparkles } from '../atmosphere';
import { byFrame,exprAt } from './common';
import { list,title } from './kit';
import { clamp,lerp,type SceneDefinition } from '../types';
const F0=2228,F1=2321;
// "Zombies are slow and dumb." Outside the fence by day: a zombie shuffles straight into a lamp post, bonk, stars.
const camera=byFrame(F0,F1,[
 {f:2228,position:[-.3,1.6,9.8],target:[.5,1.35,5.3],fov:42,blur:1.2},
 {f:2320,position:[-.2,1.58,9.4],target:[.6,1.35,5.3],fov:41,blur:1.3,ease:'lin'},
]);
export default {
 id:'S20',f0:F0,f1:F1,title:'Slow and dumb',words:'Zombies are slow and dumb.',review:[2228,2250,2270,2280,2300,2320],
 build(){const s=compound({sky:'day'});s.gate.leaf.position.x=0;
  place(s.root,streetLamp(4),1.32,0,5.4,Math.PI);
  const z=character(s.root,'zOffice',-1.4,0,5.45),z2=character(s.root,'zChef',-1.6,0,3.0);
  sparkles(s.root,{center:[1.0,2.3,5.5],size:[.6,.3,.3],count:6,color:'#ffe86a',start:2276,end:2320});
  return {root:s.root,palette:'day',pose(f){floodPower([...s.floods,...s.floodsIn],0);
   const t=clamp((f-2228)/46),bounce=f>=2276?Math.max(0,.25*Math.sin((f-2276)*.25)*Math.exp(-(f-2276)*.05)):0;
   z.root.position.x=lerp(-1.4,1.0,t)-bounce;
   z.pose(f,{expr:exprAt(f,[[2228,'dazed'],[2276,'shock'],[2290,'dazed']]),turn:f<2276?55:-10,mode:f<2274?'stroll':'stand',tilt:f>=2276&&f<2300?-.3*Math.exp(-(f-2276)*.08):.06*Math.sin(f*.05),headTilt:f>=2276?.2:0});
   z2.pose(f,{expr:'dazed',turn:-30+20*Math.sin(f*.03),mode:'stroll',tilt:.08*Math.sin(f*.05)});},
   camera,overlays:f=>list(title(f,2246,2276,'SLOW...','#9bd07a',330),title(f,2276,2321,'...AND DUMB','#9bd07a',330))};
 }
} satisfies SceneDefinition;
