import {cameraJourney} from '../engine/director';
import { room } from '../world';
import { desk,bottle,folder,lamp,cabinet,place,box,label,cylinder,C } from '../props';
import { character } from '../characters';
import { ease,lerp,type SceneDefinition } from '../types';
export default {
 id:'S03',f0:141,f1:351,title:'A secret laboratory, 1953',words:'Starting in 1953, a secret program called MKUltra tested LSD and other drugs on people.',review:[141,208,279,350],
 build(){const root=room({palette:'lab',tile:true,year:'1953'});place(root,desk(3.3,1.25),-.15,0,.55);
  const file=place(root,folder('MKULTRA'),-.45,1.24,1.0,-.1);file.scale.setScalar(1.12);file.rotation.x=.66;
  place(root,bottle('LSD'),.6,1.025,.85);place(root,bottle(''),.99,1.025,.49);place(root,lamp(),-1.2,1.025,.36);
  place(root,cabinet('LAB FILES'),-3.8,0,-2.1);
  const scientist=character(root,'researcher',-.65,0,-.3,5);const civilian=character(root,'civilian',1.1,0,.1,3);
  const rack=box(root,.6,.07,.27,.52,1.1,.2,C.wood);for(let i=0;i<4;i++){cylinder(root,.036,.28,.31+i*.14,1.25,.2,i%2?'#b6c9af':'#9dbab9');}
  return {root,palette:'lab',pose(f,u){scientist.pose(f,{expr:u>.6?'stern':'neutral',facing:1,look:.8});civilian.pose(f,{expr:u>.65?'nervous':'neutral',facing:-1,look:-.75});},
   camera(u){return cameraJourney(u,[{"at":0,"position":[1.6,3.15,8.1],"target":[-0.15,1.45,0.35],"focus":[-0.4,1.3,1],"fov":40,"blur":1.6},{"at":0.4,"position":[0.85,2.6,5.8],"target":[-0.35,1.55,0.15],"focus":[-0.65,1.7,-0.3],"fov":40,"blur":1.6},{"at":0.78,"position":[2,2.8,6.4],"target":[0.6,1.5,0.2],"focus":[0.7,1.35,0.8],"fov":40,"blur":1.6},{"at":1,"position":[1.4,2.65,6.2],"target":[0.35,1.5,0.2],"focus":[1.1,1.65,0.1],"fov":40,"blur":1.6}]);}};
 }
} satisfies SceneDefinition;
