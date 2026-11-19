import { compound,floodPower } from '../world';
import { byFrame,exprAt,shake } from './common';
import { four,list,title } from './kit';
import { clamp,type SceneDefinition } from '../types';
const F0=655,F1=814;
// "…even a generator. For the first time, you feel safe."
// Brock yanks the cord, the generator coughs alive and the floodlights warm up; ease out to the four laughing at the campfire.
const cam=byFrame(F0,F1,[
 {f:655,position:[2.1,1.6,-.6],target:[3.5,1.1,-4.3],fov:46,blur:1.4},
 {f:690,position:[2.2,1.6,-.8],target:[3.5,1.1,-4.3],fov:45,blur:1.4,ease:'lin'},
 {f:740,position:[.6,1.75,-1.6],target:[.6,1.15,-7.4],fov:48,blur:1.3,ease:'io'},
 {f:813,position:[.6,1.65,-2.2],target:[.6,1.15,-7.4],fov:46,blur:1.4,ease:'lin'},
]);
export default {
 id:'S06',f0:F0,f1:F1,title:'Generator · feel safe',words:'even a generator. For the first time, you feel safe.',review:[655,664,672,700,740,770,813],
 build(){const s=compound({sky:'dusk'});s.gate.leaf.position.x=0;
  const g=four(s.root,{brock:[2.75,0,-4.1],jack:[-.15,0,-6.5],milo:[1.35,0,-6.55],tina:[.15,0,-8.2]});
  const at=(a:typeof g.jack,x:number,z:number)=>a.root.position.set(x,0,z);
  return {root:s.root,palette:'golden',pose(f,local){const p=clamp((f-666)/6);floodPower([...s.floods,...s.floodsIn],.55*p+(f>=666&&f<672&&f%2?-.3:0));
   const inst=this as unknown as {palette:string};inst.palette=f<700?'golden':'dusk';
   if(f>=700)at(g.brock,1.15,-8.3);
   g.brock.pose(f,{expr:exprAt(f,[[655,'stern'],[664,'pained'],[672,'grin'],[700,'laugh'],[760,'smile']]),turn:f<700?-40:20,tilt:f>=660&&f<666?-.18:0,action:f>=660&&f<668?'reach':undefined});
   g.jack.pose(f,{expr:exprAt(f,[[655,'smile'],[712,'laugh'],[748,'relief'],[769,'smile_closed']]),turn:30});
   g.milo.pose(f,{expr:exprAt(f,[[655,'grin'],[706,'laugh'],[760,'grin']]),turn:-30,wave:f>=716&&f<736?.5+.5*Math.sin(f*.6):undefined});
   g.tina.pose(f,{expr:exprAt(f,[[655,'smile'],[720,'laugh'],[766,'relief']]),turn:8});},
   camera:(u:number)=>{const c=cam(u),f=F0+u*(F1-1-F0);return shake(c,f,664,10,.04);},
   overlays:f=>list(title(f,664,700,'POWER ON!','#e8b93c',330))};
 }
} satisfies SceneDefinition;
