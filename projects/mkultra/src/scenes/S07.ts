import {cameraJourney} from '../engine/director';
import { room } from '../world';
import { shelf,fileBox,folder,place,label,box,C } from '../props';
import { ease,lerp,type SceneDefinition } from '../types';
export default {
 id:'S07',f0:702,f1:858,title:'Hidden among the finance files',words:'But about 20,000 documents survived, because they had been misfiled with financial records.',review:[702,752,809,857],
 build(){const root=room({palette:'archive',label:'BUDGET & FISCAL'});place(root,shelf(),0,0,-.4);
  for(const [row,y] of [[0,.15],[1,1.17],[2,2.19]] as const)for(let i=0;i<3;i++)place(root,fileBox(row===1&&i===1?'ACCOUNTS':'FINANCE'),-1.22+i*1.22,y,-.4);
  const file=place(root,folder('MKULTRA','#9f8060'),0,1.94,.02);file.rotation.x=.72;file.rotation.z=-.08;
  box(root,.19,.13,.035,.33,2.11,.19,C.red);label(root,'1970–1974',1.35,.23,[0,3.45,-.33],{bg:'#536565',ink:C.cream,size:110});
  return {root,palette:'archive',pose(f,u){file.position.z=.02+.09*ease(u);},camera(u){return cameraJourney(u,[{"at":0,"position":[-1.4,2.9,8.5],"target":[-0.4,1.95,-0.15],"focus":[0,1.95,0.1],"fov":39,"blur":2},{"at":1,"position":[1.1,2.4,6.1],"target":[0,1.9,-0.15],"focus":[0,1.95,0.1],"fov":39,"blur":2}]);}};
 }
} satisfies SceneDefinition;
