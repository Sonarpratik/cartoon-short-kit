import {cameraJourney} from '../engine/director';
import { room } from '../world';
import { desk,recorder,lamp,chair,place,box,label,C } from '../props';
import { character } from '../characters';
import { ease,lerp,type SceneDefinition } from '../types';
export default {
 id:'S05',f0:420,f1:570,title:'Research into control and interrogation',words:'The goal? Mind control… and making people talk under interrogation.',review:[420,458,509,569],
 build(){const root=room({palette:'night',shelfX:-2.6});place(root,desk(2.5,.95),0,0,.1);place(root,lamp(),0,1.025,.1);const tape=place(root,recorder(),-.35,1.025,.42);
  const civilian=character(root,'civilian',.95,0,-.6,3);const investigator=character(root,'investigator',-.95,0,.0,9);
  place(root,chair(),.95,0,-.62);box(root,2.3,1.23,.07,-.3,2.75,-3.3,'#3c5d59');label(root,'BEHAVIOR\nRESEARCH',1.95,.57,[-.3,2.96,-3.25],{bg:'#3c5d59',ink:'#e9dfbf',size:100});label(root,'?     ?     ?',1.8,.3,[-.3,2.5,-3.24],{bg:'#3c5d59',ink:'#d4bc8e',size:130});
  return {root,palette:'night',pose(f,u){civilian.pose(f,{expr:u>.4?'nervous':'neutral',facing:-1,look:-.85});investigator.pose(f,{expr:'stern',facing:1,look:.85,headTilt:.7*Math.sin(f*.03)});tape.children.slice(1,3).forEach((o,i)=>o.rotation.y=f*.025*(i?1:-1));},
   camera(u){return cameraJourney(u,[{"at":0,"position":[-0.65,2.95,7.8],"target":[-0.25,1.5,0],"focus":[-0.8,1.65,0],"fov":41,"blur":1.9},{"at":1,"position":[0.45,2.5,6.2],"target":[0.15,1.5,0],"focus":[0.8,1.6,-0.4],"fov":41,"blur":1.9}]);}};
 }
} satisfies SceneDefinition;
