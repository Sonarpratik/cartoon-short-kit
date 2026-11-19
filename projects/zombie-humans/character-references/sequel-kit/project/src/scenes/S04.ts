import { compound,floodPower } from '../world';
import { character } from '../characters';
import { place } from '../props';
import { padlock } from '../world3';
import { byFrame,exprAt,horde } from './common';
import { day,list } from './kit';
import { clamp,type SceneDefinition } from '../types';
const F0=418,F1=518;
// "Day 1. You lock the school gates." DAY 1 slams in; Jack and Brock heave the steel gate shut; macro on the padlock snapping.
const camera=byFrame(F0,F1,[
 {f:418,position:[2.6,2.0,-7.2],target:[3.4,1.3,-.4],fov:48,blur:.8},
 {f:440,position:[2.5,2.0,-7.0],target:[3.2,1.3,-.4],fov:48,blur:.8,ease:'lin'},
 {f:478,position:[.6,1.9,-6.4],target:[.4,1.3,-.4],fov:48,blur:.8,ease:'io'},
 {f:484,position:[-1.3,1.25,-2.0],target:[-2.0,.95,-.28],fov:40,blur:2,ease:'snap'},
 {f:517,position:[-1.4,1.22,-1.8],target:[-2.0,.95,-.28],fov:38,blur:2.1,ease:'lin'},
]);
export default {
 id:'S04',f0:F0,f1:F1,title:'Day 1 · lock the gates',words:'Day 1. You lock the school gates.',review:[418,440,460,478,490,517],
 build(){const s=compound({sky:'day'});
  const jack=character(s.root,'jack',0,0,-.55),brock=character(s.root,'brock',0,0,-.6);
  const lock=place(s.root,padlock(),-2.0,1.15,-.28);
  const z=horde(s.root,5,{x0:-6,x1:6,z0:11,z1:15,seed:41,advance:.12});
  return {root:s.root,palette:'day',pose(f){floodPower([...s.floods,...s.floodsIn],0);
   const t=clamp((f-440)/38),x=4.2*(1-t*t*(3-2*t));s.gate.leaf.position.x=x;
   jack.root.position.x=x+1.0;brock.root.position.x=x+1.85;const pushing=f>=440&&f<478;
   jack.pose(f,{expr:exprAt(f,[[418,'stern'],[446,'pained'],[480,'relief']]),turn:-40,tilt:pushing?.12:0,mode:pushing?'stroll':'stand'});
   brock.pose(f,{expr:exprAt(f,[[418,'stern'],[446,'pained'],[480,'grin']]),turn:-35,tilt:pushing?.14:0,mode:pushing?'stroll':'stand'});
   lock.shackle.position.y=-.2+.12*(1-clamp((f-488)/3));lock.rotation.z=f>=488&&f<496?.08*Math.sin((f-488)*2):0;
   z(f);},
   camera,overlays:f=>list(day(f,418,474,'DAY 1'))};
 }
} satisfies SceneDefinition;
