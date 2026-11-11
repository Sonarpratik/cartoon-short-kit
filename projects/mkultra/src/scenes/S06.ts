import {cameraJourney} from '../engine/director';
import { room } from '../world';
import { desk,folder,paper,shredder,place,box,cylinder,C } from '../props';
import { character } from '../characters';
import { ease,lerp,type SceneDefinition } from '../types';
export default {
 id:'S06',f0:570,f1:702,title:'The destruction order, 1973',words:'In 1973, the CIA director ordered the files destroyed.',review:[570,628,660,701],
 build(){const root=room({palette:'warm',year:'1973',window:true});place(root,desk(3.2,1.2),-.45,0,.3);place(root,paper('DESTROY'),-.48,1.025,.7);
  const file=place(root,folder('MKULTRA'),.37,1.025,.65,.12);place(root,shredder(),1.73,0,.7);
  const official=character(root,'official',-.55,0,-.25,12);
  const stamp=box(root,.27,.09,.18,-.6,1.4,.76,C.red);const grip=cylinder(root,.055,.13,-.6,1.49,.76,C.navy);
  const sheet=place(root,paper(''),1.73,1.4,.7);sheet.rotation.x=-1.27;sheet.scale.setScalar(.65);
  return {root,palette:'warm',pose(f,u){const stampBeat=ease((f-637)/8)*(1-ease((f-650)/12));stamp.position.y=1.4-.31*stampBeat;grip.position.y=stamp.position.y+.09;official.pose(f,{expr:'stern',look:-.45,headTilt:-1,hand:[281,975-(grip.position.y+.05)/.0026]});const shred=ease((f-671)/29);sheet.position.y=1.58-.75*shred;sheet.scale.y=1;sheet.visible=f>656&&shred<.97;},
   camera(u){return cameraJourney(u,[{"at":0,"position":[1.25,3.1,8.2],"target":[-0.2,1.35,0.4],"focus":[-0.5,1.2,0.7],"fov":42,"blur":1.8},{"at":0.62,"position":[1.5,2.85,7.4],"target":[0,1.4,0.35],"focus":[-0.5,1.2,0.7],"fov":42,"blur":1.8},{"at":1,"position":[2.5,2.6,6.4],"target":[1.25,1.25,0.6],"focus":[1.73,1.2,0.7],"fov":42,"blur":1.8}]);}};
 }
} satisfies SceneDefinition;
