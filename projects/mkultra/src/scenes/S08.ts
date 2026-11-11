import { room } from '../world';
import { desk,cabinet,folder,paper,place,label,C } from '../props';
import { character } from '../characters';
import { ease,lerp,type SceneDefinition } from '../types';
export default {
 id:'S08',f0:858,f1:948,title:'The discovery, 1977',words:'They were found in 1977.',review:[858,902,947],
 build(){const root=room({palette:'archive',year:'1977',window:true});place(root,cabinet('FINANCE'),-1.7,0,-.55);place(root,cabinet('RECEIPTS'),-3.3,0,-1.3);
  place(root,desk(2.5,1.1),.5,0,.8);const file=place(root,folder('MKULTRA'),.35,1.025,1.0,-.12);const page=place(root,paper('RESEARCH'),.7,1.035,.75,.1);
  const archivist=character(root,'archivist',.55,0,.05,6);
  return {root,palette:'archive',pose(f,u){file.rotation.x=.22+.62*ease(u);file.position.y=1.12+.12*ease(u);archivist.pose(f,{expr:u>.28?'shock':'neutral',facing:u>.65?0:-1,look:u>.65?0:-.65,headTilt:-1+2*ease(u),hand:[377,975-(file.position.y+.04)/.0026]});},camera(u){return {position:[lerp(1.35,1.0,ease(u)),2.7,lerp(6.5,5.7,ease(u))],target:[.25,1.55,.35],fov:37,focus:[.45,1.5,.2],blur:1.9};}};
 }
} satisfies SceneDefinition;
