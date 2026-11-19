import { compound,floodPower } from '../world';
import { character } from '../characters';
import { place } from '../props';
import { truck,riceSack,waterBottle } from '../world3';
import { byFrame,exprAt,shake } from './common';
import { list,title,hold,bat } from './kit';
import { clamp,lerp,type SceneDefinition } from '../types';
const F0=1586,F1=1821;
// "But humans want everything you have. Your food, your water, your weapons, your camp."
// The nightmare raid inside the walls: men haul out rice, water, the bat; on "your camp" Slade stands on the generator, laughing.
const camera=byFrame(F0,F1,[
 {f:1586,position:[0,3.4,-.8],target:[0,1.2,-6],fov:52,blur:.7},
 {f:1680,position:[.6,3.2,-1.2],target:[0,1.2,-6],fov:51,blur:.7,ease:'lin'},
 {f:1692,position:[-3.0,1.5,-1.6],target:[-3.6,1.2,-4.6],fov:40,blur:1.5,ease:'snap'},
 {f:1715,position:[-3.1,1.5,-1.7],target:[-3.6,1.2,-4.6],fov:40,blur:1.5,ease:'lin'},
 {f:1722,position:[-.6,1.5,-2.2],target:[-.6,1.2,-5.2],fov:40,blur:1.5,ease:'snap'},
 {f:1742,position:[-.5,1.5,-2.3],target:[-.6,1.2,-5.2],fov:40,blur:1.5,ease:'lin'},
 {f:1749,position:[2.0,1.5,-2.4],target:[1.8,1.3,-5.6],fov:40,blur:1.5,ease:'snap'},
 {f:1786,position:[2.1,1.52,-2.5],target:[1.8,1.3,-5.6],fov:40,blur:1.5,ease:'lin'},
 {f:1794,position:[2.6,.7,-1.4],target:[4.2,2.2,-4.5],fov:44,blur:1.2,ease:'snap'},
 {f:1820,position:[2.5,.7,-1.2],target:[4.2,2.2,-4.5],fov:45,blur:1.2,ease:'lin'},
]);
export default {
 id:'S15',f0:F0,f1:F1,title:'Humans want everything',words:'But humans want everything you have. Your food, your water, your weapons, your camp.',review:[1586,1630,1670,1695,1725,1752,1796,1820],
 build(){const s=compound({sky:'night'});s.gate.leaf.position.x=4.2;
  const tr=place(s.root,truck('#5a3b2a'),-.4,0,3.5,Math.PI);
  const food=character(s.root,'rBeanie',-3.6,0,-4.6),water=character(s.root,'rCap',-.6,0,-5.2),weap=character(s.root,'rSpikes',1.8,0,-5.6),slade=character(s.root,'slade',4.2,1.26,-4.5);
  const extra=[character(s.root,'rHelmet',-6,0,-6),character(s.root,'rBeanieB',6.6,0,-7),character(s.root,'rHelmetB',-1.8,0,-8.6)];
  const sack=place(s.root,riceSack(),0,0,0),bottle=place(s.root,waterBottle(),0,0,0),b=place(s.root,bat(),0,0,0);sack.scale.setScalar(.7);
  return {root:s.root,palette:'flood',pose(f,local){floodPower([...s.floods,...s.floodsIn],.5);tr.power(1);const eye=camera(local).position;
   const run=(a:typeof food,x0:number,z0:number,start:number)=>{const t=clamp((f-start)/40);a.root.position.set(lerp(x0,x0*.4,t),a.root.position.y,lerp(z0,z0+3,t));return t>0&&t<1;};
   const fr=run(food,-3.6,-4.6,1700),wr=run(water,-.6,-5.2,1728),br=run(weap,1.8,-5.6,1755);
   food.pose(f,{expr:exprAt(f,[[1586,'grin'],[1690,'laugh']]),turn:fr?30:20,mode:fr?'run':'stand',hand:hold(food,sack,eye,f,[.42,.9,.12])});
   water.pose(f,{expr:exprAt(f,[[1586,'grin'],[1719,'laugh']]),turn:wr?25:-10,mode:wr?'run':'stand',hand:hold(water,bottle,eye,f,[.42,.95,.12])});
   weap.pose(f,{expr:exprAt(f,[[1586,'stern'],[1745,'grin']]),turn:br?20:-25,mode:br?'run':'stand',hand:hold(weap,b,eye,f,[.42,1.15,.12])});
   slade.pose(f,{expr:exprAt(f,[[1586,'stern'],[1792,'laugh']]),turn:-30,wave:f>=1796?.5+.5*Math.sin(f*.4):undefined});
   extra.forEach((e,i)=>e.pose(f,{expr:i%2?'grin':'laugh',turn:(i-1)*30,mode:'stroll'}));},
   camera:u=>{const f=F0+u*(F1-1-F0);return shake(camera(u),f,1792,10,.05);},
   overlays:f=>list(title(f,1600,1686,'HUMANS WANT IT ALL','#c8423b',330),title(f,1690,1717,'YOUR FOOD','#ffffff',330),title(f,1719,1745,'YOUR WATER','#ffffff',330),title(f,1745,1790,'YOUR WEAPONS','#ffffff',330),title(f,1792,1821,'YOUR CAMP','#c8423b',330))};
 }
} satisfies SceneDefinition;
