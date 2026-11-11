import {cameraJourney} from '../engine/director';
import { room } from '../world';
import { desk,cup,folder,place } from '../props';
import { character } from '../characters';
import { ease,lerp,type SceneDefinition } from '../types';
export default {
 id:'S04',f0:351,f1:420,title:'They were not told',words:"Some of them never knew they'd been dosed.",review:[351,383,419],
 build(){const root=room({palette:'warm',window:true});place(root,desk(2.5,1.1),0,0,.7);const coffee=place(root,cup(),.35,1.025,1.01);const saucer=coffee.children[2];coffee.remove(saucer);place(root,saucer,.35,1.039,1.01);place(root,folder(''),-1.03,1.025,.55,.3);
  const civilian=character(root,'civilian',.35,0,-.07,3);
  return {root,palette:'warm',pose(f,u){const lift=ease(u/.22)*(1-ease((u-.4)/.45));coffee.position.y=1.025+.44*lift;coffee.position.z=1.01-.78*lift;coffee.rotation.z=.16*lift;civilian.pose(f,{expr:u>.35?'nervous':'neutral',headTilt:-1.2*ease(u),facing:u>.8?-1:0,look:u>.8?-.8:0,hand:[365,975-(coffee.position.y+.15)/.0026]});},
  camera(u){return cameraJourney(u,[{"at":0,"position":[1,2.45,4.7],"target":[0.35,1.55,0.2],"focus":[0.35,1.65,0],"fov":34,"blur":3},{"at":1,"position":[0.45,2.25,3.95],"target":[0.3,1.55,0.25],"focus":[0.35,1.65,0],"fov":34,"blur":3}]);}};
 }
} satisfies SceneDefinition;
