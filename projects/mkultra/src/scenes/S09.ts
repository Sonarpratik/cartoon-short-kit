import { room } from '../world';
import { shredder,folder,paper,place,box,C } from '../props';
import { ease,lerp,type SceneDefinition } from '../types';
export default {
 id:'S09',f0:948,f1:1034,title:'What is missing?',words:'So… what else do you think got shredded?',review:[948,996,1033],
 build(){const root=room({palette:'night'});place(root,shredder(),0,0,.5);for(let i=0;i<3;i++)place(root,folder('',i%2?'#96785a':'#747e70'),1.25,0.03+i*.06,-.15,i*.17);
  const input=place(root,paper(''),0,1.52,.5);input.rotation.x=-1.24;input.scale.setScalar(.8);
  const strips=Array.from({length:15},(_,i)=>{const p=box(root,.025,.33+(i%4)*.07,.008,0,0,0,C.paper);p.rotation.z=(i%5-2)*.13;return p;});
  return {root,palette:'night',pose(f,u){input.position.y=1.65-.54*ease(u);input.visible=u<.97;strips.forEach((p,i)=>{const t=((f-948)/75+i*.079)%1;p.position.set((i%7-3)*.095,.78-t*.47,.94+.01*Math.sin(i+f*.04));p.rotation.x=.14*Math.sin(f*.035+i);});},camera(u){return {position:[lerp(.9,.55,ease(u)),2.05,lerp(4.7,3.7,ease(u))],target:[0,1.0,.45],fov:37,focus:[0,1.1,.65],blur:3.2};}};
 }
} satisfies SceneDefinition;
