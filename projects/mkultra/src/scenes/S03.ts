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
   camera(u){const t=ease(u);return {position:[lerp(1.1,1.5,t),lerp(2.9,2.7,t),lerp(6.6,7.2,t)],target:[lerp(-.1,.15,t),1.55,.35],fov:40,focus:[u<.45?-.3:.8,1.5,.3],blur:1.6};}};
 }
} satisfies SceneDefinition;
