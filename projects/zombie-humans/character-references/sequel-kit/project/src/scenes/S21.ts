import { raiderCamp } from '../world3';
import { character } from '../characters';
import { byFrame,exprAt,shake } from './common';
import { list,title } from './kit';
import { clamp,type SceneDefinition } from '../types';
const F0=2321,F1=2474;
// "Humans think. Humans plan. And humans never stop." Raider camp: Slade and Troy over a map of the school with a red X;
// on "never stop" the trucks blaze on and the gang roars.
const camera=byFrame(F0,F1,[
 {f:2321,position:[.2,1.7,2.6],target:[0,1.4,-1.2],fov:40,blur:1.3},
 {f:2350,position:[.2,1.68,2.3],target:[0,1.4,-1.2],fov:39,blur:1.4,ease:'lin'},
 {f:2358,position:[0,2.7,-.3],target:[0,1.0,-1.25],fov:38,blur:1.4,ease:'snap'},
 {f:2390,position:[0,2.62,-.4],target:[0,1.0,-1.25],fov:37,blur:1.4,ease:'lin'},
 {f:2398,position:[0,2.2,5.6],target:[0,1.4,-2.5],fov:46,blur:.8,ease:'snap'},
 {f:2473,position:[0,2.0,5.0],target:[0,1.4,-2.5],fov:45,blur:.9,ease:'lin'},
]);
export default {
 id:'S21',f0:F0,f1:F1,title:'Humans think, plan, never stop',words:'Humans think. Humans plan. And humans never stop.',review:[2321,2340,2362,2385,2400,2410,2440,2473],
 build(){const s=raiderCamp();
  const slade=character(s.root,'slade',-.6,0,-.25),troy=character(s.root,'troy',.75,0,-.3);
  const gang=[character(s.root,'rHelmet',-3.2,0,-1.6),character(s.root,'rSpikes',3.0,0,-1.4),character(s.root,'rBeanie',-1.8,0,-3.2),character(s.root,'rCap',2.0,0,-3.6)];
  return {root:s.root,palette:'lampnight',pose(f){
   s.trucks.forEach((t,i)=>t.power(f<2406+i*4?0:.12*clamp((f-2406-i*4)/3)));
   slade.pose(f,{expr:exprAt(f,[[2321,'stern'],[2356,'smile_closed'],[2396,'grin'],[2435,'laugh']]),turn:25,action:f>=2330&&f<2392?'reach':undefined});
   troy.pose(f,{expr:exprAt(f,[[2321,'smile_closed'],[2363,'grin'],[2435,'laugh']]),turn:-25,action:f>=2360&&f<2390?'reach':undefined});
   gang.forEach((g,i)=>g.pose(f,{expr:f>=2435?'laugh':f>=2400?'grin':'stern',turn:(i%2?-1:1)*25,wave:f>=2436&&i%2===0?.5+.5*Math.sin(f*.5+i):undefined}));},
   camera:u=>{const f=F0+u*(F1-1-F0);return shake(camera(u),f,2406,16,.04);},
   overlays:f=>list(title(f,2321,2356,'THEY THINK','#e8833a',330),title(f,2356,2393,'THEY PLAN','#e8833a',330),title(f,2396,2474,'THEY NEVER STOP','#c8423b',330))};
 }
} satisfies SceneDefinition;
