import {cameraJourney} from '../engine/director';
import { room } from '../world';
import { desk,microphone,paper,folder,place,box,label,C } from '../props';
import { character } from '../characters';
import { ease,lerp,type SceneDefinition } from '../types';
export default {
 id:'S02',f0:75,f1:141,title:'On the public record',words:'…and they admitted it.',review:[75,104,140],
 build(){const root=room({palette:'warm',label:'PUBLIC HEARING'});place(root,desk(4.6,1.15,1.05),0,0,.45);
  const official=character(root,'official',0,0,-.12,12);place(root,microphone(),.4,1.13,.89);place(root,paper('TESTIMONY'),-.48,1.125,.75,-.1);place(root,folder('MKULTRA'),-1.22,1.125,.52,.16);
  box(root,1.4,.27,.08,0,1.02,1.07,C.navy);label(root,'WITNESS',1.25,.18,[0,1.02,1.116],{bg:C.navy,ink:C.cream,size:95});
  for(const x of [-2.7,2.7]){box(root,.12,3.8,.12,x,1.9,-3.2,'#b38e63',true);}
  return {root,palette:'warm',pose(f,u){official.pose(f,{expr:u>.25?'neutral':'stern',headTilt:-.8*ease(u),look:u>.25?0:-.5});},camera(u){return cameraJourney(u,[{"at":0,"position":[-0.9,2.75,6.8],"target":[0,1.55,0.25],"focus":[0,1.7,0],"fov":36,"blur":1.8},{"at":1,"position":[0.45,2.45,5],"target":[0,1.5,0.25],"focus":[0,1.7,0],"fov":36,"blur":1.8}]);}};
 }
} satisfies SceneDefinition;
